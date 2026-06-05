"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Search } from "lucide-react";

const navItems = [
  { label: "TIN TỨC", href: "/tin-tuc" },
  { label: "ANIME/MANGA", href: "/anime-manga" },
  { label: "CÔNG NGHỆ", href: "/cong-nghe" },
  { label: "PHIM", href: "/phim" },
  { label: "KIẾN THỨC", href: "/kien-thuc" },
];

function HomeIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      className={className}
      fill="currentColor"
      focusable="false"
    >
      <path d="M3.25 15.35 15.85 4.9a1.05 1.05 0 0 1 1.34.01l4.16 3.54V6.5c0-.5.4-.9.9-.9h3.3c.5 0 .9.4.9.9v6.36l3.29 2.8c.37.31.46.84.22 1.26-.18.32-.53.51-.9.51h-2.15v9.45c0 .58-.47 1.05-1.05 1.05h-6.74v-7.76a.9.9 0 0 0-.9-.9h-4.43a.9.9 0 0 0-.9.9v7.76H6.14c-.58 0-1.05-.47-1.05-1.05v-9.45H3.95c-.46 0-.86-.3-1-.73a1 1 0 0 1 .3-1.1Z" />
    </svg>
  );
}

function FacebookIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      focusable="false"
    >
      <path d="M14.25 8.1V6.95c0-.7.16-1.08 1.25-1.08h1.66V2.45a22.7 22.7 0 0 0-2.72-.15c-2.7 0-4.55 1.65-4.55 4.68V8.1H6.84v3.83h3.05v9.75h4.36v-9.75h2.96l.47-3.83h-3.43Z" />
    </svg>
  );
}

function YoutubeIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 28 28"
      className={className}
      fill="currentColor"
      focusable="false"
    >
      <path d="M25.55 8.48a3.1 3.1 0 0 0-2.18-2.2C21.46 5.77 14 5.77 14 5.77s-7.46 0-9.37.51a3.1 3.1 0 0 0-2.18 2.2A32.1 32.1 0 0 0 1.95 14c0 1.9.18 3.78.5 5.52a3.1 3.1 0 0 0 2.18 2.2c1.91.51 9.37.51 9.37.51s7.46 0 9.37-.51a3.1 3.1 0 0 0 2.18-2.2c.32-1.74.5-3.62.5-5.52s-.18-3.78-.5-5.52ZM11.63 17.68V10.3L18.1 14l-6.47 3.68Z" />
    </svg>
  );
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

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
              <FacebookIcon className="h-3.5 w-3.5" />
            </a>
            {/* Youtube Play Icon */}
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#e24a48] hover:bg-gray-100 transition-colors"
              aria-label="YouTube"
            >
              <YoutubeIcon className="h-4 w-4" />
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
      <div className="hidden md:flex h-[36px] items-center text-white bg-[#404040] border-b border-[#2d2d2d]">
        <Link
          href="/"
          className="bg-[#333333] h-full flex items-center justify-center px-5 hover:bg-[#df3232] transition-colors border-r border-[#2d2d2d]"
          aria-label="Home"
        >
          <HomeIcon className="h-[21px] w-[21px] text-white" />
        </Link>
        <nav className="flex-1 flex h-full text-[11px] lg:text-xs font-bold tracking-wider">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 px-2 h-full flex items-center justify-center transition-colors border-r border-[#2d2d2d] text-center whitespace-nowrap relative ${
                  isActive
                    ? "text-[#df3232] bg-[#333333]"
                    : "text-white hover:bg-[#333333] hover:text-[#ffd600]"
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#df3232]" />
                )}
              </Link>
            );
          })}
        </nav>
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
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-6 py-3 border-b border-gray-100 uppercase transition-colors ${
                    isActive
                      ? "text-[#df3232] bg-gray-50 font-extrabold border-l-4 border-l-[#df3232]"
                      : "text-gray-700 hover:bg-gray-100 hover:text-[#df3232]"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
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
                  <FacebookIcon className="h-3.5 w-3.5" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-full bg-[#df3232] flex items-center justify-center text-white"
                >
                  <YoutubeIcon className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
