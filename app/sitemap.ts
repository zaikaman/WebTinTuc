import { MetadataRoute } from 'next'
import * as categoryService from '@/server/services/category.service'
import * as articleService from '@/server/services/article.service'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com'

/**
 * Page size for listing articles for the sitemap.
 * Keep at or below PostgREST/Supabase max_rows (default 1000) so each request
 * returns a full page instead of being silently truncated.
 */
const ARTICLE_PAGE_SIZE = 1000

export const revalidate = 3600

type SitemapArticle = {
  slug: string
  status?: string | null
  updated_at?: string | null
  published_at?: string | null
}

/**
 * Fetch every published, non-deleted article by walking pages until exhausted.
 * Avoids the previous hard cap of 1000 URLs that omitted older posts.
 */
async function listAllPublicArticlesForSitemap(): Promise<SitemapArticle[]> {
  const articles: SitemapArticle[] = []
  let page = 1

  while (true) {
    const result = await articleService.listPublicArticles({
      page,
      limit: ARTICLE_PAGE_SIZE,
    })
    const items = (result?.items ?? []) as SitemapArticle[]
    articles.push(...items)

    if (items.length === 0) break
    if (items.length < ARTICLE_PAGE_SIZE) break

    const totalPages = result?.meta?.totalPages
    if (typeof totalPages === 'number' && page >= totalPages) break

    page += 1
  }

  return articles
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  // Homepage
  entries.push({
    url: siteUrl,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1.0,
  })

  try {
    // Categories
    const categoriesData = await categoryService.listPublicCategories(100)
    const categories = Array.isArray(categoriesData) ? categoriesData : []
    for (const cat of categories) {
      if (cat.deleted_at) continue
      entries.push({
        url: `${siteUrl}/${cat.slug}`,
        lastModified: cat.updated_at ? new Date(cat.updated_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    }

    // Articles — all published, not deleted (paginated, no hard cap)
    const articles = await listAllPublicArticlesForSitemap()
    for (const article of articles) {
      // listPublicArticles already filters published + non-deleted
      if (article.status !== 'published') continue
      entries.push({
        url: `${siteUrl}/posts/${article.slug}`,
        lastModified: article.updated_at
          ? new Date(article.updated_at)
          : new Date(article.published_at ?? Date.now()),
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    }
  } catch (error) {
    console.error('Sitemap generation error:', error)
  }

  return entries
}
