import { NextRequest } from 'next/server'
import { actionResponse, fail, ApiError } from '@/server/http'
import { recordPageViewAction } from '@/server/actions/analytics.action'
import { checkRateLimit, getRateLimitKey } from '@/server/rate-limit'
import { pageViewBodySchema } from '@/server/validations/analytics.schema'

export async function POST(request: NextRequest) {
  try {
    let body: unknown = {}
    try {
      body = await request.json()
    } catch {
      body = {}
    }
    pageViewBodySchema.parse(body)

    // Rate limit: 60 page views per IP per hour (memory fallback if Redis down)
    const key = getRateLimitKey(request.headers, 'pageview')
    const { allowed } = await checkRateLimit(key, 60, 3600)

    if (!allowed) {
      throw new ApiError(429, 'BAD_REQUEST', 'Quá nhiều lượt xem trang trong thời gian ngắn.')
    }

    return actionResponse(await recordPageViewAction(body))
  } catch (error) {
    return fail(error)
  }
}
