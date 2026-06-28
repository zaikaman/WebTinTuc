import { NextRequest } from 'next/server'
import { actionResponse, fail, ApiError } from '@/server/http'
import { recordAdImpressionAction } from '@/server/actions/analytics.action'
import { checkRateLimit, getRateLimitKey } from '@/server/rate-limit'
import { adEventSchema } from '@/server/validations/ad.schema'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { adId } = adEventSchema.parse(body)

    // Rate limit: 5 impressions per IP per ad per hour
    const key = `${getRateLimitKey(request.headers, 'impression')}:${adId}`
    const { allowed } = await checkRateLimit(key, 5, 3600)

    if (!allowed) {
      throw new ApiError(429, 'BAD_REQUEST', 'Quá nhiều impression trong thời gian ngắn.')
    }

    return actionResponse(await recordAdImpressionAction(body))
  } catch (error) {
    return fail(error)
  }
}

