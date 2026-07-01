import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getArticleById,
  getPostRecommendations,
  getPublicAds,
} from "@/lib/api/news";
import { Clock, Link2, Star } from "lucide-react";
import { formatCategory } from "@/lib/utils";
import AdBanner from "@/components/AdBanner";

export const revalidate = 60;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticleById(id);

  if (!article) {
    return {
      title: "Bài viết không tồn tại",
    };
  }

  const title = article.title;
  const description = article.intro || `Đọc bài viết ${article.title} trên WebTinTuc. Cập nhật tin tức mới nhất về ${article.category.toLowerCase()}.`;
  const imageUrl = article.image || `${siteUrl}/screen-3.webp`;
  const categorySlug = article.categorySlug || article.category;
  const url = `/posts/${id}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      siteName: "WebTinTuc",
      locale: "vi_VN",
      publishedTime: article.time,
      modifiedTime: article.time,
      section: article.category,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function PostDetailPage({ params }: PageProps) {
  const { id } = await params;
  const article = await getArticleById(id);

  if (!article) {
    notFound();
  }

  const [recommendations, ads] = await Promise.all([
    getPostRecommendations(id),
    getPublicAds()
  ]);
  const { relatedPosts, likePosts } = recommendations;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": `${siteUrl}/posts/${id}#article`,
    headline: article.title,
    description: article.intro || article.title,
    image: article.image || `${siteUrl}/screen-3.webp`,
    datePublished: article.time,
    dateModified: article.time,
    author: {
      "@type": "Organization",
      name: "WebTinTuc",
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "WebTinTuc",
      url: siteUrl,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/posts/${id}`,
    },
    articleSection: article.category,
    inLanguage: "vi",
  };

  const articleBreadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Trang chủ",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: article.category,
        item: `${siteUrl}/${article.categorySlug || article.category}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
      },
    ],
  };

  // Determine if content is array of blocks or HTML string
  const isBlocksArray = Array.isArray(article.content);
  
  // Filter out any existing ad blocks to ensure no duplicates, then insert one ad block in the middle of content
  let contentBlocks: any[] = [];
  if (isBlocksArray) {
    contentBlocks = [...(article.content.filter((b: any) => b.type !== "ad") || [])];
    if (contentBlocks.length > 0) {
      const insertIndex = Math.max(1, Math.floor(contentBlocks.length / 2));
      contentBlocks.splice(insertIndex, 0, { type: "ad" } as any);
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleBreadcrumbJsonLd) }}
      />
      <main className="w-full px-3 md:px-0 py-4 font-sans text-xs">
      {/* Top Banner Advertisement (QC 970x250) */}
      <AdBanner 
        position="header" 
        ads={ads} 
        fallbackImg="/vinfast_ad.webp" 
        className="w-full md:w-[970px] rounded border border-gray-200 mb-5 bg-gray-50 shadow-sm mx-auto overflow-hidden aspect-[970/250] md:aspect-auto md:h-[250px]" 
      />

      {/* Main Two-Column Content Layout */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Left Column: Post Content */}
        <div className="w-full lg:w-[650px] flex-shrink-0 flex flex-col gap-5">
          <article className="w-full bg-white md:border md:border-gray-200 p-0 md:p-5 rounded-sm md:shadow-sm">
            {/* Metadata: Category & Date Time */}
            <div className="flex items-center gap-1.5 text-gray-500 font-semibold mb-2">
              <Link
                href={`/${article.categorySlug || article.category}`}
                prefetch={true}
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

            {/* Content */}
            <div className="space-y-4 text-xs sm:text-[13px] text-gray-800 leading-relaxed">
              {!isBlocksArray && typeof article.content === 'string' ? (
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: article.content }} 
                />
              ) : (
                contentBlocks.map((block, index) => {
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
                    const width = block.width || "100%";
                    return (
                      <div key={index} className="my-4 space-y-1.5 mx-auto" style={{ maxWidth: width }}>
                        <div className="border border-gray-200 overflow-hidden bg-gray-50 rounded-md md:rounded-sm">
                          <Image
                            src={block.src}
                            alt={block.caption || "Hình ảnh bài viết"}
                            width={650}
                            height={400}
                            className="w-full h-auto object-cover max-h-[500px] mx-auto"
                            sizes="(max-width: 768px) 100vw, 650px"
                          />
                        </div>
                        {block.caption && (
                          <p className="text-gray-500 text-[11px] italic text-center px-4 leading-normal font-sans">
                            {block.caption}
                          </p>
                        )}
                      </div>
                    );
                  } else if (block.type === "video") {
                    const width = block.width || "100%";
                    return (
                      <div key={index} className="my-4 mx-auto" style={{ maxWidth: width }}>
                        <video controls src={block.src} className="w-full max-h-[500px] rounded border border-gray-200 bg-black shadow-sm" />
                      </div>
                    );
                  } else if (block.type === "iframe") {
                    const width = block.width || "100%";
                    return (
                      <div key={index} className="my-4 mx-auto" style={{ maxWidth: width }}>
                        <div className="aspect-video w-full">
                          <iframe src={block.src} className="w-full h-full rounded border border-gray-200 shadow-sm" allowFullScreen />
                        </div>
                      </div>
                    );
                  } else if (block.type === "ad") {
                    return (
                      <AdBanner 
                        key={index}
                        position="inline" 
                        ads={ads} 
                        fallbackImg="/qc_650_300_premium.webp" 
                        className="w-full rounded border border-gray-200 bg-gray-50 shadow-sm my-5 overflow-hidden aspect-[650/300]" 
                      />
                    );
                  }
                  return null;
                })
              )}
            </div>

            {/* Middle Advertisement (QC 650x300 for PC, Swipable 3 vertical ads for Mobile) */}
            <div className="my-5">
              {/* PC View */}
              <AdBanner 
                position="inline" 
                ads={ads} 
                fallbackImg="/qc_650_300_premium.webp" 
                className="hidden md:flex w-full rounded border border-gray-200 bg-gray-50 shadow-sm overflow-hidden aspect-[650/300]" 
              />

              {/* Mobile View: Swipable vertical ads */}
              <div className="flex md:hidden gap-3.5 my-2.5 overflow-x-auto scrollbar-none snap-x snap-mandatory">
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
                    const catSlug = item.categorySlug || item.category;
                    return (
                      <div
                        key={item.id}
                        className="group block space-y-1.5 pb-3 border-b border-gray-100 last:border-b-0 last:pb-0"
                      >
                        <Link href={`/posts/${item.id}`} prefetch={true} className="block">
                          <div className="relative aspect-video w-full overflow-hidden bg-gray-100 rounded-md md:rounded-sm border border-gray-200">
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              sizes="(max-width: 768px) 100vw, 300px"
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        </Link>
                        <Link href={`/posts/${item.id}`} prefetch={true} className="block">
                          <h3 className="text-gray-900 font-bold text-[11px] sm:text-xs leading-snug group-hover:text-brand-red transition-colors line-clamp-2">
                            {item.title}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-gray-500 font-semibold">
                          <Link
                            href={`/${catSlug}`}
                            prefetch={true}
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
                    const catSlug = item.categorySlug || item.category;
                    return (
                      <div
                        key={item.id}
                        className="group block space-y-1.5 pb-3 border-b border-gray-100 last:border-b-0 last:pb-0"
                      >
                        <Link href={`/posts/${item.id}`} prefetch={true} className="block">
                          <div className="relative aspect-video w-full overflow-hidden bg-gray-100 rounded-md md:rounded-sm border border-gray-200">
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              sizes="(max-width: 768px) 100vw, 300px"
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        </Link>
                        <Link href={`/posts/${item.id}`} prefetch={true} className="block">
                          <h3 className="text-gray-900 font-bold text-[11px] sm:text-xs leading-snug group-hover:text-brand-red transition-colors line-clamp-2">
                            {item.title}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-gray-500 font-semibold">
                          <Link
                            href={`/${catSlug}`}
                            prefetch={true}
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
          <AdBanner 
            position="sidebar_1" 
            ads={ads} 
            fallbackImg="/zento_cabinet_ad.webp" 
            className="w-full md:w-[300px] md:h-[600px] rounded border border-gray-200 bg-gray-50 shadow-sm mx-auto overflow-hidden" 
          />

          {/* Ad 2: QC 300x600 */}
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
        className="w-full md:w-[970px] rounded border border-gray-200 mt-6 bg-gray-50 shadow-sm mx-auto overflow-hidden aspect-[970/250] md:aspect-auto md:h-[250px]" 
      />
    </main>
    </>
  );
}
