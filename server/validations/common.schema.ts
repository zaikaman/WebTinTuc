import { z } from 'zod'
import './i18n'

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive()
})

export const slugParamSchema = z.object({
  slug: z.string().min(1)
})

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(1000).default(20),
  search: z.string().trim().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

export function toRange(page = 1, limit = 20) {
  const from = (page - 1) * limit
  const to = from + limit - 1
  return { from, to }
}

export function pageMeta(count: number | null, page: number, limit: number) {
  const total = count ?? 0
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit))
  }
}

