import type { Metadata } from "next";
import { searchPublicArticles, getPublicAds } from "@/lib/api/news";
import Link from "next/link";
import Image from "next/image";
import { Clock, Search } from "lucide-react";
import AdBanner from "@/components/AdBanner";
import { formatCategory } from "@/lib/utils";

export const revalidate = 0; // search results should always load dynamically

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { q = "" } = await searchParams;
  const titleText = q ? `Kết quả tìm kiếm cho "${q}"` : "Tìm kiếm bài viết";
  return {
    title: `${titleText} | WebTinTuc - Tin tức game, anime, công nghệ`,
    description: `Tìm kiếm và đọc tin tức mới nhất về game, anime, manga và công nghệ trên WebTinTuc.`,
    alternates: {
      canonical: "/search",
    },
    openGraph: {
      type: "website",
      title: `${titleText} - WebTinTuc`,
      description: `Tìm kiếm tin tức trên WebTinTuc`,
      url: `/search`,
      siteName: "WebTinTuc",
      locale: "vi_VN",
    },
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q = "", page = "1" } = await searchParams;
  const pageNum = Math.max(1, Number(page));
  const limit = 12;

  const [searchData, ads] = await Promise.all([
    q.trim() ? searchPublicArticles(q.trim(), pageNum, limit) : Promise.resolve({ items: [], total: 0, totalPages: 1 }),
    getPublicAds()
  ]);

  const articles = searchData.items || [];
  const total = searchData.total || 0;
  const totalPages = searchData.totalPages || 1;

  const prevPage = pageNum > 1 ? pageNum - 1 : null;
  const nextPage = pageNum < totalPages ? pageNum + 1 : null;

  const buildPageUrl = (p: number) => `/search?q=${encodeURIComponent(q)}&page=${p}`;

  const listPart1 = articles.slice(0, 6);
  const listPart2 = articles.slice(6);

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
        {/* Left Column: Search results */}
        <div className="w-full lg:w-[650px] flex-shrink-0 flex flex-col gap-5">
          
          {/* Search Header Info */}
          <div className="bg-gray-50 border border-gray-200/60 rounded-xl p-4 sm:p-5 flex flex-col gap-3.5 shadow-sm">
            <h1 className="text-gray-900 font-extrabold text-[15px] sm:text-[17px] leading-tight">
              {q ? (
                <>
                  Kết quả tìm kiếm cho: <span className="text-[#df3232]">&ldquo;{q}&rdquo;</span>
                </>
              ) : (
                "Tìm kiếm bài viết"
              )}
            </h1>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              {q ? `Tìm thấy ${total} bài viết phù hợp` : "Nhập từ khóa bên dưới để bắt đầu tìm kiếm bài viết trên hệ thống"}
            </p>

            {/* In-page Search Box */}
            <form action="/search" method="GET" className="relative w-full mt-1.5">
              <div className="flex h-[38px] w-full items-center rounded-xl border border-gray-300 bg-white px-4 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] focus-within:border-[#df3232] focus-within:ring-2 focus-within:ring-[#df3232]/10 transition-all">
                <Search size={14} className="mr-2 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  name="q"
                  defaultValue={q}
                  placeholder="Nhập từ khóa tìm kiếm bài viết..."
                  className="h-full w-full bg-transparent text-xs font-bold text-gray-800 outline-none placeholder:text-gray-400"
                />
              </div>
            </form>
          </div>

          {/* Results List */}
          {articles.length > 0 ? (
            <>
              {/* List Part 1 (First 6 items) */}
              <div className="bg-white md:border md:border-gray-200 p-0 md:p-4 rounded-sm md:shadow-sm flex flex-col gap-4">
                {listPart1.map((item) => (
                  <Link
                    key={item.id}
                    href={`/posts/${item.id}`}
                    prefetch={true}
                    className="group flex gap-3.5 cursor-pointer pb-4 border-b border-gray-100 last:border-b-0 last:pb-0 transition-colors"
                  >
                    <div className="relative w-[110px] h-[75px] sm:w-[130px] sm:h-[88px] flex-shrink-0 overflow-hidden border border-gray-200 bg-gray-50 rounded-md md:rounded-sm">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="(max-width: 640px) 110px, 130px"
                          className="object-cover group-hover:scale-103 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">No Image</div>
                      )}
                    </div>
                    <div className="flex flex-col justify-between py-0.5 flex-1 min-w-0">
                      <h3 className="text-gray-800 font-bold text-[13.5px] sm:text-[13px] leading-snug group-hover:text-[#df3232] transition-colors line-clamp-2 sm:line-clamp-3 text-left">
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

              {/* List Part 2 (Next 6 items) */}
              {listPart2.length > 0 && (
                <div className="bg-white md:border md:border-gray-200 p-0 md:p-4 rounded-sm md:shadow-sm flex flex-col gap-4">
                  {listPart2.map((item) => (
                    <Link
                      key={item.id}
                      href={`/posts/${item.id}`}
                      prefetch={true}
                      className="group flex gap-3.5 cursor-pointer pb-4 border-b border-gray-100 last:border-b-0 last:pb-0 transition-colors"
                    >
                      <div className="relative w-[110px] h-[75px] sm:w-[130px] sm:h-[88px] flex-shrink-0 overflow-hidden border border-gray-200 bg-gray-50 rounded-md md:rounded-sm">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            sizes="(max-width: 640px) 110px, 130px"
                            className="object-cover group-hover:scale-103 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">No Image</div>
                        )}
                      </div>
                      <div className="flex flex-col justify-between py-0.5 flex-1 min-w-0">
                        <h3 className="text-gray-800 font-bold text-[13.5px] sm:text-[13px] leading-snug group-hover:text-[#df3232] transition-colors line-clamp-2 sm:line-clamp-3 text-left">
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
              )}

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-100 pt-5 mt-3 px-1.5">
                  {prevPage ? (
                    <Link
                      href={buildPageUrl(prevPage)}
                      className="px-5 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-full text-[12px] font-extrabold text-gray-700 transition-all select-none active:scale-[0.98] shadow-sm flex items-center"
                    >
                      &larr; Trang trước
                    </Link>
                  ) : (
                    <span className="px-5 py-2.5 border border-gray-100 rounded-full text-[12px] font-extrabold text-gray-300 cursor-not-allowed select-none bg-gray-50/50">
                      &larr; Trang trước
                    </span>
                  )}
                  <span className="text-[12px] font-extrabold text-gray-500">
                    Trang {pageNum} / {totalPages}
                  </span>
                  {nextPage ? (
                    <Link
                      href={buildPageUrl(nextPage)}
                      className="px-5 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-full text-[12px] font-extrabold text-gray-700 transition-all select-none active:scale-[0.98] shadow-sm flex items-center"
                    >
                      Trang sau &rarr;
                    </Link>
                  ) : (
                    <span className="px-5 py-2.5 border border-gray-100 rounded-full text-[12px] font-extrabold text-gray-300 cursor-not-allowed select-none bg-gray-50/50">
                      Trang sau &rarr;
                    </span>
                  )}
                </div>
              )}
            </>
          ) : (
            q.trim() && (
              <div className="py-16 text-center border border-dashed border-gray-200 rounded-2xl bg-gray-50/50 px-6">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mx-auto mb-3">
                  <Search size={20} />
                </div>
                <p className="text-gray-500 text-[13px] font-extrabold">Không tìm thấy bài viết nào phù hợp</p>
                <p className="text-gray-400 text-[11px] mt-1 max-w-[320px] mx-auto leading-relaxed">
                  Vui lòng kiểm tra lại chính tả hoặc thử tìm kiếm với một từ khóa khác tổng quát hơn.
                </p>
              </div>
            )
          )}
        </div>

        {/* Right Column: Sticky Sidebar Ads */}
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
