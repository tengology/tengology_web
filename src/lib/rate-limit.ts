// In-memory sliding-window rate limiter. Suitable for a single Node process
// (dev or a single self-hosted instance). On serverless or multi-instance
// deployments this state is per-instance — swap for a durable store (Redis,
// Upstash) before relying on it in production.

const buckets = new Map<string, number[]>();

// Evict stale buckets once the map grows past this many keys, so attacker-
// controlled key material (e.g. spoofed X-Forwarded-For values) cannot grow
// memory without bound.
const SWEEP_THRESHOLD = 10_000;
let longestWindowMs = 0;

function sweep(now: number) {
  for (const [key, hits] of buckets) {
    const newest = hits[hits.length - 1] ?? 0;
    if (now - newest >= longestWindowMs) {
      buckets.delete(key);
    }
  }
}

/**
 * Returns true if the call is allowed, false if the key has exceeded
 * `limit` calls within the trailing `windowMs` window.
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  if (windowMs > longestWindowMs) longestWindowMs = windowMs;
  if (buckets.size > SWEEP_THRESHOLD) sweep(now);
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  return true;
}
