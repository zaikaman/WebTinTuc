"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { AdminAccount } from "./AdminTypes";

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dialogMode: "add" | "edit";
  accountForm: Partial<AdminAccount & { password?: string }>;
  isSaving: boolean;
  onFormChange: (form: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}


export default function AccountDialog({
  open,
  onOpenChange,
  dialogMode,
  accountForm,
  isSaving,
  onFormChange,
  onSubmit,
}: AccountDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[460px] w-[95%] max-h-[90vh] overflow-y-auto rounded-[24px] p-6 border border-gray-100 shadow-2xl bg-white text-[#2c3e50] outline-none [&>button]:hidden">
        <DialogHeader className="border-b border-gray-150 pb-3 -mx-6 px-6">
          <DialogTitle className="text-xl font-bold text-gray-900 text-left">
            {dialogMode === "add" ? "Thêm tài khoản" : "Sửa tài khoản"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-900">
              Tên đăng nhập
            </label>
            <input
              type="text"
              value={accountForm.username || ""}
              onChange={(e) => onFormChange({ ...accountForm, username: e.target.value })}
              placeholder="Nhập tên đăng nhập (ví dụ: admin01)..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm font-medium"
              required
              disabled={dialogMode === "edit"}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-900">
              Tên hiển thị
            </label>
            <input
              type="text"
              value={accountForm.display_name || ""}
              onChange={(e) => onFormChange({ ...accountForm, display_name: e.target.value })}
              placeholder="Nhập tên hiển thị..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm font-medium"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-900">
              Email
            </label>
            <input
              type="email"
              value={accountForm.email || ""}
              onChange={(e) => onFormChange({ ...accountForm, email: e.target.value })}
              placeholder="Nhập địa chỉ email..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm font-medium"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-900">
              Mật khẩu {dialogMode === "edit" && "(Để trống nếu không muốn đổi)"}
            </label>
            <input
              type="password"
              value={accountForm.password || ""}
              onChange={(e) => onFormChange({ ...accountForm, password: e.target.value })}
              placeholder={dialogMode === "add" ? "Nhập mật khẩu (tối thiểu 6 ký tự)..." : "Nhập mật khẩu mới..."}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm font-medium"
              required={dialogMode === "add"}
            />
          </div>

          <div className="flex items-center justify-center gap-4 pt-6 pb-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              className="flex-1 max-w-[144px] py-3 border border-gray-200 hover:bg-gray-50 text-gray-900 text-lg font-bold rounded-xl transition-all shadow-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 max-w-[144px] py-3 bg-[#e86b6b] hover:bg-[#e55956] text-white text-lg font-bold rounded-xl transition-all shadow-md flex items-center justify-center disabled:opacity-75 disabled:cursor-not-allowed gap-2"
            >
              {isSaving && <Loader2 className="w-5 h-5 animate-spin" />}
              <span>{dialogMode === "add" ? "Thêm" : "Sửa"}</span>
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
