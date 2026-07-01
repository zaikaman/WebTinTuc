import { describe, it, expect } from 'vitest'
import {
  redirectListQuerySchema,
  createRedirectSchema,
  updateRedirectSchema,
} from '@/server/validations/redirect.schema'

describe('redirectListQuerySchema', () => {
  it('uses default values', () => {
    const result = redirectListQuerySchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
    expect(result.sortBy).toBe('created_at')
  })
})

describe('createRedirectSchema', () => {
  it('requires paths starting with /', () => {
    const result = createRedirectSchema.parse({
      from_path: '/old-path',
      to_path: '/new-path',
    })
    expect(result.from_path).toBe('/old-path')
    expect(result.to_path).toBe('/new-path')
    expect(result.status_code).toBe(301)
  })

  it('rejects paths not starting with /', () => {
    expect(() =>
      createRedirectSchema.parse({ from_path: 'old-path', to_path: '/new-path' })
    ).toThrow()
    expect(() =>
      createRedirectSchema.parse({ from_path: '/old-path', to_path: 'new-path' })
    ).toThrow()
  })

  it('accepts valid status codes', () => {
    const result301 = createRedirectSchema.parse({ from_path: '/a', to_path: '/b' })
    expect(result301.status_code).toBe(301)

    const result302 = createRedirectSchema.parse({ from_path: '/a', to_path: '/b', status_code: 302 })
    expect(result302.status_code).toBe(302)
  })

  it('rejects invalid status codes', () => {
    expect(() =>
      createRedirectSchema.parse({ from_path: '/a', to_path: '/b', status_code: 303 })
    ).toThrow()
  })
})

describe('updateRedirectSchema', () => {
  it('allows partial updates', () => {
    const result = updateRedirectSchema.parse({ to_path: '/updated' })
    expect(result.to_path).toBe('/updated')
  })
})
