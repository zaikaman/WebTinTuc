import { supabaseAdmin } from '@/lib/supabase/admin'

export async function getSiteSettings() {
  const { data, error } = await supabaseAdmin.from('site_settings').select('*').eq('id', 1).single()
  if (error) throw error
  return data
}

export async function updateSiteSettings(data: Record<string, unknown>) {
  const { data: settings, error } = await supabaseAdmin
    .from('site_settings')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', 1)
    .select('*')
    .single()

  if (error) throw error
  return settings
}

