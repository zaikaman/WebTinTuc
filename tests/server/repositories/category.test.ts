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
    'single', 'or', 'insert', 'update', 'maybeSingle', 'delete']
  methods.forEach(m => {
    api[m] = vi.fn(() => api)
  })
  return api
}

describe('categoryRepository', () => {
  let mockQuery: ReturnType<typeof createMockQuery>

  beforeEach(() => {
    mockQuery = createMockQuery()
    vi.mocked(supabaseAdmin).from = vi.fn().mockReturnValue(mockQuery)
  })

  it('listAdminCategories returns categories with postCount', async () => {
    const items = [
      { id: 1, name: 'News', articles: [{ count: 5 }] },
      { id: 2, name: 'Tech', articles: [{ count: 3 }] },
    ]
    mockQuery.mockResolvedValue({ data: items, error: null, count: 2 })

    const { listAdminCategories } = await import('@/server/repositories/category.repository')
    const result = await listAdminCategories()

    expect(result.items).toHaveLength(2)
    expect(result.items[0].postCount).toBe(5)
    expect(result.items[1].postCount).toBe(3)
  })

  it('listPublicCategories returns active categories', async () => {
    const items = [{ id: 1, name: 'Active Category' }]
    mockQuery.mockResolvedValue({ data: items, error: null })

    const { listPublicCategories } = await import('@/server/repositories/category.repository')
    const result = await listPublicCategories()

    expect(result).toHaveLength(1)
  })

  it('getCategoryById returns category', async () => {
    const cat = { id: 1, name: 'Test' }
    mockQuery.mockResolvedValue({ data: cat, error: null })

    const { getCategoryById } = await import('@/server/repositories/category.repository')
    const result = await getCategoryById(1)

    expect(result.name).toBe('Test')
  })

  it('getCategoryById throws 404 when not found', async () => {
    mockQuery.mockResolvedValue({ data: null, error: { code: 'PGRST116' } })

    const { getCategoryById } = await import('@/server/repositories/category.repository')
    await expect(getCategoryById(999)).rejects.toThrow('Không tìm thấy danh mục')
  })

  it('createCategory inserts and returns', async () => {
    const cat = { id: 1, name: 'New' }
    mockQuery.mockResolvedValue({ data: cat, error: null })

    const { createCategory } = await import('@/server/repositories/category.repository')
    const result = await createCategory({ name: 'New' })

    expect(result.id).toBe(1)
    expect(mockQuery.insert).toHaveBeenCalledWith({ name: 'New' })
  })

  it('softDeleteCategory sets deleted_at', async () => {
    mockQuery.mockResolvedValue({ error: null })

    const { softDeleteCategory } = await import('@/server/repositories/category.repository')
    const result = await softDeleteCategory(1)

    expect(result.id).toBe(1)
  })

  it('restoreCategory clears deleted_at', async () => {
    const cat = { id: 1, name: 'Restored' }
    mockQuery.mockResolvedValue({ data: cat, error: null })

    const { restoreCategory } = await import('@/server/repositories/category.repository')
    const result = await restoreCategory(1)

    expect(result.id).toBe(1)
  })
})
