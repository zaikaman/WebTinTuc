import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as dashboardService from '@/server/services/dashboard.service'
import * as dashboardRepository from '@/server/repositories/dashboard.repository'

vi.mock('@/server/repositories/dashboard.repository', () => ({
  getDashboardStats: vi.fn(),
}))

describe('dashboardService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getDashboardStats returns stats from repository', async () => {
    const mockStats = {
      totalArticles: 100,
      totalCategories: 10,
      totalAds: 5,
      totalViews: 5000,
      totalClicks: 200,
    }
    vi.mocked(dashboardRepository.getDashboardStats).mockResolvedValue(mockStats as any)

    const result = await dashboardService.getDashboardStats()
    expect(result).toEqual(mockStats)
  })
})
