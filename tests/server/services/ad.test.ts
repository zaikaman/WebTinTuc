import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as adService from '@/server/services/ad.service'
import * as adRepository from '@/server/repositories/ad.repository'

vi.mock('@/server/repositories/ad.repository', () => ({
  listAdminAds: vi.fn(),
  listPublicAds: vi.fn(),
  getAdById: vi.fn(),
  createAd: vi.fn(),
  updateAd: vi.fn(),
  softDeleteAd: vi.fn(),
  restoreAd: vi.fn(),
}))

describe('adService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('listAdminAds delegates to repository', async () => {
    const mockResult = { items: [], meta: { page: 1, limit: 20, total: 0, totalPages: 1 } }
    vi.mocked(adRepository.listAdminAds).mockResolvedValue(mockResult)

    const result = await adService.listAdminAds({ page: 1 })
    expect(result).toEqual(mockResult)
    expect(adRepository.listAdminAds).toHaveBeenCalledWith({ page: 1 })
  })

  it('listPublicAds delegates to repository', async () => {
    vi.mocked(adRepository.listPublicAds).mockResolvedValue([])

    const result = await adService.listPublicAds('sidebar')
    expect(result).toEqual([])
    expect(adRepository.listPublicAds).toHaveBeenCalledWith('sidebar')
  })

  it('getAdById delegates to repository', async () => {
    const mockAd = { id: 1, name: 'Test Ad' }
    vi.mocked(adRepository.getAdById).mockResolvedValue(mockAd)

    const result = await adService.getAdById(1)
    expect(result).toEqual(mockAd)
    expect(adRepository.getAdById).toHaveBeenCalledWith(1)
  })

  it('createAd delegates to repository', async () => {
    const mockAd = { id: 1, name: 'New Ad', position: 'sidebar' }
    vi.mocked(adRepository.createAd).mockResolvedValue(mockAd)

    const result = await adService.createAd({ name: 'New Ad', position: 'sidebar' })
    expect(result).toEqual(mockAd)
    expect(adRepository.createAd).toHaveBeenCalledWith({ name: 'New Ad', position: 'sidebar' })
  })

  it('updateAd delegates to repository', async () => {
    const mockAd = { id: 1, name: 'Updated Ad' }
    vi.mocked(adRepository.updateAd).mockResolvedValue(mockAd)

    const result = await adService.updateAd(1, { name: 'Updated Ad' })
    expect(result).toEqual(mockAd)
    expect(adRepository.updateAd).toHaveBeenCalledWith(1, { name: 'Updated Ad' })
  })

  it('deleteAd delegates to softDeleteAd', async () => {
    vi.mocked(adRepository.softDeleteAd).mockResolvedValue({ id: 1 })

    const result = await adService.deleteAd(1)
    expect(result).toEqual({ id: 1 })
    expect(adRepository.softDeleteAd).toHaveBeenCalledWith(1)
  })

  it('restoreAd delegates to repository', async () => {
    const mockAd = { id: 1, name: 'Restored Ad' }
    vi.mocked(adRepository.restoreAd).mockResolvedValue(mockAd)

    const result = await adService.restoreAd(1)
    expect(result).toEqual(mockAd)
    expect(adRepository.restoreAd).toHaveBeenCalledWith(1)
  })
})
