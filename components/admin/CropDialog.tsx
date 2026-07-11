"use client";

import React, { useRef, useState, useEffect } from "react";
import { Crop } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { uploadAdminMedia } from "@/lib/api/adminClient";
import type { CropArea } from "./AdminTypes";

interface CropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cropImageUrl: string;
  cropImageElementId: string;
  cropArea: CropArea;
  onCropAreaChange: (area: CropArea) => void;
}

export default function CropDialog({
  open,
  onOpenChange,
  cropImageUrl,
  cropImageElementId,
  cropArea,
  onCropAreaChange,
}: CropDialogProps) {
  const cropContainerRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<{
    type: "drag" | "resize";
    handle?: string;
    startX: number;
    startY: number;
    startArea: CropArea;
  } | null>(null);

  useEffect(() => {
    if (!dragState || !cropContainerRef.current) return;

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const rect = cropContainerRef.current!.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const deltaXPercent = ((clientX - dragState.startX) / rect.width) * 100;
      const deltaYPercent = ((clientY - dragState.startY) / rect.height) * 100;

      if (dragState.type === "drag") {
        let newX = dragState.startArea.x + deltaXPercent;
        let newY = dragState.startArea.y + deltaYPercent;

        if (newX < 0) newX = 0;
        if (newY < 0) newY = 0;
        if (newX + dragState.startArea.width > 100) newX = 100 - dragState.startArea.width;
        if (newY + dragState.startArea.height > 100) newY = 100 - dragState.startArea.height;

        onCropAreaChange({
          ...dragState.startArea,
          x: Math.round(newX),
          y: Math.round(newY),
        });
      } else if (dragState.type === "resize" && dragState.handle) {
        let newX = dragState.startArea.x;
        let newY = dragState.startArea.y;
        let newW = dragState.startArea.width;
        let newH = dragState.startArea.height;

        const handle = dragState.handle;

        if (handle.includes("e")) {
          newW = dragState.startArea.width + deltaXPercent;
        }
        if (handle.includes("w")) {
          const possibleX = dragState.startArea.x + deltaXPercent;
          if (possibleX >= 0) {
            newX = possibleX;
            newW = dragState.startArea.width - deltaXPercent;
          }
        }
        if (handle.includes("s")) {
          newH = dragState.startArea.height + deltaYPercent;
        }
        if (handle.includes("n")) {
          const possibleY = dragState.startArea.y + deltaYPercent;
          if (possibleY >= 0) {
            newY = possibleY;
            newH = dragState.startArea.height - deltaYPercent;
          }
        }

        if (newW < 10) newW = 10;
        if (newH < 10) newH = 10;
        if (newX < 0) newX = 0;
        if (newY < 0) newY = 0;
        if (newX + newW > 100) newW = 100 - newX;
        if (newY + newH > 100) newH = 100 - newY;

        onCropAreaChange({
          x: Math.round(newX),
          y: Math.round(newY),
          width: Math.round(newW),
          height: Math.round(newH),
        });
      }
    };

    const handleMouseUp = () => {
      setDragState(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleMouseMove, { passive: false });
    window.addEventListener("touchend", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleMouseMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [dragState, onCropAreaChange]);

  const handleCropSave = () => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    const proxyUrl =
      cropImageUrl && (cropImageUrl.startsWith("http://") || cropImageUrl.startsWith("https://"))
        ? `/api/admin/proxy-image?url=${encodeURIComponent(cropImageUrl)}`
        : cropImageUrl;
    img.src = proxyUrl;
    img.onerror = () => {
      toast.error(
        "Không thể tải ảnh để cắt. Thử chèn lại bằng link để lưu lên R2, hoặc kiểm tra link ảnh."
      );
    };
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const pixelX = (cropArea.x / 100) * img.naturalWidth;
      const pixelY = (cropArea.y / 100) * img.naturalHeight;
      const pixelW = (cropArea.width / 100) * img.naturalWidth;
      const pixelH = (cropArea.height / 100) * img.naturalHeight;

      canvas.width = pixelW;
      canvas.height = pixelH;

      ctx.drawImage(img, pixelX, pixelY, pixelW, pixelH, 0, 0, pixelW, pixelH);

      canvas.toBlob(
        async (blob) => {
          if (!blob) return;
          const croppedFile = new File([blob], `cropped-${Date.now()}.jpg`, { type: "image/jpeg" });

          toast.loading("Đang tải ảnh đã cắt lên R2...", { id: "upload-cropped" });
          try {
            const formData = new FormData();
            formData.append("file", croppedFile);
            formData.append("folder", "articles");
            const res = await uploadAdminMedia(formData);
            if (res && res.url) {
              const wrapper = document.getElementById(cropImageElementId);
              if (wrapper) {
                const imgEl = wrapper.querySelector("img");
                if (imgEl) {
                  imgEl.src = res.url;
                  // Prefer the real editor (contenteditable=true), not the media wrapper (false).
                  const ed =
                    (wrapper.closest('[contenteditable="true"]') as HTMLElement | null) ||
                    (wrapper.parentElement?.closest("[contenteditable]") as HTMLElement | null);
                  if (ed) {
                    ed.dispatchEvent(new Event("input", { bubbles: true }));
                  }
                }
              }
              toast.success("Đã cắt cúp và chèn ảnh thành công!", { id: "upload-cropped" });
              onOpenChange(false);
            }
          } catch (err) {
            const e = err instanceof Error ? err : new Error(String(err));
            toast.error("Lỗi tải ảnh cắt: " + e.message, { id: "upload-cropped" });
          }
        },
        "image/jpeg",
        0.9
      );
    };
  };

  const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    setDragState({
      type: "drag",
      startX: clientX,
      startY: clientY,
      startArea: { ...cropArea },
    });
  };

  const startResize = (handle: string, e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    setDragState({
      type: "resize",
      handle,
      startX: clientX,
      startY: clientY,
      startArea: { ...cropArea },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[540px] w-[95%] max-h-[95vh] overflow-y-auto rounded-3xl p-7 border-none shadow-2xl bg-white text-[#2c3e50] outline-none">
        <DialogHeader className="flex flex-row items-center gap-2 border-b border-gray-100 pb-4 pr-6">
          <div className="w-8 h-8 rounded-lg bg-[#E55956]/10 flex items-center justify-center flex-shrink-0">
            <Crop className="text-[#E55956] w-5 h-5" />
          </div>
          <DialogTitle className="text-lg font-bold text-gray-900 leading-none">
            Cắt cúp hình ảnh (Crop)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Preview Box */}
          <div className="relative overflow-hidden max-w-full max-h-[350px] border border-gray-200 rounded-2xl bg-slate-50 flex items-center justify-center p-4 select-none">
            <div ref={cropContainerRef} className="relative max-w-full max-h-[300px] select-none">
              <img
                src={
                  cropImageUrl && (cropImageUrl.startsWith("http://") || cropImageUrl.startsWith("https://"))
                    ? `/api/admin/proxy-image?url=${encodeURIComponent(cropImageUrl)}`
                    : cropImageUrl
                }
                alt="Source image to crop"
                className="max-w-full max-h-[300px] object-contain select-none pointer-events-none"
                draggable={false}
                crossOrigin="anonymous"
              />
              {/* Draggable & Resizable crop selection overlay */}
              <div
                className="absolute border-2 border-dashed border-[#E55956] bg-black/25 cursor-move z-30 group"
                style={{
                  left: `${cropArea.x}%`,
                  top: `${cropArea.y}%`,
                  width: `${cropArea.width}%`,
                  height: `${cropArea.height}%`,
                }}
                onMouseDown={startDrag}
                onTouchStart={startDrag}
              >
                {/* Visual Guideline Grid */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                  <div className="border-r border-b border-dashed border-white/50"></div>
                  <div className="border-r border-b border-dashed border-white/50"></div>
                  <div className="border-b border-dashed border-white/50"></div>
                  <div className="border-r border-b border-dashed border-white/50"></div>
                  <div className="border-r border-b border-dashed border-white/50"></div>
                  <div className="border-b border-dashed border-white/50"></div>
                  <div className="border-r border-white/50"></div>
                  <div className="border-r border-white/50"></div>
                  <div></div>
                </div>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="bg-black/75 px-2 py-0.5 rounded text-[9px] text-white font-bold select-none">
                    Vùng cắt
                  </span>
                </div>

                {/* Drag resize handles (Corners) */}
                {["nw", "ne", "sw", "se"].map((handle) => (
                  <div
                    key={handle}
                    className={`absolute ${
                      handle.includes("n") ? "-top-1.5" : "-bottom-1.5"
                    } ${
                      handle.includes("w") ? "-left-1.5" : "-right-1.5"
                    } w-3.5 h-3.5 bg-white border-2 border-[#E55956] rounded-full cursor-${
                      handle === "nw" || handle === "se" ? "nwse" : "nesw"
                    }-resize z-40 shadow-sm active:scale-125 transition-transform`}
                    onMouseDown={(e) => startResize(handle, e)}
                    onTouchStart={(e) => startResize(handle, e)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Position and Size Sliders */}
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wide">
                <span>Vị trí ngang (X): {cropArea.x}%</span>
              </div>
              <input
                type="range"
                min="0"
                max={100 - cropArea.width}
                value={cropArea.x}
                onChange={(e) => onCropAreaChange({ ...cropArea, x: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#E55956]"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wide">
                <span>Vị trí dọc (Y): {cropArea.y}%</span>
              </div>
              <input
                type="range"
                min="0"
                max={100 - cropArea.height}
                value={cropArea.y}
                onChange={(e) => onCropAreaChange({ ...cropArea, y: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#E55956]"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wide">
                <span>Chiều rộng (Width): {cropArea.width}%</span>
              </div>
              <input
                type="range"
                min="10"
                max={100 - cropArea.x}
                value={cropArea.width}
                onChange={(e) => onCropAreaChange({ ...cropArea, width: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#E55956]"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wide">
                <span>Chiều cao (Height): {cropArea.height}%</span>
              </div>
              <input
                type="range"
                min="10"
                max={100 - cropArea.y}
                value={cropArea.height}
                onChange={(e) => onCropAreaChange({ ...cropArea, height: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#E55956]"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-100 mt-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex-1 max-w-[144px] py-3 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 text-sm font-bold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleCropSave}
            className="flex-1 max-w-[144px] py-3 bg-[#E55956] hover:bg-[#cb4643] text-white text-sm font-bold rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center"
          >
            Cắt cúp & Lưu
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
