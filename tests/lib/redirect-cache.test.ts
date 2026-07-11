import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('redirect-cache', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.resetModules()
    process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io'
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token'
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('exports shorter TTL and version-check intervals for multi-instance ops', async () => {
    const mod = await import('@/lib/redirect-cache')
    expect(mod.REDIRECT_CACHE_TTL_MS).toBe(60_000)
    expect(mod.REDIRECT_VERSION_CHECK_MS).toBe(10_000)
    expect(mod.REDIRECT_CACHE_VERSION_KEY).toBe('redirects:cache:version')
  })

  it('getRedirectCacheVersion returns parsed generation from Redis', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ result: '7' }),
    }) as typeof fetch

    const { getRedirectCacheVersion } = await import('@/lib/redirect-cache')
    await expect(getRedirectCacheVersion()).resolves.toBe(7)
  })

  it('getRedirectCacheVersion returns null when Redis env is missing', async () => {
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN

    const { getRedirectCacheVersion } = await import('@/lib/redirect-cache')
    await expect(getRedirectCacheVersion()).resolves.toBeNull()
  })

  it('bumpRedirectCacheVersion sends INCR for the version key', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ result: 2 }),
    })
    globalThis.fetch = fetchMock as typeof fetch

    const { bumpRedirectCacheVersion, REDIRECT_CACHE_VERSION_KEY } = await import(
      '@/lib/redirect-cache'
    )
    await bumpRedirectCacheVersion()

    expect(fetchMock).toHaveBeenCalled()
    const url = String(fetchMock.mock.calls[0][0])
    expect(url).toContain('INCR')
    expect(url).toContain(encodeURIComponent(REDIRECT_CACHE_VERSION_KEY))
  })
})
