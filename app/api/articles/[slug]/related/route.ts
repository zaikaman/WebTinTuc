import { NextRequest } from 'next/server'
import { fail, okCached } from '@/server/http'
import { slugParamSchema } from '@/server/validations/common.schema'
import * as articleService from '@/server/services/article.service'

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = slugParamSchema.parse(await context.params)
    const limit = Number(request.nextUrl.searchParams.get('limit') ?? 6)
    return okCached(await articleService.getRelatedArticles(slug, limit))
  } catch (error) {
    return fail(error)
  }
}

