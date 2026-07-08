"use client";

import React from "react";
import { Video } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { MediaItem } from "./AdminTypes";

type VideoTabType = "link" | "upload" | "library";

interface VideoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoUrl: string;
  videoTab: VideoTabType;
  videoFile: File | null;
  videoFileName: string;
  mediaItems: MediaItem[];
  mediaLoading: boolean;
  onUrlChange: (value: string) => void;
  onTabChange: (tab: VideoTabType) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTriggerFileUpload: () => void;
  onInsert: () => void;
  onLoadMedia: () => void;
}

export default function VideoDialog({
  open,
  onOpenChange,
  videoUrl,
  videoTab,
  videoFile: _videoFile,
  videoFileName,
  mediaItems,
  mediaLoading,
  onUrlChange,
  onTabChange,
  onFileChange,
  onTriggerFileUpload,
  onInsert,
  onLoadMedia,
}: VideoDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
          onUrlChange("");
        }
      }}
    >
      <DialogContent className="max-w-[640px] w-[95%] max-h-[90vh] overflow-y-auto rounded-3xl p-7 border-none shadow-2xl bg-white text-[#2c3e50] outline-none">
        <DialogHeader className="flex flex-row items-center gap-2 border-b border-gray-100 pb-4 pr-6">
          <div className="w-8 h-8 rounded-lg bg-[#E55956]/10 flex items-center justify-center flex-shrink-0">
            <Video className="text-[#E55956] w-5 h-5" />
          </div>
          <DialogTitle className="text-lg font-bold text-gray-900 leading-none">
            Chèn Video
          </DialogTitle>
        </DialogHeader>

        {/* Tab Selector */}
        <div className="flex gap-2 border-b border-gray-100 py-2">
          <button
            type="button"
            onClick={() => onTabChange("link")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              videoTab === "link"
                ? "bg-[#E55956] text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Dán liên kết (YouTube / URL)
          </button>
          <button
            type="button"
            onClick={() => onTabChange("upload")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              videoTab === "upload"
                ? "bg-[#E55956] text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Tải lên từ máy tính
          </button>
          <button
            type="button"
            onClick={() => {
              onTabChange("library");
              onLoadMedia();
            }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              videoTab === "library"
                ? "bg-[#E55956] text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Thư viện Media (R2)
          </button>
        </div>

        <div className="space-y-4 py-4 min-h-[250px]">
          {videoTab === "link" ? (
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Link Youtube / URL Video
              </label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => {
                  onUrlChange(e.target.value);
                }}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm font-medium"
              />
            </div>
          ) : videoTab === "upload" ? (
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Từ máy tính
              </label>
              <div
                onClick={onTriggerFileUpload}
                className="border-2 border-dashed border-gray-200 hover:border-[#E55956] hover:bg-[#E55956]/5 transition-all duration-300 rounded-2xl p-7 flex flex-col items-center justify-center gap-3 cursor-pointer group bg-gray-50/20"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-[#E55956]/10 flex items-center justify-center transition-all duration-300">
                  <Video className="w-5 h-5 text-gray-400 group-hover:text-[#E55956] transition-colors" />
                </div>
                <span className="text-xs font-semibold text-gray-500 group-hover:text-[#E55956] transition-colors text-center max-w-[280px]">
                  {videoFileName ? videoFileName : "Chọn file video (MP4, MOV, AVI, ...)"}
                </span>
                <input
                  type="file"
                  id="video-upload-input"
                  className="hidden"
                  accept="video/*"
                  onChange={onFileChange}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Videos Grid */}
              {mediaLoading ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto p-1 animate-pulse">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="aspect-square rounded-xl bg-gray-150 flex flex-col items-center justify-center p-2" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto p-1">
                  {mediaItems.filter((item) => item.type === "video" || item.key.match(/\.(mp4|webm|ogg)$/i)).map((item) => {
                    const fullUrl = item.url.startsWith("blob:") || item.url.startsWith("data:") || item.url.startsWith("http") ? item.url : (window.location.origin + item.url);
                    const isSelected = videoUrl === fullUrl;
                    return (
                      <div
                        key={item.key}
                        onClick={() => {
                          onUrlChange(fullUrl);
                        }}
                        className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all bg-slate-50 flex flex-col items-center justify-center p-2 text-center gap-2 group ${
                          isSelected ? "border-[#E55956] ring-2 ring-[#E55956]/15" : "border-transparent hover:bg-slate-100"
                        }`}
                      >
                        <Video className="w-8 h-8 text-gray-400 group-hover:text-[#E55956] transition-colors" />
                        <span className="text-[10px] text-gray-600 font-bold truncate w-full">
                          {item.title}
                        </span>
                      </div>
                    );
                  })}
                  {mediaItems.filter((item) => item.type === "video" || item.key.match(/\.(mp4|webm|ogg)$/i)).length === 0 && (
                    <div className="col-span-full py-10 text-center text-xs text-gray-400 font-semibold">
                      Không tìm thấy video nào trong thư mục này
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-100 mt-2">
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              onUrlChange("");
            }}
            className="flex-1 max-w-[144px] py-3 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 text-sm font-bold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onInsert}
            className="flex-1 max-w-[144px] py-3 bg-[#E55956] hover:bg-[#cb4643] text-white text-sm font-bold rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center"
          >
            Chèn Video
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
