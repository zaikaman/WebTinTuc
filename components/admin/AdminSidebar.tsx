"use client";

import React from "react";
import {
  LayoutDashboard,
  FileText,
  Folder,
  Image as ImageIcon,
  MousePointerClick,
  LogOut,
  X,
  Menu,
} from "lucide-react";
import type { TabType } from "./AdminTypes";

interface AdminSidebarProps {
  activeTab: TabType;
  sidebarOpen: boolean;
  onTabChange: (tab: TabType) => void;
  onToggleSidebar: () => void;
  onLogout: () => void;
}

const sidebarItems: { tab: TabType; label: string; icon: React.ElementType }[] = [
  { tab: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { tab: "posts", label: "Quản lý bài viết", icon: FileText },
  { tab: "categories", label: "Quản lý danh mục", icon: Folder },
  { tab: "ads", label: "Quản lý AD", icon: MousePointerClick },
  { tab: "logo-footer", label: "Logo & Footer", icon: ImageIcon },
  { tab: "media", label: "Quản lý Media", icon: ImageIcon },
];

export default function AdminSidebar({
  activeTab,
  sidebarOpen,
  onTabChange,
  onToggleSidebar,
  onLogout,
}: AdminSidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={onToggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-[260px] bg-[#E55956] text-white flex flex-col transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Close button (mobile) */}
        <button
          className="lg:hidden absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          onClick={onToggleSidebar}
        >
          <X size={20} />
        </button>

        {/* Logo */}
        <div className="px-6 pt-6 pb-4 flex items-center gap-3 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black text-lg">
            A
          </div>
          <div>
            <div className="text-base font-bold tracking-tight">Admin Panel</div>
            <div className="text-[11px] text-white/60 font-medium">Quản trị hệ thống</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {sidebarItems.map(({ tab, label, icon: Icon }) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab
                  ? "bg-white/20 text-white shadow-md"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-4 border-t border-white/10 pt-3">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white transition-all"
          >
            <LogOut size={18} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Mobile toggle button (shown when sidebar is hidden) */}
      {!sidebarOpen && (
        <button
          className="lg:hidden fixed top-3 left-3 z-10 p-2.5 rounded-xl bg-white border border-gray-200 shadow-md hover:bg-gray-50 transition-colors"
          onClick={onToggleSidebar}
        >
          <Menu size={20} className="text-gray-700" />
        </button>
      )}
    </>
  );
}
