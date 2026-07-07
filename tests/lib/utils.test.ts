import { describe, it, expect } from 'vitest'
import { cn, formatCategory, formatVietnameseDate } from '@/lib/utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible')
  })

  it('handles undefined values', () => {
    expect(cn('foo', undefined, 'bar')).toBe('foo bar')
  })

  it('handles empty input', () => {
    expect(cn()).toBe('')
  })

  it('merges tailwind classes correctly (last wins)', () => {
    expect(cn('px-4', 'px-2')).toBe('px-2')
  })
})

describe('formatCategory', () => {
  it('capitalizes the first letter', () => {
    expect(formatCategory('tin tức')).toBe('Tin tức')
  })

  it('handles already capitalized input', () => {
    expect(formatCategory('Công Nghệ')).toBe('Công nghệ')
  })

  it('handles all caps input', () => {
    expect(formatCategory('ANIME/MANGA')).toBe('Anime/manga')
  })

  it('returns empty string for empty input', () => {
    expect(formatCategory('')).toBe('')
  })

  it('returns empty string for falsy input', () => {
    expect(formatCategory('')).toBe('')
  })
})

describe('formatVietnameseDate', () => {
  it('formats UTC ISO strings to ICT (GMT+7) date time format', () => {
    // 2026-07-01 17:05:55.625 UTC -> 2026-07-02 00:05:55.625 ICT
    expect(formatVietnameseDate('2026-07-01T17:05:55.625Z')).toBe('00:05 - 02/07/2026')
  })

  it('formats ICT ISO strings correctly', () => {
    expect(formatVietnameseDate('2026-07-08T00:24:36+07:00')).toBe('00:24 - 08/07/2026')
  })

  it('handles invalid date strings gracefully by returning original input', () => {
    expect(formatVietnameseDate('not-a-date')).toBe('not-a-date')
    expect(formatVietnameseDate('')).toBe('')
  })
})

