import { NextRequest } from 'next/server'
import { fail, ok } from '@/server/http'
import * as articleService from '@/server/services/article.service'

export async function GET(request: NextRequest) {
  try {
    const limit = Number(request.nextUrl.searchParams.get('limit') ?? 6)
    return ok(await articleService.getFeaturedArticles(limit))
  } catch (error) {
    return fail(error)
  }
}

