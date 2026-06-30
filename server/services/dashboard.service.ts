import { unstable_cache } from 'next/cache'
import * as dashboardRepository from '@/server/repositories/dashboard.repository'

export const getCachedDashboardStats = unstable_cache(
  async () => {
    return dashboardRepository.getDashboardStats()
  },
  ['dashboard-stats'],
  { revalidate: 1800, tags: ['dashboard'] }
)

export async function getDashboardStats() {
  return getCachedDashboardStats()
}

