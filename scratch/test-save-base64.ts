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
  
  // A small 1x1 transparent PNG Base64
  const smallBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  
  console.log('Attempting to save small Base64 image directly to repo...');
  try {
    const result = await updateSiteSettings({
      brand: {
        name: 'WebTinTuc',
        logo_url: smallBase64,
        copyright: 'Công ty TNHH PHD STUDIO',
        socialLinks: [],
        utilityLinks: []
      },
      footer: {
        address: '246 Lê Đình Cẩn',
        phone: '0327906965',
        email: 'congtyphdstudio@gmail.com',
        license: 'Số bao nhiêu ??',
        responsible: 'Ông Phạm Hải Đăng'
      }
    });
    console.log('Success! Saved brand settings:', result.brand);
  } catch (error) {
    console.error('Error saving:', error);
  }
}

run();
