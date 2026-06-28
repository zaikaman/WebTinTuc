'use server'

import { revalidatePath } from 'next/cache'
import { requireAdminAccess } from '@/server/auth'
import { createAdSchema, updateAdSchema } from '@/server/validations/ad.schema'
import * as adService from '@/server/services/ad.service'
import { runAction } from './action-result'

export async function createAdAction(input: unknown, adminSecret?: string | null) {
  return runAction(async () => {
    await requireAdminAccess(adminSecret)
    const ad = await adService.createAd(createAdSchema.parse(input))
    revalidatePath('/')
    return ad
  })
}

export async function updateAdAction(id: number, input: unknown, adminSecret?: string | null) {
  return runAction(async () => {
    await requireAdminAccess(adminSecret)
    const ad = await adService.updateAd(id, updateAdSchema.parse(input))
    revalidatePath('/')
    return ad
  })
}

export async function deleteAdAction(id: number, adminSecret?: string | null) {
  return runAction(async () => {
    await requireAdminAccess(adminSecret)
    const result = await adService.deleteAd(id)
    revalidatePath('/')
    return result
  })
}

export async function restoreAdAction(id: number, adminSecret?: string | null) {
  return runAction(async () => {
    await requireAdminAccess(adminSecret)
    const ad = await adService.restoreAd(id)
    revalidatePath('/')
    return ad
  })
}

