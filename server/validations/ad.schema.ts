import { z } from 'zod'
import { paginationSchema } from './common.schema'

export const adListQuerySchema = paginationSchema.extend({
  position: z.string().trim().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sortBy: z.enum(['name', 'priority', 'created_at']).default('created_at')
})

export const publicAdQuerySchema = z.object({
  position: z.string().trim().optional()
})

export const createAdSchema = z.object({
  name: z.string().trim().min(2).max(150),
  type: z.enum(['image', 'html', 'video']).default('image'),
  position: z.string().trim().min(1).max(100),
  media_key: z.string().trim().nullable().optional(),
  html_code: z.string().nullable().optional(),
  target_url: z.string().url().nullable().optional(),
  priority: z.coerce.number().int().default(0),
  status: z.enum(['active', 'inactive']).default('inactive'),
  starts_at: z.string().datetime().nullable().optional(),
  ends_at: z.string().datetime().nullable().optional()
})

export const updateAdSchema = createAdSchema.partial()

export const adEventSchema = z.object({
  adId: z.coerce.number().int().positive()
})
