export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { requireAdmin } from '@/server/auth'
import { actionResponse, fail, ok } from '@/server/http'
import { idParamSchema } from '@/server/validations/common.schema'
import * as categoryService from '@/server/services/category.service'
import { deleteCategoryAction, updateCategoryAction } from '@/server/actions/category.action'

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request)
    const { id } = idParamSchema.parse(await context.params)
    return ok(await categoryService.getCategoryById(id))
  } catch (error) {
    return fail(error)
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin(request)
    const { id } = idParamSchema.parse(await context.params)
    return actionResponse(await updateCategoryAction(id, await request.json(), admin.id === 'admin-api-secret' ? request.headers.get('x-admin-secret') : null))
  } catch (error) {
    return fail(error)
  }
}

export const PUT = PATCH

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin(request)
    const { id } = idParamSchema.parse(await context.params)
    return actionResponse(await deleteCategoryAction(id, admin.id === 'admin-api-secret' ? request.headers.get('x-admin-secret') : null))
  } catch (error) {
    return fail(error)
  }
}
