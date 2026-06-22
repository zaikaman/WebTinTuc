import type { SiteSettings } from "@/lib/types/news";

export const mockSiteSettings: SiteSettings = {
  brand: {
    name: "LINHKA",
    tagline: "TIN TỨC GAME",
    footerDescription:
      "Trang tin tức công nghệ, anime, manga và thế giới game hàng đầu Việt Nam.",
    copyright:
      "© 2026 LINHKA - Tin Tức Công Nghệ & Game. All rights reserved.",
  },
  header: {
    logoText: "LOGO",
    logoSubtitle: "TIN TỨC GAME",
    searchPlaceholder: "Tìm kiếm",
    utilityLinks: [
      {
        label: "Liên hệ quảng cáo",
      },
    ],
    socialLinks: [
      {
        label: "Zalo",
        href: "https://zalo.me",
        platform: "zalo",
      },
      {
        label: "Email",
        href: "mailto:quangcao@linhka.vn",
        platform: "email",
      },
    ],
    primaryLinks: [
      { label: "TIN TỨC", href: "/tin-tuc" },
      { label: "ANIME/MANGA", href: "/anime-manga" },
      { label: "CÔNG NGHỆ", href: "/cong-nghe" },
      { label: "PHIM", href: "/phim" },
      { label: "KIẾN THỨC", href: "/kien-thuc" },
    ],
  },
  footer: {
    columns: [
      {
        title: "Chuyên mục",
        links: [
          { label: "Tin tức", href: "/tin-tuc" },
          { label: "Anime/Manga", href: "/anime-manga" },
          { label: "Công nghệ", href: "/cong-nghe" },
          { label: "Phim", href: "/phim" },
          { label: "Kiến thức", href: "/kien-thuc" },
        ],
      },
      {
        title: "Hỗ trợ",
        links: [
          { label: "Liên hệ quảng cáo" },
          { label: "Điều khoản sử dụng", href: "/dieu-khoan-su-dung" },
          { label: "Chính sách bảo mật", href: "/chinh-sach-bao-mat" },
        ],
      },
      {
        title: "Kết nối",
        links: [
          { label: "Facebook", href: "https://facebook.com" },
          { label: "YouTube", href: "https://youtube.com" },
          { label: "Discord", href: "https://discord.com" },
        ],
      },
    ],
  },
};
