import { NextRequest } from 'next/server'
import { requireAdmin } from '@/server/auth'
import { actionResponse, fail, ok, parseQuery } from '@/server/http'
import { redirectListQuerySchema } from '@/server/validations/redirect.schema'
import * as redirectService from '@/server/services/redirect.service'
import { createRedirectAction } from '@/server/actions/redirect.action'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)
    return ok(await redirectService.listRedirects(parseQuery(request, redirectListQuerySchema)))
  } catch (error) {
    return fail(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request)
    return actionResponse(await createRedirectAction(await request.json(), admin.id === 'admin-api-secret' ? request.headers.get('x-admin-secret') : null), { status: 201 })
  } catch (error) {
    return fail(error)
  }
}
