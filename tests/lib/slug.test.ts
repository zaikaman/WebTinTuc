import { describe, it, expect } from 'vitest'
import { generateSlug } from '@/lib/format/slug'

describe('generateSlug', () => {
  it('generates a slug from Vietnamese text', () => {
    const slug = generateSlug('Hà Nội ghi nhận mức nhiệt cao nhất')
    expect(slug).toContain('ha-noi-ghi-nhan-muc-nhiet-cao-nhat')
  })

  it('generates a slug from English text', () => {
    const slug = generateSlug('Hello World Test Article')
    expect(slug).toContain('hello-world-test-article')
  })

  it('includes a timestamp and random suffix', () => {
    const slug = generateSlug('Test')
    const parts = slug.split('-')
    expect(parts.length).toBeGreaterThanOrEqual(3) // base-timestamp-random
  })

  it('produces unique slugs for the same title', () => {
    const slug1 = generateSlug('Same Title')
    const slug2 = generateSlug('Same Title')
    expect(slug1).not.toBe(slug2)
  })

  it('handles special characters', () => {
    const slug = generateSlug('Công nghệ & Game! @2024')
    expect(slug).not.toContain('&')
    expect(slug).not.toContain('!')
    expect(slug).not.toContain('@')
    expect(slug).toContain('cong-nghe')
  })

  it('handles empty or minimal input', () => {
    const slug = generateSlug('A')
    expect(slug).toBeTruthy()
    expect(typeof slug).toBe('string')
  })
})
