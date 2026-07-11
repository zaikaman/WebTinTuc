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

/** Optional body for site-wide page views (path is client-only dedupe hint). */
export const pageViewBodySchema = z
  .object({
    path: z.string().max(500).optional()
  })
  .optional()
  .default({})