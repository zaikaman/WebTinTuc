import { describe, it, expect, vi, beforeEach } from 'vitest'
import { revalidatePath, revalidateTag } from 'next/cache'

vi.mock('@/server/services/site-settings.service', () => ({
  updateSiteSettings: vi.fn(),
}))

vi.mock('@/server/validations/site-settings.schema', () => ({
  updateSiteSettingsSchema: { parse: vi.fn((input) => input) },
}))

describe('settingsActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updateSiteSettingsAction updates and revalidates', async () => {
    const { updateSiteSettings } = await import('@/server/services/site-settings.service')
    vi.mocked(updateSiteSettings).mockResolvedValue({ id: 1, brand: { name: 'Updated' } })

    const { updateSiteSettingsAction } = await import('@/server/actions/settings.action')
    const result = await updateSiteSettingsAction(
      { brand: { name: 'Updated' } },
      'test-admin-secret'
    )

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.id).toBe(1)
    }
    expect(revalidateTag).toHaveBeenCalledWith('site-settings')
    expect(revalidateTag).toHaveBeenCalledWith('settings')
    expect(revalidatePath).toHaveBeenCalledWith('/')
  })
})
