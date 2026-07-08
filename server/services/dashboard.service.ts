import { unstable_cache } from 'next/cache'
import * as dashboardRepository from '@/server/repositories/dashboard.repository'

export async function getDashboardStats(filters?: {
  timeFilter?: 'today' | 'week' | 'month' | 'year' | undefined
  day?: string | undefined
  month?: string | undefined
  year?: string | undefined
}) {
  const filtersKey = JSON.stringify(filters || {})
  return unstable_cache(
    async () => {
      return dashboardRepository.getDashboardStats(filters)
    },
    ['dashboard-stats', filtersKey],
    { revalidate: 1800, tags: ['dashboard'] }
  )()
}

