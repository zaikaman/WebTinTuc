"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Home, RotateCw } from "lucide-react";
import { Illustration500 } from "@/components/Illustration500";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    console.error("500 Server Error caught by boundary:", error);
  }, [error]);

  const handleRetry = () => {
    setIsResetting(true);
    setTimeout(() => {
      reset();
      setIsResetting(false);
    }, 600);
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 md:py-16 px-4 text-center select-none overflow-hidden min-h-[500px]">
      {/* Container Card - matching the screenshot */}
      <div className="w-full max-w-[480px] bg-white rounded-3xl border border-gray-100/80 shadow-[0_15px_40px_rgba(0,0,0,0.06)] p-6 md:p-10 flex flex-col items-center">
        {/* 500 Illustration */}
        <Illustration500 />

        {/* Content */}
        <div className="mt-4">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 tracking-tight">
            Sự cố máy chủ(500)
          </h1>
          <p className="text-xs md:text-[13px] text-gray-600 leading-relaxed mb-8">
            Hệ thống đang gặp sự cố kỹ thuật không mong muốn. Đội ngũ kỹ sư của chúng tôi đã được thông báo và đang tiến hành xử lý. Xin lỗi vì sự bất tiện này.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-[340px] mx-auto">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full sm:w-auto bg-[#e24a48] hover:bg-[#d43f3d] text-white font-bold text-xs md:text-[13px] px-6 py-2.5 rounded-lg shadow-sm hover:shadow transition-all duration-200 active:scale-[0.98]"
            >
              <Home className="w-4 h-4" />
              <span>Về trang chủ</span>
            </Link>
            <button
              onClick={handleRetry}
              disabled={isResetting}
              className="flex items-center justify-center gap-2 w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-900 border border-gray-900 font-bold text-xs md:text-[13px] px-6 py-2.5 rounded-lg shadow-sm hover:shadow transition-all duration-200 active:scale-[0.98]"
            >
              <RotateCw className={`w-4 h-4 ${isResetting ? "animate-spin" : ""}`} />
              <span>{isResetting ? "Đang thử lại..." : "Thử lại"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
