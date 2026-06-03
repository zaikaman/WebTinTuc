import Link from "next/link";
import { Header } from "@/components/Header";

const featured = {
  category: "TIN TỨC",
  title: "Game bom tấn 2024: Những tựa game không thể bỏ qua trong năm nay",
  excerpt:
    "Năm 2024 chứng kiến sự ra mắt của hàng loạt tựa game bom tấn đỉnh cao, từ RPG đến FPS, mang đến trải nghiệm chưa từng có cho người chơi toàn cầu.",
  time: "2 giờ trước",
  views: "12.4K",
};

const mainArticles = [
  { category: "ANIME/MANGA", title: "Anime mùa hè 2024: Top những bộ không thể bỏ qua", time: "1 giờ trước" },
  { category: "GAME", title: "Game nhập vai mới nhất vừa được phát hành chính thức toàn cầu", time: "3 giờ trước" },
  { category: "CÔNG NGHỆ", title: "AI thay đổi cách chúng ta chơi game như thế nào?", time: "5 giờ trước" },
  { category: "PHIM", title: "Phim hoạt hình Nhật Bản được chuyển thể từ manga nổi tiếng", time: "6 giờ trước" },
  { category: "KIẾN THỨC", title: "Hướng dẫn tối ưu PC gaming cho hiệu năng tốt nhất", time: "8 giờ trước" },
  { category: "ANIME/MANGA", title: "Manga mới ra mắt chương 100 với nhiều bất ngờ thú vị", time: "10 giờ trước" },
];

const categoryArticles = [
  {
    section: "ANIME/MANGA",
    items: [
      { title: "One Piece chương mới: Bí ẩn cuối cùng được hé lộ", time: "30 phút trước" },
      { title: "Demon Slayer season 4 chính thức xác nhận ngày ra mắt", time: "2 giờ trước" },
      { title: "Top 10 manga hay nhất 2024 theo bình chọn của fan", time: "4 giờ trước" },
    ],
  },
  {
    section: "CÔNG NGHỆ",
    items: [
      { title: "GPU mới nhất 2024: So sánh hiệu năng chi tiết", time: "1 giờ trước" },
      { title: "RAM DDR5 có thực sự đáng nâng cấp không?", time: "3 giờ trước" },
      { title: "SSD NVMe Gen 5: Tốc độ đọc ghi vượt mọi giới hạn", time: "5 giờ trước" },
    ],
  },
];

const trending = [
  "Top 10 anime hay nhất 2024 không thể bỏ qua",
  "Hướng dẫn cài đặt game offline miễn phí trên PC",
  "One Piece chương mới nhất: Những bí ẩn được hé lộ",
  "Review game nhập vai hay nhất năm nay",
  "Cách upgrade PC gaming với ngân sách thấp",
];

const categoryBadgeColor: Record<string, string> = {
  "TIN TỨC": "bg-brand-red",
  "ANIME/MANGA": "bg-purple-500",
  GAME: "bg-blue-500",
  "CÔNG NGHỆ": "bg-green-600",
  PHIM: "bg-yellow-500",
  "KIẾN THỨC": "bg-orange-500",
};

function CategoryBadge({ category }: { category: string }) {
  const color = categoryBadgeColor[category] ?? "bg-brand-red";
  return (
    <span className={`${color} text-white text-xs font-bold px-2 py-0.5 rounded`}>
      {category}
    </span>
  );
}

export default function HomePage() {
  return (
    <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-6">
      <div className="flex gap-6 xl:gap-8">
        <div className="flex-1 min-w-0 space-y-6">
          <div className="group cursor-pointer rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="bg-gray-300 w-full aspect-[16/7] sm:aspect-[16/6]" />
            <div className="p-4 sm:p-5">
              <div className="flex items-center gap-3 mb-2">
                <CategoryBadge category={featured.category} />
                <span className="text-gray-400 text-xs">{featured.time}</span>
                <span className="text-gray-400 text-xs">{featured.views} lượt xem</span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 leading-snug group-hover:text-brand-red transition-colors">
                {featured.title}
              </h1>
              <p className="mt-2 text-gray-500 text-sm sm:text-base leading-relaxed line-clamp-2">
                {featured.excerpt}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-brand-red text-white font-bold text-sm px-4 py-1.5 rounded">MỚI NHẤT</div>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mainArticles.map((article, i) => (
              <div
                key={i}
                className="group cursor-pointer border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="bg-gray-300 w-full aspect-video" />
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <CategoryBadge category={article.category} />
                    <span className="text-gray-400 text-xs">{article.time}</span>
                  </div>
                  <h3 className="text-gray-800 font-semibold text-sm leading-snug line-clamp-2 group-hover:text-brand-red transition-colors">
                    {article.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>

          {categoryArticles.map((section) => (
            <div key={section.section}>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-brand-nav text-white font-bold text-sm px-4 py-1.5 rounded">
                  {section.section}
                </div>
                <div className="flex-1 h-px bg-gray-200" />
                <Link
                  href={`/${section.section.toLowerCase().replace("/", "-")}`}
                  className="text-brand-red text-sm font-semibold hover:underline"
                >
                  Xem thêm &rsaquo;
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1 group cursor-pointer border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="bg-gray-300 w-full aspect-video" />
                  <div className="p-3">
                    <CategoryBadge category={section.section} />
                    <h3 className="mt-1.5 text-gray-800 font-semibold text-sm leading-snug group-hover:text-brand-red transition-colors">
                      {section.items[0].title}
                    </h3>
                    <span className="text-gray-400 text-xs mt-1 block">{section.items[0].time}</span>
                  </div>
                </div>
                <div className="sm:col-span-2 flex flex-col gap-3">
                  {section.items.slice(1).map((item, j) => (
                    <div
                      key={j}
                      className="group flex gap-3 cursor-pointer border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition-shadow"
                    >
                      <div className="bg-gray-300 w-24 sm:w-32 flex-shrink-0" />
                      <div className="p-2 flex flex-col justify-center">
                        <CategoryBadge category={section.section} />
                        <h4 className="mt-1 text-gray-800 font-semibold text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-brand-red transition-colors">
                          {item.title}
                        </h4>
                        <span className="text-gray-400 text-xs mt-1">{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="hidden lg:flex flex-col gap-5 w-[260px] xl:w-[300px] flex-shrink-0">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-brand-red px-4 py-3">
              <h2 className="text-white font-bold text-base tracking-wide">TRENDING</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {trending.map((title, i) => (
                <div
                  key={i}
                  className="flex gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <span className="text-brand-red font-bold text-xl w-7 flex-shrink-0 leading-tight">
                    {i + 1}
                  </span>
                  <p className="text-gray-700 text-sm font-medium leading-snug">{title}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-200 rounded-lg h-[250px] flex items-center justify-center border border-gray-300">
            <span className="text-gray-400 text-sm font-semibold">Quảng cáo</span>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-brand-nav px-4 py-3">
              <h2 className="text-white font-bold text-base tracking-wide">CHỦ ĐỀ HOT</h2>
            </div>
            <div className="p-3 flex flex-wrap gap-2">
              {["RPG", "FPS", "MOBA", "Anime 2024", "Manga", "PC Gaming", "Mobile Game", "Review", "Hướng dẫn", "Esports"].map(
                (tag) => (
                  <span
                    key={tag}
                    className="bg-gray-100 hover:bg-brand-red hover:text-white text-gray-600 text-xs font-semibold px-3 py-1 rounded-full cursor-pointer transition-colors"
                  >
                    {tag}
                  </span>
                )
              )}
            </div>
          </div>

          <div className="bg-gray-200 rounded-lg h-[200px] flex items-center justify-center border border-gray-300">
            <span className="text-gray-400 text-sm font-semibold">Quảng cáo</span>
          </div>
        </aside>
      </div>
    </main>
  );
}
