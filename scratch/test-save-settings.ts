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
  const { updateSiteSettingsAction } = await import('../server/actions/settings.action');
  
  console.log('Calling updateSiteSettingsAction via Server Action...');
  const result = await updateSiteSettingsAction({
    brand: {
      name: 'WebTinTuc Test Action',
      logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=50&fit=crop',
      copyright: 'Công ty TNHH PHD STUDIO Action',
      socialLinks: [],
      utilityLinks: []
    },
    footer: {
      address: '246 Lê Đình Cẩn Action',
      phone: '0327906965',
      email: 'congtyphdstudio@gmail.com',
      license: 'Số bao nhiêu ??',
      responsible: 'Ông Phạm Hải Đăng'
    }
  }, process.env.ADMIN_API_SECRET);
  
  console.log('Action result:', JSON.stringify(result, null, 2));
}

run();
