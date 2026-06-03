const labelMap: Record<string, string> = {
  "tin-tuc": "TIN TỨC",
  "anime-manga": "ANIME / MANGA",
  "cong-nghe": "CÔNG NGHỆ",
  phim: "PHIM",
  "kien-thuc": "KIẾN THỨC",
};

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const label = labelMap[category] ?? category.toUpperCase();

  return (
    <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-16 text-center">
      <div className="bg-gray-100 rounded-2xl py-20 px-8 max-w-xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-700 mb-3">{label}</h1>
        <p className="text-gray-500">
          Trang này đang được xây dựng. Tiếp tục trò chuyện để thêm nội dung cho chuyên mục này.
        </p>
      </div>
    </main>
  );
}
