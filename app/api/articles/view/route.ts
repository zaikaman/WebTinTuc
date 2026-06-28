import { NextRequest } from 'next/server'
import { actionResponse, fail, ApiError } from '@/server/http'
import { recordArticleViewAction } from '@/server/actions/analytics.action'
import { checkRateLimit, getRateLimitKey } from '@/server/rate-limit'
import { articleViewBodySchema } from '@/server/validations/analytics.schema'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { articleId } = articleViewBodySchema.parse(body)

    // Rate limit: 1 view per IP per article per 10 minutes
    const key = `${getRateLimitKey(request.headers, 'view')}:${articleId}`
    const { allowed } = await checkRateLimit(key, 1, 600)

    if (!allowed) {
      throw new ApiError(429, 'BAD_REQUEST', 'Quá nhiều lượt xem trong thời gian ngắn. Thử lại sau.')
    }

    return actionResponse(await recordArticleViewAction(body))
  } catch (error) {
    return fail(error)
  }
}

