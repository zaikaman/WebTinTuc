import { NextRequest } from 'next/server'
import { actionResponse, fail, ApiError } from '@/server/http'
import { recordAdClickAction } from '@/server/actions/analytics.action'
import { checkRateLimit, getRateLimitKey } from '@/server/rate-limit'
import { adEventSchema } from '@/server/validations/ad.schema'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { adId } = adEventSchema.parse(body)

    // Rate limit: 3 clicks per IP per ad per hour
    const key = `${getRateLimitKey(request.headers, 'click')}:${adId}`
    const { allowed } = await checkRateLimit(key, 3, 3600)

    if (!allowed) {
      throw new ApiError(429, 'BAD_REQUEST', 'Quá nhiều click trong thời gian ngắn.')
    }

    return actionResponse(await recordAdClickAction(body))
  } catch (error) {
    return fail(error)
  }
}

