"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { uploadAdminMedia } from "@/lib/api/adminClient";

interface CropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cropImageUrl: string;
  cropImageElementId: string;
}

export default function CropDialog({
  open,
  onOpenChange,
  cropImageUrl,
  cropImageElementId,
}: CropDialogProps) {
  const [cropArea, setCropArea] = useState({ x: 10, y: 10, width: 80, height: 80 });
  const cropContainerRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<{
    type: 'drag' | 'resize';
    handle?: string;
    startX: number;
    startY: number;
    startArea: { x: number; y: number; width: number; height: number };
  } | null>(null);

  useEffect(() => {
    if (!dragState || !cropContainerRef.current) return;

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const rect = cropContainerRef.current!.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const deltaXPercent = ((clientX - dragState.startX) / rect.width) * 100;
      const deltaYPercent = ((clientY - dragState.startY) / rect.height) * 100;

      if (dragState.type === 'drag') {
        let newX = dragState.startArea.x + deltaXPercent;
        let newY = dragState.startArea.y + deltaYPercent;

        if (newX < 0) newX = 0;
        if (newY < 0) newY = 0;
        if (newX + dragState.startArea.width > 100) newX = 100 - dragState.startArea.width;
        if (newY + dragState.startArea.height > 100) newY = 100 - dragState.startArea.height;

        setCropArea(prev => ({
          ...prev,
          x: Math.round(newX),
          y: Math.round(newY)
        }));
      } else if (dragState.type === 'resize' && dragState.handle) {
        let newX = dragState.startArea.x;
        let newY = dragState.startArea.y;
        let newW = dragState.startArea.width;
        let newH = dragState.startArea.height;

        const handle = dragState.handle;

        if (handle.includes('e')) {
          newW = dragState.startArea.width + deltaXPercent;
        }
        if (handle.includes('w')) {
          const possibleX = dragState.startArea.x + deltaXPercent;
          if (possibleX >= 0) {
            newX = possibleX;
            newW = dragState.startArea.width - deltaXPercent;
          }
        }
        if (handle.includes('s')) {
          newH = dragState.startArea.height + deltaYPercent;
        }
        if (handle.includes('n')) {
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

        setCropArea({
          x: Math.round(newX),
          y: Math.round(newY),
          width: Math.round(newW),
          height: Math.round(newH)
        });
      }
    };

    const handleMouseUp = () => {
      setDragState(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove, { passive: false });
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [dragState]);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragState({
      type: 'drag',
      startX: clientX,
      startY: clientY,
      startArea: { ...cropArea },
    });
    e.preventDefault();
  };

  const handleResizeMouseDown = (e: React.MouseEvent | React.TouchEvent, handle: string) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragState({
      type: 'resize',
      handle,
      startX: clientX,
      startY: clientY,
      startArea: { ...cropArea },
    });
    e.preventDefault();
    e.stopPropagation();
  };

  const handleCropSave = async () => {
    const imgElement = cropContainerRef.current?.querySelector('img');
    if (!imgElement) {
      toast.error("Không tìm thấy ảnh để cắt!");
      return;
    }

    const canvas = document.createElement('canvas');
    const imgWidth = imgElement.naturalWidth;
    const imgHeight = imgElement.naturalHeight;
    const cropX = (cropArea.x / 100) * imgWidth;
    const cropY = (cropArea.y / 100) * imgHeight;
    const cropW = (cropArea.width / 100) * imgWidth;
    const cropH = (cropArea.height / 100) * imgHeight;

    canvas.width = cropW;
    canvas.height = cropH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(imgElement, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      toast.loading("Đang lưu ảnh đã cắt...", { id: "crop-save" });
      try {
        const formData = new FormData();
        formData.append("file", blob, "cropped-image.png");
        formData.append("folder", "articles");
        const res = await uploadAdminMedia(formData);
        if (res && res.url) {
          // Update the image in the editor
          const imgEl = document.querySelector(`#${cropImageElementId} img`) as HTMLImageElement | null;
          if (imgEl) {
            imgEl.src = res.url;
            imgEl.dispatchEvent(new Event('load'));
          }
          toast.success("Cắt ảnh thành công!", { id: "crop-save" });
          onOpenChange(false);
        } else {
          throw new Error("Upload failed");
        }
      } catch (err) {
        toast.error("Lưu ảnh thất bại!", { id: "crop-save" });
      }
    }, "image/png");
  };

  useEffect(() => {
    if (open) {
      setCropArea({ x: 10, y: 10, width: 80, height: 80 });
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Cắt ảnh</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Crop Preview */}
          <div
            ref={cropContainerRef}
            className="relative bg-gray-100 rounded-xl overflow-hidden max-h-[500px]"
            style={{ touchAction: 'none' }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
          >
            <img
              src={cropImageUrl}
              alt="Crop preview"
              className="w-full h-auto select-none"
              draggable={false}
              style={{ pointerEvents: 'none' }}
            />
            {/* Crop overlay */}
            <div
              className="absolute border-2 border-white bg-black/30 cursor-move"
              style={{
                left: `${cropArea.x}%`,
                top: `${cropArea.y}%`,
                width: `${cropArea.width}%`,
                height: `${cropArea.height}%`,
              }}
            >
              {/* Resize handles */}
              {['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'].map(handle => (
                <div
                  key={handle}
                  onMouseDown={(e) => handleResizeMouseDown(e, handle)}
                  onTouchStart={(e) => handleResizeMouseDown(e, handle)}
                  className="absolute w-3 h-3 bg-white border-2 border-[#E55956] rounded-full shadow-md cursor-[${handle}-resize]"
                  style={{
                    ...(handle.includes('n') ? { top: '-6px' } : handle.includes('s') ? { bottom: '-6px' } : { top: 'calc(50% - 6px)' }),
                    ...(handle.includes('w') ? { left: '-6px' } : handle.includes('e') ? { right: '-6px' } : { left: 'calc(50% - 6px)' }),
                  }}
                />
              ))}
            </div>
          </div>

          {/* Crop Controls */}
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500">X (%)</label>
              <input
                type="range"
                min={0}
                max={100}
                value={cropArea.x}
                onChange={(e) => setCropArea(prev => ({ ...prev, x: Number(e.target.value) }))}
                className="w-full"
              />
              <span className="text-xs text-gray-400">{cropArea.x}%</span>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">Y (%)</label>
              <input
                type="range"
                min={0}
                max={100}
                value={cropArea.y}
                onChange={(e) => setCropArea(prev => ({ ...prev, y: Number(e.target.value) }))}
                className="w-full"
              />
              <span className="text-xs text-gray-400">{cropArea.y}%</span>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">Rộng (%)</label>
              <input
                type="range"
                min={10}
                max={100}
                value={cropArea.width}
                onChange={(e) => setCropArea(prev => ({ ...prev, width: Number(e.target.value) }))}
                className="w-full"
              />
              <span className="text-xs text-gray-400">{cropArea.width}%</span>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">Cao (%)</label>
              <input
                type="range"
                min={10}
                max={100}
                value={cropArea.height}
                onChange={(e) => setCropArea(prev => ({ ...prev, height: Number(e.target.value) }))}
                className="w-full"
              />
              <span className="text-xs text-gray-400">{cropArea.height}%</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleCropSave}
            className="px-4 py-2 text-sm font-bold bg-[#E55956] hover:bg-[#cb4643] text-white rounded-xl transition-all shadow-sm"
          >
            Cắt cúp & Lưu
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
