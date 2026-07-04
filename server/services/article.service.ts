import { generateSlug } from '@/lib/format/slug'
import * as articleRepository from '@/server/repositories/article.repository'
import * as categoryRepository from '@/server/repositories/category.repository'
import * as redirectRepository from '@/server/repositories/redirect.repository'

type ArticlePayload = {
  title?: string | undefined
  slug?: string | undefined
  summary?: string | null | undefined
  content?: unknown
  thumbnail_key?: string | null | undefined
  category_id?: number | null | undefined
  featured?: boolean | undefined
  status?: 'draft' | 'published' | undefined
  published?: boolean | undefined
  published_at?: string | null | undefined
  author_id?: string | null | undefined
  seo_title?: string | null | undefined
  seo_description?: string | null | undefined
}

function normalizeArticlePayload(data: ArticlePayload, isUpdate = false) {
  const status = data.status ?? (data.published === true ? 'published' : data.published === false ? 'draft' : undefined)
  const payload: ArticlePayload = { ...data, status }
  delete (payload as Record<string, unknown>).published

  // Only auto-generate slug on create if not provided
  if (!isUpdate && !payload.slug && payload.title) {
    payload.slug = generateSlug(payload.title)
  }

  if (payload.status === 'published' && !payload.published_at) payload.published_at = new Date().toISOString()
  if (payload.status === 'draft') payload.published_at = payload.published_at ?? null

  return payload
}

export async function listAdminArticles(options = {}) {
  return articleRepository.listAdminArticles(options)
}

export async function listPublicArticles(options = {}) {
  return articleRepository.listPublicArticles(options)
}

export async function getAdminArticleById(id: number) {
  return articleRepository.getAdminArticleById(id)
}

export async function getArticleBySlug(slug: string) {
  return articleRepository.getPublicArticleBySlug(slug)
}

export async function createNewArticle(data: ArticlePayload) {
  return articleRepository.createArticle(normalizeArticlePayload(data, false))
}

export async function updateExistingArticle(id: number, data: ArticlePayload) {
  const before = await articleRepository.getAdminArticleById(id)
  if (!before) {
    throw new Error('Article not found')
  }

  const updatePayload = { ...data }

  // If title changed, generate a new slug. If slug was explicitly provided, use it.
  if (data.title && before.title !== data.title) {
    updatePayload.slug = data.slug || generateSlug(data.title)
  } else if (data.slug && before.slug !== data.slug) {
    updatePayload.slug = data.slug
  } else {
    // Prevent accidental slug change if slug wasn't explicitly provided/changed
    delete updatePayload.slug
  }

  const normalized = normalizeArticlePayload(updatePayload, true)
  const updated = await articleRepository.updateArticle(id, normalized)

  // Create 301 redirect if slug actually changed
  const finalSlug = normalized.slug
  if (finalSlug && before.slug !== finalSlug) {
    await redirectRepository.upsertRedirect({
      from_path: `/posts/${before.slug}`,
      to_path: `/posts/${finalSlug}`,
      status_code: 301
    })
  }

  return updated
}

export async function deleteExistingArticle(id: number) {
  return articleRepository.softDeleteArticle(id)
}

export async function restoreExistingArticle(id: number) {
  return articleRepository.restoreArticle(id)
}

export async function getRelatedArticles(slug: string, limit = 6) {
  const article = await articleRepository.getPublicArticleBySlug(slug)
  return articleRepository.listRelatedArticles(article, limit)
}

export async function getFeaturedArticles(limit = 6) {
  return articleRepository.listFeaturedArticles(limit)
}

export async function searchArticles(query: string, page = 1, limit = 10) {
  return articleRepository.searchArticles(query, page, limit)
}

export async function getTrendingArticles(limit = 10) {
  return articleRepository.listTrendingArticles(limit)
}

export async function getArticlesOptions(options: any = {}) {
  const normalized = {
    ...options,
    limit: options.limit ? Number(options.limit) : undefined,
    status: options.published === true || options.published === 'true' ? 'published' : options.status,
    featured: options.featured
  }

  const result = await articleRepository.listPublicArticles(normalized)
  return result.items
}

/**
 * Lấy danh sách bài viết theo category slug.
 * Trả về { category, articles: { items, meta } } để FE dùng làm CategoryFeed.
 */
export async function getArticlesByCategorySlug(
  categorySlug: string,
  options: { page?: number; limit?: number } = {}
) {
  const category = await categoryRepository.getPublicCategoryBySlug(categorySlug)

  const result = await articleRepository.listPublicArticles({
    category: categorySlug,
    page: options.page ?? 1,
    limit: options.limit ?? 20,
  })

  return {
    category,
    articles: result,
  }
}
