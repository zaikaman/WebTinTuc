"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Menu, Search, X, ChevronRight } from "lucide-react";
import type { SiteSettings, SocialLink, NavigationItem } from "@/lib/types/news";

interface HeaderProps {
  brand: SiteSettings["brand"];
  categories: NavigationItem[];
}

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

function ZaloIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      <path d="M9.5 9h5l-5 6h5" />
    </svg>
  );
}

export function Header({ brand, categories }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const pathname = usePathname();
  const utilityLink = brand.utilityLinks[0];

  return (
    <header className="w-full select-none font-sans bg-white relative">
      {/* Mobile Top Header Bar (md:hidden) */}
      <div className="flex md:hidden items-center justify-between h-[56px] px-3.5 bg-gradient-to-r from-[#df3232] to-[#e24a48] text-white relative z-40 shadow-[0_2px_4px_rgba(0,0,0,0.08)]">
        {/* Left Side: Hamburger menu button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="w-9 h-9 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors text-white"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        {/* Center: Brand Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-extrabold text-[#df3232] text-sm shadow-sm">
            {brand.name.slice(0, 1).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="text-white font-extrabold text-[12px] tracking-wider uppercase leading-none">
              {brand.name}
            </span>
            <span className="text-white/80 font-bold text-[8px] tracking-wide leading-none mt-1">
              {brand.tagline}
            </span>
          </div>
        </Link>

        {/* Right Side: Search toggle button */}
        <button
          onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
            mobileSearchOpen ? "bg-white/20 text-white" : "hover:bg-white/10 text-white"
          }`}
          aria-label="Toggle search"
        >
          {mobileSearchOpen ? <X size={20} /> : <Search size={20} />}
        </button>

        {/* Sliding Search Overlay on Mobile */}
        <div 
          className={`absolute top-full left-0 right-0 bg-[#e24a48] border-t border-white/15 shadow-lg px-4 py-3 transition-all duration-300 ease-in-out z-30 ${
            mobileSearchOpen 
              ? "opacity-100 translate-y-0 visible" 
              : "opacity-0 -translate-y-2 pointer-events-none invisible"
          }`}
        >
          <div className="flex h-[36px] items-center rounded-lg border border-white/20 bg-white/10 px-3 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] focus-within:bg-white focus-within:border-white focus-within:text-gray-900 group">
            <Search size={14} className="mr-2 text-white/80 group-focus-within:text-gray-500" />
            <input
              type="text"
              placeholder={brand.searchPlaceholder}
              className="h-full w-full bg-transparent text-xs font-bold text-white group-focus-within:text-gray-900 outline-none placeholder:text-white/60 group-focus-within:placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Desktop Top Header Bar (hidden on mobile) */}
      <div className="hidden md:flex items-stretch h-auto">
        <Link
          href="/"
          className="bg-[#df3232] text-white flex items-center gap-2 md:gap-3 px-3 md:px-5 py-2 md:py-3.5 min-w-[115px] md:min-w-[220px] flex-shrink-0"
        >
          <div className="w-6 h-6 md:w-9 md:h-9 rounded-full bg-white flex-shrink-0" />
          <div className="flex flex-col justify-center">
            <span className="text-white font-extrabold text-[11px] md:text-[15px] leading-[1.1] tracking-wider uppercase">
              {brand.name}
            </span>
            <span className="text-white font-bold text-[8px] md:text-[11px] leading-[1.1] whitespace-nowrap tracking-wide mt-0.5">
              {brand.tagline}
            </span>
          </div>
        </Link>

        <div className="flex-1 bg-[#e24a48] flex items-center justify-between px-2.5 md:px-6">
          <div className="w-full grid grid-cols-[minmax(260px,1fr)_auto] items-center gap-5 lg:gap-7">
            <div className="flex justify-center">
              <div className="flex h-[34px] w-full max-w-[760px] items-center rounded-[17px] border border-[#d5d5d5] bg-[#f0eeee] px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] transition-colors focus-within:border-white focus-within:bg-white">
                <Search size={15} className="mr-2.5 flex-shrink-0 text-[#4c6281]" />
                <input
                  type="text"
                  placeholder={brand.searchPlaceholder}
                  className="h-full w-full bg-transparent text-[13px] font-bold text-[#4c6281] outline-none placeholder:text-[#4c6281]/70"
                />
              </div>
            </div>
            <div className="flex shrink-0 items-center justify-end gap-3 lg:gap-4">
              {utilityLink && utilityLink.href ? (
                <Link
                  href={utilityLink.href}
                  className="whitespace-nowrap text-sm font-bold text-white transition-colors hover:text-[#ffebeb] lg:text-[15px]"
                >
                  {utilityLink.label}
                </Link>
              ) : utilityLink ? (
                <span className="whitespace-nowrap text-sm font-bold text-white lg:text-[15px]">
                  {utilityLink.label}
                </span>
              ) : null}
              <div className="flex items-center gap-2.5">
                {brand.socialLinks.map((item) => (
                  <HeaderSocialLink key={`${item.label}-${item.href}`} item={item} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Subheader (Desktop only) */}
      <div className="hidden md:flex h-[38px] items-center text-white bg-[#404040] border-b border-[#2d2d2d] relative">
        <Link
          href="/"
          className={`bg-[#333333] h-full w-[48px] flex items-center justify-center hover:bg-[#df3232] transition-colors border-r border-[#2d2d2d] flex-shrink-0 ${
            pathname === "/" ? "text-[#df3232]" : "text-white"
          }`}
          aria-label="Home"
        >
          <HomeIcon className="h-[18px] w-[18px] text-white" />
        </Link>
        
        {/* Divided categories navigation */}
        <nav className="flex-1 flex h-full text-xs font-bold tracking-wide">
          {categories.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={`${item.label}-${item.href}`}
                href={item.href}
                className={`flex-1 h-full flex items-center justify-center transition-colors border-r border-[#2d2d2d] last:border-r-0 text-center whitespace-nowrap relative ${
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

        {/* Hamburger menu icon in the right corner (not clickable yet) */}
        <div className="h-full w-[48px] flex items-center justify-center border-l border-[#2d2d2d] text-white flex-shrink-0 cursor-default">
          <Menu className="h-[18px] w-[18px]" />
        </div>
      </div>

      {/* Mobile Fullscreen Menu Drawer (md:hidden) */}
      <div 
        className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Dark backdrop overlay */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
        
        {/* Drawer panel content */}
        <div 
          className={`absolute top-0 left-0 h-full w-[280px] max-w-[80vw] bg-[#1a1a1c] text-white shadow-2xl p-5 flex flex-col justify-between transform transition-transform duration-300 ease-out z-10 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex flex-col gap-5 overflow-y-auto scrollbar-none flex-1">
            {/* Header branding & close button */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#df3232] flex items-center justify-center font-extrabold text-white text-base shadow-inner">
                  {brand.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-extrabold text-xs tracking-wider uppercase leading-none">
                    {brand.name}
                  </span>
                  <span className="text-white/60 font-bold text-[8px] tracking-wide leading-none mt-1">
                    {brand.tagline}
                  </span>
                </div>
              </div>
              
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                aria-label="Close menu"
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Search */}
            <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 flex items-center gap-2">
              <Search size={14} className="text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder={brand.searchPlaceholder}
                className="bg-transparent text-xs text-white outline-none placeholder:text-gray-500 w-full font-medium"
              />
            </div>

            {/* Category Navigation Links */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest px-2 mb-1">
                Chuyên mục
              </span>
              {categories.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={`drawer-${item.label}`}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                      isActive
                        ? "bg-[#df3232] text-white shadow-md shadow-[#df3232]/10"
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span>{item.label}</span>
                    <ChevronRight size={12} className={isActive ? "text-white" : "text-gray-500"} />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Bottom section of drawer: Utility links & Social Links */}
          <div className="border-t border-white/10 pt-4 flex flex-col gap-4 mt-auto">
            {utilityLink && (
              utilityLink.href ? (
                <Link
                  href={utilityLink.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#df3232] to-[#e24a48] text-white font-extrabold text-[11px] text-center shadow-lg shadow-[#df3232]/20 hover:opacity-95 active:scale-98 transition-all"
                >
                  {utilityLink.label}
                </Link>
              ) : (
                <div
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#df3232] to-[#e24a48] text-white font-extrabold text-[11px] text-center shadow-lg shadow-[#df3232]/20 opacity-80 cursor-default select-none pointer-events-none"
                >
                  {utilityLink.label}
                </div>
              )
            )}

            {/* Social Links */}
            <div className="flex gap-2">
              {brand.socialLinks.map((item) => (
                <a
                  key={`drawer-${item.label}-${item.href}`}
                  href={item.href}
                  target={isExternalHref(item.href) ? "_blank" : undefined}
                  rel={isExternalHref(item.href) ? "noopener noreferrer" : undefined}
                  className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center gap-1.5 text-[10px] font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  {getSocialIcon(item)}
                  <span>{item.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function HeaderSocialLink({
  item,
  variant = "desktop",
}: {
  item: SocialLink;
  variant?: "desktop" | "mobile";
}) {
  const className =
    variant === "desktop"
      ? "w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#e24a48] hover:bg-gray-100 transition-colors"
      : "w-7 h-7 rounded-full bg-[#df3232] flex items-center justify-center text-white";

  return (
    <a
      href={item.href}
      target={isExternalHref(item.href) ? "_blank" : undefined}
      rel={isExternalHref(item.href) ? "noopener noreferrer" : undefined}
      className={className}
      aria-label={item.label}
    >
      {getSocialIcon(item)}
    </a>
  );
}

function getSocialIcon(item: SocialLink) {
  if (item.platform === "zalo") {
    return <ZaloIcon className="h-4 w-4" />;
  }

  if (item.platform === "email") {
    return <Mail className="h-4 w-4" />;
  }

  return <span className="text-[10px] font-bold">{item.label.slice(0, 1).toUpperCase()}</span>;
}

function isExternalHref(href: string) {
  return href.startsWith("http://") || href.startsWith("https://");
}
