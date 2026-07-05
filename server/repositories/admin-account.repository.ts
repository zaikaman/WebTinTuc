import { supabaseAdmin } from '@/lib/supabase/admin'
import { ApiError } from '@/server/http'
import { pageMeta, toRange } from '@/server/validations/common.schema'

type AccountListOptions = {
  page?: number
  limit?: number
  search?: string
}

export async function listAdminAccounts(options: AccountListOptions = {}) {
  const page = options.page ?? 1
  const limit = options.limit ?? 20

  // 1. Fetch profiles with role = 'admin'
  let query = supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('role', 'admin')

  if (options.search) {
    query = query.or(`username.ilike.%${options.search}%,display_name.ilike.%${options.search}%`)
  }

  const { data: profiles, error: profileError } = await query
  if (profileError) throw profileError

  // 2. Fetch all auth users to match emails
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers()
  if (authError) throw authError

  const userMap = new Map(authData.users.map(u => [u.id, u.email]))

  // 3. Merge profiles and auth emails
  let mergedItems = (profiles || []).map(p => ({
    id: p.id,
    username: p.username,
    display_name: p.display_name,
    avatar_key: p.avatar_key,
    role: p.role,
    created_at: p.created_at,
    updated_at: p.updated_at,
    email: userMap.get(p.id) || null
  }))

  // If search query is provided, check if it matches the email address in memory
  if (options.search) {
    const searchLower = options.search.toLowerCase()
    mergedItems = mergedItems.filter(item => 
      item.username?.toLowerCase().includes(searchLower) ||
      item.display_name?.toLowerCase().includes(searchLower) ||
      item.email?.toLowerCase().includes(searchLower)
    )
  }

  // 4. Sort by created_at desc (newest first)
  mergedItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  // 5. Paginate in-memory
  const count = mergedItems.length
  const { from, to } = toRange(page, limit)
  const items = mergedItems.slice(from, to + 1)

  return {
    items,
    meta: pageMeta(count, page, limit)
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
  const { email, password, username, display_name, role = 'admin' } = data

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
  const { email, password, username, display_name, role } = data

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

  // 2. Update profile details
  const profileUpdates: any = {
    updated_at: new Date().toISOString()
  }
  if (username) profileUpdates.username = username
  if (display_name) profileUpdates.display_name = display_name
  if (role) profileUpdates.role = role

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

export async function deleteAdminAccount(id: string) {
  // 1. Delete profile first
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .delete()
    .eq('id', id)
  
  if (profileError) {
    console.error("Error deleting profile:", profileError)
  }

  // 2. Delete auth user
  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id)
  if (authError) {
    throw new ApiError(400, 'BAD_REQUEST', authError.message)
  }

  return { id }
}
