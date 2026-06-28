import { z } from 'zod'
import { paginationSchema } from './common.schema'

export const redirectListQuerySchema = paginationSchema.extend({
  sortBy: z.enum(['from_path', 'created_at', 'updated_at']).default('created_at')
})

export const createRedirectSchema = z.object({
  from_path: z.string().trim().startsWith('/'),
  to_path: z.string().trim().startsWith('/'),
  status_code: z.union([z.literal(301), z.literal(302), z.literal(307), z.literal(308)]).default(301)
})

export const updateRedirectSchema = createRedirectSchema.partial()

