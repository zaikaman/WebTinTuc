import { notFound } from "next/navigation";
import { categoryData } from "@/lib/mockData";
import { CategoryContent } from "@/components/CategoryContent";

const labelMap: Record<string, string> = {
  "tin-tuc": "TIN TỨC",
  "anime-manga": "ANIME / MANGA",
  "cong-nghe": "CÔNG NGHỆ",
  phim: "PHIM",
  "kien-thuc": "KIẾN THỨC",
};

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { category } = await params;
  
  if (!categoryData[category]) {
    return {
      title: "Không tìm thấy chuyên mục",
    };
  }

  const label = labelMap[category] ?? category.toUpperCase();
  return {
    title: `${label} | LINHKA - Tin tức game, anime, công nghệ mới nhất`,
    description: `Trang chuyên mục ${label.toLowerCase()} của LINHKA, cung cấp thông tin nhanh nhất, đầy đủ nhất cho bạn đọc.`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  const data = categoryData[category];

  if (!data) {
    notFound();
  }

  return (
    <CategoryContent
      category={category}
      label={data.label}
      featured={data.featured}
      initialList={data.list}
    />
  );
}

