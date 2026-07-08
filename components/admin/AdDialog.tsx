"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronDown, ExternalLink, Loader2, Upload } from "lucide-react";
import type { Ad } from "./AdminTypes";

interface AdDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dialogMode: "add" | "edit";
  adForm: Partial<Ad>;
  isSaving: boolean;
  onFormChange: (form: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function AdDialog({
  open,
  onOpenChange,
  dialogMode,
  adForm,
  isSaving,
  onFormChange,
  onSubmit,
}: AdDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] w-[95%] max-h-[90vh] overflow-y-auto rounded-[24px] p-6 border border-gray-100 shadow-2xl bg-white text-[#2c3e50] outline-none [&>button]:hidden">
        <DialogHeader className="border-b border-gray-150 pb-3 -mx-6 px-6">
          <DialogTitle className="text-xl font-bold text-gray-900 text-left">
            {dialogMode === "add" ? "Thêm quảng cáo" : "Sửa quảng cáo"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-900">
              Tên quảng cáo
            </label>
            <input
              type="text"
              value={adForm.name || ""}
              onChange={(e) => onFormChange({ ...adForm, name: e.target.value })}
              placeholder="Nhập tên quảng cáo..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm font-medium"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-900">
              Vị trí quảng cáo
            </label>
            <div className="relative">
              <select
                value={adForm.position || "header"}
                onChange={(e) => onFormChange({ ...adForm, position: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm font-semibold text-gray-800 appearance-none cursor-pointer"
              >
                <option value="header">Header</option>
                <option value="sidebar_1">SideBar 1</option>
                <option value="sidebar_2">SideBar 2</option>
                <option value="sidebar_3">SideBar 3</option>
                <option value="inline">Inline</option>
                <option value="footer">Footer</option>
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-900">
              Thời gian quảng cáo
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-bold text-gray-900">
              <div className="flex items-center gap-2">
                <span className="flex-shrink-0 text-gray-800 w-8 text-left">Từ</span>
                <input
                  type="date"
                  value={adForm.startDate || ""}
                  onChange={(e) => onFormChange({ ...adForm, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm"
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="flex-shrink-0 text-gray-800 w-8 text-left">Đến</span>
                <input
                  type="date"
                  value={adForm.endDate || ""}
                  onChange={(e) => onFormChange({ ...adForm, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-900">
              Thiết lập hoạt động
            </label>
            <div className="relative">
              <select
                value={adForm.status === "Ngừng hoạt động" ? "Ngừng hoạt động" : "Hoạt động"}
                onChange={(e) => onFormChange({ ...adForm, status: e.target.value as any })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm font-semibold text-gray-800 appearance-none cursor-pointer"
              >
                <option value="Hoạt động">Kích hoạt quảng cáo</option>
                <option value="Ngừng hoạt động">Tắt quảng cáo</option>
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {dialogMode === "edit" && (
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-150 flex items-center justify-between text-sm">
              <span className="font-semibold text-gray-500">Trạng thái hiển thị thực tế:</span>
              <span className={`font-bold px-3 py-1 rounded-full text-xs ${adForm.status === "Hoạt động" ? "bg-emerald-100 text-emerald-800" :
                adForm.status === "Chờ chạy" ? "bg-blue-100 text-blue-800" :
                  adForm.status === "Đã kết thúc" ? "bg-gray-100 text-gray-800" :
                    "bg-red-100 text-red-800"
                }`}>
                {adForm.status}
              </span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-900">
              Link liên kết (Không bắt buộc)
            </label>
            <input
              type="url"
              value={adForm.link || ""}
              onChange={(e) => onFormChange({ ...adForm, link: e.target.value })}
              placeholder="https://example.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-900">
              Ảnh quảng cáo
            </label>
            {adForm.image ? (
              <div className="relative rounded-xl overflow-hidden border border-gray-200 group aspect-[2.2/1] w-full flex-shrink-0 bg-gray-50 flex items-center justify-center">
                {adForm.link ? (
                  <a
                    href={adForm.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-full block cursor-pointer animate-none"
                    title="Ấn để kiểm tra liên kết quảng cáo"
                  >
                    <img src={adForm.image} alt="Ad Preview" className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300" />
                  </a>
                ) : (
                  <img src={adForm.image} alt="Ad Preview" className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none group-hover:pointer-events-auto">
                  {adForm.link && (
                    <a
                      href={adForm.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-[#E55956]/90 hover:bg-[#E55956] text-white text-xs font-bold rounded-lg transition-all shadow-md flex items-center gap-1 active:scale-95 pointer-events-auto"
                    >
                      <ExternalLink size={12} />
                      <span>Thử Link</span>
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => { const f = { ...adForm }; delete (f as any).image; onFormChange(f); }}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-all shadow-md active:scale-95 pointer-events-auto"
                  >
                    Xóa ảnh
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => document.getElementById("ad-upload-input")?.click()}
                className="border-2 border-dashed border-gray-200 hover:border-[#E55956] hover:bg-[#E55956]/5 transition-all rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer aspect-[2.2/1] w-full group bg-gray-50/20"
              >
                <Upload size={24} className="text-gray-400 group-hover:text-[#E55956] transition-colors" />
                <span className="text-xs font-bold text-gray-500 group-hover:text-[#E55956] transition-colors">
                  Click để tải ảnh hoặc kéo thả
                </span>
                <input
                  type="file"
                  id="ad-upload-input"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        onFormChange({ ...adForm, image: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-4 pt-4 pb-2">
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
