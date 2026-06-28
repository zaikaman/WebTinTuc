import { NextRequest } from 'next/server'
import { requireAdmin } from '@/server/auth'
import { actionResponse, fail, ok } from '@/server/http'
import { idParamSchema } from '@/server/validations/common.schema'
import * as redirectService from '@/server/services/redirect.service'
import { deleteRedirectAction, updateRedirectAction } from '@/server/actions/redirect.action'

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request)
    const { id } = idParamSchema.parse(await context.params)
    return ok(await redirectService.getRedirectById(id))
  } catch (error) {
    return fail(error)
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin(request)
    const { id } = idParamSchema.parse(await context.params)
    return actionResponse(await updateRedirectAction(id, await request.json(), admin.id === 'admin-api-secret' ? request.headers.get('x-admin-secret') : null))
  } catch (error) {
    return fail(error)
  }
}

export const PUT = PATCH

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin(request)
    const { id } = idParamSchema.parse(await context.params)
    return actionResponse(await deleteRedirectAction(id, admin.id === 'admin-api-secret' ? request.headers.get('x-admin-secret') : null))
  } catch (error) {
    return fail(error)
  }
}
