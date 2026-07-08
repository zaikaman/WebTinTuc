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
  const methods = ['select', 'eq', 'neq', 'is', 'range', 'order', 'limit',
    'single', 'or', 'gte', 'lte', 'insert', 'update', 'maybeSingle', 'delete']
  methods.forEach(m => {
    api[m] = vi.fn(() => api)
  })
  return api
}

describe('adRepository', () => {
  let mockQuery: ReturnType<typeof createMockQuery>

  beforeEach(() => {
    mockQuery = createMockQuery()
    vi.mocked(supabaseAdmin).from = vi.fn().mockReturnValue(mockQuery)
  })

  it('listAdminAds returns paginated ads', async () => {
    const items = [{ id: 1, name: 'Banner' }]
    mockQuery.mockResolvedValue({ data: items, error: null, count: 1 })

    const { listAdminAds } = await import('@/server/repositories/ad.repository')
    const result = await listAdminAds({ page: 1, limit: 20 })

    expect(result.items).toHaveLength(1)
    expect(result.meta.total).toBe(1)
    expect(mockQuery.is).toHaveBeenCalledWith('deleted_at', null)
  })

  it('listAdminAds filters by position and status', async () => {
    mockQuery.mockResolvedValue({ data: [], error: null, count: 0 })

    const { listAdminAds } = await import('@/server/repositories/ad.repository')
    await listAdminAds({ position: 'sidebar', status: 'active' })

    expect(mockQuery.eq).toHaveBeenCalledWith('position', 'sidebar')
    expect(mockQuery.eq).toHaveBeenCalledWith('status', 'active')
  })

  it('listPublicAds returns active, non-deleted ads', async () => {
    const items = [{ id: 1, name: 'Active Ad' }]
    mockQuery.mockResolvedValue({ data: items, error: null })

    const { listPublicAds } = await import('@/server/repositories/ad.repository')
    const result = await listPublicAds('sidebar')

    expect(result).toHaveLength(1)
  })

  it('getAdById returns ad', async () => {
    const ad = { id: 1, name: 'Test Ad' }
    mockQuery.mockResolvedValue({ data: ad, error: null })

    const { getAdById } = await import('@/server/repositories/ad.repository')
    const result = await getAdById(1)

    expect(result.name).toBe('Test Ad')
  })

  it('getAdById throws 404', async () => {
    mockQuery.mockResolvedValue({ data: null, error: { code: 'PGRST116' } })

    const { getAdById } = await import('@/server/repositories/ad.repository')
    await expect(getAdById(999)).rejects.toThrow('Không tìm thấy quảng cáo')
  })

  it('createAd inserts ad', async () => {
    const ad = { id: 1, name: 'New Ad' }
    mockQuery.mockResolvedValue({ data: ad, error: null })

    const { createAd } = await import('@/server/repositories/ad.repository')
    const result = await createAd({ name: 'New Ad' })

    expect(result.id).toBe(1)
    expect(mockQuery.insert).toHaveBeenCalled()
  })

  it('softDeleteAd sets deleted_at', async () => {
    mockQuery.mockResolvedValue({ error: null })

    const { softDeleteAd } = await import('@/server/repositories/ad.repository')
    const result = await softDeleteAd(1)

    expect(result.id).toBe(1)
  })

  it('restoreAd clears deleted_at', async () => {
    const ad = { id: 1, name: 'Restored' }
    mockQuery.mockResolvedValue({ data: ad, error: null })

    const { restoreAd } = await import('@/server/repositories/ad.repository')
    const result = await restoreAd(1)

    expect(result.id).toBe(1)
  })
})
