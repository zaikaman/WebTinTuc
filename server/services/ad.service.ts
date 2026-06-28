import * as adRepository from '@/server/repositories/ad.repository'

export async function listAdminAds(options = {}) {
  return adRepository.listAdminAds(options)
}

export async function listPublicAds(position?: string) {
  return adRepository.listPublicAds(position)
}

export async function getAdById(id: number) {
  return adRepository.getAdById(id)
}

export async function createAd(data: Record<string, unknown>) {
  return adRepository.createAd(data)
}

export async function updateAd(id: number, data: Record<string, unknown>) {
  return adRepository.updateAd(id, data)
}

export async function deleteAd(id: number) {
  return adRepository.softDeleteAd(id)
}

export async function restoreAd(id: number) {
  return adRepository.restoreAd(id)
}

