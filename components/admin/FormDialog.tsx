"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2, PlusCircle } from "lucide-react";

interface PostForm {
  title?: string;
  category?: string;
  status?: "Đã đăng" | "Nháp";
  views?: number;
  createdAt?: string;
}

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dialogMode: "add" | "edit";
  activeTab: string;
  postForm: PostForm;
  categoryOptions: string[];
  isSaving: boolean;
  onPostFormChange: (form: PostForm) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function FormDialog({
  open,
  onOpenChange,
  dialogMode,
  activeTab,
  postForm,
  categoryOptions,
  isSaving,
  onPostFormChange,
  onSubmit,
}: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[95%] max-h-[90vh] overflow-y-auto rounded-2xl p-6 border-none shadow-2xl bg-white text-[#2c3e50] outline-none">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
            <PlusCircle size={20} className="text-[#E55956]" />
            <span>
              {dialogMode === "add" ? "Thêm mới" : "Cập nhật"}{" "}
              {activeTab === "posts" && "bài viết"}
              {activeTab === "categories" && "danh mục"}
              {activeTab === "ads" && "quảng cáo"}
            </span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 py-3">
          {/* POSTS FIELDS */}
          {activeTab === "posts" && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Tiêu đề bài viết
                </label>
                <input
                  type="text"
                  value={postForm.title || ""}
                  onChange={(e) => onPostFormChange({ ...postForm, title: e.target.value })}
                  placeholder="Nhập tiêu đề..."
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-gray-50/50"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Danh mục
                  </label>
                  <select
                    value={postForm.category || ""}
                    onChange={(e) => onPostFormChange({ ...postForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-gray-50/50"
                  >
                    {categoryOptions.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Trạng thái
                  </label>
                  <select
                    value={postForm.status || ""}
                    onChange={(e) =>
                      onPostFormChange({ ...postForm, status: e.target.value as "Đã đăng" | "Nháp" })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-gray-50/50"
                  >
                    <option value="Đã đăng">Đã đăng</option>
                    <option value="Nháp">Nháp</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Lượt xem
                  </label>
                  <input
                    type="number"
                    value={postForm.views ?? 0}
                    onChange={(e) => onPostFormChange({ ...postForm, views: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-gray-50/50"
                    min="0"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Ngày tạo
                  </label>
                  <input
                    type="date"
                    value={postForm.createdAt || ""}
                    onChange={(e) => onPostFormChange({ ...postForm, createdAt: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-gray-50/50"
                  />
                </div>
              </div>
            </>
          )}

          <DialogFooter className="pt-4 border-t border-gray-100 flex flex-row items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              className="px-4.5 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-[#E55956] hover:bg-[#cb4643] text-white text-sm font-bold rounded-xl transition-all shadow-md disabled:opacity-75 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{dialogMode === "add" ? "Thêm mới" : "Lưu thay đổi"}</span>
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
