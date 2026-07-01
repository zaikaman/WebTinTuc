import { describe, it, expect, vi, beforeEach } from 'vitest'

// The auth module currently bypasses authentication and returns a hardcoded admin
// We should test that the bypass works as expected
describe('auth', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('requireAdminAccess returns the test admin user (bypass mode)', async () => {
    const { requireAdminAccess } = await import('@/server/auth')
    const result = await requireAdminAccess()

    expect(result).toEqual({
      id: '00000000-0000-0000-0000-000000000001',
      role: 'admin',
    })
  })

  it('requireAdminAccess returns admin regardless of input (bypass mode)', async () => {
    const { requireAdminAccess } = await import('@/server/auth')
    const result1 = await requireAdminAccess('test-secret')
    const result2 = await requireAdminAccess(null)
    const result3 = await requireAdminAccess(undefined)

    expect(result1).toEqual(result2)
    expect(result2).toEqual(result3)
  })

  it('requireAdmin delegates to requireAdminAccess', async () => {
    // Create a mock request
    const request = new Request('http://localhost', {
      headers: { 'x-admin-secret': 'test-secret' },
    }) as any

    const { requireAdmin } = await import('@/server/auth')
    const result = await requireAdmin(request)

    expect(result).toEqual({
      id: '00000000-0000-0000-0000-000000000001',
      role: 'admin',
    })
  })
})
