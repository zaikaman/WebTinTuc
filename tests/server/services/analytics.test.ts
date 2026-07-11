import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { supabaseAdmin } from '@/lib/supabase/admin'
import * as analyticsService from '@/server/services/analytics.service'

vi.mock('@/server/repositories/article.repository', () => ({
  incrementArticleViews: vi.fn().mockResolvedValue(undefined),
}))

describe('analyticsService', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    globalThis.fetch = vi.fn()
    vi.mocked(supabaseAdmin).rpc = vi.fn().mockResolvedValue({ data: null, error: null })
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.clearAllMocks()
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
    // No Redis env → redis() returns null → Postgres path
    const prevUrl = process.env.UPSTASH_REDIS_REST_URL
    const prevToken = process.env.UPSTASH_REDIS_REST_TOKEN
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN

    const result = await analyticsService.recordArticleView(42)
    expect(result.buffered).toBe(false)
    expect(supabaseAdmin.rpc).toHaveBeenCalledWith('increment_article_stats_daily', {
      p_article_id: 42,
      p_date: expect.any(String),
      p_views: 1,
    })

    process.env.UPSTASH_REDIS_REST_URL = prevUrl
    process.env.UPSTASH_REDIS_REST_TOKEN = prevToken
  })

  it('recordArticleView throws when Redis request fails', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: false,
    } as Response)

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

  it('recordPageView records page view via Redis', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ result: 2 }),
    } as Response)

    const result = await analyticsService.recordPageView()
    expect(result.date).toBeDefined()
    expect(result.buffered).toBe(true)
  })

  it('flushArticleViewsToPostgres uses atomic RPC', async () => {
    await analyticsService.flushArticleViewsToPostgres(9, '2026-07-11', 4)
    expect(supabaseAdmin.rpc).toHaveBeenCalledWith('increment_article_stats_daily', {
      p_article_id: 9,
      p_date: '2026-07-11',
      p_views: 4,
    })
    const { incrementArticleViews } = await import('@/server/repositories/article.repository')
    expect(incrementArticleViews).toHaveBeenCalledWith(9, 4)
  })

  it('flushAdStatsToPostgres uses atomic RPC', async () => {
    await analyticsService.flushAdStatsToPostgres(3, '2026-07-11', 10, 2)
    expect(supabaseAdmin.rpc).toHaveBeenCalledWith('increment_ad_stats_daily', {
      p_ad_id: 3,
      p_date: '2026-07-11',
      p_impressions: 10,
      p_clicks: 2,
    })
  })

  it('flushPageViewsToPostgres uses atomic additive RPC', async () => {
    await analyticsService.flushPageViewsToPostgres('2026-07-11', 100)
    expect(supabaseAdmin.rpc).toHaveBeenCalledWith('increment_page_stats_daily', {
      p_date: '2026-07-11',
      p_page_views: 100,
    })
  })
})
