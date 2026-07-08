"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronDown, Loader2 } from "lucide-react";
import type { Category } from "@/components/admin/AdminTypes";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dialogMode: "add" | "edit";
  categoryForm: Partial<Category>;
  isSaving: boolean;
  onFormChange: (form: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function CategoryDialog({
  open,
  onOpenChange,
  dialogMode,
  categoryForm,
  isSaving,
  onFormChange,
  onSubmit,
}: CategoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[460px] w-[95%] max-h-[90vh] overflow-y-auto rounded-[24px] p-6 border border-gray-100 shadow-2xl bg-white text-[#2c3e50] outline-none [&>button]:hidden">
        <DialogHeader className="border-b border-gray-150 pb-3 -mx-6 px-6">
          <DialogTitle className="text-xl font-bold text-gray-900 text-left">
            {dialogMode === "add" ? "Thêm danh mục" : "Sửa danh mục"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-5 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-900">
              Tên danh mục
            </label>
            <input
              type="text"
              value={categoryForm.name || ""}
              onChange={(e) => onFormChange({ ...categoryForm, name: e.target.value })}
              placeholder="Nhập tên danh mục..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm font-medium"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-900">
              Priority
            </label>
            <div className="relative">
              <select
                value={categoryForm.priority ?? 0}
                onChange={(e) => onFormChange({ ...categoryForm, priority: Number(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm font-semibold text-gray-800 appearance-none cursor-pointer"
              >
                {Array.from({ length: 11 }).map((_, i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-900">
              Trạng thái
            </label>
            <div className="relative">
              <select
                value={categoryForm.status || "Hoạt động"}
                onChange={(e) => onFormChange({ ...categoryForm, status: e.target.value as "Hoạt động" | "Ngừng hoạt động" })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm font-semibold text-gray-800 appearance-none cursor-pointer"
              >
                <option value="Hoạt động">Hoạt động</option>
                <option value="Ngừng hoạt động">Ngừng hoạt động</option>
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
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
