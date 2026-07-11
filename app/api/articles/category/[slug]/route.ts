import { NextRequest } from 'next/server'
import { fail, okCached, parseQuery } from '@/server/http'
import * as articleService from '@/server/services/article.service'
import { z } from 'zod'

const categoryArticleQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

/**
 * GET /api/articles/category/[slug]
 *
 * Lấy thông tin category + danh sách bài viết theo category slug.
 *
 * Query params:
 *   page  – trang (mặc định 1)
 *   limit – số bài mỗi trang (mặc định 20, tối đa 100)
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     category: { id, name, slug, ... },
 *     articles: {
 *       items: Article[],
 *       meta: { page, limit, total, totalPages }
 *     }
 *   }
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const query = parseQuery(request, categoryArticleQuerySchema)
    const data = await articleService.getArticlesByCategorySlug(slug, query)
    return okCached(data)
  } catch (error) {
    return fail(error)
  }
}
