import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/server/services/analytics.service', () => ({
  recordArticleView: vi.fn(),
  recordAdImpression: vi.fn(),
  recordAdClick: vi.fn(),
}))

vi.mock('@/server/validations/analytics.schema', () => ({
  articleViewBodySchema: { parse: vi.fn((input) => input) },
  adImpressionBodySchema: { parse: vi.fn((input) => input) },
  adClickBodySchema: { parse: vi.fn((input) => input) },
}))

vi.mock('@/server/validations/ad.schema', () => ({
  adEventSchema: { parse: vi.fn((input) => input) },
}))

describe('analyticsActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('recordArticleViewAction records view', async () => {
    const { recordArticleView } = await import('@/server/services/analytics.service')
    vi.mocked(recordArticleView).mockResolvedValue({ articleId: 42, date: '2024-01-01', buffered: true })

    const { recordArticleViewAction } = await import('@/server/actions/analytics.action')
    const result = await recordArticleViewAction({ articleId: 42 })

    expect(result.success).toBe(true)
  })

  it('recordAdImpressionAction records impression', async () => {
    const { recordAdImpression } = await import('@/server/services/analytics.service')
    vi.mocked(recordAdImpression).mockResolvedValue({ adId: 7, date: '2024-01-01', buffered: true })

    const { recordAdImpressionAction } = await import('@/server/actions/analytics.action')
    const result = await recordAdImpressionAction({ adId: 7 })

    expect(result.success).toBe(true)
  })

  it('recordAdClickAction records click', async () => {
    const { recordAdClick } = await import('@/server/services/analytics.service')
    vi.mocked(recordAdClick).mockResolvedValue({ adId: 3, date: '2024-01-01', buffered: true })

    const { recordAdClickAction } = await import('@/server/actions/analytics.action')
    const result = await recordAdClickAction({ adId: 3 })

    expect(result.success).toBe(true)
  })

  it('returns error on failure', async () => {
    const { recordArticleView } = await import('@/server/services/analytics.service')
    vi.mocked(recordArticleView).mockRejectedValue(new Error('Redis error'))

    const { recordArticleViewAction } = await import('@/server/actions/analytics.action')
    const result = await recordArticleViewAction({ articleId: 42 })

    expect(result.success).toBe(false)
  })
})
