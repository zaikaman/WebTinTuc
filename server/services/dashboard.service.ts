import * as dashboardRepository from '@/server/repositories/dashboard.repository'

export async function getDashboardStats() {
  return dashboardRepository.getDashboardStats()
}

