import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabaseAdmin } from '@/lib/supabase/admin'

function createMockQuery() {
  let currentData: any = { data: null, error: null }
  const api: any = {
    then: (onfulfilled: any) => Promise.resolve(currentData).then(onfulfilled),
    catch: (onrejected: any) => Promise.resolve(currentData).catch(onrejected),
    finally: (onfinally: any) => Promise.resolve(currentData).finally(onfinally),
    mockResolvedValue: (data: any) => { currentData = data },
  }
  const methods = ['select', 'eq', 'single', 'update']
  methods.forEach(m => { api[m] = vi.fn(() => api) })
  return api
}

describe('siteSettingsRepository', () => {
  let mockQuery: ReturnType<typeof createMockQuery>

  beforeEach(() => {
    mockQuery = createMockQuery()
    vi.mocked(supabaseAdmin).from = vi.fn().mockReturnValue(mockQuery)
  })

  it('getSiteSettings fetches settings with id=1', async () => {
    const settings = { id: 1, brand: { name: 'MySite' } }
    mockQuery.mockResolvedValue({ data: settings, error: null })

    const { getSiteSettings } = await import('@/server/repositories/site-settings.repository')
    const result = await getSiteSettings()

    expect(result.brand.name).toBe('MySite')
  })

  it('getSiteSettings throws on error', async () => {
    mockQuery.mockResolvedValue({ data: null, error: new Error('DB error') })

    const { getSiteSettings } = await import('@/server/repositories/site-settings.repository')
    await expect(getSiteSettings()).rejects.toThrow()
  })

  it('updateSiteSettings updates and returns', async () => {
    const settings = { id: 1, brand: { name: 'Updated' } }
    mockQuery.mockResolvedValue({ data: settings, error: null })

    const { updateSiteSettings } = await import('@/server/repositories/site-settings.repository')
    const result = await updateSiteSettings({ brand: { name: 'Updated' } })

    expect(result.brand.name).toBe('Updated')
  })
})
