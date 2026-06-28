import { NextRequest } from 'next/server'
import { requireAdmin } from '@/server/auth'
import { fail, ok } from '@/server/http'
import * as dashboardService from '@/server/services/dashboard.service'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)
    return ok(await dashboardService.getDashboardStats())
  } catch (error) {
    return fail(error)
  }
}

