import { unstable_cache } from 'next/cache';
import * as siteSettingsService from '@/server/services/site-settings.service';
import * as categoryService from '@/server/services/category.service';
import * as articleService from '@/server/services/article.service';
import * as adService from '@/server/services/ad.service';
import type {
  Article,
  CategoryFeed,
  HomeFeed,
  PostRecommendations,
  SiteSettings,
  NavigationItem,
  ContentBlock,
} from "@/lib/types/news";

// High-performance in-memory cache to serve reads under 1ms
const memoryCache = new Map<string, { data: unknown; expiry: number }>();

export function clearMemoryCache() {
  memoryCache.clear();
}

function withMemoryCache<T extends (...args: any[]) => Promise<unknown>>(
  fn: T,
  keyPrefix: string,
  ttlMs = 30000
): T {
  return (async (...args: any[]) => {
    const key = `${keyPrefix}:${JSON.stringify(args)}`;
    const now = Date.now();
    const cached = memoryCache.get(key);

    if (cached && cached.expiry > now) {
      return cached.data as Awaited<ReturnType<T>>;
    }

    const result = await fn(...args);
    memoryCache.set(key, { data: result, expiry: Date.now() + ttlMs });
    return result;
  }) as unknown as T;
}

interface BackendArticle {
  id: number
  slug: string
  title: string
  category?: string | { name: string; slug?: string }
  categories?: { name: string; slug?: string }
  published_at?: string
  created_at: string
  thumbnail_key?: string
  summary?: string
  content?: { blocks?: unknown[] } | unknown[]
  views?: number
}

export function mapBackendArticleToFrontend(data: Partial<BackendArticle>): Article {
  const catObj = typeof data.category === 'object' ? data.category : undefined
  const catStr = typeof data.category === 'string' ? data.category : undefined

  const contentBlocks = data.content
    ? Array.isArray(data.content)
      ? data.content
      : data.content.blocks
    : undefined

  const result: Article = {
    id: data.slug || data.id?.toString() || "",
    dbId: data.id ? Number(data.id) : undefined,
    title: data.title || "",
    category: catObj?.name || catStr || data.categories?.name || "Tin tức",
    time: data.published_at || data.created_at || new Date().toISOString(),
    image: data.thumbnail_key || "",
    views: typeof data.views === "number" ? data.views : 0,
  }

  const catSlug = catObj?.slug || data.categories?.slug
  if (catSlug) result.categorySlug = catSlug
  if (data.summary) result.intro = data.summary
  if (contentBlocks) result.content = contentBlocks as ContentBlock[]

  return result
}

const getSiteSettingsCached = unstable_cache(
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
        .map((cat: { name: string; slug: string }) => ({
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

export const getSiteSettings = withMemoryCache(getSiteSettingsCached, 'getSiteSettings', 60000);

const getHomeFeedCached = unstable_cache(
  async (): Promise<HomeFeed> => {
    try {
      const [featuredData, latestData] = await Promise.all([
        articleService.listPublicArticles({ featured: true, limit: 1 }),
        articleService.listPublicArticles({ limit: 12 }),
      ]);
      
      const featuredItems = featuredData?.items || [];
      const latestItems = latestData?.items || [];

      const feed: HomeFeed = { latestArticles: latestItems.map(mapBackendArticleToFrontend) }
      if (featuredItems.length > 0) feed.featuredArticle = mapBackendArticleToFrontend(featuredItems[0])
      return feed
    } catch (error) {
      console.error("Failed to fetch home feed:", error);
      return { latestArticles: [] };
    }
  },
  ['getHomeFeed'],
  { revalidate: 60, tags: ['articles'] }
);

export const getHomeFeed = withMemoryCache(getHomeFeedCached, 'getHomeFeed', 15000);

const getArticleByIdCached = unstable_cache(
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

export const getArticleById = withMemoryCache(getArticleByIdCached, 'getArticleById', 30000);

const getPostRecommendationsCached = unstable_cache(
  async (articleId: string): Promise<PostRecommendations> => {
    try {
      let relatedItems: BackendArticle[] = [];
      let likeItems: BackendArticle[] = [];

      const currentArticle = await articleService.getArticleBySlug(articleId);
      if (currentArticle) {
        // Fetch related articles (same category)
        relatedItems = await articleService.getRelatedArticles(articleId, 4);

        // Fetch trending articles (max 10) as "You May Also Like" candidate pool
        const trending = await articleService.getTrendingArticles(10);
        const relatedIds = new Set(relatedItems.map((a) => a.id));
        
        likeItems = trending
          .filter((a) => a.id !== currentArticle.id && !relatedIds.has(a.id))
          .slice(0, 4);

        // If not enough, fill the rest with latest articles
        if (likeItems.length < 4) {
          const latest = await articleService.listPublicArticles({ limit: 20 });
          const latestItems = latest?.items || [];
          const remainingCount = 4 - likeItems.length;
          const additional = latestItems
            .filter((a) => a.id !== currentArticle.id && !relatedIds.has(a.id) && !likeItems.some((l) => l.id === a.id))
            .slice(0, remainingCount);
          likeItems = [...likeItems, ...additional];
        }
      } else {
        // Fallback if current article is not found
        const [relatedData, likeData] = await Promise.all([
          articleService.listPublicArticles({ limit: 4 }),
          articleService.listPublicArticles({ limit: 4 }),
        ]);
        relatedItems = relatedData?.items || [];
        likeItems = likeData?.items || [];
      }

      return {
        relatedPosts: relatedItems.map(mapBackendArticleToFrontend),
        likePosts: likeItems.map(mapBackendArticleToFrontend),
      };
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
      return { relatedPosts: [], likePosts: [] };
    }
  },
  ['getPostRecommendations'],
  { revalidate: 60, tags: ['articles'] }
);

export const getPostRecommendations = withMemoryCache(getPostRecommendationsCached, 'getPostRecommendations', 30000);

const getCategoryFeedCached = unstable_cache(
  async (categorySlug: string): Promise<CategoryFeed | undefined> => {
    try {
      const [categoryData, articlesData] = await Promise.all([
        categoryService.getCategoryBySlug(categorySlug),
        articleService.listPublicArticles({ category: categorySlug, limit: 50 }),
      ]);

      if (!categoryData) return undefined;

      const items = articlesData?.items || [];
      
      return {
        label: categoryData.name,
        featured: items.length > 0 ? mapBackendArticleToFrontend(items[0]) : mapBackendArticleToFrontend({} as BackendArticle),
        list: items.slice(1).map(mapBackendArticleToFrontend),
      };
    } catch (error) {
      return undefined;
    }
  },
  ['getCategoryFeed'],
  { revalidate: 60, tags: ['categories', 'articles'] }
);

export const getCategoryFeed = withMemoryCache(getCategoryFeedCached, 'getCategoryFeed', 15000);

const getKnownCategorySlugsCached = unstable_cache(
  async () => {
    try {
      const categoriesData = await categoryService.listPublicCategories(100);
      const items = Array.isArray(categoriesData) ? categoriesData : [];
      return items.map((cat: { slug: string }) => cat.slug).filter(Boolean);
    } catch (error) {
      return [];
    }
  },
  ['getKnownCategorySlugs'],
  { revalidate: 60, tags: ['categories'] }
);

export const getKnownCategorySlugs = withMemoryCache(getKnownCategorySlugsCached, 'getKnownCategorySlugs', 60000);

const getPublicAdsCached = unstable_cache(
  async () => {
    return await adService.listPublicAds();
  },
  ['public_ads'],
  { revalidate: 60, tags: ['ads'] }
);

export const getPublicAds = withMemoryCache(getPublicAdsCached, 'getPublicAds', 30000);
