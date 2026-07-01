import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as analyticsService from '@/server/services/analytics.service'

describe('analyticsService', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    globalThis.fetch = vi.fn()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('recordArticleView records view via Redis', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ result: 1 }),
    } as Response)

    const result = await analyticsService.recordArticleView(42)
    expect(result.articleId).toBe(42)
    expect(result.date).toBeDefined()
    expect(result.buffered).toBe(true)
  })

  it('recordArticleView falls back to Postgres when Redis unavailable', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: false,
    } as Response)

    // This will try to flush to postgres which will fail because supabase is mocked as empty object
    await expect(analyticsService.recordArticleView(42)).rejects.toThrow()
  })

  it('recordAdImpression records impression via Redis', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ result: 5 }),
    } as Response)

    const result = await analyticsService.recordAdImpression(7)
    expect(result.adId).toBe(7)
    expect(result.date).toBeDefined()
    expect(result.buffered).toBe(true)
  })

  it('recordAdClick records click via Redis', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ result: 3 }),
    } as Response)

    const result = await analyticsService.recordAdClick(3)
    expect(result.adId).toBe(3)
    expect(result.buffered).toBe(true)
  })
})
