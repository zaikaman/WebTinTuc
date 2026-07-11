"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import {
  Loader2,
  Image as ImageIcon,
  ArrowLeft,
  Save,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Video,
  Upload,
  ChevronDown,
} from "lucide-react";
import {
  getAdminArticleById,
  createAdminArticle,
  updateAdminArticle,
  getAdminMedia,
  uploadAdminMedia,
} from "@/lib/api/adminClient";
import { htmlToBlocks, blocksToHtml } from "@/components/admin/AdminUtils";
import { toast } from "sonner";
import type { Post, MediaItem } from "@/components/admin/AdminTypes";

const ImageDialog = dynamic(() => import("@/components/admin/ImageDialog"), {
  ssr: false,
});
const VideoDialog = dynamic(() => import("@/components/admin/VideoDialog"), {
  ssr: false,
});
const CropDialog = dynamic(() => import("@/components/admin/CropDialog"), {
  ssr: false,
});

export type PostEditorViewProps = {
  mode: "add" | "edit";
  editId: number | null;
  categories: any[];
  categoryOptions: string[];
  onBack: () => void;
  onSaved: () => void;
};

export default function PostEditorView({
  mode,
  editId,
  categories,
  categoryOptions,
  onBack,
  onSaved,
}: PostEditorViewProps) {
  const [postCoverImage, setPostCoverImage] = useState<string | null>(null);
  const [postContent, setPostContent] = useState("");
  const [postForm, setPostForm] = useState<Partial<Post>>({
    title: "",
    category: categoryOptions[0] || "Công nghệ",
    views: 0,
    status: "Đã đăng",
    createdAt: new Date().toISOString().split("T")[0],
  });
  const [isPostSaving, setIsPostSaving] = useState(false);
  const [detailLoading, setDetailLoading] = useState(mode === "edit");

  const editorRef = useRef<HTMLDivElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);

  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [imageTab, setImageTab] = useState<"link" | "upload" | "library">("link");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageFileName, setImageFileName] = useState("");

  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [videoTab, setVideoTab] = useState<"link" | "upload" | "library">("link");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoFileName, setVideoFileName] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState("");
  const [cropImageElementId, setCropImageElementId] = useState("");
  const [cropArea, setCropArea] = useState({ x: 10, y: 10, width: 80, height: 80 });

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);

  // Keep latest callbacks without re-triggering the load effect
  const onBackRef = useRef(onBack);
  const onSavedRef = useRef(onSaved);
  useEffect(() => {
    onBackRef.current = onBack;
    onSavedRef.current = onSaved;
  }, [onBack, onSaved]);

  const loadMedia = useCallback(async () => {
    try {
      setMediaLoading(true);
      // Only list articles folder (non-recursive) for library picker speed
      const res = await getAdminMedia("articles/", false);
      if (res?.files) {
        setMediaItems(
          res.files.map((f: any, idx: number) => ({
            id: idx + 1,
            key: f.key,
            title: f.name,
            type: f.type,
            url: f.url,
            size: (f.size / 1024).toFixed(2) + " KB",
            createdAt: f.lastModified
              ? new Date(f.lastModified).toISOString().split("T")[0]
              : "",
            folder: "articles",
          }))
        );
      }
    } catch (err) {
      console.error("Error loading media:", err);
    } finally {
      setMediaLoading(false);
    }
  }, []);

  // Load article for edit — only re-run when mode/editId change.
  // No loading toast: UI already shows a full-page spinner (detailLoading).
  // Toast.loading was racing with React Strict Mode and stacking multiple toasts.
  useEffect(() => {
    if (mode !== "edit" || !editId) {
      setDetailLoading(false);
      return;
    }
    let cancelled = false;
    setDetailLoading(true);

    (async () => {
      try {
        const fullArticle = await getAdminArticleById(editId);
        if (cancelled) return;
        if (!fullArticle) throw new Error("Không thể tải thông tin");

        setPostForm({
          id: fullArticle.id,
          title: fullArticle.title,
          category: fullArticle.categories?.name || "Tin tức",
          views: fullArticle.views || 0,
          status: fullArticle.status === "published" ? "Đã đăng" : "Nháp",
          createdAt: fullArticle.created_at
            ? new Date(fullArticle.created_at).toISOString().split("T")[0]
            : "",
          coverImage: fullArticle.thumbnail_key || "",
          isDeleted: !!fullArticle.deleted_at,
        });

        const raw = fullArticle.content as any;
        const blocks = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.blocks)
            ? raw.blocks
            : null;
        setPostContent(blocks ? blocksToHtml(blocks) : typeof raw === "string" ? raw : "");
        setPostCoverImage(fullArticle.thumbnail_key || null);
      } catch (err: any) {
        if (cancelled) return;
        toast.error(err?.message || "Không thể tải thông tin chi tiết bài viết", {
          id: `load-article-error-${editId}`,
        });
        onBackRef.current();
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mode, editId]);

  // Draft restore (add mode only)
  useEffect(() => {
    if (mode !== "add") return;
    try {
      const savedView = localStorage.getItem("admin_editor_current_view");
      if (savedView === "editor") {
        const savedForm = localStorage.getItem("admin_editor_post_form");
        if (savedForm) setPostForm(JSON.parse(savedForm));
        const savedContent = localStorage.getItem("admin_editor_post_content");
        if (savedContent) setPostContent(savedContent);
        const savedCover = localStorage.getItem("admin_editor_post_cover_image");
        if (savedCover) setPostCoverImage(savedCover);
        toast.info("Đã khôi phục bản nháp bài viết đang viết dở!");
      }
    } catch {
      // ignore
    }
  }, [mode]);

  // Draft persist
  useEffect(() => {
    try {
      localStorage.setItem("admin_editor_current_view", "editor");
      localStorage.setItem("admin_editor_post_form", JSON.stringify(postForm));
      localStorage.setItem("admin_editor_post_content", postContent || "");
      if (postCoverImage) localStorage.setItem("admin_editor_post_cover_image", postCoverImage);
      else localStorage.removeItem("admin_editor_post_cover_image");
      localStorage.setItem("admin_editor_edit_id", editId !== null ? String(editId) : "null");
      localStorage.setItem("admin_editor_dialog_mode", mode);
    } catch {
      // ignore
    }
  }, [postForm, postContent, postCoverImage, editId, mode]);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== postContent) {
      editorRef.current.innerHTML = postContent;
    }
  }, [postContent, detailLoading]);

  const clearDraft = useCallback(() => {
    [
      "admin_editor_current_view",
      "admin_editor_post_form",
      "admin_editor_post_content",
      "admin_editor_post_cover_image",
      "admin_editor_edit_id",
      "admin_editor_dialog_mode",
    ].forEach((k) => localStorage.removeItem(k));
  }, []);

  const saveSelection = useCallback(() => {
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
      if (isInside) savedSelectionRef.current = range.cloneRange();
    }
  }, []);

  const restoreSelection = useCallback(() => {
    if (editorRef.current) editorRef.current.focus();
    if (savedSelectionRef.current && window.getSelection()) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedSelectionRef.current);
      }
    }
  }, []);

  const executeEditorCommand = useCallback(
    (command: string, value: string = "") => {
      restoreSelection();
      try {
        document.execCommand("styleWithCSS", false, "true");
      } catch {
        // ignore
      }
      document.execCommand(command, false, value);
      if (editorRef.current) setPostContent(editorRef.current.innerHTML);
      saveSelection();
    },
    [restoreSelection, saveSelection]
  );

  const handleFontFamilyChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const font = e.target.value;
      if (!font) return;
      setTimeout(() => executeEditorCommand("fontName", font), 0);
    },
    [executeEditorCommand]
  );

  const handleFontSizeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      if (!val) return;
      let size = "3";
      if (val === "12px") size = "1";
      else if (val === "14px") size = "2";
      else if (val === "16px") size = "3";
      else if (val === "18px") size = "4";
      else if (val === "20px") size = "5";
      else if (val === "24px") size = "6";
      setTimeout(() => executeEditorCommand("fontSize", size), 0);
    },
    [executeEditorCommand]
  );

  const handleSavePost = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!postForm.title?.trim()) {
        toast.error("Vui lòng nhập tiêu đề bài viết!");
        return;
      }
      try {
        setIsPostSaving(true);
        toast.loading(mode === "add" ? "Đang thêm bài viết..." : "Đang cập nhật...", {
          id: "post-submit",
        });
        const targetCategory = categories.find((c: any) => c.name === postForm.category);
        const payload = {
          title: postForm.title,
          category_id: targetCategory ? targetCategory.id : undefined,
          views: Number(postForm.views) || 0,
          status: postForm.status === "Đã đăng" ? "published" : "draft",
          thumbnail_key: postCoverImage,
          content: htmlToBlocks(postContent),
        };
        if (mode === "add") {
          await createAdminArticle(payload as any);
          toast.success("Thêm bài viết mới thành công!", { id: "post-submit" });
        } else if (editId) {
          await updateAdminArticle(editId, payload as any);
          toast.success("Cập nhật bài viết thành công!", { id: "post-submit" });
        }
        clearDraft();
        onSavedRef.current();
      } catch (err: any) {
        toast.error(err?.message || "Có lỗi xảy ra, vui lòng thử lại!", {
          id: "post-submit",
        });
      } finally {
        setIsPostSaving(false);
      }
    },
    [postForm, postContent, postCoverImage, mode, editId, categories, clearDraft]
  );

  const insertHtmlToEditor = useCallback((html: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const selection = window.getSelection();
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
    if (isInsideEditor && selection) {
      try {
        document.execCommand("insertHTML", false, html);
      } catch {
        editorRef.current.innerHTML += html;
      }
    } else {
      editorRef.current.innerHTML += html;
    }
    setPostContent(editorRef.current.innerHTML);
  }, []);

  const handleInsertImage = useCallback(async () => {
    let finalImageUrl = "";
    if (imageTab === "upload") {
      if (!imageFile) {
        toast.error("Vui lòng chọn file ảnh!");
        return;
      }
      toast.loading("Đang tải ảnh lên...", { id: "upload-image" });
      try {
        const fd = new FormData();
        fd.append("file", imageFile);
        fd.append("folder", "articles");
        const res = await uploadAdminMedia(fd);
        if (res?.url) {
          finalImageUrl = res.url;
          toast.success("Tải lên thành công!", { id: "upload-image" });
        } else throw new Error("No URL");
      } catch (err: any) {
        toast.error("Tải lên thất bại: " + (err.message || err), {
          id: "upload-image",
        });
        return;
      }
    } else {
      if (!imageUrl.trim()) {
        toast.error("Vui lòng nhập link ảnh!");
        return;
      }
      finalImageUrl = imageUrl.trim();
    }
    if (!finalImageUrl) {
      toast.error("Đường dẫn không hợp lệ!");
      return;
    }
    const wrapperId = "img-" + Math.random().toString(36).substring(2, 9);
    const imgHtml = `<p><br></p><div id="${wrapperId}" class="my-4 relative group" contenteditable="false" style="max-width:100%;margin:0 auto"><img src="${finalImageUrl}" alt="${imageCaption}" class="w-full rounded-xl border border-gray-200 shadow-sm" />${
      imageCaption
        ? `<p class="text-center text-xs italic text-gray-500 mt-1.5">${imageCaption}</p>`
        : ""
    }</div><p><br></p>`;
    insertHtmlToEditor(imgHtml);
    setImageDialogOpen(false);
    setImageUrl("");
    setImageCaption("");
    setImageFile(null);
    setImageFileName("");
  }, [imageTab, imageFile, imageUrl, imageCaption, insertHtmlToEditor]);

  const handleInsertVideo = useCallback(async () => {
    let videoHtml = "";
    if (videoTab === "upload") {
      if (!videoFile) {
        toast.error("Vui lòng chọn file video!");
        return;
      }
      toast.loading("Đang tải video lên...", { id: "upload-video" });
      try {
        const fd = new FormData();
        fd.append("file", videoFile);
        fd.append("folder", "articles");
        const res = await uploadAdminMedia(fd);
        if (res?.url) {
          videoHtml = `<p><br></p><div class="my-4 relative group" contenteditable="false" style="max-width:100%;margin:0 auto"><video controls src="${res.url}" class="w-full max-h-[400px] rounded-xl border border-gray-200 shadow-sm"></video></div><p><br></p>`;
          toast.success("Tải lên thành công!", { id: "upload-video" });
        } else throw new Error("No URL");
      } catch (err: any) {
        toast.error("Tải lên thất bại: " + (err.message || err), {
          id: "upload-video",
        });
        return;
      }
    } else {
      if (!videoUrl.trim()) {
        toast.error("Vui lòng nhập link video!");
        return;
      }
      const url = videoUrl.trim();
      if (url.includes("youtube.com/watch") || url.includes("youtu.be")) {
        let videoId = "";
        try {
          if (url.includes("youtube.com/watch"))
            videoId = new URLSearchParams(new URL(url).search).get("v") || "";
          else videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
        } catch {
          // ignore
        }
        videoHtml = videoId
          ? `<p><br></p><div class="my-4" contenteditable="false"><iframe class="w-full aspect-video rounded-xl" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe></div><p><br></p>`
          : `<p><br></p><div class="my-4" contenteditable="false"><iframe class="w-full aspect-video rounded-xl" src="${url}" frameborder="0" allowfullscreen></iframe></div><p><br></p>`;
      } else {
        videoHtml = `<p><br></p><div class="my-4" contenteditable="false"><video controls src="${url}" class="w-full max-h-[400px] rounded-xl"></video></div><p><br></p>`;
      }
      toast.success("Đã chèn video thành công!");
    }
    insertHtmlToEditor(videoHtml);
    setVideoDialogOpen(false);
    setVideoFile(null);
    setVideoFileName("");
    setVideoUrl("");
  }, [videoTab, videoFile, videoUrl, insertHtmlToEditor]);

  useEffect(() => {
    const handleCropEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setCropImageUrl(detail.src);
      setCropImageElementId(detail.id);
      setCropArea({ x: 10, y: 10, width: 80, height: 80 });
      setCropDialogOpen(true);
    };
    window.addEventListener("editor-crop-image", handleCropEvent);
    return () => window.removeEventListener("editor-crop-image", handleCropEvent);
  }, []);

  const handleBack = useCallback(() => {
    clearDraft();
    onBackRef.current();
  }, [clearDraft]);

  if (detailLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#E55956]" size={32} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 min-h-screen bg-[#fafbfc] text-[#2c3e50] font-sans antialiased flex flex-col animate-fade-in overflow-y-auto">
      <header className="h-[65px] bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-800 hover:text-gray-950 font-bold text-sm transition-all"
        >
          <ArrowLeft size={18} />
          <span>Quay lại</span>
        </button>
        <button
          type="button"
          onClick={handleSavePost}
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

      <main className="max-w-6xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="space-y-1.5 flex-shrink-0">
            <label className="text-sm font-bold text-gray-700">Tiêu đề bài viết</label>
            <input
              type="text"
              value={postForm.title || ""}
              onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
              placeholder="Nhập tiêu đề..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm font-medium"
              required
            />
          </div>

          <div className="flex flex-wrap items-center gap-1 bg-white border border-gray-200 rounded-xl p-1.5 shadow-sm text-gray-600 flex-shrink-0">
            <div className="relative">
              <select
                value=""
                onChange={handleFontFamilyChange}
                className="bg-transparent hover:bg-gray-100 px-2.5 py-1.5 rounded-lg text-xs font-semibold outline-none cursor-pointer appearance-none pr-6 border-none text-gray-700"
              >
                <option value="" disabled hidden>
                  Font chữ
                </option>
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Georgia">Georgia</option>
              </select>
              <ChevronDown
                size={12}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
            <div className="h-4 w-px bg-gray-200 mx-1" />
            <div className="relative">
              <select
                value=""
                onChange={handleFontSizeChange}
                className="bg-transparent hover:bg-gray-100 px-2.5 py-1.5 rounded-lg text-xs font-semibold outline-none cursor-pointer appearance-none pr-6 border-none text-gray-700"
              >
                <option value="" disabled hidden>
                  Cỡ chữ
                </option>
                <option value="12px">12px</option>
                <option value="14px">14px</option>
                <option value="16px">16px</option>
                <option value="18px">18px</option>
                <option value="20px">20px</option>
                <option value="24px">24px</option>
              </select>
              <ChevronDown
                size={12}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
            <div className="h-4 w-px bg-gray-200 mx-1" />
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => executeEditorCommand("bold")} className="p-1.5 hover:bg-gray-100 rounded-lg"><Bold size={15} /></button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => executeEditorCommand("italic")} className="p-1.5 hover:bg-gray-100 rounded-lg"><Italic size={15} /></button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => executeEditorCommand("underline")} className="p-1.5 hover:bg-gray-100 rounded-lg"><Underline size={15} /></button>
            <div className="h-4 w-px bg-gray-200 mx-1" />
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => executeEditorCommand("justifyLeft")} className="p-1.5 hover:bg-gray-100 rounded-lg"><AlignLeft size={15} /></button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => executeEditorCommand("justifyCenter")} className="p-1.5 hover:bg-gray-100 rounded-lg"><AlignCenter size={15} /></button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => executeEditorCommand("justifyRight")} className="p-1.5 hover:bg-gray-100 rounded-lg"><AlignRight size={15} /></button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => executeEditorCommand("justifyFull")} className="p-1.5 hover:bg-gray-100 rounded-lg"><AlignJustify size={15} /></button>
            <div className="h-4 w-px bg-gray-200 mx-1" />
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => executeEditorCommand("insertUnorderedList")} className="p-1.5 hover:bg-gray-100 rounded-lg"><List size={15} /></button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => executeEditorCommand("insertOrderedList")} className="p-1.5 hover:bg-gray-100 rounded-lg"><ListOrdered size={15} /></button>
            <div className="h-4 w-px bg-gray-200 mx-1" />
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { setImageDialogOpen(true); loadMedia(); }} className="p-1.5 hover:bg-gray-100 rounded-lg"><ImageIcon size={15} /></button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { setVideoDialogOpen(true); loadMedia(); }} className="p-1.5 hover:bg-gray-100 rounded-lg"><Video size={15} /></button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col min-h-[450px] overflow-y-auto">
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={(e) => setPostContent(e.currentTarget.innerHTML)}
              onMouseUp={saveSelection}
              onKeyUp={saveSelection}
              onFocus={saveSelection}
              className="w-full flex-1 outline-none text-sm leading-relaxed text-gray-800 bg-transparent border-none min-h-[400px] prose prose-sm max-w-none article-content"
            />
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-5 lg:sticky lg:top-[85px]">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4 flex-shrink-0">
            <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2.5">
              Thông tin bài viết
            </h3>
            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Danh mục
                </label>
                <div className="relative">
                  <select
                    value={postForm.category || ""}
                    onChange={(e) =>
                      setPostForm({ ...postForm, category: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-gray-50/50 appearance-none font-semibold text-gray-800"
                  >
                    {categoryOptions.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Trạng thái
                </label>
                <div className="relative">
                  <select
                    value={postForm.status || "Nháp"}
                    onChange={(e) =>
                      setPostForm({
                        ...postForm,
                        status: e.target.value as "Đã đăng" | "Nháp",
                      })
                    }
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-gray-50/50 appearance-none font-semibold text-gray-800"
                  >
                    <option value="Đã đăng">Đã đăng</option>
                    <option value="Nháp">Nháp</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2.5 flex-shrink-0">
              Ảnh bìa
            </h3>
            {postCoverImage ? (
              <div className="relative rounded-xl overflow-hidden border border-gray-200 group aspect-[16/10] w-full flex-shrink-0">
                <img
                  src={postCoverImage}
                  alt="Cover Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => setPostCoverImage(null)}
                    className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors shadow-md"
                  >
                    Xóa ảnh
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => document.getElementById("cover-upload-input")?.click()}
                className="border-2 border-dashed border-gray-200 hover:border-[#E55956] hover:bg-[#E55956]/5 transition-all rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer aspect-[16/10] w-full flex-shrink-0 group"
              >
                <Upload
                  size={24}
                  className="text-gray-400 group-hover:text-[#E55956] transition-colors"
                />
                <span className="text-xs font-bold text-gray-500 group-hover:text-[#E55956] transition-colors">
                  Tải ảnh bìa lên
                </span>
                <input
                  type="file"
                  id="cover-upload-input"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () =>
                        setPostCoverImage(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {imageDialogOpen && (
        <ImageDialog
          open={imageDialogOpen}
          onOpenChange={setImageDialogOpen}
          imageUrl={imageUrl}
          imageCaption={imageCaption}
          imageTab={imageTab}
          imageFile={imageFile}
          imageFileName={imageFileName}
          mediaItems={mediaItems}
          mediaLoading={mediaLoading}
          onUrlChange={setImageUrl}
          onCaptionChange={setImageCaption}
          onTabChange={setImageTab}
          onFileChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setImageFile(file);
              setImageFileName(file.name);
              setImageUrl("");
            }
          }}
          onTriggerFileUpload={() =>
            document.getElementById("insert-image-upload-input")?.click()
          }
          onInsert={handleInsertImage}
          onLoadMedia={loadMedia}
        />
      )}
      {videoDialogOpen && (
        <VideoDialog
          open={videoDialogOpen}
          onOpenChange={setVideoDialogOpen}
          videoUrl={videoUrl}
          videoTab={videoTab}
          videoFile={videoFile}
          videoFileName={videoFileName}
          mediaItems={mediaItems}
          mediaLoading={mediaLoading}
          onUrlChange={setVideoUrl}
          onTabChange={setVideoTab}
          onFileChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setVideoFile(file);
              setVideoFileName(file.name);
              setVideoUrl("");
            }
          }}
          onTriggerFileUpload={() =>
            document.getElementById("video-upload-input")?.click()
          }
          onInsert={handleInsertVideo}
          onLoadMedia={loadMedia}
        />
      )}
      {cropDialogOpen && (
        <CropDialog
          open={cropDialogOpen}
          onOpenChange={setCropDialogOpen}
          cropImageUrl={cropImageUrl}
          cropImageElementId={cropImageElementId}
          cropArea={cropArea}
          onCropAreaChange={setCropArea}
        />
      )}
    </div>
  );
}
