"use client";

import React from "react";
import {
  Search,
  Plus,
  SquarePen,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";
import { AdsTableSkeleton } from "./Skeletons";
import type { Ad } from "./AdminTypes";

interface AdsManagerProps {
  adsLoading: boolean;
  adsPage: number;
  adsTotalPages: number;
  paginatedAds: Ad[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onPageChange: (page: number) => void;
  onAdd: () => void;
  onEdit: (ad: Ad) => void;
  onDelete: (id: number) => void;
  formatDateForDisplay: (dateStr: string) => string;
}

export default function AdsManager({
  adsLoading,
  adsPage,
  adsTotalPages,
  paginatedAds,
  searchQuery,
  onSearchChange,
  onPageChange,
  onAdd,
  onEdit,
  onDelete,
  formatDateForDisplay,
}: AdsManagerProps) {
  return (
    <div className="space-y-6">
      {/* HEADER ACTION BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2.5 h-full bg-gradient-to-b from-orange-500 to-orange-600" />
        <div>
          <h2 className="text-xl font-black text-gray-900">📢 Quản lý quảng cáo</h2>
          <p className="text-sm text-gray-500 font-medium mt-0.5">Quản lý các chiến dịch quảng cáo</p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#E55956] hover:bg-[#cb4643] text-white text-sm font-bold rounded-xl transition-all shadow-md active:scale-[0.98]"
        >
          <Plus size={16} />
          <span>Thêm quảng cáo</span>
        </button>
      </div>

      {/* SEARCH */}
      <div className="flex items-center gap-3 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm quảng cáo..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="py-4 px-6 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">#</th>
                <th className="py-4 px-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tên quảng cáo</th>
                <th className="py-4 px-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Vị trí</th>
                <th className="py-4 px-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Lượt click</th>
                <th className="py-4 px-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Ngày bắt đầu</th>
                <th className="py-4 px-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Ngày kết thúc</th>
                <th className="py-4 px-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="py-4 px-6 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {adsLoading ? (
                <AdsTableSkeleton />
              ) : paginatedAds.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <p className="text-sm text-gray-400 font-medium">Chưa có quảng cáo nào</p>
                  </td>
                </tr>
              ) : (
                paginatedAds.map((ad, idx) => (
                  <motion.tr
                    key={ad.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="py-4 px-6 text-center text-sm font-bold text-gray-400">#{ad.id}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {ad.image && (
                          <img
                            src={ad.image}
                            alt={ad.name}
                            className="w-12 h-7 rounded object-cover border border-gray-100 flex-shrink-0"
                          />
                        )}
                        <div>
                          <p className="text-sm font-bold text-gray-800">{ad.name}</p>
                          {ad.link && (
                            <a href={ad.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 font-medium flex items-center gap-1 hover:underline">
                              <ExternalLink size={10} />
                              {ad.link}
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-xs font-semibold text-gray-500">{ad.position}</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-sm font-bold text-gray-700">{ad.clicks.toLocaleString("vi-VN")}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-xs font-medium text-gray-500">{formatDateForDisplay(ad.startDate)}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-xs font-medium text-gray-500">{formatDateForDisplay(ad.endDate)}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        ad.status === "Hoạt động" ? "bg-green-50 text-green-600" :
                        ad.status === "Chờ chạy" ? "bg-blue-50 text-blue-600" :
                        ad.status === "Đã kết thúc" ? "bg-gray-100 text-gray-500" :
                        "bg-red-50 text-red-600"
                      }`}>
                        {ad.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => onEdit(ad)}
                          className="p-2 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all"
                          title="Chỉnh sửa"
                        >
                          <SquarePen size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(ad.id)}
                          className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all"
                          title="Xóa"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {!adsLoading && adsTotalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/30">
            <p className="text-xs text-gray-500 font-medium">
              Trang {adsPage} / {adsTotalPages}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onPageChange(adsPage - 1)}
                disabled={adsPage <= 1}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(adsTotalPages, 5) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onPageChange(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      adsPage === pageNum
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
                onClick={() => onPageChange(adsPage + 1)}
                disabled={adsPage >= adsTotalPages}
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
