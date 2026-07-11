/**
 * SEO redirect cache coordination.
 *
 * Middleware keeps an in-memory Map of path → redirect (or null) per process/
 * edge isolate. That cache is **not shared** across serverless instances.
 *
 * When Upstash Redis is configured, mutations bump a shared generation counter
 * (`redirects:cache:version`). Each instance polls that counter periodically and
 * clears its local Map when the generation changes, so updates propagate in
 * seconds rather than waiting for full TTL expiry.
 *
 * Without Redis, instances rely only on `REDIRECT_CACHE_TTL_MS` (default 60s).
 * That staleness window is intentional and acceptable for SEO redirects; admins
 * should expect up to one TTL of lag after create/update/delete when Redis is off.
 */

export const REDIRECT_CACHE_VERSION_KEY = 'redirects:cache:version'

/** Local entry TTL — safety net when Redis is absent or version check is delayed. */
export const REDIRECT_CACHE_TTL_MS = 60_000 // 60 seconds

/** How often each instance re-reads the shared generation from Redis. */
export const REDIRECT_VERSION_CHECK_MS = 10_000 // 10 seconds

/** Max local Map entries per process (evict oldest when exceeded). */
export const REDIRECT_CACHE_MAX_SIZE = 1000

type RedisResult = { result: string | number | null }

async function redisCommand(command: (string | number)[]): Promise<string | number | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) return null

  try {
    const res = await fetch(`${url}/${command.map(encodeURIComponent).join('/')}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })

    if (!res.ok) return null
    const json = (await res.json()) as RedisResult
    return json.result
  } catch {
    return null
  }
}

/**
 * Read the shared redirect-cache generation.
 * Returns null when Redis is not configured or unreachable (caller falls back to TTL).
 */
export async function getRedirectCacheVersion(): Promise<number | null> {
  const result = await redisCommand(['GET', REDIRECT_CACHE_VERSION_KEY])
  if (result === null || result === undefined) return null
  const n = typeof result === 'number' ? result : Number.parseInt(String(result), 10)
  return Number.isFinite(n) ? n : 0
}

/**
 * Bump the shared generation so all middleware isolates drop stale local entries
 * on their next version check. No-op when Redis is unavailable.
 */
export async function bumpRedirectCacheVersion(): Promise<void> {
  await redisCommand(['INCR', REDIRECT_CACHE_VERSION_KEY])
}
