"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminDashboardStats } from "@/lib/api/adminClient";
import { getCategoryStyles } from "@/components/admin/AdminUtils";
import DashboardTab from "@/components/admin/DashboardTab";
import { adminKeys } from "@/lib/query/adminKeys";
import { toast } from "sonner";

type TimeFilter = "today" | "week" | "month" | "year";

export default function DashboardPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("month");
  const [dashboardDay, setDashboardDay] = useState("");
  const [dashboardMonth, setDashboardMonth] = useState("");
  const [dashboardYear, setDashboardYear] = useState("");
  const [customParams, setCustomParams] = useState<{
    day?: string;
    month?: string;
    year?: string;
  } | null>(null);

  const isCustom = !!(customParams?.day || customParams?.month || customParams?.year);

  const queryParams = useMemo(() => {
    if (isCustom && customParams) {
      return {
        day: customParams.day || undefined,
        month: customParams.month || undefined,
        year: customParams.year || undefined,
      };
    }
    // Standard filters: single shared payload (all timeframes in one RPC)
    return {};
  }, [isCustom, customParams]);

  const {
    data: dashboardData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: adminKeys.dashboard(queryParams),
    queryFn: () => getAdminDashboardStats(queryParams),
    staleTime: 60_000,
  });

  const handleTimeFilterChange = useCallback((filter: string) => {
    setDashboardDay("");
    setDashboardMonth("");
    setDashboardYear("");
    setCustomParams(null);
    setTimeFilter(filter as TimeFilter);
  }, []);

  const handleApplyFilter = useCallback(() => {
    if (!dashboardDay && !dashboardMonth && !dashboardYear) return;

    let newTimeFilter: TimeFilter = "month";
    if (dashboardDay) newTimeFilter = "today";
    else if (dashboardMonth) newTimeFilter = "month";
    else if (dashboardYear) newTimeFilter = "year";

    setTimeFilter(newTimeFilter);
    setCustomParams({
      day: dashboardDay || undefined,
      month: dashboardMonth || undefined,
      year: dashboardYear || undefined,
    });
  }, [dashboardDay, dashboardMonth, dashboardYear]);

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
    const currPosts =
      dashboardData.periodArticles !== undefined
        ? dashboardData.periodArticles
        : totalArticles;

    // Custom range: backend maps period totals into todayViews / yesterdayViews
    if (isCustom) {
      const currViews = dashboardData.todayViews ?? dashboardData.totalViews ?? 0;
      const prevViews = dashboardData.yesterdayViews ?? 0;
      const currClicks = dashboardData.todayClicks ?? dashboardData.totalClicks ?? 0;
      const prevClicks = dashboardData.yesterdayClicks ?? 0;
      return {
        views: currViews.toLocaleString("vi-VN") + " lượt",
        viewsVal: formatViews(currViews),
        posts: currPosts,
        clicks: currClicks.toLocaleString("vi-VN"),
        viewsChange: getPercentageChange(currViews, prevViews),
        postsChange: `Tổng: ${totalArticles}`,
        clicksChange: getPercentageChange(currClicks, prevClicks),
        isViewsUp: currViews >= prevViews,
        isPostsUp: true,
        isClicksUp: currClicks >= prevClicks,
      };
    }

    switch (timeFilter) {
      case "today": {
        const currViews = dashboardData.todayViews || 0;
        const prevViews = dashboardData.yesterdayViews || 0;
        const currClicks = dashboardData.todayClicks || 0;
        const prevClicks = dashboardData.yesterdayClicks || 0;
        return {
          views: currViews.toLocaleString("vi-VN") + " lượt",
          viewsVal: formatViews(currViews),
          posts: currPosts,
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
          posts: currPosts,
          clicks: currClicks.toLocaleString("vi-VN"),
          viewsChange: getPercentageChange(currViews, prevViews),
          postsChange: `Tổng: ${totalArticles}`,
          clicksChange: getPercentageChange(currClicks, prevClicks),
          isViewsUp: currViews >= prevViews,
          isPostsUp: true,
          isClicksUp: currClicks >= prevClicks,
        };
      }
      case "year": {
        const currViews = dashboardData.yearViews ?? dashboardData.totalViews ?? 0;
        const prevViews = dashboardData.prevYearViews || 0;
        const currClicks = dashboardData.yearClicks ?? dashboardData.totalClicks ?? 0;
        const prevClicks = dashboardData.prevYearClicks || 0;
        return {
          views: currViews.toLocaleString("vi-VN") + " lượt",
          viewsVal: formatViews(currViews),
          posts: currPosts,
          clicks: currClicks.toLocaleString("vi-VN"),
          viewsChange: getPercentageChange(currViews, prevViews),
          postsChange: `Tổng: ${totalArticles}`,
          clicksChange: getPercentageChange(currClicks, prevClicks),
          isViewsUp: currViews >= prevViews,
          isPostsUp: true,
          isClicksUp: currClicks >= prevClicks,
        };
      }
      case "month":
      default: {
        const currViews = dashboardData.monthViews || 0;
        const prevViews = dashboardData.prevMonthViews || 0;
        const currClicks = dashboardData.monthClicks || 0;
        const prevClicks = dashboardData.prevMonthClicks || 0;
        return {
          views: currViews.toLocaleString("vi-VN") + " lượt",
          viewsVal: formatViews(currViews),
          posts: currPosts,
          clicks: currClicks.toLocaleString("vi-VN"),
          viewsChange: getPercentageChange(currViews, prevViews),
          postsChange: `Tổng: ${totalArticles}`,
          clicksChange: getPercentageChange(currClicks, prevClicks),
          isViewsUp: currViews >= prevViews,
          isPostsUp: true,
          isClicksUp: currClicks >= prevClicks,
        };
      }
    }
  }, [timeFilter, dashboardData, isCustom]);

  const categoryStats = useMemo(() => {
    if (!dashboardData?.topCategories) return [];
    const total =
      dashboardData.topCategories.reduce(
        (sum, c) => sum + (c.article_count || 0),
        0
      ) || 1;
    return dashboardData.topCategories.map((cat) => ({
      name: cat.name,
      count: cat.article_count || 0,
      percentage: Math.round(((cat.article_count || 0) / total) * 100),
    }));
  }, [dashboardData]);

  const topPosts = useMemo(() => {
    if (!dashboardData?.topArticles) return [];
    return dashboardData.topArticles.map((p) => ({
      id: p.id,
      title: p.title,
      category: p.category || p.categories?.name || "Tin tức",
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
      dashboardData.topCategories?.forEach((c) => {
        csvRows.push(`"${c.name}",${c.article_count || 0}`);
      });
      csvRows.push("\nTop Bài viết,Lượt xem,Danh mục");
      dashboardData.topArticles?.forEach((p) => {
        csvRows.push(
          `"${p.title}",${p.views || 0},"${p.category || p.categories?.name || "Tin tức"}"`
        );
      });

      const csvContent = "\uFEFF" + csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
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
      toast.success("Tải xuống báo cáo CSV thành công!", { id: "export-report" });
    } catch (err: any) {
      toast.error(err?.message || "Có lỗi xảy ra khi xuất báo cáo!", {
        id: "export-report",
      });
    }
  }, [dashboardData]);

  // Only full skeleton on first load (no cached data)
  const showSkeleton = isLoading && !dashboardData;

  return (
    <div className={isFetching && dashboardData ? "opacity-95 transition-opacity" : undefined}>
      <DashboardTab
        loading={showSkeleton}
        stats={dashboardStats}
        dashboardData={
          dashboardData
            ? { recentActivities: dashboardData.recentActivities || [] }
            : undefined
        }
        timeFilter={timeFilter}
        onTimeFilterChange={handleTimeFilterChange}
        dashboardDay={dashboardDay}
        onDashboardDayChange={setDashboardDay}
        dashboardMonth={dashboardMonth}
        onDashboardMonthChange={setDashboardMonth}
        dashboardYear={dashboardYear}
        onDashboardYearChange={setDashboardYear}
        categoryStats={categoryStats}
        topPosts={topPosts}
        onExportReport={handleExportReport}
        onApplyFilter={handleApplyFilter}
        getCategoryStyles={getCategoryStyles}
      />
    </div>
  );
}
