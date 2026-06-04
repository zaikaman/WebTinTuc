import type { Metadata } from "next";
import "@/styles/globals.css";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Hello world project",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f4f6f8] text-[#333]">
        <div className="w-full max-w-[970px] mx-auto min-h-screen flex flex-col">
          <Header />
          <div className="flex-1">
            {children}
          </div>
          <footer className="mt-8 bg-[#333] border-t-4 border-brand-red text-white">
            <div className="px-4 py-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-brand-red px-3 py-2 text-white font-bold tracking-tighter text-lg rounded-sm">
                      LINHKA
                    </div>
                  </div>
                  <p className="text-gray-400 text-[11px] leading-relaxed">
                    Trang tin tức công nghệ, anime, manga và thế giới game hàng đầu Việt Nam.
                  </p>
                </div>
                {[
                  { title: "Chuyên mục", links: ["Tin tức", "Anime/Manga", "Công nghệ", "Phim"] },
                  { title: "Hỗ trợ", links: ["Liên hệ quảng cáo", "Điều khoản sử dụng", "Chính sách bảo mật"] },
                  { title: "Kết nối", links: ["Facebook", "YouTube", "Discord"] },
                ].map((col) => (
                  <div key={col.title}>
                    <h3 className="text-brand-red font-bold text-xs mb-3 uppercase">{col.title}</h3>
                    <ul className="space-y-1.5">
                      {col.links.map((link) => (
                        <li key={link}>
                          <a href="#" className="text-gray-300 text-[11px] hover:text-white transition-colors">
                            {link}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-4 border-t border-gray-700 text-center">
                <p className="text-gray-500 text-[11px]">© 2026 LINHKA - Tin Tức Công Nghệ & Game. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
