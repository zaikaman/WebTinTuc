"use client";

import React from "react";
import {
  Search,
  Plus,
  SquarePen,
  Trash2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { motion } from "framer-motion";
import { PostsTableSkeleton } from "./Skeletons";
import type { Post } from "./AdminTypes";

interface PostsManagerProps {
  posts: Post[];
  postsLoading: boolean;
  postsPage: number;
  postsTotalPages: number;
  searchQuery: string;
  postCategoryFilter: string;
  postStartDate: string;
  postEndDate: string;
  hideDeletedPosts: boolean;
  paginatedPosts: Post[];
  categoryOptions: string[];
  formatDateForDisplay: (dateStr: string) => string;
  onSearchChange: (query: string) => void;
  onCategoryFilterChange: (cat: string) => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onHideDeletedChange: (hide: boolean) => void;
  onPageChange: (page: number) => void;
  onAdd: () => void;
  onEdit: (post: Post) => void;
  onDelete: (id: number) => void;
  onRestore: (id: number) => void;
  restoringPostId: number | null;
}

export default function PostsManager({
  posts,
  postsLoading,
  postsPage,
  postsTotalPages,
  searchQuery,
  postCategoryFilter,
  postStartDate,
  postEndDate,
  hideDeletedPosts,
  paginatedPosts,
  categoryOptions,
  formatDateForDisplay,
  onSearchChange,
  onCategoryFilterChange,
  onStartDateChange,
  onEndDateChange,
  onHideDeletedChange,
  onPageChange,
  onAdd,
  onEdit,
  onDelete,
  onRestore,
  restoringPostId,
}: PostsManagerProps) {
  return (
    <div className="space-y-6">
      {/* HEADER ACTION BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2.5 h-full bg-gradient-to-b from-blue-500 to-blue-600" />
        <div>
          <h2 className="text-xl font-black text-gray-900">📝 Quản lý bài viết</h2>
          <p className="text-sm text-gray-500 font-medium mt-0.5">Tạo, chỉnh sửa và quản lý tất cả bài viết</p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#E55956] hover:bg-[#cb4643] text-white text-sm font-bold rounded-xl transition-all shadow-md active:scale-[0.98]"
        >
          <Plus size={16} />
          <span>Thêm bài viết</span>
        </button>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm kiếm bài viết..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm"
            />
          </div>
          <select
            value={postCategoryFilter}
            onChange={(e) => onCategoryFilterChange(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm"
          >
            <option value="all">Tất cả danh mục</option>
            {categoryOptions.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            type="date"
            value={postStartDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm"
            placeholder="Từ ngày"
          />
          <input
            type="date"
            value={postEndDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm"
            placeholder="Đến ngày"
          />
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hideDeletedPosts}
              onChange={(e) => onHideDeletedChange(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[#E55956] focus:ring-[#E55956]"
            />
            Ẩn bài viết đã xóa
          </label>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="py-4 px-6 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">#</th>
                <th className="py-4 px-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tiêu đề</th>
                <th className="py-4 px-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Chuyên mục</th>
                <th className="py-4 px-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Lượt xem</th>
                <th className="py-4 px-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="py-4 px-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                <th className="py-4 px-6 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {postsLoading ? (
                <PostsTableSkeleton />
              ) : paginatedPosts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Eye size={32} className="text-gray-300" />
                      <p className="text-sm text-gray-400 font-medium">Chưa có bài viết nào</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedPosts.map((post, idx) => (
                  <motion.tr
                    key={post.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    className={`hover:bg-gray-50/50 transition-colors group ${post.isDeleted ? 'opacity-50' : ''}`}
                  >
                    <td className="py-4 px-6 text-center text-sm font-bold text-gray-400">#{post.id}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {post.coverImage && (
                          <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-10 h-10 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                          />
                        )}
                        <div>
                          <p className="text-sm font-bold text-gray-800 line-clamp-1">{post.title}</p>
                          {post.isDeleted && (
                            <span className="text-xs text-red-500 font-semibold">Đã xóa</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-xs font-semibold text-gray-500">{post.category}</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-sm font-bold text-gray-700">{post.views.toLocaleString("vi-VN")}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        post.status === "Đã đăng" ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
                      }`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-xs font-medium text-gray-500">{formatDateForDisplay(post.createdAt)}</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2.5">
                        {post.isDeleted ? (
                          <button
                            type="button"
                            onClick={() => onRestore(post.id)}
                            disabled={restoringPostId === post.id}
                            className="p-2 rounded-lg text-gray-400 hover:bg-green-50 hover:text-green-600 transition-all disabled:opacity-50"
                            title="Khôi phục"
                          >
                            <RotateCcw size={15} />
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => onEdit(post)}
                              className="p-2 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all"
                              title="Chỉnh sửa"
                            >
                              <SquarePen size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDelete(post.id)}
                              className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all"
                              title="Xóa"
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {!postsLoading && postsTotalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/30">
            <p className="text-xs text-gray-500 font-medium">
              Trang {postsPage} / {postsTotalPages} (Tổng: {posts.length} bài viết)
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onPageChange(postsPage - 1)}
                disabled={postsPage <= 1}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(postsTotalPages, 5) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onPageChange(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      postsPage === pageNum
                        ? "bg-[#E55956] text-white shadow-sm"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => onPageChange(postsPage + 1)}
                disabled={postsPage >= postsTotalPages}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
