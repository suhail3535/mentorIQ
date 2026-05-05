/**
 * Tiny in-memory rate limiter for the public Iris endpoint.
 *
 * NOTE: in-memory means it resets on server restart and does NOT scale
 * across multiple instances. For a single Vercel function instance it's
 * good enough to prevent casual abuse / runaway OpenAI bills. For real
 * production, swap this for Upstash Redis or Vercel KV.
 */

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 10;          // per IP per window

export type RateLimitResult =
  | { ok: true; remaining: number; resetAt: number }
  | { ok: false; retryAfterSec: number; resetAt: number };

export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    const resetAt = now + WINDOW_MS;
    buckets.set(key, { count: 1, resetAt });
    return { ok: true, remaining: MAX_REQUESTS - 1, resetAt };
  }

  if (bucket.count >= MAX_REQUESTS) {
    return {
      ok: false,
      retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000),
      resetAt: bucket.resetAt,
    };
  }

  bucket.count += 1;
  return {
    ok: true,
    remaining: MAX_REQUESTS - bucket.count,
    resetAt: bucket.resetAt,
  };
}

export function getClientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}
