import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/server/services/redirect.service', () => ({
  createRedirect: vi.fn(),
  updateRedirect: vi.fn(),
  deleteRedirect: vi.fn(),
}))

vi.mock('@/server/validations/redirect.schema', () => ({
  createRedirectSchema: { parse: vi.fn((input) => input) },
  updateRedirectSchema: { parse: vi.fn((input) => input) },
}))

vi.mock('@/lib/redirect-cache', () => ({
  bumpRedirectCacheVersion: vi.fn().mockResolvedValue(undefined),
}))

describe('redirectActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('createRedirectAction creates redirect and bumps cache version', async () => {
    const { createRedirect } = await import('@/server/services/redirect.service')
    const { bumpRedirectCacheVersion } = await import('@/lib/redirect-cache')
    vi.mocked(createRedirect).mockResolvedValue({ id: 1, from_path: '/old', to_path: '/new' })

    const { createRedirectAction } = await import('@/server/actions/redirect.action')
    const result = await createRedirectAction(
      { from_path: '/old', to_path: '/new' },
      'test-admin-secret'
    )

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.id).toBe(1)
    }
    expect(bumpRedirectCacheVersion).toHaveBeenCalledOnce()
  })

  it('updateRedirectAction updates redirect and bumps cache version', async () => {
    const { updateRedirect } = await import('@/server/services/redirect.service')
    const { bumpRedirectCacheVersion } = await import('@/lib/redirect-cache')
    vi.mocked(updateRedirect).mockResolvedValue({ id: 1, to_path: '/updated' })

    const { updateRedirectAction } = await import('@/server/actions/redirect.action')
    const result = await updateRedirectAction(1, { to_path: '/updated' }, 'test-admin-secret')

    expect(result.success).toBe(true)
    expect(bumpRedirectCacheVersion).toHaveBeenCalledOnce()
  })

  it('deleteRedirectAction deletes redirect and bumps cache version', async () => {
    const { deleteRedirect } = await import('@/server/services/redirect.service')
    const { bumpRedirectCacheVersion } = await import('@/lib/redirect-cache')
    vi.mocked(deleteRedirect).mockResolvedValue({ id: 1 })

    const { deleteRedirectAction } = await import('@/server/actions/redirect.action')
    const result = await deleteRedirectAction(1, 'test-admin-secret')

    expect(result.success).toBe(true)
    expect(bumpRedirectCacheVersion).toHaveBeenCalledOnce()
  })
})
