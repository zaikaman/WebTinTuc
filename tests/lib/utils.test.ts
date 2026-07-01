import { describe, it, expect } from 'vitest'
import { cn, formatCategory } from '@/lib/utils'

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
