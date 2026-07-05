import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdminAccess, requireAdmin } from '@/server/auth'
import { ApiError } from '@/server/http'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))
vi.mock('@/lib/supabase/admin', () => ({
  supabaseAdmin: {
    from: vi.fn()
  } as any,
}))

describe('auth', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    process.env.ADMIN_API_SECRET = 'test-admin-secret'
  })

  it('requireAdminAccess returns admin payload when x-admin-secret matches', async () => {
    const result = await requireAdminAccess('test-admin-secret')
    expect(result).toEqual({ id: 'admin-api-secret', role: 'admin' })
  })

  it('requireAdminAccess throws 401 when session is missing or invalid', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: new Error('Unauthorized') })
      }
    } as any)

    await expect(requireAdminAccess()).rejects.toThrow(ApiError)
  })

  it('requireAdminAccess throws 403 when profile role is not admin', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-id' } }, error: null })
      }
    } as any)

    supabaseAdmin.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: 'user-id', role: 'editor' }, error: null })
        })
      })
    })

    await expect(requireAdminAccess()).rejects.toThrow(ApiError)
  })

  it('requireAdminAccess returns user payload for valid admin session', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-id' } }, error: null })
      }
    } as any)

    supabaseAdmin.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: 'user-id', role: 'admin' }, error: null })
        })
      })
    })

    const result = await requireAdminAccess()
    expect(result).toEqual({ id: 'user-id', role: 'admin' })
  })

  it('requireAdmin extracts x-admin-secret header and delegates to requireAdminAccess', async () => {
    const request = new Request('http://localhost', {
      headers: { 'x-admin-secret': 'test-admin-secret' },
    }) as any

    const result = await requireAdmin(request)
    expect(result).toEqual({ id: 'admin-api-secret', role: 'admin' })
  })
})
