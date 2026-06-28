'use server'

import { adEventSchema } from '@/server/validations/ad.schema'
import { articleViewBodySchema } from '@/server/validations/analytics.schema'
import * as analyticsService from '@/server/services/analytics.service'
import { runAction } from './action-result'

export async function recordArticleViewAction(input: unknown) {
  return runAction(async () => {
    const { articleId } = articleViewBodySchema.parse(input)
    return analyticsService.recordArticleView(articleId)
  })
}

export async function recordAdImpressionAction(input: unknown) {
  return runAction(async () => {
    const { adId } = adEventSchema.parse(input)
    return analyticsService.recordAdImpression(adId)
  })
}

export async function recordAdClickAction(input: unknown) {
  return runAction(async () => {
    const { adId } = adEventSchema.parse(input)
    return analyticsService.recordAdClick(adId)
  })
}

