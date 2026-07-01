import { describe, it, expect } from 'vitest'
import { CreateArticleSchema, UpdateArticleSchema } from '@/server/schemas/article.schema'

describe('CreateArticleSchema', () => {
  it('requires title (min 5 chars) and content', () => {
    expect(() => CreateArticleSchema.parse({})).toThrow()
  })

  it('rejects title shorter than 5 chars', () => {
    expect(() =>
      CreateArticleSchema.parse({
        title: 'Abc',
        content: { type: 'doc', content: [] },
      })
    ).toThrow()
  })

  it('rejects title longer than 255 chars', () => {
    expect(() =>
      CreateArticleSchema.parse({
        title: 'x'.repeat(256),
        content: { type: 'doc', content: [] },
      })
    ).toThrow()
  })

  it('requires content to have type "doc"', () => {
    expect(() =>
      CreateArticleSchema.parse({
        title: 'Valid Article Title',
        content: { type: 'not-doc', content: [] },
      })
    ).toThrow()
  })

  it('accepts valid minimal article', () => {
    const result = CreateArticleSchema.parse({
      title: 'Valid Article Title Here',
      content: { type: 'doc', content: [] },
    })
    expect(result.title).toBe('Valid Article Title Here')
    expect(result.published).toBe(false)
    expect(result.featured).toBe(false)
  })

  it('accepts optional fields', () => {
    const result = CreateArticleSchema.parse({
      title: 'Valid Article Title Here',
      content: { type: 'doc', content: [] },
      summary: 'A short summary',
      thumbnail_key: 'images/thumb.jpg',
      category_id: 5,
      author_id: '550e8400-e29b-41d4-a716-446655440000',
      published: true,
      featured: true,
      seo_title: 'SEO Title',
      seo_description: 'SEO desc',
    })
    expect(result.summary).toBe('A short summary')
    expect(result.thumbnail_key).toBe('images/thumb.jpg')
    expect(result.published).toBe(true)
    expect(result.featured).toBe(true)
  })

  it('rejects invalid category_id (non-integer)', () => {
    expect(() =>
      CreateArticleSchema.parse({
        title: 'Valid Title',
        content: { type: 'doc', content: [] },
        category_id: 1.5,
      })
    ).toThrow()
  })

  it('rejects non-UUID author_id', () => {
    expect(() =>
      CreateArticleSchema.parse({
        title: 'Valid Title',
        content: { type: 'doc', content: [] },
        author_id: 'not-a-uuid',
      })
    ).toThrow()
  })

  it('validates YouTube embed content blocks', () => {
    const result = CreateArticleSchema.parse({
      title: 'Article with YouTube',
      content: {
        type: 'doc',
        content: [
          {
            type: 'youtubeEmbed',
            attrs: {
              url: 'https://youtube.com/watch?v=abc123',
              videoId: 'abc123',
              caption: 'Cool video',
            },
          },
        ],
      },
    })
    expect(result.content.content).toHaveLength(1)
  })

  it('rejects YouTube embed missing required attrs', () => {
    expect(() =>
      CreateArticleSchema.parse({
        title: 'Article with Bad YouTube',
        content: {
          type: 'doc',
          content: [
            {
              type: 'youtubeEmbed',
              attrs: { url: 'not-a-url' },
            },
          ],
        },
      })
    ).toThrow()
  })

  it('validates storage media content blocks', () => {
    const result = CreateArticleSchema.parse({
      title: 'Article with Media',
      content: {
        type: 'doc',
        content: [
          {
            type: 'storageMedia',
            attrs: {
              mediaType: 'image',
              key: 'articles/photo.jpg',
              url: 'https://cdn.example.com/photo.jpg',
              mimeType: 'image/jpeg',
              caption: 'A nice photo',
            },
          },
        ],
      },
    })
    expect(result.content.content).toHaveLength(1)
  })
})

describe('UpdateArticleSchema', () => {
  it('allows partial updates', () => {
    const result = UpdateArticleSchema.parse({ title: 'Updated Title' })
    expect(result.title).toBe('Updated Title')
  })

  it('allows empty object', () => {
    const result = UpdateArticleSchema.parse({})
    // partial() keeps defaults from the parent schema
    expect(result.published).toBe(false)
    expect(result.featured).toBe(false)
  })
})
