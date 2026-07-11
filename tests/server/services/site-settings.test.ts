import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as settingsService from '@/server/services/site-settings.service'
import * as settingsRepository from '@/server/repositories/site-settings.repository'

vi.mock('@/server/repositories/site-settings.repository', () => ({
  getSiteSettings: vi.fn(),
  updateSiteSettings: vi.fn(),
}))

describe('siteSettingsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getSiteSettings delegates to repository (uncached admin path)', async () => {
    const mockSettings = { id: 1, brand: { name: 'Test' } }
    vi.mocked(settingsRepository.getSiteSettings).mockResolvedValue(mockSettings)

    const result = await settingsService.getSiteSettings()
    expect(result).toEqual(mockSettings)
    expect(settingsRepository.getSiteSettings).toHaveBeenCalledTimes(1)
  })

  it('getPublicSiteSettings returns settings for public consumers', async () => {
    const mockSettings = { id: 1, brand: { name: 'Public' } }
    vi.mocked(settingsRepository.getSiteSettings).mockResolvedValue(mockSettings)

    const result = await settingsService.getPublicSiteSettings()
    expect(result).toEqual(mockSettings)
  })

  it('updateSiteSettings delegates to repository', async () => {
    const mockSettings = { id: 1, brand: { name: 'Updated' } }
    vi.mocked(settingsRepository.updateSiteSettings).mockResolvedValue(mockSettings)

    const result = await settingsService.updateSiteSettings({ brand: { name: 'Updated' } })
    expect(result).toEqual(mockSettings)
    expect(settingsRepository.updateSiteSettings).toHaveBeenCalledWith({ brand: { name: 'Updated' } })
  })
})
