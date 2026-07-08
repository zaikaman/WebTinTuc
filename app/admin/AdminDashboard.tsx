"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Post, Category, Ad, AdminAccount, TabType, MediaItem } from "@/components/admin/AdminTypes";
import { htmlToBlocks, blocksToHtml, formatDateForDisplay } from "@/components/admin/AdminUtils";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminLogin from "@/components/admin/AdminLogin";
import DeleteConfirmDialog from "@/components/admin/DeleteConfirmDialog";
import LogoutDialog from "@/components/admin/LogoutDialog";
import ImageDialog from "@/components/admin/ImageDialog";
import VideoDialog from "@/components/admin/VideoDialog";
import CropDialog from "@/components/admin/CropDialog";
import FolderDialog from "@/components/admin/FolderDialog";
import AccountDialog from "@/components/admin/AccountDialog";
import CategoryDialog from "@/components/admin/CategoryDialog";
import AdDialog from "@/components/admin/AdDialog";
import FormDialog from "@/components/admin/FormDialog";
import LogoFooterTab from "@/components/admin/LogoFooterTab";
import MediaTab from "@/components/admin/MediaTab";
import DefaultTab from "@/components/admin/DefaultTab";
import {
  Loader2,
  Image as ImageIcon,
  Menu,
  LayoutDashboard,
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
  LogOut
} from "lucide-react";
import { getAdminSettings, updateAdminSettings, getAdminMedia, uploadAdminMedia, deleteAdminMedia, createAdminFolder, getAdminCategories, createAdminCategory, updateAdminCategory, deleteAdminCategory, getAdminArticles, getAdminArticleById, createAdminArticle, updateAdminArticle, deleteAdminArticle, getAdminAds, createAdminAd, updateAdminAd, deleteAdminAd, getAdminAccounts, createAdminAccount, updateAdminAccount, deleteAdminAccount } from "@/lib/api/adminClient";
import { toast } from "sonner";
import { mockSiteSettings } from "@/lib/mockSiteSettings";
import { supabase } from "@/lib/supabase/client";

let cachedSettings: any = null;

export default function AdminDashboard() {
  // ==========================================
  // STATE DEFINITIONS
  // ==========================================
  // isLoggedIn đọc trực tiếp từ localStorage (đồng bộ) ngay lần render đầu tiên
  // để tránh flicker màn hình login khi chuyển tab
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('admin_logged_in') === 'true';
  });
  const [isAuthVerified, setIsAuthVerified] = useState<boolean>(false);
  const isExplicitLogoutRef = useRef(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  // Logic kiểm tra quyền truy cập và chuyển hướng
  useEffect(() => {
    // Chỉ thực hiện chuyển hướng khi quá trình xác thực phiên (verifySession) đã hoàn tất
    if (!isAuthVerified) return;

    // 1. Nếu CHƯA đăng nhập và cố truy cập các trang con /admin/... (trừ /admin và /admin/)
    if (!isLoggedIn && pathname && pathname !== "/admin" && pathname !== "/admin/") {
      router.replace("/admin");

      // Nếu là hành động đăng xuất chủ động, không hiện toast warning "vui lòng đăng nhập trước"
      if (isExplicitLogoutRef.current) {
        isExplicitLogoutRef.current = false;
      } else {
        toast.warning("Vui lòng đăng nhập trước!");
      }
    }

    // 2. Nếu ĐÃ đăng nhập và đang ở trang đăng nhập gốc /admin hoặc /admin/
    if (isLoggedIn && (pathname === "/admin" || pathname === "/admin/")) {
      router.replace("/admin/dashboard");
    }
  }, [isLoggedIn, isAuthVerified, pathname, router]);

  useEffect(() => {
    // Xác thực lại session Supabase khi component mount lần đầu
    // Nếu localStorage nói đã đăng nhập nhưng session Supabase đã hết hạn → logout
    const verifySession = async () => {
      const cached = localStorage.getItem('admin_logged_in');
      if (cached !== 'true') {
        setIsAuthVerified(true);
        return; // Chưa đăng nhập, không cần verify
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          // Session hết hạn, dọn dẹp cache
          localStorage.removeItem('admin_logged_in');
          setIsLoggedIn(false);
        }
      } catch {
        // Nếu lỗi network khi verify, vẫn tin vào localStorage (UX tốt hơn)
      } finally {
        setIsAuthVerified(true); // Đã xác thực xong
      }
    };
    verifySession();

    const handleCropEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setCropImageUrl(detail.src);
      setCropImageElementId(detail.id);
      setCropArea({ x: 10, y: 10, width: 80, height: 80 });
      setCropDialogOpen(true);
    };
    window.addEventListener("editor-crop-image", handleCropEvent);
    return () => {
      window.removeEventListener("editor-crop-image", handleCropEvent);
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername || !loginPassword) {
      toast.error("Vui lòng điền đầy đủ thông tin đăng nhập!");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginUsername.trim(),
        password: loginPassword,
      });

      if (error || !data.user) {
        toast.error("Email hoặc mật khẩu không chính xác!");
        return;
      }

      // Kiểm tra role admin trong bảng profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profile || profile.role !== 'admin') {
        await supabase.auth.signOut();
        toast.error("Tài khoản này không có quyền quản trị!");
        return;
      }

      localStorage.setItem('admin_logged_in', 'true');
      setIsLoggedIn(true);
      setIsAuthVerified(true);
      toast.success("Đăng nhập quản trị thành công!");
    } catch (err) {
      console.error(err);
      toast.error("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      isExplicitLogoutRef.current = true;
      await supabase.auth.signOut();
    } catch {
      // bỏ qua lỗi signOut
    } finally {
      localStorage.removeItem('admin_logged_in');
      setIsLoggedIn(false);
      setIsAuthVerified(true);
      setLogoutDialogOpen(false);
      toast.success("Đã đăng xuất khỏi hệ thống!");
    }
  };

  const activeTab = useMemo<TabType>(() => {
    const segment = pathname?.split("/").pop();
    if (segment === "admin" || !segment) return "dashboard";
    return (segment as TabType) || "dashboard";
  }, [pathname]);

  // ==========================================
  // LOGO & FOOTER + MEDIA MANAGER STATES
  // ==========================================

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);

  const [, setSiteSettings] = useState(() => cachedSettings || mockSiteSettings);

  // Simplified Logo & Footer states matching screenshot
  const [logoWebsiteName, setLogoWebsiteName] = useState(() => cachedSettings?.brand?.name || "Tên Web");
  const [logoUrl, setLogoUrl] = useState<string | null>(() => cachedSettings?.brand?.logo_url || null);
  const [footerOperator, setFooterOperator] = useState(() => cachedSettings?.brand?.copyright || "Công ty TNHH PHD STUDIO");
  const [footerAddress, setFooterAddress] = useState(() => cachedSettings?.footer?.address || "246 Lê Đình Cẩn, phường Tân Tạo, quận Bình Tân, Thành phố Hồ Chí Minh");
  const [footerResponsible, setFooterResponsible] = useState(() => cachedSettings?.footer?.responsible || "Ông Phạm Hải Đăng");
  const [footerPhone, setFooterPhone] = useState(() => cachedSettings?.footer?.phone || "0327906965");
  const [footerEmail, setFooterEmail] = useState(() => cachedSettings?.footer?.email || "congtyphdstudio@gmail.com");
  const [footerLicense, setFooterLicense] = useState(() => cachedSettings?.footer?.license || "Số bao nhiêu ....");

  // Header Contact & Social states
  const [headerZaloUrl, setHeaderZaloUrl] = useState(() => cachedSettings?.brand?.socialLinks?.find((l: any) => l.platform === 'zalo')?.href || "https://zalo.me");
  const [headerEmailUrl, setHeaderEmailUrl] = useState(() => cachedSettings?.brand?.socialLinks?.find((l: any) => l.platform === 'email')?.href || "mailto:quangcao@linhka.vn");

  const [mediaSort, setMediaSort] = useState<"newest" | "oldest" | "az">("newest");

  const [mediaSearchQuery, setMediaSearchQuery] = useState("");
  const [mediaTypeFilter, setMediaTypeFilter] = useState<"all" | "image" | "video">("all");
  const [activeFolder, setActiveFolder] = useState<string>("");
  const [folders, setFolders] = useState<string[]>([]);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [imageTab, setImageTab] = useState<"link" | "upload" | "library">("link");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageFileName, setImageFileName] = useState<string>("");
  const [videoTab, setVideoTab] = useState<"link" | "upload" | "library">("link");
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState("");
  const [cropImageElementId, setCropImageElementId] = useState("");
  const [cropArea, setCropArea] = useState({ x: 10, y: 10, width: 80, height: 80 });

  const loadFolders = async () => {
    try {
      const res = await getAdminMedia("");
      if (res && res.subFolders) {
        const uniqueFolders = Array.from(new Set([
          ...res.subFolders.map((sf) => sf.name),
          "articles", "ads", "categories" // default folders
        ]));
        setFolders(uniqueFolders);
      }
    } catch (err) { }
  };

  const loadMedia = async () => {
    try {
      setMediaLoading(true);
      // We always load recursively from root to keep a full cache of media files
      const res = await getAdminMedia("", true);
      if (res && res.files) {
        setMediaItems(res.files.map((f: any, idx: number) => ({
          id: idx + 1,
          key: f.key,
          title: f.name,
          type: f.type,
          url: f.url,
          size: (f.size / 1024).toFixed(2) + " KB",
          createdAt: f.lastModified ? new Date(f.lastModified).toISOString().split("T")[0] : "",
          folder: f.key.includes('/') ? f.key.split('/')[0] : ""
        })));
      }
    } catch (err) {
      console.error("Error loading media:", err);
    } finally {
      setMediaLoading(false);
    }
  };

  const loadAccounts = async () => {
    try {
      setAccountsLoading(true);
      const res = await getAdminAccounts("?limit=100");
      if (res && res.items) {
        setAccounts(res.items);
      }
    } catch (err) {
      toast.error("Không thể tải danh sách tài khoản");
    } finally {
      setAccountsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      const res = await getAdminCategories("?limit=100");
      if (res && res.items) {
        setCategories(res.items.map((c: any) => ({
          id: c.id,
          name: c.name,
          postCount: c.postCount || 0,
          priority: c.priority || 0,
          status: c.status === "active" ? "Hoạt động" : "Ngừng hoạt động"
        })));
      }
    } catch (err) {
      toast.error("Không thể tải danh sách danh mục");
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadAds = async () => {
    try {
      setAdsLoading(true);
      const res = await getAdminAds("?limit=100");
      setAds((res.items || []).map((a: any) => {
        const now = new Date();

        // Parse dates safely using the YYYY-MM-DD part
        const startDateStr = a.starts_at ? a.starts_at.split('T')[0] : null;
        const endDateStr = a.ends_at ? a.ends_at.split('T')[0] : null;

        const start = startDateStr ? new Date(startDateStr + 'T00:00:00') : null;
        const end = endDateStr ? new Date(endDateStr + 'T23:59:59') : null;

        let computedStatus = "Ngừng hoạt động";

        if (a.status === "active") {
          if (end && end < now) computedStatus = "Đã kết thúc";
          else if (start && start > now) computedStatus = "Chờ chạy";
          else computedStatus = "Hoạt động";
        }

        return {
          id: a.id,
          name: a.name,
          position: a.position || "header",
          clicks: a.stats?.clicks || 0,
          startDate: a.starts_at ? new Date(a.starts_at).toISOString().split('T')[0] : "",
          endDate: a.ends_at ? new Date(a.ends_at).toISOString().split('T')[0] : "",
          status: computedStatus,
          image: a.media_key || undefined,
          link: a.target_url || undefined,
        } as Ad;
      }));
    } catch (err) {
      // Ignore
    } finally {
      setAdsLoading(false);
    }
  };

  const loadPosts = async () => {
    try {
      setPostsLoading(true);
      const res = await getAdminArticles("?limit=1000&includeDeleted=true");
      if (res && res.items) {
        setPosts(res.items.map((a: any) => ({
          id: a.id,
          title: a.title,
          category: a.categories?.name || "Tin tức",
          views: a.views || 0,
          status: a.status === 'published' ? 'Đã đăng' : 'Nháp',
          createdAt: a.created_at ? new Date(a.created_at).toISOString().split('T')[0] : "",
          content: "", // We fetch full content on demand when editing
          coverImage: a.thumbnail_key || "",
          isDeleted: !!a.deleted_at
        })));
      }
    } catch (err) {
      toast.error("Không thể tải danh sách bài viết");
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn || !isAuthVerified) return;

    if (activeTab === "posts") {
      loadPosts();
      if (categories.length === 0) loadCategories();
    }
    if (activeTab === "categories") {
      loadCategories();
    }
    if (activeTab === "media") {
      loadMedia();
      loadFolders();
    }
    if (activeTab === "ads") {
      loadAds();
    }
    if (activeTab === "accounts") {
      loadAccounts();
    }

    // Luôn tải Site Settings khi admin đăng nhập thành công để hiển thị đúng tên website/logo ở Sidebar
    if (activeTab === "logo-footer" || !cachedSettings) {
      if (activeTab === "logo-footer") {
        setSettingsLoading(true);
      }
      getAdminSettings().then(res => {
        if (res) {
          cachedSettings = res;
          setSiteSettings(res as any);
          if (res.brand) {
            setLogoWebsiteName(res.brand.name || "Tên Web");
            setLogoUrl(res.brand.logo_url || null);
            setFooterOperator(res.brand.copyright || "");
            setHeaderZaloUrl(res.brand.socialLinks?.find((l: any) => l.platform === 'zalo')?.href || "https://zalo.me");
            setHeaderEmailUrl(res.brand.socialLinks?.find((l: any) => l.platform === 'email')?.href || "mailto:quangcao@linhka.vn");
          }
          if (res.footer) {
            setFooterAddress(res.footer.address || "");
            setFooterPhone(res.footer.phone || "");
            setFooterEmail(res.footer.email || "");
            setFooterLicense(res.footer.license || "");
            setFooterResponsible(res.footer.responsible || "");
          }
        }
      }).catch(() => { }).finally(() => {
        if (activeTab === "logo-footer") {
          setSettingsLoading(false);
        }
      });
    }
  }, [activeTab, isLoggedIn, isAuthVerified]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<"list" | "editor">("list");
  const [postCoverImage, setPostCoverImage] = useState<string | null>(null);
  const [postContent, setPostContent] = useState<string>("");

  const editorRef = useRef<HTMLDivElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);

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
        console.log("saveSelection: Saved range in Dashboard", {
          collapsed: range.collapsed,
          startOffset: range.startOffset,
          endOffset: range.endOffset,
          commonAncestor: range.commonAncestorContainer.nodeName,
          text: range.toString()
        });
      } else {
        console.log("saveSelection: Range is outside editor container");
      }
    } else {
      console.log("saveSelection: No selection range in window");
    }
  };

  const restoreSelection = () => {
    console.log("restoreSelection: Focusing editor ref");
    if (editorRef.current) {
      editorRef.current.focus();
    }
    if (savedSelectionRef.current && window.getSelection) {
      console.log("restoreSelection: Restoring saved range selection", {
        collapsed: savedSelectionRef.current.collapsed,
        text: savedSelectionRef.current.toString()
      });
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedSelectionRef.current);
      }
    } else {
      console.log("restoreSelection: No saved range found in savedSelectionRef");
    }
  };

  const executeEditorCommand = (command: string, value: string = "") => {
    console.log("executeEditorCommand: Formatting command initiated", { command, value });
    restoreSelection();
    try {
      console.log("executeEditorCommand: Setting styleWithCSS to true");
      document.execCommand("styleWithCSS", false, "true");
    } catch (e) {
      console.warn("Failed to set styleWithCSS", e);
    }
    console.log("executeEditorCommand: Running document.execCommand", { command, value });
    const success = document.execCommand(command, false, value);
    console.log("executeEditorCommand: Native execCommand result", success);
    if (editorRef.current) {
      setPostContent(editorRef.current.innerHTML);
    }
    saveSelection();
  };

  const handleFontFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const font = e.target.value;
    if (!font) return;
    setTimeout(() => {
      executeEditorCommand("fontName", font);
    }, 0);
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) return;
    let size = "3";
    if (val === "12px") size = "1";
    if (val === "14px") size = "2";
    if (val === "16px") size = "3";
    if (val === "18px") size = "4";
    if (val === "20px") size = "5";
    if (val === "24px") size = "6";
    setTimeout(() => {
      executeEditorCommand("fontSize", size);
    }, 0);
  };

  // Keep contentEditable div synchronized with postContent state
  useEffect(() => {
    if (editorRef.current && currentView === "editor") {
      if (editorRef.current.innerHTML !== postContent) {
        editorRef.current.innerHTML = postContent;
      }
    }
  }, [currentView, postContent]);

  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoFileName, setVideoFileName] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string>("");

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [postCategoryFilter, setPostCategoryFilter] = useState("all");
  const [postStartDate, setPostStartDate] = useState("");
  const [postEndDate, setPostEndDate] = useState("");
  const [hideDeletedPosts, setHideDeletedPosts] = useState(true);

  // In-Memory Database (initially populated with screenshot data)
  const [posts, setPosts] = useState<Post[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);

  const [ads, setAds] = useState<Ad[]>([]);
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [adsLoading, setAdsLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [isPostSaving, setIsPostSaving] = useState(false);
  const [isCategorySaving, setIsCategorySaving] = useState(false);
  const [isAdSaving, setIsAdSaving] = useState(false);
  const [isSettingsSaving, setIsSettingsSaving] = useState(false);
  const [isAccountSaving, setIsAccountSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isMediaUploading, setIsMediaUploading] = useState(false);
  const [deletingMediaKey, setDeletingMediaKey] = useState<string | null>(null);


  // Pagination states
  const [postsPage, setPostsPage] = useState(1);
  const [categoriesPage, setCategoriesPage] = useState(1);
  const [adsPage, setAdsPage] = useState(1);
  const [mediaPage, setMediaPage] = useState(1);
  const [accountsPage, setAccountsPage] = useState(1);
  const itemsPerPage = 6;
  const mediaItemsPerPage = 6;

  // Dialog / Modal Form states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [adDialogOpen, setAdDialogOpen] = useState(false);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [targetIdToDelete, setTargetIdToDelete] = useState<number | null>(null);
  const [targetAccountIdToDelete, setTargetAccountIdToDelete] = useState<string | null>(null);

  // Form states for Posts
  const [postForm, setPostForm] = useState<Partial<Post>>({
    title: "",
    category: "Công nghệ",
    views: 0,
    status: "Đã đăng",
    createdAt: new Date().toISOString().split("T")[0]
  });

  // Form states for Categories
  const [categoryForm, setCategoryForm] = useState<Partial<Category>>({
    name: "",
    postCount: 0,
    priority: 1,
    status: "Hoạt động"
  });

  // Form states for Ads
  const [adForm, setAdForm] = useState<Partial<Ad>>({
    name: "",
    position: "header",
    clicks: 0,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    status: "Hoạt động",
    link: ""
  });

  // Form states for Accounts
  const [accountForm, setAccountForm] = useState<Partial<AdminAccount & { password?: string }>>({
    username: "",
    display_name: "",
    email: "",
    password: "",
    role: "admin"
  });

  const [editId, setEditId] = useState<number | null>(null);
  const [editAccountId, setEditAccountId] = useState<string | null>(null);

  // Load draft editor state on mount
  useEffect(() => {
    try {
      const savedView = localStorage.getItem("admin_editor_current_view");
      if (savedView === "editor") {
        setCurrentView("editor");

        const savedForm = localStorage.getItem("admin_editor_post_form");
        if (savedForm) {
          setPostForm(JSON.parse(savedForm));
        }

        const savedContent = localStorage.getItem("admin_editor_post_content");
        if (savedContent) {
          setPostContent(savedContent);
        }

        const savedCover = localStorage.getItem("admin_editor_post_cover_image");
        if (savedCover) {
          setPostCoverImage(savedCover);
        }

        const savedEditId = localStorage.getItem("admin_editor_edit_id");
        if (savedEditId && savedEditId !== "null" && savedEditId !== "undefined") {
          setEditId(Number(savedEditId));
        }

        const savedMode = localStorage.getItem("admin_editor_dialog_mode");
        if (savedMode) {
          setDialogMode(savedMode as "add" | "edit");
        }

        toast.info("Đã khôi phục bản nháp bài viết đang viết dở!");
      }
    } catch (e) {
      console.error("Failed to restore editor state", e);
    }
  }, []);

  // Save draft editor state on change
  useEffect(() => {
    try {
      if (currentView === "editor") {
        localStorage.setItem("admin_editor_current_view", "editor");
        localStorage.setItem("admin_editor_post_form", JSON.stringify(postForm));
        localStorage.setItem("admin_editor_post_content", postContent || "");
        if (postCoverImage) {
          localStorage.setItem("admin_editor_post_cover_image", postCoverImage);
        } else {
          localStorage.removeItem("admin_editor_post_cover_image");
        }
        localStorage.setItem("admin_editor_edit_id", editId !== null ? String(editId) : "null");
        localStorage.setItem("admin_editor_dialog_mode", dialogMode);
      } else {
        localStorage.removeItem("admin_editor_current_view");
        localStorage.removeItem("admin_editor_post_form");
        localStorage.removeItem("admin_editor_post_content");
        localStorage.removeItem("admin_editor_post_cover_image");
        localStorage.removeItem("admin_editor_edit_id");
        localStorage.removeItem("admin_editor_dialog_mode");
      }
    } catch (e) {
      console.error("Failed to save/clear editor state", e);
    }
  }, [currentView, postForm, postContent, postCoverImage, editId, dialogMode]);

  // ==========================================
  // HELPERS & DYNAMIC DATA PROCESSORS
  // ==========================================

  // Filtered & Paginated items
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      if (hideDeletedPosts && post.isDeleted) return false;
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.id.toString() === searchQuery;
      const matchesCategory = postCategoryFilter === "all" || post.category === postCategoryFilter;

      let matchesDates = true;
      if (postStartDate) {
        matchesDates = matchesDates && post.createdAt >= postStartDate;
      }
      if (postEndDate) {
        matchesDates = matchesDates && post.createdAt <= postEndDate;
      }

      return matchesSearch && matchesCategory && matchesDates;
    });
  }, [posts, searchQuery, postCategoryFilter, postStartDate, postEndDate, hideDeletedPosts]);

  const filteredCategories = useMemo(() => {
    return categories.filter(cat => {
      return cat.name.toLowerCase().includes(searchQuery.toLowerCase()) || cat.id.toString() === searchQuery;
    });
  }, [categories, searchQuery]);

  const filteredAds = useMemo(() => {
    return ads.filter(ad => {
      return ad.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ad.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ad.id.toString() === searchQuery;
    });
  }, [ads, searchQuery]);

  // Paginated items
  const paginatedPosts = useMemo(() => {
    const start = (postsPage - 1) * itemsPerPage;
    return filteredPosts.slice(start, start + itemsPerPage);
  }, [filteredPosts, postsPage]);

  const paginatedCategories = useMemo(() => {
    const start = (categoriesPage - 1) * itemsPerPage;
    return filteredCategories.slice(start, start + itemsPerPage);
  }, [filteredCategories, categoriesPage]);

  const paginatedAds = useMemo(() => {
    const start = (adsPage - 1) * itemsPerPage;
    return filteredAds.slice(start, start + itemsPerPage);
  }, [filteredAds, adsPage]);

  const filteredAccounts = useMemo(() => {
    return accounts.filter(acc => {
      const query = searchQuery.toLowerCase();
      return (acc.username || "").toLowerCase().includes(query) ||
        (acc.display_name || "").toLowerCase().includes(query) ||
        (acc.email || "").toLowerCase().includes(query);
    });
  }, [accounts, searchQuery]);

  const paginatedAccounts = useMemo(() => {
    const start = (accountsPage - 1) * itemsPerPage;
    return filteredAccounts.slice(start, start + itemsPerPage);
  }, [filteredAccounts, accountsPage]);

  // Pages count
  const postsTotalPages = Math.ceil(filteredPosts.length / itemsPerPage) || 1;
  const categoriesTotalPages = Math.ceil(filteredCategories.length / itemsPerPage) || 1;
  const adsTotalPages = Math.ceil(filteredAds.length / itemsPerPage) || 1;
  const accountsTotalPages = Math.ceil(filteredAccounts.length / itemsPerPage) || 1;

  const filteredMedia = useMemo(() => {
    const filtered = mediaItems.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(mediaSearchQuery.toLowerCase()) ||
        item.url.toLowerCase().includes(mediaSearchQuery.toLowerCase());
      const matchesType = mediaTypeFilter === "all" || item.type === mediaTypeFilter;
      const matchesFolder = activeFolder ? (item.folder === activeFolder) : true;
      return matchesSearch && matchesType && matchesFolder;
    });

    return filtered.sort((a, b) => {
      if (mediaSort === "newest") {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      if (mediaSort === "oldest") {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      if (mediaSort === "az") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [mediaItems, mediaSearchQuery, mediaTypeFilter, activeFolder, mediaSort]);

  const paginatedMedia = useMemo(() => {
    const start = (mediaPage - 1) * mediaItemsPerPage;
    return filteredMedia.slice(start, start + mediaItemsPerPage);
  }, [filteredMedia, mediaPage]);

  const mediaTotalPages = Math.ceil(filteredMedia.length / mediaItemsPerPage) || 1;

  useEffect(() => {
    setMediaPage(1);
  }, [mediaSearchQuery, mediaTypeFilter, activeFolder]);

  // Categories list options
  const categoryOptions = useMemo(() => {
    return Array.from(new Set(categories.map(c => c.name)));
  }, [categories]);

  // ==========================================
  // ACTIONS / EVENT HANDLERS
  // ==========================================
  const handleOpenAddDialog = () => {
    setDialogMode("add");
    setEditId(null);
    if (activeTab === "posts") {
      setPostForm({
        title: "",
        category: categoryOptions[0] || "Tin tức",
        views: 0,
        status: "Nháp",
        createdAt: new Date().toISOString().split("T")[0]
      });
      setPostContent("");
      setPostCoverImage(null);
      setCurrentView("editor");
    } else if (activeTab === "categories") {
      setCategoryForm({
        name: "",
        postCount: 0,
        priority: 0,
        status: "Hoạt động"
      });
      setCategoryDialogOpen(true);
    } else if (activeTab === "accounts") {
      setAccountForm({
        username: "",
        display_name: "",
        email: "",
        password: "",
        role: "admin"
      });
      setEditAccountId(null);
      setAccountDialogOpen(true);
    } else {
      setAdForm({
        name: "",
        position: "Header",
        clicks: 0,
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "Hoạt động",
        link: ""
      });
      setAdDialogOpen(true);
    }
  };

  const handleOpenEditDialog = async (item: any) => {
    setDialogMode("edit");
    setEditId(item.id);
    if (activeTab === "posts") {
      const toastId = toast.loading("Đang tải chi tiết bài viết...");
      try {
        const fullArticle = await getAdminArticleById(item.id);
        if (!fullArticle) {
          throw new Error("Không thể tải thông tin chi tiết bài viết");
        }

        setPostForm({
          id: fullArticle.id,
          title: fullArticle.title,
          category: fullArticle.categories?.name || "Tin tức",
          views: fullArticle.views || 0,
          status: fullArticle.status === 'published' ? 'Đã đăng' : 'Nháp',
          createdAt: fullArticle.created_at ? new Date(fullArticle.created_at).toISOString().split('T')[0] : "",
          coverImage: fullArticle.thumbnail_key || "",
          isDeleted: !!fullArticle.deleted_at
        });
        setPostContent(fullArticle.content ? blocksToHtml(fullArticle.content as any) : "");
        setPostCoverImage(fullArticle.thumbnail_key || null);
        setCurrentView("editor");
        toast.dismiss(toastId);
      } catch (err) {
        console.error(err);
        toast.error("Không thể tải thông tin chi tiết bài viết", { id: toastId });
        toast.dismiss(toastId);
      }
    } else if (activeTab === "categories") {
      setCategoryForm(item);
      setCategoryDialogOpen(true);
    } else if (activeTab === "accounts") {
      setEditAccountId(item.id);
      setAccountForm({
        username: item.username,
        display_name: item.display_name,
        email: item.email || "",
        password: "",
        role: item.role
      });
      setAccountDialogOpen(true);
    } else {
      setAdForm(item);
      setAdDialogOpen(true);
    }
  };

  const handleConfirmDelete = (id: number) => {
    setTargetIdToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDeleteAccount = (id: string) => {
    setTargetAccountIdToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleCategoryPriorityChange = async (catId: number, newPriority: number) => {
    const originalCategories = [...categories];

    // Update local state optimistically
    setCategories(prev =>
      prev.map(cat => (cat.id === catId ? { ...cat, priority: newPriority } : cat))
    );

    try {
      await updateAdminCategory(catId, { priority: newPriority });
      toast.success("Cập nhật priority thành công!");
    } catch (err) {
      setCategories(originalCategories);
      toast.error("Lỗi khi cập nhật priority!");
      console.error(err);
    }
  };

  const handleCategoryStatusToggle = async (cat: Category) => {
    const originalCategories = [...categories];
    const newStatusLabel = cat.status === "Hoạt động" ? "Ngừng hoạt động" : "Hoạt động";
    const apiStatus = newStatusLabel === "Hoạt động" ? "active" : "inactive";

    // Update local state optimistically
    setCategories(prev =>
      prev.map(c => (c.id === cat.id ? { ...c, status: newStatusLabel } : c))
    );

    try {
      await updateAdminCategory(cat.id, { status: apiStatus });
      toast.success(`Đã đổi trạng thái sang "${newStatusLabel}"`);
    } catch (err) {
      setCategories(originalCategories);
      toast.error("Lỗi khi đổi trạng thái danh mục!");
      console.error(err);
    }
  };

  const handleAdStatusToggle = async (ad: Ad) => {
    const originalAds = [...ads];
    const isCurrentActive = ad.status === "Hoạt động" || ad.status === "Chờ chạy";
    const nextDbStatus = isCurrentActive ? "inactive" : "active";

    // Compute optimistic status label
    const now = new Date();
    const startDateStr = ad.startDate ? ad.startDate.split('T')[0] : null;
    const endDateStr = ad.endDate ? ad.endDate.split('T')[0] : null;
    const start = startDateStr ? new Date(startDateStr + 'T00:00:00') : null;
    const end = endDateStr ? new Date(endDateStr + 'T23:59:59') : null;

    let optimisticStatus = "Ngừng hoạt động";
    if (nextDbStatus === "active") {
      if (end && end < now) optimisticStatus = "Đã kết thúc";
      else if (start && start > now) optimisticStatus = "Chờ chạy";
      else optimisticStatus = "Hoạt động";
    }

    // Update local state optimistically
    setAds(prev =>
      prev.map(a => (a.id === ad.id ? { ...a, status: optimisticStatus } : a))
    );

    try {
      await updateAdminAd(ad.id, { status: nextDbStatus });
      toast.success(`Đã đổi trạng thái quảng cáo sang "${optimisticStatus}"`);
    } catch (err) {
      setAds(originalAds);
      toast.error("Lỗi khi đổi trạng thái quảng cáo!");
      console.error(err);
    }
  };

  const executeDelete = async () => {
    if (activeTab !== "accounts" && targetIdToDelete === null) return;
    if (activeTab === "accounts" && targetAccountIdToDelete === null) return;

    const originalCategories = [...categories];
    const originalAds = [...ads];
    const originalAccounts = [...accounts];

    // Close confirmation dialog immediately
    setDeleteConfirmOpen(false);

    try {
      setIsDeleting(true);
      if (activeTab === "posts" && targetIdToDelete !== null) {
        await deleteAdminArticle(targetIdToDelete);
        toast.success("Xóa bài viết thành công!");
        loadPosts();
      } else if (activeTab === "categories" && targetIdToDelete !== null) {
        const idToDelete = targetIdToDelete;
        setCategories(prev => prev.filter(c => c.id !== idToDelete));
        await deleteAdminCategory(idToDelete);
        toast.success("Xóa danh mục thành công!");
      } else if (activeTab === "ads" && targetIdToDelete !== null) {
        const idToDelete = targetIdToDelete;
        setAds(prev => prev.filter(a => a.id !== idToDelete));
        await deleteAdminAd(idToDelete);
        toast.success("Xóa quảng cáo thành công!");
      } else if (activeTab === "accounts" && targetAccountIdToDelete !== null) {
        const idToDelete = targetAccountIdToDelete;
        setAccounts(prev => prev.filter(acc => acc.id !== idToDelete));
        await deleteAdminAccount(idToDelete);
        toast.success("Xóa tài khoản thành công!");
      }
    } catch (err) {
      toast.error("Lỗi khi xóa!");
      if (activeTab === "categories") setCategories(originalCategories);
      if (activeTab === "ads") setAds(originalAds);
      if (activeTab === "accounts") setAccounts(originalAccounts);
    } finally {
      setIsDeleting(false);
      setTargetIdToDelete(null);
      setTargetAccountIdToDelete(null);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "posts") {
      if (!postForm.title?.trim()) {
        toast.error("Vui lòng nhập tiêu đề bài viết!");
        return;
      }
      try {
        setIsPostSaving(true);
        toast.loading(dialogMode === "add" ? "Đang thêm bài viết..." : "Đang cập nhật...", { id: "post-submit" });
        const targetCategory = categories.find(c => c.name === postForm.category);
        const payload = {
          title: postForm.title,
          category_id: targetCategory ? targetCategory.id : undefined,
          views: Number(postForm.views) || 0,
          status: postForm.status === "Đã đăng" ? "published" : "draft",
          thumbnail_key: postCoverImage,
          content: htmlToBlocks(postContent)
        };

        if (dialogMode === "add") {
          await createAdminArticle(payload as any);
          toast.success("Thêm bài viết mới thành công!", { id: "post-submit" });
        } else {
          if (editId) {
            await updateAdminArticle(editId, payload as any);
            toast.success("Cập nhật bài viết thành công!", { id: "post-submit" });
          }
        }
        loadPosts();
        setCurrentView("list");
      } catch (err) {
        toast.error("Có lỗi xảy ra, vui lòng thử lại!", { id: "post-submit" });
      } finally {
        setIsPostSaving(false);
      }
    } else if (activeTab === "categories") {
      if (!categoryForm.name?.trim()) {
        toast.error("Vui lòng nhập tên danh mục!");
        return;
      }
      const originalCategories = [...categories];
      const payload = {
        name: categoryForm.name,
        priority: Number(categoryForm.priority) || 0,
        status: categoryForm.status === "Hoạt động" ? "active" : "inactive"
      };

      setCategoryDialogOpen(false);

      if (dialogMode === "add") {
        const tempId = -Date.now();
        const tempItem: Category = {
          id: tempId,
          name: payload.name,
          priority: payload.priority,
          status: categoryForm.status || "Hoạt động",
          postCount: 0
        };
        setCategories(prev => [tempItem, ...prev]);

        toast.loading("Đang thêm danh mục...", { id: "cat-submit" });
        setIsCategorySaving(true);
        createAdminCategory(payload as any).then((newCat: any) => {
          toast.success("Thêm danh mục mới thành công!", { id: "cat-submit" });
          setCategories(prev =>
            prev.map(c => c.id === tempId ? {
              id: newCat.id,
              name: newCat.name,
              postCount: newCat.postCount || 0,
              priority: newCat.priority || 0,
              status: newCat.status === "active" ? "Hoạt động" : "Ngừng hoạt động"
            } : c)
          );
        }).catch(() => {
          setCategories(originalCategories);
          toast.error("Có lỗi xảy ra, vui lòng thử lại!", { id: "cat-submit" });
        }).finally(() => {
          setIsCategorySaving(false);
        });
      } else {
        if (editId) {
          setCategories(prev =>
            prev.map(c => c.id === editId ? {
              ...c,
              name: payload.name,
              priority: payload.priority,
              status: categoryForm.status || "Hoạt động"
            } : c)
          );

          toast.loading("Đang cập nhật...", { id: "cat-submit" });
          setIsCategorySaving(true);
          updateAdminCategory(editId, payload as any).then(() => {
            toast.success("Cập nhật danh mục thành công!", { id: "cat-submit" });
          }).catch(() => {
            setCategories(originalCategories);
            toast.error("Có lỗi xảy ra, vui lòng thử lại!", { id: "cat-submit" });
          }).finally(() => {
            setIsCategorySaving(false);
          });
        }
      }
    } else if (activeTab === "accounts") {
      if (!accountForm.username?.trim()) {
        toast.error("Vui lòng nhập tên đăng nhập!");
        return;
      }
      if (!accountForm.display_name?.trim()) {
        toast.error("Vui lòng nhập tên hiển thị!");
        return;
      }
      if (!accountForm.email?.trim()) {
        toast.error("Vui lòng nhập email!");
        return;
      }
      if (dialogMode === "add" && !accountForm.password?.trim()) {
        toast.error("Vui lòng nhập mật khẩu!");
        return;
      }

      const originalAccounts = [...accounts];
      setAccountDialogOpen(false);

      if (dialogMode === "add") {
        const payload = {
          email: accountForm.email.trim(),
          password: accountForm.password?.trim(),
          username: accountForm.username.trim(),
          display_name: accountForm.display_name.trim(),
          role: accountForm.role || "admin"
        };
        const tempId = `temp-${Date.now()}`;
        const tempItem: AdminAccount = {
          id: tempId,
          username: payload.username,
          display_name: payload.display_name,
          email: payload.email,
          role: payload.role,
          created_at: new Date().toISOString()
        };
        setAccounts(prev => [tempItem, ...prev]);

        toast.loading("Đang thêm tài khoản...", { id: "account-submit" });
        setIsAccountSaving(true);
        createAdminAccount(payload).then((newAcc: any) => {
          toast.success("Thêm tài khoản mới thành công!", { id: "account-submit" });
          setAccounts(prev =>
            prev.map(acc => acc.id === tempId ? {
              id: newAcc.id,
              username: newAcc.username,
              display_name: newAcc.display_name,
              email: newAcc.email,
              role: newAcc.role,
              created_at: newAcc.created_at
            } : acc)
          );
        }).catch(() => {
          setAccounts(originalAccounts);
          toast.error("Có lỗi xảy ra, vui lòng thử lại!", { id: "account-submit" });
        }).finally(() => {
          setIsAccountSaving(false);
        });
      } else {
        if (editAccountId) {
          const payload: any = {
            email: accountForm.email.trim(),
            username: accountForm.username.trim(),
            display_name: accountForm.display_name.trim(),
            role: accountForm.role || "admin"
          };
          if (accountForm.password?.trim()) {
            payload.password = accountForm.password.trim();
          }

          setAccounts(prev =>
            prev.map(acc => acc.id === editAccountId ? {
              ...acc,
              username: payload.username,
              display_name: payload.display_name,
              email: payload.email,
              role: payload.role
            } : acc)
          );

          toast.loading("Đang cập nhật...", { id: "account-submit" });
          setIsAccountSaving(true);
          updateAdminAccount(editAccountId, payload).then(() => {
            toast.success("Cập nhật tài khoản thành công!", { id: "account-submit" });
          }).catch(err => {
            setAccounts(originalAccounts);
            toast.error(err.message || "Có lỗi xảy ra, vui lòng thử lại!", { id: "account-submit" });
          }).finally(() => {
            setIsAccountSaving(false);
          });
        }
      }
    } else if (activeTab === "ads") {
      if (!adForm.name?.trim()) {
        toast.error("Vui lòng nhập tên quảng cáo!");
        return;
      }
      const originalAds = [...ads];
      const payload = {
        name: adForm.name,
        position: adForm.position || "header",
        type: "image",
        media_key: adForm.image || null,
        target_url: adForm.link || null,
        starts_at: adForm.startDate ? new Date(adForm.startDate + 'T00:00:00').toISOString() : null,
        ends_at: adForm.endDate ? new Date(adForm.endDate + 'T23:59:59').toISOString() : null,
        status: adForm.status === "Ngừng hoạt động" || adForm.status === "Đã kết thúc" ? "inactive" : "active"
      };

      setAdDialogOpen(false);

      const now = new Date();
      const startDateStr = adForm.startDate ? adForm.startDate.split('T')[0] : null;
      const endDateStr = adForm.endDate ? adForm.endDate.split('T')[0] : null;
      const start = startDateStr ? new Date(startDateStr + 'T00:00:00') : null;
      const end = endDateStr ? new Date(endDateStr + 'T23:59:59') : null;

      let computedStatus = "Ngừng hoạt động";
      if (payload.status === "active") {
        if (end && end < now) computedStatus = "Đã kết thúc";
        else if (start && start > now) computedStatus = "Chờ chạy";
        else computedStatus = "Hoạt động";
      }

      if (dialogMode === "add") {
        const tempId = -Date.now();
        const tempItem: Ad = {
          id: tempId,
          name: payload.name,
          position: payload.position,
          clicks: 0,
          startDate: adForm.startDate || "",
          endDate: adForm.endDate || "",
          status: computedStatus,
          image: adForm.image,
          link: adForm.link
        };
        setAds(prev => [tempItem, ...prev]);

        toast.loading("Đang thêm quảng cáo...", { id: "ad-submit" });
        setIsAdSaving(true);
        createAdminAd(payload as any).then((newAd: any) => {
          toast.success("Thêm quảng cáo mới thành công!", { id: "ad-submit" });
          setAds(prev =>
            prev.map(a => a.id === tempId ? {
              id: newAd.id,
              name: newAd.name,
              position: newAd.position,
              clicks: newAd.clicks || 0,
              startDate: newAd.starts_at ? newAd.starts_at.split('T')[0] : "",
              endDate: newAd.ends_at ? newAd.ends_at.split('T')[0] : "",
              status: computedStatus,
              image: newAd.media_key || undefined,
              link: newAd.target_url || undefined
            } : a)
          );
        }).catch(() => {
          setAds(originalAds);
          toast.error("Có lỗi xảy ra, vui lòng thử lại!", { id: "ad-submit" });
        }).finally(() => {
          setIsAdSaving(false);
        });
      } else {
        if (editId) {
          setAds(prev =>
            prev.map(a => a.id === editId ? {
              ...a,
              name: payload.name,
              position: payload.position,
              startDate: adForm.startDate || "",
              endDate: adForm.endDate || "",
              status: computedStatus,
              image: adForm.image,
              link: adForm.link
            } : a)
          );

          toast.loading("Đang cập nhật...", { id: "ad-submit" });
          setIsAdSaving(true);
          updateAdminAd(editId, payload as any).then(() => {
            toast.success("Cập nhật quảng cáo thành công!", { id: "ad-submit" });
          }).catch(() => {
            setAds(originalAds);
            toast.error("Có lỗi xảy ra, vui lòng thử lại!", { id: "ad-submit" });
          }).finally(() => {
            setIsAdSaving(false);
          });
        }
      }
    }
    setDialogOpen(false);
  };

  const resetFilters = (showToast = true) => {
    setSearchQuery("");
    setPostCategoryFilter("all");
    setPostStartDate("");
    setPostEndDate("");
    if (showToast) {
      toast.info("Đã đặt lại bộ lọc!");
    }
  };

  // Navigations trigger tab change
  const handleTabChange = (tab: TabType) => {
    router.push(`/admin/${tab}`);
    resetFilters(false);
    setSidebarOpen(false);
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postForm.title?.trim()) {
      toast.error("Vui lòng nhập tiêu đề bài viết!");
      return;
    }

    try {
      setIsPostSaving(true);
      toast.loading(dialogMode === "add" ? "Đang thêm bài viết..." : "Đang cập nhật...", { id: "post-submit" });
      const targetCategory = categories.find(c => c.name === postForm.category);
      const payload = {
        title: postForm.title,
        category_id: targetCategory ? targetCategory.id : undefined,
        views: Number(postForm.views) || 0,
        status: postForm.status === "Đã đăng" ? "published" : "draft",
        thumbnail_key: postCoverImage,
        content: htmlToBlocks(postContent)
      };

      if (dialogMode === "add") {
        await createAdminArticle(payload as any);
        toast.success("Thêm bài viết mới thành công!", { id: "post-submit" });
      } else {
        if (editId) {
          await updateAdminArticle(editId, payload as any);
          toast.success("Cập nhật bài viết thành công!", { id: "post-submit" });
        }
      }
      loadPosts();
      setCurrentView("list");
    } catch (err) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại!", { id: "post-submit" });
    } finally {
      setIsPostSaving(false);
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
        setPostCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
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

  const handleMediaDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsMediaUploading(true);
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isVideo = file.type.startsWith("video/");
        const isImage = file.type.startsWith("image/");

        if (!isImage && !isVideo) {
          toast.error(`File "${file.name}" không hợp lệ!`);
          continue;
        }

        toast.loading(`Đang tải lên ${file.name}...`, { id: `upload-${file.name}` });
        try {
          const formData = new FormData();
          formData.append("file", file);
          if (activeFolder) formData.append("folder", activeFolder);

          await uploadAdminMedia(formData);
          toast.success(`Tải lên thành công: ${file.name}`, { id: `upload-${file.name}` });
        } catch (err: any) {
          toast.error(`Lỗi tải lên ${file.name}: ${err.message}`, { id: `upload-${file.name}` });
        }
      }
    } finally {
      setIsMediaUploading(false);
      loadMedia();
      e.target.value = "";
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
    setPostContent(editorRef.current.innerHTML);
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



  // Đang xác thực session, hiển thị spinner để tránh flicker màn hình đăng nhập
  if (!isAuthVerified) {
    return (
      <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#E55956] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <AdminLogin
      loginUsername={loginUsername}
      loginPassword={loginPassword}
      showPassword={showPassword}
      isLoading={isLoading}
      onUsernameChange={setLoginUsername}
      onPasswordChange={setLoginPassword}
      onTogglePassword={() => setShowPassword(!showPassword)}
      onSubmit={handleLogin}
    />;
  }

  if (currentView === "editor") {
    return (
      <div className="min-h-screen bg-[#fafbfc] text-[#2c3e50] font-sans antialiased flex flex-col animate-fade-in">

        {/* Top Header */}
        <header className="h-[65px] bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <button
            type="button"
            onClick={() => {
              setCurrentView("list");
              setPostCoverImage(null);
            }}
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
                onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
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
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => executeEditorCommand("bold")}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900"
                title="Bold"
              >
                <Bold size={15} />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => executeEditorCommand("italic")}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900"
                title="Italic"
              >
                <Italic size={15} />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => executeEditorCommand("underline")}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900"
                title="Underline"
              >
                <Underline size={15} />
              </button>

              <div className="h-4 w-px bg-gray-200 mx-1" />

              {/* Alignment */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => executeEditorCommand("justifyLeft")}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900"
                title="Align Left"
              >
                <AlignLeft size={15} />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => executeEditorCommand("justifyCenter")}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900"
                title="Align Center"
              >
                <AlignCenter size={15} />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => executeEditorCommand("justifyRight")}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900"
                title="Align Right"
              >
                <AlignRight size={15} />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => executeEditorCommand("justifyFull")}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900"
                title="Align Justify"
              >
                <AlignJustify size={15} />
              </button>

              <div className="h-4 w-px bg-gray-200 mx-1" />

              {/* Lists */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => executeEditorCommand("insertUnorderedList")}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900"
                title="Bullet List"
              >
                <List size={15} />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => executeEditorCommand("insertOrderedList")}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900"
                title="Numbered List"
              >
                <ListOrdered size={15} />
              </button>

              <div className="h-4 w-px bg-gray-200 mx-1" />

              {/* Media */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setImageDialogOpen(true);
                  loadMedia();
                }}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900"
                title="Insert Image"
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
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900"
                title="Insert Video"
              >
                <Video size={15} />
              </button>

            </div>

            {/* Editor ContentEditable Div */}
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

            {/* Card: Thông tin bài viết */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4 flex-shrink-0">
              <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2.5">
                Thông tin bài viết
              </h3>

              <div className="space-y-3.5">

                {/* Category Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Danh mục</label>
                  <div className="relative">
                    <select
                      value={postForm.category || ""}
                      onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-gray-50/50 appearance-none font-semibold text-gray-800"
                    >
                      {categoryOptions.map(cat => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Status Selection */}
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

            {/* Card: Ảnh bìa */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
              <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2.5 flex-shrink-0">
                Ảnh bìa
              </h3>

              {postCoverImage ? (
                <div className="relative rounded-xl overflow-hidden border border-gray-200 group aspect-[16/10] w-full flex-shrink-0">
                  <img src={postCoverImage} alt="Cover Preview" className="w-full h-full object-cover" />
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
                  onClick={handleTriggerImageUpload}
                  className="border-2 border-dashed border-gray-200 hover:border-[#E55956] hover:bg-[#E55956]/5 transition-all rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer aspect-[16/10] w-full flex-shrink-0 group"
                >
                  <Upload size={24} className="text-gray-400 group-hover:text-[#E55956] transition-colors" />
                  <span className="text-xs font-bold text-gray-500 group-hover:text-[#E55956] transition-colors">Tải ảnh bìa lên</span>
                  <input
                    type="file"
                    id="cover-upload-input"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
              )}
            </div>

          </div>

        </main>

        {/* ==========================================
            MODAL: INSERT IMAGE POPUP
            ========================================== */}
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
          onFileChange={handleInsertImageFileChange}
          onTriggerFileUpload={handleTriggerInsertImageUpload}
          onInsert={handleInsertImage}
          onLoadMedia={loadMedia}
        />

        {/* ==========================================
            MODAL: INSERT VIDEO POPUP (IMPROVED)
            ========================================== */}
        <VideoDialog
          open={videoDialogOpen}
          onOpenChange={setVideoDialogOpen}
          videoUrl={videoUrl}
          videoTab={videoTab}
          videoFile={videoFile}
          videoFileName={videoFileName}
          mediaItems={mediaItems}
          mediaLoading={mediaLoading}
          onUrlChange={(value) => {
            setVideoUrl(value);
            setVideoFile(null);
            setVideoFileName("");
          }}
          onTabChange={setVideoTab}
          onFileChange={handleVideoFileChange}
          onTriggerFileUpload={handleTriggerVideoUpload}
          onInsert={handleInsertVideo}
          onLoadMedia={loadMedia}
        />

        {/* ==========================================
            MODAL: CROP IMAGE POPUP
            ========================================== */}
        <CropDialog
          open={cropDialogOpen}
          onOpenChange={setCropDialogOpen}
          cropImageUrl={cropImageUrl}
          cropImageElementId={cropImageElementId}
          cropArea={cropArea}
          onCropAreaChange={setCropArea}
        />

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex font-sans antialiased text-[#2c3e50]">

      <AdminSidebar
        activeTab={activeTab}
        sidebarOpen={sidebarOpen}
        logoUrl={logoUrl}
        logoWebsiteName={logoWebsiteName}
        onTabChange={handleTabChange}
        onCloseSidebar={() => setSidebarOpen(false)}
      />

      {/* ==========================================
          MAIN CONTENT AREA
          ========================================== */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">

        {/* TOP NAVBAR (for mobile toggling and general status) */}
        <header className="h-[70px] bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-[#2c3e50] hover:text-[#cb4643] transition-colors p-1.5 border border-gray-200 rounded-lg"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <LayoutDashboard size={20} className="text-[#E55956]" />
              <span>
                {activeTab === "dashboard" && "Dashboard"}
                {activeTab === "posts" && "Quản lý bài viết"}
                {activeTab === "categories" && "Quản lý danh mục"}
                {activeTab === "ads" && "Quản lý AD"}
                {activeTab === "logo-footer" && "Logo & Footer"}
                {activeTab === "media" && "Quản lý Media"}
                {activeTab === "accounts" && "Quản lý Tài khoản"}
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-sm font-bold text-gray-900">Administrator</span>
                <span className="text-[10px] font-semibold text-[#E55956] uppercase tracking-wider">Super Admin</span>
              </div>
              <div className="w-[40px] h-[40px] rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 border border-slate-300 select-none">
                AD
              </div>
            </div>

            <button
              type="button"
              onClick={() => setLogoutDialogOpen(true)}
              className="flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 hover:border-red-200 hover:bg-red-50 text-gray-500 hover:text-[#E55956] transition-all"
              title="Đăng xuất"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* CONTAINER CONTENT */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {activeTab === "logo-footer" ? (
            <LogoFooterTab
            loading={settingsLoading}
            isSaving={isSettingsSaving}
            logoUrl={logoUrl}
            logoWebsiteName={logoWebsiteName}
            headerZaloUrl={headerZaloUrl}
            headerEmailUrl={headerEmailUrl}
            footerOperator={footerOperator}
            footerAddress={footerAddress}
            footerPhone={footerPhone}
            footerEmail={footerEmail}
            footerLicense={footerLicense}
            footerResponsible={footerResponsible}
            onLogoUrlChange={setLogoUrl}
            onLogoWebsiteNameChange={setLogoWebsiteName}
            onHeaderZaloUrlChange={setHeaderZaloUrl}
            onHeaderEmailUrlChange={setHeaderEmailUrl}
            onFooterOperatorChange={setFooterOperator}
            onFooterAddressChange={setFooterAddress}
            onFooterPhoneChange={setFooterPhone}
            onFooterEmailChange={setFooterEmail}
            onFooterLicenseChange={setFooterLicense}
            onFooterResponsibleChange={setFooterResponsible}
            onSave={async () => {
              try {
                setIsSettingsSaving(true);
                toast.loading("Đang lưu cấu hình...", { id: "save-logo-footer" });
                const updatedPayload = {
                  brand: {
                    name: logoWebsiteName,
                    logo_url: logoUrl,
                    copyright: footerOperator,
                    utilityLinks: [],
                    socialLinks: [
                      { label: "Zalo", href: headerZaloUrl || "https://zalo.me", platform: "zalo" },
                      { label: "Email", href: headerEmailUrl || "mailto:quangcao@linhka.vn", platform: "email" }
                    ]
                  },
                  footer: {
                    address: footerAddress,
                    phone: footerPhone,
                    email: footerEmail,
                    license: footerLicense,
                    responsible: footerResponsible
                  }
                };
                await updateAdminSettings(updatedPayload);
                cachedSettings = updatedPayload;
                toast.success("Lưu thay đổi thành công!", { id: "save-logo-footer" });
              } catch (err) {
                toast.error("Lỗi khi lưu cấu hình!", { id: "save-logo-footer" });
              } finally {
                setIsSettingsSaving(false);
              }
            }}
            onUploadLogo={async (file) => {
              toast.loading("Đang tải ảnh logo lên...", { id: "upload-logo" });
              try {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("folder", "settings");
                const res = await uploadAdminMedia(formData);
                if (res && res.url) {
                  setLogoUrl(res.url);
                  toast.success("Đã tải logo lên thành công!", { id: "upload-logo" });
                } else {
                  throw new Error("Không nhận được URL từ server");
                }
              } catch (err: any) {
                toast.error("Tải logo thất bại: " + (err.message || err), { id: "upload-logo" });
              }
            }}
          />
          ) : activeTab === "media" ? (
            <MediaTab
              loading={mediaLoading}
              isUploading={isMediaUploading}
              mediaTypeFilter={mediaTypeFilter}
              onMediaTypeFilterChange={setMediaTypeFilter as any}
              mediaSearchQuery={mediaSearchQuery}
              onMediaSearchQueryChange={setMediaSearchQuery}
              folders={folders}
              activeFolder={activeFolder}
              onActiveFolderChange={setActiveFolder}
              onFolderDelete={(folderName) => {
                if (confirm(`Bạn có chắc chắn muốn xóa thư mục "${folderName}" khỏi danh sách hiển thị?`)) {
                  setFolders(prev => prev.filter(f => f !== folderName));
                  if (activeFolder === folderName) setActiveFolder("");
                  toast.success(`Đã xóa thư mục: ${folderName}`);
                }
              }}
              onOpenFolderDialog={() => {
                setNewFolderName("");
                setFolderDialogOpen(true);
              }}
              mediaSort={mediaSort}
              onMediaSortChange={setMediaSort as any}
              filteredMedia={filteredMedia}
              paginatedMedia={paginatedMedia}
              mediaPage={mediaPage}
              mediaTotalPages={mediaTotalPages}
              onMediaPageChange={setMediaPage}
              deletingMediaKey={deletingMediaKey}
              onMediaDelete={(key) => {
                if (confirm("Bạn có chắc chắn muốn xóa file media này không?")) {
                  (async () => {
                    try {
                      setDeletingMediaKey(key);
                      toast.loading("Đang xóa...", { id: "media-delete" });
                      await deleteAdminMedia(key);
                      toast.success("Đã xóa file media thành công!", { id: "media-delete" });
                      loadMedia();
                    } catch (err) {
                      toast.error("Lỗi khi xóa file media!", { id: "media-delete" });
                    } finally {
                      setDeletingMediaKey(null);
                    }
                  })();
                }
              }}
              onMediaCopyUrl={(url) => {
                const copyUrl = url.startsWith("blob:") || url.startsWith("data:") || url.startsWith("http") ? url : (window.location.origin + url);
                navigator.clipboard.writeText(copyUrl);
                toast.success("Đã sao chép link media vào bộ nhớ tạm!");
              }}
              onMediaPreview={(url) => {
                const previewUrl = url.startsWith("blob:") || url.startsWith("data:") || url.startsWith("http") ? url : (window.location.origin + url);
                window.open(previewUrl, '_blank');
              }}
              onUploadClick={() => {
                document.getElementById("media-direct-upload")?.click();
              }}
            />
          ) : (
            <DefaultTab
              activeTab={activeTab}
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
              onPostEdit={(post) => handleOpenEditDialog(post)}
              onPostDelete={(id) => handleConfirmDelete(id)}
              categoriesLoading={categoriesLoading}
              paginatedCategories={paginatedCategories}
              categoriesPage={categoriesPage}
              categoriesTotalPages={categoriesTotalPages}
              onCategoriesPageChange={setCategoriesPage}
              onCategoryEdit={(cat) => handleOpenEditDialog(cat)}
              onCategoryDelete={(id) => handleConfirmDelete(id)}
              onCategoryPriorityChange={handleCategoryPriorityChange}
              onCategoryStatusToggle={handleCategoryStatusToggle}
              adsLoading={adsLoading}
              paginatedAds={paginatedAds}
              adsPage={adsPage}
              adsTotalPages={adsTotalPages}
              onAdsPageChange={setAdsPage}
              onAdEdit={(ad) => handleOpenEditDialog(ad)}
              onAdDelete={(id) => handleConfirmDelete(id)}
              onAdStatusToggle={handleAdStatusToggle}
              accountsLoading={accountsLoading}
              paginatedAccounts={paginatedAccounts}
              accountsPage={accountsPage}
              accountsTotalPages={accountsTotalPages}
              onAccountsPageChange={setAccountsPage}
              onAccountEdit={(acc) => handleOpenEditDialog(acc)}
              onAccountDelete={(id) => handleConfirmDeleteAccount(id)}
              formatDateForDisplay={formatDateForDisplay}
            />
          )}
        </main>

      </div>

      {/* ==========================================
          MODAL: ADD / EDIT DIALOG FORM
          ========================================== */}
      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        dialogMode={dialogMode}
        activeTab={activeTab}
        postForm={postForm}
        categoryOptions={categoryOptions}
        isSaving={isPostSaving}
        onPostFormChange={setPostForm}
        onSubmit={handleFormSubmit}
      />

      {/* ==========================================
          MODAL: ADD / EDIT CATEGORY DIALOG FORM
          ========================================== */}
      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        dialogMode={dialogMode}
        categoryForm={categoryForm}
        isSaving={isCategorySaving}
        onFormChange={setCategoryForm}
        onSubmit={handleFormSubmit}
      />

      {/* ==========================================
          MODAL: ADD / EDIT AD DIALOG FORM
          ========================================== */}
      <AdDialog
        open={adDialogOpen}
        onOpenChange={setAdDialogOpen}
        dialogMode={dialogMode}
        adForm={adForm}
        isSaving={isAdSaving}
        onFormChange={setAdForm}
        onSubmit={handleFormSubmit}
      />

      {/* ==========================================
          MODAL: ADD / EDIT ACCOUNT DIALOG FORM
          ========================================== */}
      <AccountDialog
        open={accountDialogOpen}
        onOpenChange={setAccountDialogOpen}
        dialogMode={dialogMode}
        accountForm={accountForm}
        isSaving={isAccountSaving}
        onFormChange={setAccountForm}
        onSubmit={handleFormSubmit}
      />

      {/* ==========================================
          CONFIRM DELETE DIALOG
          ========================================== */}
      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        activeTab={activeTab}
        isDeleting={isDeleting}
        onConfirm={executeDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setTargetIdToDelete(null);
          setTargetAccountIdToDelete(null);
        }}
      />

      {/* ==========================================
          CONFIRM LOGOUT DIALOG
          ========================================== */}
      <LogoutDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        onConfirm={handleLogout}
      />

      {/* ==========================================
        MODAL: CREATE FOLDER DIALOG
        ========================================== */}
      <FolderDialog
        open={folderDialogOpen}
        onOpenChange={setFolderDialogOpen}
        newFolderName={newFolderName}
        onFolderNameChange={setNewFolderName}
        activeFolder={activeFolder}
        onCreateFolder={async () => {
          try {
            toast.loading("Đang tạo thư mục...", { id: "media-folder" });
            await createAdminFolder(newFolderName.trim(), activeFolder);
            toast.success(`Đã thêm thư mục: ${newFolderName.trim()}`, { id: "media-folder" });
            setFolderDialogOpen(false);
            setNewFolderName("");
            await loadFolders();
          } catch (err) {
            toast.error("Lỗi khi tạo thư mục!", { id: "media-folder" });
          }
        }}
      />

      <input
        type="file"
        id="media-direct-upload"
        className="hidden"
        multiple
        accept="image/*,video/*"
        onChange={handleMediaDirectUpload}
      />

    </div>
  );
}
