#!/usr/bin/env bash
set -euo pipefail
# Run on the VPS. Preserve the exact running image and runtime environment.
image=$(docker inspect tengology-app --format '{{.Config.Image}}')
test "$image" = tengology:20260917-233628
root=/opt/tengology/shared
mkdir -p "$root/image-cache"
docker cp tengology-app:/app/.next/cache/images/. "$root/image-cache/"
chown -R 1000:1000 "$root/image-cache"
umask 077
docker inspect tengology-app --format '{{range .Config.Env}}{{println .}}{{end}}' > "$root/image-cache-runtime.env"
docker rename tengology-app tengology-app-prev-image-cache
rollback() {
  docker stop tengology-app >/dev/null 2>&1 || true
  docker rename tengology-app tengology-app-failed-image-cache 2>/dev/null || true
  docker rename tengology-app-prev-image-cache tengology-app
  docker start tengology-app
}
trap rollback ERR
docker stop tengology-app-prev-image-cache >/dev/null
docker run -d --name tengology-app --restart unless-stopped --network tengology-net -p 127.0.0.1:3000:3000 --env-file "$root/image-cache-runtime.env" --mount "type=bind,src=$root/image-cache,dst=/app/.next/cache/images" "$image"
healthy=0
for i in $(seq 1 30); do
  if curl -fsS -o /dev/null http://127.0.0.1:3000/; then healthy=1; break; fi
  sleep 1
done
test "$healthy" = 1
trap - ERR
echo 'Persistent image cache enabled; previous container retained.'
