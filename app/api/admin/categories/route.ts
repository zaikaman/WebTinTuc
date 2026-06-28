import { NextRequest } from 'next/server'
import { requireAdmin } from '@/server/auth'
import { actionResponse, fail, ok, parseQuery } from '@/server/http'
import { categoryListQuerySchema } from '@/server/validations/category.schema'
import * as categoryService from '@/server/services/category.service'
import { createCategoryAction } from '@/server/actions/category.action'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)
    return ok(await categoryService.listAdminCategories(parseQuery(request, categoryListQuerySchema)))
  } catch (error) {
    return fail(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request)
    return actionResponse(await createCategoryAction(await request.json(), admin.id === 'admin-api-secret' ? request.headers.get('x-admin-secret') : null), { status: 201 })
  } catch (error) {
    return fail(error)
  }
}
