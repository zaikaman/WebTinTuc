"use client";

import React from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newFolderName: string;
  onFolderNameChange: (value: string) => void;
  activeFolder: string;
  onCreateFolder: () => Promise<void>;
}

export default function FolderDialog({
  open,
  onOpenChange,
  newFolderName,
  onFolderNameChange,
  activeFolder,
  onCreateFolder,
}: FolderDialogProps) {
  const handleCreate = async () => {
    if (!newFolderName.trim()) {
      toast.error("Vui lòng nhập tên thư mục!");
      return;
    }
    await onCreateFolder();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[460px] w-[95%] max-h-[90vh] overflow-y-auto rounded-[24px] p-6 border border-gray-100 shadow-2xl bg-white text-[#2c3e50] outline-none [&>button]:hidden">
        <DialogHeader className="border-b border-gray-150 pb-3 -mx-6 px-6">
          <DialogTitle className="text-xl font-bold text-gray-900 text-left">
            Tạo thư mục mới
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-900">
              Tên thư mục
            </label>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => onFolderNameChange(e.target.value)}
              placeholder="Nhập tên thư mục..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm font-medium"
            />
          </div>

          {activeFolder && (
            <p className="text-xs font-semibold text-gray-400">
              Thư mục mới sẽ được tạo bên trong: <strong className="text-gray-700">{activeFolder}</strong>
            </p>
          )}

          <div className="flex gap-3 justify-end pt-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-5 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition-all"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleCreate}
              className="px-5 py-2.5 bg-[#E55956] hover:bg-[#d44e4b] text-white text-xs font-bold rounded-xl transition-all shadow-md"
            >
              Tạo
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
