import { NextRequest } from 'next/server'
import { requireAdmin } from '@/server/auth'
import { actionResponse, fail, ok, parseQuery } from '@/server/http'
import { articleListQuerySchema } from '@/server/validations/article.schema'
import * as articleService from '@/server/services/article.service'
import { createArticleAction } from '@/server/actions/article.action'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)
    return ok(await articleService.listAdminArticles(parseQuery(request, articleListQuerySchema)))
  } catch (error) {
    return fail(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request)
    return actionResponse(await createArticleAction(await request.json(), admin.id === 'admin-api-secret' ? request.headers.get('x-admin-secret') : null), { status: 201 })
  } catch (error) {
    return fail(error)
  }
}
