import * as fs from 'fs'
import * as path from 'path'
import { updateSiteSettingsSchema } from '../server/validations/site-settings.schema'

const lastPayloadPath = path.join(__dirname, '../scratch/last-payload.json');
if (fs.existsSync(lastPayloadPath)) {
  const raw = fs.readFileSync(lastPayloadPath, 'utf-8');
  const parsed = JSON.parse(raw);
  
  console.log('Original Brand keys:', Object.keys(parsed.brand || {}));
  try {
    const validated = updateSiteSettingsSchema.parse(parsed);
    console.log('Validated Brand keys:', Object.keys(validated.brand || {}));
    console.log('Validated brand.name:', validated.brand?.name);
    console.log('Validated brand.logo_url exists:', !!validated.brand?.logo_url);
  } catch (e) {
    console.error('Zod validation error:', e);
  }
} else {
  console.log('No last-payload.json found.');
}
