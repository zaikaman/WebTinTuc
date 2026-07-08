"use client";

import React, { useRef, useEffect } from "react";
import {
  ArrowLeft,
  Save,
  Loader2,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Image as ImageIcon,
  Video,
  ChevronDown,
  Upload,
  X,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { uploadAdminMedia } from "@/lib/api/adminClient";
import type { Post, Category } from "./AdminTypes";

interface EditorViewProps {
  postForm: Partial<Post>;
  onPostFormChange: (form: Partial<Post>) => void;
  postContent: string;
  onPostContentChange: (content: string) => void;
  postCoverImage: string | null;
  onPostCoverImageChange: (url: string | null) => void;
  isPostSaving: boolean;
  onSave: (e: React.FormEvent) => void;
  onClose: () => void;
  categories: Category[];
}

export default function EditorView({
  postForm,
  onPostFormChange,
  postContent,
  onPostContentChange,
  postCoverImage,
  onPostCoverImageChange,
  isPostSaving,
  onSave,
  onClose,
  categories,
}: EditorViewProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [imageDialogOpen, setImageDialogOpen] = React.useState(false);
  const [imageUrl, setImageUrl] = React.useState("");
  const [imageCaption, setImageCaption] = React.useState("");
  const [imageTab, setImageTab] = React.useState<"link" | "upload" | "library">("link");
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imageFileName, setImageFileName] = React.useState<string>("");
  const [videoDialogOpen, setVideoDialogOpen] = React.useState(false);
  const [videoFile, setVideoFile] = React.useState<File | null>(null);
  const [videoFileName, setVideoFileName] = React.useState<string>("");
  const [videoUrl, setVideoUrl] = React.useState<string>("");
  const [videoTab, setVideoTab] = React.useState<"link" | "upload" | "library">("link");

  const savedSelectionRef = useRef<Range | null>(null);

  useEffect(() => {
    // Enable styleWithCSS to generate inline CSS styling (like span with font-size) instead of legacy HTML tags
    try {
      document.execCommand("styleWithCSS", false, "true");
    } catch (e) {
      console.warn("Failed to set styleWithCSS", e);
    }
  }, []);

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      let node: Node | null = range.commonAncestorContainer;
      let isInside = false;
      while (node) {
        if (node === editorRef.current) {
          isInside = true;
          break;
        }
        node = node.parentNode;
      }
      if (isInside) {
        savedSelectionRef.current = range.cloneRange();
        console.log("saveSelection: Saved range", {
          collapsed: range.collapsed,
          startOffset: range.startOffset,
          endOffset: range.endOffset,
          commonAncestor: range.commonAncestorContainer.nodeName,
          text: range.toString()
        });
      } else {
        console.log("saveSelection: Range is outside editor", range.commonAncestorContainer);
      }
    } else {
      console.log("saveSelection: No selection ranges found");
    }
  };

  const restoreSelection = () => {
    console.log("restoreSelection: Focusing editor container");
    if (editorRef.current) {
      editorRef.current.focus();
    }
    if (savedSelectionRef.current && window.getSelection) {
      console.log("restoreSelection: Restoring range selection", {
        collapsed: savedSelectionRef.current.collapsed,
        text: savedSelectionRef.current.toString()
      });
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedSelectionRef.current);
      }
    } else {
      console.log("restoreSelection: No saved range to restore!");
    }
  };

  const executeCommand = (command: string, value: string = "") => {
    console.log("executeCommand: Starting formatting", { command, value });
    restoreSelection();
    try {
      console.log("executeCommand: Setting styleWithCSS true");
      document.execCommand("styleWithCSS", false, "true");
    } catch (e) {
      console.error("executeCommand: failed to set styleWithCSS", e);
    }
    console.log("executeCommand: Executing native command", { command, value });
    const result = document.execCommand(command, false, value);
    console.log("executeCommand: Native command result", result);
    handleEditorInput();
    saveSelection();
  };

  const handleFontFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const font = e.target.value;
    console.log("handleFontFamilyChange: Chosen font", font);
    if (!font) return;
    setTimeout(() => {
      executeCommand("fontName", font);
    }, 0);
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    console.log("handleFontSizeChange: Chosen size", val);
    if (!val) return;
    let size = "3";
    if (val === "12px") size = "1";
    if (val === "14px") size = "2";
    if (val === "16px") size = "3";
    if (val === "18px") size = "4";
    if (val === "20px") size = "5";
    if (val === "24px") size = "6";
    setTimeout(() => {
      executeCommand("fontSize", size);
    }, 0);
  };

  // Keep contentEditable div synchronized with postContent state
  useEffect(() => {
    if (editorRef.current) {
      if (editorRef.current.innerHTML !== postContent) {
        editorRef.current.innerHTML = postContent;
      }
    }
  }, [postContent]);

  const handleEditorInput = () => {
    if (editorRef.current) {
      onPostContentChange(editorRef.current.innerHTML);
    }
  };

  const handleTriggerImageUpload = () => {
    document.getElementById("cover-upload-input")?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onPostCoverImageChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTriggerInsertImageUpload = () => {
    document.getElementById("insert-image-upload-input")?.click();
  };

  const handleInsertImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageFileName(file.name);
      setImageUrl("");
    }
  };

  const handleTriggerVideoUpload = () => {
    document.getElementById("video-upload-input")?.click();
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoFileName(file.name);
      setVideoUrl("");
    }
  };

  const insertHtmlToEditor = (html: string) => {
    console.log("insertHtmlToEditor: HTML to insert is", html);
    if (!editorRef.current) {
      console.warn("insertHtmlToEditor: editorRef.current is null!");
      return;
    }
    
    editorRef.current.focus();
    const selection = window.getSelection();
    console.log("insertHtmlToEditor: selection is", selection ? { rangeCount: selection.rangeCount, anchorNode: selection.anchorNode?.nodeName } : "null");
    
    let isInsideEditor = false;
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      let node = range.commonAncestorContainer;
      while (node) {
        if (node === editorRef.current) {
          isInsideEditor = true;
          break;
        }
        node = node.parentNode as Node;
      }
    }
    
    console.log("insertHtmlToEditor: isInsideEditor is", isInsideEditor);
    if (isInsideEditor && selection) {
      try {
        console.log("insertHtmlToEditor: Executing insertHTML command");
        document.execCommand("insertHTML", false, html);
      } catch (err) {
        console.error("insertHtmlToEditor: execCommand insertHTML failed, appending to innerHTML", err);
        editorRef.current.innerHTML += html;
      }
    } else {
      console.log("insertHtmlToEditor: Appending directly to innerHTML because selection is outside editor");
      editorRef.current.innerHTML += html;
    }
    
    console.log("insertHtmlToEditor: New editor innerHTML", editorRef.current.innerHTML);
    onPostContentChange(editorRef.current.innerHTML);
  };

  const handleInsertImage = async () => {
    console.log("handleInsertImage: Start", { imageTab, imageUrl, imageCaption, imageFile });
    let finalImageUrl = "";

    if (imageTab === "upload") {
      if (!imageFile) {
        toast.error("Vui lòng chọn file ảnh để tải lên!");
        return;
      }
      toast.loading("Đang tải hình ảnh lên Cloudflare R2...", { id: "upload-image" });
      try {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("folder", "articles");

        const res = await uploadAdminMedia(formData);
        console.log("handleInsertImage: Upload res", res);
        if (res && res.url) {
          finalImageUrl = res.url;
          toast.success("Đã tải lên hình ảnh thành công!", { id: "upload-image" });
        } else {
          throw new Error("Không nhận được URL từ server");
        }
      } catch (err: any) {
        console.error("handleInsertImage: Upload error", err);
        toast.error("Tải lên hình ảnh thất bại: " + (err.message || err), { id: "upload-image" });
        return;
      }
    } else if (imageTab === "link" || imageTab === "library") {
      if (!imageUrl.trim()) {
        toast.error(imageTab === "link" ? "Vui lòng nhập link ảnh!" : "Vui lòng chọn hình ảnh từ thư viện!");
        return;
      }
      finalImageUrl = imageUrl.trim();

      if (imageTab === "link") {
        const isLikelyImage = /\.(jpeg|jpg|gif|png|webp|svg|bmp|tiff|jfif)(\?.*)?$/i.test(finalImageUrl) || 
                              finalImageUrl.startsWith("data:image/") ||
                              finalImageUrl.includes("images.unsplash.com") ||
                              finalImageUrl.includes("r2.dev") ||
                              finalImageUrl.includes("r2.cloudflarestorage.com") ||
                              finalImageUrl.includes("lh3.googleusercontent.com");
                              
        if (!isLikelyImage) {
          toast.warning("Đường dẫn này có thể không phải là liên kết ảnh trực tiếp. Hãy đảm bảo liên kết kết thúc bằng .jpg, .png, .webp...", { duration: 6000 });
        }
      }
    } else {
      console.error("handleInsertImage: Unsupported imageTab value", imageTab);
      toast.error("Tính năng này chưa được hỗ trợ!");
      return;
    }

    console.log("handleInsertImage: finalImageUrl is", finalImageUrl);
    if (!finalImageUrl) {
      toast.error("Đường dẫn hình ảnh không hợp lệ!");
      return;
    }

    const wrapperId = "img-" + Math.random().toString(36).substring(2, 9);
    const imgHtml = `<p><br></p><div id="${wrapperId}" class="my-4 relative group" contenteditable="false" style="max-width: 100%; margin: 0 auto;">
  <img src="${finalImageUrl}" alt="${imageCaption}" class="w-full rounded-xl border border-gray-200 shadow-sm" />
  ${imageCaption ? `<p class="text-center text-xs italic text-gray-500 mt-1.5">${imageCaption}</p>` : ''}
  <button type="button" onclick="const p=this.parentElement; const ed=p.closest('[contenteditable]'); p.remove(); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="absolute top-2 right-2 hidden group-hover:flex items-center justify-center w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md active:scale-95 transition-all z-30" title="Xóa hình ảnh">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  </button>
  <div class="absolute bottom-2 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center gap-1.5 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg text-[11px] text-white font-bold select-none z-30 whitespace-nowrap w-max min-w-max">
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='25%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">25%</button>
    <span class="w-[1px] h-3 bg-white/20"></span>
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='50%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">50%</button>
    <span class="w-[1px] h-3 bg-white/20"></span>
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='75%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">75%</button>
    <span class="w-[1px] h-3 bg-white/20"></span>
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='100%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">100%</button>
    <span class="w-[1px] h-3 bg-white/20"></span>
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); const img=p.querySelector('img'); if(img) { window.dispatchEvent(new CustomEvent('editor-crop-image', { detail: { src: img.src, id: p.id } })); }" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5 flex items-center gap-1">
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6.13 1L6 16a2 2 0 0 0 2 2h15"/><path d="M1 6.13L16 6a2 2 0 0 1 2 2v15"/></svg>
      Cắt ảnh
    </button>
  </div>
</div><p><br></p>`;

    insertHtmlToEditor(imgHtml);
    setImageDialogOpen(false);
    setImageUrl("");
    setImageCaption("");
    setImageFile(null);
    setImageFileName("");
  };

  const handleInsertVideo = async () => {
    console.log("handleInsertVideo: Start", { videoTab, videoUrl, videoFile });
    let videoHtml = "";

    if (videoTab === "upload") {
      if (!videoFile) {
        toast.error("Vui lòng chọn file video để tải lên!");
        return;
      }
      toast.loading("Đang tải video lên Cloudflare R2...", { id: "upload-video" });
      try {
        const formData = new FormData();
        formData.append("file", videoFile);
        formData.append("folder", "articles");

        const res = await uploadAdminMedia(formData);
        console.log("handleInsertVideo: Upload res", res);
        if (res && res.url) {
          videoHtml = `<p><br></p><div class="my-4 relative group" contenteditable="false" style="max-width: 100%; margin: 0 auto;">
  <video controls src="${res.url}" class="w-full max-h-[400px] rounded-xl border border-gray-200 shadow-sm"></video>
  <button type="button" onclick="const p=this.parentElement; const ed=p.closest('[contenteditable]'); p.remove(); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="absolute top-2 right-2 hidden group-hover:flex items-center justify-center w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md active:scale-95 transition-all z-30" title="Xóa video">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  </button>
  <div class="absolute bottom-2 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center gap-1.5 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg text-[11px] text-white font-bold select-none z-30 whitespace-nowrap w-max min-w-max">
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='25%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">25%</button>
    <span class="w-[1px] h-3 bg-white/20"></span>
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='50%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">50%</button>
    <span class="w-[1px] h-3 bg-white/20"></span>
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='75%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">75%</button>
    <span class="w-[1px] h-3 bg-white/20"></span>
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='100%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">100%</button>
</div><p><br></p>`;
          toast.success("Đã tải lên và chèn video thành công!", { id: "upload-video" });
        } else {
          throw new Error("Không nhận được URL từ server");
        }
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        console.error("handleInsertVideo: Upload error", e);
        toast.error("Tải lên video thất bại: " + e.message, { id: "upload-video" });
        return;
      }
    } else if (videoTab === "link" || videoTab === "library") {
      if (!videoUrl.trim()) {
        toast.error(videoTab === "link" ? "Vui lòng nhập link video!" : "Vui lòng chọn video từ thư viện!");
        return;
      }
      const url = videoUrl.trim();
      if (url.includes("youtube.com/watch") || url.includes("youtu.be")) {
        let videoId = "";
        try {
          if (url.includes("youtube.com/watch")) {
            const urlParams = new URLSearchParams(new URL(url).search);
            videoId = urlParams.get("v") || "";
          } else if (url.includes("youtu.be/")) {
            videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
          }
        } catch (err) {
          console.error("Invalid URL", err);
        }

        if (videoId) {
          videoHtml = `<p><br></p><div class="my-4 relative group" contenteditable="false" style="max-width: 100%; margin: 0 auto;">
  <iframe class="w-full aspect-video rounded-xl shadow-sm border border-gray-200" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  <button type="button" onclick="const p=this.parentElement; const ed=p.closest('[contenteditable]'); p.remove(); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="absolute top-2 right-2 hidden group-hover:flex items-center justify-center w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md active:scale-95 transition-all z-30" title="Xóa video nhúng">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  </button>
  <div class="absolute bottom-2 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center gap-1.5 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg text-[11px] text-white font-bold select-none z-30 whitespace-nowrap w-max min-w-max">
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='25%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">25%</button>
    <span class="w-[1px] h-3 bg-white/20"></span>
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='50%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">50%</button>
    <span class="w-[1px] h-3 bg-white/20"></span>
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='75%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">75%</button>
    <span class="w-[1px] h-3 bg-white/20"></span>
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='100%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">100%</button>
  </div>
</div><p><br></p>`;
        } else {
          videoHtml = `<p><br></p><div class="my-4 relative group" contenteditable="false" style="max-width: 100%; margin: 0 auto;">
  <iframe class="w-full aspect-video rounded-xl shadow-sm border border-gray-200" src="${url}" frameborder="0" allowfullscreen></iframe>
  <button type="button" onclick="const p=this.parentElement; const ed=p.closest('[contenteditable]'); p.remove(); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="absolute top-2 right-2 hidden group-hover:flex items-center justify-center w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md active:scale-95 transition-all z-30" title="Xóa video nhúng">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  </button>
  <div class="absolute bottom-2 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center gap-1.5 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg text-[11px] text-white font-bold select-none z-30 whitespace-nowrap w-max min-w-max">
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='25%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">25%</button>
    <span class="w-[1px] h-3 bg-white/20"></span>
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='50%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">50%</button>
    <span class="w-[1px] h-3 bg-white/20"></span>
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='75%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">75%</button>
    <span class="w-[1px] h-3 bg-white/20"></span>
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='100%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">100%</button>
  </div>
</div><p><br></p>`;
        }
      } else {
        videoHtml = `<p><br></p><div class="my-4 relative group" contenteditable="false" style="max-width: 100%; margin: 0 auto;">
  <video controls src="${url}" class="w-full max-h-[400px] rounded-xl border border-gray-200 shadow-sm"></video>
  <button type="button" onclick="const p=this.parentElement; const ed=p.closest('[contenteditable]'); p.remove(); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="absolute top-2 right-2 hidden group-hover:flex items-center justify-center w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md active:scale-95 transition-all z-30" title="Xóa video">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  </button>
  <div class="absolute bottom-2 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center gap-1.5 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg text-[11px] text-white font-bold select-none z-30 whitespace-nowrap w-max min-w-max">
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='25%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">25%</button>
    <span class="w-[1px] h-3 bg-white/20"></span>
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='50%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">50%</button>
    <span class="w-[1px] h-3 bg-white/20"></span>
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='75%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">75%</button>
    <span class="w-[1px] h-3 bg-white/20"></span>
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='100%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">100%</button>
  </div>
</div><p><br></p>`;
      }
      toast.success("Đã chèn video thành công!");
    } else {
      toast.error("Tính năng này chưa được hỗ trợ!");
      return;
    }

    insertHtmlToEditor(videoHtml);
    setVideoDialogOpen(false);
    setVideoFile(null);
    setVideoFileName("");
    setVideoUrl("");
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] text-[#2c3e50] font-sans antialiased flex flex-col animate-fade-in">
      
      {/* Top Header */}
      <header className="h-[65px] bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-2 text-gray-800 hover:text-gray-950 font-bold text-sm transition-all"
        >
          <ArrowLeft size={18} />
          <span>Quay lại</span>
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={isPostSaving}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#E55956] hover:bg-[#cb4643] text-white text-sm font-bold rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {isPostSaving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          <span>Lưu bài viết</span>
        </button>
      </header>

      {/* Editor Body */}
      <main className="max-w-6xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (Main Editor) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          {/* Title */}
          <div className="space-y-1.5 flex-shrink-0">
            <label className="text-sm font-bold text-gray-700">Tiêu đề bài viết</label>
            <input
              type="text"
              value={postForm.title || ""}
              onChange={(e) => onPostFormChange({ ...postForm, title: e.target.value })}
              placeholder="Nhập tiêu đề..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm font-medium"
              required
            />
          </div>

          {/* Rich Text Toolbar */}
          <div className="flex flex-wrap items-center gap-1 bg-white border border-gray-200 rounded-xl p-1.5 shadow-sm text-gray-600 flex-shrink-0">
            
            {/* Font Family Dropdown */}
            <div className="relative">
              <select
                value=""
                onChange={handleFontFamilyChange}
                className="bg-transparent hover:bg-gray-100 px-2.5 py-1.5 rounded-lg text-xs font-semibold outline-none cursor-pointer appearance-none pr-6 border-none text-gray-700"
              >
                <option value="" disabled hidden>Font chữ</option>
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Georgia">Georgia</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            <div className="h-4 w-px bg-gray-200 mx-1" />

            {/* Font Size Dropdown */}
            <div className="relative">
              <select
                value=""
                onChange={handleFontSizeChange}
                className="bg-transparent hover:bg-gray-100 px-2.5 py-1.5 rounded-lg text-xs font-semibold outline-none cursor-pointer appearance-none pr-6 border-none text-gray-700"
              >
                <option value="" disabled hidden>Cỡ chữ</option>
                <option value="12px">12px</option>
                <option value="14px">14px</option>
                <option value="16px">16px</option>
                <option value="18px">18px</option>
                <option value="20px">20px</option>
                <option value="24px">24px</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            <div className="h-4 w-px bg-gray-200 mx-1" />

            {/* Formatting buttons */}
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { document.execCommand("bold"); handleEditorInput(); }} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900" title="Bold"><Bold size={15} /></button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { document.execCommand("italic"); handleEditorInput(); }} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900" title="Italic"><Italic size={15} /></button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { document.execCommand("underline"); handleEditorInput(); }} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900" title="Underline"><Underline size={15} /></button>

            <div className="h-4 w-px bg-gray-200 mx-1" />

            {/* Alignment */}
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { document.execCommand("justifyLeft"); handleEditorInput(); }} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900" title="Align Left"><AlignLeft size={15} /></button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { document.execCommand("justifyCenter"); handleEditorInput(); }} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900" title="Align Center"><AlignCenter size={15} /></button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { document.execCommand("justifyRight"); handleEditorInput(); }} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900" title="Align Right"><AlignRight size={15} /></button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { document.execCommand("justifyFull"); handleEditorInput(); }} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900" title="Align Justify"><AlignJustify size={15} /></button>

            <div className="h-4 w-px bg-gray-200 mx-1" />

            {/* Lists */}
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { document.execCommand("insertUnorderedList"); handleEditorInput(); }} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900" title="Bullet List"><List size={15} /></button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { document.execCommand("insertOrderedList"); handleEditorInput(); }} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900" title="Numbered List"><ListOrdered size={15} /></button>

            <div className="h-4 w-px bg-gray-200 mx-1" />

            {/* Media buttons */}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setImageDialogOpen(true)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900"
              title="Insert Image"
            >
              <ImageIcon size={15} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setVideoDialogOpen(true)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900"
              title="Insert Video"
            >
              <Video size={15} />
            </button>
          </div>

          {/* ContentEditable Editor */}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleEditorInput}
            onMouseUp={saveSelection}
            onKeyUp={saveSelection}
            onFocus={saveSelection}
            className="min-h-[400px] bg-white border border-gray-200 rounded-xl p-5 shadow-sm text-base leading-relaxed focus:outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all prose prose-sm max-w-none article-content"
            style={{ wordWrap: "break-word" }}
          />
        </div>

        {/* Right Sidebar (Settings) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Post Information */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <FileText size={16} />
              Thông tin bài viết
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500">Danh mục</label>
              <select
                value={postForm.category || ""}
                onChange={(e) => onPostFormChange({ ...postForm, category: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500">Trạng thái</label>
              <select
                value={postForm.status || "Nháp"}
                onChange={(e) => onPostFormChange({ ...postForm, status: e.target.value as "Đã đăng" | "Nháp" })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white"
              >
                <option value="Đã đăng">Đã đăng</option>
                <option value="Nháp">Nháp</option>
              </select>
            </div>
          </div>

          {/* Cover Image */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <ImageIcon size={16} />
              Ảnh bìa
            </h3>

            {postCoverImage ? (
              <div className="relative group">
                <img
                  src={postCoverImage}
                  alt="Cover"
                  className="w-full h-36 object-cover rounded-xl border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => onPostCoverImageChange(null)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md transition-all opacity-0 group-hover:opacity-100"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div
                onClick={handleTriggerImageUpload}
                className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-[#E55956] hover:bg-[#E55956]/5 transition-all"
              >
                <Upload size={28} className="mx-auto text-gray-300 mb-2" />
                <p className="text-xs text-gray-500 font-medium">Nhấp để tải ảnh bìa</p>
              </div>
            )}
            <input
              id="cover-upload-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>
      </main>

      {/* Insert Image Dialog */}
      {imageDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setImageDialogOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 z-10 border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Chèn hình ảnh</h3>
              <button type="button" onClick={() => setImageDialogOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            {/* Tab buttons */}
            <div className="flex gap-1 p-1 bg-gray-50 rounded-xl mb-4 border border-gray-100">
              {(["link", "upload", "library"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setImageTab(tab)}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    imageTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab === "link" ? "Đường dẫn" : tab === "upload" ? "Tải lên" : "Thư viện"}
                </button>
              ))}
            </div>

            {imageTab === "link" && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">URL hình ảnh</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white"
                  />
                </div>
              </div>
            )}

            {imageTab === "upload" && (
              <div className="space-y-3">
                <div
                  onClick={handleTriggerInsertImageUpload}
                  className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-[#E55956] hover:bg-[#E55956]/5 transition-all"
                >
                  <Upload size={24} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-xs text-gray-500 font-medium">Nhấp để chọn file ảnh</p>
                </div>
                <input
                  id="insert-image-upload-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleInsertImageFileChange}
                />
                {imageFileName && (
                  <p className="text-xs text-gray-600 font-medium px-1">Đã chọn: {imageFileName}</p>
                )}
              </div>
            )}

            {imageTab === "library" && (
              <div className="p-4 bg-gray-50 rounded-xl text-center">
                <p className="text-xs text-gray-500">Tính năng thư viện đang được phát triển</p>
              </div>
            )}

            {/* Caption */}
            <div className="space-y-1 mt-3">
              <label className="text-xs font-semibold text-gray-500">Chú thích (tùy chọn)</label>
              <input
                type="text"
                value={imageCaption}
                onChange={(e) => setImageCaption(e.target.value)}
                placeholder="Nhập chú thích cho hình ảnh..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white"
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setImageDialogOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleInsertImage}
                className="px-4 py-2 text-sm font-bold bg-[#E55956] hover:bg-[#cb4643] text-white rounded-xl transition-all shadow-sm"
              >
                Chèn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Insert Video Dialog */}
      {videoDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setVideoDialogOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 z-10 border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Chèn video</h3>
              <button type="button" onClick={() => setVideoDialogOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            {/* Tab buttons */}
            <div className="flex gap-1 p-1 bg-gray-50 rounded-xl mb-4 border border-gray-100">
              {(["link", "upload", "library"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setVideoTab(tab)}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    videoTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab === "link" ? "Đường dẫn" : tab === "upload" ? "Tải lên" : "Thư viện"}
                </button>
              ))}
            </div>

            {videoTab === "link" && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">URL video (hỗ trợ YouTube, Vimeo, MP4...)</label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white"
                  />
                </div>
              </div>
            )}

            {videoTab === "upload" && (
              <div className="space-y-3">
                <div
                  onClick={handleTriggerVideoUpload}
                  className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-[#E55956] hover:bg-[#E55956]/5 transition-all"
                >
                  <Upload size={24} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-xs text-gray-500 font-medium">Nhấp để chọn file video</p>
                </div>
                <input
                  id="video-upload-input"
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleVideoFileChange}
                />
                {videoFileName && (
                  <p className="text-xs text-gray-600 font-medium px-1">Đã chọn: {videoFileName}</p>
                )}
              </div>
            )}

            {videoTab === "library" && (
              <div className="p-4 bg-gray-50 rounded-xl text-center">
                <p className="text-xs text-gray-500">Tính năng thư viện đang được phát triển</p>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setVideoDialogOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleInsertVideo}
                className="px-4 py-2 text-sm font-bold bg-[#E55956] hover:bg-[#cb4643] text-white rounded-xl transition-all shadow-sm"
              >
                Chèn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
