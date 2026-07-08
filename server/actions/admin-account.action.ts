'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { requireAdminAccess } from '@/server/auth'
import { createAccountSchema, updateAccountSchema } from '@/server/validations/admin-account.schema'
import * as adminAccountService from '@/server/services/admin-account.service'
import { runAction } from './action-result'

export async function createAdminAccountAction(input: unknown, adminSecret?: string | null) {
  return runAction(async () => {
    await requireAdminAccess(adminSecret)
    const account = await adminAccountService.createAdminAccount(createAccountSchema.parse(input))
    revalidatePath('/admin/accounts')
    revalidateTag('admin-accounts')
    return account
  })
}

export async function updateAdminAccountAction(id: string, input: unknown, adminSecret?: string | null) {
  return runAction(async () => {
    await requireAdminAccess(adminSecret)
    const account = await adminAccountService.updateAdminAccount(id, updateAccountSchema.parse(input))
    revalidatePath('/admin/accounts')
    revalidateTag('admin-accounts')
    return account
  })
}

export async function deleteAdminAccountAction(id: string, adminSecret?: string | null) {
  return runAction(async () => {
    await requireAdminAccess(adminSecret)
    const result = await adminAccountService.deleteAdminAccount(id)
    revalidatePath('/admin/accounts')
    revalidateTag('admin-accounts')
    return result
  })
}
