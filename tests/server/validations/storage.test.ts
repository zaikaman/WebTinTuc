import { describe, it, expect } from 'vitest'
import { storagePrefixQuerySchema, storageKeySchema, storageMoveSchema } from '@/server/validations/storage.schema'

describe('storagePrefixQuerySchema', () => {
  it('defaults to empty prefix', () => {
    const result = storagePrefixQuerySchema.parse({})
    expect(result.prefix).toBe('')
  })

  it('parses provided prefix', () => {
    const result = storagePrefixQuerySchema.parse({ prefix: 'articles' })
    expect(result.prefix).toBe('articles')
  })
})

describe('storageKeySchema', () => {
  it('requires a non-empty key', () => {
    expect(() => storageKeySchema.parse({ key: '' })).toThrow()
  })

  it('accepts valid key', () => {
    const result = storageKeySchema.parse({ key: 'articles/image.jpg' })
    expect(result.key).toBe('articles/image.jpg')
  })
})

describe('storageMoveSchema', () => {
  it('requires both fromKey and toKey', () => {
    const result = storageMoveSchema.parse({ fromKey: 'a.jpg', toKey: 'b.jpg' })
    expect(result.fromKey).toBe('a.jpg')
    expect(result.toKey).toBe('b.jpg')
  })

  it('rejects empty keys', () => {
    expect(() => storageMoveSchema.parse({ fromKey: '', toKey: 'b.jpg' })).toThrow()
    expect(() => storageMoveSchema.parse({ fromKey: 'a.jpg', toKey: '' })).toThrow()
  })
})
