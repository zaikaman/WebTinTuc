import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { ApiError } from '@/server/http'

export async function requireAdmin(request: NextRequest) {
  const providedSecret = request.headers.get('x-admin-secret')
  return requireAdminAccess(providedSecret)
}

export async function requireAdminAccess(providedSecret?: string | null) {
  const configuredSecret = process.env.ADMIN_API_SECRET

  // Cho phép API secret (dùng cho cron job / QStash)
  if (configuredSecret && providedSecret === configuredSecret) {
    return { id: 'admin-api-secret', role: 'admin' }
  }

  // Xác thực qua Supabase session cookie
  const supabase = await createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Bạn cần đăng nhập để dùng API admin')
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id, role')
    .eq('id', userData.user.id)
    .single()

  if (profileError || !profile || profile.role !== 'admin') {
    throw new ApiError(403, 'FORBIDDEN', 'Tài khoản không có quyền quản trị')
  }

  return { id: userData.user.id, role: profile.role as 'admin' }
}
