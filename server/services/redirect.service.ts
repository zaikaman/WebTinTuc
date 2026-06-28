import { ApiError } from '@/server/http'
import * as redirectRepository from '@/server/repositories/redirect.repository'

async function flattenTarget(fromPath: string, toPath: string) {
  if (fromPath === toPath) {
    throw new ApiError(400, 'BAD_REQUEST', 'Redirect không được trỏ về chính nó')
  }

  const next = await redirectRepository.findRedirectByPath(toPath)
  if (next?.to_path === fromPath) {
    throw new ApiError(400, 'BAD_REQUEST', 'Redirect tạo vòng lặp')
  }

  return next?.to_path ?? toPath
}

export async function listRedirects(options = {}) {
  return redirectRepository.listRedirects(options)
}

export async function getRedirectById(id: number) {
  return redirectRepository.getRedirectById(id)
}

export async function createRedirect(data: { from_path: string; to_path: string; status_code?: number }) {
  return redirectRepository.upsertRedirect({
    ...data,
    to_path: await flattenTarget(data.from_path, data.to_path)
  })
}

export async function updateRedirect(id: number, data: Record<string, any>) {
  if (data.from_path && data.to_path) data.to_path = await flattenTarget(data.from_path, data.to_path)
  return redirectRepository.updateRedirect(id, data)
}

export async function deleteRedirect(id: number) {
  return redirectRepository.deleteRedirect(id)
}

