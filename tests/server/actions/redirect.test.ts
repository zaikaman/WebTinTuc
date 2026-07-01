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

describe('redirectActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('createRedirectAction creates redirect', async () => {
    const { createRedirect } = await import('@/server/services/redirect.service')
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
  })

  it('updateRedirectAction updates redirect', async () => {
    const { updateRedirect } = await import('@/server/services/redirect.service')
    vi.mocked(updateRedirect).mockResolvedValue({ id: 1, to_path: '/updated' })

    const { updateRedirectAction } = await import('@/server/actions/redirect.action')
    const result = await updateRedirectAction(1, { to_path: '/updated' }, 'test-admin-secret')

    expect(result.success).toBe(true)
  })

  it('deleteRedirectAction deletes redirect', async () => {
    const { deleteRedirect } = await import('@/server/services/redirect.service')
    vi.mocked(deleteRedirect).mockResolvedValue({ id: 1 })

    const { deleteRedirectAction } = await import('@/server/actions/redirect.action')
    const result = await deleteRedirectAction(1, 'test-admin-secret')

    expect(result.success).toBe(true)
  })
})
