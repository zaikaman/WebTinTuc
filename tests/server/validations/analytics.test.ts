import { describe, it, expect } from 'vitest'
import { articleViewBodySchema, adImpressionBodySchema, adClickBodySchema } from '@/server/validations/analytics.schema'

describe('articleViewBodySchema', () => {
  it('parses valid articleId', () => {
    const result = articleViewBodySchema.parse({ articleId: '42' })
    expect(result.articleId).toBe(42)
  })

  it('rejects missing articleId', () => {
    expect(() => articleViewBodySchema.parse({})).toThrow()
  })

  it('rejects non-positive articleId', () => {
    expect(() => articleViewBodySchema.parse({ articleId: '-1' })).toThrow()
  })
})

describe('adImpressionBodySchema', () => {
  it('parses valid adId', () => {
    const result = adImpressionBodySchema.parse({ adId: '7' })
    expect(result.adId).toBe(7)
  })
})

describe('adClickBodySchema', () => {
  it('parses valid adId', () => {
    const result = adClickBodySchema.parse({ adId: '3' })
    expect(result.adId).toBe(3)
  })
})
