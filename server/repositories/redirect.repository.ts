import { supabaseAdmin } from '@/lib/supabase/admin'
import { ApiError } from '@/server/http'
import { pageMeta, toRange } from '@/server/validations/common.schema'

type RedirectListOptions = {
  page?: number
  limit?: number
  search?: string
  sortBy?: 'from_path' | 'created_at' | 'updated_at'
  sortOrder?: 'asc' | 'desc'
}

export async function listRedirects(options: RedirectListOptions = {}) {
  const page = options.page ?? 1
  const limit = options.limit ?? 20
  const { from, to } = toRange(page, limit)

  let query = supabaseAdmin
    .from('redirects')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order(options.sortBy === 'updated_at' ? 'created_at' : options.sortBy ?? 'created_at', {
      ascending: (options.sortOrder ?? 'desc') === 'asc'
    })

  if (options.search) query = query.or(`from_path.ilike.%${options.search}%,to_path.ilike.%${options.search}%`)

  const { data, error, count } = await query
  if (error) throw error
  return { items: data ?? [], meta: pageMeta(count, page, limit) }
}

export async function getRedirectById(id: number) {
  const { data, error } = await supabaseAdmin.from('redirects').select('*').eq('id', id).single()
  if (error) throw new ApiError(404, 'NOT_FOUND', 'Không tìm thấy redirect')
  return data
}

export async function findRedirectByPath(fromPath: string) {
  const { data, error } = await supabaseAdmin.from('redirects').select('*').eq('from_path', fromPath).maybeSingle()
  if (error) throw error
  return data
}

export async function upsertRedirect(data: { from_path: string; to_path: string; status_code?: number }) {
  const { data: redirect, error } = await supabaseAdmin
    .from('redirects')
    .upsert(data, { onConflict: 'from_path' })
    .select('*')
    .single()

  if (error) throw error
  return redirect
}

export async function updateRedirect(id: number, data: Record<string, unknown>) {
  const { data: redirect, error } = await supabaseAdmin.from('redirects').update(data).eq('id', id).select('*').single()
  if (error) throw error
  return redirect
}

export async function deleteRedirect(id: number) {
  const { error } = await supabaseAdmin.from('redirects').delete().eq('id', id)
  if (error) throw error
  return { id }
}

