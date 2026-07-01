import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { checkRateLimit, getRateLimitKey } from '@/server/rate-limit'

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

describe('checkRateLimit', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    globalThis.fetch = vi.fn()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
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
      return { ok: true, json: () => Promise.resolve({ result: null }) } as Response
    })

    await checkRateLimit('first-key', 10, 600)
    // INCR call + EXPIRE call
    expect(callCount).toBe(2)
  })

  it('fails open when Redis is unavailable', async () => {
    vi.mocked(globalThis.fetch).mockRejectedValue(new Error('Network error'))

    const result = await checkRateLimit('test-key', 10, 600)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(10)
  })

  it('fails open when Redis returns non-ok response', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: false,
    } as Response)

    const result = await checkRateLimit('test-key', 10, 600)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(10)
  })
})
