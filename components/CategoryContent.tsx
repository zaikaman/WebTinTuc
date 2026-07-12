"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";
import type { Article } from "@/lib/types/news";
import { formatCategory, formatVietnameseDate } from "@/lib/utils";
import { proxyImageUrl } from "@/lib/image-proxy";
import { FeaturedCarousel } from "@/components/FeaturedCarousel";
import AdBanner from "@/components/AdBanner";
import MobileAdsStack from "@/components/MobileAdsStack";

interface CategoryContentProps {
  featured: Article;
  initialList: Article[];
  ads?: any[];
}

export function CategoryContent({ featured, initialList, ads = [] }: CategoryContentProps) {
  // We display first 12 items (6 before ad, 6 after ad).
  // The rest (items 12 to 16) are loaded when clicking "Xem Thêm".
  const initialDisplayList = initialList.slice(0, 12);
  const hiddenList = initialList.slice(12);

  const [visibleList, setVisibleList] = useState<Article[]>(initialDisplayList);
  const [extraList, setExtraList] = useState<Article[]>(hiddenList);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(hiddenList.length > 0);

  const handleLoadMore = () => {
    if (loading || !hasMore) return;
    setLoading(true);

    // Simulate loading transition
    setTimeout(() => {
      setVisibleList((prev) => [...prev, ...extraList]);
      setExtraList([]);
      setLoading(false);
      setHasMore(false);
    }, 600);
  };

  const middleIndex = Math.ceil(visibleList.length / 2);
  const listPart1 = visibleList.slice(0, middleIndex);
  const listPart2 = visibleList.slice(middleIndex);

  // Construct carousel articles array (up to 4 articles starting with the featured article)
  const carouselArticles = [featured];
  const extraArticles = initialList
    .filter((art) => art.id !== featured.id)
    .slice(0, 3);
  carouselArticles.push(...extraArticles);

  const renderArticleItem = (item: Article) => {
    const categorySlug = item.categorySlug || item.category;
    const displayIntro = item.intro || `Bản tin mới nhất về ${item.category.toLowerCase()} - Cập nhật nhanh các thông tin xoay quanh chủ đề "${item.title}" đang thu hút sự chú ý của độc giả.`;
    return (
      <div
        key={item.id}
        className="group flex gap-4 py-4 sm:py-5 first:pt-0 md:first:pt-2 last:pb-0 md:last:pb-2 transition-colors hover:bg-gray-50/30"
      >
        {/* Thumbnail Left */}
        <Link
          href={`/posts/${item.id}`}
          prefetch={true}
          className="relative w-[130px] h-[82px] sm:w-[220px] sm:h-[138px] flex-shrink-0 overflow-hidden border border-gray-200 bg-gray-50 rounded-md md:rounded-sm block"
        >
          <Image
            src={proxyImageUrl(item.image) || "/placeholder.svg"}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 130px, 220px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Title & Metadata Right */}
        <div className="flex flex-col justify-between py-0.5 flex-1 min-h-[82px] sm:min-h-[138px]">
          <div>
            <Link href={`/posts/${item.id}`} prefetch={true} className="block">
              <h3 className="text-gray-900 font-bold text-[14px] sm:text-[16px] leading-snug tracking-tight group-hover:text-[#e24a48] transition-colors line-clamp-2 font-sans">
                {item.title}
              </h3>
            </Link>
            <p className="hidden sm:line-clamp-2 text-gray-500 text-[12.5px] leading-relaxed mt-2 font-sans">
              {displayIntro}
            </p>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-2 mt-2 text-[10px] sm:text-[11px] text-gray-500 font-sans font-medium">
            <Link
              href={`/${categorySlug}`}
              prefetch={true}
              className="text-[#df3232] hover:text-[#df3232]/80 font-bold text-[10px] sm:text-[11px] tracking-wide transition-colors duration-150 hover:underline"
            >
              {formatCategory(item.category)}
            </Link>
            <span className="text-gray-300">&#8226;</span>
            <span className="flex items-center gap-1 text-gray-400">
              <Clock size={11} className="mr-0.5" />
              <span>{formatVietnameseDate(item.time)}</span>
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="w-full px-3 md:px-0 py-4 font-sans text-xs bg-white">
      {/* Top Banner Advertisement (QC 970x250) */}
      <AdBanner 
        position="header" 
        ads={ads} 
        fallbackImg="/vinfast_ad.webp" 
        className="w-full md:w-[970px] rounded border border-gray-200 mb-5 bg-gray-50 shadow-sm mx-auto overflow-hidden aspect-[970/250] md:aspect-auto md:h-[250px]" 
      />

      {/* Main Two-Column Content Layout */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Left Column: Category Posts */}
        <div className="w-full lg:w-[650px] flex-shrink-0 flex flex-col gap-5">
          {/* Featured Article Carousel */}
          {carouselArticles.length > 0 && (
            <FeaturedCarousel articles={carouselArticles} />
          )}

          {/* Interactive Stacked Ads container on mobile immediately below Featured Carousel */}
          <MobileAdsStack ads={ads} />

          {/* List Part 1 */}
          {listPart1.length > 0 && (
            <div className="flex flex-col bg-white md:border md:border-gray-200 md:rounded-sm p-0 md:p-4 md:shadow-sm divide-y divide-gray-200">
              {listPart1.map(renderArticleItem)}
            </div>
          )}

          {/* Middle Banner Ad (QC 650x300) */}
          {visibleList.length > 0 && (
            <AdBanner 
              position="inline" 
              ads={ads} 
              fallbackImg="/qc_650_300_premium.webp" 
              className="w-full rounded border border-gray-200 bg-gray-50 shadow-sm overflow-hidden aspect-[650/300]" 
            />
          )}

          {/* List Part 2 */}
          {listPart2.length > 0 && (
            <div className="flex flex-col bg-white md:border md:border-gray-200 md:rounded-sm p-0 md:p-4 md:shadow-sm divide-y divide-gray-200">
              {listPart2.map(renderArticleItem)}
            </div>
          )}

          {/* "Xem Thêm" Load More Section */}
          <div className="bg-[#f2f2f2] p-4 flex justify-center items-center border border-gray-200 rounded-sm shadow-sm">
            {hasMore ? (
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="bg-white hover:bg-gray-50 hover:scale-102 disabled:hover:scale-100 disabled:opacity-85 text-gray-800 border border-gray-300 font-extrabold text-[13px] px-10 py-2.5 rounded-[20px] shadow-sm flex items-center gap-2 transition-all select-none active:scale-98"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Đang tải...</span>
                  </>
                ) : (
                  <>
                    <span>Xem Thêm</span>
                    <svg className="w-4 h-4 text-gray-700 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </>
                )}
              </button>
            ) : (
              <span className="text-gray-400 font-bold tracking-wide py-1 text-center">
                Đã hiển thị tất cả bài viết trong chuyên mục này.
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Sticky Sidebar Ads - Hidden on Mobile */}
        <aside className="hidden lg:block w-[300px] flex-shrink-0 lg:sticky lg:top-4 h-fit space-y-4">
          <AdBanner 
            position="sidebar_1" 
            ads={ads} 
            fallbackImg="/zento_cabinet_ad.webp" 
            className="w-full md:w-[300px] md:h-[600px] rounded border border-gray-200 bg-gray-50 shadow-sm mx-auto overflow-hidden" 
          />
          <AdBanner 
            position="sidebar_2" 
            ads={ads} 
            fallbackImg="/ztc_bathtub_ad.webp" 
            className="w-full md:w-[300px] md:h-[600px] rounded border border-gray-200 bg-gray-50 shadow-sm mx-auto overflow-hidden" 
          />
          <AdBanner 
            position="sidebar_3" 
            ads={ads} 
            fallbackImg="/zento_toilet_ad.webp" 
            className="w-full md:w-[300px] md:h-[600px] rounded border border-gray-200 bg-gray-50 shadow-sm mx-auto overflow-hidden" 
          />
        </aside>
      </div>

      {/* Bottom QC 970x250 Ad */}
      <AdBanner 
        position="footer" 
        ads={ads} 
        fallbackImg="/vietnam_airlines_ad.webp" 
        className="w-full md:w-[970px] mt-6 rounded border border-gray-200 bg-gray-50 shadow-sm mx-auto overflow-hidden aspect-[970/250] md:aspect-auto md:h-[250px]" 
      />
    </main>
  );
}
