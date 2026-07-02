import type { Metadata } from "next";
import * as articleService from "@/server/services/article.service";
import * as categoryService from "@/server/services/category.service";
import { getPublicAds, mapBackendArticleToFrontend } from "@/lib/api/news";
import { SearchContent } from "@/components/SearchContent";

export const revalidate = 0; // Search pages should not be static; always load fresh query results

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q = "" } = await searchParams;
  return {
    title: q ? `Kết quả tìm kiếm cho "${q}" | WebTinTuc` : "Tìm kiếm bài viết | WebTinTuc",
    description: q ? `Kết quả tìm kiếm các bài viết liên quan đến "${q}" trên WebTinTuc.` : "Tìm kiếm tin tức, bài viết trên WebTinTuc.",
    robots: {
      index: false, // Prevent SEO search engines from indexing query pages (SEO best practice)
      follow: true,
    }
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "" } = await searchParams;
  
  let articles: any[] = [];
  let categories: any[] = [];
  
  try {
    categories = await categoryService.listPublicCategories(100);
  } catch (error) {
    console.error("Error fetching categories for search page:", error);
  }
  
  if (q.trim()) {
    try {
      // Fetch up to 50 search results for quick client-side infinite loading
      const searchResults = await articleService.searchArticles(q.trim(), 1, 50);
      articles = (searchResults?.items || []).map(mapBackendArticleToFrontend);
    } catch (error) {
      console.error("Error searching articles on server:", error);
    }
  }

  const ads = await getPublicAds();

  return (
    <SearchContent query={q} initialArticles={articles} ads={ads} categories={categories} />
  );
}
