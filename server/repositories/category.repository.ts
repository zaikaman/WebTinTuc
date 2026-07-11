import { supabaseAdmin } from '@/lib/supabase/admin'
import { ApiError } from '@/server/http'
import { orIlikeContains } from '@/server/lib/postgrest'
import { pageMeta, toRange } from '@/server/validations/common.schema'

type CategoryListOptions = {
  page?: number
  limit?: number
  search?: string
  sortBy?: 'name' | 'priority' | 'created_at'
  sortOrder?: 'asc' | 'desc'
  status?: 'active' | 'inactive'
}

export async function listAdminCategories(options: CategoryListOptions = {}) {
  const page = options.page ?? 1
  const limit = options.limit ?? 20
  const { from, to } = toRange(page, limit)

  let query = supabaseAdmin
    .from('categories')
    .select('*, articles(count)', { count: 'exact' })
    .is('deleted_at', null)
    .range(from, to)
    .order(options.sortBy ?? 'priority', {
      ascending: (options.sortOrder ?? 'desc') === 'asc',
      nullsFirst: false
    })

  if (options.search) query = query.or(orIlikeContains(['name', 'slug'], options.search))
  if (options.status) query = query.eq('status', options.status)

  const { data, error, count } = await query
  if (error) throw error
  
  const items = data?.map(item => ({
    ...item,
    postCount: item.articles?.[0]?.count || 0
  })) || []
  
  return { items, meta: pageMeta(count, page, limit) }
}

export async function listPublicCategories(limit = 100) {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .is('deleted_at', null)
    .neq('status', 'inactive')
    .order('priority', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data ?? []
}

export async function getCategoryById(id: number) {
  const { data, error } = await supabaseAdmin.from('categories').select('*').eq('id', id).single()
  if (error) throw new ApiError(404, 'NOT_FOUND', 'Không tìm thấy danh mục')
  return data
}

export async function getPublicCategoryBySlug(slug: string) {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .is('deleted_at', null)
    .single()

  if (error) throw new ApiError(404, 'NOT_FOUND', 'Không tìm thấy danh mục')
  return data
}

export async function createCategory(data: Record<string, unknown>) {
  const { data: category, error } = await supabaseAdmin.from('categories').insert(data).select('*').single()
  if (error) throw error
  return category
}

export async function updateCategory(id: number, data: Record<string, unknown>) {
  const { data: category, error } = await supabaseAdmin
    .from('categories')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error
  return category
}

export async function softDeleteCategory(id: number) {
  const { error } = await supabaseAdmin
    .from('categories')
    .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
  return { id }
}

export async function restoreCategory(id: number) {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .update({ deleted_at: null, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error
  return data
}

