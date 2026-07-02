import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryFeed, getPublicAds } from "@/lib/api/news";
import { CategoryContent } from "@/components/CategoryContent";
import type { CategoryFeed } from "@/lib/types/news";

export const revalidate = 60;

export const dynamicParams = true;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

const labelMap: Record<string, string> = {
  "tin-tuc": "TIN TỨC",
  "anime-manga": "ANIME / MANGA",
  "cong-nghe": "CÔNG NGHỆ",
  phim: "PHIM",
  "kien-thuc": "KIẾN THỨC",
};

const categoryDescriptions: Record<string, string> = {
  "tin-tuc": "Cập nhật nhanh chóng những tin tức nóng hổi, thời sự trong nước và quốc tế trên WebTinTuc.",
  "anime-manga": "Tin tức mới nhất về anime, manga Nhật Bản. Review, spoiler, lịch chiếu và thông tin giải trí hấp dẫn.",
  "cong-nghe": "Công nghệ mới, đánh giá sản phẩm, thủ thuật và tin tức chuyển đổi số. Cập nhật xu hướng công nghệ 2026.",
  phim: "Review phim, lịch chiếu rạp, tin tức điện ảnh Hollywood và châu Á. Top phim hay mỗi tuần.",
  "kien-thuc": "Kiến thức tổng hợp: học tập, kỹ năng sống, sức khỏe và những điều thú vị trong cuộc sống.",
};

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const data = await getCategoryFeed(category);
  
  if (!data) {
    return {
      title: "Không tìm thấy chuyên mục",
    };
  }

  const label = labelMap[category] ?? category.toUpperCase();
  const description = categoryDescriptions[category] || `Trang chuyên mục ${label.toLowerCase()} trên WebTinTuc. Cập nhật tin tức nhanh nhất, đầy đủ nhất.`;
  const featuredImage = data.featured?.image || `${siteUrl}/screen-3.webp`;
  const canonical = `/${category}`;

  return {
    title: `${label} | WebTinTuc - Tin tức game, anime, công nghệ`,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      title: `${label} - WebTinTuc`,
      description,
      url: canonical,
      siteName: "WebTinTuc",
      locale: "vi_VN",
      images: [
        {
          url: featuredImage,
          width: 1200,
          height: 630,
          alt: `${label} - WebTinTuc`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${label} - WebTinTuc`,
      description,
      images: [featuredImage],
    },
  };
}

function CategoryJsonLd({ data, category, label }: { data: CategoryFeed; category: string; label: string }) {
  const listItems = data.list.slice(0, 10).map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: `${siteUrl}/posts/${item.id}`,
    name: item.title,
  }));

  if (data.featured?.id) {
    listItems.unshift({
      "@type": "ListItem",
      position: 1,
      url: `${siteUrl}/posts/${data.featured.id}`,
      name: data.featured.title,
    });
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "@id": `${siteUrl}/${category}#collection`,
          name: `${label} - WebTinTuc`,
          description: `Chuyên mục ${label.toLowerCase()} trên WebTinTuc`,
          url: `${siteUrl}/${category}`,
          mainEntity: {
            "@type": "ItemList",
            itemListElement: listItems,
          },
        }),
      }}
    />
  );
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  const [data, ads] = await Promise.all([
    getCategoryFeed(category),
    getPublicAds()
  ]);

  if (!data) {
    notFound();
  }

  return (
    <>
      <CategoryJsonLd data={data} category={category} label={data.label} />
      <CategoryContent
        featured={data.featured}
        initialList={data.list}
        ads={ads}
      />
    </>
  );
}
