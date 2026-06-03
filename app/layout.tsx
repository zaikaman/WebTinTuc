import type { Metadata } from "next";
import "@/styles/globals.css";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Hello world project",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white font-['Inter',sans-serif]">
        <Header />
        {children}
        <footer className="mt-12 bg-brand-nav border-t border-brand-nav-border">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#D9D9D9] flex-shrink-0" />
                  <div>
                    <p className="text-white font-bold text-sm">LOGO</p>
                    <p className="text-white font-bold text-xs">TIN TỨC GAME</p>
                  </div>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Trang tin tức game, anime, manga và công nghệ hàng đầu Việt Nam.
                </p>
              </div>
              {[
                { title: "Chuyên mục", links: ["Tin tức", "Anime/Manga", "Công nghệ", "Phim"] },
                { title: "Hỗ trợ", links: ["Liên hệ quảng cáo", "Điều khoản sử dụng", "Chính sách bảo mật"] },
                { title: "Kết nối", links: ["Facebook", "YouTube", "Discord"] },
              ].map((col) => (
                <div key={col.title}>
                  <h3 className="text-white font-bold text-sm mb-3">{col.title}</h3>
                  <ul className="space-y-2">
                    {col.links.map((link) => (
                      <li key={link}>
                        <a href="#" className="text-gray-400 text-xs hover:text-white transition-colors">
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-4 border-t border-brand-nav-border text-center">
              <p className="text-gray-500 text-xs">© 2024 Tin Tức Game. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
