"use client";

import { Search, Plus, ChevronDown, ChevronRight, Upload, Loader2, Copy, Eye, Trash2, Video } from "lucide-react";
import AdminPagination from "./AdminPagination";
import type { MediaItem } from "./AdminTypes";

interface MediaTabProps {
  loading: boolean;
  isUploading: boolean;
  mediaTypeFilter: string;
  onMediaTypeFilterChange: (filter: string) => void;
  mediaSearchQuery: string;
  onMediaSearchQueryChange: (query: string) => void;
  folders: string[];
  activeFolder: string;
  onActiveFolderChange: (folder: string) => void;
  onFolderDelete: (folderName: string) => void;
  onOpenFolderDialog: () => void;
  mediaSort: string;
  onMediaSortChange: (sort: string) => void;
  filteredMedia: MediaItem[];
  paginatedMedia: MediaItem[];
  mediaPage: number;
  mediaTotalPages: number;
  onMediaPageChange: (page: number) => void;
  deletingMediaKey: string | null;
  onMediaDelete: (key: string) => void;
  onMediaCopyUrl: (url: string) => void;
  onMediaPreview: (url: string) => void;
  onUploadClick: () => void;
  selectedKeys?: Set<string>;
  onSelectedKeysChange?: (keys: Set<string>) => void;
  onBulkDelete?: () => void;
}

export default function MediaTab({
  loading,
  isUploading,
  mediaTypeFilter,
  onMediaTypeFilterChange,
  mediaSearchQuery,
  onMediaSearchQueryChange,
  folders,
  activeFolder,
  onActiveFolderChange,
  onFolderDelete,
  onOpenFolderDialog,
  mediaSort,
  onMediaSortChange,
  filteredMedia,
  paginatedMedia,
  mediaPage,
  mediaTotalPages,
  onMediaPageChange,
  deletingMediaKey,
  onMediaDelete,
  onMediaCopyUrl,
  onMediaPreview,
  onUploadClick,
  selectedKeys = new Set(),
  onSelectedKeysChange,
  onBulkDelete,
}: MediaTabProps) {
  const pageKeys = paginatedMedia.map((m) => m.key);
  const allPageSelected =
    pageKeys.length > 0 && pageKeys.every((k) => selectedKeys.has(k));

  const toggleSelectAll = () => {
    if (!onSelectedKeysChange) return;
    const next = new Set(selectedKeys);
    if (allPageSelected) {
      pageKeys.forEach((k) => next.delete(k));
    } else {
      pageKeys.forEach((k) => next.add(k));
    }
    onSelectedKeysChange(next);
  };

  const toggleOne = (key: string) => {
    if (!onSelectedKeysChange) return;
    const next = new Set(selectedKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onSelectedKeysChange(next);
  };

  const folderLabel = (path: string) => {
    if (!path.includes("/")) return path;
    return path.split("/").pop() || path;
  };

  const breadcrumbParts = activeFolder
    ? activeFolder.split("/").filter(Boolean)
    : [];

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header Panel */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Thư viện Media</h2>
          <p className="text-xs text-gray-500 font-semibold mt-1">Ảnh & video lưu trữ trên Cloudflare R2</p>
        </div>

        <button
          type="button"
          onClick={onUploadClick}
          disabled={isUploading}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#E55956] hover:bg-[#cb4643] text-white text-xs font-bold rounded-xl shadow-sm transition-all self-start sm:self-center disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Upload size={14} />
          )}
          <span>{isUploading ? "Đang tải lên..." : "Thêm media"}</span>
        </button>
      </div>

      {/* Filter & Search Bar Panel */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Lọc</span>
          <div className="flex gap-2">
            {[
              { id: "all", label: "Tất cả" },
              { id: "image", label: "Ảnh" },
              { id: "video", label: "Video" }
            ].map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => onMediaTypeFilterChange(type.id)}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${mediaTypeFilter === type.id
                  ? "bg-[#E55956] text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5 w-full md:w-[350px]">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tìm kiếm thông tin</span>
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold" />
            <input
              type="text"
              value={mediaSearchQuery}
              onChange={(e) => onMediaSearchQueryChange(e.target.value)}
              placeholder="Tìm kiếm"
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-full text-xs outline-none focus:border-[#E55956] focus:ring-1 focus:ring-[#E55956]/15 transition-all bg-white"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Cây thư mục */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-150 bg-gray-50/50">
            <h3 className="text-sm font-bold text-gray-800">Cây thư mục</h3>
            <button
              type="button"
              onClick={onOpenFolderDialog}
              className="p-1 border border-gray-300 hover:border-gray-400 rounded transition-colors hover:bg-gray-50 flex items-center justify-center"
              title="Tạo thư mục"
            >
              <Plus size={12} className="text-gray-700 font-bold" />
            </button>
          </div>

          <div className="p-4 space-y-2">
            <div
              onClick={() => onActiveFolderChange("")}
              className={`flex items-center gap-1.5 cursor-pointer font-bold text-xs transition-all ${!activeFolder ? "text-[#E55956]" : "text-gray-800 hover:text-gray-900"
                }`}
            >
              <ChevronDown size={14} className={!activeFolder ? "text-[#E55956]" : "text-gray-500"} />
              <span>Root</span>
            </div>

            <div className="pl-4 mt-1.5 space-y-1 border-l border-gray-100 ml-1.5">
              {folders.map((folderPath) => {
                const isActive = activeFolder === folderPath;
                const depth = folderPath.split("/").length - 1;
                return (
                  <div
                    key={folderPath}
                    className={`group/folder flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${isActive
                      ? "bg-[#ffe4e4] text-[#E55956]"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    style={{ marginLeft: depth > 0 ? Math.min(depth, 3) * 8 : 0 }}
                  >
                    <div
                      onClick={() => onActiveFolderChange(folderPath)}
                      className="flex items-center gap-1.5 flex-1 min-w-0"
                      title={folderPath}
                    >
                      <ChevronRight size={12} className={isActive ? "text-[#E55956]" : "text-gray-400"} />
                      <span className="truncate">{folderLabel(folderPath)}</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onFolderDelete(folderPath);
                      }}
                      className="opacity-0 group-hover/folder:opacity-100 p-0.5 hover:text-red-650 transition-opacity flex items-center justify-center"
                      title="Ẩn thư mục khỏi danh sách (không xóa trên R2)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="font-bold text-gray-500 hover:text-red-650">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-9 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-4 min-h-[500px]">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 flex-wrap">
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              <span className="cursor-pointer hover:text-[#E55956]" onClick={() => onActiveFolderChange("")}>Root</span>
              {breadcrumbParts.map((part, i) => {
                const path = breadcrumbParts.slice(0, i + 1).join("/");
                return (
                  <span key={path} className="flex items-center gap-1.5">
                    <ChevronRight size={12} className="text-gray-450" />
                    <span
                      className={`cursor-pointer hover:text-[#E55956] ${i === breadcrumbParts.length - 1 ? "text-gray-900" : "text-gray-600"}`}
                      onClick={() => onActiveFolderChange(path)}
                    >
                      {part}
                    </span>
                  </span>
                );
              })}
            </div>

            <div className="relative">
              <select
                value={mediaSort}
                onChange={(e) => onMediaSortChange(e.target.value)}
                className="pl-3 pr-7 py-1 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 appearance-none bg-white focus:outline-none min-w-[90px] cursor-pointer"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="az">Tên A-Z</option>
              </select>
              <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Selection row */}
          <div className="flex items-center gap-3 text-xs font-bold text-gray-800 py-1 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allPageSelected}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-gray-300 text-[#E55956] focus:ring-[#E55956]/20 cursor-pointer"
              />
              <span>Chọn tất cả</span>
            </label>
            <span className="text-gray-500 font-medium">{filteredMedia.length} file</span>
            {selectedKeys.size > 0 && (
              <>
                <span className="text-[#E55956] font-bold">{selectedKeys.size} đã chọn</span>
                <button
                  type="button"
                  onClick={onBulkDelete}
                  className="px-3 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 font-bold transition-colors"
                >
                  Xóa đã chọn
                </button>
              </>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4.5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="border border-gray-250 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col justify-between animate-pulse">
                  <div className="aspect-[4/3] w-full bg-gray-150" />
                  <div className="p-3.5 space-y-2">
                    <div className="h-3.5 bg-gray-200 rounded w-3/4" />
                    <div className="flex justify-between items-center pt-2">
                      <div className="h-2.5 bg-gray-200 rounded w-1/4" />
                      <div className="h-2.5 bg-gray-200 rounded w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : paginatedMedia.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4.5">
                {paginatedMedia.map((item) => {
                  const formattedDate = (() => {
                    if (item.createdAt.includes("/")) return item.createdAt;
                    const parts = item.createdAt.split("-");
                    if (parts.length === 3) {
                      return `${parts[2]}/${parts[1]}/${parts[0]}`;
                    }
                    return item.createdAt;
                  })();
                  const isSelected = selectedKeys.has(item.key);

                  return (
                    <div
                      key={item.key || item.id}
                      className={`group relative border rounded-xl overflow-hidden bg-white shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-md animate-fade-in ${
                        isSelected ? "border-[#E55956] ring-2 ring-[#E55956]/20" : "border-gray-250 hover:border-gray-350"
                      }`}
                    >
                      <div className="absolute top-2 left-2 z-30">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleOne(item.key)}
                          className="w-4 h-4 rounded border-gray-300 text-[#E55956] focus:ring-[#E55956]/20 cursor-pointer bg-white shadow"
                        />
                      </div>

                      <div className="relative aspect-[4/3] w-full bg-gray-100 overflow-hidden flex items-center justify-center border-b border-gray-150">
                        {item.type === "video" ? (
                          <div className="w-full h-full relative flex items-center justify-center bg-slate-950">
                            {item.url.startsWith("http") ? (
                              <div className="w-full h-full flex items-center justify-center text-white/50">
                                <Video className="w-8 h-8" />
                              </div>
                            ) : (
                              <img
                                src={item.url}
                                alt={item.title}
                                className="w-full h-full object-cover opacity-80"
                              />
                            )}
                            <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                              <div className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center text-gray-900 shadow-md group-hover:scale-110 transition-transform">
                                <svg className="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            </div>
                            <span className="absolute bottom-2 right-2 text-[9px] bg-black/60 px-1.5 py-0.5 rounded text-white font-mono font-bold">
                              {item.duration || "00:00"}
                            </span>
                          </div>
                        ) : (
                          <img
                            src={item.url}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-102 transition-all duration-500"
                          />
                        )}

                        <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 z-20">
                          <button
                            type="button"
                            onClick={() => onMediaCopyUrl(item.url)}
                            className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 text-gray-800 flex items-center justify-center shadow transition-all active:scale-95"
                            title="Sao chép đường dẫn"
                          >
                            <Copy size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onMediaPreview(item.url)}
                            className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 text-gray-800 flex items-center justify-center shadow transition-all active:scale-95"
                            title="Xem trước"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onMediaDelete(item.key)}
                            disabled={deletingMediaKey === item.key}
                            className="w-8 h-8 rounded-full bg-white hover:bg-red-50 text-red-650 flex items-center justify-center shadow transition-all active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed"
                            title="Xóa media"
                          >
                            {deletingMediaKey === item.key ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Trash2 size={13} />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="p-3 bg-gray-50 flex flex-col gap-1 border-t border-gray-150">
                        <h5 className="text-[11px] font-bold text-gray-800 truncate leading-snug" title={item.title}>
                          {item.title}
                        </h5>
                        <div className="flex items-center justify-between text-[9px] text-gray-400 font-bold">
                          <span>{item.size}</span>
                          <span>{formattedDate}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-center mt-6">
                <AdminPagination
                  currentPage={mediaPage}
                  totalPages={mediaTotalPages}
                  onPageChange={onMediaPageChange}
                />
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-gray-400 font-bold flex-1 flex items-center justify-center">
              Không tìm thấy file media nào tương ứng.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
