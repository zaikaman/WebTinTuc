import Link from "next/link";
import { getCategorySlug, getHomeFeed } from "@/lib/api/news";
import { Clock } from "lucide-react";

export default async function HomePage() {
  const { featuredArticle, latestArticles } = await getHomeFeed();

  // Slice to exactly 6 articles just in case
  const articlesToDisplay = latestArticles.slice(0, 6);

  // Helper to chunk articles into groups of 3
  const articleGroups = [];
  for (let i = 0; i < articlesToDisplay.length; i += 3) {
    articleGroups.push(articlesToDisplay.slice(i, i + 3));
  }

  return (
    <main className="w-full px-3 md:px-0 py-4 font-sans text-xs flex flex-col gap-6">
      {/* Main Two-Column Layout */}
      <div className="flex flex-col lg:flex-row gap-5 items-start w-full">
        {/* Left Column: Featured Article, Header & List with 650x300 Ads */}
        <div className="w-full lg:w-[650px] flex-shrink-0 flex flex-col gap-4">
          
          {/* Main Featured Article at the Top */}
          {featuredArticle && (
            <Link
              href={`/posts/${featuredArticle.id}`}
              className="group block cursor-pointer bg-white border border-gray-200 rounded-sm overflow-hidden p-3.5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-full aspect-[16/9] overflow-hidden bg-gray-100 rounded-sm border border-gray-200">
                <img
                  src={featuredArticle.image}
                  alt={featuredArticle.title}
                  className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-500"
                />
              </div>
              <h2 className="text-gray-900 font-bold text-base sm:text-[19px] leading-snug tracking-tight mt-3 mb-2 font-sans group-hover:text-[#e24a48] transition-colors">
                {featuredArticle.title}
              </h2>
            </Link>
          )}

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
              <div className="flex flex-col bg-white border border-gray-200 rounded-sm p-4 shadow-sm divide-y divide-gray-200">
                {group.map((article, index) => {
                  const categorySlug = getCategorySlug(article.category);
                  const displayIntro = article.intro || `Bản tin mới nhất về ${article.category.toLowerCase()} - Cập nhật nhanh các thông tin xoay quanh chủ đề "${article.title}" đang thu hút sự chú ý của độc giả.`;
                  return (
                    <div
                      key={`${article.id}-${index}`}
                      className="group flex gap-4 py-5 first:pt-2 last:pb-2 transition-colors hover:bg-gray-50/30"
                    >
                      {/* Thumbnail Left */}
                      <Link
                        href={`/posts/${article.id}`}
                        className="relative w-[130px] h-[82px] sm:w-[220px] sm:h-[138px] flex-shrink-0 overflow-hidden border border-gray-200 bg-gray-50 rounded-sm block"
                      >
                        <img
                          src={article.image || "/placeholder.svg"}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>

                      {/* Title & Metadata Right */}
                      <div className="flex flex-col justify-between py-0.5 flex-1 min-h-[82px] sm:min-h-[138px]">
                        <div>
                          <Link href={`/posts/${article.id}`} className="block">
                            <h3 className="text-gray-900 font-bold text-xs sm:text-[16px] leading-snug tracking-tight group-hover:text-[#e24a48] transition-colors line-clamp-2 font-sans">
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
                            className="text-gray-750 hover:text-[#e24a48] font-semibold text-[10px] sm:text-[11px] tracking-wide transition-colors duration-150 hover:underline"
                          >
                            {article.category}
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
                <div className="relative w-full aspect-[650/300] overflow-hidden rounded-sm border border-gray-200 bg-gray-50 flex justify-center group shadow-sm">
                  <a href="#" className="block w-full h-full">
                    <img
                      src="/qc_650_300_premium.png"
                      alt={`Quảng cáo ${groupIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </a>
                  <div className="absolute top-1 right-1 bg-black/45 hover:bg-black/75 text-white/90 text-[9px] px-1.5 py-0.5 cursor-pointer rounded-sm select-none z-10 transition-colors">
                    Quảng cáo &times;
                  </div>
                </div>
              )}
            </div>
          ))}

        </div>

        {/* Right Column: Sidebar (contains 300x600 Ads) */}
        <div className="w-full lg:w-[300px] flex-shrink-0 space-y-4 lg:sticky lg:top-4">
          {/* Ad 1: Zento Premium Cabinet */}
          <div className="relative w-full md:w-[300px] md:h-[600px] overflow-hidden rounded border border-gray-200 bg-gray-50 flex justify-center group shadow-sm mx-auto">
            <a href="#" className="block w-full h-full">
              <img
                src="/zento_cabinet_ad.png"
                alt="Zento Premium Cabinet Ad"
                className="w-full h-full object-cover"
              />
            </a>
            <div className="absolute top-1.5 right-1.5 bg-black/45 hover:bg-black/75 text-white/90 text-[9px] px-1.5 py-0.5 cursor-pointer rounded select-none z-10 transition-colors">
              Quảng cáo &times;
            </div>
          </div>

          {/* Ad 2: ZTC Massage Bathtub */}
          <div className="relative w-full md:w-[300px] md:h-[600px] overflow-hidden rounded border border-gray-200 bg-gray-50 flex justify-center group shadow-sm mx-auto">
            <a href="#" className="block w-full h-full">
              <img
                src="/ztc_bathtub_ad.png"
                alt="ZTC Massage Bathtub Ad"
                className="w-full h-full object-cover"
              />
            </a>
            <div className="absolute top-1.5 right-1.5 bg-black/45 hover:bg-black/75 text-white/90 text-[9px] px-1.5 py-0.5 cursor-pointer rounded select-none z-10 transition-colors">
              Quảng cáo &times;
            </div>
          </div>

          {/* Ad 3: Zento Premium Toilet */}
          <div className="relative w-full md:w-[300px] md:h-[600px] overflow-hidden rounded border border-gray-200 bg-gray-50 flex justify-center group shadow-sm mx-auto">
            <a href="#" className="block w-full h-full">
              <img
                src="/zento_toilet_ad.png"
                alt="Zento Premium Toilet Banner Ad"
                className="w-full h-full object-cover"
              />
            </a>
            <div className="absolute top-1.5 right-1.5 bg-black/45 hover:bg-black/75 text-white/90 text-[9px] px-1.5 py-0.5 cursor-pointer rounded select-none z-10 transition-colors">
              Quảng cáo &times;
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Full-Width Ad (970x250) */}
      <div className="relative w-full md:w-[970px] md:h-[250px] overflow-hidden rounded border border-gray-200 bg-gray-50 flex justify-center group shadow-sm mx-auto mt-4">
        <a href="#" className="block w-full h-full">
          <img
            src="/vietnam_airlines_ad.png"
            alt="Quảng cáo 970x250"
            className="w-full h-full object-cover"
          />
        </a>
        <div className="absolute top-1.5 right-1.5 bg-black/45 hover:bg-black/75 text-white/90 text-[9px] px-1.5 py-0.5 cursor-pointer rounded select-none z-10 transition-colors">
          Quảng cáo &times;
        </div>
      </div>
    </main>
  );
}
