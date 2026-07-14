"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

interface ConfirmDiscardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export default function ConfirmDiscardDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Thay đổi chưa được lưu",
  description = "Bạn có chắc chắn muốn rời khỏi? Tất cả các thay đổi chưa lưu của bạn sẽ bị mất vĩnh viễn.",
}: ConfirmDiscardDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[460px] w-[95%] max-h-[90vh] overflow-y-auto rounded-[24px] p-6 border border-gray-100 shadow-2xl bg-white text-[#2c3e50] outline-none [&>button]:hidden">
        <DialogHeader className="border-b border-gray-150 pb-3 -mx-6 px-6">
          <DialogTitle className="text-xl font-bold text-gray-900 text-left flex items-center gap-2">
            <AlertTriangle className="text-[#f59e0b] w-6 h-6" />
            <span>{title}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="py-6 text-center space-y-2">
          <h3 className="text-lg font-bold text-gray-900 leading-snug">
            Xác nhận rời khỏi trang
          </h3>
          <p className="text-sm font-semibold text-gray-400">
            {description}
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 pb-2">
          <button
            onClick={() => onOpenChange(false)}
            className="flex-1 max-w-[144px] py-3 border border-gray-200 hover:bg-gray-50 text-gray-900 text-lg font-bold rounded-xl transition-all shadow-sm flex items-center justify-center"
          >
            Ở lại
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 max-w-[144px] py-3 bg-[#e55956] hover:bg-[#cb4643] text-white text-lg font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            Rời đi
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
