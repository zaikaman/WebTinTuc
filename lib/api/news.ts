import { apiGet, isRemoteApiEnabled } from "@/lib/api/http";
import {
  categoryData,
  getCategorySlug as getMockCategorySlug,
  getOrGenerateArticle,
  mockArticles,
} from "@/lib/mockData";
import { mockSiteSettings } from "@/lib/mockSiteSettings";
import type {
  Article,
  CategoryFeed,
  HomeFeed,
  PostRecommendations,
  SiteSettings,
} from "@/lib/types/news";

const HOME_LIST_IDS = [
  "oc-muon-hon-poster",
  "vietnam-thailand-tiem-nang",
  "cong-an-tphcm-bat-ma-tuy",
  "oc-muon-hon-poster",
  "oc-muon-hon-poster",
  "oc-muon-hon-poster",
  "oc-muon-hon-poster",
  "anime-list-1",
  "tech-list-1",
  "movie-list-1",
];

const RELATED_IDS = ["related-1", "related-2", "related-3", "related-4"];
const LIKE_IDS = ["like-1", "like-2", "like-3", "like-4"];

export function getCategorySlug(category: string) {
  return getMockCategorySlug(category);
}

export async function getSiteSettings(): Promise<SiteSettings> {
  if (isRemoteApiEnabled()) {
    return apiGet<SiteSettings>("/site-settings", {
      next: { revalidate: 60 },
    });
  }

  return mockSiteSettings;
}

export async function getHomeFeed(): Promise<HomeFeed> {
  if (isRemoteApiEnabled()) {
    return apiGet<HomeFeed>("/articles/home", {
      next: { revalidate: 60 },
    });
  }

  return {
    featuredArticle:
      mockArticles.find((article) => article.id === "hanoi-nang-nong-38-7") ??
      mockArticles[0],
    latestArticles: pickArticles(HOME_LIST_IDS),
  };
}

export async function getArticleById(id: string): Promise<Article | undefined> {
  if (isRemoteApiEnabled()) {
    try {
      return await apiGet<Article>(`/articles/${encodeURIComponent(id)}`, {
        next: { revalidate: 60 },
      });
    } catch (error) {
      if (isNotFound(error)) return undefined;
      throw error;
    }
  }

  return getOrGenerateArticle(id);
}

export async function getPostRecommendations(
  articleId: string,
): Promise<PostRecommendations> {
  if (isRemoteApiEnabled()) {
    return apiGet<PostRecommendations>(
      `/articles/${encodeURIComponent(articleId)}/recommendations`,
      { next: { revalidate: 60 } },
    );
  }

  return {
    relatedPosts: pickArticles(RELATED_IDS),
    likePosts: pickArticles(LIKE_IDS),
  };
}

export async function getCategoryFeed(
  category: string,
): Promise<CategoryFeed | undefined> {
  if (isRemoteApiEnabled()) {
    try {
      return await apiGet<CategoryFeed>(
        `/categories/${encodeURIComponent(category)}`,
        { next: { revalidate: 60 } },
      );
    } catch (error) {
      if (isNotFound(error)) return undefined;
      throw error;
    }
  }

  return categoryData[category];
}

export function getKnownCategorySlugs() {
  return Object.keys(categoryData);
}

function pickArticles(ids: string[]) {
  return ids
    .map((id) => mockArticles.find((article) => article.id === id))
    .filter((article): article is Article => Boolean(article));
}

function isNotFound(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    error.status === 404
  );
}
