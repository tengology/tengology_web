# syntax=docker/dockerfile:1.7

# ─── deps ────────────────────────────────────────────
FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ─── build ───────────────────────────────────────────
FROM node:22-bookworm-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# The box has 2 cores and 3.8GB of RAM; cap the heap so the build swaps
# instead of getting OOM-killed halfway through.
ENV NODE_OPTIONS=--max-old-space-size=3072
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Prisma 7 generates the client into src/generated/prisma, which is gitignored.
RUN npx prisma generate
# .env.local arrives as a build secret: NEXT_PUBLIC_* values are inlined into
# the client bundle at build time, so they have to be present here — but they
# must not end up in an image layer.
RUN --mount=type=secret,id=env_local,target=/app/.env.local npm run build

# ─── runtime ─────────────────────────────────────────
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
USER node
EXPOSE 3000
CMD ["node", "server.js"]
