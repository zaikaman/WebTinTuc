import { describe, it, expect } from 'vitest'
import {
  articleListQuerySchema,
  publicArticleListQuerySchema,
  createArticleSchema,
  updateArticleSchema,
  searchQuerySchema,
} from '@/server/validations/article.schema'

describe('articleListQuerySchema', () => {
  it('uses default values', () => {
    const result = articleListQuerySchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
    expect(result.sortBy).toBe('created_at')
    expect(result.sortOrder).toBe('desc')
  })

  it('parses optional filters', () => {
    const result = articleListQuerySchema.parse({
      categoryId: '5',
      status: 'published',
      featured: 'true',
      sortBy: 'title',
    })
    expect(result.categoryId).toBe(5)
    expect(result.status).toBe('published')
    expect(result.featured).toBe(true)
    expect(result.sortBy).toBe('title')
  })

  it('parses includeDeleted query strings correctly (not z.coerce.boolean)', () => {
    // Regression: Boolean("false") === true broke hide-deleted filter
    expect(articleListQuerySchema.parse({ includeDeleted: 'false' }).includeDeleted).toBe(false)
    expect(articleListQuerySchema.parse({ includeDeleted: 'true' }).includeDeleted).toBe(true)
    expect(articleListQuerySchema.parse({ includeDeleted: '0' }).includeDeleted).toBe(false)
    expect(articleListQuerySchema.parse({ includeDeleted: '1' }).includeDeleted).toBe(true)
    expect(articleListQuerySchema.parse({}).includeDeleted).toBeUndefined()
  })

  it('parses featured query strings correctly', () => {
    expect(articleListQuerySchema.parse({ featured: 'false' }).featured).toBe(false)
    expect(articleListQuerySchema.parse({ featured: 'true' }).featured).toBe(true)
  })

  it('rejects invalid status', () => {
    expect(() => articleListQuerySchema.parse({ status: 'deleted' })).toThrow()
  })

  it('rejects invalid sortBy', () => {
    expect(() => articleListQuerySchema.parse({ sortBy: 'invalid' })).toThrow()
  })
})

describe('publicArticleListQuerySchema', () => {
  it('uses default values', () => {
    const result = publicArticleListQuerySchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  it('rejects limit over 100', () => {
    expect(() => publicArticleListQuerySchema.parse({ limit: '200' })).toThrow()
  })

  it('parses optional category', () => {
    const result = publicArticleListQuerySchema.parse({ category: 'tin-tuc' })
    expect(result.category).toBe('tin-tuc')
  })
})

describe('createArticleSchema', () => {
  it('requires title and content', () => {
    expect(() => createArticleSchema.parse({})).toThrow()
  })

  it('rejects title shorter than 5 chars', () => {
    expect(() => createArticleSchema.parse({ title: 'abc', content: [] })).toThrow()
  })

  it('rejects title longer than 255 chars', () => {
    expect(() => createArticleSchema.parse({ title: 'x'.repeat(256), content: [] })).toThrow()
  })

  it('uses defaults for optional fields', () => {
    const result = createArticleSchema.parse({ title: 'Valid Article Title', content: [] })
    expect(result.status).toBe('draft')
    expect(result.featured).toBe(false)
  })

  it('parses a valid full article payload with content as blocks array', () => {
    const result = createArticleSchema.parse({
      title: 'Valid Article Title',
      slug: 'valid-article',
      summary: 'A brief summary',
      content: [{ type: 'paragraph', text: 'Hello' }],
      category_id: '1',
      status: 'published',
      featured: true,
      seo_title: 'SEO Title',
    })
    expect(result.title).toBe('Valid Article Title')
    expect(result.slug).toBe('valid-article')
    expect(result.category_id).toBe(1)
    expect(result.status).toBe('published')
    expect(result.featured).toBe(true)
  })

  it('accepts content wrapped in { blocks: [...] }', () => {
    const result = createArticleSchema.parse({
      title: 'Valid Article Title',
      content: { blocks: [{ type: 'paragraph', text: 'Hello' }] },
    })
    expect(result.title).toBe('Valid Article Title')
  })

  it('rejects content with unknown block type', () => {
    expect(() =>
      createArticleSchema.parse({
        title: 'Bad Blocks',
        content: [{ type: 'unknown' }],
      })
    ).toThrow()
  })
})

describe('updateArticleSchema', () => {
  it('allows partial updates', () => {
    const result = updateArticleSchema.parse({ title: 'Updated Title' })
    expect(result.title).toBe('Updated Title')
  })

  it('allows empty object', () => {
    const result = updateArticleSchema.parse({})
    // partial() keeps defaults from the parent schema
    expect(result.status).toBe('draft')
    expect(result.featured).toBe(false)
  })
})

describe('searchQuerySchema', () => {
  it('requires a search query', () => {
    expect(() => searchQuerySchema.parse({ q: '' })).toThrow()
  })

  it('uses default pagination', () => {
    const result = searchQuerySchema.parse({ q: 'test' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(10)
  })

  it('rejects limit over 50', () => {
    expect(() => searchQuerySchema.parse({ q: 'test', limit: '100' })).toThrow()
  })
})
