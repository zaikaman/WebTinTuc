import { z } from 'zod'
import { paginationSchema } from './common.schema'

export const categoryListQuerySchema = paginationSchema.extend({
  sortBy: z.enum(['name', 'priority', 'created_at']).default('priority'),
  status: z.enum(['active', 'inactive']).optional()
})

export const publicCategoryListQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(100)
})

export const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().min(2).max(100).optional(),
  priority: z.coerce.number().int().min(0).max(10).default(0),
  description: z.string().trim().nullable().optional(),
  status: z.enum(['active', 'inactive']).default('active')
})

export const updateCategorySchema = createCategorySchema.omit({ slug: true }).partial()

