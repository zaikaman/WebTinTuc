"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Clock, 
  Search, 
  AlertCircle, 
  ChevronDown, 
  SlidersHorizontal, 
  RotateCcw, 
  Eye, 
  Calendar, 
  ArrowUpDown, 
  Filter 
} from "lucide-react";
import type { Article } from "@/lib/types/news";
import { formatCategory } from "@/lib/utils";
import AdBanner from "@/components/AdBanner";

interface SearchContentProps {
  query: string;
  initialArticles: Article[];
  ads?: any[];
  categories?: any[];
}

export function SearchContent({ query, initialArticles, ads = [], categories = [] }: SearchContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Local states for inputs and filters
  const [searchInput, setSearchInput] = useState(query);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [timeRangeFilter, setTimeRangeFilter] = useState("all");
  const [scopeFilter, setScopeFilter] = useState("all");
  const [sortByFilter, setSortByFilter] = useState("relevant");
  
  // Show/Hide advanced filter panel
  const [showFilters, setShowFilters] = useState(true);

  // Initialize filter states from URL query parameters if present
  useEffect(() => {
    setSearchInput(query);
    if (searchParams) {
      setCategoryFilter(searchParams.get("category") || "all");
      setTimeRangeFilter(searchParams.get("timeRange") || "all");
      setScopeFilter(searchParams.get("scope") || "all");
      setSortByFilter(searchParams.get("sortBy") || "relevant");
    }
  }, [query, searchParams]);

  // Compute filtered and sorted articles dynamically
  const filteredArticles = initialArticles.filter((article) => {
    // 1. Category Filter
    if (categoryFilter !== "all" && article.categorySlug !== categoryFilter) {
      return false;
    }

    // 2. Time Range Filter
    if (timeRangeFilter !== "all") {
      const articleDate = new Date(article.time);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - articleDate.getTime());
      const diffHours = diffTime / (1000 * 60 * 60);
      const diffDays = diffHours / 24;

      if (timeRangeFilter === "day" && diffHours > 24) return false;
      if (timeRangeFilter === "week" && diffDays > 7) return false;
      if (timeRangeFilter === "month" && diffDays > 30) return false;
      if (timeRangeFilter === "year" && diffDays > 365) return false;
    }

    // 3. Search Scope Filter
    if (scopeFilter !== "all") {
      const queryLower = query.toLowerCase().trim();
      if (!queryLower) return true;

      if (scopeFilter === "title") {
        return article.title.toLowerCase().includes(queryLower);
      }
      if (scopeFilter === "summary") {
        return (article.intro || "").toLowerCase().includes(queryLower);
      }
    }

    return true;
  });

  // Sort articles
  const sortedArticles = [...filteredArticles].sort((a, b) => {
    if (sortByFilter === "newest") {
      return new Date(b.time).getTime() - new Date(a.time).getTime();
    }
    if (sortByFilter === "oldest") {
      return new Date(a.time).getTime() - new Date(b.time).getTime();
    }
    if (sortByFilter === "views") {
      return (b.views || 0) - (a.views || 0);
    }
    // "relevant" is the default order from backend (search relevance)
    return 0;
  });

  // Pagination states
  const [visibleList, setVisibleList] = useState<Article[]>([]);
  const [extraList, setExtraList] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  // Reset pagination when sorted articles change
  useEffect(() => {
    setVisibleList(sortedArticles.slice(0, 12));
    setExtraList(sortedArticles.slice(12));
    setHasMore(sortedArticles.length > 12);
  }, [categoryFilter, timeRangeFilter, scopeFilter, sortByFilter, initialArticles]);

  const handleLoadMore = () => {
    if (loading || !hasMore) return;
    setLoading(true);

    setTimeout(() => {
      setVisibleList((prev) => [...prev, ...extraList]);
      setExtraList([]);
      setLoading(false);
      setHasMore(false);
    }, 600);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSearch(searchInput);
  };

  const triggerSearch = (qValue: string) => {
    const params = new URLSearchParams();
    if (qValue.trim()) params.set("q", qValue.trim());
    if (categoryFilter !== "all") params.set("category", categoryFilter);
    if (timeRangeFilter !== "all") params.set("timeRange", timeRangeFilter);
    if (scopeFilter !== "all") params.set("scope", scopeFilter);
    if (sortByFilter !== "relevant") params.set("sortBy", sortByFilter);

    router.push(`/search?${params.toString()}`);
  };

  const handleResetFilters = () => {
    setCategoryFilter("all");
    setTimeRangeFilter("all");
    setScopeFilter("all");
    setSortByFilter("relevant");
    
    // Also push clean query URL
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const hasActiveFilters = categoryFilter !== "all" || timeRangeFilter !== "all" || scopeFilter !== "all" || sortByFilter !== "relevant";

  const listPart1 = visibleList.slice(0, 6);
  const listPart2 = visibleList.slice(6);

  return (
    <main className="w-full px-3 md:px-0 py-4 font-sans text-xs flex flex-col gap-5 bg-white">
      {/* Top Banner Advertisement */}
      <AdBanner 
        position="header" 
        ads={ads} 
        fallbackImg="/vinfast_ad.webp" 
        className="w-full md:w-[970px] rounded border border-gray-200 bg-gray-50 shadow-sm mx-auto overflow-hidden aspect-[970/250] md:aspect-auto md:h-[250px]" 
      />

      {/* Main Two-Column Layout */}
      <div className="flex flex-col lg:flex-row gap-5 items-start w-full">
        {/* Left Column: Advanced Search & Results */}
        <div className="w-full lg:w-[650px] flex-shrink-0 flex flex-col gap-5">
          
          {/* Advanced Search Control Card */}
          <div className="w-full bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 md:p-5 shadow-sm flex flex-col gap-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-[#df3232]" />
                <span className="font-extrabold text-[13px] text-gray-800 uppercase tracking-wide">
                  Tìm kiếm nâng cao
                </span>
              </div>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="text-gray-500 hover:text-gray-850 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 px-2.5 py-1 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                {showFilters ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
              </button>
            </div>

            {/* Search query input */}
            <form onSubmit={handleSearchSubmit} className="w-full flex gap-3 items-center">
              <div className="flex-1 flex h-[46px] items-center rounded-lg border border-gray-200 bg-white px-4 focus-within:border-[#df3232] focus-within:ring-2 focus-within:ring-[#df3232]/10 transition-all shadow-inner">
                <Search size={18} className="mr-3 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Nhập từ khóa tìm kiếm..."
                  className="h-full w-full bg-transparent text-sm font-semibold text-gray-800 outline-none placeholder:text-gray-400"
                />
              </div>
              <button 
                type="submit" 
                className="flex-shrink-0 whitespace-nowrap bg-[#df3232] hover:bg-[#df3232]/90 text-white font-extrabold text-[11px] tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-md active:scale-98 h-[46px] w-[100px] md:w-[120px] uppercase"
              >
                <Search size={14} />
                Tìm kiếm
              </button>
            </form>

            {/* Filter grid collapsible */}
            {showFilters && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1 border-t border-gray-100">
                {/* Category Dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <Filter size={10} />
                    Chuyên mục
                  </label>
                  <div className="relative">
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-xs font-bold text-gray-700 outline-none focus:border-[#df3232] focus:ring-2 focus:ring-[#df3232]/10 transition-all cursor-pointer appearance-none shadow-sm"
                    >
                      <option value="all">Tất cả</option>
                      {categories.map((cat: any) => (
                        <option key={cat.slug} value={cat.slug}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={13} />
                  </div>
                </div>

                {/* Time Range Dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <Calendar size={10} />
                    Thời gian
                  </label>
                  <div className="relative">
                    <select
                      value={timeRangeFilter}
                      onChange={(e) => setTimeRangeFilter(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-xs font-bold text-gray-700 outline-none focus:border-[#df3232] focus:ring-2 focus:ring-[#df3232]/10 transition-all cursor-pointer appearance-none shadow-sm"
                    >
                      <option value="all">Mọi thời gian</option>
                      <option value="day">24 giờ qua</option>
                      <option value="week">1 tuần qua</option>
                      <option value="month">1 tháng qua</option>
                      <option value="year">1 năm qua</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={13} />
                  </div>
                </div>

                {/* Search Scope Dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <AlertCircle size={10} />
                    Phạm vi tìm
                  </label>
                  <div className="relative">
                    <select
                      value={scopeFilter}
                      onChange={(e) => setScopeFilter(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-xs font-bold text-gray-700 outline-none focus:border-[#df3232] focus:ring-2 focus:ring-[#df3232]/10 transition-all cursor-pointer appearance-none shadow-sm"
                    >
                      <option value="all">Toàn bộ bài viết</option>
                      <option value="title">Chỉ tiêu đề</option>
                      <option value="summary">Chỉ tóm tắt</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={13} />
                  </div>
                </div>

                {/* Sort By Dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <ArrowUpDown size={10} />
                    Sắp xếp theo
                  </label>
                  <div className="relative">
                    <select
                      value={sortByFilter}
                      onChange={(e) => setSortByFilter(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-xs font-bold text-gray-700 outline-none focus:border-[#df3232] focus:ring-2 focus:ring-[#df3232]/10 transition-all cursor-pointer appearance-none shadow-sm"
                    >
                      <option value="relevant">Phù hợp nhất</option>
                      <option value="newest">Mới nhất</option>
                      <option value="oldest">Cũ nhất</option>
                      <option value="views">Xem nhiều nhất</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={13} />
                  </div>
                </div>
              </div>
            )}

            {/* Applied filters tags and reset button */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mr-1">Đang lọc:</span>
                  {categoryFilter !== "all" && (
                    <span className="bg-red-50 text-[#df3232] border border-red-100 rounded-full px-2.5 py-0.5 text-[10px] font-bold flex items-center gap-1">
                      Chuyên mục: {categories.find((c: any) => c.slug === categoryFilter)?.name || categoryFilter}
                      <button onClick={() => setCategoryFilter("all")} className="hover:text-black font-extrabold ml-0.5">×</button>
                    </span>
                  )}
                  {timeRangeFilter !== "all" && (
                    <span className="bg-blue-50 text-blue-600 border border-blue-100 rounded-full px-2.5 py-0.5 text-[10px] font-bold flex items-center gap-1">
                      Thời gian: {timeRangeFilter === "day" ? "24 giờ qua" : timeRangeFilter === "week" ? "1 tuần qua" : timeRangeFilter === "month" ? "1 tháng qua" : "1 năm qua"}
                      <button onClick={() => setTimeRangeFilter("all")} className="hover:text-black font-extrabold ml-0.5">×</button>
                    </span>
                  )}
                  {scopeFilter !== "all" && (
                    <span className="bg-amber-50 text-amber-600 border border-amber-100 rounded-full px-2.5 py-0.5 text-[10px] font-bold flex items-center gap-1">
                      Phạm vi: {scopeFilter === "title" ? "Chỉ tiêu đề" : "Chỉ tóm tắt"}
                      <button onClick={() => setScopeFilter("all")} className="hover:text-black font-extrabold ml-0.5">×</button>
                    </span>
                  )}
                  {sortByFilter !== "relevant" && (
                    <span className="bg-purple-50 text-purple-600 border border-purple-100 rounded-full px-2.5 py-0.5 text-[10px] font-bold flex items-center gap-1">
                      Sắp xếp: {sortByFilter === "newest" ? "Mới nhất" : sortByFilter === "oldest" ? "Cũ nhất" : "Xem nhiều nhất"}
                      <button onClick={() => setSortByFilter("relevant")} className="hover:text-black font-extrabold ml-0.5">×</button>
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-gray-500 hover:text-[#df3232] text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 transition-colors bg-white hover:bg-red-50 border border-gray-200 hover:border-red-150 rounded px-2.5 py-1"
                >
                  <RotateCcw size={10} />
                  Đặt lại
                </button>
              </div>
            )}
          </div>

          {/* Search Result Category Header */}
          <div className="flex items-center gap-2 border-b-2 border-[#e24a48] pb-1 mt-2">
            <span className="bg-[#e24a48] text-white font-bold text-[11px] px-3 py-1 uppercase tracking-wider rounded-sm">
              Kết quả tìm kiếm
            </span>
            {query && (
              <span className="text-gray-500 font-bold text-xs pl-1">
                cho: &ldquo;{query}&rdquo; ({sortedArticles.length} kết quả)
              </span>
            )}
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {sortedArticles.length === 0 ? (
            /* Empty State */
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-10 flex flex-col items-center justify-center text-center gap-3">
              <AlertCircle size={40} className="text-gray-400 animate-pulse" />
              <h3 className="text-gray-800 font-bold text-[14px]">Không tìm thấy kết quả nào phù hợp</h3>
              <p className="text-gray-500 text-xs max-w-md">
                Không có bài viết nào khớp với từ khóa tìm kiếm và các bộ lọc đang chọn. Vui lòng thay đổi bộ lọc hoặc kiểm tra lại chính tả.
              </p>
            </div>
          ) : (
            <>
              {/* List Part 1 (First 6 items) */}
              <div className="bg-white md:border md:border-gray-200 p-0 md:p-4 rounded-xl md:shadow-sm flex flex-col gap-4">
                {listPart1.map((item) => (
                  <Link
                    key={item.id}
                    href={`/posts/${item.id}`}
                    prefetch={true}
                    className="group flex gap-3.5 cursor-pointer pb-4 border-b border-gray-100 last:border-b-0 last:pb-0 transition-colors"
                  >
                    <div className="relative w-[110px] h-[75px] sm:w-[130px] sm:h-[88px] flex-shrink-0 overflow-hidden border border-gray-200 bg-gray-50 rounded-md md:rounded-sm">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 110px, 130px"
                        className="object-cover group-hover:scale-103 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex flex-col justify-between py-0.5 flex-1">
                      <div>
                        <h3 className="text-gray-800 font-bold text-[13.5px] sm:text-[13px] leading-snug group-hover:text-[#df3232] transition-colors line-clamp-2">
                          {item.title}
                        </h3>
                        {item.intro && (
                          <p className="hidden sm:line-clamp-2 text-gray-500 text-[11px] leading-normal mt-1.5 font-sans">
                            {item.intro}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-400 font-semibold text-[10px] mt-1.5">
                        <span className="text-[#df3232] font-bold">{formatCategory(item.category)}</span>
                        <span className="text-gray-200 font-normal">|</span>
                        <span>{item.time.split(" ")[0]}</span>
                        {item.time.includes(" ") && (
                          <>
                            <Clock size={11} className="text-gray-400 flex-shrink-0 -mt-0.5" />
                            <span className="font-normal">{item.time.split(" ")[1]}</span>
                          </>
                        )}
                        {typeof item.views === "number" && (
                          <>
                            <span className="text-gray-200 font-normal">|</span>
                            <Eye size={11} className="text-gray-400 flex-shrink-0 -mt-0.5" />
                            <span className="font-normal">{item.views} lượt xem</span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Middle Banner Ad */}
              <AdBanner 
                position="inline" 
                ads={ads} 
                fallbackImg="/qc_650_300_premium.webp" 
                className="w-full rounded border border-gray-200 bg-gray-50 shadow-sm overflow-hidden aspect-[650/300]" 
              />

              {/* List Part 2 (Next 6 items + Load More items) */}
              {listPart2.length > 0 && (
                <div className="bg-white md:border md:border-gray-200 p-0 md:p-4 rounded-xl md:shadow-sm flex flex-col gap-4">
                  {listPart2.map((item) => (
                    <Link
                      key={item.id}
                      href={`/posts/${item.id}`}
                      prefetch={true}
                      className="group flex gap-3.5 cursor-pointer pb-4 border-b border-gray-100 last:border-b-0 last:pb-0 transition-colors"
                    >
                      <div className="relative w-[110px] h-[75px] sm:w-[130px] sm:h-[88px] flex-shrink-0 overflow-hidden border border-gray-200 bg-gray-50 rounded-md md:rounded-sm">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.title}
                          fill
                          sizes="(max-width: 640px) 110px, 130px"
                          className="object-cover group-hover:scale-103 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex flex-col justify-between py-0.5 flex-1">
                        <div>
                          <h3 className="text-gray-800 font-bold text-[13.5px] sm:text-[13px] leading-snug group-hover:text-[#df3232] transition-colors line-clamp-2">
                            {item.title}
                          </h3>
                          {item.intro && (
                            <p className="hidden sm:line-clamp-2 text-gray-500 text-[11px] leading-normal mt-1.5 font-sans">
                              {item.intro}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-400 font-semibold text-[10px] mt-1.5">
                          <span className="text-[#df3232] font-bold">{formatCategory(item.category)}</span>
                          <span className="text-gray-200 font-normal">|</span>
                          <span>{item.time.split(" ")[0]}</span>
                          {item.time.includes(" ") && (
                            <>
                              <Clock size={11} className="text-gray-400 flex-shrink-0 -mt-0.5" />
                              <span className="font-normal">{item.time.split(" ")[1]}</span>
                            </>
                          )}
                          {typeof item.views === "number" && (
                            <>
                              <span className="text-gray-200 font-normal">|</span>
                              <Eye size={11} className="text-gray-400 flex-shrink-0 -mt-0.5" />
                              <span className="font-normal">{item.views} lượt xem</span>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Load More Section */}
              <div className="bg-[#f2f2f2] p-4 flex justify-center items-center border border-gray-200 rounded-xl shadow-sm">
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
                    Đã hiển thị tất cả kết quả tìm kiếm.
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right Column: Sticky Sidebar Ads */}
        <aside className="hidden lg:flex w-[300px] flex-shrink-0 lg:sticky lg:top-4 flex-col gap-4">
          <AdBanner 
            position="sidebar_1" 
            ads={ads} 
            fallbackImg="/zento_cabinet_ad.webp" 
            className="w-full md:w-[300px] md:h-[600px] rounded border border-gray-200 bg-gray-50 shadow-sm mx-auto overflow-hidden animate-fadeIn" 
          />
          <AdBanner 
            position="sidebar_2" 
            ads={ads} 
            fallbackImg="/ztc_bathtub_ad.webp" 
            className="w-full md:w-[300px] md:h-[600px] rounded border border-gray-200 bg-gray-50 shadow-sm mx-auto overflow-hidden animate-fadeIn" 
          />
        </aside>
      </div>

      {/* Bottom Ad */}
      <AdBanner 
        position="footer" 
        ads={ads} 
        fallbackImg="/vietnam_airlines_ad.webp" 
        className="w-full md:w-[970px] mt-4 rounded border border-gray-200 bg-gray-50 shadow-sm mx-auto overflow-hidden aspect-[970/250] md:aspect-auto md:h-[250px]" 
      />
    </main>
  );
}
