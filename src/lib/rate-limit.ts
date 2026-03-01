const cache = new Map<string, number[]>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of cache) {
    const recent = timestamps.filter((t) => now - t < 60_000);
    if (recent.length === 0) {
      cache.delete(key);
    } else {
      cache.set(key, recent);
    }
  }
}, 300_000);

/**
 * Simple in-memory rate limiter.
 * Returns true if the request is allowed, false if rate-limited.
 */
export function rateLimit(
  key: string,
  limit: number = 10,
  windowMs: number = 60_000
): boolean {
  const now = Date.now();
  const timestamps = cache.get(key) || [];
  const recent = timestamps.filter((t) => now - t < windowMs);

  if (recent.length >= limit) {
    return false;
  }

  recent.push(now);
  cache.set(key, recent);
  return true;
}
