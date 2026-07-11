import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  checkRateLimit,
  checkAuthRateLimit,
  getRateLimitKey,
  getRateLimitCount,
  getRateLimitTtl,
  resetRateLimit,
  normalizeEmailKey,
  __resetMemoryRateLimitStoreForTests,
} from '@/server/rate-limit'

describe('getRateLimitKey', () => {
  it('builds a key from x-forwarded-for header', () => {
    const headers = new Headers({ 'x-forwarded-for': '192.168.1.1' })
    const key = getRateLimitKey(headers, 'view')
    expect(key).toBe('ratelimit:view:192.168.1.1')
  })

  it('uses the first IP from x-forwarded-for list', () => {
    const headers = new Headers({ 'x-forwarded-for': '10.0.0.1, 192.168.1.1' })
    const key = getRateLimitKey(headers, 'api')
    expect(key).toBe('ratelimit:api:10.0.0.1')
  })

  it('falls back to x-real-ip when x-forwarded-for is missing', () => {
    const headers = new Headers({ 'x-real-ip': '10.0.0.5' })
    const key = getRateLimitKey(headers, 'test')
    expect(key).toBe('ratelimit:test:10.0.0.5')
  })

  it('falls back to "unknown" when no IP headers present', () => {
    const headers = new Headers()
    const key = getRateLimitKey(headers, 'test')
    expect(key).toBe('ratelimit:test:unknown')
  })
})

describe('normalizeEmailKey', () => {
  it('trims and lowercases email', () => {
    expect(normalizeEmailKey('  Admin@Example.COM ')).toBe('admin@example.com')
  })
})

describe('checkRateLimit', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    __resetMemoryRateLimitStoreForTests()
    globalThis.fetch = vi.fn()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    __resetMemoryRateLimitStoreForTests()
  })

  it('allows request when under the limit', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ result: 1 }),
    } as Response)

    const result = await checkRateLimit('test-key', 10, 600)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(9)
  })

  it('blocks request when over the limit', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ result: 11 }),
    } as Response)

    const result = await checkRateLimit('test-key', 10, 600)
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('sets expiry on first request', async () => {
    let callCount = 0
    vi.mocked(globalThis.fetch).mockImplementation(async (url: string | URL | Request) => {
      callCount++
      const urlStr = url.toString()
      if (urlStr.includes('INCR')) {
        return { ok: true, json: () => Promise.resolve({ result: 1 }) } as Response
      }
      if (urlStr.includes('EXPIRE')) {
        return { ok: true, json: () => Promise.resolve({ result: 1 }) } as Response
      }
      if (urlStr.includes('TTL')) {
        return { ok: true, json: () => Promise.resolve({ result: 600 }) } as Response
      }
      return { ok: true, json: () => Promise.resolve({ result: null }) } as Response
    })

    await checkRateLimit('first-key', 10, 600)
    // INCR + EXPIRE + TTL
    expect(callCount).toBe(3)
  })

  it('falls back to memory when Redis is unavailable', async () => {
    vi.mocked(globalThis.fetch).mockRejectedValue(new Error('Network error'))

    const result = await checkRateLimit('redis-down-key', 10, 600)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(9)
    expect(result.resetAfterSecs).toBe(600)
    expect(await getRateLimitCount('redis-down-key')).toBe(1)
  })

  it('falls back to memory when Redis returns non-ok response', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: false,
    } as Response)

    const result = await checkRateLimit('redis-nok-key', 10, 600)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(9)
    expect(await getRateLimitCount('redis-nok-key')).toBe(1)
  })

  it('enforces limit via memory fallback when Redis is down', async () => {
    vi.mocked(globalThis.fetch).mockRejectedValue(new Error('Network error'))

    const key = 'analytics:spam'
    for (let i = 0; i < 3; i++) {
      const r = await checkRateLimit(key, 3, 3600)
      expect(r.allowed).toBe(true)
    }
    const blocked = await checkRateLimit(key, 3, 3600)
    expect(blocked.allowed).toBe(false)
    expect(blocked.remaining).toBe(0)
    expect(blocked.resetAfterSecs).toBeGreaterThan(0)
  })
})

describe('checkAuthRateLimit (memory fallback)', () => {
  const prevUrl = process.env.UPSTASH_REDIS_REST_URL
  const prevToken = process.env.UPSTASH_REDIS_REST_TOKEN

  beforeEach(() => {
    __resetMemoryRateLimitStoreForTests()
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN
  })

  afterEach(() => {
    __resetMemoryRateLimitStoreForTests()
    if (prevUrl !== undefined) process.env.UPSTASH_REDIS_REST_URL = prevUrl
    else delete process.env.UPSTASH_REDIS_REST_URL
    if (prevToken !== undefined) process.env.UPSTASH_REDIS_REST_TOKEN = prevToken
    else delete process.env.UPSTASH_REDIS_REST_TOKEN
  })

  it('allows under the limit and blocks after max', async () => {
    const key = 'auth:test:ip1'
    for (let i = 0; i < 3; i++) {
      const r = await checkAuthRateLimit(key, 3, 900)
      expect(r.allowed).toBe(true)
    }
    const blocked = await checkAuthRateLimit(key, 3, 900)
    expect(blocked.allowed).toBe(false)
    expect(blocked.remaining).toBe(0)
    expect(blocked.resetAfterSecs).toBeGreaterThan(0)
  })

  it('tracks count and resets on success path', async () => {
    const key = 'auth:test:fail'
    await checkAuthRateLimit(key, 5, 900)
    await checkAuthRateLimit(key, 5, 900)
    expect(await getRateLimitCount(key)).toBe(2)
    expect(await getRateLimitTtl(key)).toBeGreaterThan(0)

    await resetRateLimit(key)
    expect(await getRateLimitCount(key)).toBe(0)
    expect(await getRateLimitTtl(key)).toBe(0)
  })
})
