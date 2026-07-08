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
  const methods = ['select', 'eq', 'neq', 'is', 'in', 'range', 'order', 'limit',
    'single', 'gte', 'lte', 'lt', 'textSearch', 'insert', 'update', 'maybeSingle']
  methods.forEach(m => { api[m] = vi.fn(() => api) })
  return api
}

describe('dashboardRepository', () => {
  let mockQuery: ReturnType<typeof createMockQuery>

  beforeEach(() => {
    mockQuery = createMockQuery()
    vi.mocked(supabaseAdmin).from = vi.fn().mockReturnValue(mockQuery)
    vi.mocked(supabaseAdmin).rpc = vi.fn().mockReturnValue(mockQuery)
  })

  it('getDashboardStats returns all expected keys', async () => {
    const { getDashboardStats } = await import('@/server/repositories/dashboard.repository')
    const result = await getDashboardStats()

    expect(result).toHaveProperty('totalArticles')
    expect(result).toHaveProperty('totalCategories')
    expect(result).toHaveProperty('totalAds')
    expect(result).toHaveProperty('totalViews')
    expect(result).toHaveProperty('totalClicks')
    expect(result).toHaveProperty('recentActivities')
    expect(Array.isArray(result.recentActivities)).toBe(true)
  })
})
