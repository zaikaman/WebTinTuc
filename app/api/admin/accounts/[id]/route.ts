import { NextRequest } from 'next/server'
import { requireAdmin } from '@/server/auth'
import { actionResponse, fail, ok } from '@/server/http'
import { z } from 'zod'
import * as adminAccountService from '@/server/services/admin-account.service'
import { deleteAdminAccountAction, updateAdminAccountAction } from '@/server/actions/admin-account.action'

const uuidParamSchema = z.object({
  id: z.string().uuid()
})

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request)
    const { id } = uuidParamSchema.parse(await context.params)
    return ok(await adminAccountService.getAdminAccountById(id))
  } catch (error) {
    return fail(error)
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin(request)
    const { id } = uuidParamSchema.parse(await context.params)
    return actionResponse(
      await updateAdminAccountAction(
        id,
        await request.json(),
        admin.id === 'admin-api-secret' ? request.headers.get('x-admin-secret') : null
      )
    )
  } catch (error) {
    return fail(error)
  }
}

export const PUT = PATCH

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin(request)
    const { id } = uuidParamSchema.parse(await context.params)
    return actionResponse(
      await deleteAdminAccountAction(
        id,
        admin.id === 'admin-api-secret' ? request.headers.get('x-admin-secret') : null
      )
    )
  } catch (error) {
    return fail(error)
  }
}
