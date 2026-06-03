import Link from "next/link";

const featuredArticles = [
  {
    image: "/soulslike_game.png",
    title: "Vừa ra mắt, tựa game Soulslike mới trên Steam đã nhận rating 97% tích cực, phong cách chơi cực sáng tạo",
    category: "Game Steam",
    time: "2 giờ trước",
  },
  {
    image: "/gta6_beta.png",
    title: "Hào hứng trải nghiệm beta sớm của GTA 6, hàng loạt game thủ nhận cái kết \"trong mơ cũng không nghĩ tới\"",
    category: "GTA 6",
    time: "1 giờ trước",
  },
  {
    image: "/esports_news.png",
    title: "HLE vào nhánh thắng Road to MSI 2026 nhưng cũng khiến fan dấy lên nỗi lo",
    category: "Liên Minh Huyền Thoại",
    time: "3 giờ trước",
    badge: "Liên Minh Huyền Thoại",
  },
  {
    image: "/video_news.png",
    title: "Video Trần Hà Linh bị \"giật tóc\" thu hút gần 8 triệu lượt xem, CĐM tò mò đi tìm nguyên nhân",
    category: "Đời sống",
    time: "5 giờ trước",
  },
];

const mainArticles = [
  { category: "ANIME/MANGA", title: "Anime mùa hè 2026: Top những bộ không thể bỏ qua", time: "1 giờ trước" },
  { category: "GAME MOBILE", title: "Tựa game bắn súng sinh tồn mobile mở đợt thử nghiệm thứ 2 cực hot", time: "3 giờ trước" },
  { category: "CÔNG NGHỆ", title: "Thế hệ card đồ họa tiếp theo hứa hẹn tăng gấp đôi hiệu năng xử lý AI", time: "5 giờ trước" },
  { category: "PHIM/FILM", title: "Bom tấn rạp chiếu phim đạt doanh thu kỷ lục chỉ sau 3 ngày ra mắt", time: "6 giờ trước" },
  { category: "GAMING GEAR", title: "Trên tay bàn phím cơ hot-swap giá rẻ đáng mua nhất phân khúc giá rẻ", time: "8 giờ trước" },
  { category: "CỘNG ĐỒNG", title: "Group game thủ chia sẻ hàng loạt bí mật giấu kín suốt 10 năm qua", time: "10 giờ trước" },
];

const categoryArticles = [
  {
    section: "ANIME/MANGA",
    items: [
      { title: "One Piece chương mới: Bí ẩn kho báu thế giới cổ đại dần hé lộ", time: "30 phút trước" },
      { title: "Sát Thủ Diệt Quỷ phần tiếp theo chính thức khởi chiếu tại cụm rạp", time: "2 giờ trước" },
      { title: "Bảng xếp hạng manga bán chạy nhất nửa đầu năm 2026", time: "4 giờ trước" },
    ],
  },
  {
    section: "CÔNG NGHỆ",
    items: [
      { title: "Thử nghiệm chip xử lý di động mới nhất trên các game đồ họa nặng", time: "1 giờ trước" },
      { title: "Có nên nâng cấp lên chuẩn RAM thế hệ mới ở thời điểm hiện tại?", time: "3 giờ trước" },
      { title: "Tốc độ đọc ghi ổ cứng SSD thế hệ thứ 5 đạt kỷ lục ấn tượng", time: "5 giờ trước" },
    ],
  },
];

const trending = [
  "Top 10 tựa game thế giới mở hay nhất năm 2026",
  "Cách tối ưu hóa hiệu năng PC chơi game mượt mà nhất",
  "Hướng dẫn nạp thẻ game an toàn và tránh lừa đảo",
  "Review game hành động góc nhìn thứ ba siêu đỉnh mới ra mắt",
  "Cách tự dựng cấu hình PC gaming dưới 15 triệu đồng",
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
          Quảng cáo ×
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left Column: Main Articles (Width matches GameK desktop 650px) */}
        <div className="w-full lg:w-[650px] flex-shrink-0 space-y-5">
          {/* 2x2 Grid of Featured Articles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {featuredArticles.map((article, index) => (
              <div
                key={index}
                className="relative group cursor-pointer overflow-hidden border border-gray-100 rounded-sm bg-black aspect-[4/3] shadow-sm"
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
              </div>
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
              {mainArticles.map((article, i) => (
                <div
                  key={i}
                  className="group flex gap-3 cursor-pointer p-2 border border-gray-100 rounded bg-white hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <div className="bg-gray-100 w-24 h-18 sm:w-28 sm:h-20 flex-shrink-0 overflow-hidden border border-gray-200">
                    <img
                      src={`/placeholder.svg`}
                      alt="Thumbnail"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex flex-col justify-between py-0.5">
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
                </div>
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
                <div className="sm:col-span-1 group cursor-pointer border border-gray-200 rounded overflow-hidden hover:shadow-sm transition-shadow bg-white p-2">
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
                </div>

                {/* Sub Articles List */}
                <div className="sm:col-span-2 flex flex-col gap-2.5">
                  {section.items.slice(1).map((item, j) => (
                    <div
                      key={j}
                      className="group flex gap-3 cursor-pointer p-2 border border-gray-100 rounded bg-white hover:bg-gray-50 transition-colors"
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
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Sidebar (Width matches GameK desktop 300px) */}
        <div className="w-full lg:w-[310px] flex-shrink-0 space-y-5">
          {/* Vertical Toilet Advertisement (Zento ad) */}
          <div className="relative w-full overflow-hidden rounded border border-gray-200 bg-gray-50 flex justify-center group">
            <a href="#" className="block w-full">
              <img
                src="/zento_toilet_ad.png"
                alt="Zento Premium Toilet Banner Ad"
                className="w-full h-auto object-cover max-h-[450px]"
              />
            </a>
            <div className="absolute top-1 right-1 bg-black/40 hover:bg-black/70 text-white/90 text-[9px] px-1 py-0.5 cursor-pointer rounded select-none">
              Quảng cáo ×
            </div>
          </div>

          {/* DÀNH CHO BẠN Widget */}
          <div className="border border-gray-200 rounded overflow-hidden bg-white shadow-sm">
            <div className="bg-gray-100 px-3 py-2 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-[#333] font-bold text-xs uppercase tracking-wide">Dành cho bạn</h2>
              <span className="text-gray-400 text-[10px] font-bold">››</span>
            </div>
            <div className="divide-y divide-gray-150">
              {[
                { title: "Phim 18+ gây sốt toàn thế giới hé lộ thêm nhiều cảnh hậu trường nóng bỏng", desc: "Anime hot" },
                { title: "Top 5 bàn phím cơ gõ sướng nhất mà game thủ chuyên nghiệp khuyên dùng", desc: "Gaming Gear" },
                { title: "Vừa ra mắt, game mobile bắn súng sinh tồn đạt ngay 5 triệu lượt đăng ký", desc: "Game Mobile" },
              ].map((item, i) => (
                <div key={i} className="p-2.5 hover:bg-gray-50 cursor-pointer group transition-colors">
                  <div className="flex gap-2">
                    <div className="bg-gray-200 w-12 h-10 flex-shrink-0 overflow-hidden rounded">
                      <img src="/placeholder.svg" className="w-full h-full object-cover" alt="small thumb" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-brand-red font-bold uppercase">{item.desc}</span>
                      <p className="text-gray-700 font-bold text-xs leading-snug line-clamp-2 mt-0.5 group-hover:text-brand-red transition-colors">
                        {item.title}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TRENDING Widget */}
          <div className="border border-gray-200 rounded overflow-hidden bg-white shadow-sm">
            <div className="bg-brand-red px-3 py-2">
              <h2 className="text-white font-bold text-xs uppercase tracking-wide">Trending</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {trending.map((title, i) => (
                <div
                  key={i}
                  className="flex gap-2.5 p-3 hover:bg-gray-50 cursor-pointer group transition-colors"
                >
                  <span className="text-brand-red font-black text-sm w-5 flex-shrink-0 leading-tight text-center">
                    {i + 1}
                  </span>
                  <p className="text-gray-700 font-bold text-xs leading-snug group-hover:text-brand-red transition-colors">
                    {title}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CHỦ ĐỀ HOT Widget */}
          <div className="border border-gray-200 rounded overflow-hidden bg-white shadow-sm">
            <div className="bg-[#2a2a2a] px-3 py-2">
              <h2 className="text-white font-bold text-xs uppercase tracking-wide">Chủ đề hot</h2>
            </div>
            <div className="p-3 flex flex-wrap gap-1.5">
              {[
                "RPG",
                "FPS",
                "MOBA",
                "Anime 2026",
                "Manga",
                "PC Gaming",
                "Mobile Game",
                "Review",
                "Hướng dẫn",
                "Esports",
              ].map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-100 hover:bg-brand-red hover:text-white text-gray-600 text-[10px] font-bold px-2.5 py-1 rounded transition-colors cursor-pointer"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
