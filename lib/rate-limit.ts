import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Lazily built so the Redis client is created once per server instance.
 * Returns null when Upstash env vars are absent so the contact form degrades
 * gracefully (allows the request) instead of hard-failing in a misconfigured env.
 */
let limiter: Ratelimit | null = null;

function getLimiter(): Ratelimit | null {
  if (limiter) return limiter;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  limiter = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(5, "10 m"),
    prefix: "netgauge:ratelimit:contact",
    analytics: false,
  });
  return limiter;
}

export async function checkContactRateLimit(identifier: string): Promise<{ success: boolean }> {
  const rl = getLimiter();
  if (!rl) return { success: true };

  const { success } = await rl.limit(identifier);
  return { success };
}
