"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { getAdminDashboardStats } from "@/lib/api/adminClient";
import { getCategoryStyles } from "@/components/admin/AdminUtils";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminLogin from "@/components/admin/AdminLogin";
import DashboardTab from "@/components/admin/DashboardTab";
import LogoutDialog from "@/components/admin/LogoutDialog";
import { useAdminAuth } from "@/lib/hooks/useAdminAuth";
import { toast } from "sonner";
import type { TabType } from "@/components/admin/AdminTypes";

export default function DashboardPage() {
  const router = useRouter();
  const auth = useAdminAuth();

  // --- Auth redirect ---
  useEffect(() => {
    if (!auth.isAuthVerified) return;
    if (!auth.isLoggedIn) {
      router.replace("/admin");
    }
  }, [auth.isAuthVerified, auth.isLoggedIn, router]);

  // --- Sidebar state ---
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  // --- Dashboard-specific state ---
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<"today" | "week" | "month" | "year">("month");
  const [dashboardDay, setDashboardDay] = useState("");
  const [dashboardMonth, setDashboardMonth] = useState("");
  const [dashboardYear, setDashboardYear] = useState("");

  // --- Data fetching ---
  const loadDashboardStats = useCallback(async () => {
    try {
      setDashboardLoading(true);
      const res = await getAdminDashboardStats();
      if (res) {
        setDashboardData(res);
      }
    } catch {
      toast.error("Không thể tải dữ liệu thống kê dashboard");
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  useEffect(() => {
    if (auth.isLoggedIn && auth.isAuthVerified) {
      loadDashboardStats();
    }
  }, [auth.isLoggedIn, auth.isAuthVerified, loadDashboardStats]);

  // --- Memoized dashboard stats ---
  const dashboardStats = useMemo(() => {
    if (!dashboardData) {
      return {
        views: "0",
        viewsVal: "0",
        posts: 0,
        clicks: "0",
        viewsChange: "+0%",
        postsChange: "+0",
        clicksChange: "+0%",
        isViewsUp: true,
        isPostsUp: true,
        isClicksUp: true,
      };
    }

    const formatViews = (val: number) => {
      if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + "M";
      if (val >= 1_000) return (val / 1_000).toFixed(1) + "K";
      return val.toString();
    };

    const getPercentageChange = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? "+100%" : "+0%";
      const diff = ((curr - prev) / prev) * 100;
      const rounded = diff.toFixed(1);
      return diff >= 0 ? `+${rounded}%` : `${rounded}%`;
    };

    const totalArticles = dashboardData.totalArticles || 0;

    switch (timeFilter) {
      case "today": {
        const currViews = dashboardData.todayViews || 0;
        const prevViews = dashboardData.yesterdayViews || 0;
        const currClicks = dashboardData.todayClicks || 0;
        const prevClicks = dashboardData.yesterdayClicks || 0;
        return {
          views: currViews.toLocaleString("vi-VN") + " lượt",
          viewsVal: formatViews(currViews),
          posts: totalArticles,
          clicks: currClicks.toLocaleString("vi-VN"),
          viewsChange: getPercentageChange(currViews, prevViews),
          postsChange: `Tổng: ${totalArticles}`,
          clicksChange: getPercentageChange(currClicks, prevClicks),
          isViewsUp: currViews >= prevViews,
          isPostsUp: true,
          isClicksUp: currClicks >= prevClicks,
        };
      }
      case "week": {
        const currViews = dashboardData.weekViews || 0;
        const prevViews = dashboardData.prevWeekViews || 0;
        const currClicks = dashboardData.weekClicks || 0;
        const prevClicks = dashboardData.prevWeekClicks || 0;
        return {
          views: currViews.toLocaleString("vi-VN") + " lượt",
          viewsVal: formatViews(currViews),
          posts: totalArticles,
          clicks: currClicks.toLocaleString("vi-VN"),
          viewsChange: getPercentageChange(currViews, prevViews),
          postsChange: `Tổng: ${totalArticles}`,
          clicksChange: getPercentageChange(currClicks, prevClicks),
          isViewsUp: currViews >= prevViews,
          isPostsUp: true,
          isClicksUp: currClicks >= prevClicks,
        };
      }
      case "month": {
        const currViews = dashboardData.monthViews || 0;
        const prevViews = dashboardData.prevMonthViews || 0;
        const currClicks = dashboardData.monthClicks || 0;
        const prevClicks = dashboardData.prevMonthClicks || 0;
        return {
          views: currViews.toLocaleString("vi-VN") + " lượt",
          viewsVal: formatViews(currViews),
          posts: totalArticles,
          clicks: currClicks.toLocaleString("vi-VN"),
          viewsChange: getPercentageChange(currViews, prevViews),
          postsChange: `Tổng: ${totalArticles}`,
          clicksChange: getPercentageChange(currClicks, prevClicks),
          isViewsUp: currViews >= prevViews,
          isPostsUp: true,
          isClicksUp: currClicks >= prevClicks,
        };
      }
      case "year":
      default: {
        const currViews = dashboardData.totalViews || 0;
        const currClicks = dashboardData.totalClicks || 0;
        return {
          views: currViews.toLocaleString("vi-VN") + " lượt",
          viewsVal: formatViews(currViews),
          posts: totalArticles,
          clicks: currClicks.toLocaleString("vi-VN"),
          viewsChange: "+0%",
          postsChange: `Tổng: ${totalArticles}`,
          clicksChange: "+0%",
          isViewsUp: true,
          isPostsUp: true,
          isClicksUp: true,
        };
      }
    }
  }, [timeFilter, dashboardData]);

  const categoryStats = useMemo(() => {
    if (!dashboardData || !dashboardData.topCategories) return [];
    const total =
      dashboardData.topCategories.reduce(
        (sum: number, c: any) => sum + (c.article_count || 0),
        0
      ) || 1;
    return dashboardData.topCategories.map((cat: any) => ({
      name: cat.name,
      count: cat.article_count || 0,
      percentage: Math.round(((cat.article_count || 0) / total) * 100),
    }));
  }, [dashboardData]);

  const topPosts = useMemo(() => {
    if (!dashboardData || !dashboardData.topArticles) return [];
    return dashboardData.topArticles.map((p: any) => ({
      id: p.id,
      title: p.title,
      category: p.categories?.name || "Tin tức",
      views: p.trending_views || p.views || 0,
    }));
  }, [dashboardData]);

  const handleExportReport = useCallback(() => {
    if (!dashboardData) {
      toast.error("Không có dữ liệu thống kê để xuất!");
      return;
    }
    toast.loading("Đang xuất báo cáo...", { id: "export-report" });
    try {
      const csvRows: string[] = [];
      csvRows.push("Chỉ số,Hôm nay,Tuần này,Tháng này,Tổng cộng");

      csvRows.push(
        `Lượt xem bài viết,${dashboardData.todayViews || 0},${dashboardData.weekViews || 0},${dashboardData.monthViews || 0},${dashboardData.totalViews || 0}`
      );
      csvRows.push(
        `Lượt click quảng cáo,${dashboardData.todayClicks || 0},${dashboardData.weekClicks || 0},${dashboardData.monthClicks || 0},${dashboardData.totalClicks || 0}`
      );
      csvRows.push(`Tổng số bài viết, , , ,${dashboardData.totalArticles || 0}`);
      csvRows.push(`Tổng số quảng cáo, , , ,${dashboardData.totalAds || 0}`);
      csvRows.push(`Tổng số danh mục, , , ,${dashboardData.totalCategories || 0}`);

      csvRows.push("\nDanh mục,Số lượng bài đăng");
      if (dashboardData.topCategories) {
        dashboardData.topCategories.forEach((c: any) => {
          csvRows.push(`"${c.name}",${c.article_count || 0}`);
        });
      }

      csvRows.push("\nTop Bài viết,Lượt xem,Danh mục");
      if (dashboardData.topArticles) {
        dashboardData.topArticles.forEach((p: any) => {
          csvRows.push(
            `"${p.title}",${p.views || 0},"${p.categories?.name || "Tin tức"}"`
          );
        });
      }

      const csvContent = "\uFEFF" + csvRows.join("\n");
      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `bao_cao_thong_ke_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Tải xuống báo cáo CSV thành công!", {
        id: "export-report",
      });
    } catch {
      toast.error("Có lỗi xảy ra khi xuất báo cáo!", { id: "export-report" });
    }
  }, [dashboardData]);

  const handleTabChange = useCallback(
    (tab: TabType) => {
      router.push(`/admin/${tab}`);
      setSidebarOpen(false);
    },
    [router]
  );

  // --- Loading state while verifying auth ---
  if (!auth.isAuthVerified) {
    return (
      <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#E55956] border-t-transparent rounded-full" />
      </div>
    );
  }

  // --- Login screen ---
  if (!auth.isLoggedIn) {
    return (
      <AdminLogin
        loginUsername={auth.loginUsername}
        loginPassword={auth.loginPassword}
        showPassword={auth.showPassword}
        isLoading={auth.isLoading}
        onUsernameChange={auth.setLoginUsername}
        onPasswordChange={auth.setLoginPassword}
        onTogglePassword={() => auth.setShowPassword(!auth.showPassword)}
        onSubmit={auth.handleLogin}
      />
    );
  }

  // --- Main dashboard layout ---
  return (
    <div className="min-h-screen bg-[#f4f6f8] text-[#2c3e50] font-sans antialiased flex animate-fade-in">
      {/* Sidebar */}
      <AdminSidebar
        activeTab={"dashboard" as TabType}
        sidebarOpen={sidebarOpen}
        logoUrl={null}
        logoWebsiteName="Admin"
        onTabChange={handleTabChange}
        onCloseSidebar={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Top navbar */}
        <header className="h-[70px] bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-[#2c3e50] hover:text-[#cb4643] transition-colors p-1.5 border border-gray-200 rounded-lg"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <LayoutDashboard size={20} className="text-[#E55956]" />
              <span>Dashboard</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-sm font-bold text-gray-900">
                  Administrator
                </span>
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

        {/* Page content */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          <DashboardTab
            loading={dashboardLoading}
            stats={dashboardStats}
            dashboardData={dashboardData}
            timeFilter={timeFilter}
            onTimeFilterChange={(filter) => setTimeFilter(filter as any)}
            dashboardDay={dashboardDay}
            onDashboardDayChange={setDashboardDay}
            dashboardMonth={dashboardMonth}
            onDashboardMonthChange={setDashboardMonth}
            dashboardYear={dashboardYear}
            onDashboardYearChange={setDashboardYear}
            categoryStats={categoryStats}
            topPosts={topPosts}
            onExportReport={handleExportReport}
            getCategoryStyles={getCategoryStyles}
          />
        </main>
      </div>

      {/* Logout confirmation dialog */}
      <LogoutDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        onConfirm={auth.handleLogout}
      />
    </div>
  );
}
