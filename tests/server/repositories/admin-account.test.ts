import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabaseAdmin } from '@/lib/supabase/admin'

function createMockQuery() {
  let resolvedValues: any[] = []
  let defaultData: any = { data: null, error: null, count: 0 }
  const api: any = {
    then: (onfulfilled: any) => {
      const data = resolvedValues.shift() ?? defaultData
      return Promise.resolve(data).then(onfulfilled)
    },
    catch: (onrejected: any) => {
      const data = resolvedValues.shift() ?? defaultData
      return Promise.resolve(data).catch(onrejected)
    },
    finally: (onfinally: any) => {
      const data = resolvedValues.shift() ?? defaultData
      return Promise.resolve(data).finally(onfinally)
    },
    mockResolvedValue: (data: any) => { defaultData = data },
    mockResolvedValueOnce: (data: any) => { resolvedValues.push(data) },
  }
  const methods = ['select', 'eq', 'neq', 'is', 'range', 'order', 'limit',
    'single', 'or', 'insert', 'update', 'maybeSingle', 'delete', 'upsert']
  methods.forEach(m => {
    api[m] = vi.fn(() => api)
  })
  return api
}

describe('adminAccountRepository', () => {
  let mockQuery: ReturnType<typeof createMockQuery>
  let mockAuthAdmin: any

  beforeEach(() => {
    mockQuery = createMockQuery()
    vi.mocked(supabaseAdmin).from = vi.fn().mockReturnValue(mockQuery)
    
    mockAuthAdmin = {
      listUsers: vi.fn().mockResolvedValue({ data: { users: [] }, error: null }),
      getUserById: vi.fn().mockImplementation((id: string) => {
        const users: Record<string, { id: string; email: string }> = {
          'u1': { id: 'u1', email: 'admin1@example.com' },
          'u2': { id: 'u2', email: 'admin2@example.com' }
        }
        return Promise.resolve({
          data: { user: users[id] || null },
          error: null
        })
      }),
      createUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      updateUserById: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      deleteUser: vi.fn().mockResolvedValue({ error: null })
    }
    
    supabaseAdmin.auth = {
      admin: mockAuthAdmin
    } as any
  })

  it('listAdminAccounts uses DB-level pagination and only fetches auth users for current page', async () => {
    // Profiles are ordered as the DB would return them after .order('created_at', { ascending: false })
    const profiles = [
      { id: 'u2', username: 'admin2', display_name: 'Admin Two', role: 'admin', created_at: '2026-01-02' },
      { id: 'u1', username: 'admin1', display_name: 'Admin One', role: 'admin', created_at: '2026-01-01' }
    ]
    // Must include 'count' for pagination metadata
    mockQuery.mockResolvedValue({ data: profiles, error: null, count: 2 })

    const { listAdminAccounts } = await import('@/server/repositories/admin-account.repository')
    const result = await listAdminAccounts()

    expect(result.items).toHaveLength(2)
    // Sorted by created_at desc (applied via DB .order())
    expect(result.items[0].username).toBe('admin2')
    expect(result.items[0].email).toBe('admin2@example.com')
    expect(result.items[1].username).toBe('admin1')
    expect(result.items[1].email).toBe('admin1@example.com')
    expect(result.meta.total).toBe(2)

    // Should NOT have called listUsers (which fetches ALL auth users)
    expect(mockAuthAdmin.listUsers).not.toHaveBeenCalled()
    // Should have called getUserById for each profile individually
    expect(mockAuthAdmin.getUserById).toHaveBeenCalledTimes(2)
    expect(mockAuthAdmin.getUserById).toHaveBeenCalledWith('u1')
    expect(mockAuthAdmin.getUserById).toHaveBeenCalledWith('u2')
  })

  it('getAdminAccountById fetches profile and auth user', async () => {
    const profile = { id: 'u1', username: 'admin1', display_name: 'Admin One', role: 'admin' }
    mockQuery.mockResolvedValue({ data: profile, error: null })
    
    mockAuthAdmin.getUserById.mockResolvedValue({
      data: { user: { id: 'u1', email: 'admin1@example.com' } },
      error: null
    })

    const { getAdminAccountById } = await import('@/server/repositories/admin-account.repository')
    const result = await getAdminAccountById('u1')

    expect(result.username).toBe('admin1')
    expect(result.email).toBe('admin1@example.com')
  })

  it('createAdminAccount creates auth user and upserts profile', async () => {
    // 1st query: Check if username exists (returns null)
    mockQuery.mockResolvedValueOnce({ data: null, error: null })
    
    mockAuthAdmin.createUser.mockResolvedValue({
      data: { user: { id: 'u3', email: 'admin3@example.com' } },
      error: null
    })

    // 2nd query: Upsert profile (returns upserted profile)
    const profile = { id: 'u3', username: 'admin3', display_name: 'Admin Three', role: 'admin' }
    mockQuery.mockResolvedValueOnce({ data: profile, error: null })

    const { createAdminAccount } = await import('@/server/repositories/admin-account.repository')
    const result = await createAdminAccount({
      email: 'admin3@example.com',
      password: 'password123',
      username: 'admin3',
      display_name: 'Admin Three'
    })

    expect(result.username).toBe('admin3')
    expect(result.email).toBe('admin3@example.com')
    expect(mockAuthAdmin.createUser).toHaveBeenCalledWith({
      email: 'admin3@example.com',
      password: 'password123',
      email_confirm: true
    })
  })

  it('deleteAdminAccount deletes profile and auth user', async () => {
    mockQuery.mockResolvedValue({ error: null })
    mockAuthAdmin.deleteUser.mockResolvedValue({ error: null })

    const { deleteAdminAccount } = await import('@/server/repositories/admin-account.repository')
    const result = await deleteAdminAccount('u1')

    expect(result.id).toBe('u1')
    expect(mockAuthAdmin.deleteUser).toHaveBeenCalledWith('u1')
  })
})
