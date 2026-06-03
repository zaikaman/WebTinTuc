"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Home, Search, Facebook, Youtube } from "lucide-react";

const navItems = [
  { label: "TIN TỨC", href: "/tin-tuc" },
  { label: "ANIME/MANGA", href: "/anime-manga" },
  { label: "CÔNG NGHỆ", href: "/cong-nghe" },
  { label: "PHIM", href: "/phim" },
  { label: "KIẾN THỨC", href: "/kien-thuc" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full select-none font-sans">
      {/* Top Row: Logo & Red Navbar */}
      <div className="flex items-stretch">
        {/* Left Logo Block */}
        <Link
          href="/"
          className="bg-[#df3232] text-white flex items-center gap-3 px-5 py-3.5 min-w-[160px] md:min-w-[220px] flex-shrink-0"
        >
          <div className="w-9 h-9 rounded-full bg-[#d9d9d9] flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-white font-extrabold text-sm md:text-[15px] leading-tight tracking-wider">
              LOGO
            </span>
            <span className="text-white font-bold text-[10px] md:text-[11px] leading-tight whitespace-nowrap tracking-wide">
              TIN TỨC GAME
            </span>
          </div>
        </Link>

        {/* Right Red Navigation Bar */}
        <div className="flex-1 bg-[#e24a48] flex items-center justify-between px-4 md:px-6">
          {/* Main items (Liên hệ quảng cáo + Social icons) - Desktop Only */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            <a
              href="#"
              className="text-white font-bold text-sm lg:text-[15px] hover:text-[#ffebeb] transition-colors"
            >
              Liên hệ quảng cáo
            </a>
            {/* Facebook Solid Circle */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#e24a48] hover:bg-gray-100 transition-colors"
              aria-label="Facebook"
            >
              <Facebook size={14} fill="currentColor" stroke="none" />
            </a>
            {/* Youtube Play Icon */}
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#e24a48] hover:bg-gray-100 transition-colors"
              aria-label="YouTube"
            >
              <Youtube size={14} fill="currentColor" stroke="none" />
            </a>
          </div>

          {/* Mobile Header Toggle */}
          <div className="flex md:hidden items-center justify-between w-full">
            <span className="text-white text-xs font-bold uppercase tracking-wider">TIN TỨC GAME</span>
            <button
              className="text-white p-1 hover:bg-[#c83939] rounded transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Search Box */}
          <div className="hidden md:flex items-center bg-[#e7e5e5] border border-gray-300 rounded-[15px] px-3.5 py-1 w-[180px] lg:w-[250px] h-[30px]">
            <Search size={14} className="text-[#4c6281] mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Tìm kiếm"
              className="bg-transparent text-[#4c6281] font-bold text-xs placeholder-[#4c6281]/70 outline-none w-full"
            />
          </div>
        </div>
      </div>

      {/* Bottom Row: Dark Grey Navbar - Desktop Only */}
      <div className="hidden md:flex h-[36px] items-center text-white">
        {/* Spacer aligning with main content padding (matches the ad below) */}
        <div className="w-4 flex-shrink-0" />
        
        {/* Actual dark navbar container */}
        <div className="flex-1 bg-[#404040] h-full flex items-center border-b border-[#2d2d2d]">
          <Link
            href="/"
            className="bg-[#333333] h-full flex items-center justify-center px-5 hover:bg-[#df3232] transition-colors border-r border-[#2d2d2d]"
            aria-label="Home"
          >
            <Home size={16} className="text-white" fill="currentColor" />
          </Link>
          <nav className="flex items-center h-full text-xs font-bold tracking-wider">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-5 lg:px-7 h-full flex items-center hover:bg-[#333333] hover:text-[#ffd600] transition-colors border-r border-[#2d2d2d]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-[#f9f9f9] py-2 transition-all">
          <div className="px-4 py-2 border-b border-gray-200">
            <div className="flex items-center bg-[#e7e5e5] border border-gray-300 rounded-[15px] px-3 py-1.5 w-full">
              <Search size={14} className="text-[#4c6281] mr-2" />
              <input
                type="text"
                placeholder="Tìm kiếm"
                className="bg-transparent text-[#4c6281] font-bold text-xs placeholder-[#4c6281]/70 outline-none w-full"
              />
            </div>
          </div>
          <div className="font-bold text-xs text-gray-700">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-6 py-3 hover:bg-gray-100 hover:text-[#df3232] border-b border-gray-100 uppercase"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex items-center gap-4 px-6 py-3 border-t border-gray-200 mt-2 bg-gray-50">
              <a href="#" className="text-gray-600 hover:text-[#df3232] font-bold">
                Liên hệ quảng cáo
              </a>
              <div className="flex gap-2.5 ml-auto">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-full bg-[#df3232] flex items-center justify-center text-white"
                >
                  <Facebook size={12} fill="currentColor" stroke="none" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-full bg-[#df3232] flex items-center justify-center text-white"
                >
                  <Youtube size={12} fill="currentColor" stroke="none" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
