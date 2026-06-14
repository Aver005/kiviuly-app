/**
 * Tiny in-memory fixed-window rate limiter.
 * Good enough to blunt abuse on a single-instance landing page; pair it with
 * the proof-of-work for the contact endpoint. Not a distributed limiter.
 */
interface Window {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Window>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }

  existing.count += 1;
  if (existing.count > limit) {
    return { allowed: false, retryAfter: Math.ceil((existing.resetAt - now) / 1000) };
  }
  return { allowed: true, retryAfter: 0 };
}

// Opportunistically evict expired windows so the map can't grow unbounded.
setInterval(() => {
  const now = Date.now();
  for (const [key, win] of buckets) {
    if (now >= win.resetAt) buckets.delete(key);
  }
}, 60_000).unref?.();
