import { MetadataRoute } from 'next'
import * as categoryService from '@/server/services/category.service';
import * as articleService from '@/server/services/article.service';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com'

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  // Homepage
  entries.push({
    url: siteUrl,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1.0
  })

  try {
    // Categories
    const categoriesData = await categoryService.listPublicCategories(100);
    const categories = Array.isArray(categoriesData) ? categoriesData : [];
    for (const cat of categories) {
      if (cat.deleted_at) continue;
      entries.push({
        url: `${siteUrl}/${cat.slug}`,
        lastModified: cat.updated_at ? new Date(cat.updated_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.7
      })
    }

    // Articles — only published, not deleted
    const articlesData = await articleService.listPublicArticles({ limit: 1000 });
    const articles = articlesData?.items || [];
    for (const article of articles) {
      // listPublicArticles already filters published + non-deleted
      if (article.status !== 'published') continue;
      entries.push({
        url: `${siteUrl}/posts/${article.slug}`,
        lastModified: article.updated_at ? new Date(article.updated_at) : new Date(article.published_at ?? Date.now()),
        changeFrequency: 'weekly',
        priority: 0.8
      })
    }
  } catch (error) {
    console.error("Sitemap generation error:", error);
  }

  return entries
}
