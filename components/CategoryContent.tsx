"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import type { Article } from "@/lib/types/news";
import { formatCategory } from "@/lib/utils";
import { FeaturedCarousel } from "@/components/FeaturedCarousel";

interface CategoryContentProps {
  category: string;
  label: string;
  featured: Article;
  initialList: Article[];
}

export function CategoryContent({ category, label, featured, initialList }: CategoryContentProps) {
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
      <div className="relative w-full md:w-[970px] md:h-[250px] overflow-hidden rounded border border-gray-200 mb-5 bg-gray-50 flex justify-center group shadow-sm mx-auto">
        {/* Mobile View */}
        <div className="flex md:hidden w-full h-[70px] bg-[#e0e0e0] items-center justify-center text-[#1a1a1a] font-extrabold text-[18px] border border-gray-300">
          QC
        </div>
        {/* Desktop View */}
        <div className="hidden md:block w-full h-full">
          <a href="#" className="block w-full h-full">
            <img
              src="/vinfast_ad.png"
              alt="Quảng cáo 970x250"
              className="w-full h-full object-cover"
            />
          </a>
          <div className="absolute top-1 right-1 bg-black/40 hover:bg-black/70 text-white/90 text-[9px] px-1.5 py-0.5 cursor-pointer rounded select-none z-10 transition-colors">
            Quảng cáo &times;
          </div>
        </div>
      </div>

      {/* Main Two-Column Content Layout */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Left Column: Category Posts */}
        <div className="w-full lg:w-[650px] flex-shrink-0 flex flex-col gap-5">
          {/* Featured Article Carousel */}
          {carouselArticles.length > 0 && (
            <FeaturedCarousel articles={carouselArticles} />
          )}

          {/* Double QC box on mobile immediately below Featured Carousel */}
          <div className="grid grid-cols-2 gap-3.5 my-2.5 md:hidden">
            <div className="bg-[#e0e0e0] h-[160px] flex items-center justify-center font-extrabold text-[24px] text-[#1a1a1a] border border-gray-300">
              QC
            </div>
            <div className="bg-[#e0e0e0] h-[160px] flex items-center justify-center font-extrabold text-[24px] text-[#1a1a1a] border border-gray-300">
              QC
            </div>
          </div>

          {/* List Part 1 (First 6 items) */}
          <div className="bg-white border border-gray-200 p-3 sm:p-4 rounded-sm shadow-sm flex flex-col gap-4">
            {listPart1.map((item) => (
              <Link
                key={item.id}
                href={`/posts/${item.id}`}
                className="group flex gap-3.5 cursor-pointer pb-4 border-b border-gray-100 last:border-b-0 last:pb-0 transition-colors"
              >
                <div className="w-[110px] h-[75px] sm:w-[130px] sm:h-[88px] flex-shrink-0 overflow-hidden border border-gray-200 bg-gray-50 rounded-sm">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                  />
                </div>
                <div className="flex flex-col justify-between py-0.5 flex-1">
                  <h3 className="text-gray-800 font-bold text-xs sm:text-[13px] leading-snug group-hover:text-[#df3232] transition-colors line-clamp-2 sm:line-clamp-3">
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
          <div className="relative w-full overflow-hidden rounded border border-gray-200 bg-gray-50 flex justify-center group shadow-sm aspect-[650/300] max-h-[300px]">
            {/* Mobile View */}
            <div className="flex md:hidden w-full h-[100px] bg-[#e0e0e0] items-center justify-center text-[#1a1a1a] font-extrabold text-[16px] border border-gray-300">
              QC
            </div>
            {/* Desktop View */}
            <div className="hidden md:block w-full h-full">
              <a href="#" className="block w-full h-full">
                <img
                  src="/qc_650_300_premium.png"
                  alt="Quảng cáo 650x300"
                  className="w-full h-full object-cover"
                />
              </a>
              <div className="absolute top-1.5 right-1.5 bg-black/45 hover:bg-black/75 text-white/90 text-[9px] px-1.5 py-0.5 cursor-pointer rounded select-none z-10 transition-colors">
                Quảng cáo &times;
              </div>
            </div>
          </div>

          {/* List Part 2 (Next 6 items + Load More items) */}
          <div className="bg-white border border-gray-200 p-3 sm:p-4 rounded-sm shadow-sm flex flex-col gap-4">
            {listPart2.map((item) => (
              <Link
                key={item.id}
                href={`/posts/${item.id}`}
                className="group flex gap-3.5 cursor-pointer pb-4 border-b border-gray-100 last:border-b-0 last:pb-0 transition-colors"
              >
                <div className="w-[110px] h-[75px] sm:w-[130px] sm:h-[88px] flex-shrink-0 overflow-hidden border border-gray-200 bg-gray-50 rounded-sm">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                  />
                </div>
                <div className="flex flex-col justify-between py-0.5 flex-1">
                  <h3 className="text-gray-800 font-bold text-xs sm:text-[13px] leading-snug group-hover:text-[#df3232] transition-colors line-clamp-2 sm:line-clamp-3">
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
          {/* Ad 1 (QC 300x600) */}
          <div className="relative w-full md:w-[300px] md:h-[600px] overflow-hidden rounded border border-gray-200 bg-gray-50 flex justify-center group shadow-sm mx-auto">
            <a href="#" className="block w-full h-full">
              <img
                src="/zento_cabinet_ad.png"
                alt="Quảng cáo 300x600"
                className="w-full h-full object-cover"
              />
            </a>
            <div className="absolute top-1.5 right-1.5 bg-black/45 hover:bg-black/75 text-white/90 text-[9px] px-1.5 py-0.5 cursor-pointer rounded select-none z-10 transition-colors">
              Quảng cáo &times;
            </div>
          </div>

          {/* Ad 2 (QC 300x600) */}
          <div className="relative w-full md:w-[300px] md:h-[600px] overflow-hidden rounded border border-gray-200 bg-gray-50 flex justify-center group shadow-sm mx-auto">
            <a href="#" className="block w-full h-full">
              <img
                src="/ztc_bathtub_ad.png"
                alt="Quảng cáo 300x600"
                className="w-full h-full object-cover"
              />
            </a>
            <div className="absolute top-1.5 right-1.5 bg-black/45 hover:bg-black/75 text-white/90 text-[9px] px-1.5 py-0.5 cursor-pointer rounded select-none z-10 transition-colors">
              Quảng cáo &times;
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
