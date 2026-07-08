export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { requireAdmin } from '@/server/auth'
import { actionResponse, fail, ok, parseQuery } from '@/server/http'
import { accountListQuerySchema } from '@/server/validations/admin-account.schema'
import * as adminAccountService from '@/server/services/admin-account.service'
import { createAdminAccountAction } from '@/server/actions/admin-account.action'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)
    return ok(await adminAccountService.listAdminAccounts(parseQuery(request, accountListQuerySchema)))
  } catch (error) {
    return fail(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request)
    return actionResponse(
      await createAdminAccountAction(
        await request.json(),
        admin.id === 'admin-api-secret' ? request.headers.get('x-admin-secret') : null
      ),
      { status: 201 }
    )
  } catch (error) {
    return fail(error)
  }
}
