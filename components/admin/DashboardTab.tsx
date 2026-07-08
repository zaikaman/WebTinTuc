"use client";

import { Download, Eye, TrendingUp, FileText, MousePointerClick, BarChart3, ChevronDown } from "lucide-react";
import { DashboardSkeleton } from "./SkeletonLoaders";
import type { DashboardStats, AdminDashboardData } from "./AdminTypes";

interface DashboardTabProps {
  loading: boolean;
  stats: DashboardStats;
  dashboardData?: AdminDashboardData["dashboard"];
  timeFilter: string;
  onTimeFilterChange: (filter: string) => void;
  dashboardDay: string;
  onDashboardDayChange: (day: string) => void;
  dashboardMonth: string;
  onDashboardMonthChange: (month: string) => void;
  dashboardYear: string;
  onDashboardYearChange: (year: string) => void;
  categoryStats: Array<{ name: string; count: number; percentage: number }>;
  topPosts: Array<{ title: string; views: number; category: string; id?: number }>;
  onExportReport: () => void;
  getCategoryStyles: (name: string) => { color: string; bg: string; icon: React.ComponentType<{ className?: string }> };
}

export default function DashboardTab({
  loading,
  stats,
  dashboardData,
  timeFilter,
  onTimeFilterChange,
  dashboardDay,
  onDashboardDayChange,
  dashboardMonth,
  onDashboardMonthChange,
  dashboardYear,
  onDashboardYearChange,
  categoryStats,
  topPosts,
  onExportReport,
  getCategoryStyles,
}: DashboardTabProps) {
  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <>
      {/* HEADER ACTION BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-2.5 h-full bg-[#E55956]" />
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Dashboard</h2>
          <p className="text-xs text-gray-500 mt-1">Tổng quan hoạt động và hiệu suất toàn bộ hệ thống</p>
        </div>
        <button
          type="button"
          onClick={onExportReport}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#E55956] hover:bg-[#cb4643] active:scale-[0.98] text-white text-sm font-bold rounded-xl shadow-md transition-all self-start sm:self-center"
        >
          <Download size={16} />
          <span>Xuất thống kê</span>
        </button>
      </div>

      {/* FILTER BAR SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex flex-wrap gap-2 p-1 bg-gray-50 rounded-xl border border-gray-100 w-fit">
          {[
            { id: "today", label: "Hôm nay" },
            { id: "week", label: "Tuần này" },
            { id: "month", label: "Tháng này" },
            { id: "year", label: "Năm nay" }
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onTimeFilterChange(item.id)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all relative ${timeFilter === item.id
                ? "bg-[#E55956] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Select Ngày */}
          <div className="relative">
            <select
              value={dashboardDay}
              onChange={(e) => onDashboardDayChange(e.target.value)}
              className="pl-3 pr-7 py-2.5 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white text-gray-700 appearance-none cursor-pointer min-w-[75px]"
            >
              <option value="">Ngày</option>
              {Array.from({ length: 31 }, (_, i) => (
                <option key={i + 1} value={String(i + 1).padStart(2, "0")}>
                  {i + 1}
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Select Tháng */}
          <div className="relative">
            <select
              value={dashboardMonth}
              onChange={(e) => onDashboardMonthChange(e.target.value)}
              className="pl-3 pr-7 py-2.5 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white text-gray-700 appearance-none cursor-pointer min-w-[90px]"
            >
              <option value="">Tháng</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={String(i + 1).padStart(2, "0")}>
                  Tháng {i + 1}
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Select Năm */}
          <div className="relative">
            <select
              value={dashboardYear}
              onChange={(e) => onDashboardYearChange(e.target.value)}
              className="pl-3 pr-7 py-2.5 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white text-gray-700 appearance-none cursor-pointer min-w-[85px]"
            >
              <option value="">Năm</option>
              {Array.from({ length: 151 }, (_, i) => {
                const year = new Date().getFullYear() + 50 - i;
                return (
                  <option key={year} value={String(year)}>
                    {year}
                  </option>
                );
              })}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          <button
            type="button"
            onClick={() => {
              if (dashboardDay || dashboardMonth || dashboardYear) {
                const parts: string[] = [];
                if (dashboardDay) parts.push(dashboardDay);
                if (dashboardMonth) parts.push(dashboardMonth);
                if (dashboardYear) parts.push(dashboardYear);
                // toast goes here — we'll leave it for the parent
              }
            }}
            className="px-5 py-2.5 bg-gray-900 hover:bg-black active:scale-[0.98] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center h-[38px]"
          >
            Lọc
          </button>
        </div>
      </div>

      {/* METRICS CARDS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full translate-x-12 -translate-y-12 transition-transform duration-500 group-hover:scale-125" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tổng lượt xem</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center transition-colors group-hover:bg-blue-500 group-hover:text-white">
              <Eye size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {stats.viewsVal}
            </span>
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-0.5">
              <TrendingUp size={12} />
              {stats.viewsChange}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-2 font-medium">Lượt xem trang thực tế trong chu kỳ</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full translate-x-12 -translate-y-12 transition-transform duration-500 group-hover:scale-125" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bài viết</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center transition-colors group-hover:bg-purple-500 group-hover:text-white">
              <FileText size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {stats.posts}
            </span>
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-0.5">
              <TrendingUp size={12} />
              {stats.postsChange}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-2 font-medium">Bài đăng và bản nháp hoạt động</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full translate-x-12 -translate-y-12 transition-transform duration-500 group-hover:scale-125" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Clicks QC</span>
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center transition-colors group-hover:bg-orange-500 group-hover:text-white">
              <MousePointerClick size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {stats.clicks}
            </span>
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-0.5">
              <TrendingUp size={12} />
              {stats.clicksChange}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-2 font-medium">Lượt click vào banner QC hiển thị</p>
        </div>
      </div>

      {/* CATEGORIES PROGRESS SECTION */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="border-b border-gray-100 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#E55956]" /> Phân bố danh mục hệ thống
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Thống kê mật độ & số lượng bài viết phân bổ theo danh mục</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-extrabold text-[#E55956] bg-red-50 px-2.5 py-1 rounded-lg border border-red-100/50">
              Tổng số: {categoryStats.reduce((acc, cur) => acc + cur.count, 0)} bài viết
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categoryStats.map((item) => {
            const style = getCategoryStyles(item.name);
            const IconComponent = style.icon;
            return (
              <div
                key={item.name}
                className="relative overflow-hidden p-5 rounded-2xl border border-gray-150/70 bg-gradient-to-b from-white to-slate-50/40 hover:from-white hover:to-slate-50/90 transition-all duration-300 hover:-translate-y-1 hover:shadow-md group flex flex-col justify-between"
              >
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br from-gray-100/10 to-gray-200/5 rounded-full group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
                <div className={`absolute top-0 left-0 w-[4px] h-full bg-gradient-to-b ${style.color} rounded-r-md opacity-80`} />

                <div className="flex items-center justify-between mb-4 pl-1">
                  <div className="flex items-center gap-3">
                    <div className={`relative w-10 h-10 rounded-xl ${style.bg} flex items-center justify-center font-semibold group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                      <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 blur-md bg-gradient-to-br ${style.color} transition-opacity duration-300`} />
                      <IconComponent className="w-5 h-5 relative z-10 transition-transform group-hover:rotate-[15deg] duration-300" />
                    </div>

                    <div>
                      <h4 className="text-xs font-black text-gray-800 tracking-tight uppercase group-hover:text-black transition-colors">{item.name}</h4>
                      <span className="text-[10px] text-gray-400 font-bold tracking-wide">Mục chuyên mục</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-base font-black text-gray-900 tracking-tight">{item.percentage}%</span>
                    <span className="text-[10px] text-gray-400 font-bold mt-[-2px]">{item.count} bài viết</span>
                  </div>
                </div>

                <div className="space-y-2 pl-1">
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden relative">
                    <div className="absolute inset-0 bg-gray-200/40 rounded-full" />
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${style.color} relative transition-all duration-1000 ease-out`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold pt-1">
                    <span className="group-hover:text-gray-500 transition-colors">Tỉ lệ phủ sóng</span>
                    <span className="text-gray-500 font-extrabold">{item.percentage}% hệ thống</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BOTTOM COLUMNS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Bài viết nổi bật */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="border-b border-gray-100 pb-4 mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-gray-900">Bài viết nổi bật</h3>
                <p className="text-xs text-gray-400 mt-0.5">Top 5 bài viết được xem nhiều nhất trong 7 ngày qua</p>
              </div>
              <span className="text-xs font-bold text-[#E55956] bg-red-50 px-2.5 py-1 rounded-lg">Xu hướng</span>
            </div>

            <div className="space-y-3">
              {topPosts.map((post, index) => {
                const badgeColors = [
                  "bg-gradient-to-br from-red-500 to-[#E55956] text-white shadow-sm",
                  "bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-sm",
                  "bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-sm",
                  "bg-slate-100 text-slate-600",
                  "bg-slate-100 text-slate-600"
                ];

                return (
                  <div
                    key={post.id ?? index}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-transparent group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <span className={`w-6.5 h-6.5 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${badgeColors[index] || "bg-gray-100 text-gray-600"}`}>
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-gray-800 truncate group-hover:text-[#E55956] transition-colors leading-snug">
                          {post.title}
                        </h4>
                        <span className="inline-block text-[10px] text-gray-400 font-semibold mt-1 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded">
                          {post.category}
                        </span>
                      </div>
                    </div>

                    <div className="text-right ml-4 flex-shrink-0 flex items-center gap-1.5">
                      <span className="text-xs font-mono font-bold text-gray-900">
                        {post.views.toLocaleString("vi-VN")}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold">views</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Hoạt động gần đây */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="border-b border-gray-100 pb-4 mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-gray-900">Hoạt động gần đây</h3>
                <p className="text-xs text-gray-400 mt-0.5">Cập nhật hoạt động mới nhất từ hệ thống</p>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="relative pl-6 border-l-2 border-dashed border-gray-100 space-y-5.5 py-2">
              {dashboardData?.recentActivities && dashboardData.recentActivities.length > 0 ? (
                dashboardData.recentActivities.map((act: any, idx: number) => {
                  const timeStr = (() => {
                    const diffMs = new Date().getTime() - new Date(act.createdAt).getTime();
                    const diffMins = Math.floor(diffMs / 60000);
                    const diffHours = Math.floor(diffMins / 60);
                    if (diffMins < 1) return "Vừa xong";
                    if (diffMins < 60) return `${diffMins} phút trước`;
                    if (diffHours < 24) return `${diffHours} giờ trước`;
                    return new Date(act.createdAt).toLocaleDateString("vi-VN");
                  })();

                  const typeLabel = act.type === 'article' ? 'Bài viết mới' : act.type === 'ad' ? 'Quảng cáo mới' : 'Danh mục mới';
                  const typeColor = act.type === 'article' ? '#E55956' : act.type === 'ad' ? 'orange' : 'purple';
                  const typeBg = act.type === 'article' ? 'bg-[#E55956]' : act.type === 'ad' ? 'bg-orange-500' : 'bg-purple-500';

                  return (
                    <div key={idx} className="relative group">
                      <div className={`absolute -left-[31px] top-0.5 w-[11px] h-[11px] rounded-full ${typeBg} border-2 border-white group-hover:scale-125 transition-transform`} />
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: typeColor }}>
                          {typeLabel}
                        </span>
                        <h4 className="text-xs font-bold text-gray-800 mt-0.5 truncate max-w-[280px]" title={act.title}>
                          {act.title}
                        </h4>
                        <span className="text-[10px] text-gray-400 font-bold block mt-1">
                          {timeStr} {act.status ? `• Trạng thái: ${act.status}` : ''}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-gray-450 italic py-4">Chưa có hoạt động nào vừa diễn ra</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
