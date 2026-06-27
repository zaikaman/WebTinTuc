import { z } from 'zod'
import { paginationSchema } from './common.schema'

const articleStatusSchema = z.enum(['draft', 'published'])

export const articleListQuerySchema = paginationSchema.extend({
  categoryId: z.coerce.number().int().positive().optional(),
  category: z.string().trim().optional(),
  status: articleStatusSchema.optional(),
  featured: z.coerce.boolean().optional(),
  publishedFrom: z.string().datetime().optional(),
  publishedTo: z.string().datetime().optional(),
  sortBy: z.enum(['title', 'published_at', 'views', 'created_at']).default('created_at'),
  includeDeleted: z.coerce.boolean().optional()
})

export const publicArticleListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  category: z.string().trim().optional(),
  featured: z.coerce.boolean().optional()
})

export const createArticleSchema = z.object({
  title: z.string().trim().min(5).max(255),
  slug: z.string().trim().min(3).max(255).optional(),
  summary: z.string().trim().nullable().optional(),
  thumbnail_key: z.string().trim().nullable().optional(),
  content: z.unknown(),
  category_id: z.coerce.number().int().positive().nullable().optional(),
  author_id: z.string().uuid().nullable().optional(),
  status: articleStatusSchema.default('draft'),
  published: z.boolean().optional(),
  featured: z.boolean().default(false),
  seo_title: z.string().trim().max(255).nullable().optional(),
  seo_description: z.string().trim().nullable().optional(),
  published_at: z.string().datetime().nullable().optional()
})

export const updateArticleSchema = createArticleSchema.partial()

export const searchQuerySchema = z.object({
  q: z.string().trim().min(1),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10)
})


