"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";
import type { Article } from "@/lib/types/news";
import { formatCategory } from "@/lib/utils";
import { FeaturedCarousel } from "@/components/FeaturedCarousel";
import AdBanner from "@/components/AdBanner";

interface CategoryContentProps {
  category: string;
  label: string;
  featured: Article;
  initialList: Article[];
  ads?: any[];
}

export function CategoryContent({ category, label, featured, initialList, ads = [] }: CategoryContentProps) {
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

  const listPart1 = visibleList.slice(0, 6);
  const listPart2 = visibleList.slice(6);

  // Construct carousel articles array (up to 4 articles starting with the featured article)
  const carouselArticles = [featured];
  const extraArticles = initialList
    .filter((art) => art.id !== featured.id)
    .slice(0, 3);
  carouselArticles.push(...extraArticles);

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

          {/* Swipable QC container on mobile immediately below Featured Carousel */}
          <div className="flex gap-3.5 my-2.5 md:hidden overflow-x-auto scrollbar-none snap-x snap-mandatory">
            <div className="w-[46%] min-w-[140px] flex-shrink-0 snap-start relative overflow-hidden rounded border border-gray-200 bg-gray-50 shadow-xs aspect-[300/600]">
              <a href="#" className="block w-full h-full">
                <Image
                  src="/zento_cabinet_ad.webp"
                  alt="Quảng cáo 1"
                  fill
                  sizes="(max-width: 768px) 46vw, 300px"
                  className="object-cover"
                />
              </a>
              <div className="absolute top-1 right-1 bg-black/45 text-white/90 text-[8px] px-1 py-0.5 rounded-sm select-none z-10">
                QC &times;
              </div>
            </div>
            <div className="w-[46%] min-w-[140px] flex-shrink-0 snap-start relative overflow-hidden rounded border border-gray-200 bg-gray-50 shadow-xs aspect-[300/600]">
              <a href="#" className="block w-full h-full">
                <Image
                  src="/ztc_bathtub_ad.webp"
                  alt="Quảng cáo 2"
                  fill
                  sizes="(max-width: 768px) 46vw, 300px"
                  className="object-cover"
                />
              </a>
              <div className="absolute top-1 right-1 bg-black/45 text-white/90 text-[8px] px-1 py-0.5 rounded-sm select-none z-10">
                QC &times;
              </div>
            </div>
            <div className="w-[46%] min-w-[140px] flex-shrink-0 snap-start relative overflow-hidden rounded border border-gray-200 bg-gray-50 shadow-xs aspect-[300/600]">
              <a href="#" className="block w-full h-full">
                <Image
                  src="/zento_toilet_ad.webp"
                  alt="Quảng cáo 3"
                  fill
                  sizes="(max-width: 768px) 46vw, 300px"
                  className="object-cover"
                />
              </a>
              <div className="absolute top-1 right-1 bg-black/45 text-white/90 text-[8px] px-1 py-0.5 rounded-sm select-none z-10">
                QC &times;
              </div>
            </div>
          </div>

          {/* List Part 1 (First 6 items) */}
          <div className="bg-white md:border md:border-gray-200 p-0 md:p-4 rounded-sm md:shadow-sm flex flex-col gap-4">
            {listPart1.map((item) => (
              <Link
                key={item.id}
                href={`/posts/${item.id}`}
                prefetch={true}
                className="group flex gap-3.5 cursor-pointer pb-4 border-b border-gray-100 last:border-b-0 last:pb-0 transition-colors"
              >                <div className="relative w-[110px] h-[75px] sm:w-[130px] sm:h-[88px] flex-shrink-0 overflow-hidden border border-gray-200 bg-gray-50 rounded-md md:rounded-sm">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 110px, 130px"
                    className="object-cover group-hover:scale-103 transition-transform duration-300"
                  />
                </div>
                <div className="flex flex-col justify-between py-0.5 flex-1">
                  <h3 className="text-gray-800 font-bold text-[13.5px] sm:text-[13px] leading-snug group-hover:text-[#df3232] transition-colors line-clamp-2 sm:line-clamp-3">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-gray-400 font-semibold text-[10px] mt-1">
                    <span className="text-[#df3232] font-bold">{formatCategory(item.category)}</span>
                    <span className="text-gray-200 font-normal">|</span>
                    <span>{item.time.split(" ")[0]}</span>
                    {item.time.includes(" ") && (
                      <>
                        <Clock size={11} className="text-gray-400 flex-shrink-0 -mt-0.5" />
                        <span className="font-normal">{item.time.split(" ")[1]}</span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Middle Banner Ad (QC 650x300) */}
          <AdBanner 
              position="inline" 
              ads={ads} 
              fallbackImg="/qc_650_300_premium.webp" 
              className="w-full rounded border border-gray-200 bg-gray-50 shadow-sm overflow-hidden aspect-[650/300]" 
            />

          {/* List Part 2 (Next 6 items + Load More items) */}
          <div className="bg-white md:border md:border-gray-200 p-0 md:p-4 rounded-sm md:shadow-sm flex flex-col gap-4">
            {listPart2.map((item) => (
              <Link
                key={item.id}
                href={`/posts/${item.id}`}
                prefetch={true}
                className="group flex gap-3.5 cursor-pointer pb-4 border-b border-gray-100 last:border-b-0 last:pb-0 transition-colors"
              >                <div className="relative w-[110px] h-[75px] sm:w-[130px] sm:h-[88px] flex-shrink-0 overflow-hidden border border-gray-200 bg-gray-50 rounded-md md:rounded-sm">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 110px, 130px"
                    className="object-cover group-hover:scale-103 transition-transform duration-300"
                  />
                </div>
                <div className="flex flex-col justify-between py-0.5 flex-1">
                  <h3 className="text-gray-800 font-bold text-[13.5px] sm:text-[13px] leading-snug group-hover:text-[#df3232] transition-colors line-clamp-2 sm:line-clamp-3">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-gray-400 font-semibold text-[10px] mt-1">
                    <span className="text-[#df3232] font-bold">{formatCategory(item.category)}</span>
                    <span className="text-gray-200 font-normal">|</span>
                    <span>{item.time.split(" ")[0]}</span>
                    {item.time.includes(" ") && (
                      <>
                        <Clock size={11} className="text-gray-400 flex-shrink-0 -mt-0.5" />
                        <span className="font-normal">{item.time.split(" ")[1]}</span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

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
        <aside className="hidden lg:flex w-[300px] flex-shrink-0 lg:sticky lg:top-4 flex-col gap-4">
          <AdBanner 
            position="sidebar_1" 
            ads={ads} 
            fallbackImg="/zento_cabinet_ad.png" 
            className="w-full md:w-[300px] md:h-[600px] rounded border border-gray-200 bg-gray-50 shadow-sm mx-auto overflow-hidden" 
          />
          <AdBanner 
            position="sidebar_2" 
            ads={ads} 
            fallbackImg="/ztc_bathtub_ad.png" 
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
