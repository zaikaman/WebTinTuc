import * as fs from 'fs'
import * as path from 'path'

// Read and parse .env.local
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  for (const line of envConfig.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const parts = trimmed.split('=');
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      process.env[key] = val;
    }
  }
}

async function run() {
  const { supabaseAdmin } = await import('../lib/supabase/admin');
  
  // First fetch current settings
  const { data: current } = await supabaseAdmin.from('site_settings').select('*').eq('id', 1).single();
  console.log('Current brand before manual update:', current.brand);
  
  const updatedBrand = {
    ...current.brand,
    name: 'WebTinTuc',
    logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=50&fit=crop'
  };
  
  const { data: updated, error } = await supabaseAdmin
    .from('site_settings')
    .update({ brand: updatedBrand })
    .eq('id', 1)
    .select('*')
    .single();
    
  if (error) {
    console.error('Error updating:', error);
  } else {
    console.log('Updated brand settings:', updated.brand);
  }
}

run();
