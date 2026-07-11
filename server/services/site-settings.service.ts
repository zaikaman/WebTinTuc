import { unstable_cache } from 'next/cache'
import * as settingsRepository from '@/server/repositories/site-settings.repository'

/** Always-fresh settings for admin panel. */
export async function getSiteSettings() {
  return settingsRepository.getSiteSettings()
}

/**
 * Cached settings for public/site consumers.
 * Admin must use getSiteSettings() instead so branding edits show immediately.
 */
export const getPublicSiteSettings = unstable_cache(
  async () => settingsRepository.getSiteSettings(),
  ['site-settings'],
  { revalidate: 60, tags: ['site-settings', 'settings'] }
)

export async function updateSiteSettings(data: {
  brand?: Record<string, unknown> | undefined
  footer?: Record<string, unknown> | undefined
}) {
  return settingsRepository.updateSiteSettings(data)
}
