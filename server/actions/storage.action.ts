'use server'

import { requireAdminAccess } from '@/server/auth'
import { storageKeySchema, storageMoveSchema } from '@/server/validations/storage.schema'
import { copyFileInR2, deleteFileFromR2, moveFileInR2, uploadFileToR2, createFolderInR2 } from '@/server/services/storage.service'
import { z } from 'zod'
import { runAction } from './action-result'

export async function uploadFileAction(formData: FormData, adminSecret?: string | null) {
  return runAction(async () => {
    await requireAdminAccess(adminSecret)
    const file = formData.get('file') as File | null
    const folder = String(formData.get('folder') || 'articles')

    if (!file) {
      throw new Error('Thiếu file upload')
    }

    return uploadFileToR2(file, folder)
  })
}

export async function deleteFileAction(input: unknown, adminSecret?: string | null) {
  return runAction(async () => {
    await requireAdminAccess(adminSecret)
    const { key } = storageKeySchema.parse(input)
    return deleteFileFromR2(key)
  })
}

export async function moveFileAction(input: unknown, adminSecret?: string | null) {
  return runAction(async () => {
    await requireAdminAccess(adminSecret)
    const { fromKey, toKey } = storageMoveSchema.parse(input)
    return moveFileInR2(fromKey, toKey)
  })
}

export async function copyFileAction(input: unknown, adminSecret?: string | null) {
  return runAction(async () => {
    await requireAdminAccess(adminSecret)
    const { fromKey, toKey } = storageMoveSchema.parse(input)
    return copyFileInR2(fromKey, toKey)
  })
}


export async function createFolderAction(input: unknown, adminSecret?: string | null) {
  return runAction(async () => {
    await requireAdminAccess(adminSecret)
    const { folderName, parentPrefix } = z.object({
      folderName: z.string().min(1),
      parentPrefix: z.string().default('')
    }).parse(input)
    return createFolderInR2(folderName, parentPrefix)
  })
}
