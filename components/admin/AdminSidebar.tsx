"use client";

import React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Folder,
  Image as ImageIcon,
  Lock,
  X,
} from "lucide-react";
import type { TabType } from "./AdminTypes";

interface AdminSidebarProps {
  activeTab: TabType;
  sidebarOpen: boolean;
  logoUrl: string | null;
  logoWebsiteName: string;
  onCloseSidebar: () => void;
}

const navItems: {
  tab: TabType;
  href: string;
  label: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  svg?: React.ReactNode;
}[] = [
  { tab: "dashboard", href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { tab: "posts", href: "/admin/posts", label: "Quản lý bài viết", icon: FileText },
  { tab: "categories", href: "/admin/categories", label: "Quản lý danh mục", icon: Folder },
  {
    tab: "ads",
    href: "/admin/ads",
    label: "Quản lý AD",
    svg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M7 16V8h2a3 3 0 0 1 0 6H7" />
        <path d="M14 16v-6a2 2 0 0 1 4 0v6" />
        <path d="M14 13h4" />
      </svg>
    ),
  },
  {
    tab: "logo-footer",
    href: "/admin/logo-footer",
    label: "Logo & Footer",
    svg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M3 9h18" />
        <path d="M3 15h18" />
      </svg>
    ),
  },
  { tab: "media", href: "/admin/media", label: "Quản lý Media", icon: ImageIcon },
  { tab: "accounts", href: "/admin/accounts", label: "Quản lý Tài khoản", icon: Lock },
];

export default function AdminSidebar({
  activeTab,
  sidebarOpen,
  logoUrl,
  logoWebsiteName,
  onCloseSidebar,
}: AdminSidebarProps) {
  return (
    <>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCloseSidebar}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <div
        className={`fixed top-0 bottom-0 left-0 z-40 w-[260px] bg-[#E55956] text-white p-5 flex flex-col justify-between transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:sticky lg:top-0 lg:h-screen lg:flex`}
      >
        <div>
          <div className="flex items-center gap-3.5 mb-10 mt-2">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo"
                className="w-[50px] h-[50px] rounded-full flex-shrink-0 border-2 border-white/25 shadow-sm object-contain bg-white p-0.5"
              />
            ) : (
              <div className="w-[50px] h-[50px] bg-[#cb4643] rounded-full flex-shrink-0 border-2 border-white/25 shadow-sm flex items-center justify-center font-black text-white text-lg">
                {(logoWebsiteName || "W").slice(0, 1).toUpperCase()}
              </div>
            )}
            <span className="font-extrabold text-[22px] tracking-tight drop-shadow-sm">
              {logoWebsiteName || "Logo"}
            </span>
            <button
              type="button"
              onClick={onCloseSidebar}
              className="ml-auto lg:hidden text-white hover:text-red-100 p-1"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex flex-col gap-2">
            {navItems.map(({ tab, href, label, icon: Icon, svg }) => {
              const isActive = activeTab === tab;
              return (
                <Link
                  key={tab}
                  href={href}
                  prefetch
                  onClick={onCloseSidebar}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                    isActive
                      ? "bg-[#cb4643] text-white shadow-md border-l-4 border-white"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {Icon ? (
                    <Icon size={18} className="flex-shrink-0" />
                  ) : svg ? (
                    svg
                  ) : null}
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-white/20 text-xs text-white/60 text-center">
          Admin Control Center &copy; 2026
        </div>
      </div>
    </>
  );
}
