import { NextRequest } from 'next/server'
import { requireAdmin } from '@/server/auth'
import { fail, ok } from '@/server/http'
import * as dashboardService from '@/server/services/dashboard.service'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)
    const { searchParams } = new URL(request.url)
    const timeFilter = searchParams.get('timeFilter') as 'today' | 'week' | 'month' | 'year' | null
    const day = searchParams.get('day') || undefined
    const month = searchParams.get('month') || undefined
    const year = searchParams.get('year') || undefined

    const filters = {
      timeFilter: timeFilter || undefined,
      day,
      month,
      year
    }

    return ok(await dashboardService.getDashboardStats(filters))
  } catch (error) {
    return fail(error)
  }
}

