import { generateSlug } from '@/lib/format/slug'
import * as articleRepository from '@/server/repositories/article.repository'
import * as categoryRepository from '@/server/repositories/category.repository'
import * as redirectRepository from '@/server/repositories/redirect.repository'

type ArticlePayload = Record<string, any>

function normalizeArticlePayload(data: ArticlePayload) {
  const status = data.status ?? (data.published === true ? 'published' : data.published === false ? 'draft' : undefined)
  const payload: ArticlePayload = { ...data, status }

  delete payload.published

  if (!payload.slug && payload.title) payload.slug = generateSlug(payload.title)
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
  return articleRepository.createArticle(normalizeArticlePayload(data))
}

export async function updateExistingArticle(id: number, data: ArticlePayload) {
  const before = await articleRepository.getAdminArticleById(id)
  const updated = await articleRepository.updateArticle(id, normalizeArticlePayload(data))

  if (data.slug && before.slug !== data.slug) {
    await redirectRepository.upsertRedirect({
      from_path: `/articles/${before.slug}`,
      to_path: `/articles/${data.slug}`,
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
