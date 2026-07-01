import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabaseAdmin } from '@/lib/supabase/admin'

function createMockQuery() {
  let currentData: any = { data: null, error: null, count: 0 }
  const api: any = {
    then: (onfulfilled: any) => Promise.resolve(currentData).then(onfulfilled),
    catch: (onrejected: any) => Promise.resolve(currentData).catch(onrejected),
    finally: (onfinally: any) => Promise.resolve(currentData).finally(onfinally),
    mockResolvedValue: (data: any) => { currentData = data },
  }
  const methods = ['select', 'eq', 'range', 'order', 'single', 'or',
    'upsert', 'update', 'delete', 'maybeSingle']
  methods.forEach(m => {
    api[m] = vi.fn(() => api)
  })
  return api
}

describe('redirectRepository', () => {
  let mockQuery: ReturnType<typeof createMockQuery>

  beforeEach(() => {
    mockQuery = createMockQuery()
    vi.mocked(supabaseAdmin).from = vi.fn().mockReturnValue(mockQuery)
  })

  it('listRedirects returns paginated redirects', async () => {
    const items = [{ id: 1, from_path: '/old', to_path: '/new' }]
    mockQuery.mockResolvedValue({ data: items, error: null, count: 1 })

    const { listRedirects } = await import('@/server/repositories/redirect.repository')
    const result = await listRedirects()

    expect(result.items).toHaveLength(1)
  })

  it('getRedirectById returns redirect', async () => {
    const r = { id: 1, from_path: '/old', to_path: '/new' }
    mockQuery.mockResolvedValue({ data: r, error: null })

    const { getRedirectById } = await import('@/server/repositories/redirect.repository')
    const result = await getRedirectById(1)

    expect(result.from_path).toBe('/old')
  })

  it('getRedirectById throws 404', async () => {
    mockQuery.mockResolvedValue({ data: null, error: { code: 'PGRST116' } })

    const { getRedirectById } = await import('@/server/repositories/redirect.repository')
    await expect(getRedirectById(999)).rejects.toThrow('Không tìm thấy redirect')
  })

  it('findRedirectByPath fetches by from_path', async () => {
    const r = { id: 1, from_path: '/old', to_path: '/new' }
    mockQuery.mockResolvedValue({ data: r, error: null })

    const { findRedirectByPath } = await import('@/server/repositories/redirect.repository')
    const result = await findRedirectByPath('/old')

    expect(result?.from_path).toBe('/old')
  })

  it('upsertRedirect upserts and returns', async () => {
    const r = { id: 1, from_path: '/old', to_path: '/new' }
    mockQuery.mockResolvedValue({ data: r, error: null })

    const { upsertRedirect } = await import('@/server/repositories/redirect.repository')
    const result = await upsertRedirect({ from_path: '/old', to_path: '/new' })

    expect(result.from_path).toBe('/old')
  })

  it('deleteRedirect deletes by id', async () => {
    mockQuery.mockResolvedValue({ error: null })

    const { deleteRedirect } = await import('@/server/repositories/redirect.repository')
    const result = await deleteRedirect(1)

    expect(result.id).toBe(1)
  })
})
