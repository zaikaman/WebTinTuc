'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { requireAdminAccess } from '@/server/auth'
import { runAction } from './action-result'
import * as articleService from '@/server/services/article.service'
import { createArticleSchema, updateArticleSchema } from '@/server/validations/article.schema'

type ArticleForRevalidation = {
  slug?: string | null
  categories?: { slug?: string | null } | { slug?: string | null }[] | null
} | null | undefined

function getCategorySlug(article: ArticleForRevalidation): string | undefined {
  if (!article?.categories) return undefined
  const cat = article.categories
  if (Array.isArray(cat)) return cat[0]?.slug ?? undefined
  return cat.slug ?? undefined
}

/** Bust admin + public article caches and related paths after mutations. */
function revalidateArticleCaches(article?: ArticleForRevalidation, previousSlug?: string | null) {
  revalidatePath('/')
  revalidatePath('/admin/posts')
  revalidateTag('admin-articles')
  revalidateTag('dashboard')
  // Public unstable_cache tags used by lib/api/news.ts
  revalidateTag('articles')

  const slug = article?.slug
  if (slug) {
    revalidatePath(`/posts/${slug}`)
  }
  // When slug changes, also clear the old post route
  if (previousSlug && previousSlug !== slug) {
    revalidatePath(`/posts/${previousSlug}`)
  }

  const categorySlug = getCategorySlug(article)
  if (categorySlug) {
    revalidatePath(`/${categorySlug}`)
  }
}

export async function createArticleAction(input: unknown, adminSecret?: string | null) {
  return runAction(async () => {
    await requireAdminAccess(adminSecret)
    const article = await articleService.createNewArticle(createArticleSchema.parse(input))
    revalidateArticleCaches(article)
    return article
  })
}

export async function updateArticleAction(id: number, input: unknown, adminSecret?: string | null) {
  return runAction(async () => {
    await requireAdminAccess(adminSecret)
    // Capture previous slug so we can revalidate the old post path if it changes
    const before = await articleService.getAdminArticleById(id)
    const article = await articleService.updateExistingArticle(id, updateArticleSchema.parse(input))
    revalidateArticleCaches(article, before?.slug)
    return article
  })
}

export async function deleteArticleAction(id: number, adminSecret?: string | null) {
  return runAction(async () => {
    await requireAdminAccess(adminSecret)
    const result = await articleService.deleteExistingArticle(id)
    revalidateArticleCaches(result)
    return result
  })
}

export async function restoreArticleAction(id: number, adminSecret?: string | null) {
  return runAction(async () => {
    await requireAdminAccess(adminSecret)
    const article = await articleService.restoreExistingArticle(id)
    revalidateArticleCaches(article)
    return article
  })
}
