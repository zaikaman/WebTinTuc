'use server'

import { revalidatePath } from 'next/cache'
import { requireAdminAccess } from '@/server/auth'
import { runAction } from './action-result'
import * as articleService from '@/server/services/article.service'
import { createArticleSchema, updateArticleSchema } from '@/server/validations/article.schema'
import { clearMemoryCache } from '@/lib/api/news'

export async function createArticleAction(input: unknown, adminSecret?: string | null) {
  return runAction(async () => {
    await requireAdminAccess(adminSecret)
    const article = await articleService.createNewArticle(createArticleSchema.parse(input))
    clearMemoryCache()
    revalidatePath('/')
    revalidatePath('/admin/article')
    return article
  })
}

export async function updateArticleAction(id: number, input: unknown, adminSecret?: string | null) {
  return runAction(async () => {
    await requireAdminAccess(adminSecret)
    const article = await articleService.updateExistingArticle(id, updateArticleSchema.parse(input))
    clearMemoryCache()
    revalidatePath('/')
    revalidatePath('/admin/article')
    return article
  })
}

export async function deleteArticleAction(id: number, adminSecret?: string | null) {
  return runAction(async () => {
    await requireAdminAccess(adminSecret)
    const result = await articleService.deleteExistingArticle(id)
    clearMemoryCache()
    revalidatePath('/')
    revalidatePath('/admin/article')
    return result
  })
}

export async function restoreArticleAction(id: number, adminSecret?: string | null) {
  return runAction(async () => {
    await requireAdminAccess(adminSecret)
    const article = await articleService.restoreExistingArticle(id)
    clearMemoryCache()
    revalidatePath('/')
    revalidatePath('/admin/article')
    return article
  })
}

