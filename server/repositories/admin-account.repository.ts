import { supabaseAdmin } from '@/lib/supabase/admin'
import { ApiError } from '@/server/http'
import { orIlikeContains } from '@/server/lib/postgrest'
import { pageMeta, toRange } from '@/server/validations/common.schema'

type AccountListOptions = {
  page?: number
  limit?: number
  search?: string
}

export async function listAdminAccounts(options: AccountListOptions = {}) {
  const page = options.page ?? 1
  const limit = options.limit ?? 20

  // Build profiles query with role = 'admin'
  let query = supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact' })
    .eq('role', 'admin')

  if (options.search) {
    query = query.or(orIlikeContains(['username', 'display_name'], options.search))
  }

  // Apply sorting (newest first)
  query = query.order('created_at', { ascending: false })

  let profiles: any[]
  let totalCount: number | null

  if (options.search) {
    // When searching, fetch ALL matching profiles first (in-memory email filter may be needed)
    const { data, error, count } = await query
    if (error) throw error
    profiles = data || []
    totalCount = count
  } else {
    // No search: apply DB-level pagination — only fetch the current page
    const { from, to } = toRange(page, limit)
    const { data, error, count } = await query.range(from, to)
    if (error) throw error
    profiles = data || []
    totalCount = count
  }

  // Fetch auth user emails ONLY for the profiles in this result set
  const profileIds = profiles.map(p => p.id)
  const emailMap = new Map<string, string | null>()

  if (profileIds.length > 0) {
    const authResults = await Promise.all(
      profileIds.map(id =>
        supabaseAdmin.auth.admin.getUserById(id)
          .then(({ data, error }) => ({
            id,
            email: data?.user?.email || null,
            error
          }))
      )
    )
    // Silently handle individual lookup errors (one bad user shouldn't break the list)
    for (const result of authResults) {
      emailMap.set(result.id, result.email)
    }
  }

  // Merge profiles and auth emails
  let mergedItems = profiles.map(p => ({
    id: p.id,
    username: p.username,
    display_name: p.display_name,
    avatar_key: p.avatar_key,
    role: p.role,
    created_at: p.created_at,
    updated_at: p.updated_at,
    email: emailMap.get(p.id) || null
  }))

  // If search is provided, also filter by email address in memory
  // (username/display_name were already filtered at the DB level)
  if (options.search) {
    const searchLower = options.search.toLowerCase()
    mergedItems = mergedItems.filter(item =>
      item.email?.toLowerCase().includes(searchLower)
    )

    // Apply in-memory pagination on search results
    totalCount = mergedItems.length
    const { from, to } = toRange(page, limit)
    mergedItems = mergedItems.slice(from, to + 1)
  }

  return {
    items: mergedItems,
    meta: pageMeta(totalCount ?? mergedItems.length, page, limit)
  }
}

export async function getAdminAccountById(id: string) {
  // Fetch profile
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (profileError) throw new ApiError(404, 'NOT_FOUND', 'Không tìm thấy tài khoản')

  // Fetch auth user
  const { data: { user }, error: authError } = await supabaseAdmin.auth.admin.getUserById(id)
  if (authError) throw authError

  return {
    ...profile,
    email: user?.email || null
  }
}

export async function createAdminAccount(data: any) {
  const { email, password, username, display_name } = data
  // Multi-role (e.g. editor) is not implemented — always create admin accounts.
  const role = 'admin'

  // Check if profile username already exists in profiles table
  const { data: existingProfile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('username', username)
    .maybeSingle()

  if (existingProfile) {
    throw new ApiError(400, 'BAD_REQUEST', 'Tên đăng nhập đã tồn tại')
  }

  // 1. Create in auth
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  })

  if (authError) {
    throw new ApiError(400, 'BAD_REQUEST', authError.message)
  }

  if (!authUser.user) {
    throw new ApiError(500, 'INTERNAL_ERROR', 'Không thể tạo tài khoản auth')
  }

  // 2. Insert profile
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .upsert({
      id: authUser.user.id,
      username,
      display_name,
      role,
      updated_at: new Date().toISOString()
    })
    .select('*')
    .single()

  if (profileError) {
    // Cleanup by deleting the auth user if profile insert fails
    await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
    throw profileError
  }

  return {
    ...profile,
    email: authUser.user.email
  }
}

export async function updateAdminAccount(id: string, data: any) {
  // role is intentionally ignored — multi-role is not ready; never demote/promote via API.
  const { email, password, username, display_name } = data

  // If username is changing, check for uniqueness
  if (username) {
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('username', username)
      .neq('id', id)
      .maybeSingle()

    if (existingProfile) {
      throw new ApiError(400, 'BAD_REQUEST', 'Tên đăng nhập đã tồn tại')
    }
  }

  // 1. Update auth details if provided (email, password)
  const authUpdates: any = {}
  if (email) authUpdates.email = email
  if (password) authUpdates.password = password

  if (Object.keys(authUpdates).length > 0) {
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, authUpdates)
    if (authError) {
      throw new ApiError(400, 'BAD_REQUEST', authError.message)
    }
  }

  // 2. Update profile details (never accept role changes from client)
  const profileUpdates: any = {
    updated_at: new Date().toISOString()
  }
  if (username) profileUpdates.username = username
  if (display_name) profileUpdates.display_name = display_name

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .update(profileUpdates)
    .eq('id', id)
    .select('*')
    .single()

  if (profileError) throw profileError

  // Fetch updated auth user
  const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(id)

  return {
    ...profile,
    email: user?.email || null
  }
}

export type DeleteAdminAccountOptions = {
  /** Authenticated actor performing the delete (session user id). */
  actorId?: string
  /** Required when actor deletes their own account. */
  confirmSelfDelete?: boolean
}

export async function deleteAdminAccount(id: string, options: DeleteAdminAccountOptions = {}) {
  const { actorId, confirmSelfDelete = false } = options

  const { data: target, error: targetError } = await supabaseAdmin
    .from('profiles')
    .select('id, role')
    .eq('id', id)
    .maybeSingle()

  if (targetError) throw targetError
  if (!target) {
    throw new ApiError(404, 'NOT_FOUND', 'Không tìm thấy tài khoản')
  }

  const isSelfDelete =
    Boolean(actorId) && actorId !== 'admin-api-secret' && actorId === id

  // Last-admin guard: never remove the final admin profile (permanent lockout).
  if (target.role === 'admin') {
    const { count, error: countError } = await supabaseAdmin
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'admin')

    if (countError) throw countError
    if ((count ?? 0) <= 1) {
      throw new ApiError(
        400,
        'BAD_REQUEST',
        'Không thể xóa admin cuối cùng. Hệ thống cần ít nhất một tài khoản quản trị.'
      )
    }
  }

  // Self-delete requires explicit confirmation and (via last-admin guard) another admin.
  if (isSelfDelete && !confirmSelfDelete) {
    throw new ApiError(
      400,
      'BAD_REQUEST',
      'Xóa tài khoản của chính bạn cần xác nhận rõ ràng. Vui lòng xác nhận lại thao tác.'
    )
  }

  // 1. Delete profile first
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .delete()
    .eq('id', id)

  if (profileError) {
    throw new ApiError(400, 'BAD_REQUEST', 'Không thể xóa hồ sơ tài khoản')
  }

  // 2. Delete auth user
  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id)
  if (authError) {
    throw new ApiError(400, 'BAD_REQUEST', authError.message)
  }

  return { id }
}
