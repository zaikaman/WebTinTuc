/**
 * Redis-based sliding window rate limiter.
 *
 * Uses INCR + EXPIRE pattern:
 * - First call for a key: SET key=1, EXPIRE windowSecs
 * - Subsequent calls: INCR key (TTL preserved from first call)
 * - If count > maxCount → rate limited
 */

type RedisResult = { result: string | number | null }

async function redisCommand(command: (string | number)[]) {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) return null

  const res = await fetch(`${url}/${command.map(encodeURIComponent).join('/')}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store'
  })

  if (!res.ok) return null
  const json = (await res.json()) as RedisResult
  return json.result
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAfterSecs?: number
}

/**
 * Check if a request is within the rate limit.
 *
 * @param key     - Unique key (e.g. "ratelimit:view:127.0.0.1:42")
 * @param maxCount - Max requests allowed in the window (default: 1)
 * @param windowSecs - Sliding window duration in seconds (default: 600 = 10 min)
 */
export async function checkRateLimit(
  key: string,
  maxCount = 1,
  windowSecs = 600
): Promise<RateLimitResult> {
  try {
    // Increment the counter
    const countResult = await redisCommand(['INCR', key])
    const count = Number(countResult ?? 0)

    // Set expiry only on first increment (count === 1)
    if (count === 1) {
      await redisCommand(['EXPIRE', key, windowSecs])
    }

    const remaining = Math.max(0, maxCount - count)
    return {
      allowed: count <= maxCount,
      remaining
    }
  } catch {
    // If Redis is unavailable, fail open (allow the request) to avoid blocking legitimate traffic
    return { allowed: true, remaining: maxCount }
  }
}

/**
 * Build a rate-limit key from request metadata.
 * Extracts real IP from common proxy headers.
 */
export function getRateLimitKey(headers: Headers, namespace: string): string {
  const ip =
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headers.get('x-real-ip') ??
    'unknown'

  return `ratelimit:${namespace}:${ip}`
}
