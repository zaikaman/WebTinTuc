import { unstable_cache } from 'next/cache';
import * as siteSettingsService from '@/server/services/site-settings.service';
import * as categoryService from '@/server/services/category.service';
import * as articleService from '@/server/services/article.service';
import type {
  Article,
  CategoryFeed,
  HomeFeed,
  PostRecommendations,
  SiteSettings,
  NavigationItem,
} from "@/lib/types/news";

export function mapBackendArticleToFrontend(data: any): Article {
  return {
    id: data.slug || data.id?.toString() || "",
    title: data.title || "",
    category: data.category?.name || data.category || data.categories?.name || "Tin tức",
    categorySlug: data.category?.slug || data.categories?.slug || undefined,
    time: data.published_at || data.created_at || new Date().toISOString(),
    image: data.thumbnail_key || "",
    intro: data.summary || undefined,
    content: data.content?.blocks || data.content || undefined,
  };
}

export const getSiteSettings = unstable_cache(
  async (): Promise<{ settings: SiteSettings, categories: NavigationItem[] }> => {
    try {
      const [settingsData, categoriesData] = await Promise.all([
        siteSettingsService.getSiteSettings(),
        categoryService.listPublicCategories(20)
      ]);

      const data = settingsData || {};
      const categoriesItems = Array.isArray(categoriesData) ? categoriesData : [];
      
      const dynamicPrimaryLinks = categoriesItems
        .slice(0, 6)
        .map((cat: any) => ({
            label: cat.name.toUpperCase(),
            href: `/${cat.slug}`,
          }));

      return {
        settings: {
          brand: {
            name: data?.brand?.name || "WebTinTuc",
            tagline: data?.brand?.tagline || "",
            footerDescription: data?.brand?.footerDescription || "",
            copyright: data?.brand?.copyright || "",
            searchPlaceholder: data?.brand?.searchPlaceholder || "Tìm kiếm...",
            utilityLinks: data?.brand?.utilityLinks || [],
            socialLinks: data?.brand?.socialLinks || [],
          },
          footer: {
            columns: data?.footer?.columns || [],
          }
        },
        categories: dynamicPrimaryLinks
      };
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      return {
        settings: {
          brand: { name: "WebTinTuc", tagline: "", footerDescription: "", copyright: "", searchPlaceholder: "Tìm kiếm...", utilityLinks: [], socialLinks: [] },
          footer: { columns: [] }
        },
        categories: []
      };
    }
  },
  ['getSiteSettings'],
  { revalidate: 60, tags: ['settings', 'categories'] }
);

export const getHomeFeed = unstable_cache(
  async (): Promise<HomeFeed> => {
    try {
      const [featuredData, latestData] = await Promise.all([
        articleService.listPublicArticles({ featured: true, limit: 1 }),
        articleService.listPublicArticles({ limit: 12 }),
      ]);
      
      const featuredItems = featuredData?.items || [];
      const latestItems = latestData?.items || [];

      return {
        featuredArticle: featuredItems.length > 0 ? mapBackendArticleToFrontend(featuredItems[0]) : undefined,
        latestArticles: latestItems.map(mapBackendArticleToFrontend),
      };
    } catch (error) {
      console.error("Failed to fetch home feed:", error);
      return { latestArticles: [] };
    }
  },
  ['getHomeFeed'],
  { revalidate: 60, tags: ['articles'] }
);

export const getArticleById = unstable_cache(
  async (slug: string): Promise<Article | undefined> => {
    try {
      const data = await articleService.getArticleBySlug(slug);
      if (!data) return undefined;
      return mapBackendArticleToFrontend(data);
    } catch (error) {
      return undefined;
    }
  },
  ['getArticleById'],
  { revalidate: 60, tags: ['articles'] }
);

export const getPostRecommendations = unstable_cache(
  async (articleId: string): Promise<PostRecommendations> => {
    try {
      // Just fetching 4 latest articles for now as related/like
      const [relatedData, likeData] = await Promise.all([
        articleService.listPublicArticles({ limit: 4 }),
        articleService.listPublicArticles({ limit: 4 }),
      ]);

      const relatedItems = relatedData?.items || [];
      const likeItems = likeData?.items || [];

      return {
        relatedPosts: relatedItems.map(mapBackendArticleToFrontend),
        likePosts: likeItems.map(mapBackendArticleToFrontend),
      };
    } catch (error) {
      return { relatedPosts: [], likePosts: [] };
    }
  },
  ['getPostRecommendations'],
  { revalidate: 60, tags: ['articles'] }
);

export const getCategoryFeed = unstable_cache(
  async (categorySlug: string): Promise<CategoryFeed | undefined> => {
    try {
      // Find category first
      const categoryData = await categoryService.getCategoryBySlug(categorySlug);
      if (!categoryData) return undefined;

      const articlesData = await articleService.listPublicArticles({ categoryId: categoryData.id, limit: 50 });
      const items = articlesData?.items || [];
      
      return {
        label: categoryData.name,
        featured: items.length > 0 ? mapBackendArticleToFrontend(items[0]) : mapBackendArticleToFrontend({}),
        list: items.slice(1).map(mapBackendArticleToFrontend),
      };
    } catch (error) {
      return undefined;
    }
  },
  ['getCategoryFeed'],
  { revalidate: 60, tags: ['categories', 'articles'] }
);

export const getKnownCategorySlugs = unstable_cache(
  async () => {
    try {
      const categoriesData = await categoryService.listPublicCategories(100);
      const items = Array.isArray(categoriesData) ? categoriesData : [];
      return items.map((cat: any) => cat.slug).filter(Boolean);
    } catch (error) {
      return [];
    }
  },
  ['getKnownCategorySlugs'],
  { revalidate: 60, tags: ['categories'] }
);
