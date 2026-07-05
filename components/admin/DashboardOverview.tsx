"use client";

import React from "react";
import {
  TrendingUp,
  Eye,
  MousePointerClick,
  FileText,
  Download,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { DashboardSkeleton } from "./Skeletons";
import type { DashboardStats, CategoryStat, TopPost } from "./AdminTypes";

interface DashboardOverviewProps {
  dashboardLoading: boolean;
  dashboardStats: DashboardStats;
  categoryStats: CategoryStat[];
  topPosts: TopPost[];
  timeFilter: "today" | "week" | "month" | "year";
  onTimeFilterChange: (filter: "today" | "week" | "month" | "year") => void;
  dashboardDay: string;
  onDashboardDayChange: (day: string) => void;
  dashboardMonth: string;
  onDashboardMonthChange: (month: string) => void;
  dashboardYear: string;
  onDashboardYearChange: (year: string) => void;
  getCategoryStyles: (name: string) => { color: string; bg: string; icon: React.ElementType };
  handleExportReport: () => void;
}

export default function DashboardOverview({
  dashboardLoading,
  dashboardStats,
  categoryStats,
  topPosts,
  timeFilter,
  onTimeFilterChange,
  dashboardDay,
  onDashboardDayChange,
  dashboardMonth,
  onDashboardMonthChange,
  dashboardYear,
  onDashboardYearChange,
  getCategoryStyles,
  handleExportReport,
}: DashboardOverviewProps) {
  if (dashboardLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="dashboard"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25 }}
        className="space-y-6"
      >
        {/* HEADER ACTION BANNER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2.5 h-full bg-gradient-to-b from-[#E55956] to-[#cb4643]" />
          <div>
            <h2 className="text-xl font-black text-gray-900">📊 Tổng quan Dashboard</h2>
            <p className="text-sm text-gray-500 font-medium mt-0.5">Theo dõi hiệu suất website của bạn</p>
          </div>
          <button
            type="button"
            onClick={handleExportReport}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#E55956] hover:bg-[#cb4643] text-white text-sm font-bold rounded-xl transition-all shadow-md active:scale-[0.98]"
          >
            <Download size={16} />
            <span>Xuất thống kê</span>
          </button>
        </div>

        {/* FILTER BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex gap-2 p-1 bg-gray-50 rounded-xl border border-gray-100 w-fit">
            {(["today", "week", "month", "year"] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => onTimeFilterChange(filter)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  timeFilter === filter
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {filter === "today" ? "Hôm nay" : filter === "week" ? "Tuần này" : filter === "month" ? "Tháng này" : "Năm nay"}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {timeFilter === "today" && (
              <input
                type="date"
                value={dashboardDay}
                onChange={(e) => onDashboardDayChange(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white"
              />
            )}
            {timeFilter === "month" && (
              <>
                <input
                  type="month"
                  value={dashboardMonth}
                  onChange={(e) => onDashboardMonthChange(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white"
                />
                <input
                  type="number"
                  placeholder="Năm"
                  value={dashboardYear}
                  onChange={(e) => onDashboardYearChange(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white w-20"
                />
              </>
            )}
          </div>
        </div>

        {/* METRICS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Eye,
              label: "Tổng lượt xem",
              value: dashboardStats.views,
              change: dashboardStats.viewsChange,
              isUp: dashboardStats.isViewsUp,
              iconBg: "bg-blue-50 text-blue-500",
            },
            {
              icon: FileText,
              label: "Bài viết",
              value: dashboardStats.posts.toString(),
              change: dashboardStats.postsChange,
              isUp: dashboardStats.isPostsUp,
              iconBg: "bg-green-50 text-green-500",
            },
            {
              icon: MousePointerClick,
              label: "Clicks QC",
              value: dashboardStats.clicks,
              change: dashboardStats.clicksChange,
              isUp: dashboardStats.isClicksUp,
              iconBg: "bg-purple-50 text-purple-500",
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{item.label}</p>
                <div className={`w-10 h-10 rounded-xl ${item.iconBg} flex items-center justify-center`}>
                  <item.icon size={20} />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-black text-gray-900">{item.value}</span>
                <span className={`text-sm font-bold ${item.isUp ? "text-green-600" : "text-red-500"}`}>
                  {item.change}
                </span>
              </div>
              <p className="text-xs text-gray-400 font-medium mt-1">So với kỳ trước</p>
            </motion.div>
          ))}
        </div>

        {/* CATEGORIES PROGRESS */}
        {categoryStats.length > 0 && (
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-gray-900">📂 Phân bố danh mục</h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Số lượng bài viết theo danh mục</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryStats.map((cat, idx) => {
                const styles = getCategoryStyles(cat.name);
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 rounded-xl border border-gray-100 bg-gradient-to-br from-white to-slate-50/50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg ${styles.bg} flex items-center justify-center`}>
                          <styles.icon size={16} />
                        </div>
                        <span className="text-sm font-bold text-gray-800">{cat.name}</span>
                      </div>
                      <span className="text-xs font-bold text-gray-400">{cat.count} bài</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${cat.percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut", delay: idx * 0.1 }}
                        className={`h-full rounded-full bg-gradient-to-r ${styles.color}`}
                      />
                    </div>
                    <p className="text-xs text-gray-400 font-semibold mt-2 text-right">{cat.percentage}%</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* BOTTOM COLUMNS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Top Articles */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">🔥 Bài viết nổi bật</h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Top bài viết có lượt xem cao nhất</p>
              </div>
              <TrendingUp size={18} className="text-[#E55956]" />
            </div>
            <div className="space-y-1 mt-3">
              {topPosts.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">Chưa có dữ liệu</p>
              ) : (
                topPosts.slice(0, 5).map((post, idx) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#E55956] to-[#cb4643] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm">
                        {idx + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-gray-800 truncate">{post.title}</p>
                        <p className="text-xs text-gray-400 font-medium">{post.category}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gray-500 ml-3 whitespace-nowrap">
                      {post.views.toLocaleString("vi-VN")} lượt
                    </span>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">⚡ Hoạt động gần đây</h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Các cập nhật mới nhất</p>
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            </div>
            <div className="pl-6 border-l-2 border-gray-100 space-y-4 py-3">
              <div className="relative">
                <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-[#E55956] border-2 border-white"></div>
                <p className="text-sm font-semibold text-gray-800">Trang quản trị đã sẵn sàng</p>
                <p className="text-xs text-gray-400 font-medium mt-0.5">Dashboard hoạt động</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
