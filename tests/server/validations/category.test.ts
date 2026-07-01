import { describe, it, expect } from 'vitest'
import {
  categoryListQuerySchema,
  createCategorySchema,
  updateCategorySchema,
} from '@/server/validations/category.schema'

describe('categoryListQuerySchema', () => {
  it('uses default values', () => {
    const result = categoryListQuerySchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
    expect(result.sortBy).toBe('priority')
    expect(result.sortOrder).toBe('desc')
  })

  it('parses optional status filter', () => {
    const result = categoryListQuerySchema.parse({ status: 'active' })
    expect(result.status).toBe('active')
  })

  it('rejects invalid status', () => {
    expect(() => categoryListQuerySchema.parse({ status: 'deleted' })).toThrow()
  })
})

describe('createCategorySchema', () => {
  it('requires name (min 2 chars)', () => {
    expect(() => createCategorySchema.parse({ name: 'A' })).toThrow()
  })

  it('rejects name over 100 chars', () => {
    expect(() => createCategorySchema.parse({ name: 'x'.repeat(101) })).toThrow()
  })

  it('uses defaults', () => {
    const result = createCategorySchema.parse({ name: 'Anime/Manga' })
    expect(result.priority).toBe(0)
    expect(result.status).toBe('active')
  })

  it('accepts optional slug', () => {
    const result = createCategorySchema.parse({ name: 'Test', slug: 'test-slug' })
    expect(result.slug).toBe('test-slug')
  })

  it('rejects priority over 10', () => {
    expect(() => createCategorySchema.parse({ name: 'Test', priority: '15' })).toThrow()
  })
})

describe('updateCategorySchema', () => {
  it('allows partial updates', () => {
    const result = updateCategorySchema.parse({ name: 'Updated' })
    expect(result.name).toBe('Updated')
  })

  it('allows empty object', () => {
    const result = updateCategorySchema.parse({})
    // partial() keeps defaults from the parent schema
    expect(result.priority).toBe(0)
    expect(result.status).toBe('active')
  })
})
