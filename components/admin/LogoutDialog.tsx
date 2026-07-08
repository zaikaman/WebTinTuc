"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LogoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export default function LogoutDialog({
  open,
  onOpenChange,
  onConfirm,
}: LogoutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[460px] w-[95%] max-h-[90vh] overflow-y-auto rounded-[24px] p-6 border border-gray-100 shadow-2xl bg-white text-[#2c3e50] outline-none [&>button]:hidden">
        <DialogHeader className="border-b border-gray-150 pb-3 -mx-6 px-6">
          <DialogTitle className="text-xl font-bold text-gray-900 text-left">
            Đăng xuất
          </DialogTitle>
        </DialogHeader>

        <div className="py-6 text-center space-y-2">
          <h3 className="text-xl font-bold text-gray-900 leading-snug">
            Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?
          </h3>
          <p className="text-sm font-semibold text-gray-400">
            Phiên làm việc hiện tại của bạn trên thiết bị này sẽ kết thúc
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 pb-2">
          <button
            onClick={() => onOpenChange(false)}
            className="flex-1 max-w-[144px] py-3 border border-gray-200 hover:bg-gray-50 text-gray-900 text-lg font-bold rounded-xl transition-all shadow-sm flex items-center justify-center"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 max-w-[144px] py-3 bg-[#e86b6b] hover:bg-[#e55956] text-white text-lg font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            Đồng ý
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
