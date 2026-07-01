"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Home, RotateCw } from "lucide-react";
import { IllustrationOffline } from "./IllustrationOffline";

interface OfflinePageContentProps {
  onCheckConnection?: () => void;
}

export function OfflinePageContent({ onCheckConnection }: OfflinePageContentProps) {
  const [isChecking, setIsChecking] = useState(false);

  const handleRetry = () => {
    setIsChecking(true);
    
    // Simulate a brief check
    setTimeout(() => {
      setIsChecking(false);
      
      if (typeof window !== "undefined") {
        if (navigator.onLine) {
          // If online, either call the callback to clear the state or reload
          if (onCheckConnection) {
            onCheckConnection();
          } else {
            window.location.reload();
          }
        } else {
          // Still offline, we can show a small console notice or visual indicator
          console.log("Check connection: Still offline.");
        }
      }
    }, 800);
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 md:py-16 px-4 text-center select-none overflow-hidden relative min-h-[500px]">
      {/* Offline Illustration with concentric circles background */}
      <IllustrationOffline />

      {/* Content */}
      <div className="max-w-[580px] mt-6 z-10">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 tracking-tight">
          Mất kết nối Internet
        </h1>
        <p className="text-xs md:text-[13px] text-gray-600 leading-relaxed mb-8">
          Không thể kết nối với máy chủ. Vui lòng kiểm tra lại kết nối internet của bạn để tiếp tục cập nhật tin tức.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-[360px] mx-auto">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full sm:w-auto bg-[#e24a48] hover:bg-[#d43f3d] text-white font-bold text-xs md:text-[13px] px-6 py-2.5 rounded-lg shadow-sm hover:shadow transition-all duration-200 active:scale-[0.98]"
          >
            <Home className="w-4 h-4" />
            <span>Về trang chủ</span>
          </Link>
          <button
            onClick={handleRetry}
            disabled={isChecking}
            className="flex items-center justify-center gap-2 w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-900 border border-gray-900 font-bold text-xs md:text-[13px] px-6 py-2.5 rounded-lg shadow-sm hover:shadow transition-all duration-200 active:scale-[0.98]"
          >
            <RotateCw className={`w-4 h-4 ${isChecking ? "animate-spin" : ""}`} />
            <span>{isChecking ? "Đang kiểm tra..." : "Thử lại"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
