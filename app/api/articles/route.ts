import { NextRequest } from 'next/server'
import { actionResponse, fail, okCached, parseQuery } from '@/server/http'
import { publicArticleListQuerySchema } from '@/server/validations/article.schema'
import * as articleService from '@/server/services/article.service'
import { requireAdmin } from '@/server/auth'
import { createArticleAction } from '@/server/actions/article.action'

export async function GET(request: NextRequest) {
  try {
    const query = parseQuery(request, publicArticleListQuerySchema)
    return okCached(await articleService.listPublicArticles(query))
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
