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

  const [fontMenuOpen, setFontMenuOpen] = useState(false);
  const [sizeMenuOpen, setSizeMenuOpen] = useState(false);
  const [editorStates, setEditorStates] = useState({
    isBold: false,
    isItalic: false,
    isUnderline: false,
    align: "left",
    fontFamily: "Font chữ",
    fontSize: "Cỡ chữ",
  });

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
      // Recursive articles/ listing so nested uploads appear in the editor library
      const res = await getAdminMedia("articles/", true);
      if (res?.files) {
        setMediaItems(
          res.files
            .filter((f: any) => f.type === "image" || f.type === "video")
            .map((f: any, idx: number) => ({
              id: idx + 1,
              key: f.key,
              title: f.name,
              type: f.type,
              url: f.url,
              size: (f.size / 1024).toFixed(2) + " KB",
              createdAt: f.lastModified
                ? new Date(f.lastModified).toISOString().split("T")[0]
                : "",
              folder: f.key?.includes("/")
                ? f.key.split("/").slice(0, -1).join("/")
                : "articles",
            }))
        );
      }
    } catch (err) {
      console.error("Error loading media:", err);
      toast.error("Không thể tải thư viện media");
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

  // Draft restore (add mode only) — once per browser session to avoid noisy remount toasts
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
        // Skip base64 drafts (legacy) — they bloat quota and are not valid CDN keys
        if (savedCover && !savedCover.startsWith("data:")) {
          setPostCoverImage(savedCover);
        }
        const toastKey = "admin_editor_draft_toast_shown";
        if (!sessionStorage.getItem(toastKey)) {
          sessionStorage.setItem(toastKey, "1");
          toast.info("Đã khôi phục bản nháp bài viết đang viết dở!");
        }
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

  const getElementsInRange = useCallback((range: Range): HTMLElement[] => {
    const elements: HTMLElement[] = [];
    if (!editorRef.current) return elements;

    if (range.collapsed) {
      let parent =
        range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
          ? (range.commonAncestorContainer as HTMLElement)
          : range.commonAncestorContainer.parentElement;
      if (parent && editorRef.current.contains(parent)) {
        elements.push(parent);
      }
      return elements;
    }

    const treeWalker = document.createTreeWalker(editorRef.current, NodeFilter.SHOW_ELEMENT, {
      acceptNode: (node) =>
        range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT,
    });

    let currentNode = treeWalker.nextNode() as HTMLElement | null;
    while (currentNode) {
      let hasTextChild = false;
      for (let j = 0; j < currentNode.childNodes.length; j++) {
        if (
          currentNode.childNodes[j].nodeType === Node.TEXT_NODE &&
          currentNode.childNodes[j].textContent?.trim()
        ) {
          hasTextChild = true;
          break;
        }
      }
      if (
        hasTextChild ||
        currentNode.tagName === "IMG" ||
        currentNode.tagName === "VIDEO" ||
        currentNode.tagName === "IFRAME"
      ) {
        elements.push(currentNode);
      }
      currentNode = treeWalker.nextNode() as HTMLElement | null;
    }

    if (elements.length === 0) {
      let parent =
        range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
          ? (range.commonAncestorContainer as HTMLElement)
          : range.commonAncestorContainer.parentElement;
      if (parent && editorRef.current.contains(parent)) {
        elements.push(parent);
      }
    }

    return elements;
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
      if (isInside) {
        savedSelectionRef.current = range.cloneRange();

        const isEmpty =
          !editorRef.current ||
          editorRef.current.innerHTML.trim() === "" ||
          editorRef.current.innerHTML === "<p><br></p>" ||
          editorRef.current.innerText.trim() === "";

        if (isEmpty) {
          setEditorStates({
            isBold: false,
            isItalic: false,
            isUnderline: false,
            align: "left",
            fontFamily: "Font chữ",
            fontSize: "Cỡ chữ",
          });
          try {
            document.execCommand("removeFormat", false, undefined);
          } catch {
            // ignore
          }
          return;
        }

        const selectedElements = getElementsInRange(range);
        const fontSizes = new Set<string>();
        const fontFamilies = new Set<string>();
        const alignments = new Set<string>();

        selectedElements.forEach((el) => {
          if (editorRef.current && editorRef.current.contains(el)) {
            try {
              const style = window.getComputedStyle(el);
              if (style.fontSize) fontSizes.add(style.fontSize);
              if (style.fontFamily) {
                const cleanFont = style.fontFamily.split(",")[0].replace(/['"]/g, "").trim();
                if (cleanFont) fontFamilies.add(cleanFont);
              }
              const ta = style.textAlign || "left";
              const cleanAlign = ta === "start" ? "left" : ta === "end" ? "right" : ta;
              alignments.add(cleanAlign);
            } catch {
              // ignore
            }
          }
        });

        setEditorStates({
          isBold: document.queryCommandState("bold"),
          isItalic: document.queryCommandState("italic"),
          isUnderline: document.queryCommandState("underline"),
          align: alignments.size === 1 ? Array.from(alignments)[0] : "left",
          fontFamily: fontFamilies.size === 1 ? Array.from(fontFamilies)[0] : "Font chữ",
          fontSize: fontSizes.size === 1 ? Array.from(fontSizes)[0] : "Cỡ chữ",
        });
      }
    }
  }, [getElementsInRange]);

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

  const applyFontFamily = useCallback(
    (font: string) => {
      restoreSelection();
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        setFontMenuOpen(false);
        return;
      }
      const range = selection.getRangeAt(0);

      if (range.collapsed) {
        const span = document.createElement("span");
        span.style.fontFamily = font;
        span.innerHTML = "&#8203;";
        range.insertNode(span);
        const newRange = document.createRange();
        if (span.firstChild) {
          newRange.setStart(span.firstChild, 1);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
          savedSelectionRef.current = newRange.cloneRange();
        }
        if (editorRef.current) setPostContent(editorRef.current.innerHTML);
      } else {
        try {
          document.execCommand("styleWithCSS", false, "false");
        } catch {
          // ignore
        }
        document.execCommand("fontName", false, "tempfontfamily");
        if (editorRef.current) {
          const fontElements = editorRef.current.querySelectorAll("font[face='tempfontfamily']");
          const spans: HTMLSpanElement[] = [];
          fontElements.forEach((fontEl) => {
            const span = document.createElement("span");
            span.style.fontFamily = font;
            span.innerHTML = fontEl.innerHTML;
            fontEl.parentNode?.replaceChild(span, fontEl);
            spans.push(span);
          });
          if (spans.length > 0) {
            const newRange = document.createRange();
            newRange.setStartBefore(spans[0]);
            newRange.setEndAfter(spans[spans.length - 1]);
            selection.removeAllRanges();
            selection.addRange(newRange);
            savedSelectionRef.current = newRange.cloneRange();
          }
          setPostContent(editorRef.current.innerHTML);
        }
      }
      saveSelection();
      setFontMenuOpen(false);
      setEditorStates((s) => ({ ...s, fontFamily: font }));
    },
    [restoreSelection, saveSelection]
  );

  const applyFontSize = useCallback(
    (val: string) => {
      restoreSelection();
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        setSizeMenuOpen(false);
        return;
      }
      const range = selection.getRangeAt(0);

      if (range.collapsed) {
        const span = document.createElement("span");
        span.style.fontSize = val;
        span.innerHTML = "&#8203;";
        range.insertNode(span);
        const newRange = document.createRange();
        if (span.firstChild) {
          newRange.setStart(span.firstChild, 1);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
          savedSelectionRef.current = newRange.cloneRange();
        }
        if (editorRef.current) setPostContent(editorRef.current.innerHTML);
      } else {
        try {
          document.execCommand("styleWithCSS", false, "false");
        } catch {
          // ignore
        }
        document.execCommand("fontSize", false, "7");
        if (editorRef.current) {
          const fontElements = editorRef.current.querySelectorAll("font[size='7']");
          const spans: HTMLSpanElement[] = [];
          fontElements.forEach((fontEl) => {
            const span = document.createElement("span");
            span.style.fontSize = val;
            span.innerHTML = fontEl.innerHTML;
            fontEl.parentNode?.replaceChild(span, fontEl);
            spans.push(span);
          });
          if (spans.length > 0) {
            const newRange = document.createRange();
            newRange.setStartBefore(spans[0]);
            newRange.setEndAfter(spans[spans.length - 1]);
            selection.removeAllRanges();
            selection.addRange(newRange);
            savedSelectionRef.current = newRange.cloneRange();
          }
          setPostContent(editorRef.current.innerHTML);
        }
      }
      saveSelection();
      setSizeMenuOpen(false);
      setEditorStates((s) => ({ ...s, fontSize: val }));
    },
    [restoreSelection, saveSelection]
  );

  // Close font/size menus when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".font-dropdown") && !target.closest(".size-dropdown")) {
        setFontMenuOpen(false);
        setSizeMenuOpen(false);
      }
    };
    window.addEventListener("mousedown", handleOutsideClick);
    return () => window.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSavePost = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const title = postForm.title?.trim() || "";
      if (!title) {
        toast.error("Vui lòng nhập tiêu đề bài viết!");
        return;
      }
      if (title.length < 5) {
        toast.error("Tiêu đề bài viết phải có ít nhất 5 ký tự!");
        return;
      }
      if (title.length > 255) {
        toast.error("Tiêu đề bài viết không được vượt quá 255 ký tự!");
        return;
      }
      // Never persist base64 data URLs as thumbnail_key
      if (postCoverImage?.startsWith("data:")) {
        toast.error("Ảnh bìa chưa được tải lên. Vui lòng chọn lại ảnh bìa!");
        return;
      }
      try {
        setIsPostSaving(true);
        toast.loading(mode === "add" ? "Đang thêm bài viết..." : "Đang cập nhật...", {
          id: "post-submit",
        });
        const targetCategory = categories.find((c: any) => c.name === postForm.category);
        const payload = {
          title,
          category_id: targetCategory ? targetCategory.id : undefined,
          views: Number(postForm.views) || 0,
          status: postForm.status === "Đã đăng" ? "published" : "draft",
          thumbnail_key: postCoverImage || null,
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

  /**
   * Insert HTML into the contenteditable without execCommand('insertHTML').
   * Browsers sanitize insertHTML and strip data/event attributes used by the
   * media resize toolbar — matching the working path from commit 0523987 that
   * relied on innerHTML assignment for full toolbar markup.
   */
  const insertHtmlToEditor = useCallback((html: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    const selection = window.getSelection();
    let range: Range | null = null;
    if (selection && selection.rangeCount > 0) {
      const candidate = selection.getRangeAt(0);
      let node: Node | null = candidate.commonAncestorContainer;
      while (node) {
        if (node === editorRef.current) {
          range = candidate;
          break;
        }
        node = node.parentNode;
      }
    }

    const template = document.createElement("template");
    template.innerHTML = html;
    const fragment = template.content;

    if (range && selection) {
      range.deleteContents();
      range.insertNode(fragment);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      editorRef.current.appendChild(fragment);
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
    } else if (imageTab === "link") {
      // External URL: download via admin proxy then store on R2 so resize/crop work reliably
      const rawUrl = imageUrl.trim();
      if (!rawUrl) {
        toast.error("Vui lòng nhập link ảnh!");
        return;
      }
      if (!/^https?:\/\//i.test(rawUrl)) {
        toast.error("Link ảnh phải bắt đầu bằng http:// hoặc https://");
        return;
      }

      // Already on our R2 — no need to re-upload
      const r2Public =
        process.env.NEXT_PUBLIC_R2_PUBLIC_URL || process.env.R2_PUBLIC_URL || "";
      if (r2Public && rawUrl.startsWith(r2Public.replace(/\/$/, ""))) {
        finalImageUrl = rawUrl;
      } else {
        toast.loading("Đang tải ảnh từ link và lưu lên R2...", {
          id: "upload-image",
        });
        try {
          const proxyRes = await fetch(
            `/api/admin/proxy-image?url=${encodeURIComponent(rawUrl)}`
          );
          if (!proxyRes.ok) {
            throw new Error(
              "Không thể tải ảnh từ link (có thể bị chặn hoặc link không hợp lệ)"
            );
          }
          const blob = await proxyRes.blob();
          const contentType = blob.type || "image/jpeg";
          if (!contentType.startsWith("image/")) {
            throw new Error("Link không trỏ tới file ảnh hợp lệ");
          }
          const extMap: Record<string, string> = {
            "image/jpeg": "jpg",
            "image/jpg": "jpg",
            "image/png": "png",
            "image/webp": "webp",
            "image/gif": "gif",
            "image/svg+xml": "svg",
            "image/avif": "avif",
          };
          const ext =
            extMap[contentType] ||
            rawUrl.split("?")[0].split(".").pop()?.toLowerCase() ||
            "jpg";
          const safeExt = /^[a-z0-9]{2,5}$/i.test(ext) ? ext : "jpg";
          const file = new File(
            [blob],
            `link-${Date.now()}.${safeExt}`,
            { type: contentType }
          );
          const fd = new FormData();
          fd.append("file", file);
          fd.append("folder", "articles");
          const res = await uploadAdminMedia(fd);
          if (!res?.url) throw new Error("No URL");
          finalImageUrl = res.url;
          toast.success("Đã lưu ảnh lên R2!", { id: "upload-image" });
        } catch (err: any) {
          toast.error("Lưu ảnh từ link thất bại: " + (err.message || err), {
            id: "upload-image",
          });
          return;
        }
      }
    } else {
      // library — already on R2
      if (!imageUrl.trim()) {
        toast.error("Vui lòng chọn ảnh từ thư viện!");
        return;
      }
      finalImageUrl = imageUrl.trim();
    }

    if (!finalImageUrl) {
      toast.error("Đường dẫn không hợp lệ!");
      return;
    }

    // Use blocksToHtml so resize (25/50/75/100%) + crop toolbar are present immediately
    const wrapperId = "img-" + Math.random().toString(36).substring(2, 9);
    const imgHtml =
      "<p><br></p>" +
      blocksToHtml([
        {
          type: "image",
          src: finalImageUrl,
          caption: imageCaption,
          width: "100%",
          id: wrapperId,
        },
      ]);
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
          // blocksToHtml adds resize toolbar for video blocks
          videoHtml =
            "<p><br></p>" +
            blocksToHtml([{ type: "video", src: res.url, width: "100%" }]);
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
        const embedSrc = videoId
          ? `https://www.youtube.com/embed/${videoId}`
          : url;
        videoHtml =
          "<p><br></p>" +
          blocksToHtml([{ type: "iframe", src: embedSrc, width: "100%" }]);
      } else {
        videoHtml =
          "<p><br></p>" +
          blocksToHtml([{ type: "video", src: url, width: "100%" }]);
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

  /**
   * Media toolbar (25/50/75/100%, delete, crop) — event delegation on the editor.
   * Inline onclick from commit 0523987 is stripped by execCommand('insertHTML')
   * and unreliable under CSP; data-editor-action attrs restore apply-frame-resize.
   */
  const handleEditorToolbarClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const editor = editorRef.current;
    if (!editor) return;

    const target = e.target as HTMLElement | null;
    if (!target) return;

    const actionEl = target.closest("[data-editor-action]") as HTMLElement | null;
    if (!actionEl || !editor.contains(actionEl)) return;

    const action = actionEl.getAttribute("data-editor-action");
    if (!action) return;

    const media =
      (actionEl.closest("[data-editor-media]") as HTMLElement | null) ||
      (actionEl.closest('[contenteditable="false"]') as HTMLElement | null);
    if (!media || !editor.contains(media)) return;

    e.preventDefault();
    e.stopPropagation();

    if (action === "resize") {
      const width = actionEl.getAttribute("data-width") || "100%";
      media.style.maxWidth = width;
      // Keep margin: 0 auto so resized media stays centered (same as blocksToHtml).
      if (!media.style.margin && !media.style.marginLeft) {
        media.style.margin = "0 auto";
      }
      setPostContent(editor.innerHTML);
      return;
    }

    if (action === "delete") {
      media.remove();
      setPostContent(editor.innerHTML);
      return;
    }

    if (action === "crop") {
      const img = media.querySelector("img");
      if (!img) return;
      if (!media.id) {
        media.id = "img-" + Math.random().toString(36).substring(2, 9);
      }
      window.dispatchEvent(
        new CustomEvent("editor-crop-image", {
          detail: { src: img.src, id: media.id },
        })
      );
    }
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

          <div className="sticky top-[65px] z-20 flex flex-wrap items-center gap-1 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-1.5 shadow-md text-gray-600 flex-shrink-0 transition-all">
            <div className="relative font-dropdown">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setFontMenuOpen(!fontMenuOpen);
                  setSizeMenuOpen(false);
                }}
                className="flex items-center gap-1 bg-transparent hover:bg-gray-100 px-2.5 py-1.5 rounded-lg text-xs font-semibold outline-none cursor-pointer border-none text-gray-700 select-none min-w-[110px] justify-between"
              >
                <span>{editorStates.fontFamily}</span>
                <ChevronDown size={12} className="text-gray-400" />
              </button>
              {fontMenuOpen && (
                <div
                  onMouseDown={(e) => e.preventDefault()}
                  className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-40 min-w-[150px]"
                >
                  {["Arial", "Times New Roman", "Helvetica", "Georgia", "Courier New", "Verdana"].map(
                    (font) => (
                      <button
                        key={font}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => applyFontFamily(font)}
                        className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors block ${
                          editorStates.fontFamily === font
                            ? "text-[#E55956] font-bold"
                            : "text-gray-700"
                        }`}
                        style={{ fontFamily: font }}
                      >
                        {font}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
            <div className="h-4 w-px bg-gray-200 mx-1" />
            <div className="relative size-dropdown">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setSizeMenuOpen(!sizeMenuOpen);
                  setFontMenuOpen(false);
                }}
                className="flex items-center gap-1 bg-transparent hover:bg-gray-100 px-2.5 py-1.5 rounded-lg text-xs font-semibold outline-none cursor-pointer border-none text-gray-700 select-none min-w-[80px] justify-between"
              >
                <span>{editorStates.fontSize}</span>
                <ChevronDown size={12} className="text-gray-400" />
              </button>
              {sizeMenuOpen && (
                <div
                  onMouseDown={(e) => e.preventDefault()}
                  className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-40 min-w-[100px]"
                >
                  {["12px", "14px", "16px", "18px", "20px", "24px", "32px"].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => applyFontSize(size)}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors block ${
                        editorStates.fontSize === size
                          ? "text-[#E55956] font-bold"
                          : "text-gray-700"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="h-4 w-px bg-gray-200 mx-1" />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeEditorCommand("bold")}
              className={`p-1.5 rounded-lg transition-colors ${
                editorStates.isBold
                  ? "bg-gray-100 text-gray-900 font-bold"
                  : "hover:bg-gray-100 text-gray-700 hover:text-gray-900"
              }`}
              title="Chữ đậm"
            >
              <Bold size={15} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeEditorCommand("italic")}
              className={`p-1.5 rounded-lg transition-colors ${
                editorStates.isItalic
                  ? "bg-gray-100 text-gray-900 font-bold"
                  : "hover:bg-gray-100 text-gray-700 hover:text-gray-900"
              }`}
              title="Chữ nghiêng"
            >
              <Italic size={15} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeEditorCommand("underline")}
              className={`p-1.5 rounded-lg transition-colors ${
                editorStates.isUnderline
                  ? "bg-gray-100 text-gray-900 font-bold"
                  : "hover:bg-gray-100 text-gray-700 hover:text-gray-900"
              }`}
              title="Gạch chân"
            >
              <Underline size={15} />
            </button>
            <div className="h-4 w-px bg-gray-200 mx-1" />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeEditorCommand("justifyLeft")}
              className={`p-1.5 rounded-lg transition-colors ${
                editorStates.align === "left" || editorStates.align === "start"
                  ? "bg-gray-100 text-gray-900 font-bold"
                  : "hover:bg-gray-100 text-gray-700 hover:text-gray-900"
              }`}
              title="Căn lề trái"
            >
              <AlignLeft size={15} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeEditorCommand("justifyCenter")}
              className={`p-1.5 rounded-lg transition-colors ${
                editorStates.align === "center"
                  ? "bg-gray-100 text-gray-900 font-bold"
                  : "hover:bg-gray-100 text-gray-700 hover:text-gray-900"
              }`}
              title="Căn lề giữa"
            >
              <AlignCenter size={15} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeEditorCommand("justifyRight")}
              className={`p-1.5 rounded-lg transition-colors ${
                editorStates.align === "right" || editorStates.align === "end"
                  ? "bg-gray-100 text-gray-900 font-bold"
                  : "hover:bg-gray-100 text-gray-700 hover:text-gray-900"
              }`}
              title="Căn lề phải"
            >
              <AlignRight size={15} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeEditorCommand("justifyFull")}
              className={`p-1.5 rounded-lg transition-colors ${
                editorStates.align === "justify"
                  ? "bg-gray-100 text-gray-900 font-bold"
                  : "hover:bg-gray-100 text-gray-700 hover:text-gray-900"
              }`}
              title="Căn lề đều"
            >
              <AlignJustify size={15} />
            </button>
            <div className="h-4 w-px bg-gray-200 mx-1" />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeEditorCommand("insertUnorderedList")}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900 text-gray-700"
              title="Danh sách không thứ tự"
            >
              <List size={15} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeEditorCommand("insertOrderedList")}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900 text-gray-700"
              title="Danh sách có thứ tự"
            >
              <ListOrdered size={15} />
            </button>
            <div className="h-4 w-px bg-gray-200 mx-1" />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setImageDialogOpen(true);
                loadMedia();
              }}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900 text-gray-700"
              title="Chèn ảnh"
            >
              <ImageIcon size={15} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setVideoDialogOpen(true);
                loadMedia();
              }}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900 text-gray-700"
              title="Chèn video"
            >
              <Video size={15} />
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col min-h-[450px] overflow-y-auto">
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={(e) => setPostContent(e.currentTarget.innerHTML)}
              onClick={handleEditorToolbarClick}
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
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file) return;
                    if (!file.type.startsWith("image/")) {
                      toast.error("Vui lòng chọn file ảnh hợp lệ!");
                      return;
                    }
                    toast.loading("Đang tải ảnh bìa lên...", { id: "cover-upload" });
                    try {
                      const fd = new FormData();
                      fd.append("file", file);
                      fd.append("folder", "articles");
                      const res = await uploadAdminMedia(fd);
                      if (res?.url) {
                        setPostCoverImage(res.url);
                        toast.success("Tải ảnh bìa thành công!", { id: "cover-upload" });
                      } else {
                        throw new Error("Không nhận được URL từ server");
                      }
                    } catch (err: any) {
                      toast.error("Tải ảnh bìa thất bại: " + (err?.message || err), {
                        id: "cover-upload",
                      });
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
