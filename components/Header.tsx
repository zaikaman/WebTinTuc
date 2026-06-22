"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Menu, Search, X } from "lucide-react";
import type { SiteSettings, SocialLink } from "@/lib/types/news";

interface HeaderProps {
  settings: SiteSettings["header"];
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
      {/* Speech bubble path */}
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      {/* Centered capital 'Z' */}
      <path d="M9.5 9h5l-5 6h5" />
    </svg>
  );
}

export function Header({ settings }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const utilityLink = settings.utilityLinks[0];

  return (
    <header className="w-full select-none font-sans bg-white">
      {/* Top Header Bar */}
      <div className="flex items-stretch h-[48px] md:h-auto">
        <Link
          href="/"
          className="bg-[#df3232] text-white flex items-center gap-2 md:gap-3 px-3 md:px-5 py-2 md:py-3.5 min-w-[115px] md:min-w-[220px] flex-shrink-0"
        >
          <div className="w-6 h-6 md:w-9 md:h-9 rounded-full bg-white flex-shrink-0" />
          <div className="flex flex-col justify-center">
            <span className="text-white font-extrabold text-[11px] md:text-[15px] leading-[1.1] tracking-wider uppercase">
              {settings.logoText}
            </span>
            <span className="text-white font-bold text-[8px] md:text-[11px] leading-[1.1] whitespace-nowrap tracking-wide mt-0.5">
              {settings.logoSubtitle}
            </span>
          </div>
        </Link>

        <div className="flex-1 bg-[#e24a48] flex items-center justify-between px-2.5 md:px-6">
          {/* Mobile Top Bar Section */}
          <div className="flex md:hidden items-center justify-between w-full gap-2">
            {/* Search Pill */}
            <div className="flex-1 flex h-[28px] items-center rounded-[14px] border border-[#d5d5d5] bg-[#f0eeee] px-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
              <Search size={12} className="mr-1.5 flex-shrink-0 text-[#4c6281]" />
              <input
                type="text"
                placeholder="Tìm kiếm"
                className="h-full w-full bg-transparent text-[10px] font-bold text-[#4c6281] outline-none placeholder:text-[#4c6281]/70"
              />
            </div>

            {/* Contact Info (wrapped into two lines) */}
            {utilityLink && (
              <Link
                href={utilityLink.href || "#"}
                className="text-white text-[9px] font-bold leading-tight text-center whitespace-normal max-w-[55px] flex-shrink-0 hover:text-[#ffebeb] ml-1"
              >
                Liên hệ<br/>quảng cáo
              </Link>
            )}

            {/* Social Links (Zalo & Email) */}
            <div className="flex items-center gap-1.5 flex-shrink-0 ml-1">
              {settings.socialLinks.map((item) => (
                <a
                  key={`mobile-${item.label}-${item.href}`}
                  href={item.href}
                  target={isExternalHref(item.href) ? "_blank" : undefined}
                  rel={isExternalHref(item.href) ? "noopener noreferrer" : undefined}
                  className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[#e24a48] hover:bg-gray-100 transition-colors flex-shrink-0 shadow-sm"
                  aria-label={item.label}
                >
                  {getSocialIcon(item)}
                </a>
              ))}
            </div>
          </div>

          {/* Desktop Top Bar Section */}
          <div className="hidden md:grid w-full grid-cols-[minmax(260px,1fr)_auto] items-center gap-5 lg:gap-7">
            <div className="flex justify-center">
              <div className="flex h-[34px] w-full max-w-[760px] items-center rounded-[17px] border border-[#d5d5d5] bg-[#f0eeee] px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] transition-colors focus-within:border-white focus-within:bg-white">
                <Search size={15} className="mr-2.5 flex-shrink-0 text-[#4c6281]" />
                <input
                  type="text"
                  placeholder={settings.searchPlaceholder}
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
                {settings.socialLinks.map((item) => (
                  <HeaderSocialLink key={`${item.label}-${item.href}`} item={item} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Subheader (Desktop & Mobile) */}
      <div className="flex h-[36px] items-center text-white bg-[#404040] border-b border-[#2d2d2d]">
        <Link
          href="/"
          className={`bg-[#333333] h-full w-[32px] md:w-auto md:px-5 flex items-center justify-center hover:bg-[#df3232] transition-colors border-r border-[#2d2d2d] flex-shrink-0 ${
            pathname === "/" ? "text-[#df3232] bg-[#333333]" : "text-white"
          }`}
          aria-label="Home"
        >
          <HomeIcon className="h-[21px] w-[21px] text-white" />
        </Link>
        <nav className="flex-1 flex h-full text-[10px] min-[360px]:text-[11px] md:text-xs font-bold tracking-tight md:tracking-wider overflow-x-auto scrollbar-none whitespace-nowrap">
          {settings.primaryLinks.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={`${item.label}-${item.href}`}
                href={item.href}
                className={`flex-auto px-1.5 min-[360px]:px-2.5 md:px-2 h-full flex items-center justify-center transition-colors border-r border-[#2d2d2d] text-center whitespace-nowrap relative flex-shrink-0 ${
                  isActive
                    ? "text-[#df3232] md:bg-[#333333]"
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
        {/* Mobile Hamburger menu trigger on the right side of the nav bar */}
        <button
          className="flex md:hidden h-full w-[32px] items-center justify-center bg-[#333333] border-l border-[#2d2d2d] text-white hover:bg-[#df3232] transition-colors flex-shrink-0"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gray-200 bg-[#f9f9f9] py-2 transition-all">
          <div className="px-4 py-2 border-b border-gray-200">
            <div className="flex items-center bg-[#e7e5e5] border border-gray-300 rounded-[15px] px-3 py-1.5 w-full">
              <Search size={14} className="text-[#4c6281] mr-2" />
              <input
                type="text"
                placeholder={settings.searchPlaceholder}
                className="bg-transparent text-[#4c6281] font-bold text-xs placeholder-[#4c6281]/70 outline-none w-full"
              />
            </div>
          </div>
          <div className="font-bold text-xs text-gray-700">
            {settings.primaryLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={`${item.label}-${item.href}`}
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
              {utilityLink && utilityLink.href ? (
                <Link href={utilityLink.href} className="text-gray-600 hover:text-[#df3232] font-bold">
                  {utilityLink.label}
                </Link>
              ) : utilityLink ? (
                <span className="text-gray-600 font-bold">
                  {utilityLink.label}
                </span>
              ) : null}
              <div className="flex gap-2.5 ml-auto">
                {settings.socialLinks.map((item) => (
                  <HeaderSocialLink
                    key={`${item.label}-${item.href}`}
                    item={item}
                    variant="mobile"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
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
