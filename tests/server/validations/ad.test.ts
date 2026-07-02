import { describe, it, expect } from 'vitest'
import {
  adListQuerySchema,
  createAdSchema,
  updateAdSchema,
  adEventSchema,
} from '@/server/validations/ad.schema'

describe('adListQuerySchema', () => {
  it('uses default values', () => {
    const result = adListQuerySchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
    expect(result.sortBy).toBe('created_at')
  })

  it('parses optional filters', () => {
    const result = adListQuerySchema.parse({ position: 'sidebar', status: 'active' })
    expect(result.position).toBe('sidebar')
    expect(result.status).toBe('active')
  })
})

describe('createAdSchema', () => {
  it('requires name (min 2) and position', () => {
    expect(() => createAdSchema.parse({ name: 'A' })).toThrow()
    expect(() => createAdSchema.parse({ name: 'Valid Ad' })).toThrow() // missing position
  })

  it('uses defaults', () => {
    const result = createAdSchema.parse({ name: 'Banner Ad', position: 'sidebar' })
    expect(result.type).toBe('image')
    expect(result.priority).toBe(0)
    expect(result.status).toBe('inactive')
  })

  it('accepts all optional fields', () => {
    const result = createAdSchema.parse({
      name: 'Full Ad',
      type: 'html',
      position: 'header',
      html_code: '<div>ad</div>',
      target_url: 'https://example.com',
      priority: '5',
      status: 'active',
    })
    expect(result.type).toBe('html')
    expect(result.html_code).toBe('<div>ad</div>')
    expect(result.target_url).toBe('https://example.com')
    expect(result.priority).toBe(5)
    expect(result.status).toBe('active')
  })

  it('rejects invalid type', () => {
    expect(() => createAdSchema.parse({ name: 'Test', position: 'x', type: 'pdf' })).toThrow()
  })
})

describe('updateAdSchema', () => {
  it('allows partial updates', () => {
    const result = updateAdSchema.parse({ name: 'Updated' })
    expect(result.name).toBe('Updated')
  })
})

describe('adEventSchema', () => {
  it('parses a valid ad ID', () => {
    const result = adEventSchema.parse({ adId: '5' })
    expect(result.adId).toBe(5)
  })

  it('rejects non-positive ad ID', () => {
    expect(() => adEventSchema.parse({ adId: '0' })).toThrow()
    expect(() => adEventSchema.parse({ adId: '-1' })).toThrow()
  })
})
