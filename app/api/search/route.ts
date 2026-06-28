import { NextRequest } from 'next/server'
import { fail, ok, parseQuery } from '@/server/http'
import { searchQuerySchema } from '@/server/validations/article.schema'
import * as articleService from '@/server/services/article.service'

export async function GET(request: NextRequest) {
  try {
    const query = parseQuery(request, searchQuerySchema)
    return ok(await articleService.searchArticles(query.q, query.page, query.limit))
  } catch (error) {
    return fail(error)
  }
}

