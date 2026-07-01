import { describe, it, expect } from 'vitest'
import { idParamSchema, slugParamSchema, paginationSchema, toRange, pageMeta } from '@/server/validations/common.schema'

describe('idParamSchema', () => {
  it('parses a valid numeric id', () => {
    const result = idParamSchema.parse({ id: '123' })
    expect(result.id).toBe(123)
  })

  it('rejects negative id', () => {
    expect(() => idParamSchema.parse({ id: '-1' })).toThrow()
  })

  it('rejects zero id', () => {
    expect(() => idParamSchema.parse({ id: '0' })).toThrow()
  })

  it('rejects non-numeric id', () => {
    expect(() => idParamSchema.parse({ id: 'abc' })).toThrow()
  })

  it('rejects missing id', () => {
    expect(() => idParamSchema.parse({})).toThrow()
  })
})

describe('slugParamSchema', () => {
  it('parses a valid slug', () => {
    const result = slugParamSchema.parse({ slug: 'tin-tuc' })
    expect(result.slug).toBe('tin-tuc')
  })

  it('rejects empty slug', () => {
    expect(() => slugParamSchema.parse({ slug: '' })).toThrow()
  })
})

describe('paginationSchema', () => {
  it('uses default values when no params provided', () => {
    const result = paginationSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
    expect(result.sortOrder).toBe('desc')
  })

  it('parses provided pagination params', () => {
    const result = paginationSchema.parse({ page: '2', limit: '10', sortOrder: 'asc' })
    expect(result.page).toBe(2)
    expect(result.limit).toBe(10)
    expect(result.sortOrder).toBe('asc')
  })

  it('rejects limit over 1000', () => {
    expect(() => paginationSchema.parse({ limit: '2000' })).toThrow()
  })

  it('rejects invalid sortOrder', () => {
    expect(() => paginationSchema.parse({ sortOrder: 'invalid' })).toThrow()
  })

  it('accepts optional search param', () => {
    const result = paginationSchema.parse({ search: 'test' })
    expect(result.search).toBe('test')
  })
})

describe('toRange', () => {
  it('calculates range for page 1', () => {
    const { from, to } = toRange(1, 20)
    expect(from).toBe(0)
    expect(to).toBe(19)
  })

  it('calculates range for page 2', () => {
    const { from, to } = toRange(2, 10)
    expect(from).toBe(10)
    expect(to).toBe(19)
  })

  it('defaults to page 1 and limit 20', () => {
    const { from, to } = toRange()
    expect(from).toBe(0)
    expect(to).toBe(19)
  })
})

describe('pageMeta', () => {
  it('creates pagination metadata', () => {
    const meta = pageMeta(100, 1, 20)
    expect(meta).toEqual({
      page: 1,
      limit: 20,
      total: 100,
      totalPages: 5,
    })
  })

  it('handles null count as 0', () => {
    const meta = pageMeta(null, 1, 20)
    expect(meta.total).toBe(0)
    expect(meta.totalPages).toBe(1)
  })

  it('ensures at least 1 page even when empty', () => {
    const meta = pageMeta(0, 1, 20)
    expect(meta.totalPages).toBe(1)
  })

  it('rounds up total pages', () => {
    const meta = pageMeta(101, 1, 20)
    expect(meta.totalPages).toBe(6)
  })
})
