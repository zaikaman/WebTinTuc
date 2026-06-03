"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

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
    <header className="w-full font-['Inter',sans-serif]">
      <div className="flex">
        <Link
          href="/"
          className="flex-shrink-0 bg-brand-dark-red flex items-center gap-3 px-5 py-4 min-w-[160px] md:min-w-[230px] z-10"
        >
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#D9D9D9] flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-white font-bold text-sm md:text-base leading-tight">LOGO</span>
            <span className="text-white font-bold text-xs md:text-sm leading-tight whitespace-nowrap">
              TIN TỨC GAME
            </span>
          </div>
        </Link>

        <div className="flex-1 bg-brand-red flex items-center justify-between px-4 md:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3 md:gap-5">
            <a
              href="#"
              className="text-white font-bold text-sm md:text-xl hidden sm:block whitespace-nowrap"
            >
              Liên hệ quảng cáo
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg width="34" height="34" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M36.6667 20C36.6667 10.8 29.2 3.33333 20 3.33333C10.8 3.33333 3.33337 10.8 3.33337 20C3.33337 28.0667 9.06671 34.7833 16.6667 36.3333V25H13.3334V20H16.6667V15.8333C16.6667 12.6167 19.2834 10 22.5 10H26.6667V15H23.3334C22.4167 15 21.6667 15.75 21.6667 16.6667V20H26.6667V25H21.6667V36.5833C30.0834 35.75 36.6667 28.65 36.6667 20Z" fill="white"/>
              </svg>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <svg width="34" height="34" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.6667 25L25.3167 20L16.6667 15V25ZM35.9334 11.95C36.15 12.7333 36.3 13.7833 36.4 15.1167C36.5167 16.45 36.5667 17.6 36.5667 18.6L36.6667 20C36.6667 23.65 36.4 26.3333 35.9334 28.05C35.5167 29.55 34.55 30.5167 33.05 30.9333C32.2667 31.15 30.8334 31.3 28.6334 31.4C26.4667 31.5167 24.4834 31.5667 22.65 31.5667L20 31.6667C13.0167 31.6667 8.66671 31.4 6.95004 30.9333C5.45004 30.5167 4.48337 29.55 4.06671 28.05C3.85004 27.2667 3.70004 26.2167 3.60004 24.8833C3.48337 23.55 3.43337 22.4 3.43337 21.4L3.33337 20C3.33337 16.35 3.60004 13.6667 4.06671 11.95C4.48337 10.45 5.45004 9.48333 6.95004 9.06667C7.73337 8.85 9.16671 8.7 11.3667 8.6C13.5334 8.48333 15.5167 8.43333 17.35 8.43333L20 8.33333C26.9834 8.33333 31.3334 8.6 33.05 9.06667C34.55 9.48333 35.5167 10.45 35.9334 11.95Z" fill="white"/>
              </svg>
            </a>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center bg-[#E7E5E5] border border-[#7D7D7D] rounded-[15px] px-4 py-2 gap-2 w-[200px] lg:w-[295px]">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21L16.66 16.66M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="#4C6281" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                type="text"
                placeholder="Tìm kiếm"
                className="bg-transparent text-brand-search font-bold text-lg placeholder-brand-search outline-none w-full"
              />
            </div>
            <button
              className="md:hidden text-white p-1"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-brand-nav border-t border-b border-brand-nav-border">
        <div className="flex items-center">
          <Link
            href="/"
            className="bg-brand-home-btn flex items-center justify-center w-16 h-16 flex-shrink-0 hover:bg-[#707070] transition-colors"
            aria-label="Home"
          >
            <svg width="36" height="36" viewBox="0 0 45 45" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M23.8256 4.29938L40.7006 21.1744C41.8819 22.3556 41.0456 24.375 39.375 24.375H37.5V35.625C37.5 37.1169 36.9074 38.5476 35.8525 39.6025C34.7976 40.6574 33.3668 41.25 31.875 41.25H30V28.125C30.0001 26.6902 29.4519 25.3097 28.4676 24.2658C27.4833 23.2219 26.1373 22.5936 24.705 22.5094L24.375 22.5H20.625C19.1331 22.5 17.7024 23.0926 16.6475 24.1475C15.5926 25.2024 15 26.6332 15 28.125V41.25H13.125C11.6331 41.25 10.2024 40.6574 9.14751 39.6025C8.09261 38.5476 7.49998 37.1169 7.49998 35.625V24.375H5.62498C3.95623 24.375 3.11811 22.3556 4.29936 21.1744L21.1744 4.29938C21.526 3.94787 22.0028 3.7504 22.5 3.7504C22.9972 3.7504 23.474 3.94787 23.8256 4.29938ZM24.375 26.25C24.8723 26.25 25.3492 26.4476 25.7008 26.7992C26.0524 27.1508 26.25 27.6277 26.25 28.125V41.25H18.75V28.125C18.75 27.6658 18.9186 27.2225 19.2238 26.8793C19.529 26.5361 19.9495 26.3169 20.4056 26.2631L20.625 26.25H24.375Z" fill="white"/>
            </svg>
          </Link>

          <nav className="hidden md:flex items-center h-16 px-4 gap-6 lg:gap-10 overflow-x-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-white font-semibold text-base lg:text-xl whitespace-nowrap hover:text-gray-300 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-brand-nav-border">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-6 py-3 text-white font-semibold text-base hover:bg-brand-home-btn transition-colors border-b border-brand-nav-border last:border-0"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="px-4 py-3">
              <div className="flex items-center bg-[#E7E5E5] border border-[#7D7D7D] rounded-[15px] px-4 py-2 gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21L16.66 16.66M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="#4C6281" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  type="text"
                  placeholder="Tìm kiếm"
                  className="bg-transparent text-brand-search font-bold text-base placeholder-brand-search outline-none w-full"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
