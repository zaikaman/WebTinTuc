import { NextRequest } from 'next/server'
import { requireAdmin } from '@/server/auth'
import { actionResponse, fail, ok, parseQuery } from '@/server/http'
import { adListQuerySchema } from '@/server/validations/ad.schema'
import * as adService from '@/server/services/ad.service'
import { createAdAction } from '@/server/actions/ad.action'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)
    return ok(await adService.listAdminAds(parseQuery(request, adListQuerySchema)))
  } catch (error) {
    return fail(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request)
    return actionResponse(await createAdAction(await request.json(), admin.id === 'admin-api-secret' ? request.headers.get('x-admin-secret') : null), { status: 201 })
  } catch (error) {
    return fail(error)
  }
}
