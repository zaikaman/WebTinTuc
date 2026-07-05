"use client";

import React from "react";
import {
  TrendingUp,
  Eye,
  MousePointerClick,
  FileText,
  Download,
  Cpu,
  Globe,
  Sparkles,
  BookOpen,
  Coins,
  Trophy,
  Heart,
  Layers,
  Zap
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
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
            {/* Header */}
            <div className="border-b border-gray-100 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                  <span className="text-lg">📊</span> Phân bố danh mục hệ thống
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Thống kê mật độ & số lượng bài viết phân bổ theo danh mục</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-extrabold text-[#E55956] bg-red-50 px-2.5 py-1 rounded-lg border border-red-100/50 animate-pulse">
                  Tổng số: {categoryStats.reduce((acc: number, cur: any) => acc + cur.count, 0)} bài viết
                </span>
              </div>
            </div>

            {/* SEGMENTED OVERVIEW BAR */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8 bg-slate-50/50 p-4 rounded-xl border border-slate-100/80"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Tỉ lệ phân bổ trực quan</span>
                <span className="text-[10px] font-bold text-gray-400">Rê chuột lên thanh phân bổ để xem nhanh</span>
              </div>
              <div className="w-full h-4 bg-gray-100 rounded-full flex overflow-hidden shadow-inner p-[1px] relative">
                {categoryStats.map((item, idx) => {
                  const style = getCategoryStyles(item.name);
                  return (
                    <div
                      key={item.name}
                      style={{ width: `${item.percentage}%` }}
                      className={`h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full bg-gradient-to-r ${style.color} hover:opacity-95 relative group/segment cursor-pointer`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 hidden group-hover/segment:block z-30 bg-slate-900 text-white text-[10px] px-2.5 py-1.5 rounded-lg shadow-xl font-bold whitespace-nowrap border border-white/10">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${style.color}`} />
                          <span>{item.name}: {item.percentage}% ({item.count} bài)</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3.5 pt-3 border-t border-slate-100/50">
                {categoryStats.map((item) => {
                  const style = getCategoryStyles(item.name);
                  return (
                    <div key={item.name} className="flex items-center gap-1.5 text-[10px] font-extrabold text-gray-500">
                      <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${style.color} shadow-xs`} />
                      <span>{item.name} ({item.percentage}%)</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* DETAIL CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {categoryStats.map((cat, idx) => {
                const styles = getCategoryStyles(cat.name);
                const IconComponent = styles.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="relative overflow-hidden p-5 rounded-2xl border border-gray-150/70 bg-gradient-to-b from-white to-slate-50/40 hover:from-white hover:to-slate-50/90 transition-all duration-300 hover:-translate-y-1 hover:shadow-md group flex flex-col justify-between"
                  >
                    <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br from-gray-100/10 to-gray-200/5 rounded-full group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
                    <div className={`absolute top-0 left-0 w-[4px] h-full bg-gradient-to-b ${styles.color} rounded-r-md opacity-80`} />

                    <div className="flex items-center justify-between mb-4 pl-1">
                      <div className="flex items-center gap-3">
                        <div className={`relative w-10 h-10 rounded-xl ${styles.bg} flex items-center justify-center font-semibold group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                          <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 blur-md bg-gradient-to-br ${styles.color} transition-opacity duration-300`} />
                          <IconComponent className="w-5 h-5 relative z-10 transition-transform group-hover:rotate-[15deg] duration-300" />
                        </div>
                        
                        <div>
                          <h4 className="text-xs font-black text-gray-800 tracking-tight uppercase group-hover:text-black transition-colors">{cat.name}</h4>
                          <span className="text-[10px] text-gray-400 font-bold tracking-wide">Mục chuyên mục</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <span className="text-base font-black text-gray-900 tracking-tight">{cat.percentage}%</span>
                        <span className="text-[10px] text-gray-400 font-bold mt-[-2px]">{cat.count} bài viết</span>
                      </div>
                    </div>

                    <div className="space-y-2 pl-1">
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden relative">
                        <div className="absolute inset-0 bg-gray-200/40 rounded-full" />
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${cat.percentage}%` }}
                          transition={{ duration: 1, ease: "easeOut", delay: idx * 0.1 }}
                          className={`h-full rounded-full bg-gradient-to-r ${styles.color} relative`}
                        />
                      </div>
                      
                      <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold pt-1">
                        <span className="group-hover:text-gray-500 transition-colors">Tỉ lệ phủ sóng</span>
                        <span className="text-gray-500 font-extrabold">{cat.percentage}% hệ thống</span>
                      </div>
                    </div>
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
