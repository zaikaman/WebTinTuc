"use client";

import React from "react";
import {
  Search,
  Upload,
  Trash2,
  Copy,
  Download,
  ChevronLeft,
  ChevronRight,
  Plus,
  Image as ImageIcon,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { MediaItem } from "./AdminTypes";

interface MediaManagerProps {
  mediaLoading: boolean;
  filteredMedia: MediaItem[];
  paginatedMedia: MediaItem[];
  mediaPage: number;
  mediaTotalPages: number;
  mediaSearchQuery: string;
  mediaTypeFilter: "all" | "image" | "video";
  mediaSort: "newest" | "oldest" | "az";
  activeFolder: string;
  folders: string[];
  isMediaUploading: boolean;
  previewItem: MediaItem | null;
  folderDialogOpen: boolean;
  newFolderName: string;
  deletingMediaKey: string | null;
  onSearchChange: (query: string) => void;
  onTypeFilterChange: (filter: "all" | "image" | "video") => void;
  onSortChange: (sort: "newest" | "oldest" | "az") => void;
  onFolderChange: (folder: string) => void;
  onPageChange: (page: number) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteMedia: (key: string) => void;
  onPreview: (item: MediaItem | null) => void;
  onFolderDialogOpen: (open: boolean) => void;
  onNewFolderNameChange: (name: string) => void;
  onCreateFolder: () => void;
  onCopyUrl: (url: string) => void;
}

export default function MediaManager({
  mediaLoading,
  filteredMedia,
  paginatedMedia,
  mediaPage,
  mediaTotalPages,
  mediaSearchQuery,
  mediaTypeFilter,
  mediaSort,
  activeFolder,
  folders,
  isMediaUploading,
  previewItem,
  folderDialogOpen,
  newFolderName,
  deletingMediaKey,
  onSearchChange,
  onTypeFilterChange,
  onSortChange,
  onFolderChange,
  onPageChange,
  onUpload,
  onDeleteMedia,
  onPreview,
  onFolderDialogOpen,
  onNewFolderNameChange,
  onCreateFolder,
  onCopyUrl,
}: MediaManagerProps) {
  return (
    <div className="space-y-6">
      {/* HEADER ACTION BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2.5 h-full bg-gradient-to-b from-green-500 to-green-600" />
        <div>
          <h2 className="text-xl font-black text-gray-900">🖼️ Quản lý Media</h2>
          <p className="text-sm text-gray-500 font-medium mt-0.5">Quản lý hình ảnh, video và tệp tin</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onFolderDialogOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-all"
          >
            <Plus size={16} />
            <span>Thư mục</span>
          </button>
          <label className="flex items-center gap-2 px-4 py-2.5 bg-[#E55956] hover:bg-[#cb4643] text-white text-sm font-bold rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer">
            <Upload size={16} />
            <span>{isMediaUploading ? "Đang tải..." : "Tải lên"}</span>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={onUpload}
              disabled={isMediaUploading}
            />
          </label>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={mediaSearchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm kiếm media..."
              className="w-48 pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm"
            />
          </div>
          <div className="flex gap-1 p-1 bg-gray-50 rounded-xl border border-gray-100">
            {(["all", "image", "video"] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => onTypeFilterChange(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  mediaTypeFilter === filter
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {filter === "all" ? "Tất cả" : filter === "image" ? "Hình ảnh" : "Video"}
              </button>
            ))}
          </div>
          <select
            value={mediaSort}
            onChange={(e) => onSortChange(e.target.value as "newest" | "oldest" | "az")}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm"
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="az">A-Z</option>
          </select>
        </div>
      </div>

      {/* FOLDER TABS */}
      {folders.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => onFolderChange("")}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              !activeFolder
                ? "bg-[#E55956] text-white shadow-sm"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            Tất cả
          </button>
          {folders.map((folder) => (
            <button
              key={folder}
              type="button"
              onClick={() => onFolderChange(folder)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeFolder === folder
                  ? "bg-[#E55956] text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {folder}
            </button>
          ))}
        </div>
      )}

      {/* MEDIA GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {mediaLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-xl aspect-square" />
          ))
        ) : paginatedMedia.length === 0 ? (
          <div className="col-span-full py-12 text-center">
            <ImageIcon size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-400 font-medium">Chưa có media nào</p>
          </div>
        ) : (
          paginatedMedia.map((item, idx) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.03 }}
              className="group relative bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all"
            >
              <div
                className="aspect-square bg-gray-50 cursor-pointer"
                onClick={() => onPreview(item)}
              >
                {item.type === "image" ? (
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900">
                    <Video size={32} className="text-white/50" />
                  </div>
                )}
              </div>

              {/* Overlay actions */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => onCopyUrl(item.url)}
                  className="p-2 bg-white/90 hover:bg-white rounded-lg text-gray-700 transition-all"
                  title="Copy URL"
                >
                  <Copy size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteMedia(item.key)}
                  disabled={deletingMediaKey === item.key}
                  className="p-2 bg-red-500/90 hover:bg-red-600 rounded-lg text-white transition-all disabled:opacity-50"
                  title="Xóa"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* File info */}
              <div className="p-2.5">
                <p className="text-xs font-semibold text-gray-700 truncate">{item.title}</p>
                <p className="text-[10px] text-gray-400 font-medium mt-0.5">{item.size}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* PAGINATION */}
      {!mediaLoading && mediaTotalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500 font-medium">
            Trang {mediaPage} / {mediaTotalPages} (Tổng: {filteredMedia.length} tệp)
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onPageChange(mediaPage - 1)}
              disabled={mediaPage <= 1}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(mediaTotalPages, 5) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onPageChange(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    mediaPage === pageNum
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
              onClick={() => onPageChange(mediaPage + 1)}
              disabled={mediaPage >= mediaTotalPages}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* MEDIA PREVIEW DIALOG */}
      <Dialog open={!!previewItem} onOpenChange={(open) => !open && onPreview(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{previewItem?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {previewItem?.type === "image" ? (
              <img
                src={previewItem.url}
                alt={previewItem.title}
                className="w-full max-h-[400px] object-contain rounded-xl border border-gray-200"
              />
            ) : (
              <video
                controls
                src={previewItem?.url}
                className="w-full max-h-[400px] rounded-xl border border-gray-200"
              />
            )}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-400 font-medium">Kích thước</span>
                <p className="font-bold text-gray-700 mt-0.5">{previewItem?.size}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-400 font-medium">Ngày tạo</span>
                <p className="font-bold text-gray-700 mt-0.5">{previewItem?.createdAt}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-400 font-medium">Loại</span>
                <p className="font-bold text-gray-700 mt-0.5 uppercase">{previewItem?.type}</p>
              </div>
              {previewItem?.folder && (
                <div className="p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-400 font-medium">Thư mục</span>
                  <p className="font-bold text-gray-700 mt-0.5">{previewItem.folder}</p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl">
              <input
                type="text"
                readOnly
                value={previewItem?.url || ""}
                className="flex-1 text-xs text-gray-600 bg-transparent outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => previewItem && onCopyUrl(previewItem.url)}
                className="p-2 bg-white hover:bg-gray-100 rounded-lg text-gray-600 transition-all shadow-sm"
                title="Copy URL"
              >
                <Copy size={14} />
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* CREATE FOLDER DIALOG */}
      <Dialog open={folderDialogOpen} onOpenChange={onFolderDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Tạo thư mục mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => onNewFolderNameChange(e.target.value)}
              placeholder="Nhập tên thư mục..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white"
              onKeyDown={(e) => e.key === "Enter" && onCreateFolder()}
            />
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={() => onFolderDialogOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={onCreateFolder}
              className="px-4 py-2 text-sm font-bold bg-[#E55956] hover:bg-[#cb4643] text-white rounded-xl transition-all shadow-sm"
            >
              Tạo
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
