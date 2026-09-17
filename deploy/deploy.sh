#!/usr/bin/env bash
# Ship the working tree to the London box, build it there, and swap the
# running container over only once the new one answers.
#
#   ./deploy/deploy.sh              deploy the current working tree to tengology.com
#
# There is one container on the box, and it serves tengology.com and the
# tengology.130.94.78.227.sslip.io staging host alike. Building for another
# SITE_URL therefore replaces production with a build whose auth and Square
# redirects point elsewhere — only override it deliberately.
#
# Rollback is by rename: the previous container is parked, never removed.
set -euo pipefail

HOST=${HOST:-root@130.94.78.227}
KEY=${KEY:-$HOME/.ssh/tengology_uk}
SITE_URL=${SITE_URL:-https://tengology.com}
APP=tengology-app
# Caddy runs on the host (systemd, shared with sweetmanstrading), so the app is
# published on loopback. 3001 belongs to sweetmanstrading's API.
NET=tengology-net
PUBLISH="-p 127.0.0.1:3000:3000"
ROOT=/opt/tengology
REL=$(date +%Y%m%d-%H%M%S)
IMAGE="tengology:$REL"
RUN_ENV="--env-file $ROOT/shared/prod.env -e NODE_ENV=production -e PORT=3000 -e HOSTNAME=0.0.0.0 --mount type=bind,src=$ROOT/shared/image-cache,dst=/app/.next/cache/images"

SSH=(ssh -i "$KEY" -o IdentitiesOnly=yes -o BatchMode=yes "$HOST")
say() { printf '\n\033[1m▸ %s\033[0m\n' "$*"; }

cd "$(dirname "$0")/.."
[[ -f .env.local ]] || { echo "no .env.local — cannot build"; exit 1; }

say "1/6  ship source → $HOST:$ROOT/releases/$REL"
"${SSH[@]}" "mkdir -p $ROOT/releases/$REL/source $ROOT/shared/image-cache && chown 1000:1000 $ROOT/shared/image-cache"
# NOTE: macOS ships rsync 2.6.9, which exits 0 while transferring nothing on
# unknown flags. tar over ssh is the reliable path here.
# --no-xattrs: macOS tar otherwise emits an extended-attribute header per
# file that GNU tar on the server warns about, drowning the log in noise.
tar --no-xattrs -cf - --exclude='./.git' --exclude='./node_modules' --exclude='./.next' \
         --exclude='*.mov' --exclude='./tsconfig.tsbuildinfo' \
         --exclude='./.env' --exclude='./.env.local' --exclude='./.claude' . \
  2>/dev/null | "${SSH[@]}" "tar xf - -C $ROOT/releases/$REL/source"

say "2/6  build env (NEXT_PUBLIC_* is inlined at build time → SITE_URL=$SITE_URL)"
sed -E "s#^(AUTH_URL|NEXTAUTH_URL|NEXT_PUBLIC_SITE_URL)=.*#\1=\"$SITE_URL\"#" .env.local \
  | "${SSH[@]}" "umask 077 && cat > $ROOT/shared/build.env.local"
# docker --env-file keeps quotes and swallows inline comments; normalise first.
"${SSH[@]}" "python3 - <<'PY'
import re, os
out = []
for line in open('$ROOT/shared/build.env.local'):
    s = line.strip()
    if not s or s.startswith('#') or '=' not in s:
        continue
    k, v = (x.strip() for x in s.split('=', 1))
    if v[:1] in ('\"', \"'\"):
        end = v.find(v[0], 1)
        v = v[1:end] if end != -1 else v[1:]
    else:
        m = re.search(r'\s+#', v)
        v = (v[:m.start()] if m else v).strip()
    out.append(k + '=' + v)
open('$ROOT/shared/prod.env', 'w').write('\n'.join(out) + '\n')
os.chmod('$ROOT/shared/prod.env', 0o600)
print('  %d vars' % len(out))
PY"

say "3/6  build $IMAGE"
"${SSH[@]}" "cd $ROOT/releases/$REL/source && DOCKER_BUILDKIT=1 docker build \
  --secret id=env_local,src=$ROOT/shared/build.env.local -t $IMAGE . 2>&1 \
  | grep -E '^#[0-9]+ (DONE|ERROR)|error|Error' | tail -20
docker image inspect $IMAGE >/dev/null 2>&1 || { echo '  BUILD FAILED — no image produced'; exit 1; }"

say "4/6  start replacement container and health-check it"
"${SSH[@]}" "docker rm -f $APP-new >/dev/null 2>&1 || true
docker run -d --name $APP-new --network $NET $RUN_ENV $IMAGE >/dev/null
for i in \$(seq 1 30); do
  code=\$(docker run --rm --network $NET curlimages/curl:latest -s -o /dev/null \
          -w '%{http_code}' --max-time 20 http://$APP-new:3000/ 2>/dev/null || echo 000)
  [ \"\$code\" = 200 ] && { echo \"  healthy after \${i}s (HTTP \$code)\"; exit 0; }
  sleep 1
done
echo '  NEW CONTAINER NEVER became healthy — logs:'
docker logs $APP-new 2>&1 | tail -20
docker rm -f $APP-new >/dev/null
exit 1"

say "5/6  swap (old container parked, not deleted)"
# A host port can't be handed from one container to another, so the checked
# container is replaced by a fresh one from the same image that binds it once
# the old one has let go. A few seconds of 502 on this path.
"${SSH[@]}" "docker rename $APP $APP-prev-$REL 2>/dev/null || true
docker stop $APP-prev-$REL >/dev/null 2>&1 || true
docker rm -f $APP-new >/dev/null
docker run -d --name $APP --restart unless-stopped --network $NET $PUBLISH $RUN_ENV $IMAGE >/dev/null
for i in \$(seq 1 30); do
  code=\$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 http://127.0.0.1:3000/ 2>/dev/null || true)
  [ \"\$code\" = 200 ] && { echo \"  swapped, answering on loopback after \${i}s\"; exit 0; }
  sleep 1
done
echo '  swapped container is not answering on loopback — verification will roll back'"

say "6/6  verify through Caddy from the outside"
sleep 3
# Pin the check to the origin. Verifying whatever DNS happens to return would
# test a stale cache or another box instead of the one we just deployed to.
ORIGIN_IP=${HOST##*@}
VHOST=${SITE_URL#*://}; VHOST=${VHOST%%/*}
fail=0
for p in / /shop; do
  code=$(curl -sS -o /dev/null -m 45 \
           --resolve "$VHOST:443:$ORIGIN_IP" --resolve "$VHOST:80:$ORIGIN_IP" \
           -w '%{http_code}' "$SITE_URL$p" || echo 000)
  printf '  %-8s %s\n' "$p" "$code"
  [[ "$code" == 200 ]] || fail=1
done
if [[ $fail -ne 0 ]]; then
  echo
  echo "VERIFICATION FAILED — rolling back to $APP-prev-$REL"
  "${SSH[@]}" "if docker inspect $APP-prev-$REL >/dev/null 2>&1; then
  docker rename $APP $APP-failed-$REL && docker stop $APP-failed-$REL >/dev/null
  docker rename $APP-prev-$REL $APP && docker start $APP >/dev/null
  echo '  rolled back'
else
  echo '  no previous container to roll back to (first deploy on this box) — left running for inspection'
fi"
  echo "inspect with: ssh $HOST docker logs $APP-failed-$REL  (or $APP on a first deploy)"
  exit 1
fi

say "done — $IMAGE live at $SITE_URL"

# Housekeeping. Each deploy leaves a ~1.5GB image, a parked container and a
# couple of GB of npm build cache. Only tengology's own artefacts are touched —
# the build cache is regenerable, so it is capped rather than emptied.
"${SSH[@]}" "
echo '  releases kept:'
ls -1t $ROOT/releases | tail -n +4 | xargs -r -I{} rm -rf $ROOT/releases/{}
ls -1t $ROOT/releases | sed 's/^/    /'

echo '  parked containers kept (rollback targets):'
docker ps -a --filter name=${APP}-prev- --format '{{.Names}}' | sort -r | tail -n +2 \
  | xargs -r docker rm >/dev/null 2>&1 || true
docker ps -a --filter name=${APP}-prev- --format '    {{.Names}}'

echo '  images kept:'
docker images tengology --format '{{.Tag}}' | sort -r | tail -n +4 \
  | xargs -r -I{} docker rmi tengology:{} >/dev/null 2>&1 || true
docker images tengology --format '    {{.Tag}}  {{.Size}}'

docker builder prune -f --keep-storage 4GB >/dev/null 2>&1 || true
echo \"  disk: \$(df -h / | awk 'NR==2{print \$4}') free\"
"

echo
echo "rollback:  ssh $HOST 'docker rename $APP ${APP}-bad-$REL && docker stop ${APP}-bad-$REL && docker rename ${APP}-prev-$REL $APP && docker start $APP'"
