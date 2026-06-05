import Link from "next/link";
import { mockArticles, getCategorySlug } from "@/lib/mockData";
import { Clock } from "lucide-react";

export default function HomePage() {
  // Find the Hanoi Heatwave article as the main featured article
  const featuredArticle = mockArticles.find((a) => a.id === "hanoi-nang-nong-38-7") || mockArticles[0];

  // Let's create a list of articles under it following the layout of the screenshots
  const listArticleIds = [
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

  // Map to get full article structures
  const listArticles = listArticleIds
    .map((id) => mockArticles.find((a) => a.id === id))
    .filter(Boolean);

  return (
    <main className="w-full px-3 md:px-0 py-4 font-sans text-xs">
      {/* Top Banner Advertisement (Vietnam Airlines ad) */}
      <div className="relative w-full md:w-[970px] md:h-[250px] overflow-hidden rounded border border-gray-200 mb-4 bg-gray-50 group mx-auto">
        <a href="#" className="block w-full h-full">
          <img
            src="/vietnam_airlines_ad.png"
            alt="Vietnam Airlines Banner Perth"
            className="w-full h-full object-cover"
          />
        </a>
        <div className="absolute top-1 right-1 bg-black/40 hover:bg-black/70 text-white/90 text-[9px] px-1.5 py-0.5 cursor-pointer rounded select-none">
          Quảng cáo &times;
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Left Column: Articles */}
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
              <h2 className="text-gray-900 font-bold text-base sm:text-[19px] leading-snug tracking-tight mt-3 mb-2 font-sans group-hover:text-brand-red transition-colors">
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

          {/* List of Articles Stretching Down */}
          <div className="flex flex-col bg-white border border-gray-200 rounded-sm p-4 shadow-sm divide-y divide-gray-200">
            {listArticles.map((article, index) => {
              if (!article) return null;
              const categorySlug = getCategorySlug(article.category);
              return (
                <div
                  key={`${article.id}-${index}`}
                  className="group flex gap-4 py-4 first:pt-1 last:pb-1 transition-colors hover:bg-gray-50/30"
                >
                  {/* Thumbnail Left */}
                  <Link
                    href={`/posts/${article.id}`}
                    className="relative w-[130px] h-[82px] sm:w-[160px] sm:h-[100px] flex-shrink-0 overflow-hidden border border-gray-200 bg-gray-50 rounded-sm block"
                  >
                    <img
                      src={article.image || "/placeholder.svg"}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>

                  {/* Title & Metadata Right */}
                  <div className="flex flex-col justify-between py-0.5 flex-1 min-h-[82px] sm:min-h-[100px]">
                    <div>
                      <Link href={`/posts/${article.id}`} className="block">
                        <h3 className="text-gray-900 font-bold text-xs sm:text-[14px] leading-snug tracking-tight group-hover:text-brand-red transition-colors line-clamp-2 font-sans">
                          {article.title}
                        </h3>
                      </Link>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-2 mt-2 text-[10px] sm:text-[11px] text-gray-500 font-sans font-medium">
                      <Link
                        href={`/${categorySlug}`}
                        className="text-gray-700 hover:text-brand-red font-semibold text-[10px] sm:text-[11px] tracking-wide transition-colors duration-150 hover:underline"
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

          {/* Bottom Advertisement Banner (QC 650x300) */}
          <div className="relative w-full aspect-[650/300] overflow-hidden rounded-sm border border-gray-200 bg-gray-50 flex justify-center group shadow-sm">
            <a href="#" className="block w-full h-full">
              <img
                src="/qc_650_300_premium.png"
                alt="Quảng cáo 650x300"
                className="w-full h-full object-cover"
              />
            </a>
            <div className="absolute top-1 right-1 bg-black/45 hover:bg-black/75 text-white/90 text-[9px] px-1.5 py-0.5 cursor-pointer rounded-sm select-none z-10 transition-colors">
              Quảng cáo &times;
            </div>
          </div>

        </div>

        {/* Right Column: Sidebar */}
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
            <div className="absolute top-1 right-1 bg-black/45 hover:bg-black/75 text-white/90 text-[9px] px-1.5 py-0.5 cursor-pointer rounded select-none z-10 transition-colors">
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
            <div className="absolute top-1 right-1 bg-black/45 hover:bg-black/75 text-white/90 text-[9px] px-1.5 py-0.5 cursor-pointer rounded select-none z-10 transition-colors">
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
            <div className="absolute top-1 right-1 bg-black/45 hover:bg-black/75 text-white/90 text-[9px] px-1.5 py-0.5 cursor-pointer rounded select-none z-10 transition-colors">
              Quảng cáo &times;
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
