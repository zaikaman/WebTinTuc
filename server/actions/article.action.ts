'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { requireAdminAccess } from '@/server/auth'
import { runAction } from './action-result'
import * as articleService from '@/server/services/article.service'
import { createArticleSchema, updateArticleSchema } from '@/server/validations/article.schema'

export async function createArticleAction(input: unknown, adminSecret?: string | null) {
  return runAction(async () => {
    await requireAdminAccess(adminSecret)
    const article = await articleService.createNewArticle(createArticleSchema.parse(input))
    revalidatePath('/')
    revalidatePath('/admin/posts')
    revalidateTag('admin-articles')
    revalidateTag('dashboard')
    return article
  })
}

export async function updateArticleAction(id: number, input: unknown, adminSecret?: string | null) {
  return runAction(async () => {
    await requireAdminAccess(adminSecret)
    const article = await articleService.updateExistingArticle(id, updateArticleSchema.parse(input))
    revalidatePath('/')
    revalidatePath('/admin/posts')
    revalidateTag('admin-articles')
    revalidateTag('dashboard')
    return article
  })
}

export async function deleteArticleAction(id: number, adminSecret?: string | null) {
  return runAction(async () => {
    await requireAdminAccess(adminSecret)
    const result = await articleService.deleteExistingArticle(id)
    revalidatePath('/')
    revalidatePath('/admin/posts')
    revalidateTag('admin-articles')
    revalidateTag('dashboard')
    return result
  })
}

export async function restoreArticleAction(id: number, adminSecret?: string | null) {
  return runAction(async () => {
    await requireAdminAccess(adminSecret)
    const article = await articleService.restoreExistingArticle(id)
    revalidatePath('/')
    revalidatePath('/admin/posts')
    revalidateTag('admin-articles')
    revalidateTag('dashboard')
    return article
  })
}
