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
  const { updateSiteSettings } = await import('../server/repositories/site-settings.repository');
  const lastPayloadPath = path.join(__dirname, '../scratch/last-payload.json');
  if (!fs.existsSync(lastPayloadPath)) {
    console.error('last-payload.json not found!');
    return;
  }
  const payload = JSON.parse(fs.readFileSync(lastPayloadPath, 'utf-8'));
  
  if (payload.brand) {
    payload.brand.logo_url = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=50&fit=crop';
    payload.brand.name = 'WebTinTuc';
  }
  
  console.log('Updating settings repository with modified payload (clean URL)...');
  try {
    const result = await updateSiteSettings(payload);
    console.log('Result from DB after update:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error during update:', error);
  }
}

run();
