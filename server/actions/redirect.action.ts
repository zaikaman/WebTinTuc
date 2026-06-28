'use server'

import { requireAdminAccess } from '@/server/auth'
import { createRedirectSchema, updateRedirectSchema } from '@/server/validations/redirect.schema'
import * as redirectService from '@/server/services/redirect.service'
import { runAction } from './action-result'

export async function createRedirectAction(input: unknown, adminSecret?: string | null) {
  return runAction(async () => {
    await requireAdminAccess(adminSecret)
    return redirectService.createRedirect(createRedirectSchema.parse(input))
  })
}

export async function updateRedirectAction(id: number, input: unknown, adminSecret?: string | null) {
  return runAction(async () => {
    await requireAdminAccess(adminSecret)
    return redirectService.updateRedirect(id, updateRedirectSchema.parse(input))
  })
}

export async function deleteRedirectAction(id: number, adminSecret?: string | null) {
  return runAction(async () => {
    await requireAdminAccess(adminSecret)
    return redirectService.deleteRedirect(id)
  })
}

