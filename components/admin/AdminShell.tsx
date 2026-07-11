"use client";

import React, { useCallback, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, LogOut, LayoutDashboard } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import LogoutDialog from "@/components/admin/LogoutDialog";
import { useAdminAuth } from "@/lib/hooks/useAdminAuth";
import { useSiteSettings } from "@/lib/hooks/useSiteSettings";
import type { TabType } from "@/components/admin/AdminTypes";

const PAGE_TITLES: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/posts": "Quản lý bài viết",
  "/admin/categories": "Quản lý danh mục",
  "/admin/ads": "Quản lý AD",
  "/admin/logo-footer": "Logo & Footer",
  "/admin/media": "Quản lý Media",
  "/admin/accounts": "Quản lý Tài khoản",
};

function tabFromPath(pathname: string): TabType {
  const segment = pathname.replace(/^\/admin\/?/, "").split("/")[0] || "dashboard";
  const allowed: TabType[] = [
    "dashboard",
    "posts",
    "categories",
    "ads",
    "logo-footer",
    "media",
    "accounts",
  ];
  return (allowed.includes(segment as TabType) ? segment : "dashboard") as TabType;
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/admin/dashboard";
  const auth = useAdminAuth();
  const siteSettings = useSiteSettings();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const activeTab = useMemo(() => tabFromPath(pathname), [pathname]);
  const title = PAGE_TITLES[pathname] || PAGE_TITLES[`/admin/${activeTab}`] || "Admin";

  const handleCloseSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-[#2c3e50] font-sans antialiased flex animate-fade-in">
      <AdminSidebar
        activeTab={activeTab}
        sidebarOpen={sidebarOpen}
        logoUrl={siteSettings.logoUrl}
        logoWebsiteName={siteSettings.logoWebsiteName}
        onCloseSidebar={handleCloseSidebar}
      />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        <header className="h-[70px] bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-[#2c3e50] hover:text-[#cb4643] transition-colors p-1.5 border border-gray-200 rounded-lg"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <LayoutDashboard size={20} className="text-[#E55956]" />
              <span>{title}</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-sm font-bold text-gray-900">Administrator</span>
                <span className="text-[10px] font-semibold text-[#E55956] uppercase tracking-wider">
                  Super Admin
                </span>
              </div>
              <div className="w-[40px] h-[40px] rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 border border-slate-300 select-none">
                AD
              </div>
            </div>

            <button
              type="button"
              onClick={() => setLogoutDialogOpen(true)}
              className="flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 hover:border-red-200 hover:bg-red-50 text-gray-500 hover:text-[#E55956] transition-all"
              title="Đăng xuất"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto flex flex-col gap-6">
          {children}
        </main>
      </div>

      <LogoutDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        onConfirm={auth.handleLogout}
      />
    </div>
  );
}
