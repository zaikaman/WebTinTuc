'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { requireAdminAccess } from '@/server/auth'
import { updateSiteSettingsSchema } from '@/server/validations/site-settings.schema'
import * as settingsService from '@/server/services/site-settings.service'
import { runAction } from './action-result'
import { clearMemoryCache } from '@/lib/api/news'

export async function updateSiteSettingsAction(input: unknown, adminSecret?: string | null) {
  return runAction(async () => {
    await requireAdminAccess(adminSecret)
    console.log('=== UPDATE SETTINGS ACTION INPUT ===');
    console.log(JSON.stringify(input, null, 2));
    console.log('====================================');
    try {
      const fs = require('fs');
      const path = require('path');
      fs.writeFileSync(path.join(process.cwd(), 'scratch/last-payload.json'), JSON.stringify(input, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write last-payload.json:', e);
    }
    const settings = await settingsService.updateSiteSettings(updateSiteSettingsSchema.parse(input))
    clearMemoryCache()
    revalidateTag('site-settings')
    revalidateTag('settings')
    revalidatePath('/')
    return settings
  })
}

