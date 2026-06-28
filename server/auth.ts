import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { ApiError } from './http'

export async function requireAdmin(request: NextRequest) {
  const configuredSecret = process.env.ADMIN_API_SECRET
  const providedSecret = request.headers.get('x-admin-secret')

  return requireAdminAccess(providedSecret)
}

export async function requireAdminAccess(providedSecret?: string | null) {
  // ==========================================
  // ⚠️ TẠM THỜI VÔ HIỆU HÓA AUTH ĐỂ TEST TRIỆT ĐỂ:
  // Hãy comment dòng dưới đây lại khi muốn bật lại auth!
  return { id: '00000000-0000-0000-0000-000000000001', role: 'admin' }
  // ==========================================
  /*
    const configuredSecret = process.env.ADMIN_API_SECRET
  
  
    if (configuredSecret && providedSecret === configuredSecret) {
      return { id: 'admin-api-secret', role: 'admin' }
    }
  
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
  
    if (profileError || !profile || !['admin', 'editor'].includes(profile.role)) {
      throw new ApiError(403, 'FORBIDDEN', 'Tài khoản không có quyền quản trị')
    }
  
    return { id: userData.user.id, role: profile.role as 'admin' | 'editor' }
    */
}
