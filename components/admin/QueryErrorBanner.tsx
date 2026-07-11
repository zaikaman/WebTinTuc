"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

interface QueryErrorBannerProps {
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export default function QueryErrorBanner({
  message = "Không thể tải dữ liệu. Vui lòng thử lại.",
  onRetry,
  isRetrying = false,
}: QueryErrorBannerProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-red-50 border border-red-200 text-red-800 rounded-2xl px-5 py-4 shadow-sm">
      <div className="flex items-start gap-3 min-w-0">
        <AlertCircle size={18} className="flex-shrink-0 mt-0.5 text-red-600" />
        <p className="text-sm font-semibold leading-snug">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-red-200 hover:bg-red-100 text-red-800 text-xs font-bold rounded-xl transition-all disabled:opacity-60 self-start sm:self-center"
        >
          <RefreshCw size={14} className={isRetrying ? "animate-spin" : ""} />
          <span>{isRetrying ? "Đang tải..." : "Thử lại"}</span>
        </button>
      )}
    </div>
  );
}
