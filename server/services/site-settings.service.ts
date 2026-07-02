import { unstable_cache } from 'next/cache'
import * as settingsRepository from '@/server/repositories/site-settings.repository'

export const getSiteSettings = unstable_cache(
  async () => settingsRepository.getSiteSettings(),
  ['site-settings'],
  { revalidate: 60, tags: ['site-settings'] }
)

export async function updateSiteSettings(data: {
  brand?: Record<string, unknown> | undefined
  footer?: Record<string, unknown> | undefined
}) {
  return settingsRepository.updateSiteSettings(data)
}
