#!/usr/bin/env bash
set -euo pipefail
cd /opt/tengology/releases/20260917-crysprout-correction/source
docker build --secret id=env_local,src=/opt/tengology/shared/build.env.local -t tengology:20260917-crysprout-correction .
test "$(docker inspect tengology-app --format '{{.Config.Image}}')" = tengology:20260917-142036
umask 077
docker inspect tengology-app --format '{{range .Config.Env}}{{println .}}{{end}}' > /opt/tengology/shared/crystals-label-runtime.env
docker run -d --name tengology-crysprout-check --network tengology-net --env-file /opt/tengology/shared/crystals-label-runtime.env tengology:20260917-crysprout-correction
healthy=0
for i in $(seq 1 30); do
  if docker exec tengology-crysprout-check node -e 'fetch("http://127.0.0.1:3000/shop?category=GEMSTONE").then(async r=>{if(!r.ok||!(await r.text()).includes(">Crysprout</a>"))process.exit(1)}).catch(()=>process.exit(1))'; then healthy=1; break; fi
  sleep 2
done
test "$healthy" = 1
docker stop tengology-crysprout-check
docker rename tengology-app tengology-app-prev-crysprout-correction
docker stop tengology-app-prev-crysprout-correction
rollback() {
  docker stop tengology-app || true
  docker rename tengology-app tengology-app-failed-crysprout-correction || true
  docker rename tengology-app-prev-crysprout-correction tengology-app
  docker start tengology-app
}
trap rollback ERR
docker run -d --name tengology-app --restart unless-stopped --network tengology-net -p 127.0.0.1:3000:3000 --env-file /opt/tengology/shared/crystals-label-runtime.env tengology:20260917-crysprout-correction
healthy=0
for i in $(seq 1 30); do
  if docker exec tengology-app node -e 'fetch("http://127.0.0.1:3000/shop?category=GEMSTONE").then(async r=>{if(!r.ok||!(await r.text()).includes(">Crysprout</a>"))process.exit(1)}).catch(()=>process.exit(1))'; then healthy=1; break; fi
  sleep 2
done
test "$healthy" = 1
trap - ERR
echo 'Crysprout label deployed; previous app retained for rollback.'
