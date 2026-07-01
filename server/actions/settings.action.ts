'use server'

import { revalidatePath } from 'next/cache'
import { requireAdminAccess } from '@/server/auth'
import { updateSiteSettingsSchema } from '@/server/validations/site-settings.schema'
import * as settingsService from '@/server/services/site-settings.service'
import { runAction } from './action-result'
import { clearMemoryCache } from '@/lib/api/news'

export async function updateSiteSettingsAction(input: unknown, adminSecret?: string | null) {
  return runAction(async () => {
    await requireAdminAccess(adminSecret)
    const settings = await settingsService.updateSiteSettings(updateSiteSettingsSchema.parse(input))
    clearMemoryCache()
    revalidatePath('/')
    return settings
  })
}

