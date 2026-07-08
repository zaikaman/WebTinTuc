import { unstable_cache } from 'next/cache'
import * as adRepository from '@/server/repositories/ad.repository'

export const listAdminAds = unstable_cache(
  async (options = {}) => {
    return adRepository.listAdminAds(options)
  },
  ['admin-ads-list'],
  { revalidate: 300, tags: ['admin-ads'] }
)

export async function listPublicAds(position?: string) {
  return adRepository.listPublicAds(position)
}

export async function getAdById(id: number) {
  return adRepository.getAdById(id)
}

type AdPayload = {
  name?: string | undefined
  position?: string | undefined
  type?: string | undefined
  media_key?: string | null | undefined
  html_code?: string | null | undefined
  target_url?: string | null | undefined
  starts_at?: string | null | undefined
  ends_at?: string | null | undefined
  status?: 'active' | 'inactive' | undefined
  priority?: number | undefined
}

export async function createAd(data: AdPayload) {
  return adRepository.createAd(data)
}

export async function updateAd(id: number, data: AdPayload) {
  return adRepository.updateAd(id, data)
}

export async function deleteAd(id: number) {
  return adRepository.softDeleteAd(id)
}

export async function restoreAd(id: number) {
  return adRepository.restoreAd(id)
}

