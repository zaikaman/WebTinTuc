import { z } from 'zod'

export const articleViewBodySchema = z.object({
  articleId: z.coerce.number().int().positive()
})

export const adImpressionBodySchema = z.object({
  adId: z.coerce.number().int().positive()
})

export const adClickBodySchema = z.object({
  adId: z.coerce.number().int().positive()
})
