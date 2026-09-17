#!/usr/bin/env bash
set -euo pipefail
cd /opt/tengology/releases/20260917-signature-flowers/source
docker build --secret id=env_local,src=/opt/tengology/shared/build.env.local -t tengology:20260917-signature-flowers .
test "$(docker inspect tengology-app --format '{{.Config.Image}}')" = tengology:20260917-233628
umask 077
docker inspect tengology-app --format '{{range .Config.Env}}{{println .}}{{end}}' > /opt/tengology/shared/flowers-runtime.env
env_args=(--env-file /opt/tengology/shared/flowers-runtime.env --network tengology-net --mount type=bind,src=/opt/tengology/shared/image-cache,dst=/app/.next/cache/images)
docker run -d --name tengology-flowers-check "${env_args[@]}" tengology:20260917-signature-flowers
sleep 2
docker exec tengology-flowers-check node -e 'fetch("http://127.0.0.1:3000/shop?category=FELT").then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))'
docker stop tengology-flowers-check >/dev/null
docker rename tengology-app tengology-app-prev-flowers
rollback(){ docker stop tengology-app || true; docker rename tengology-app tengology-app-failed-flowers || true; docker rename tengology-app-prev-flowers tengology-app; docker start tengology-app; }
trap rollback ERR
docker stop tengology-app-prev-flowers >/dev/null
docker run -d --name tengology-app --restart unless-stopped -p 127.0.0.1:3000:3000 "${env_args[@]}" tengology:20260917-signature-flowers
sleep 2
curl -fsS -o /dev/null 'http://127.0.0.1:3000/shop?category=FELT'
trap - ERR
echo 'Flower collection presentation deployed.'
