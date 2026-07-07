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
  const payload = {
    brand: {
      name: 'PATCH Test Name',
      logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=50&fit=crop',
      copyright: 'PATCH Test Copyright',
      socialLinks: [{ label: 'Zalo', href: 'https://zalo.me', platform: 'zalo' }],
      utilityLinks: [{ label: 'Liên hệ quảng cáo', href: '' }]
    },
    footer: {
      address: '246 Lê Đình Cẩn PATCH',
      phone: '0327906965',
      email: 'congtyphdstudio@gmail.com',
      license: 'PATCH License',
      responsible: 'Ông Phạm Hải Đăng'
    }
  };
  
  console.log('Sending PATCH request to localhost:3000/api/admin/settings...');
  try {
    const response = await fetch('http://localhost:3000/api/admin/settings', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-secret': 'admin-api-secret'
      },
      body: JSON.stringify(payload)
    });
    
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response body:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

run();
