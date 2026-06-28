import { NextRequest } from 'next/server'
import { requireAdmin } from '@/server/auth'
import { actionResponse, fail } from '@/server/http'
import { idParamSchema } from '@/server/validations/common.schema'
import { restoreArticleAction } from '@/server/actions/article.action'

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin(request)
    const { id } = idParamSchema.parse(await context.params)
    return actionResponse(await restoreArticleAction(id, admin.id === 'admin-api-secret' ? request.headers.get('x-admin-secret') : null))
  } catch (error) {
    return fail(error)
  }
}
