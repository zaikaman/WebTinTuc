"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Menu, LayoutDashboard, LogOut, Loader2, Image as ImageIcon,
  ArrowLeft, Save, Bold, Italic, Underline,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Video, Upload, ChevronDown,
} from "lucide-react";
import {
  getAdminArticles, getAdminArticleById, createAdminArticle,
  updateAdminArticle, deleteAdminArticle, getAdminCategories,
  getAdminMedia, uploadAdminMedia,
} from "@/lib/api/adminClient";
import { htmlToBlocks, blocksToHtml, formatDateForDisplay } from "@/components/admin/AdminUtils";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminLogin from "@/components/admin/AdminLogin";
import DefaultTab from "@/components/admin/DefaultTab";
import DeleteConfirmDialog from "@/components/admin/DeleteConfirmDialog";
import ImageDialog from "@/components/admin/ImageDialog";
import VideoDialog from "@/components/admin/VideoDialog";
import CropDialog from "@/components/admin/CropDialog";
import LogoutDialog from "@/components/admin/LogoutDialog";
import { useAdminAuth } from "@/lib/hooks/useAdminAuth";
import { useSiteSettings } from "@/lib/hooks/useSiteSettings";
import { toast } from "sonner";
import type { TabType, Post, MediaItem } from "@/components/admin/AdminTypes";

const itemsPerPage = 6;

export default function PostsPage() {
  const router = useRouter();
  const auth = useAdminAuth();
  const siteSettings = useSiteSettings();

  useEffect(() => {
    if (!auth.isAuthVerified) return;
    if (!auth.isLoggedIn) router.replace("/admin");
  }, [auth.isAuthVerified, auth.isLoggedIn, router]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  // --- List View State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [postCategoryFilter, setPostCategoryFilter] = useState("all");
  const [postStartDate, setPostStartDate] = useState("");
  const [postEndDate, setPostEndDate] = useState("");
  const [hideDeletedPosts, setHideDeletedPosts] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsPage, setPostsPage] = useState(1);
  const [categories, setCategories] = useState<any[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [targetIdToDelete, setTargetIdToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- Editor View State ---
  const [currentView, setCurrentView] = useState<"list" | "editor">("list");
  const [postCoverImage, setPostCoverImage] = useState<string | null>(null);
  const [postContent, setPostContent] = useState("");
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [editId, setEditId] = useState<number | null>(null);
  const [postForm, setPostForm] = useState<Partial<Post>>({
    title: "", category: "Công nghệ", views: 0, status: "Đã đăng",
    createdAt: new Date().toISOString().split("T")[0],
  });
  const [isPostSaving, setIsPostSaving] = useState(false);

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

  const editorRef = useRef<HTMLDivElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);

  // --- Editor Modal States ---
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

  // --- Media (used by ImageDialog/VideoDialog library tab) ---
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);

  const loadMedia = useCallback(async () => {
    try {
      setMediaLoading(true);
      const res = await getAdminMedia("", true);
      if (res && res.files) {
        setMediaItems(
          res.files.map((f: any, idx: number) => ({
            id: idx + 1, key: f.key, title: f.name, type: f.type,
            url: f.url, size: (f.size / 1024).toFixed(2) + " KB",
            createdAt: f.lastModified ? new Date(f.lastModified).toISOString().split("T")[0] : "",
            folder: f.key.includes("/") ? f.key.split("/")[0] : "",
          }))
        );
      }
    } catch (err) {
      console.error("Error loading media:", err);
    } finally {
      setMediaLoading(false);
    }
  }, []);

  // --- Data Loading ---
  const loadPosts = useCallback(async () => {
    try {
      setPostsLoading(true);
      const res = await getAdminArticles("?limit=200&includeDeleted=true");
      if (res && res.items) {
        setPosts(
          res.items.map((a: any) => ({
            id: a.id, title: a.title, category: a.categories?.name || "Tin tức",
            views: a.views || 0, status: a.status === "published" ? "Đã đăng" : "Nháp",
            createdAt: a.created_at ? new Date(a.created_at).toISOString().split("T")[0] : "",
            content: "", coverImage: a.thumbnail_key || "", isDeleted: !!a.deleted_at,
          }))
        );
      }
    } catch (err: any) {
      toast.error(err?.message || "Không thể tải danh sách bài viết");
    } finally {
      setPostsLoading(false);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const res = await getAdminCategories("?limit=100");
      if (res && res.items) setCategories(res.items);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (auth.isLoggedIn && auth.isAuthVerified) {
      loadPosts();
      loadCategories();
    }
  }, [auth.isLoggedIn, auth.isAuthVerified, loadPosts, loadCategories]);

  // --- Category Options ---
  const categoryOptions = useMemo(
    () => Array.from(new Set(categories.map((c: any) => c.name))),
    [categories]
  );

  // --- Filtered & Paginated Posts ---
  const filteredPosts = useMemo(
    () =>
      posts.filter((post) => {
        if (hideDeletedPosts && post.isDeleted) return false;
        const matchesSearch =
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.id.toString() === searchQuery;
        const matchesCategory =
          postCategoryFilter === "all" || post.category === postCategoryFilter;
        let matchesDates = true;
        if (postStartDate) matchesDates = matchesDates && post.createdAt >= postStartDate;
        if (postEndDate) matchesDates = matchesDates && post.createdAt <= postEndDate;
        return matchesSearch && matchesCategory && matchesDates;
      }),
    [posts, searchQuery, postCategoryFilter, postStartDate, postEndDate, hideDeletedPosts]
  );

  const paginatedPosts = useMemo(() => {
    const start = (postsPage - 1) * itemsPerPage;
    return filteredPosts.slice(start, start + itemsPerPage);
  }, [filteredPosts, postsPage]);

  const postsTotalPages = Math.ceil(filteredPosts.length / itemsPerPage) || 1;

  // --- List View Handlers ---
  const handleOpenAddDialog = useCallback(() => {
    setDialogMode("add");
    setEditId(null);
    setPostForm({
      title: "", category: categoryOptions[0] || "Tin tức", views: 0, status: "Nháp",
      createdAt: new Date().toISOString().split("T")[0],
    });
    setPostContent("");
    setPostCoverImage(null);
    setCurrentView("editor");
  }, [categoryOptions]);

  const handleOpenEditDialog = useCallback(
    async (item: Post) => {
      setDialogMode("edit");
      setEditId(item.id);
      const toastId = toast.loading("Đang tải chi tiết bài viết...");
      try {
        const fullArticle = await getAdminArticleById(item.id);
        if (!fullArticle) throw new Error("Không thể tải thông tin");
        setPostForm({
          id: fullArticle.id, title: fullArticle.title,
          category: fullArticle.categories?.name || "Tin tức",
          views: fullArticle.views || 0,
          status: fullArticle.status === "published" ? "Đã đăng" : "Nháp",
          createdAt: fullArticle.created_at
            ? new Date(fullArticle.created_at).toISOString().split("T")[0]
            : "",
          coverImage: fullArticle.thumbnail_key || "",
          isDeleted: !!fullArticle.deleted_at,
        });
        setPostContent(fullArticle.content ? blocksToHtml(fullArticle.content as any) : "");
        setPostCoverImage(fullArticle.thumbnail_key || null);
        setCurrentView("editor");
        toast.dismiss(toastId);
      } catch (err: any) {
        toast.error(err?.message || "Không thể tải thông tin chi tiết bài viết", { id: toastId });
      }
    },
    []
  );

  const handleConfirmDelete = useCallback((id: number) => {
    setTargetIdToDelete(id);
    setDeleteConfirmOpen(true);
  }, []);

  const executeDelete = useCallback(async () => {
    if (targetIdToDelete === null) return;
    setDeleteConfirmOpen(false);
    try {
      setIsDeleting(true);
      await deleteAdminArticle(targetIdToDelete);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === targetIdToDelete ? { ...p, isDeleted: true } : p
        )
      );
      toast.success("Xóa bài viết thành công!");
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi xóa!");
    } finally {
      setIsDeleting(false);
      setTargetIdToDelete(null);
    }
  }, [targetIdToDelete]);

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setPostCategoryFilter("all");
    setPostStartDate("");
    setPostEndDate("");
  }, []);

  // Helper to get all leaf elements in range
  const getElementsInRange = useCallback((range: Range): HTMLElement[] => {
    const elements: HTMLElement[] = [];
    if (!editorRef.current) return elements;

    if (range.collapsed) {
      let parent = range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
        ? (range.commonAncestorContainer as HTMLElement)
        : range.commonAncestorContainer.parentElement;
      if (parent && editorRef.current.contains(parent)) {
        elements.push(parent);
      }
      return elements;
    }

    const treeWalker = document.createTreeWalker(
      editorRef.current,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node) => {
          if (range.intersectsNode(node)) {
            return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_REJECT;
        }
      }
    );

    let currentNode = treeWalker.nextNode() as HTMLElement | null;
    while (currentNode) {
      let hasTextChild = false;
      for (let j = 0; j < currentNode.childNodes.length; j++) {
        if (currentNode.childNodes[j].nodeType === Node.TEXT_NODE && currentNode.childNodes[j].textContent?.trim()) {
          hasTextChild = true;
          break;
        }
      }
      if (hasTextChild || currentNode.tagName === "IMG" || currentNode.tagName === "VIDEO" || currentNode.tagName === "IFRAME") {
        elements.push(currentNode);
      }
      currentNode = treeWalker.nextNode() as HTMLElement | null;
    }

    if (elements.length === 0) {
      let parent = range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
        ? (range.commonAncestorContainer as HTMLElement)
        : range.commonAncestorContainer.parentElement;
      if (parent && editorRef.current.contains(parent)) {
        elements.push(parent);
      }
    }

    return elements;
  }, []);

  // --- Editor Selection ---
  const saveSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      let node: Node | null = range.commonAncestorContainer;
      let isInside = false;
      while (node) {
        if (node === editorRef.current) { isInside = true; break; }
        node = node.parentNode;
      }
      if (isInside) {
        savedSelectionRef.current = range.cloneRange();

        // Check if editor is completely empty
        const isEmpty = !editorRef.current || 
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
          } catch {}
          return;
        }

        // Detect current formatting states
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
            } catch (e) {}
          }
        });

        const alignVal = alignments.size === 1 ? Array.from(alignments)[0] : "left";
        const fontFamilyVal = fontFamilies.size === 1 ? Array.from(fontFamilies)[0] : "Font chữ";
        const fontSizeVal = fontSizes.size === 1 ? Array.from(fontSizes)[0] : "Cỡ chữ";

        setEditorStates({
          isBold: document.queryCommandState("bold"),
          isItalic: document.queryCommandState("italic"),
          isUnderline: document.queryCommandState("underline"),
          align: alignVal,
          fontFamily: fontFamilyVal,
          fontSize: fontSizeVal,
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
      try { document.execCommand("styleWithCSS", false, "true"); } catch { /* ignore */ }
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
        // Case 1: No selection, just caret. Create an empty span with zero-width space to hold style.
        const span = document.createElement("span");
        span.style.fontFamily = font;
        span.innerHTML = "&#8203;"; // Zero-width space
        range.insertNode(span);

        // Place caret inside span, after the zero-width space
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
        // Case 2: Text is selected
        try { document.execCommand("styleWithCSS", false, "false"); } catch { /* ignore */ }
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
        // Case 1: No selection, just caret. Create an empty span with zero-width space to hold style.
        const span = document.createElement("span");
        span.style.fontSize = val;
        span.innerHTML = "&#8203;"; // Zero-width space
        range.insertNode(span);

        // Place caret inside span, after the zero-width space
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
        // Case 2: Text is selected
        try { document.execCommand("styleWithCSS", false, "false"); } catch { /* ignore */ }
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
    },
    [restoreSelection, saveSelection]
  );

  // Sync editor content
  useEffect(() => {
    if (editorRef.current && currentView === "editor") {
      if (editorRef.current.innerHTML !== postContent) {
        editorRef.current.innerHTML = postContent;
      }
    }
  }, [currentView, postContent]);

  // Close dropdowns on outside click
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

  // --- Draft auto-save/restore ---
  useEffect(() => {
    try {
      const savedView = localStorage.getItem("admin_editor_current_view");
      if (savedView === "editor") {
        setCurrentView("editor");
        const savedForm = localStorage.getItem("admin_editor_post_form");
        if (savedForm) setPostForm(JSON.parse(savedForm));
        const savedContent = localStorage.getItem("admin_editor_post_content");
        if (savedContent) setPostContent(savedContent);
        const savedCover = localStorage.getItem("admin_editor_post_cover_image");
        if (savedCover) setPostCoverImage(savedCover);
        const savedEditId = localStorage.getItem("admin_editor_edit_id");
        if (savedEditId && savedEditId !== "null" && savedEditId !== "undefined")
          setEditId(Number(savedEditId));
        const savedMode = localStorage.getItem("admin_editor_dialog_mode");
        if (savedMode) setDialogMode(savedMode as "add" | "edit");
        toast.info("Đã khôi phục bản nháp bài viết đang viết dở!");
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try {
      if (currentView === "editor") {
        localStorage.setItem("admin_editor_current_view", "editor");
        localStorage.setItem("admin_editor_post_form", JSON.stringify(postForm));
        localStorage.setItem("admin_editor_post_content", postContent || "");
        if (postCoverImage) localStorage.setItem("admin_editor_post_cover_image", postCoverImage);
        else localStorage.removeItem("admin_editor_post_cover_image");
        localStorage.setItem("admin_editor_edit_id", editId !== null ? String(editId) : "null");
        localStorage.setItem("admin_editor_dialog_mode", dialogMode);
      } else {
        ["admin_editor_current_view", "admin_editor_post_form", "admin_editor_post_content",
         "admin_editor_post_cover_image", "admin_editor_edit_id", "admin_editor_dialog_mode"]
          .forEach((k) => localStorage.removeItem(k));
      }
    } catch { /* ignore */ }
  }, [currentView, postForm, postContent, postCoverImage, editId, dialogMode]);

  // --- Editor Handlers ---
  const handleSavePost = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!postForm.title?.trim()) { toast.error("Vui lòng nhập tiêu đề bài viết!"); return; }
      try {
        setIsPostSaving(true);
        toast.loading(dialogMode === "add" ? "Đang thêm bài viết..." : "Đang cập nhật...", { id: "post-submit" });
        const targetCategory = categories.find((c: any) => c.name === postForm.category);
        const payload = {
          title: postForm.title,
          category_id: targetCategory ? targetCategory.id : undefined,
          views: Number(postForm.views) || 0,
          status: postForm.status === "Đã đăng" ? "published" : "draft",
          thumbnail_key: postCoverImage,
          content: htmlToBlocks(postContent),
        };
        if (dialogMode === "add") {
          const newArticle = await createAdminArticle(payload as any);
          if (newArticle) {
            const newPost: Post = {
              id: newArticle.id,
              title: newArticle.title,
              category: newArticle.categories?.name || postForm.category || "Tin tức",
              views: newArticle.views || 0,
              status: newArticle.status === "published" ? "Đã đăng" : "Nháp",
              createdAt: newArticle.created_at ? new Date(newArticle.created_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
              content: "",
              coverImage: newArticle.thumbnail_key || "",
              isDeleted: false,
            };
            setPosts((prev) => [newPost, ...prev]);
          }
          toast.success("Thêm bài viết mới thành công!", { id: "post-submit" });
        } else if (editId) {
          const updatedArticle = await updateAdminArticle(editId, payload as any);
          if (updatedArticle) {
            setPosts((prev) =>
              prev.map((p) =>
                p.id === editId
                  ? {
                      ...p,
                      title: updatedArticle.title,
                      category: updatedArticle.categories?.name || postForm.category || "Tin tức",
                      views: updatedArticle.views || 0,
                      status: updatedArticle.status === "published" ? "Đã đăng" : "Nháp",
                      createdAt: updatedArticle.created_at
                        ? new Date(updatedArticle.created_at).toISOString().split("T")[0]
                        : p.createdAt,
                      coverImage: updatedArticle.thumbnail_key || "",
                    }
                  : p
              )
            );
          }
          toast.success("Cập nhật bài viết thành công!", { id: "post-submit" });
        }
        setCurrentView("list");
      } catch (err: any) {
        toast.error(err?.message || "Có lỗi xảy ra, vui lòng thử lại!", { id: "post-submit" });
      } finally {
        setIsPostSaving(false);
      }
    },
    [postForm, postContent, postCoverImage, dialogMode, editId, categories]
  );

  const handleTriggerImageUpload = useCallback(
    () => document.getElementById("cover-upload-input")?.click(),
    []
  );

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPostCoverImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const handleInsertImageFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setImageFile(file); setImageFileName(file.name); setImageUrl(""); }
  }, []);

  const insertHtmlToEditor = useCallback((html: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const selection = window.getSelection();
    let isInsideEditor = false;
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      let node = range.commonAncestorContainer;
      while (node) {
        if (node === editorRef.current) { isInsideEditor = true; break; }
        node = node.parentNode as Node;
      }
    }
    if (isInsideEditor && selection) {
      try { document.execCommand("insertHTML", false, html); }
      catch { editorRef.current.innerHTML += html; }
    } else {
      editorRef.current.innerHTML += html;
    }
    setPostContent(editorRef.current.innerHTML);
  }, []);

  const handleInsertImage = useCallback(async () => {
    let finalImageUrl = "";
    if (imageTab === "upload") {
      if (!imageFile) { toast.error("Vui lòng chọn file ảnh!"); return; }
      toast.loading("Đang tải ảnh lên...", { id: "upload-image" });
      try {
        const fd = new FormData(); fd.append("file", imageFile); fd.append("folder", "articles");
        const res = await uploadAdminMedia(fd);
        if (res?.url) { finalImageUrl = res.url; toast.success("Tải lên thành công!", { id: "upload-image" }); }
        else throw new Error("No URL");
      } catch (err: any) {
        toast.error("Tải lên thất bại: " + (err.message || err), { id: "upload-image" }); return;
      }
    } else if (imageTab === "link" || imageTab === "library") {
      if (!imageUrl.trim()) { toast.error("Vui lòng nhập link ảnh!"); return; }
      finalImageUrl = imageUrl.trim();
    }
    if (!finalImageUrl) { toast.error("Đường dẫn không hợp lệ!"); return; }

    const wrapperId = "img-" + Math.random().toString(36).substring(2, 9);
    const imgHtml = `<p><br></p><div id="${wrapperId}" class="my-4 relative group" contenteditable="false" style="max-width:100%;margin:0 auto"><img src="${finalImageUrl}" alt="${imageCaption}" class="w-full rounded-xl border border-gray-200 shadow-sm" />${imageCaption ? `<p class="text-center text-xs italic text-gray-500 mt-1.5">${imageCaption}</p>` : ""}<button type="button" onclick="const p=this.parentElement;const ed=p.closest('[contenteditable]');p.remove();if(ed)ed.dispatchEvent(new Event('input',{bubbles:true}));" class="absolute top-2 right-2 hidden group-hover:flex items-center justify-center w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md active:scale-95 transition-all z-30"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button><div class="absolute bottom-2 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center gap-1.5 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg text-[11px] text-white font-bold select-none z-30 whitespace-nowrap w-max min-w-max"><button type="button" onclick="const p=this.closest('[contenteditable=false]');p.style.maxWidth='25%';const ed=p.closest('[contenteditable]');if(ed)ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">25%</button><span class="w-px h-3 bg-white/20"></span><button type="button" onclick="const p=this.closest('[contenteditable=false]');p.style.maxWidth='50%';const ed=p.closest('[contenteditable]');if(ed)ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">50%</button><span class="w-px h-3 bg-white/20"></span><button type="button" onclick="const p=this.closest('[contenteditable=false]');p.style.maxWidth='75%';const ed=p.closest('[contenteditable]');if(ed)ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">75%</button><span class="w-px h-3 bg-white/20"></span><button type="button" onclick="const p=this.closest('[contenteditable=false]');p.style.maxWidth='100%';const ed=p.closest('[contenteditable]');if(ed)ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">100%</button><span class="w-px h-3 bg-white/20"></span><button type="button" onclick="const p=this.closest('[contenteditable=false]');const img=p.querySelector('img');if(img){window.dispatchEvent(new CustomEvent('editor-crop-image',{detail:{src:img.src,id:p.id}}));}" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5 flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6.13 1L6 16a2 2 0 0 0 2 2h15"/><path d="M1 6.13L16 6a2 2 0 0 1 2 2v15"/></svg>Cắt ảnh</button></div></div><p><br></p>`;

    insertHtmlToEditor(imgHtml);
    setImageDialogOpen(false);
    setImageUrl(""); setImageCaption(""); setImageFile(null); setImageFileName("");
  }, [imageTab, imageFile, imageUrl, imageCaption, insertHtmlToEditor]);

  const handleInsertVideo = useCallback(async () => {
    let videoHtml = "";
    if (videoTab === "upload") {
      if (!videoFile) { toast.error("Vui lòng chọn file video!"); return; }
      toast.loading("Đang tải video lên...", { id: "upload-video" });
      try {
        const fd = new FormData(); fd.append("file", videoFile); fd.append("folder", "articles");
        const res = await uploadAdminMedia(fd);
        if (res?.url) {
          videoHtml = `<p><br></p><div class="my-4 relative group" contenteditable="false" style="max-width:100%;margin:0 auto"><video controls src="${res.url}" class="w-full max-h-[400px] rounded-xl border border-gray-200 shadow-sm"></video><button type="button" onclick="const p=this.parentElement;const ed=p.closest('[contenteditable]');p.remove();if(ed)ed.dispatchEvent(new Event('input',{bubbles:true}));" class="absolute top-2 right-2 hidden group-hover:flex items-center justify-center w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md active:scale-95 transition-all z-30"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button><div class="absolute bottom-2 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center gap-1.5 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg text-[11px] text-white font-bold select-none z-30 whitespace-nowrap w-max min-w-max"><button type="button" onclick="const p=this.closest('[contenteditable=false]');p.style.maxWidth='25%';const ed=p.closest('[contenteditable]');if(ed)ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">25%</button><span class="w-px h-3 bg-white/20"></span><button type="button" onclick="const p=this.closest('[contenteditable=false]');p.style.maxWidth='50%';const ed=p.closest('[contenteditable]');if(ed)ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">50%</button><span class="w-px h-3 bg-white/20"></span><button type="button" onclick="const p=this.closest('[contenteditable=false]');p.style.maxWidth='75%';const ed=p.closest('[contenteditable]');if(ed)ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">75%</button><span class="w-px h-3 bg-white/20"></span><button type="button" onclick="const p=this.closest('[contenteditable=false]');p.style.maxWidth='100%';const ed=p.closest('[contenteditable]');if(ed)ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">100%</button></div></div><p><br></p>`;
          toast.success("Tải lên thành công!", { id: "upload-video" });
        } else throw new Error("No URL");
      } catch (err: any) {
        toast.error("Tải lên thất bại: " + (err.message || err), { id: "upload-video" }); return;
      }
    } else {
      if (!videoUrl.trim()) { toast.error("Vui lòng nhập link video!"); return; }
      const url = videoUrl.trim();
      if (url.includes("youtube.com/watch") || url.includes("youtu.be")) {
        let videoId = "";
        try {
          if (url.includes("youtube.com/watch")) videoId = new URLSearchParams(new URL(url).search).get("v") || "";
          else videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
        } catch { /* ignore */ }
        videoHtml = videoId
          ? `<p><br></p><div class="my-4 relative group" contenteditable="false" style="max-width:100%;margin:0 auto"><iframe class="w-full aspect-video rounded-xl shadow-sm border border-gray-200" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen></iframe><button type="button" onclick="const p=this.parentElement;const ed=p.closest('[contenteditable]');p.remove();if(ed)ed.dispatchEvent(new Event('input',{bubbles:true}));" class="absolute top-2 right-2 hidden group-hover:flex items-center justify-center w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md active:scale-95 transition-all z-30"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button><div class="absolute bottom-2 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center gap-1.5 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg text-[11px] text-white font-bold select-none z-30 whitespace-nowrap w-max min-w-max"><button type="button" onclick="const p=this.closest('[contenteditable=false]');p.style.maxWidth='25%';const ed=p.closest('[contenteditable]');if(ed)ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">25%</button><span class="w-px h-3 bg-white/20"></span><button type="button" onclick="const p=this.closest('[contenteditable=false]');p.style.maxWidth='50%';const ed=p.closest('[contenteditable]');if(ed)ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">50%</button><span class="w-px h-3 bg-white/20"></span><button type="button" onclick="const p=this.closest('[contenteditable=false]');p.style.maxWidth='75%';const ed=p.closest('[contenteditable]');if(ed)ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">75%</button><span class="w-px h-3 bg-white/20"></span><button type="button" onclick="const p=this.closest('[contenteditable=false]');p.style.maxWidth='100%';const ed=p.closest('[contenteditable]');if(ed)ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">100%</button></div></div><p><br></p>`
          : `<p><br></p><div class="my-4 relative group" contenteditable="false" style="max-width:100%;margin:0 auto"><iframe class="w-full aspect-video rounded-xl shadow-sm border border-gray-200" src="${url}" frameborder="0" allowfullscreen></iframe><button type="button" onclick="const p=this.parentElement;const ed=p.closest('[contenteditable]');p.remove();if(ed)ed.dispatchEvent(new Event('input',{bubbles:true}));" class="absolute top-2 right-2 hidden group-hover:flex items-center justify-center w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md active:scale-95 transition-all z-30"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button><div class="absolute bottom-2 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center gap-1.5 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg text-[11px] text-white font-bold select-none z-30 whitespace-nowrap w-max min-w-max"><button type="button" onclick="const p=this.closest('[contenteditable=false]');p.style.maxWidth='25%';const ed=p.closest('[contenteditable]');if(ed)ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">25%</button><span class="w-px h-3 bg-white/20"></span><button type="button" onclick="const p=this.closest('[contenteditable=false]');p.style.maxWidth='50%';const ed=p.closest('[contenteditable]');if(ed)ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">50%</button><span class="w-px h-3 bg-white/20"></span><button type="button" onclick="const p=this.closest('[contenteditable=false]');p.style.maxWidth='75%';const ed=p.closest('[contenteditable]');if(ed)ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">75%</button><span class="w-px h-3 bg-white/20"></span><button type="button" onclick="const p=this.closest('[contenteditable=false]');p.style.maxWidth='100%';const ed=p.closest('[contenteditable]');if(ed)ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">100%</button></div></div><p><br></p>`;
      } else {
        videoHtml = `<p><br></p><div class="my-4 relative group" contenteditable="false" style="max-width:100%;margin:0 auto"><video controls src="${url}" class="w-full max-h-[400px] rounded-xl border border-gray-200 shadow-sm"></video><button type="button" onclick="const p=this.parentElement;const ed=p.closest('[contenteditable]');p.remove();if(ed)ed.dispatchEvent(new Event('input',{bubbles:true}));" class="absolute top-2 right-2 hidden group-hover:flex items-center justify-center w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md active:scale-95 transition-all z-30"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button><div class="absolute bottom-2 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center gap-1.5 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg text-[11px] text-white font-bold select-none z-30 whitespace-nowrap w-max min-w-max"><button type="button" onclick="const p=this.closest('[contenteditable=false]');p.style.maxWidth='25%';const ed=p.closest('[contenteditable]');if(ed)ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">25%</button><span class="w-px h-3 bg-white/20"></span><button type="button" onclick="const p=this.closest('[contenteditable=false]');p.style.maxWidth='50%';const ed=p.closest('[contenteditable]');if(ed)ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">50%</button><span class="w-px h-3 bg-white/20"></span><button type="button" onclick="const p=this.closest('[contenteditable=false]');p.style.maxWidth='75%';const ed=p.closest('[contenteditable]');if(ed)ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">75%</button><span class="w-px h-3 bg-white/20"></span><button type="button" onclick="const p=this.closest('[contenteditable=false]');p.style.maxWidth='100%';const ed=p.closest('[contenteditable]');if(ed)ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">100%</button></div></div><p><br></p>`;
      }
      toast.success("Đã chèn video thành công!");
    }
    insertHtmlToEditor(videoHtml);
    setVideoDialogOpen(false);
    setVideoFile(null); setVideoFileName(""); setVideoUrl("");
  }, [videoTab, videoFile, videoUrl, insertHtmlToEditor]);

  // --- Crop dialog ---
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

  const handleTabChange = useCallback(
    (tab: TabType) => {
      router.push(`/admin/${tab}`);
      setSidebarOpen(false);
    },
    [router]
  );

  // --- Auth screens ---
  if (!auth.isAuthVerified) {
    return (
      <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#E55956] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!auth.isLoggedIn) {
    return (
      <AdminLogin
        loginUsername={auth.loginUsername}
        loginPassword={auth.loginPassword}
        showPassword={auth.showPassword}
        isLoading={auth.isLoading}
        onUsernameChange={auth.setLoginUsername}
        onPasswordChange={auth.setLoginPassword}
        onTogglePassword={() => auth.setShowPassword(!auth.showPassword)}
        onSubmit={auth.handleLogin}
      />
    );
  }

  // --- Editor View ---
  if (currentView === "editor") {
    return (
      <div className="min-h-screen bg-[#fafbfc] text-[#2c3e50] font-sans antialiased flex flex-col animate-fade-in">
        <header className="h-[65px] bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <button
            type="button"
            onClick={() => { setCurrentView("list"); setPostCoverImage(null); }}
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
            {isPostSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>Lưu bài viết</span>
          </button>
        </header>

        <main className="max-w-6xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (Editor) */}
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

            {/* Toolbar */}
            <div className="sticky top-[65px] z-20 flex flex-wrap items-center gap-1 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-1.5 shadow-md text-gray-600 flex-shrink-0 transition-all">
              <div className="relative font-dropdown">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { setFontMenuOpen(!fontMenuOpen); setSizeMenuOpen(false); }}
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
                    {["Arial", "Times New Roman", "Helvetica", "Georgia", "Courier New", "Verdana"].map((font) => (
                      <button
                        key={font}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => applyFontFamily(font)}
                        className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors block ${editorStates.fontFamily === font ? "text-[#E55956] font-bold" : "text-gray-700"}`}
                        style={{ fontFamily: font }}
                      >
                        {font}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="h-4 w-px bg-gray-200 mx-1" />
              <div className="relative size-dropdown">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { setSizeMenuOpen(!sizeMenuOpen); setFontMenuOpen(false); }}
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
                        className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors block ${editorStates.fontSize === size ? "text-[#E55956] font-bold" : "text-gray-700"}`}
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
                className={`p-1.5 rounded-lg transition-colors ${editorStates.isBold ? "bg-gray-100 text-gray-900 font-bold" : "hover:bg-gray-100 text-gray-700 hover:text-gray-900"}`}
                title="Chữ đậm"
              >
                <Bold size={15} />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => executeEditorCommand("italic")}
                className={`p-1.5 rounded-lg transition-colors ${editorStates.isItalic ? "bg-gray-100 text-gray-900 font-bold" : "hover:bg-gray-100 text-gray-700 hover:text-gray-900"}`}
                title="Chữ nghiêng"
              >
                <Italic size={15} />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => executeEditorCommand("underline")}
                className={`p-1.5 rounded-lg transition-colors ${editorStates.isUnderline ? "bg-gray-100 text-gray-900 font-bold" : "hover:bg-gray-100 text-gray-700 hover:text-gray-900"}`}
                title="Gạch chân"
              >
                <Underline size={15} />
              </button>
              <div className="h-4 w-px bg-gray-200 mx-1" />
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => executeEditorCommand("justifyLeft")}
                className={`p-1.5 rounded-lg transition-colors ${editorStates.align === "left" || editorStates.align === "start" ? "bg-gray-100 text-gray-900 font-bold" : "hover:bg-gray-100 text-gray-700 hover:text-gray-900"}`}
                title="Căn lề trái"
              >
                <AlignLeft size={15} />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => executeEditorCommand("justifyCenter")}
                className={`p-1.5 rounded-lg transition-colors ${editorStates.align === "center" ? "bg-gray-100 text-gray-900 font-bold" : "hover:bg-gray-100 text-gray-700 hover:text-gray-900"}`}
                title="Căn lề giữa"
              >
                <AlignCenter size={15} />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => executeEditorCommand("justifyRight")}
                className={`p-1.5 rounded-lg transition-colors ${editorStates.align === "right" || editorStates.align === "end" ? "bg-gray-100 text-gray-900 font-bold" : "hover:bg-gray-100 text-gray-700 hover:text-gray-900"}`}
                title="Căn lề phải"
              >
                <AlignRight size={15} />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => executeEditorCommand("justifyFull")}
                className={`p-1.5 rounded-lg transition-colors ${editorStates.align === "justify" ? "bg-gray-100 text-gray-900 font-bold" : "hover:bg-gray-100 text-gray-700 hover:text-gray-900"}`}
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
                onClick={() => { setImageDialogOpen(true); loadMedia(); }}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900 text-gray-700"
                title="Chèn ảnh"
              >
                <ImageIcon size={15} />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { setVideoDialogOpen(true); loadMedia(); }}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900 text-gray-700"
                title="Chèn video"
              >
                <Video size={15} />
              </button>
            </div>

            {/* Editor */}
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

          {/* Right Column (Settings) */}
          <div className="lg:col-span-4 flex flex-col gap-5 lg:sticky lg:top-[85px]">
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4 flex-shrink-0">
              <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2.5">Thông tin bài viết</h3>
              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Danh mục</label>
                  <div className="relative">
                    <select
                      value={postForm.category || ""}
                      onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-gray-50/50 appearance-none font-semibold text-gray-800"
                    >
                      {categoryOptions.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Trạng thái</label>
                  <div className="relative">
                    <select
                      value={postForm.status || "Nháp"}
                      onChange={(e) => setPostForm({ ...postForm, status: e.target.value as "Đã đăng" | "Nháp" })}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-gray-50/50 appearance-none font-semibold text-gray-800"
                    >
                      <option value="Đã đăng">Đã đăng</option>
                      <option value="Nháp">Nháp</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
              <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2.5 flex-shrink-0">Ảnh bìa</h3>
              {postCoverImage ? (
                <div className="relative rounded-xl overflow-hidden border border-gray-200 group aspect-[16/10] w-full flex-shrink-0">
                  <img src={postCoverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button type="button" onClick={() => setPostCoverImage(null)} className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors shadow-md">Xóa ảnh</button>
                  </div>
                </div>
              ) : (
                <div onClick={handleTriggerImageUpload} className="border-2 border-dashed border-gray-200 hover:border-[#E55956] hover:bg-[#E55956]/5 transition-all rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer aspect-[16/10] w-full flex-shrink-0 group">
                  <Upload size={24} className="text-gray-400 group-hover:text-[#E55956] transition-colors" />
                  <span className="text-xs font-bold text-gray-500 group-hover:text-[#E55956] transition-colors">Tải ảnh bìa lên</span>
                  <input type="file" id="cover-upload-input" className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
              )}
            </div>
          </div>
        </main>

        <ImageDialog
          open={imageDialogOpen} onOpenChange={setImageDialogOpen}
          imageUrl={imageUrl} imageCaption={imageCaption} imageTab={imageTab}
          imageFile={imageFile} imageFileName={imageFileName}
          mediaItems={mediaItems} mediaLoading={mediaLoading}
          onUrlChange={setImageUrl} onCaptionChange={setImageCaption} onTabChange={setImageTab}
          onFileChange={handleInsertImageFileChange}
          onTriggerFileUpload={() => document.getElementById("insert-image-upload-input")?.click()}
          onInsert={handleInsertImage}
          onLoadMedia={loadMedia}
        />
        <VideoDialog
          open={videoDialogOpen} onOpenChange={setVideoDialogOpen}
          videoUrl={videoUrl} videoTab={videoTab}
          videoFile={videoFile} videoFileName={videoFileName}
          mediaItems={mediaItems} mediaLoading={mediaLoading}
          onUrlChange={setVideoUrl} onTabChange={setVideoTab}
          onFileChange={(e) => {
            const file = e.target.files?.[0];
            if (file) { setVideoFile(file); setVideoFileName(file.name); setVideoUrl(""); }
          }}
          onTriggerFileUpload={() => document.getElementById("video-upload-input")?.click()}
          onInsert={handleInsertVideo}
          onLoadMedia={loadMedia}
        />
        <CropDialog
          open={cropDialogOpen} onOpenChange={setCropDialogOpen}
          cropImageUrl={cropImageUrl} cropImageElementId={cropImageElementId}
          cropArea={cropArea} onCropAreaChange={setCropArea}
        />
      </div>
    );
  }

  // --- List View ---
  return (
    <div className="min-h-screen bg-[#f4f6f8] text-[#2c3e50] font-sans antialiased flex animate-fade-in">
      <AdminSidebar
        activeTab={"posts" as TabType}
        sidebarOpen={sidebarOpen}
        logoUrl={siteSettings.logoUrl}
        logoWebsiteName={siteSettings.logoWebsiteName}
        onTabChange={handleTabChange}
        onCloseSidebar={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        <header className="h-[70px] bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-[#2c3e50] hover:text-[#cb4643] transition-colors p-1.5 border border-gray-200 rounded-lg">
              <Menu size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <LayoutDashboard size={20} className="text-[#E55956]" />
              <span>Quản lý bài viết</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-sm font-bold text-gray-900">Administrator</span>
                <span className="text-[10px] font-semibold text-[#E55956] uppercase tracking-wider">Super Admin</span>
              </div>
              <div className="w-[40px] h-[40px] rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 border border-slate-300 select-none">AD</div>
            </div>
            <button type="button" onClick={() => setLogoutDialogOpen(true)} className="flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 hover:border-red-200 hover:bg-red-50 text-gray-500 hover:text-[#E55956] transition-all" title="Đăng xuất">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          <DefaultTab
            activeTab="posts"
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            postStartDate={postStartDate}
            onPostStartDateChange={setPostStartDate}
            postEndDate={postEndDate}
            onPostEndDateChange={setPostEndDate}
            postCategoryFilter={postCategoryFilter}
            onPostCategoryFilterChange={setPostCategoryFilter}
            categoryOptions={categoryOptions}
            onResetFilters={resetFilters}
            hideDeletedPosts={hideDeletedPosts}
            onHideDeletedPostsChange={setHideDeletedPosts}
            onOpenAddDialog={handleOpenAddDialog}
            postsLoading={postsLoading}
            paginatedPosts={paginatedPosts}
            postsPage={postsPage}
            postsTotalPages={postsTotalPages}
            onPostsPageChange={setPostsPage}
            onPostEdit={handleOpenEditDialog}
            onPostDelete={handleConfirmDelete}
            categoriesLoading={false} paginatedCategories={[]} categoriesPage={1} categoriesTotalPages={1}
            onCategoriesPageChange={() => {}} onCategoryEdit={() => {}} onCategoryDelete={() => {}}
            onCategoryPriorityChange={() => {}} onCategoryStatusToggle={() => {}}
            adsLoading={false} paginatedAds={[]} adsPage={1} adsTotalPages={1}
            onAdsPageChange={() => {}} onAdEdit={() => {}} onAdDelete={() => {}} onAdStatusToggle={() => {}}
            accountsLoading={false} paginatedAccounts={[]} accountsPage={1} accountsTotalPages={1}
            onAccountsPageChange={() => {}} onAccountEdit={() => {}} onAccountDelete={() => {}}
            formatDateForDisplay={formatDateForDisplay}
          />
        </main>
      </div>

      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        activeTab="posts"
        isDeleting={isDeleting}
        onConfirm={executeDelete}
        onCancel={() => { setDeleteConfirmOpen(false); setTargetIdToDelete(null); }}
      />
      <LogoutDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen} onConfirm={auth.handleLogout} />
    </div>
  );
}
