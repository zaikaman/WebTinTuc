import * as dashboardRepository from '@/server/repositories/dashboard.repository'

/**
 * Admin dashboard stats — always fresh (no server Data Cache).
 * Standard timeframes share one RPC payload so the client can switch
 * today/week/month/year without another server round-trip.
 */
export async function getDashboardStats(filters?: {
  timeFilter?: 'today' | 'week' | 'month' | 'year' | undefined
  day?: string | undefined
  month?: string | undefined
  year?: string | undefined
}) {
  return dashboardRepository.getDashboardStats(filters)
}
