import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getArticleById,
  getCategorySlug,
  getPostRecommendations,
} from "@/lib/api/news";
import { Clock, Link2, Star } from "lucide-react";
import { formatCategory } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PostDetailPage({ params }: PageProps) {
  const { id } = await params;
  const article = await getArticleById(id);

  if (!article) {
    notFound();
  }

  const { relatedPosts, likePosts } = await getPostRecommendations(id);

  return (
    <main className="w-full px-3 md:px-0 py-4 font-sans text-xs">
      {/* Top Banner Advertisement (QC 970x250) */}
      <div className="relative w-full md:w-[970px] overflow-hidden rounded border border-gray-200 mb-5 bg-gray-50 flex justify-center group shadow-sm mx-auto aspect-[970/250] md:aspect-auto md:h-[250px]">
        <a href="#" className="block w-full h-full">
          <img
            src="/vinfast_ad.png"
            alt="Quảng cáo 970x250"
            className="w-full h-full object-cover"
          />
        </a>
        <div className="absolute top-1.5 right-1.5 bg-black/40 hover:bg-black/70 text-white/90 text-[9px] px-1.5 py-0.5 cursor-pointer rounded select-none z-10 transition-colors">
          Quảng cáo &times;
        </div>
      </div>

      {/* Main Two-Column Content Layout */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Left Column: Post Content */}
        <div className="w-full lg:w-[650px] flex-shrink-0 flex flex-col gap-5">
          <article className="w-full bg-white md:border md:border-gray-200 p-0 md:p-5 rounded-sm md:shadow-sm">
            {/* Metadata: Category & Date Time */}
            <div className="flex items-center gap-1.5 text-gray-500 font-semibold mb-2">
              <Link
                href={`/${getCategorySlug(article.category)}`}
                className="text-[#df3232] font-bold text-[11px] hover:underline"
              >
                {formatCategory(article.category)}
              </Link>
              <span className="text-gray-300">&#8226;</span>
              <span className="text-[11px]">{article.time.split(" ")[0]}</span>
              {article.time.includes(" ") && (
                <>
                  <Clock size={11} className="text-gray-400 ml-1.5" />
                  <span className="text-[11px] font-normal">{article.time.split(" ")[1]}</span>
                </>
              )}
            </div>

            {/* Title */}
            <h1 className="text-gray-900 font-bold text-lg sm:text-xl md:text-2xl leading-snug tracking-tight mb-4 font-sans">
              {article.title}
            </h1>

            {/* Thin horizontal divider */}
            <hr className="border-gray-200 my-4" />

            {/* Bold Intro Paragraph */}
            {article.intro && (
              <p className="text-gray-900 font-bold text-xs sm:text-[13px] leading-relaxed mb-4">
                {article.intro}
              </p>
            )}

            {/* Content Blocks */}
            <div className="space-y-4 text-xs sm:text-[13px] text-gray-800 leading-relaxed">
              {article.content?.map((block, index) => {
                if (block.type === "paragraph") {
                  return (
                    <p key={index} className="text-gray-700 font-sans">
                      {block.text}
                    </p>
                  );
                } else if (block.type === "bold-paragraph") {
                  return (
                    <p key={index} className="font-bold text-gray-900 font-sans">
                      {block.text}
                    </p>
                  );
                } else if (block.type === "image") {
                  return (
                    <div key={index} className="my-4 space-y-1.5">
                      <div className="border border-gray-200 overflow-hidden bg-gray-50 rounded-md md:rounded-sm">
                        <img
                          src={block.src}
                          alt={block.caption || "Hình ảnh bài viết"}
                          className="w-full h-auto object-cover max-h-[500px] mx-auto"
                          loading="lazy"
                        />
                      </div>
                      {block.caption && (
                        <p className="text-gray-500 text-[11px] italic text-center px-4 leading-normal font-sans">
                          {block.caption}
                        </p>
                      )}
                    </div>
                  );
                } else if (block.type === "ad") {
                  return (
                    <div key={index} className="my-5">
                      {/* PC View */}
                      <div className="hidden md:flex relative w-full overflow-hidden rounded border border-gray-200 bg-gray-50 justify-center group shadow-sm aspect-[650/300]">
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

                      {/* Mobile View: Swipable vertical ads */}
                      <div className="flex md:hidden gap-3.5 my-2.5 overflow-x-auto scrollbar-none snap-x snap-mandatory">
                        <div className="w-[46%] min-w-[140px] flex-shrink-0 snap-start relative overflow-hidden rounded border border-gray-200 bg-gray-50 shadow-xs aspect-[300/600]">
                          <a href="#" className="block w-full h-full">
                            <img
                              src="/zento_cabinet_ad.png"
                              alt="Quảng cáo 1"
                              className="w-full h-full object-cover"
                            />
                          </a>
                          <div className="absolute top-1 right-1 bg-black/45 text-white/90 text-[8px] px-1 py-0.5 rounded-sm select-none z-10">
                            QC &times;
                          </div>
                        </div>
                        <div className="w-[46%] min-w-[140px] flex-shrink-0 snap-start relative overflow-hidden rounded border border-gray-200 bg-gray-50 shadow-xs aspect-[300/600]">
                          <a href="#" className="block w-full h-full">
                            <img
                              src="/ztc_bathtub_ad.png"
                              alt="Quảng cáo 2"
                              className="w-full h-full object-cover"
                            />
                          </a>
                          <div className="absolute top-1 right-1 bg-black/45 text-white/90 text-[8px] px-1 py-0.5 rounded-sm select-none z-10">
                            QC &times;
                          </div>
                        </div>
                        <div className="w-[46%] min-w-[140px] flex-shrink-0 snap-start relative overflow-hidden rounded border border-gray-200 bg-gray-50 shadow-xs aspect-[300/600]">
                          <a href="#" className="block w-full h-full">
                            <img
                              src="/zento_toilet_ad.png"
                              alt="Quảng cáo 3"
                              className="w-full h-full object-cover"
                            />
                          </a>
                          <div className="absolute top-1 right-1 bg-black/45 text-white/90 text-[8px] px-1 py-0.5 rounded-sm select-none z-10">
                            QC &times;
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>

            {/* Recommendations Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
              {/* Related Posts */}
              <div className="space-y-4">
                <div className="flex items-center gap-1.5 bg-[#ff8882] text-white px-3 py-2 font-bold text-[11px] sm:text-xs rounded-sm mb-3 border-l-4 border-brand-red">
                  <Link2 size={13} className="flex-shrink-0" />
                  <span>Các bài viết liên quan</span>
                </div>

                <div className="flex flex-col gap-4">
                  {relatedPosts.map((item) => {
                    const catSlug = getCategorySlug(item.category);
                    return (
                      <div
                        key={item.id}
                        className="group block space-y-1.5 pb-3 border-b border-gray-100 last:border-b-0 last:pb-0"
                      >
                        <Link href={`/posts/${item.id}`} className="block">
                          <div className="relative aspect-video w-full overflow-hidden bg-gray-100 rounded-md md:rounded-sm border border-gray-200">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        </Link>
                        <Link href={`/posts/${item.id}`} className="block">
                          <h3 className="text-gray-900 font-bold text-[11px] sm:text-xs leading-snug group-hover:text-brand-red transition-colors line-clamp-2">
                            {item.title}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-gray-500 font-semibold">
                          <Link
                            href={`/${catSlug}`}
                            className="text-[#df3232] font-bold hover:underline"
                          >
                            {formatCategory(item.category)}
                          </Link>
                          <span className="text-gray-300">&#8226;</span>
                          <span className="text-gray-400 font-normal">{item.time.split(" ")[0]}</span>
                          {item.time.includes(" ") && (
                            <>
                              <Clock size={10} className="text-gray-400 ml-1" />
                              <span className="text-gray-400 font-normal">{item.time.split(" ")[1]}</span>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* You Might Also Like */}
              <div className="space-y-4">
                <div className="flex items-center gap-1.5 bg-[#ff8882] text-white px-3 py-2 font-bold text-[11px] sm:text-xs rounded-sm mb-3 border-l-4 border-brand-red">
                  <Star size={13} className="flex-shrink-0" />
                  <span>Có thể bạn sẽ thích</span>
                </div>

                <div className="flex flex-col gap-4">
                  {likePosts.map((item) => {
                    const catSlug = getCategorySlug(item.category);
                    return (
                      <div
                        key={item.id}
                        className="group block space-y-1.5 pb-3 border-b border-gray-100 last:border-b-0 last:pb-0"
                      >
                        <Link href={`/posts/${item.id}`} className="block">
                          <div className="relative aspect-video w-full overflow-hidden bg-gray-100 rounded-md md:rounded-sm border border-gray-200">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        </Link>
                        <Link href={`/posts/${item.id}`} className="block">
                          <h3 className="text-gray-900 font-bold text-[11px] sm:text-xs leading-snug group-hover:text-brand-red transition-colors line-clamp-2">
                            {item.title}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-gray-500 font-semibold">
                          <Link
                            href={`/${catSlug}`}
                            className="text-[#df3232] font-bold hover:underline"
                          >
                            {formatCategory(item.category)}
                          </Link>
                          <span className="text-gray-300">&#8226;</span>
                          <span className="text-gray-400 font-normal">{item.time.split(" ")[0]}</span>
                          {item.time.includes(" ") && (
                            <>
                              <Clock size={10} className="text-gray-400 ml-1" />
                              <span className="text-gray-400 font-normal">{item.time.split(" ")[1]}</span>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </article>
        </div>

        {/* Right Column: Sidebar - Hidden on Mobile */}
        <aside className="hidden lg:block w-[300px] flex-shrink-0 lg:sticky lg:top-4 space-y-4">
          {/* Ad 1: QC 300x600 */}
          <div className="relative w-full md:w-[300px] md:h-[600px] overflow-hidden rounded border border-gray-200 bg-gray-50 flex justify-center group shadow-sm mx-auto">
            <a href="#" className="block w-full h-full">
              <img
                src="/zento_cabinet_ad.png"
                alt="Quảng cáo 300x600"
                className="w-full h-full object-cover"
              />
            </a>
            <div className="absolute top-1 right-1 bg-black/45 hover:bg-black/75 text-white/90 text-[9px] px-1.5 py-0.5 cursor-pointer rounded select-none z-10 transition-colors">
              Quảng cáo &times;
            </div>
          </div>

          {/* Ad 2: QC 300x600 */}
          <div className="relative w-full md:w-[300px] md:h-[600px] overflow-hidden rounded border border-gray-200 bg-gray-50 flex justify-center group shadow-sm mx-auto">
            <a href="#" className="block w-full h-full">
              <img
                src="/zento_toilet_ad.png"
                alt="Quảng cáo 300x600"
                className="w-full h-full object-cover"
              />
            </a>
            <div className="absolute top-1 right-1 bg-black/45 hover:bg-black/75 text-white/90 text-[9px] px-1.5 py-0.5 cursor-pointer rounded select-none z-10 transition-colors">
              Quảng cáo &times;
            </div>
          </div>
        </aside>
      </div>

      {/* Bottom QC 970x250 Ad */}
      <div className="relative w-full md:w-[970px] overflow-hidden rounded border border-gray-200 mt-6 bg-gray-50 flex justify-center group shadow-sm mx-auto aspect-[970/250] md:aspect-auto md:h-[250px]">
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
