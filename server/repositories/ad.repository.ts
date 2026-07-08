import { supabaseAdmin } from '@/lib/supabase/admin'
import { ApiError } from '@/server/http'
import { pageMeta, toRange } from '@/server/validations/common.schema'

type AdListOptions = {
  page?: number
  limit?: number
  search?: string
  position?: string
  status?: 'active' | 'inactive'
  startDate?: string
  endDate?: string
  sortBy?: 'name' | 'priority' | 'created_at'
  sortOrder?: 'asc' | 'desc'
}

export async function listAdminAds(options: AdListOptions = {}) {
  const page = options.page ?? 1
  const limit = options.limit ?? 20
  const { from, to } = toRange(page, limit)

  let query = supabaseAdmin
    .from('ads')
    .select('*', { count: 'exact' })
    .is('deleted_at', null)
    .range(from, to)
    .order(options.sortBy ?? 'created_at', { ascending: (options.sortOrder ?? 'desc') === 'asc' })

  if (options.search) query = query.or(`name.ilike.%${options.search}%,position.ilike.%${options.search}%`)
  if (options.position) query = query.eq('position', options.position)
  if (options.status) query = query.eq('status', options.status)
  if (options.startDate) query = query.gte('starts_at', options.startDate)
  if (options.endDate) query = query.lte('ends_at', options.endDate)

  const { data, error, count } = await query
  if (error) throw error
  return { items: data ?? [], meta: pageMeta(count, page, limit) }
}

export async function listPublicAds(position?: string) {
  const now = new Date().toISOString()
  let query = supabaseAdmin
    .from('ads')
    .select('*')
    .eq('status', 'active')
    .is('deleted_at', null)
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gte.${now}`)
    .order('priority', { ascending: false })

  if (position) query = query.eq('position', position)

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getAdById(id: number) {
  const { data, error } = await supabaseAdmin.from('ads').select('*').eq('id', id).single()
  if (error) throw new ApiError(404, 'NOT_FOUND', 'Không tìm thấy quảng cáo')
  return data
}

export async function createAd(data: Record<string, unknown>) {
  const { data: ad, error } = await supabaseAdmin.from('ads').insert(data).select('*').single()
  if (error) throw error
  return ad
}

export async function updateAd(id: number, data: Record<string, unknown>) {
  const { data: ad, error } = await supabaseAdmin
    .from('ads')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error
  return ad
}

export async function softDeleteAd(id: number) {
  const { error } = await supabaseAdmin
    .from('ads')
    .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
  return { id }
}

export async function restoreAd(id: number) {
  const { data, error } = await supabaseAdmin
    .from('ads')
    .update({ deleted_at: null, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error
  return data
}

