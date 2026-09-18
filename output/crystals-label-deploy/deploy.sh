#!/usr/bin/env bash
set -euo pipefail
cd /opt/tengology/releases/20260917-crystals-label/source
docker build --secret id=env_local,src=/opt/tengology/shared/build.env.local -t tengology:20260917-crystals-label .
test "$(docker inspect tengology-app --format '{{.Config.Image}}')" = tengology:20260915-213930
umask 077
docker inspect tengology-app --format '{{range .Config.Env}}{{println .}}{{end}}' > /opt/tengology/shared/crystals-label-runtime.env
docker run -d --name tengology-crystals-check --network tengology-net --env-file /opt/tengology/shared/crystals-label-runtime.env tengology:20260917-crystals-label
healthy=0
for i in $(seq 1 30); do
  if docker exec tengology-crystals-check node -e 'fetch("http://127.0.0.1:3000/shop?category=GEMSTONE").then(async r=>{if(!r.ok||!(await r.text()).includes(">Crystals</a>"))process.exit(1)}).catch(()=>process.exit(1))'; then healthy=1; break; fi
  sleep 2
done
test "$healthy" = 1
docker stop tengology-crystals-check
docker rename tengology-app tengology-app-prev-crystals-label
docker stop tengology-app-prev-crystals-label
rollback() {
  docker stop tengology-app || true
  docker rename tengology-app tengology-app-failed-crystals-label || true
  docker rename tengology-app-prev-crystals-label tengology-app
  docker start tengology-app
}
trap rollback ERR
docker run -d --name tengology-app --restart unless-stopped --network tengology-net -p 127.0.0.1:3000:3000 --env-file /opt/tengology/shared/crystals-label-runtime.env tengology:20260917-crystals-label
healthy=0
for i in $(seq 1 30); do
  if docker exec tengology-app node -e 'fetch("http://127.0.0.1:3000/shop?category=GEMSTONE").then(async r=>{if(!r.ok||!(await r.text()).includes(">Crystals</a>"))process.exit(1)}).catch(()=>process.exit(1))'; then healthy=1; break; fi
  sleep 2
done
test "$healthy" = 1
trap - ERR
echo 'Crystals label deployed; previous app retained for rollback.'
