import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getHomeFeed } from "@/lib/api/news";
import { Clock } from "lucide-react";
import { formatCategory } from "@/lib/utils";
import { FeaturedCarousel } from "@/components/FeaturedCarousel";
import { getPublicAds } from "@/lib/api/news";
import AdBanner from "@/components/AdBanner";

export const revalidate = 60;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export const metadata: Metadata = {
  title: "Trang chủ",
  description: "WebTinTuc - Trang tin tức tổng hợp hàng đầu. Cập nhật nhanh chóng các tin tức mới nhất về game, anime, công nghệ, phim ảnh và kiến thức.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    title: "WebTinTuc - Tin tức, Game, Anime, Công nghệ mới nhất",
    description: "WebTinTuc - Trang tin tức tổng hợp hàng đầu. Cập nhật nhanh chóng các tin tức mới nhất về game, anime, công nghệ, phim ảnh và kiến thức.",
    url: "/",
    siteName: "WebTinTuc",
    locale: "vi_VN",
    images: [
      {
        url: `${siteUrl}/screen-3.webp`,
        width: 1200,
        height: 630,
        alt: "WebTinTuc",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WebTinTuc - Tin tức, Game, Anime, Công nghệ mới nhất",
    description: "WebTinTuc - Trang tin tức tổng hợp hàng đầu. Cập nhật nhanh chóng các tin tức mới nhất về game, anime, công nghệ, phim ảnh và kiến thức.",
    images: [`${siteUrl}/screen-3.webp`],
  },
};

export default async function HomePage() {
  const { featuredArticle, latestArticles } = await getHomeFeed();
  const ads = await getPublicAds();

  // Get exactly 4 articles for the carousel
  const carouselArticles = [];
  if (featuredArticle) {
    carouselArticles.push(featuredArticle);
  }
  const extraArticles = latestArticles
    .filter((art) => art.id !== featuredArticle?.id)
    .slice(0, 4 - carouselArticles.length);
  carouselArticles.push(...extraArticles);

  // Slice to exactly 6 articles just in case
  const articlesToDisplay = latestArticles.slice(0, 6);

  // Helper to chunk articles into groups of 3
  const articleGroups = [];
  for (let i = 0; i < articlesToDisplay.length; i += 3) {
    articleGroups.push(articlesToDisplay.slice(i, i + 3));
  }

  return (
    <main className="w-full px-3 md:px-0 py-4 font-sans text-xs flex flex-col gap-5 bg-white">
      {/* Top Banner Advertisement (QC 970x250) */}
      <AdBanner 
        position="header" 
        ads={ads} 
        fallbackImg="/vietnam_airlines_ad.webp" 
        className="w-full md:w-[970px] rounded border border-gray-200 bg-gray-50 shadow-sm mx-auto overflow-hidden aspect-[970/250] md:aspect-auto md:h-[250px]" 
      />

      {/* Main Two-Column Layout */}
      <div className="flex flex-col lg:flex-row gap-5 items-start w-full">
        {/* Left Column: Featured Article, Header & List with 650x300 Ads */}
        <div className="w-full lg:w-[650px] flex-shrink-0 flex flex-col gap-4">
          
          {/* Featured Article Carousel at the Top */}
          {carouselArticles.length > 0 && (
            <FeaturedCarousel articles={carouselArticles} />
          )}

          {/* Swipable QC container on mobile immediately below Featured Carousel */}
          <div className="flex gap-3.5 my-2.5 md:hidden overflow-x-auto scrollbar-none snap-x snap-mandatory">
            <AdBanner 
              position="sidebar_1" 
              ads={ads} 
              fallbackImg="/zento_cabinet_ad.webp" 
              className="w-[46%] min-w-[140px] flex-shrink-0 snap-start rounded border border-gray-200 bg-gray-50 shadow-xs overflow-hidden aspect-[300/600]" 
            />
            <AdBanner 
              position="sidebar_2" 
              ads={ads} 
              fallbackImg="/ztc_bathtub_ad.webp" 
              className="w-[46%] min-w-[140px] flex-shrink-0 snap-start rounded border border-gray-200 bg-gray-50 shadow-xs overflow-hidden aspect-[300/600]" 
            />
            <AdBanner 
              position="sidebar_3" 
              ads={ads} 
              fallbackImg="/zento_toilet_ad.webp" 
              className="w-[46%] min-w-[140px] flex-shrink-0 snap-start rounded border border-gray-200 bg-gray-50 shadow-xs overflow-hidden aspect-[300/600]" 
            />
          </div>

          {/* "MỚI NHẤT" Category Header */}
          <div className="flex items-center gap-2 border-b-2 border-[#e24a48] pb-1 mt-2 mb-1">
            <span className="bg-[#e24a48] text-white font-bold text-[11px] px-3 py-1 uppercase tracking-wider rounded-sm">
              Mới nhất
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* List of Articles in groups of 3 with ads in between */}
          {articleGroups.map((group, groupIndex) => (
            <div key={`group-${groupIndex}`} className="contents">
              <div className="flex flex-col bg-white md:border md:border-gray-200 md:rounded-sm p-0 md:p-4 md:shadow-sm divide-y divide-gray-200">
                {group.map((article, index) => {
                  const categorySlug = article.categorySlug || article.category;
                  const displayIntro = article.intro || `Bản tin mới nhất về ${article.category.toLowerCase()} - Cập nhật nhanh các thông tin xoay quanh chủ đề "${article.title}" đang thu hút sự chú ý của độc giả.`;
                  return (
                    <div
                      key={`${article.id}-${index}`}
                      className="group flex gap-4 py-4 sm:py-5 first:pt-0 md:first:pt-2 last:pb-0 md:last:pb-2 transition-colors hover:bg-gray-50/30"
                    >
                      {/* Thumbnail Left */}
                      <Link
                        href={`/posts/${article.id}`}
                        prefetch={true}
                        className="relative w-[130px] h-[82px] sm:w-[220px] sm:h-[138px] flex-shrink-0 overflow-hidden border border-gray-200 bg-gray-50 rounded-md md:rounded-sm block"
                      >
                        <Image
                          src={article.image || "/placeholder.svg"}
                          alt={article.title}
                          fill
                          sizes="(max-width: 640px) 130px, 220px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>

                      {/* Title & Metadata Right */}
                      <div className="flex flex-col justify-between py-0.5 flex-1 min-h-[82px] sm:min-h-[138px]">
                        <div>
                          <Link href={`/posts/${article.id}`} prefetch={true} className="block">
                            <h3 className="text-gray-900 font-bold text-[14px] sm:text-[16px] leading-snug tracking-tight group-hover:text-[#e24a48] transition-colors line-clamp-2 font-sans">
                              {article.title}
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
                            {formatCategory(article.category)}
                          </Link>
                          <span className="text-gray-300">&#8226;</span>
                          <span>{article.time.split(" ")[0]}</span>
                          {article.time.includes(" ") && (
                            <span className="flex items-center gap-0.5 ml-1 text-gray-400">
                              <Clock size={11} className="mr-0.5" />
                              <span>{article.time.split(" ")[1]}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Advertisement Banner (QC 650x300) between groups */}
              {groupIndex < articleGroups.length - 1 && (
                <AdBanner 
                  position="inline" 
                  ads={ads} 
                  fallbackImg="/qc_650_300_premium.webp" 
                  className="w-full rounded border border-gray-200 bg-gray-50 shadow-sm overflow-hidden aspect-[650/300]" 
                />
              )}
            </div>
          ))}

        </div>

        {/* Right Column: Sidebar (contains 300x600 Ads) - Hidden on Mobile */}
        <div className="hidden lg:block w-[300px] flex-shrink-0 space-y-4 lg:sticky lg:top-4">
          {/* Ad 1: Zento Premium Cabinet */}
          <AdBanner 
            position="sidebar_1" 
            ads={ads} 
            fallbackImg="/zento_cabinet_ad.webp" 
            className="w-full md:w-[300px] md:h-[600px] rounded border border-gray-200 bg-gray-50 shadow-sm mx-auto overflow-hidden" 
          />

          {/* Ad 2: ZTC Massage Bathtub */}
          <AdBanner 
            position="sidebar_2" 
            ads={ads} 
            fallbackImg="/ztc_bathtub_ad.webp" 
            className="w-full md:w-[300px] md:h-[600px] rounded border border-gray-200 bg-gray-50 shadow-sm mx-auto overflow-hidden" 
          />

          {/* Ad 3: Zento Premium Toilet */}
          <AdBanner 
            position="sidebar_3" 
            ads={ads} 
            fallbackImg="/zento_toilet_ad.webp" 
            className="w-full md:w-[300px] md:h-[600px] rounded border border-gray-200 bg-gray-50 shadow-sm mx-auto overflow-hidden" 
          />
        </div>
      </div>

      {/* Bottom Full-Width Ad (970x250) */}
      <AdBanner 
        position="footer" 
        ads={ads} 
        fallbackImg="/vietnam_airlines_ad.webp" 
        className="w-full md:w-[970px] rounded border border-gray-200 bg-gray-50 shadow-sm mx-auto mt-4 overflow-hidden aspect-[970/250] md:aspect-auto md:h-[250px]" 
      />
    </main>
  );
}
