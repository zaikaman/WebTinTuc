import Link from "next/link";

const featuredArticles = [
  {
    id: "featured-1",
    image: "/soulslike_game.png",
    title: "Vừa ra mắt, tựa game Soulslike mới trên Steam đã nhận rating 97% tích cực, phong cách chơi cực sáng tạo",
    category: "Game Steam",
    time: "2 giờ trước",
  },
  {
    id: "featured-2",
    image: "/gta6_beta.png",
    title: "Hào hứng trải nghiệm beta sớm của GTA 6, hàng loạt game thủ nhận cái kết \"trong mơ cũng không nghĩ tới\"",
    category: "GTA 6",
    time: "1 giờ trước",
  },
  {
    id: "featured-3",
    image: "/esports_news.png",
    title: "HLE vào nhánh thắng Road to MSI 2026 nhưng cũng khiến fan dấy lên nỗi lo",
    category: "Liên Minh Huyền Thoại",
    time: "3 giờ trước",
    badge: "Liên Minh Huyền Thoại",
  },
  {
    id: "featured-4",
    image: "/video_news.png",
    title: "Video Trần Hà Linh bị \"giật tóc\" thu hút gần 8 triệu lượt xem, CĐM tò mò đi tìm nguyên nhân",
    category: "Đời sống",
    time: "5 giờ trước",
  },
];

const mainArticles = [
  {
    id: "hanoi-nang-nong-38-7",
    category: "TIN TỨC",
    title: "Hà Nội ghi nhận mức nhiệt cao nhất cả nước: Trung tâm Thủ đô nóng ngột ngạt khó thở, người dân vật vã giữa \"chảo lửa\" 38,7 độ C",
    time: "24/05/2026 15:18",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=600&auto=format&fit=crop"
  },
  { id: "main-1", category: "ANIME/MANGA", title: "Anime mùa hè 2026: Top những bộ không thể bỏ qua", time: "1 giờ trước" },
  { id: "main-2", category: "GAME MOBILE", title: "Tựa game bắn súng sinh tồn mobile mở đợt thử nghiệm thứ 2 cực hot", time: "3 giờ trước" },
  { id: "main-3", category: "CÔNG NGHỆ", title: "Thế hệ card đồ họa tiếp theo hứa hẹn tăng gấp đôi hiệu năng xử lý AI", time: "5 giờ trước" },
  { id: "main-4", category: "PHIM/FILM", title: "Bom tấn rạp chiếu phim đạt doanh thu kỷ lục chỉ sau 3 ngày ra mắt", time: "6 giờ trước" },
  { id: "main-5", category: "GAMING GEAR", title: "Trên tay bàn phím cơ hot-swap giá rẻ đáng mua nhất phân khúc giá rẻ", time: "8 giờ trước" },
];

const categoryArticles = [
  {
    section: "ANIME/MANGA",
    items: [
      { id: "anime-1", title: "One Piece chương mới: Bí ẩn kho báu thế giới cổ đại dần hé lộ", time: "30 phút trước" },
      { id: "anime-2", title: "Sát Thủ Diệt Quỷ phần tiếp theo chính thức khởi chiếu tại cụm rạp", time: "2 giờ trước" },
      { id: "anime-3", title: "Bảng xếp hạng manga bán chạy nhất nửa đầu năm 2026", time: "4 giờ trước" },
    ],
  },
  {
    section: "CÔNG NGHỆ",
    items: [
      { id: "tech-1", title: "Thử nghiệm chip xử lý di động mới nhất trên các game đồ họa nặng", time: "1 giờ trước" },
      { id: "tech-2", title: "Có nên nâng cấp lên chuẩn RAM thế hệ mới ở thời điểm hiện tại?", time: "3 giờ trước" },
      { id: "tech-3", title: "Tốc độ đọc ghi ổ cứng SSD thế hệ thứ 5 đạt kỷ lục ấn tượng", time: "5 giờ trước" },
    ],
  },
];

const categoryBadgeColor: Record<string, string> = {
  "TIN TỨC": "bg-brand-red",
  "ANIME/MANGA": "bg-[#8b5cf6]",
  "GAME MOBILE": "bg-[#3b82f6]",
  "CÔNG NGHỆ": "bg-[#10b981]",
  "PHIM/FILM": "bg-[#f59e0b]",
  "GAMING GEAR": "bg-[#ec4899]",
  "CỘNG ĐỒNG": "bg-[#6b7280]",
};

function CategoryBadge({ category }: { category: string }) {
  const color = categoryBadgeColor[category] ?? "bg-brand-red";
  return (
    <span className={`${color} text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide`}>
      {category}
    </span>
  );
}

export default function HomePage() {
  return (
    <main className="w-full px-3 md:px-4 py-4 font-sans text-xs">
      {/* Top Banner Advertisement (Vietnam Airlines ad) */}
      <div className="relative w-auto -mr-3 md:-mr-4 overflow-hidden rounded-l border border-r-0 border-gray-200 mb-4 bg-gray-50 group">
        <a href="#" className="block w-full">
          <img
            src="/vietnam_airlines_ad.png"
            alt="Vietnam Airlines Banner Perth"
            className="w-full h-auto object-cover max-h-[160px] md:max-h-[200px]"
          />
        </a>
        <div className="absolute top-1 right-1 bg-black/40 hover:bg-black/70 text-white/90 text-[9px] px-1 py-0.5 cursor-pointer rounded select-none">
          Quảng cáo &times;
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left Column: Main Articles */}
        <div className="w-full lg:w-[650px] flex-shrink-0 space-y-5">
          {/* 2x2 Grid of Featured Articles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {featuredArticles.map((article) => (
              <Link
                key={article.id}
                href={`/posts/${article.id}`}
                className="relative group cursor-pointer overflow-hidden border border-gray-100 rounded-sm bg-black aspect-[4/3] shadow-sm block"
              >
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                />
                {/* Badge if present */}
                {article.badge && (
                  <span className="absolute top-2.5 left-2.5 bg-[#f57c00] text-white text-[9px] font-bold px-1.5 py-0.5 uppercase rounded-sm z-10">
                    {article.badge}
                  </span>
                )}
                {/* Dark overlay at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-3">
                  <h2 className="text-white font-bold text-xs sm:text-[13px] leading-snug group-hover:text-[#ffd600] transition-colors line-clamp-3">
                    {article.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-300">
                    <span className="font-semibold text-gray-400 uppercase text-[9px] border-r border-gray-600 pr-1.5">
                      {article.category}
                    </span>
                    <span>{article.time}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* "MỚI NHẤT" section */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 border-b-2 border-brand-red pb-1">
              <span className="bg-brand-red text-white font-bold text-[11px] px-3 py-1 uppercase tracking-wider rounded-sm">
                Mới nhất
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mainArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/posts/${article.id}`}
                  className="group flex gap-3 cursor-pointer p-2 border border-gray-100 rounded bg-white hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <div className="bg-gray-100 w-24 h-18 sm:w-28 sm:h-20 flex-shrink-0 overflow-hidden border border-gray-200">
                    <img
                      src={article.image || "/placeholder.svg"}
                      alt="Thumbnail"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex flex-col justify-between py-0.5 flex-1">
                    <div>
                      <div className="mb-1">
                        <CategoryBadge category={article.category} />
                      </div>
                      <h3 className="text-gray-800 font-bold text-xs leading-snug group-hover:text-brand-red transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                    </div>
                    <span className="text-gray-400 text-[10px] mt-1">{article.time}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Category Shelf Sections */}
          {categoryArticles.map((section) => (
            <div key={section.section} className="space-y-3">
              <div className="flex items-center justify-between border-b-2 border-gray-800 pb-1">
                <span className="bg-[#2a2a2a] text-white font-bold text-[11px] px-3 py-1 uppercase tracking-wider rounded-sm">
                  {section.section}
                </span>
                <Link
                  href={`/${section.section.toLowerCase().replace("/", "-")}`}
                  className="text-brand-red text-[11px] font-bold hover:underline"
                >
                  XEM THÊM &rsaquo;
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Main Article in Category */}
                <Link
                  href={`/posts/${section.items[0].id}`}
                  className="sm:col-span-1 group cursor-pointer border border-gray-200 rounded overflow-hidden hover:shadow-sm transition-shadow bg-white p-2 block"
                >
                  <div className="bg-gray-100 w-full aspect-video overflow-hidden border border-gray-100 mb-2">
                    <img
                      src="/placeholder.svg"
                      alt="Category Main Thumbnail"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="space-y-1">
                    <CategoryBadge category={section.section} />
                    <h3 className="text-gray-800 font-bold text-xs leading-snug group-hover:text-brand-red transition-colors">
                      {section.items[0].title}
                    </h3>
                    <span className="text-gray-400 text-[10px] block">{section.items[0].time}</span>
                  </div>
                </Link>

                {/* Sub Articles List */}
                <div className="sm:col-span-2 flex flex-col gap-2.5">
                  {section.items.slice(1).map((item) => (
                    <Link
                      key={item.id}
                      href={`/posts/${item.id}`}
                      className="group flex gap-3 cursor-pointer p-2 border border-gray-100 rounded bg-white hover:bg-gray-50 transition-colors block"
                    >
                      <div className="bg-gray-100 w-20 h-14 flex-shrink-0 overflow-hidden border border-gray-150">
                        <img
                          src="/placeholder.svg"
                          alt="Category sub thumbnail"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col justify-center">
                        <h4 className="text-gray-800 font-bold text-xs leading-snug line-clamp-2 group-hover:text-brand-red transition-colors">
                          {item.title}
                        </h4>
                        <span className="text-gray-400 text-[10px] mt-1">{item.time}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Sidebar */}
        <div className="w-full lg:w-[310px] flex-shrink-0 space-y-4">
          {/* Ad 1: Zento Premium Cabinet */}
          <div className="relative w-full overflow-hidden rounded border border-gray-200 bg-gray-50 flex justify-center group shadow-sm">
            <a href="#" className="block w-full">
              <img
                src="/zento_cabinet_ad.png"
                alt="Zento Premium Cabinet Ad"
                className="w-full h-auto object-cover"
              />
            </a>
            <div className="absolute top-1 right-1 bg-black/45 hover:bg-black/75 text-white/90 text-[9px] px-1.5 py-0.5 cursor-pointer rounded select-none z-10 transition-colors">
              Quảng cáo &times;
            </div>
          </div>

          {/* Ad 2: ZTC Massage Bathtub */}
          <div className="relative w-full overflow-hidden rounded border border-gray-200 bg-gray-50 flex justify-center group shadow-sm">
            <a href="#" className="block w-full">
              <img
                src="/ztc_bathtub_ad.png"
                alt="ZTC Massage Bathtub Ad"
                className="w-full h-auto object-cover"
              />
            </a>
            <div className="absolute top-1 right-1 bg-black/45 hover:bg-black/75 text-white/90 text-[9px] px-1.5 py-0.5 cursor-pointer rounded select-none z-10 transition-colors">
              Quảng cáo &times;
            </div>
          </div>

          {/* Ad 3: Zento Premium Toilet */}
          <div className="relative w-full overflow-hidden rounded border border-gray-200 bg-gray-50 flex justify-center group shadow-sm">
            <a href="#" className="block w-full">
              <img
                src="/zento_toilet_ad.png"
                alt="Zento Premium Toilet Banner Ad"
                className="w-full h-auto object-cover"
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
