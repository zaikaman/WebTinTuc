import * as dashboardRepository from '@/server/repositories/dashboard.repository'

/**
 * Pass-through to repository caches.
 * Do NOT double-wrap with per-timeFilter cache keys — standard timeframes
 * share one RPC + one cache entry so first paint and filter switches stay fast.
 */
export async function getDashboardStats(filters?: {
  timeFilter?: 'today' | 'week' | 'month' | 'year' | undefined
  day?: string | undefined
  month?: string | undefined
  year?: string | undefined
}) {
  return dashboardRepository.getDashboardStats(filters)
}
