import { describe, it, expect } from 'vitest'
import { proxyImageUrl } from '@/lib/image-proxy'

describe('proxyImageUrl', () => {
  it('returns empty string for nullish', () => {
    expect(proxyImageUrl(null)).toBe('')
    expect(proxyImageUrl(undefined)).toBe('')
    expect(proxyImageUrl('')).toBe('')
  })

  it('passes through relative and data URLs', () => {
    expect(proxyImageUrl('/placeholder.svg')).toBe('/placeholder.svg')
    expect(proxyImageUrl('data:image/png;base64,abc')).toBe('data:image/png;base64,abc')
  })

  it('passes through absolute URLs without wrapping in a proxy', () => {
    const r2 = 'https://cdn.example.r2.dev/articles/photo.jpg'
    const external = 'https://example.com/photo.jpg'
    expect(proxyImageUrl(r2)).toBe(r2)
    expect(proxyImageUrl(external)).toBe(external)
  })

  it('unwraps legacy /api/image-proxy?url= wrappers', () => {
    const original = 'https://images.unsplash.com/photo-1'
    const wrapped = `/api/image-proxy?url=${encodeURIComponent(original)}`
    expect(proxyImageUrl(wrapped)).toBe(original)
  })
})
