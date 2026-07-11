"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

/** Build a windowed page list with ellipsis markers (null = gap). */
export function getPaginationItems(
  current: number,
  total: number,
  siblingCount = 1
): (number | "ellipsis")[] {
  if (total <= 1) return [1];
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set<number>();
  pages.add(1);
  pages.add(total);
  for (let i = current - siblingCount; i <= current + siblingCount; i++) {
    if (i >= 1 && i <= total) pages.add(i);
  }

  const sorted = Array.from(pages).sort((a, b) => a - b);
  const result: (number | "ellipsis")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push("ellipsis");
    result.push(p);
    prev = p;
  }
  return result;
}

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Active page button class (defaults to brand red) */
  activeClassName?: string;
}

export default function AdminPagination({
  currentPage,
  totalPages,
  onPageChange,
  activeClassName = "bg-[#E55956] text-white",
}: AdminPaginationProps) {
  const pages = getPaginationItems(currentPage, totalPages);

  return (
    <div className="inline-flex items-center bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden divide-x divide-gray-200">
      <button
        type="button"
        onClick={() => {
          if (currentPage > 1) onPageChange(currentPage - 1);
        }}
        disabled={currentPage === 1}
        className="px-3 py-2 hover:bg-gray-50 text-gray-500 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
        aria-label="Trang trước"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((item, idx) =>
        item === "ellipsis" ? (
          <span
            key={`e-${idx}`}
            className="px-3 py-2 text-xs font-bold text-gray-400 select-none"
          >
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            className={`px-4 py-2 text-xs font-bold transition-all ${
              currentPage === item
                ? activeClassName
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            {item}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => {
          if (currentPage < totalPages) onPageChange(currentPage + 1);
        }}
        disabled={currentPage === totalPages}
        className="px-3 py-2 hover:bg-gray-50 text-gray-500 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
        aria-label="Trang sau"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
