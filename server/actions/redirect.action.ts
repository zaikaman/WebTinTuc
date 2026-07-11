'use server'

import { requireAdminAccess } from '@/server/auth'
import { createRedirectSchema, updateRedirectSchema } from '@/server/validations/redirect.schema'
import * as redirectService from '@/server/services/redirect.service'
import { bumpRedirectCacheVersion } from '@/lib/redirect-cache'
import { runAction } from './action-result'

/**
 * After redirect mutations, bump the shared cache generation so middleware
 * isolates clear their per-process Maps (when Redis is configured). See
 * `lib/redirect-cache.ts` and the JSDoc on middleware's `redirectCache`.
 */
async function purgeMiddlewareRedirectCache(): Promise<void> {
  try {
    await bumpRedirectCacheVersion()
  } catch {
    // Fail-open: TTL still bounds staleness without Redis.
  }
}

export async function createRedirectAction(input: unknown, adminSecret?: string | null) {
  return runAction(async () => {
    await requireAdminAccess(adminSecret)
    const result = await redirectService.createRedirect(createRedirectSchema.parse(input))
    await purgeMiddlewareRedirectCache()
    return result
  })
}

export async function updateRedirectAction(id: number, input: unknown, adminSecret?: string | null) {
  return runAction(async () => {
    await requireAdminAccess(adminSecret)
    const result = await redirectService.updateRedirect(id, updateRedirectSchema.parse(input))
    await purgeMiddlewareRedirectCache()
    return result
  })
}

export async function deleteRedirectAction(id: number, adminSecret?: string | null) {
  return runAction(async () => {
    await requireAdminAccess(adminSecret)
    const result = await redirectService.deleteRedirect(id)
    await purgeMiddlewareRedirectCache()
    return result
  })
}
