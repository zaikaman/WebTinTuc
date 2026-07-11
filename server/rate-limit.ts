/**
 * Redis-based sliding window rate limiter.
 *
 * Uses INCR + EXPIRE pattern:
 * - First call for a key: SET key=1, EXPIRE windowSecs
 * - Subsequent calls: INCR key (TTL preserved from first call)
 * - If count > maxCount → rate limited
 *
 * Auth-sensitive helpers (`checkAuthRateLimit`, etc.) fall back to an
 * in-process memory store when Redis is unavailable so login protection
 * does not silently fail open.
 */

type RedisResult = { result: string | number | null }

/** Per-process fallback when Upstash is missing/unreachable (not shared across instances). */
const memoryStore = new Map<string, { count: number; expiresAt: number }>()

const MEMORY_PRUNE_EVERY = 64
let memoryOps = 0

function pruneMemoryStore(now = Date.now()) {
  for (const [key, entry] of memoryStore) {
    if (entry.expiresAt <= now) memoryStore.delete(key)
  }
}

function touchMemoryPrune() {
  memoryOps += 1
  if (memoryOps >= MEMORY_PRUNE_EVERY) {
    memoryOps = 0
    pruneMemoryStore()
  }
}

function memoryGet(key: string): { count: number; ttlSecs: number } | null {
  const now = Date.now()
  const entry = memoryStore.get(key)
  if (!entry) return null
  if (entry.expiresAt <= now) {
    memoryStore.delete(key)
    return null
  }
  return {
    count: entry.count,
    ttlSecs: Math.max(1, Math.ceil((entry.expiresAt - now) / 1000)),
  }
}

function memoryIncr(key: string, windowSecs: number): { count: number; ttlSecs: number } {
  touchMemoryPrune()
  const now = Date.now()
  const existing = memoryGet(key)
  if (!existing) {
    memoryStore.set(key, { count: 1, expiresAt: now + windowSecs * 1000 })
    return { count: 1, ttlSecs: windowSecs }
  }
  const entry = memoryStore.get(key)!
  entry.count += 1
  return { count: entry.count, ttlSecs: existing.ttlSecs }
}

function memoryDel(key: string) {
  memoryStore.delete(key)
}

async function redisCommand(command: (string | number)[]) {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) return null

  const res = await fetch(`${url}/${command.map(encodeURIComponent).join('/')}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })

  if (!res.ok) return null
  const json = (await res.json()) as RedisResult
  return json.result
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  /** Seconds until the current window resets (best-effort). */
  resetAfterSecs?: number
}

/**
 * Check if a request is within the rate limit.
 *
 * Fail-open when Redis is unavailable (legacy behavior for analytics routes).
 * Prefer `checkAuthRateLimit` for login / abuse-sensitive endpoints.
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
    // null → Redis unavailable / not configured
    if (countResult === null) {
      return { allowed: true, remaining: maxCount }
    }

    const count = Number(countResult ?? 0)

    // Set expiry only on first increment (count === 1)
    if (count === 1) {
      await redisCommand(['EXPIRE', key, windowSecs])
    }

    const remaining = Math.max(0, maxCount - count)
    return {
      allowed: count <= maxCount,
      remaining,
    }
  } catch {
    // If Redis is unavailable, fail open (allow the request) to avoid blocking legitimate traffic
    return { allowed: true, remaining: maxCount }
  }
}

/**
 * Auth-sensitive rate limit: Redis when available, otherwise in-process memory.
 * Never fails open.
 */
export async function checkAuthRateLimit(
  key: string,
  maxCount: number,
  windowSecs: number
): Promise<RateLimitResult> {
  try {
    const countResult = await redisCommand(['INCR', key])
    if (countResult !== null) {
      const count = Number(countResult)
      if (count === 1) {
        await redisCommand(['EXPIRE', key, windowSecs])
      }
      const ttl = await redisCommand(['TTL', key])
      const result: RateLimitResult = {
        allowed: count <= maxCount,
        remaining: Math.max(0, maxCount - count),
      }
      if (ttl !== null && Number(ttl) > 0) {
        result.resetAfterSecs = Number(ttl)
      } else if (count === 1) {
        result.resetAfterSecs = windowSecs
      }
      return result
    }
  } catch {
    // fall through to memory
  }

  const { count, ttlSecs } = memoryIncr(key, windowSecs)
  return {
    allowed: count <= maxCount,
    remaining: Math.max(0, maxCount - count),
    resetAfterSecs: ttlSecs,
  }
}

/**
 * GET that returns:
 * - number when Redis answered (including 0 for missing key)
 * - undefined when Redis is unavailable / unconfigured
 */
async function redisGetCount(key: string): Promise<number | undefined> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return undefined

  try {
    const res = await fetch(`${url}/GET/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (!res.ok) return undefined
    const json = (await res.json()) as RedisResult
    if (json.result === null || json.result === undefined) return 0
    const n = Number(json.result)
    return Number.isFinite(n) ? n : 0
  } catch {
    return undefined
  }
}

/** Current counter value without incrementing (0 if missing/expired). */
export async function getRateLimitCount(key: string): Promise<number> {
  const redisCount = await redisGetCount(key)
  if (redisCount !== undefined) return redisCount
  return memoryGet(key)?.count ?? 0
}

/** TTL remaining in seconds; 0 if missing/expired. */
export async function getRateLimitTtl(key: string): Promise<number> {
  try {
    const url = process.env.UPSTASH_REDIS_REST_URL
    const token = process.env.UPSTASH_REDIS_REST_TOKEN
    if (url && token) {
      const res = await fetch(`${url}/TTL/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })
      if (res.ok) {
        const json = (await res.json()) as RedisResult
        const ttl = Number(json.result)
        // Redis: -2 missing, -1 no expiry
        if (Number.isFinite(ttl) && ttl > 0) return ttl
        if (ttl === -2 || ttl === -1) return 0
      }
    }
  } catch {
    // fall through
  }

  return memoryGet(key)?.ttlSecs ?? 0
}

/** Delete a rate-limit / lockout key (e.g. after successful login). */
export async function resetRateLimit(key: string): Promise<void> {
  memoryDel(key)
  try {
    await redisCommand(['DEL', key])
  } catch {
    // ignore
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

/** Normalize email for lockout keys (lowercase, trim). */
export function normalizeEmailKey(email: string): string {
  return email.trim().toLowerCase()
}

/** Test helper: clear in-memory store. */
export function __resetMemoryRateLimitStoreForTests() {
  memoryStore.clear()
  memoryOps = 0
}
