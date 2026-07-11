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

interface BackendArticle {
  id: number
  slug: string
  title: string
  category?: string | { name: string; slug?: string }
  categories?: any
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

  // Handle both single category object and list/array of categories (due to Supabase plural table join types)
  const catFromCategories = data.categories
    ? Array.isArray(data.categories)
      ? data.categories[0]
      : data.categories
    : undefined

  const result: Article = {
    id: data.slug || data.id?.toString() || "",
    dbId: data.id ? Number(data.id) : undefined,
    title: data.title || "",
    category: catObj?.name || catStr || catFromCategories?.name || "Tin tức",
    time: data.published_at || data.created_at || new Date().toISOString(),
    image: data.thumbnail_key || "",
    views: typeof data.views === "number" ? data.views : 0,
  }

  const catSlug = catObj?.slug || catFromCategories?.slug
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
        categoryService.listPublicCategories(100)
      ]);

      const data = settingsData || {};
      const categoriesItems = Array.isArray(categoriesData) ? categoriesData : [];
      
      const dynamicPrimaryLinks = categoriesItems
        .map((cat: { name: string; slug: string }) => ({
            label: cat.name,
            href: `/${cat.slug}`,
          }));

      return {
        settings: {
          brand: {
            name: data?.brand?.name || "WebTinTuc",
            logo_url: data?.brand?.logo_url || null,
            tagline: data?.brand?.tagline || "",
            footerDescription: data?.brand?.footerDescription || "",
            copyright: data?.brand?.copyright || "",
            searchPlaceholder: data?.brand?.searchPlaceholder || "Tìm kiếm...",
            utilityLinks: data?.brand?.utilityLinks || [],
            socialLinks: data?.brand?.socialLinks || [],
          },
          footer: {
            columns: data?.footer?.columns || [],
            address: data?.footer?.address || "",
            phone: data?.footer?.phone || "",
            email: data?.footer?.email || "",
            license: data?.footer?.license || "",
            responsible: data?.footer?.responsible || "",
          }
        },
        categories: dynamicPrimaryLinks
      };
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      return {
        settings: {
          brand: { name: "WebTinTuc", logo_url: null, tagline: "", footerDescription: "", copyright: "", searchPlaceholder: "Tìm kiếm...", utilityLinks: [], socialLinks: [] },
          footer: { columns: [], address: "", phone: "", email: "", license: "", responsible: "" }
        },
        categories: []
      };
    }
  },
  ['getSiteSettings'],
  { revalidate: 60, tags: ['settings', 'categories'] }
);

export const getSiteSettings = getSiteSettingsCached;

/** Homepage shows 6 latest cards + carousel fill from the same pool. */
const HOME_LATEST_LIMIT = 6
/**
 * Category page: 1 featured + 12 initial list + up to 4 for "Xem thêm"
 * (see CategoryContent).
 */
const CATEGORY_FEED_LIMIT = 17

const getHomeFeedCached = unstable_cache(
  async (): Promise<HomeFeed> => {
    try {
      const [featuredData, latestData] = await Promise.all([
        articleService.listPublicArticles({ featured: true, limit: 1 }),
        articleService.listPublicArticles({ limit: HOME_LATEST_LIMIT }),
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

export const getHomeFeed = getHomeFeedCached;

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

export const getArticleById = getArticleByIdCached;

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
        const trendingRaw = await articleService.getTrendingArticles(10);
        const trending = (trendingRaw || []).filter((a): a is Exclude<typeof a, null> => a !== null);
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

export const getPostRecommendations = getPostRecommendationsCached;

const getCategoryFeedCached = unstable_cache(
  async (categorySlug: string): Promise<CategoryFeed | undefined> => {
    try {
      const [categoryData, articlesData] = await Promise.all([
        categoryService.getCategoryBySlug(categorySlug),
        articleService.listPublicArticles({ category: categorySlug, limit: CATEGORY_FEED_LIMIT }),
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

export const getCategoryFeed = getCategoryFeedCached;

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

export const getKnownCategorySlugs = getKnownCategorySlugsCached;

const getPublicAdsCached = unstable_cache(
  async () => {
    return await adService.listPublicAds();
  },
  ['public_ads'],
  { revalidate: 60, tags: ['ads'] }
);

export const getPublicAds = getPublicAdsCached;
