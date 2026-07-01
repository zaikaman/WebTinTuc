"use client";

import { useState, useEffect } from "react";

export default function Test500Page() {
  const [shouldThrow, setShouldThrow] = useState(false);

  useEffect(() => {
    // Only trigger the error after mounting in the browser
    setShouldThrow(true);
  }, []);

  if (shouldThrow) {
    throw new Error("Triggered 500 error for testing!");
  }

  return (
    <div className="p-16 text-center select-none">
      <div className="animate-pulse text-gray-500 font-medium">
        Đang khởi tạo lỗi 500 để kiểm tra...
      </div>
    </div>
  );
}
