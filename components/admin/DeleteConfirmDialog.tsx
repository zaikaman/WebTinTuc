"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { TabType } from "./AdminTypes";

interface DeleteConfirmDialogProps {
  open: boolean;
  activeTab: TabType;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  /** Extra warning when deleting the currently signed-in admin account. */
  isSelfDelete?: boolean;
}

export default function DeleteConfirmDialog({
  open,
  activeTab,
  isDeleting,
  onConfirm,
  onCancel,
  isSelfDelete = false,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent className="max-w-[460px] w-[95%] max-h-[90vh] overflow-y-auto rounded-[24px] p-6 border border-gray-100 shadow-2xl bg-white text-[#2c3e50] outline-none [&>button]:hidden">
        <DialogHeader className="border-b border-gray-150 pb-3 -mx-6 px-6">
          <DialogTitle className="text-xl font-bold text-gray-900 text-left">
            {activeTab === "posts" && "Xóa bài viết"}
            {activeTab === "categories" && "Xóa danh mục"}
            {activeTab === "ads" && "Xóa quảng cáo"}
            {activeTab === "accounts" && (isSelfDelete ? "Xóa tài khoản của bạn" : "Xóa tài khoản")}
          </DialogTitle>
        </DialogHeader>

        <div className="py-6 text-center space-y-2">
          <h3 className="text-xl font-bold text-gray-900 leading-snug">
            {activeTab === "posts" && "Bạn có chắc chắn muốn xóa bài viết"}
            {activeTab === "categories" && "Bạn có chắc chắn muốn xóa danh mục"}
            {activeTab === "ads" && "Bạn có chắc chắn muốn xóa quảng cáo"}
            {activeTab === "accounts" &&
              (isSelfDelete
                ? "Bạn đang xóa chính tài khoản đang đăng nhập"
                : "Bạn có chắc chắn muốn xóa tài khoản")}
          </h3>
          <p className="text-sm font-semibold text-[#E55956]">
            {activeTab === "accounts" && isSelfDelete
              ? "Bạn sẽ bị đăng xuất ngay sau khi xóa. Cần còn ít nhất một admin khác. Dữ liệu không thể khôi phục."
              : "Dữ liệu bị xóa sẽ không thể khôi phục"}
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 pb-2">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 max-w-[144px] py-3 border border-gray-200 hover:bg-gray-50 text-gray-900 text-lg font-bold rounded-xl transition-all shadow-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Không
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 max-w-[144px] py-3 bg-[#e86b6b] hover:bg-[#e55956] text-white text-lg font-bold rounded-xl transition-all shadow-md flex items-center justify-center disabled:opacity-75 disabled:cursor-not-allowed gap-2"
          >
            {isDeleting && <Loader2 className="w-5 h-5 animate-spin" />}
            <span>Có</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
