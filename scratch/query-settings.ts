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
  const { data, error } = await supabaseAdmin.from('site_settings').select('*').eq('id', 1).single();
  if (error) {
    console.error('Error fetching settings:', error);
  } else {
    console.log('Brand settings:', data.brand);
  }
}

run();
