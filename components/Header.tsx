"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Home, Search, Facebook, Youtube, Rss } from "lucide-react";

const mainNavItems = [
  { label: "GAME MOBILE", href: "/game-mobile" },
  { label: "ESPORTS", href: "/esports" },
  { label: "KHÁM PHÁ", href: "/kham-pha" },
  { label: "MANGA/FILM", href: "/manga-film" },
  { label: "HÓNG", href: "/hong" },
  { label: "CỘNG ĐỒNG", href: "/cong-dong" },
];

const subNavItems = [
  { label: "GUNNY ORIGIN", href: "/gunny-origin" },
  { label: "LMHT", href: "/lmht" },
  { label: "LIÊN QUÂN MOBILE", href: "/lien-quan-mobile" },
  { label: "LMHT: TỐC CHIẾN", href: "/lmht-toc-chien" },
  { label: "GAMING GEAR", href: "/gaming-gear" },
  { label: "GAME ONLINE", href: "/game-online" },
  { label: "PC/CONSOLE", href: "/pc-console" },
  { label: "360° GAMEFI", href: "/360-gamefi" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full bg-white select-none">
      {/* Top Banner and Navigation Area (Tier 1) */}
      <div className="flex items-stretch border-b border-gray-200 md:border-b-0">
        {/* Left: Red Logo Block */}
        <Link
          href="/"
          className="bg-brand-red text-white flex flex-col justify-center items-center px-4 py-3 md:px-7 md:py-4 flex-shrink-0"
        >
          <span className="text-3xl md:text-[38px] font-black tracking-tighter leading-none select-none font-sans">
            GAMEK
          </span>
          <span className="text-[7px] md:text-[8px] font-bold text-center mt-1 tracking-widest leading-none text-[#fff1f1]">
            TRANG THÔNG TIN ĐIỆN TỬ TỔNG HỢP
          </span>
        </Link>

        {/* Right: Multi-row navigation */}
        <div className="flex-1 flex flex-col justify-between">
          {/* Social Row (White bg) - Desktop Only */}
          <div className="hidden md:flex h-[28px] items-center justify-end px-4 gap-3 bg-white border-b border-gray-100">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-brand-red transition-colors"
              aria-label="Facebook"
            >
              <Facebook size={12} fill="currentColor" className="text-gray-500 hover:text-brand-red" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-brand-red transition-colors"
              aria-label="YouTube"
            >
              <Youtube size={12} fill="currentColor" className="text-gray-500 hover:text-brand-red" />
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-brand-red transition-colors"
              aria-label="RSS Feed"
            >
              <Rss size={12} className="text-gray-500 hover:text-brand-red" />
            </a>
          </div>

          {/* Red Navigation Row */}
          <div className="bg-brand-red h-full md:h-[42px] flex items-center justify-between px-3 md:px-4">
            {/* Desktop Menu */}
            <nav className="hidden md:flex items-center gap-4 lg:gap-6">
              {mainNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-white font-bold text-[12px] lg:text-[13px] hover:text-[#fff1f1] transition-colors whitespace-nowrap"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Mobile Header elements */}
            <div className="flex md:hidden items-center justify-between w-full">
              <span className="text-white text-xs font-bold">MENU CHÍNH</span>
              <button
                className="text-white p-1 hover:bg-brand-dark-red rounded transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>

            {/* Search Input - Desktop Only */}
            <div className="hidden md:flex items-center bg-[#f1f1f1] border border-gray-300 rounded px-2 py-0.5 w-[160px] lg:w-[200px] h-[26px]">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="bg-transparent text-gray-700 text-[11px] placeholder-gray-400 outline-none w-full"
              />
              <Search size={12} className="text-gray-400 cursor-pointer hover:text-brand-red flex-shrink-0" />
            </div>
          </div>
        </div>
      </div>

      {/* Sub Navigation Area (Tier 2) - Desktop Only */}
      <div className="hidden md:flex bg-[#2a2a2a] h-[34px] items-center text-white border-b border-[#1f1f1f]">
        <Link
          href="/"
          className="bg-[#3a3a3a] h-full flex items-center justify-center px-4 hover:bg-brand-red transition-colors border-r border-[#1f1f1f]"
          aria-label="Home"
        >
          <Home size={14} className="text-white" />
        </Link>
        <nav className="flex items-center h-full text-[11px] font-bold">
          {subNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 lg:px-4 h-full flex items-center hover:bg-[#3a3a3a] hover:text-[#ffd600] transition-colors border-r border-[#1f1f1f]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-[#f9f9f9] py-2 transition-all">
          <div className="px-4 py-2 border-b border-gray-200">
            <div className="flex items-center bg-white border border-gray-300 rounded px-3 py-1.5 w-full">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="bg-transparent text-gray-700 text-xs placeholder-gray-400 outline-none w-full"
              />
              <Search size={14} className="text-gray-400" />
            </div>
          </div>
          <div className="font-bold text-xs text-gray-700">
            <div className="bg-gray-200 px-4 py-1 text-[10px] text-gray-500 uppercase tracking-wider">CHUYÊN MỤC CHÍNH</div>
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-6 py-2.5 hover:bg-gray-100 hover:text-brand-red border-b border-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="bg-gray-200 px-4 py-1 text-[10px] text-gray-500 uppercase tracking-wider mt-2">DÒNG GAME HOT</div>
            {subNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-6 py-2.5 hover:bg-gray-100 hover:text-[#ffd600] border-b border-gray-100 text-gray-600 text-[11px]"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
