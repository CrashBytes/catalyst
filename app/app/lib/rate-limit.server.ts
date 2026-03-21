import { queryOne, execute } from "./db.server";

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: string;
}

/**
 * Simple rate limiter using D1.
 * Uses a sliding window approach with 1-minute buckets.
 */
export async function checkRateLimit(
  db: D1Database,
  key: string,
  maxRequests: number = 60,
  windowMinutes: number = 1
): Promise<RateLimitResult> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMinutes * 60 * 1000);
  const resetAt = new Date(now.getTime() + windowMinutes * 60 * 1000);

  // Count requests in the current window
  const result = await queryOne<{ count: number }>(
    db,
    "SELECT COUNT(*) as count FROM rate_limits WHERE key = ? AND created_at > ?",
    [key, windowStart.toISOString()]
  );

  const count = result?.count || 0;

  if (count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: resetAt.toISOString() };
  }

  // Record this request
  await execute(
    db,
    "INSERT INTO rate_limits (key, created_at) VALUES (?, ?)",
    [key, now.toISOString()]
  );

  // Clean up old entries periodically (1 in 100 chance)
  if (Math.random() < 0.01) {
    await execute(
      db,
      "DELETE FROM rate_limits WHERE created_at < ?",
      [windowStart.toISOString()]
    );
  }

  return {
    allowed: true,
    remaining: maxRequests - count - 1,
    resetAt: resetAt.toISOString(),
  };
}
