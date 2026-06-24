"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  FileText,
  Folder,
  Image as ImageIcon,
  Search,
  Calendar,
  SquarePen,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  PlusCircle,
  HelpCircle,
  TrendingUp,
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
  Download,
  Eye,
  MousePointerClick,
  Lock,
  EyeOff,
  LogOut,
  Layout,
  Film,
  Copy,
  ExternalLink,
  Link2,
  Globe
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { mockSiteSettings } from "@/lib/mockSiteSettings";

// ==========================================
// TYPES
// ==========================================
interface Post {
  id: number;
  title: string;
  category: string;
  views: number;
  status: "Đã đăng" | "Nháp";
  createdAt: string;
  content?: string;
  coverImage?: string;
}

interface Category {
  id: number;
  name: string;
  postCount: number;
  priority: number;
  status: "Hoạt động" | "Ngừng hoạt động";
}

interface Ad {
  id: number;
  name: string;
  position: string;
  clicks: number;
  startDate: string;
  endDate: string;
  status: "Hoạt động" | "Ngừng hoạt động";
  image?: string;
  link?: string;
}

type TabType = "dashboard" | "posts" | "categories" | "ads" | "logo-footer" | "media";

export default function AdminPage() {
  // ==========================================
  // STATE DEFINITIONS
  // ==========================================
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const logged = sessionStorage.getItem("admin_logged_in");
    if (logged === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername || !loginPassword) {
      toast.error("Vui lòng điền đầy đủ thông tin đăng nhập!");
      return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      if (loginUsername.trim() === "admin" && loginPassword.trim() === "123") {
        sessionStorage.setItem("admin_logged_in", "true");
        setIsLoggedIn(true);
        toast.success("Đăng nhập quản trị thành công!");
      } else {
        toast.error("Tên đăng nhập hoặc mật khẩu không chính xác!");
      }
      setIsLoading(false);
    }, 800);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_logged_in");
    setIsLoggedIn(false);
    toast.success("Đã đăng xuất khỏi hệ thống!");
  };

  const [activeTab, setActiveTab] = useState<TabType>("dashboard");

  // ==========================================
  // LOGO & FOOTER + MEDIA MANAGER STATES
  // ==========================================
  interface MediaItem {
    id: number;
    title: string;
    type: "image" | "video";
    url: string;
    size: string;
    dimensions?: string;
    duration?: string;
    createdAt: string;
    folder?: string;
  }

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([
    {
      id: 1,
      title: "banner-homepage.jpg",
      type: "image",
      url: "/marketing_tiles.png",
      size: "1.2 MB",
      dimensions: "1200x800",
      createdAt: "2026-06-20",
      folder: "Thumbnails"
    },
    {
      id: 2,
      title: "banner-homepage.jpg",
      type: "image",
      url: "/laptop_charts.png",
      size: "804 KB",
      dimensions: "1280x800",
      createdAt: "2026-06-20",
      folder: "Thumbnails"
    },
    {
      id: 3,
      title: "intro-video.mp4",
      type: "video",
      url: "https://www.w3schools.com/html/mov_bbb.mp4",
      size: "13.8 MB",
      duration: "00:10",
      createdAt: "2026-06-20",
      folder: "Thumbnails"
    },
    {
      id: 4,
      title: "Nvidia RTX 5090 Leak Cover",
      type: "image",
      url: "/tech_2026_cover.png",
      size: "763 KB",
      dimensions: "1280x720",
      createdAt: "2026-05-24",
      folder: "Public"
    },
    {
      id: 5,
      title: "Apple Vision Pro Space",
      type: "image",
      url: "/tech_2026_vision.png",
      size: "421 KB",
      dimensions: "1280x800",
      createdAt: "2026-05-27",
      folder: "Public"
    },
    {
      id: 6,
      title: "AI robot in warehouse",
      type: "image",
      url: "/tech_2026_warehouse.png",
      size: "891 KB",
      dimensions: "1024x768",
      createdAt: "2026-05-24",
      folder: "Public"
    },
    {
      id: 7,
      title: "Huawei Autonomous Electric Car",
      type: "image",
      url: "/tech_2026_car.png",
      size: "735 KB",
      dimensions: "1920x1080",
      createdAt: "2026-05-24",
      folder: "Videos"
    },
    {
      id: 8,
      title: "eSports News Feature",
      type: "image",
      url: "/esports_news.png",
      size: "1.05 MB",
      dimensions: "1600x900",
      createdAt: "2026-05-28",
      folder: "Public"
    },
    {
      id: 9,
      title: "GTA 6 Beta Gameplay Preview",
      type: "image",
      url: "/gta6_beta.png",
      size: "915 KB",
      dimensions: "1920x1080",
      createdAt: "2026-05-29",
      folder: "Videos"
    },
    {
      id: 10,
      title: "Ốc Mượn Hồn Poster",
      type: "image",
      url: "/oc_muon_hon_poster.png",
      size: "757 KB",
      dimensions: "1080x1920",
      createdAt: "2026-05-27",
      folder: "Public"
    },
    {
      id: 11,
      title: "Soulslike Game Announcement",
      type: "image",
      url: "/soulslike_game.png",
      size: "854 KB",
      dimensions: "1920x1080",
      createdAt: "2026-05-25",
      folder: "Public"
    },
    {
      id: 12,
      title: "Intro Video 2026",
      type: "video",
      url: "https://www.w3schools.com/html/mov_bbb.mp4",
      size: "12.4 MB",
      duration: "00:10",
      createdAt: "2026-06-01",
      folder: "Videos"
    }
  ]);

  const [siteSettings, setSiteSettings] = useState(mockSiteSettings);
  const [logoFooterActiveTab, setLogoFooterActiveTab] = useState<"general" | "footer" | "social" | "columns">("general");

  // Simplified Logo & Footer states matching screenshot
  const [logoWebsiteName, setLogoWebsiteName] = useState("Tên Web");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [footerOperator, setFooterOperator] = useState("Công ty TNHH PHD STUDIO");
  const [footerAddress, setFooterAddress] = useState("246 Lê Đình Cẩn, phường Tân Tạo, quận Bình Tân, Thành phố Hồ Chí Minh");
  const [footerResponsible, setFooterResponsible] = useState("Ông Phạm Hải Đăng");
  const [footerPhone, setFooterPhone] = useState("0327906965");
  const [footerEmail, setFooterEmail] = useState("congtyphdstudio@gmail.com");
  const [footerLicense, setFooterLicense] = useState("Số bao nhiêu ....");

  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [mediaDialogMode, setMediaDialogMode] = useState<"add" | "edit">("add");
  const [mediaEditId, setMediaEditId] = useState<number | null>(null);
  const [mediaForm, setMediaForm] = useState<Partial<MediaItem>>({
    title: "",
    type: "image",
    url: "",
    size: "100 KB",
    dimensions: "1280x720",
    duration: ""
  });

  const [mediaPreviewItem, setMediaPreviewItem] = useState<MediaItem | null>(null);
  const [mediaSearchQuery, setMediaSearchQuery] = useState("");
  const [mediaTypeFilter, setMediaTypeFilter] = useState<"all" | "image" | "video">("all");
  const [activeFolder, setActiveFolder] = useState<string>("Thumbnails");
  const [folders, setFolders] = useState<string[]>(["MP3", "Public", "Thumbnails", "Videos"]);

  const [timeFilter, setTimeFilter] = useState<"today" | "week" | "month" | "year">("month");
  const [dashboardDay, setDashboardDay] = useState("");
  const [dashboardMonth, setDashboardMonth] = useState("");
  const [dashboardYear, setDashboardYear] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<"list" | "editor">("list");
  const [postCoverImage, setPostCoverImage] = useState<string | null>(null);
  const [postContent, setPostContent] = useState<string>("");

  const editorRef = useRef<HTMLDivElement>(null);

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

  // In-Memory Database (initially populated with screenshot data)
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      title: "Tin tức công nghệ mới nhất 2026",
      category: "Công nghệ",
      views: 15204,
      status: "Đã đăng",
      createdAt: "2026-05-24"
    },
    {
      id: 2,
      title: "Kinh tế thế giới trong năm nay",
      category: "Tin tức",
      views: 9325,
      status: "Đã đăng",
      createdAt: "2026-05-24"
    },
    {
      id: 3,
      title: "Kết quả V-League vòng đấu mới nhất",
      category: "Tin tức",
      views: 8520,
      status: "Nháp",
      createdAt: "2026-05-24"
    },
    {
      id: 4,
      title: "Ốc Mượn Hồn tung dàn poster nhân vật cực chất",
      category: "Phim",
      views: 12050,
      status: "Đã đăng",
      createdAt: "2026-05-27"
    },
    {
      id: 5,
      title: "NVIDIA GeForce RTX 5090 rò rỉ thông số khủng",
      category: "Công nghệ",
      views: 18900,
      status: "Đã đăng",
      createdAt: "2026-05-24"
    },
    {
      id: 6,
      title: "One Piece 1116 chính thức ra mắt toàn cầu",
      category: "Anime/Manga",
      views: 31002,
      status: "Đã đăng",
      createdAt: "2026-05-24"
    },
    {
      id: 7,
      title: "Apple công bố chip M5 với nhân xử lý AI thế hệ mới",
      category: "Công nghệ",
      views: 14500,
      status: "Đã đăng",
      createdAt: "2026-05-24"
    },
    {
      id: 8,
      title: "Dự báo thời tiết 28/5/2026: Không khí mát tràn về miền Bắc",
      category: "Tin tức",
      views: 5200,
      status: "Nháp",
      createdAt: "2026-05-28"
    }
  ]);

  const [categories, setCategories] = useState<Category[]>([
    { id: 1, name: "Tin Tức", postCount: 151, priority: 1, status: "Hoạt động" },
    { id: 2, name: "Anime/Manga", postCount: 107, priority: 2, status: "Hoạt động" },
    { id: 3, name: "Công nghệ", postCount: 86, priority: 3, status: "Hoạt động" },
    { id: 4, name: "Phim", postCount: 64, priority: 4, status: "Hoạt động" },
    { id: 5, name: "Kiến thức", postCount: 23, priority: 5, status: "Hoạt động" },
    { id: 6, name: "Cái gì đó", postCount: 23, priority: 0, status: "Hoạt động" }
  ]);

  const [ads, setAds] = useState<Ad[]>([
    {
      id: 1,
      name: "Banner Shopee",
      position: "Header",
      clicks: 1230,
      startDate: "2026-04-20",
      endDate: "2026-06-20",
      status: "Hoạt động",
      image: "/marketing_tiles.png",
      link: "https://shopee.vn"
    },
    {
      id: 2,
      name: "Long châu",
      position: "SideBar 1",
      clicks: 899,
      startDate: "2026-04-23",
      endDate: "2026-07-23",
      status: "Hoạt động",
      image: "/laptop_charts.png",
      link: "https://nhathuoclongchau.com.vn"
    },
    {
      id: 3,
      name: "Nivea",
      position: "SideBar 2",
      clicks: 1003,
      startDate: "2026-05-01",
      endDate: "2026-08-16",
      status: "Hoạt động",
      image: "/tech_2026_cover.png"
    },
    {
      id: 4,
      name: "Thế giới di động",
      position: "Footer",
      clicks: 432,
      startDate: "2026-04-30",
      endDate: "2026-06-30",
      status: "Hoạt động",
      image: "/tech_2026_vision.png",
      link: "https://thegioididong.com"
    },
    {
      id: 5,
      name: "Lazada",
      position: "SideBar 3",
      clicks: 346,
      startDate: "2026-04-17",
      endDate: "2026-07-17",
      status: "Hoạt động"
    }
  ]);

  // Pagination states
  const [postsPage, setPostsPage] = useState(1);
  const [categoriesPage, setCategoriesPage] = useState(1);
  const [adsPage, setAdsPage] = useState(1);
  const [mediaPage, setMediaPage] = useState(1);
  const itemsPerPage = 6;
  const mediaItemsPerPage = 9;

  // Dialog / Modal Form states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [adDialogOpen, setAdDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [targetIdToDelete, setTargetIdToDelete] = useState<number | null>(null);

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
    position: "Header",
    clicks: 0,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    status: "Hoạt động",
    link: ""
  });

  const [editId, setEditId] = useState<number | null>(null);

  // ==========================================
  // HELPERS & DYNAMIC DATA PROCESSORS
  // ==========================================
  const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  // Filtered & Paginated items
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
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
  }, [posts, searchQuery, postCategoryFilter, postStartDate, postEndDate]);

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

  // Pages count
  const postsTotalPages = Math.ceil(filteredPosts.length / itemsPerPage) || 1;
  const categoriesTotalPages = Math.ceil(filteredCategories.length / itemsPerPage) || 1;
  const adsTotalPages = Math.ceil(filteredAds.length / itemsPerPage) || 1;

  const filteredMedia = useMemo(() => {
    return mediaItems.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(mediaSearchQuery.toLowerCase()) ||
        item.url.toLowerCase().includes(mediaSearchQuery.toLowerCase());
      const matchesType = mediaTypeFilter === "all" || item.type === mediaTypeFilter;
      const matchesFolder = activeFolder ? (item.folder === activeFolder) : true;
      return matchesSearch && matchesType && matchesFolder;
    });
  }, [mediaItems, mediaSearchQuery, mediaTypeFilter, activeFolder]);

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

  // Dynamic Dashboard Statistics
  const dashboardStats = useMemo(() => {
    const totalPostsCount = posts.length;
    const totalViewsCount = posts.reduce((sum, p) => sum + p.views, 0);
    const totalClicksCount = ads.reduce((sum, a) => sum + a.clicks, 0);

    switch (timeFilter) {
      case "today":
        return {
          views: (totalViewsCount * 0.05).toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + " lượt",
          viewsVal: (totalViewsCount * 0.05 / 1000).toFixed(1) + "K",
          posts: Math.max(1, Math.round(totalPostsCount * 0.1)),
          clicks: Math.round(totalClicksCount * 0.08).toLocaleString("vi-VN"),
          viewsChange: "+12.4%",
          postsChange: "+2",
          clicksChange: "+8.2%",
          isViewsUp: true,
          isPostsUp: true,
          isClicksUp: true,
        };
      case "week":
        return {
          views: (totalViewsCount * 0.28).toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + " lượt",
          viewsVal: (totalViewsCount * 0.28 / 1000).toFixed(1) + "K",
          posts: Math.max(2, Math.round(totalPostsCount * 0.35)),
          clicks: Math.round(totalClicksCount * 0.38).toLocaleString("vi-VN"),
          viewsChange: "+15.8%",
          postsChange: "+8",
          clicksChange: "+11.4%",
          isViewsUp: true,
          isPostsUp: true,
          isClicksUp: true,
        };
      case "month":
      default:
        return {
          views: "2.4M",
          viewsVal: "2.4M",
          posts: 431,
          clicks: "4,677",
          viewsChange: "+8.7%",
          postsChange: "+32",
          clicksChange: "+5.1%",
          isViewsUp: true,
          isPostsUp: true,
          isClicksUp: true,
        };
      case "year":
        return {
          views: "28.4M",
          viewsVal: "28.4M",
          posts: 1894,
          clicks: "52,480",
          viewsChange: "+24.5%",
          postsChange: "+245",
          clicksChange: "+18.9%",
          isViewsUp: true,
          isPostsUp: true,
          isClicksUp: true,
        };
    }
  }, [timeFilter, posts, ads]);

  // Dynamic Category Stats for Dashboard
  const categoryStats = useMemo(() => {
    const total = categories.reduce((sum, c) => sum + c.postCount, 0) || 1;
    return categories
      .map((cat) => {
        const percentage = Math.round((cat.postCount / total) * 100);
        return {
          name: cat.name,
          count: cat.postCount,
          percentage,
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [categories]);

  // Dynamic top articles
  const topPosts = useMemo(() => {
    return [...posts]
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);
  }, [posts]);

  // Styles mapping helper
  const getCategoryStyles = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("tin tức") || lower.includes("tin")) {
      return {
        color: "from-[#ff6b6b] to-[#E55956]",
        bg: "bg-red-50 text-red-500",
        icon: FileText
      };
    }
    if (lower.includes("anime") || lower.includes("manga")) {
      return {
        color: "from-[#a78bfa] to-[#8b5cf6]",
        bg: "bg-purple-50 text-purple-500",
        icon: Folder
      };
    }
    if (lower.includes("công nghệ") || lower.includes("tech")) {
      return {
        color: "from-[#60a5fa] to-[#3b82f6]",
        bg: "bg-blue-50 text-blue-500",
        icon: TrendingUp
      };
    }
    if (lower.includes("phim")) {
      return {
        color: "from-[#f97316] to-[#ea580c]",
        bg: "bg-orange-50 text-orange-500",
        icon: ImageIcon
      };
    }
    return {
      color: "from-[#2dd4bf] to-[#0d9488]",
      bg: "bg-teal-50 text-teal-500",
      icon: Folder
    };
  };

  // Export report handler
  const handleExportReport = () => {
    toast.success("Bắt đầu kết xuất báo cáo thống kê...");
    setTimeout(() => {
      toast.success("Tải xuống báo cáo hoàn tất! Báo cáo định dạng XLSX đã được lưu.");
    }, 1200);
  };

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
    } else {
      setAdForm({
        name: "",
        position: "Header",
        clicks: 0,
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "Hoạt động",
        image: undefined,
        link: ""
      });
      setAdDialogOpen(true);
    }
  };

  const handleOpenEditDialog = (item: any) => {
    setDialogMode("edit");
    setEditId(item.id);
    if (activeTab === "posts") {
      setPostForm({
        ...item,
        title: "Tin tức công nghệ mới nhất 2026",
        category: "Công nghệ",
        status: "Đã đăng"
      });
      const DEFAULT_TECH_CONTENT = `<p><strong>Năm 2026 đánh dấu bước ngoặt lớn khi công nghệ không còn dừng lại ở màn hình điện thoại mà chính thức bước ra thế giới thực, thay đổi toàn diện cách con người sống và làm việc.</strong></p>\n<p>Theo báo cáo toàn cảnh công nghệ vừa công bố, thị trường năm nay ghi nhận 3 làn sóng đột phá dịch chuyển mạnh mẽ:</p>\n<ul class="list-disc pl-5 space-y-2">\n  <li><strong>Sự trỗi dậy của AI Agent (Tác nhân AI tự chủ):</strong> Trí tuệ nhân tạo năm 2026 đã vượt qua thế giới chatbot thông thường. Các "AI Agent" giờ đây có khả năng tự tư duy, lên kế hoạch và thực hiện các chuỗi công việc phức tạp như một nhân sự thực thụ mà không cần con người can thiệp từng bước.</li>\n</ul>\n<div class="my-4">\n  <img src="/tech_2026_robot.png" alt="Sự trỗi dậy của AI" class="w-full rounded-xl border border-gray-200 shadow-sm" />\n</div>\n<ul class="list-disc pl-5 space-y-2">\n  <li><strong>Kính thực tế hỗn hợp (MR) thay thế Smartphone:</strong> Điện thoại thông minh bắt đầu thoái lui khi các dòng kính thông minh thế hệ mới đạt trọng lượng siêu nhẹ như kính cận. Người dùng dịch chuyển sang làm việc và giải trí hoàn toàn trong không gian số 3D (Spatial Computing).</li>\n</ul>\n<div class="my-4">\n  <img src="/tech_2026_vision.png" alt="Apple Vision Pro" class="w-full rounded-xl border border-gray-200 shadow-sm" />\n  <p class="text-center text-xs italic text-gray-500 mt-1.5">Kính thực tế hỗn hợp Apple Vision Pro</p>\n</div>\n<ul class="list-disc pl-5 space-y-2">\n  <li><strong>Robot nhân hình và Xe tự lái đổ bộ đời sống:</strong> Robot dáng người (Humanoid Robot) đã chính thức được thương mại hóa, tham gia vào các dây chuyền sản xuất và hỗ trợ việc nhà. Song song đó, mạng lưới Robotaxi tự lái cấp độ 4 kết hợp pin trạng thái rắn (sạc 5 phút, đi 1.000km) đã trở thành phương tiện công cộng phổ biến tại các đô thị lớn.</li>\n</ul>\n<div class="my-4 flex flex-col gap-4">\n  <img src="/tech_2026_warehouse.png" alt="Robot in warehouse" class="w-full rounded-xl border border-gray-200 shadow-sm" />\n  <img src="/tech_2026_car.png" alt="Huawei Car" class="w-full rounded-xl border border-gray-200 shadow-sm" />\n  <p class="text-center text-xs italic text-gray-500 mt-1.5">Công nghệ tự lái trên xe điện Huawei: tự lái và tự đỗ mượt mà</p>\n</div>\n<p class="mt-4">Công nghệ năm 2026 mang đến sự tiện nghi tối đa nhưng cũng đặt ra thách thức lớn về an toàn dữ liệu. Việc làm chủ và thích ứng nhanh với các công cụ AI tự chủ sẽ là khóa quyết định năng lực cạnh tranh của cả cá nhân lẫn doanh nghiệp trong giai đoạn này.</p>`;
      setPostContent(DEFAULT_TECH_CONTENT);
      setPostCoverImage("/tech_2026_cover.png");
      setCurrentView("editor");
    } else if (activeTab === "categories") {
      setCategoryForm(item);
      setCategoryDialogOpen(true);
    } else {
      setAdForm(item);
      setAdDialogOpen(true);
    }
  };

  const handleConfirmDelete = (id: number) => {
    setTargetIdToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const executeDelete = () => {
    if (targetIdToDelete === null) return;

    if (activeTab === "posts") {
      setPosts(posts.filter(p => p.id !== targetIdToDelete));
      toast.success("Xóa bài viết thành công!");
    } else if (activeTab === "categories") {
      setCategories(categories.filter(c => c.id !== targetIdToDelete));
      toast.success("Xóa danh mục thành công!");
    } else {
      setAds(ads.filter(a => a.id !== targetIdToDelete));
      toast.success("Xóa quảng cáo thành công!");
    }
    setDeleteConfirmOpen(false);
    setTargetIdToDelete(null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "posts") {
      if (!postForm.title?.trim()) {
        toast.error("Vui lòng nhập tiêu đề bài viết!");
        return;
      }
      if (dialogMode === "add") {
        const newPost: Post = {
          id: posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1,
          title: postForm.title,
          category: postForm.category || "Tin tức",
          views: Number(postForm.views) || 0,
          status: postForm.status || "Đã đăng",
          createdAt: postForm.createdAt || new Date().toISOString().split("T")[0]
        };
        setPosts([newPost, ...posts]);
        toast.success("Thêm bài viết mới thành công!");
      } else {
        setPosts(posts.map(p => (p.id === editId ? { ...p, ...postForm } as Post : p)));
        toast.success("Cập nhật bài viết thành công!");
      }
    } else if (activeTab === "categories") {
      if (!categoryForm.name?.trim()) {
        toast.error("Vui lòng nhập tên danh mục!");
        return;
      }
      if (dialogMode === "add") {
        const newCategory: Category = {
          id: categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1,
          name: categoryForm.name,
          postCount: 0,
          priority: Number(categoryForm.priority) || 0,
          status: categoryForm.status || "Hoạt động"
        };
        setCategories([...categories, newCategory]);
        toast.success("Thêm danh mục mới thành công!");
      } else {
        setCategories(categories.map(c => (c.id === editId ? { ...c, ...categoryForm } as Category : c)));
        toast.success("Cập nhật danh mục thành công!");
      }
      setCategoryDialogOpen(false);
    } else {
      if (!adForm.name?.trim()) {
        toast.error("Vui lòng nhập tên quảng cáo!");
        return;
      }
      if (dialogMode === "add") {
        const newAd: Ad = {
          id: ads.length > 0 ? Math.max(...ads.map(a => a.id)) + 1 : 1,
          name: adForm.name,
          position: adForm.position || "Header",
          clicks: Number(adForm.clicks) || 0,
          startDate: adForm.startDate || new Date().toISOString().split("T")[0],
          endDate: adForm.endDate || new Date().toISOString().split("T")[0],
          status: adForm.status || "Hoạt động",
          image: adForm.image,
          link: adForm.link
        };
        setAds([newAd, ...ads]);
        toast.success("Thêm quảng cáo mới thành công!");
      } else {
        setAds(ads.map(a => (a.id === editId ? { ...a, ...adForm } as Ad : a)));
        toast.success("Cập nhật quảng cáo thành công!");
      }
      setAdDialogOpen(false);
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
    setActiveTab(tab);
    resetFilters(false);
    setSidebarOpen(false);
  };

  const handleSavePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postForm.title?.trim()) {
      toast.error("Vui lòng nhập tiêu đề bài viết!");
      return;
    }

    if (dialogMode === "add") {
      const newPost: Post = {
        id: posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1,
        title: postForm.title,
        category: postForm.category || "Tin tức",
        views: 0,
        status: postForm.status || "Đã đăng",
        createdAt: postForm.createdAt || new Date().toISOString().split("T")[0],
        content: postContent,
        coverImage: postCoverImage || undefined
      };
      setPosts([newPost, ...posts]);
      toast.success("Thêm bài viết mới thành công!");
    } else {
      setPosts(
        posts.map(p =>
          p.id === editId
            ? ({
                ...p,
                ...postForm,
                content: postContent,
                coverImage: postCoverImage || undefined
              } as Post)
            : p
        )
      );
      toast.success("Cập nhật bài viết thành công!");
    }
    setCurrentView("list");
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

  const handleMediaDirectUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");
      
      if (!isImage && !isVideo) {
        toast.error(`File "${file.name}" không đúng định dạng hình ảnh hoặc video!`);
        return;
      }

      let sizeStr = "";
      if (file.size < 1024 * 1024) {
        sizeStr = `${(file.size / 1024).toFixed(0)} KB`;
      } else {
        sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      }

      const objectUrl = URL.createObjectURL(file);
      const titleWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;

      const newItem: MediaItem = {
        id: Date.now() + Math.random(),
        title: file.name,
        type: isVideo ? "video" : "image",
        url: objectUrl,
        size: sizeStr,
        createdAt: new Date().toLocaleDateString("en-GB"),
        folder: activeFolder || "Public"
      };

      setMediaItems(prev => [newItem, ...prev]);
      toast.success(`Đã thêm thành công media: ${file.name}`);

      if (isImage) {
        const img = new Image();
        img.onload = () => {
          const dims = `${img.width}x${img.height}`;
          setMediaItems((prev) =>
            prev.map((m) => (m.id === newItem.id ? { ...m, dimensions: dims } : m))
          );
        };
        img.src = objectUrl;
      } else if (isVideo) {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadedmetadata = () => {
          const minutes = Math.floor(video.duration / 60);
          const seconds = Math.floor(video.duration % 60);
          const durationStr = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
          setMediaItems((prev) =>
            prev.map((m) => (m.id === newItem.id ? { ...m, duration: durationStr } : m))
          );
        };
        video.src = objectUrl;
      }
    });

    e.target.value = "";
  };

  const handleInsertVideo = () => {
    if (!videoFile && !videoUrl.trim()) {
      toast.error("Vui lòng chọn file video hoặc nhập link video!");
      return;
    }

    let videoHtml = "";
    if (videoFile) {
      const videoSrc = URL.createObjectURL(videoFile);
      videoHtml = `\n<video controls src="${videoSrc}" class="w-full max-h-[400px] my-4 rounded-xl border border-gray-200 shadow-sm"></video>\n`;
      toast.success("Đã chọn video từ máy tính!");
    } else if (videoUrl.trim()) {
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
          videoHtml = `\n<iframe class="w-full aspect-video my-4 rounded-xl shadow-sm border border-gray-200" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>\n`;
        } else {
          videoHtml = `\n<iframe class="w-full aspect-video my-4 rounded-xl shadow-sm border border-gray-200" src="${url}" frameborder="0" allowfullscreen></iframe>\n`;
        }
      } else {
        videoHtml = `\n<video controls src="${url}" class="w-full max-h-[400px] my-4 rounded-xl border border-gray-200 shadow-sm"></video>\n`;
      }
      toast.success("Đã chèn video thành công!");
    }

    if (editorRef.current) {
      editorRef.current.innerHTML += videoHtml;
      setPostContent(editorRef.current.innerHTML);
    } else {
      setPostContent((prev) => prev + videoHtml);
    }
    setVideoDialogOpen(false);
    setVideoFile(null);
    setVideoFileName("");
    setVideoUrl("");
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center p-4 font-sans antialiased text-[#2c3e50] select-none">
        <Toaster position="top-right" richColors />
        <div className="max-w-[450px] w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-2xl relative overflow-hidden flex flex-col gap-6">
          {/* Top colored stripe */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-[#E55956]" />
          
          {/* Header */}
          <div className="text-center space-y-2 pt-2">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-[#E55956]/10 flex items-center justify-center text-[#E55956] mb-4">
              <Lock size={32} />
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Trang Quản Trị</h1>
            <p className="text-sm text-gray-500 font-medium">Vui lòng đăng nhập để tiếp tục quản lý hệ thống</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Tên đăng nhập</label>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm font-medium"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm font-medium pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-650 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Note Panel */}
            <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-4 text-xs text-amber-8 tracking-normal space-y-1.5 shadow-sm">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-amber-900">
                <HelpCircle size={14} />
                <span>Thông tin đăng nhập</span>
              </div>
              <p className="font-medium text-amber-800">Sử dụng tài khoản mặc định dưới đây để truy cập hệ thống:</p>
              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                <div className="bg-amber-100/50 p-1.5 rounded-lg border border-amber-200/40">
                  <span className="text-amber-600 block text-[9px] uppercase font-bold tracking-wider mb-0.5">Tài khoản</span>
                  <strong className="text-amber-950 font-bold select-all">admin</strong>
                </div>
                <div className="bg-amber-100/50 p-1.5 rounded-lg border border-amber-200/40">
                  <span className="text-amber-600 block text-[9px] uppercase font-bold tracking-wider mb-0.5">Mật khẩu</span>
                  <strong className="text-amber-950 font-bold select-all">123</strong>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#E55956] hover:bg-[#cb4643] disabled:opacity-75 text-white text-base font-bold rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <span>Đăng nhập</span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center text-xs text-gray-400 font-medium">
            Phát triển bởi Admin Control Center &copy; 2026
          </div>
        </div>
      </div>
    );
  }

  if (currentView === "editor") {
    return (
      <div className="min-h-screen bg-[#fafbfc] text-[#2c3e50] font-sans antialiased flex flex-col animate-fade-in">
        <Toaster position="top-right" richColors />
        
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
            className="flex items-center gap-2 px-5 py-2.5 bg-[#E55956] hover:bg-[#cb4643] text-white text-sm font-bold rounded-xl transition-all shadow-md active:scale-[0.98]"
          >
            <Save size={16} />
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
                <select className="bg-transparent hover:bg-gray-100 px-2.5 py-1.5 rounded-lg text-xs font-semibold outline-none cursor-pointer appearance-none pr-6 border-none text-gray-700">
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
                <select className="bg-transparent hover:bg-gray-100 px-2.5 py-1.5 rounded-lg text-xs font-semibold outline-none cursor-pointer appearance-none pr-6 border-none text-gray-700">
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
                onClick={() => document.execCommand("bold")}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900"
                title="Bold"
              >
                <Bold size={15} />
              </button>
              <button
                type="button"
                onClick={() => document.execCommand("italic")}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900"
                title="Italic"
              >
                <Italic size={15} />
              </button>
              <button
                type="button"
                onClick={() => document.execCommand("underline")}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900"
                title="Underline"
              >
                <Underline size={15} />
              </button>

              <div className="h-4 w-px bg-gray-200 mx-1" />

              {/* Alignment */}
              <button
                type="button"
                onClick={() => document.execCommand("justifyLeft")}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900"
                title="Align Left"
              >
                <AlignLeft size={15} />
              </button>
              <button
                type="button"
                onClick={() => document.execCommand("justifyCenter")}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900"
                title="Align Center"
              >
                <AlignCenter size={15} />
              </button>
              <button
                type="button"
                onClick={() => document.execCommand("justifyRight")}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900"
                title="Align Right"
              >
                <AlignRight size={15} />
              </button>
              <button
                type="button"
                onClick={() => document.execCommand("justifyFull")}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900"
                title="Align Justify"
              >
                <AlignJustify size={15} />
              </button>

              <div className="h-4 w-px bg-gray-200 mx-1" />

              {/* Lists */}
              <button
                type="button"
                onClick={() => document.execCommand("insertUnorderedList")}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900"
                title="Bullet List"
              >
                <List size={15} />
              </button>
              <button
                type="button"
                onClick={() => document.execCommand("insertOrderedList")}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900"
                title="Numbered List"
              >
                <ListOrdered size={15} />
              </button>

              <div className="h-4 w-px bg-gray-200 mx-1" />

              {/* Media */}
              <button
                type="button"
                onClick={() => {
                  const url = prompt("Nhập URL hình ảnh:");
                  if (url) {
                    document.execCommand("insertImage", false, url);
                  }                }}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900"
                title="Insert Image"
              >
                <ImageIcon size={15} />
              </button>
              <button
                type="button"
                onClick={() => setVideoDialogOpen(true)}
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
                className="w-full flex-1 outline-none text-sm leading-relaxed text-gray-800 bg-transparent border-none min-h-[400px]"
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
            MODAL: INSERT VIDEO POPUP
            ========================================== */}
        <Dialog open={videoDialogOpen} onOpenChange={(open) => {
          setVideoDialogOpen(open);
          if (!open) {
            setVideoFile(null);
            setVideoFileName("");
            setVideoUrl("");
          }
        }}>
          <DialogContent className="max-w-[480px] w-[95%] rounded-3xl p-7 border-none shadow-2xl bg-white text-[#2c3e50] outline-none overflow-hidden">
            <DialogHeader className="flex flex-row items-center gap-2 border-b border-gray-100 pb-4 pr-6">
              <div className="w-8 h-8 rounded-lg bg-[#E55956]/10 flex items-center justify-center flex-shrink-0">
                <Video className="text-[#E55956] w-5 h-5" />
              </div>
              <DialogTitle className="text-lg font-bold text-gray-900 leading-none">
                Chèn Video
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Từ máy tính */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Từ máy tính
                </label>
                <div
                  onClick={handleTriggerVideoUpload}
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
                    onChange={handleVideoFileChange}
                  />
                </div>
              </div>

              {/* Separator: Hoặc */}
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <span className="relative px-4 bg-white text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Hoặc
                </span>
              </div>

              {/* Link Youtube / URL Video */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Link Youtube / URL Video
                </label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => {
                    setVideoUrl(e.target.value);
                    if (e.target.value) {
                      setVideoFile(null);
                      setVideoFileName("");
                    }
                  }}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3.5 pt-4 border-t border-gray-100 mt-2">
              <button
                type="button"
                onClick={() => {
                  setVideoDialogOpen(false);
                  setVideoFile(null);
                  setVideoFileName("");
                  setVideoUrl("");
                }}
                className="flex-1 py-3 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 text-sm font-bold rounded-xl transition-all active:scale-[0.98]"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleInsertVideo}
                className="flex-1 py-3 bg-[#E55956] hover:bg-[#cb4643] text-white text-sm font-bold rounded-xl transition-all shadow-md active:scale-[0.98]"
              >
                Chèn Video
              </button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex font-sans antialiased text-[#2c3e50]">
      <Toaster position="top-right" richColors />

      {/* ==========================================
          SIDEBAR PANEL
          ========================================== */}
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <div
        className={`fixed top-0 bottom-0 left-0 z-40 w-[260px] bg-[#E55956] text-white p-5 flex flex-col justify-between transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:sticky lg:top-0 lg:h-screen lg:flex`}
      >
        <div>
          {/* Logo Brand Header */}
          <div className="flex items-center gap-3.5 mb-10 mt-2">
            <div className="w-[50px] h-[50px] bg-[#d9d9d9] rounded-full flex-shrink-0 border-2 border-white/25 shadow-sm" />
            <span className="font-extrabold text-[22px] tracking-tight drop-shadow-sm">{siteSettings.header.logoText || "Logo"}</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto lg:hidden text-white hover:text-red-100 p-1"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            <button
              onClick={() => handleTabChange("dashboard")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                activeTab === "dashboard"
                  ? "bg-[#cb4643] text-white shadow-md border-l-4 border-white"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <LayoutDashboard size={18} className="flex-shrink-0" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => handleTabChange("posts")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                activeTab === "posts"
                  ? "bg-[#cb4643] text-white shadow-md border-l-4 border-white"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <FileText size={18} className="flex-shrink-0" />
              <span>Quản lý bài viết</span>
            </button>

            <button
              onClick={() => handleTabChange("categories")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                activeTab === "categories"
                  ? "bg-[#cb4643] text-white shadow-md border-l-4 border-white"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <Folder size={18} className="flex-shrink-0" />
              <span>Quản lý danh mục</span>
            </button>

            <button
              onClick={() => handleTabChange("ads")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                activeTab === "ads"
                  ? "bg-[#cb4643] text-white shadow-md border-l-4 border-white"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M7 16V8h2a3 3 0 0 1 0 6H7" />
                <path d="M14 16v-6a2 2 0 0 1 4 0v6" />
                <path d="M14 13h4" />
              </svg>
              <span>Quản lý AD</span>
            </button>

            <button
              onClick={() => handleTabChange("logo-footer")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                activeTab === "logo-footer"
                  ? "bg-[#cb4643] text-white shadow-md border-l-4 border-white"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M3 9h18" />
                <path d="M3 15h18" />
              </svg>
              <span>Logo & Footer</span>
            </button>

            <button
              onClick={() => handleTabChange("media")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                activeTab === "media"
                  ? "bg-[#cb4643] text-white shadow-md border-l-4 border-white"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <ImageIcon size={18} className="flex-shrink-0" />
              <span>Quản lý Media</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Link */}
        <div className="pt-4 border-t border-white/20 text-xs text-white/60 text-center">
          Admin Control Center &copy; 2026
        </div>
      </div>

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
              onClick={handleLogout}
              className="flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 hover:border-red-200 hover:bg-red-50 text-gray-500 hover:text-[#E55956] transition-all"
              title="Đăng xuất"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* CONTAINER CONTENT */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {activeTab === "dashboard" ? (
            <>
              {/* HEADER ACTION BANNER */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-2.5 h-full bg-[#E55956]" />
                <div>
                  <h2 className="text-xl font-black text-gray-900 tracking-tight">Dashboard</h2>
                  <p className="text-xs text-gray-500 mt-1">Tổng quan hoạt động và hiệu suất toàn bộ hệ thống</p>
                </div>
                <button
                  type="button"
                  onClick={handleExportReport}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#E55956] hover:bg-[#cb4643] active:scale-[0.98] text-white text-sm font-bold rounded-xl shadow-md transition-all self-start sm:self-center"
                >
                  <Download size={16} />
                  <span>Xuất thống kê</span>
                </button>
              </div>

              {/* FILTER BAR SECTION */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex flex-wrap gap-2 p-1 bg-gray-50 rounded-xl border border-gray-100 w-fit">
                  {[
                    { id: "today", label: "Hôm nay" },
                    { id: "week", label: "Tuần này" },
                    { id: "month", label: "Tháng này" },
                    { id: "year", label: "Năm nay" }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTimeFilter(item.id as any)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all relative ${
                        timeFilter === item.id
                          ? "bg-[#E55956] text-white shadow-sm"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  {/* Select Ngày */}
                  <div className="relative">
                    <select
                      value={dashboardDay}
                      onChange={(e) => setDashboardDay(e.target.value)}
                      className="pl-3 pr-7 py-2.5 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white text-gray-700 appearance-none cursor-pointer min-w-[75px]"
                    >
                      <option value="">Ngày</option>
                      {Array.from({ length: 31 }, (_, i) => (
                        <option key={i + 1} value={String(i + 1).padStart(2, "0")}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>

                  {/* Select Tháng */}
                  <div className="relative">
                    <select
                      value={dashboardMonth}
                      onChange={(e) => setDashboardMonth(e.target.value)}
                      className="pl-3 pr-7 py-2.5 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white text-gray-700 appearance-none cursor-pointer min-w-[90px]"
                    >
                      <option value="">Tháng</option>
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={String(i + 1).padStart(2, "0")}>
                          Tháng {i + 1}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>

                  {/* Select Năm */}
                  <div className="relative">
                    <select
                      value={dashboardYear}
                      onChange={(e) => setDashboardYear(e.target.value)}
                      className="pl-3 pr-7 py-2.5 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white text-gray-700 appearance-none cursor-pointer min-w-[85px]"
                    >
                      <option value="">Năm</option>
                      {Array.from({ length: 151 }, (_, i) => {
                        const year = new Date().getFullYear() + 50 - i;
                        return (
                          <option key={year} value={String(year)}>
                            {year}
                          </option>
                        );
                      })}
                    </select>
                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (dashboardDay || dashboardMonth || dashboardYear) {
                        const parts = [];
                        if (dashboardDay) parts.push(dashboardDay);
                        if (dashboardMonth) parts.push(dashboardMonth);
                        if (dashboardYear) parts.push(dashboardYear);
                        toast.success(`Đã áp dụng bộ lọc ngày: ${parts.join("/")}`);
                      } else {
                        toast.info("Vui lòng chọn ngày, tháng hoặc năm để lọc!");
                      }
                    }}
                    className="px-5 py-2.5 bg-gray-900 hover:bg-black active:scale-[0.98] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center h-[38px]"
                  >
                    Lọc
                  </button>
                </div>
              </div>

              {/* METRICS CARDS SECTION */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full translate-x-12 -translate-y-12 transition-transform duration-500 group-hover:scale-125" />
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tổng lượt xem</span>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center transition-colors group-hover:bg-blue-500 group-hover:text-white">
                      <Eye size={18} />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
                      {dashboardStats.viewsVal}
                    </span>
                    <span className="text-xs font-bold text-emerald-500 flex items-center gap-0.5">
                      <TrendingUp size={12} />
                      {dashboardStats.viewsChange}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-2 font-medium">Lượt xem trang thực tế trong chu kỳ</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full translate-x-12 -translate-y-12 transition-transform duration-500 group-hover:scale-125" />
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bài viết</span>
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center transition-colors group-hover:bg-purple-500 group-hover:text-white">
                      <FileText size={18} />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
                      {dashboardStats.posts}
                    </span>
                    <span className="text-xs font-bold text-emerald-500 flex items-center gap-0.5">
                      <TrendingUp size={12} />
                      {dashboardStats.postsChange}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-2 font-medium">Bài đăng và bản nháp hoạt động</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full translate-x-12 -translate-y-12 transition-transform duration-500 group-hover:scale-125" />
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Clicks QC</span>
                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center transition-colors group-hover:bg-orange-500 group-hover:text-white">
                      <MousePointerClick size={18} />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
                      {dashboardStats.clicks}
                    </span>
                    <span className="text-xs font-bold text-emerald-500 flex items-center gap-0.5">
                      <TrendingUp size={12} />
                      {dashboardStats.clicksChange}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-2 font-medium">Lượt click vào banner QC hiển thị</p>
                </div>
              </div>

              {/* CATEGORIES PROGRESS SECTION */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="border-b border-gray-100 pb-4 mb-5">
                  <h3 className="text-base font-extrabold text-gray-900">Phân bố danh mục</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Phân chia tỉ lệ phần trăm số lượng bài viết hệ thống</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryStats.map((item) => {
                    const style = getCategoryStyles(item.name);
                    const IconComponent = style.icon;
                    return (
                      <div
                        key={item.name}
                        className="p-4.5 rounded-xl border border-gray-100 hover:border-gray-200 transition-all hover:shadow-xs flex flex-col justify-between group bg-slate-50/25"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg ${style.bg} flex items-center justify-center`}>
                              <IconComponent size={15} />
                            </div>
                            <span className="text-xs font-bold text-gray-800">{item.name}</span>
                          </div>
                          <span className="text-xs font-extrabold text-gray-900">{item.percentage}%</span>
                        </div>

                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${style.color}`}
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>

                        <span className="text-[11px] text-gray-400 font-bold self-end">
                          {item.count} bài viết
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* BOTTOM COLUMNS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Column: Bài viết nổi bật */}
                <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="border-b border-gray-100 pb-4 mb-4 flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-extrabold text-gray-900">Bài viết nổi bật</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Top 5 bài viết được xem nhiều nhất trên hệ thống</p>
                      </div>
                      <span className="text-xs font-bold text-[#E55956] bg-red-50 px-2.5 py-1 rounded-lg">Xu hướng</span>
                    </div>

                    <div className="space-y-3">
                      {topPosts.map((post, index) => {
                        const badgeColors = [
                          "bg-gradient-to-br from-red-500 to-[#E55956] text-white shadow-sm",
                          "bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-sm",
                          "bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-sm",
                          "bg-slate-100 text-slate-600",
                          "bg-slate-100 text-slate-600"
                        ];

                        return (
                          <div
                            key={post.id}
                            className="flex items-center justify-between p-3.5 rounded-xl border border-transparent group"
                          >
                            <div className="flex items-center gap-3.5 min-w-0 flex-1">
                              <span className={`w-6.5 h-6.5 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${badgeColors[index] || "bg-gray-100 text-gray-600"}`}>
                                {index + 1}
                              </span>
                              <div className="min-w-0 flex-1">
                                <h4 className="text-xs font-bold text-gray-800 truncate group-hover:text-[#E55956] transition-colors leading-snug">
                                  {post.title}
                                </h4>
                                <span className="inline-block text-[10px] text-gray-400 font-semibold mt-1 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded">
                                  {post.category}
                                </span>
                              </div>
                            </div>
                            
                            <div className="text-right ml-4 flex-shrink-0 flex items-center gap-1.5">
                              <span className="text-xs font-mono font-bold text-gray-900">
                                {post.views.toLocaleString("vi-VN")}
                              </span>
                              <span className="text-[10px] text-gray-400 font-bold">views</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Column: Hoạt động gần đây */}
                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="border-b border-gray-100 pb-4 mb-4 flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-extrabold text-gray-900">Hoạt động gần đây</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Cập nhật hoạt động mới nhất từ hệ thống</p>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>

                    <div className="relative pl-6 border-l-2 border-dashed border-gray-100 space-y-5.5 py-2">
                      <div className="relative group">
                        <div className="absolute -left-[31px] top-0.5 w-[11px] h-[11px] rounded-full bg-[#E55956] border-2 border-white group-hover:scale-125 transition-transform" />
                        <div>
                          <span className="text-[10px] font-bold text-[#E55956] uppercase tracking-wider block">Bài viết mới</span>
                          <h4 className="text-xs font-bold text-gray-800 mt-0.5">
                            Tin tức công nghệ mới nhất 2026
                          </h4>
                          <span className="text-[10px] text-gray-400 font-bold block mt-1">5 phút trước &bull; bởi Admin</span>
                        </div>
                      </div>

                      <div className="relative group">
                        <div className="absolute -left-[31px] top-0.5 w-[11px] h-[11px] rounded-full bg-orange-500 border-2 border-white group-hover:scale-125 transition-transform" />
                        <div>
                          <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider block">Chiến dịch AD mới</span>
                          <h4 className="text-xs font-bold text-gray-800 mt-0.5">
                            Banner Shopee đã bắt đầu chạy quảng cáo
                          </h4>
                          <span className="text-[10px] text-gray-400 font-bold block mt-1">15 phút trước &bull; tự động</span>
                        </div>
                      </div>

                      <div className="relative group">
                        <div className="absolute -left-[31px] top-0.5 w-[11px] h-[11px] rounded-full bg-purple-500 border-2 border-white group-hover:scale-125 transition-transform" />
                        <div>
                          <span className="text-[10px] font-bold text-purple-500 uppercase tracking-wider block">Hệ thống</span>
                          <h4 className="text-xs font-bold text-gray-800 mt-0.5">
                            Đã tối ưu hóa cơ sở dữ liệu bài viết
                          </h4>
                          <span className="text-[10px] text-gray-400 font-bold block mt-1">1 giờ trước &bull; bởi System</span>
                        </div>
                      </div>

                      <div className="relative group">
                        <div className="absolute -left-[31px] top-0.5 w-[11px] h-[11px] rounded-full bg-blue-500 border-2 border-white group-hover:scale-125 transition-transform" />
                        <div>
                          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block">Cập nhật danh mục</span>
                          <h4 className="text-xs font-bold text-gray-800 mt-0.5">
                            Anime/Manga được đổi thứ tự ưu tiên thành 2
                          </h4>
                          <span className="text-[10px] text-gray-400 font-bold block mt-1">2 giờ trước &bull; bởi Admin</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </>
          ) : activeTab === "logo-footer" ? (
            <div className="space-y-6">
              {/* CARD 1: Header action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-150 shadow-sm">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Quản lý Footer & Nhận diện
                  </h2>
                  <p className="text-xs text-gray-500 mt-1 font-medium">
                    Chỉnh sửa thông tin hiển thị cuối trang và logo website
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    toast.loading("Đang lưu cấu hình...", { id: "save-logo-footer" });
                    setTimeout(() => {
                      toast.success("Lưu thay đổi thành công!", { id: "save-logo-footer" });
                    }, 800);
                  }}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#E55956] hover:bg-[#cb4643] active:scale-[0.98] text-white text-sm font-bold rounded-xl shadow-md transition-all self-start sm:self-center"
                >
                  <Download size={16} />
                  <span>Lưu thay đổi</span>
                </button>
              </div>

              {/* CARD 2: Logo Website */}
              <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Logo website
                </h3>

                <div className="flex items-start gap-6">
                  {/* Dashed Upload Box */}
                  <div className="flex flex-col items-center">
                    <label
                      htmlFor="logo-upload-input"
                      className="w-[90px] h-[90px] border-2 border-dashed border-gray-200 hover:border-[#E55956] rounded-xl flex items-center justify-center bg-gray-50/50 cursor-pointer overflow-hidden transition-all group relative"
                    >
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt="Logo Preview"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-[#E55956] transition-colors">
                          <Upload size={20} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                        Đổi ảnh
                      </div>
                    </label>
                    <input
                      type="file"
                      id="logo-upload-input"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            setLogoUrl(reader.result as string);
                            toast.success("Đã chọn ảnh logo mới!");
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById("logo-upload-input")?.click()}
                      className="text-[#E55956] hover:text-[#cb4643] text-xs font-bold transition-colors mt-2 cursor-pointer"
                    >
                      Đổi logo
                    </button>
                  </div>

                  {/* Logo name input */}
                  <div className="flex-1 space-y-1.5">
                    <label className="block text-sm font-bold text-gray-600">
                      Tên website
                    </label>
                    <input
                      type="text"
                      value={logoWebsiteName}
                      onChange={(e) => setLogoWebsiteName(e.target.value)}
                      placeholder="Nhập tên website..."
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white font-medium text-gray-800"
                    />
                  </div>
                </div>
              </div>

              {/* CARD 3: Thông tin Footer */}
              <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-5">
                <h3 className="text-lg font-bold text-gray-900">
                  Thông tin Footer
                </h3>

                <div className="space-y-4">
                  {/* Don vi van hanh */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-bold text-gray-600">
                      Đơn vị vận hành
                    </label>
                    <input
                      type="text"
                      value={footerOperator}
                      onChange={(e) => setFooterOperator(e.target.value)}
                      placeholder="Nhập đơn vị vận hành..."
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white font-medium text-gray-800"
                    />
                  </div>

                  {/* Dia chi */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-bold text-gray-600">
                      Địa chỉ
                    </label>
                    <input
                      type="text"
                      value={footerAddress}
                      onChange={(e) => setFooterAddress(e.target.value)}
                      placeholder="Nhập địa chỉ..."
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white font-medium text-gray-800"
                    />
                  </div>

                  {/* Nguoi chiu trach nhiem */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-bold text-gray-600">
                      Người chịu trách nhiệm nội dung
                    </label>
                    <input
                      type="text"
                      value={footerResponsible}
                      onChange={(e) => setFooterResponsible(e.target.value)}
                      placeholder="Nhập người chịu trách nhiệm..."
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white font-medium text-gray-800"
                    />
                  </div>

                  {/* So dien thoai */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-bold text-gray-600">
                      Số điện thoại
                    </label>
                    <input
                      type="text"
                      value={footerPhone}
                      onChange={(e) => setFooterPhone(e.target.value)}
                      placeholder="Nhập số điện thoại..."
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white font-medium text-gray-800"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-bold text-gray-600">
                      Email
                    </label>
                    <input
                      type="email"
                      value={footerEmail}
                      onChange={(e) => setFooterEmail(e.target.value)}
                      placeholder="Nhập địa chỉ email..."
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white font-medium text-gray-800"
                    />
                  </div>

                  {/* Giay phep */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-bold text-gray-600">
                      Giấy phép thiết lập trang TTDT
                    </label>
                    <input
                      type="text"
                      value={footerLicense}
                      onChange={(e) => setFooterLicense(e.target.value)}
                      placeholder="Nhập số giấy phép..."
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white font-medium text-gray-800"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === "media" ? (
            <div className="space-y-5 animate-fade-in">
              {/* Header Panel */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">Thư viện Media</h2>
                  <p className="text-xs text-gray-500 font-semibold mt-1">Ảnh & video lưu trữ trên Cloudflare R2</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    document.getElementById("media-direct-upload")?.click();
                  }}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#eb5757] hover:bg-[#d94848] text-white text-xs font-bold rounded-xl shadow-sm transition-all self-start sm:self-center"
                >
                  <Upload size={14} />
                  <span>Thêm media</span>
                </button>
                <input
                  type="file"
                  id="media-direct-upload"
                  className="hidden"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleMediaDirectUpload}
                />
              </div>

              {/* Filter & Search Bar Panel */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Filter by Types */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Lọc</span>
                  <div className="flex gap-2">
                    {[
                      { id: "all", label: "Tất cả" },
                      { id: "image", label: "Ảnh" },
                      { id: "video", label: "Video" }
                    ].map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setMediaTypeFilter(type.id as any)}
                        className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                          mediaTypeFilter === type.id
                            ? "bg-[#eb5757] text-white shadow-sm"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search */}
                <div className="flex flex-col gap-1.5 w-full md:w-[350px]">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tìm kiếm thông tin</span>
                  <div className="relative">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold" />
                    <input
                      type="text"
                      value={mediaSearchQuery}
                      onChange={(e) => setMediaSearchQuery(e.target.value)}
                      placeholder="Tìm kiếm"
                      className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-full text-xs outline-none focus:border-[#eb5757] focus:ring-1 focus:ring-[#eb5757]/15 transition-all bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Split Content Area */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Cây thư mục */}
                <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b border-gray-150 bg-gray-50/50">
                    <h3 className="text-sm font-bold text-gray-800">Cây thư mục</h3>
                    <button
                      type="button"
                      onClick={() => {
                        const name = prompt("Nhập tên thư mục mới:");
                        if (name && name.trim()) {
                          setFolders(prev => [...prev, name.trim()]);
                          toast.success(`Đã thêm thư mục: ${name.trim()}`);
                        }
                      }}
                      className="p-1 border border-gray-300 hover:border-gray-400 rounded transition-colors hover:bg-gray-50 flex items-center justify-center"
                    >
                      <Plus size={12} className="text-gray-700 font-bold" />
                    </button>
                  </div>

                  <div className="p-4 space-y-2">
                    {/* Root Folder Item */}
                    <div 
                      onClick={() => setActiveFolder("")}
                      className={`flex items-center gap-1.5 cursor-pointer font-bold text-xs transition-all ${
                        !activeFolder ? "text-[#eb5757]" : "text-gray-800 hover:text-gray-900"
                      }`}
                    >
                      <ChevronDown size={14} className={!activeFolder ? "text-[#eb5757]" : "text-gray-500"} />
                      <span>Root</span>
                    </div>

                    {/* Subdirectories */}
                    <div className="pl-4 mt-1.5 space-y-1 border-l border-gray-100 ml-1.5">
                      {folders.map((folderName) => {
                        const isActive = activeFolder === folderName;
                        return (
                          <div
                            key={folderName}
                            onClick={() => setActiveFolder(folderName)}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                              isActive
                                ? "bg-[#ffe4e4] text-[#eb5757]"
                                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                          >
                            <ChevronRight size={12} className={isActive ? "text-[#eb5757]" : "text-gray-400"} />
                            <span>{folderName}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Column: Main Content */}
                <div className="lg:col-span-9 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-4 min-h-[500px]">
                  {/* Breadcrumb row */}
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                      <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                      </svg>
                      <span className="cursor-pointer hover:text-gray-900" onClick={() => setActiveFolder("")}>Root</span>
                      {activeFolder && (
                        <>
                          <ChevronRight size={12} className="text-gray-450" />
                          <span className="text-gray-900">{activeFolder}</span>
                        </>
                      )}
                    </div>

                    {/* Sorting select */}
                    <div className="relative">
                      <select className="pl-3 pr-7 py-1 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 appearance-none bg-white focus:outline-none min-w-[90px] cursor-pointer">
                        <option>Mới nhất</option>
                        <option>Cũ nhất</option>
                        <option>Tên A-Z</option>
                      </select>
                      <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-800 py-1">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#eb5757] focus:ring-[#eb5757]/20 cursor-pointer" />
                    <span>Chọn tất cả</span>
                    <span className="text-gray-500 font-medium ml-1.5">{filteredMedia.length} file</span>
                  </div>

                  {/* Cards Grid */}
                  {paginatedMedia.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4.5">
                        {paginatedMedia.map((item) => {
                          const formattedDate = (() => {
                            if (item.createdAt.includes("/")) return item.createdAt;
                            const parts = item.createdAt.split("-");
                            if (parts.length === 3) {
                              return `${parts[2]}/${parts[1]}/${parts[0]}`;
                            }
                            return item.createdAt;
                          })();

                          return (
                            <div
                              key={item.id}
                              className="group relative border border-gray-250 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-gray-350 animate-fade-in"
                            >
                              {/* Thumbnail */}
                              <div className="relative aspect-[4/3] w-full bg-gray-100 overflow-hidden flex items-center justify-center border-b border-gray-150">
                                {item.type === "video" ? (
                                  <div className="w-full h-full relative flex items-center justify-center bg-slate-950">
                                    {item.url.startsWith("http") ? (
                                      <div className="w-full h-full flex items-center justify-center text-white/50">
                                        <Video className="w-8 h-8" />
                                      </div>
                                    ) : (
                                      <img
                                        src={item.url}
                                        alt={item.title}
                                        className="w-full h-full object-cover opacity-80"
                                      />
                                    )}
                                    <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                                      <div className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center text-gray-900 shadow-md group-hover:scale-110 transition-transform">
                                        <svg className="w-4.5 h-4.5 fill-current ml-0.5" viewBox="0 0 24 24">
                                          <path d="M8 5v14l11-7z" />
                                        </svg>
                                      </div>
                                    </div>
                                    <span className="absolute bottom-2 right-2 text-[9px] bg-black/60 px-1.5 py-0.5 rounded text-white font-mono font-bold">
                                      {item.duration || "00:00"}
                                    </span>
                                  </div>
                                ) : (
                                  <img
                                    src={item.url}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-102 transition-all duration-500"
                                  />
                                )}

                                {/* Glassmorphic Hover Action Overlay */}
                                <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 z-20">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const copyUrl = item.url.startsWith("blob:") || item.url.startsWith("data:") || item.url.startsWith("http") ? item.url : (window.location.origin + item.url);
                                      navigator.clipboard.writeText(copyUrl);
                                      toast.success("Đã sao chép link media vào bộ nhớ tạm!");
                                    }}
                                    className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 text-gray-800 flex items-center justify-center shadow transition-all active:scale-95"
                                    title="Sao chép đường dẫn"
                                    >
                                      <Copy size={13} />
                                    </button>
                                    <button
                                    type="button"
                                    onClick={() => setMediaPreviewItem(item)}
                                    className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 text-gray-800 flex items-center justify-center shadow transition-all active:scale-95"
                                    title="Xem trước"
                                  >
                                    <Eye size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setMediaDialogMode("edit");
                                      setMediaEditId(item.id);
                                      setMediaForm(item);
                                      setMediaDialogOpen(true);
                                    }}
                                    className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 text-gray-800 flex items-center justify-center shadow transition-all active:scale-95"
                                    title="Chỉnh sửa"
                                  >
                                    <SquarePen size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm("Bạn có chắc chắn muốn xóa file media này không?")) {
                                        setMediaItems(mediaItems.filter((m) => m.id !== item.id));
                                        toast.success("Đã xóa file media thành công!");
                                      }
                                    }}
                                    className="w-8 h-8 rounded-full bg-white hover:bg-red-50 text-red-650 flex items-center justify-center shadow transition-all active:scale-95"
                                    title="Xóa media"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>

                              {/* Info Panel */}
                              <div className="p-3 bg-gray-50 flex flex-col gap-1 border-t border-gray-150">
                                <h5 className="text-[11px] font-bold text-gray-800 truncate leading-snug" title={item.title}>
                                  {item.title}
                                </h5>
                                <div className="flex items-center justify-between text-[9px] text-gray-400 font-bold">
                                  <span>{item.size}</span>
                                  <span>{formattedDate}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Pagination footer */}
                      <div className="flex justify-center mt-6">
                        <div className="inline-flex items-center bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden divide-x divide-gray-200">
                          
                          {/* Prev Button */}
                          <button
                            type="button"
                            onClick={() => {
                              if (mediaPage > 1) setMediaPage(mediaPage - 1);
                            }}
                            disabled={mediaPage === 1}
                            className="px-3 py-2 hover:bg-gray-50 text-gray-500 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                          >
                            <ChevronLeft size={16} />
                          </button>

                          {/* Page Numbers */}
                          {Array.from({ length: mediaTotalPages }).map((_, idx) => {
                            const pageNumber = idx + 1;
                            const isCurrent = mediaPage === pageNumber;

                            return (
                              <button
                                key={pageNumber}
                                type="button"
                                onClick={() => setMediaPage(pageNumber)}
                                className={`px-4 py-2 text-xs font-bold transition-all ${
                                  isCurrent
                                    ? "bg-[#eb5757] text-white"
                                    : "text-gray-700 hover:bg-gray-50"
                                }`}
                              >
                                {pageNumber}
                              </button>
                            );
                          })}

                          {/* Next Button */}
                          <button
                            type="button"
                            onClick={() => {
                              if (mediaPage < mediaTotalPages) setMediaPage(mediaPage + 1);
                            }}
                            disabled={mediaPage === mediaTotalPages}
                            className="px-3 py-2 hover:bg-gray-50 text-gray-500 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                          >
                            <ChevronRight size={16} />
                          </button>

                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="py-20 text-center text-gray-400 font-bold flex-1 flex items-center justify-center">
                      Không tìm thấy file media nào tương ứng.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* HEADER ACTION BANNER */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-150 shadow-sm">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {activeTab === "posts" && "Danh sách tất cả bài viết trên hệ thống"}
                    {activeTab === "categories" && "Quản lý luồng chủ đề danh mục tin tức"}
                    {activeTab === "ads" && "Theo dõi hiệu suất và vị trí các banner quảng cáo"}
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Dễ dàng tìm kiếm, lọc, thêm mới hoặc cập nhật các bản ghi theo thời gian thực.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenAddDialog}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#E55956] hover:bg-[#cb4643] active:scale-[0.98] text-white text-sm font-bold rounded-xl shadow-md transition-all self-start sm:self-center"
                >
                  <Plus size={16} />
                  <span>
                    {activeTab === "posts" && "Thêm bài viết"}
                    {activeTab === "categories" && "Thêm danh mục"}
                    {activeTab === "ads" && "Thêm quảng cáo"}
                  </span>
                </button>
              </div>

              {/* FILTER BAR SECTION */}
              <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end">
                  
                  {/* Search Field (Always present) */}
                  <div className={activeTab === "posts" ? "md:col-span-4" : "md:col-span-12"}>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
                      Tìm kiếm thông tin
                    </label>
                    <div className="relative">
                      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={
                          activeTab === "posts"
                            ? "Tìm kiếm tiêu đề, ID bài viết..."
                            : activeTab === "categories"
                            ? "Tìm tên danh mục, ID..."
                            : "Tìm kiếm tên AD, vị trí, ID..."
                        }
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-gray-50/50"
                      />
                    </div>
                  </div>

                  {/* Date & Category filters only for POSTS */}
                  {activeTab === "posts" && (
                    <>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
                          Ngày bắt đầu
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            value={postStartDate}
                            onChange={(e) => setPostStartDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-gray-50/50"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
                          Ngày kết thúc
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            value={postEndDate}
                            onChange={(e) => setPostEndDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-gray-50/50"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
                          Danh mục
                        </label>
                        <select
                          value={postCategoryFilter}
                          onChange={(e) => setPostCategoryFilter(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-gray-50/50"
                        >
                          <option value="all">Tất cả</option>
                          {categoryOptions.map(cat => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => resetFilters()}
                          className="flex-1 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-bold rounded-xl transition-all"
                        >
                          Xóa bộ lọc
                        </button>
                      </div>
                    </>
                  )}

                </div>
              </div>

              {/* DATA TABLE WRAPPER */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  
                  {/* VIEW: POSTS TABLE */}
                  {activeTab === "posts" && (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50/75 text-gray-500 font-bold text-xs uppercase tracking-wider">
                          <th className="py-4 px-6 w-16 text-center">ID</th>
                          <th className="py-4 px-4 min-w-[280px]">Tiêu đề bài viết</th>
                          <th className="py-4 px-4 w-40">Danh mục</th>
                          <th className="py-4 px-4 w-32 text-right">Lượt xem</th>
                          <th className="py-4 px-4 w-36 text-center">Trạng thái</th>
                          <th className="py-4 px-4 w-40 text-center">Ngày tạo</th>
                          <th className="py-4 px-6 w-28 text-center">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-150">
                        {paginatedPosts.length > 0 ? (
                          paginatedPosts.map((post) => (
                            <tr key={post.id} className="hover:bg-gray-50/50 transition-colors text-sm font-medium">
                              <td className="py-4 px-6 text-center text-gray-400 font-bold">{post.id}</td>
                              <td className="py-4 px-4 text-gray-900 font-semibold line-clamp-2 max-w-[450px]">
                                {post.title}
                              </td>
                              <td className="py-4 px-4 text-gray-600">{post.category}</td>
                              <td className="py-4 px-4 text-right text-gray-900 font-mono font-bold">
                                {post.views.toLocaleString("en-US")}
                              </td>
                              <td className="py-4 px-4 text-center">
                                <span
                                  className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold ${
                                    post.status === "Đã đăng"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-amber-100 text-amber-800"
                                  }`}
                                >
                                  {post.status}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-center text-gray-500">
                                {formatDateForDisplay(post.createdAt)}
                              </td>
                              <td className="py-4 px-6 text-center">
                                <div className="flex items-center justify-center gap-2.5">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditDialog(post)}
                                    className="p-1.5 border border-amber-200 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                                  >
                                    <SquarePen size={15} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleConfirmDelete(post.id)}
                                    className="p-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="py-12 text-center text-gray-400 font-bold">
                              Không tìm thấy bài viết nào tương ứng.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}

                  {/* VIEW: CATEGORIES TABLE */}
                  {activeTab === "categories" && (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50/75 text-gray-500 font-bold text-xs uppercase tracking-wider">
                          <th className="py-4 px-6 w-16 text-center">ID</th>
                          <th className="py-4 px-4">Tên danh mục</th>
                          <th className="py-4 px-4 w-44 text-right">Số bài viết</th>
                          <th className="py-4 px-4 w-40 text-center">Priority</th>
                          <th className="py-4 px-4 w-40 text-center">Trạng thái</th>
                          <th className="py-4 px-6 w-28 text-center">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-150">
                        {paginatedCategories.length > 0 ? (
                          paginatedCategories.map((cat) => (
                            <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors text-sm font-medium">
                              <td className="py-4 px-6 text-center text-gray-400 font-bold">{cat.id}</td>
                              <td className="py-4 px-4 text-gray-900 font-semibold">{cat.name}</td>
                              <td className="py-4 px-4 text-right text-gray-900 font-mono font-bold">
                                {cat.postCount}
                              </td>
                              <td className="py-4 px-4 text-center text-gray-600 font-bold">{cat.priority}</td>
                              <td className="py-4 px-4 text-center">
                                <span
                                  className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold ${
                                    cat.status === "Hoạt động"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {cat.status}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-center">
                                <div className="flex items-center justify-center gap-2.5">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditDialog(cat)}
                                    className="p-1.5 border border-amber-200 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                                  >
                                    <SquarePen size={15} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleConfirmDelete(cat.id)}
                                    className="p-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-gray-400 font-bold">
                              Không tìm thấy danh mục nào tương ứng.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}

                  {/* VIEW: ADS TABLE */}
                  {activeTab === "ads" && (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50/75 text-gray-500 font-bold text-xs uppercase tracking-wider">
                          <th className="py-4 px-6 w-16 text-center">ID</th>
                          <th className="py-4 px-4">Tên AD</th>
                          <th className="py-4 px-4 w-36">Vị trí</th>
                          <th className="py-4 px-4 w-32 text-right">Clicks</th>
                          <th className="py-4 px-4 w-36 text-center">Thời gian BĐ</th>
                          <th className="py-4 px-4 w-36 text-center">Thời gian KT</th>
                          <th className="py-4 px-4 w-36 text-center">Trạng thái</th>
                          <th className="py-4 px-6 w-28 text-center">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-150">
                        {paginatedAds.length > 0 ? (
                          paginatedAds.map((ad) => (
                            <tr key={ad.id} className="hover:bg-gray-50/50 transition-colors text-sm font-medium">
                              <td className="py-4 px-6 text-center text-gray-400 font-bold">{ad.id}</td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  {ad.image ? (
                                    ad.link ? (
                                      <a
                                        href={ad.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="relative w-12 h-7 rounded overflow-hidden border border-gray-200 flex-shrink-0 cursor-pointer hover:opacity-85 transition-opacity"
                                        title="Click to visit link"
                                      >
                                        <img src={ad.image} alt={ad.name} className="w-full h-full object-cover" />
                                      </a>
                                    ) : (
                                      <div className="relative w-12 h-7 rounded overflow-hidden border border-gray-200 flex-shrink-0">
                                        <img src={ad.image} alt={ad.name} className="w-full h-full object-cover" />
                                      </div>
                                    )
                                  ) : (
                                    <div className="w-12 h-7 rounded bg-gray-100 border border-gray-200 flex-shrink-0 flex items-center justify-center text-[10px] text-gray-400 font-bold">
                                      No Image
                                    </div>
                                  )}
                                  <div className="flex flex-col">
                                    <span className="text-gray-900 font-semibold">{ad.name}</span>
                                    {ad.link ? (
                                      <a
                                        href={ad.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] text-[#E55956] hover:underline flex items-center gap-0.5 mt-0.5 font-bold"
                                      >
                                        <ExternalLink size={10} />
                                        <span className="truncate max-w-[150px]">{ad.link}</span>
                                      </a>
                                    ) : (
                                      <span className="text-[10px] text-gray-400 font-medium mt-0.5">(Không có link)</span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-gray-600 font-bold">{ad.position}</td>
                              <td className="py-4 px-4 text-right text-gray-900 font-mono font-bold">
                                {ad.clicks.toLocaleString("en-US")}
                              </td>
                              <td className="py-4 px-4 text-center text-gray-500">
                                {formatDateForDisplay(ad.startDate)}
                              </td>
                              <td className="py-4 px-4 text-center text-gray-500">
                                {formatDateForDisplay(ad.endDate)}
                              </td>
                              <td className="py-4 px-4 text-center">
                                <span
                                  className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold ${
                                    ad.status === "Hoạt động"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {ad.status}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-center">
                                <div className="flex items-center justify-center gap-2.5">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditDialog(ad)}
                                    className="p-1.5 border border-amber-200 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                                  >
                                    <SquarePen size={15} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleConfirmDelete(ad.id)}
                                    className="p-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={8} className="py-12 text-center text-gray-400 font-bold">
                              Không tìm thấy quảng cáo nào tương ứng.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}

                </div>

                {/* PAGINATION CONTROLLER */}
                <div className="py-4 px-6 border-t border-gray-150 flex items-center justify-center">
                  <div className="inline-flex items-center bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden divide-x divide-gray-200">
                    
                    {/* Prev Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (activeTab === "posts" && postsPage > 1) setPostsPage(postsPage - 1);
                        if (activeTab === "categories" && categoriesPage > 1) setCategoriesPage(categoriesPage - 1);
                        if (activeTab === "ads" && adsPage > 1) setAdsPage(adsPage - 1);
                      }}
                      disabled={
                        (activeTab === "posts" && postsPage === 1) ||
                        (activeTab === "categories" && categoriesPage === 1) ||
                        (activeTab === "ads" && adsPage === 1)
                      }
                      className="px-3 py-2 hover:bg-gray-50 text-gray-500 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {/* Page Numbers */}
                    {Array.from({
                      length:
                        activeTab === "posts"
                          ? postsTotalPages
                          : activeTab === "categories"
                          ? categoriesTotalPages
                          : adsTotalPages
                    }).map((_, idx) => {
                      const pageNumber = idx + 1;
                      const isCurrent =
                        activeTab === "posts"
                          ? postsPage === pageNumber
                          : activeTab === "categories"
                          ? categoriesPage === pageNumber
                          : adsPage === pageNumber;

                      return (
                        <button
                          key={pageNumber}
                          type="button"
                          onClick={() => {
                            if (activeTab === "posts") setPostsPage(pageNumber);
                            if (activeTab === "categories") setCategoriesPage(pageNumber);
                            if (activeTab === "ads") setAdsPage(pageNumber);
                          }}
                          className={`px-4 py-2 text-xs font-bold transition-all ${
                            isCurrent
                              ? "bg-[#E55956] text-white"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}

                    {/* Next Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (activeTab === "posts" && postsPage < postsTotalPages) setPostsPage(postsPage + 1);
                        if (activeTab === "categories" && categoriesPage < categoriesTotalPages) setCategoriesPage(categoriesPage + 1);
                        if (activeTab === "ads" && adsPage < adsTotalPages) setAdsPage(adsPage + 1);
                      }}
                      disabled={
                        (activeTab === "posts" && postsPage === postsTotalPages) ||
                        (activeTab === "categories" && categoriesPage === categoriesTotalPages) ||
                        (activeTab === "ads" && adsPage === adsTotalPages)
                      }
                      className="px-3 py-2 hover:bg-gray-50 text-gray-500 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>

                  </div>
                </div>

              </div>
            </>
          )}
        </main>

      </div>

      {/* ==========================================
          MODAL: ADD / EDIT DIALOG FORM
          ========================================== */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md w-[95%] rounded-2xl p-6 border-none shadow-2xl bg-white text-[#2c3e50] outline-none">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <PlusCircle size={20} className="text-[#E55956]" />
              <span>
                {dialogMode === "add" ? "Thêm mới" : "Cập nhật"}{" "}
                {activeTab === "posts" && "bài viết"}
                {activeTab === "categories" && "danh mục"}
                {activeTab === "ads" && "quảng cáo"}
              </span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4 py-3">
            {/* POSTS FIELDS */}
            {activeTab === "posts" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Tiêu đề bài viết
                  </label>
                  <input
                    type="text"
                    value={postForm.title || ""}
                    onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                    placeholder="Nhập tiêu đề..."
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-gray-50/50"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Danh mục
                    </label>
                    <select
                      value={postForm.category || ""}
                      onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-gray-50/50"
                    >
                      {categoryOptions.map(cat => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Trạng thái
                    </label>
                    <select
                      value={postForm.status || ""}
                      onChange={(e) =>
                        setPostForm({ ...postForm, status: e.target.value as "Đã đăng" | "Nháp" })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-gray-50/50"
                    >
                      <option value="Đã đăng">Đã đăng</option>
                      <option value="Nháp">Nháp</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Lượt xem
                    </label>
                    <input
                      type="number"
                      value={postForm.views ?? 0}
                      onChange={(e) => setPostForm({ ...postForm, views: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-gray-50/50"
                      min="0"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Ngày tạo
                    </label>
                    <input
                      type="date"
                      value={postForm.createdAt || ""}
                      onChange={(e) => setPostForm({ ...postForm, createdAt: e.target.value })}
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-gray-50/50"
                    />
                  </div>
                </div>
              </>
            )}





            <DialogFooter className="pt-4 border-t border-gray-100 flex flex-row items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="px-4.5 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-bold rounded-xl transition-all"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#E55956] hover:bg-[#cb4643] text-white text-sm font-bold rounded-xl transition-all shadow-md"
              >
                {dialogMode === "add" ? "Thêm mới" : "Lưu thay đổi"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ==========================================
          MODAL: ADD / EDIT CATEGORY DIALOG FORM
          ========================================== */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="max-w-[460px] w-[95%] rounded-[24px] p-6 border border-gray-100 shadow-2xl bg-white text-[#2c3e50] outline-none [&>button]:hidden">
          <DialogHeader className="border-b border-gray-150 pb-3 -mx-6 px-6">
            <DialogTitle className="text-xl font-bold text-gray-900 text-left">
              {dialogMode === "add" ? "Thêm danh mục" : "Sửa danh mục"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-5 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">
                Tên danh mục
              </label>
              <input
                type="text"
                value={categoryForm.name || ""}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="Nhập tên danh mục..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm font-medium"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">
                Priority
              </label>
              <div className="relative">
                <select
                  value={categoryForm.priority ?? 0}
                  onChange={(e) => setCategoryForm({ ...categoryForm, priority: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm font-semibold text-gray-800 appearance-none cursor-pointer"
                >
                  {Array.from({ length: 11 }).map((_, i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">
                Trạng thái
              </label>
              <div className="relative">
                <select
                  value={categoryForm.status || "Hoạt động"}
                  onChange={(e) => setCategoryForm({ ...categoryForm, status: e.target.value as "Hoạt động" | "Ngừng hoạt động" })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm font-semibold text-gray-800 appearance-none cursor-pointer"
                >
                  <option value="Hoạt động">Hoạt động</option>
                  <option value="Ngừng hoạt động">Ngừng hoạt động</option>
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center justify-center gap-6 pt-6 pb-2">
              <button
                type="button"
                onClick={() => setCategoryDialogOpen(false)}
                className="w-36 py-3 border border-gray-200 hover:bg-gray-50 text-gray-900 text-lg font-bold rounded-xl transition-all shadow-sm flex items-center justify-center"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="w-36 py-3 bg-[#e86b6b] hover:bg-[#e55956] text-white text-lg font-bold rounded-xl transition-all shadow-md flex items-center justify-center"
              >
                {dialogMode === "add" ? "Thêm" : "Sửa"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ==========================================
          MODAL: ADD / EDIT AD DIALOG FORM
          ========================================== */}
      <Dialog open={adDialogOpen} onOpenChange={setAdDialogOpen}>
        <DialogContent className="max-w-[480px] w-[95%] rounded-[24px] p-6 border border-gray-100 shadow-2xl bg-white text-[#2c3e50] outline-none [&>button]:hidden">
          <DialogHeader className="border-b border-gray-150 pb-3 -mx-6 px-6">
            <DialogTitle className="text-xl font-bold text-gray-900 text-left">
              {dialogMode === "add" ? "Thêm quảng cáo" : "Sửa quảng cáo"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">
                Tên quảng cáo
              </label>
              <input
                type="text"
                value={adForm.name || ""}
                onChange={(e) => setAdForm({ ...adForm, name: e.target.value })}
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
                  value={adForm.position || "Header"}
                  onChange={(e) => setAdForm({ ...adForm, position: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm font-semibold text-gray-800 appearance-none cursor-pointer"
                >
                  <option value="Header">Header</option>
                  <option value="Top Banner">Top Banner</option>
                  <option value="SideBar 1">SideBar 1</option>
                  <option value="SideBar 2">SideBar 2</option>
                  <option value="SideBar 3">SideBar 3</option>
                  <option value="Footer">Footer</option>
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">
                Thời gian quảng cáo
              </label>
              <div className="flex items-center gap-4 text-sm font-bold text-gray-900">
                <span className="flex-shrink-0 text-gray-800">Từ:</span>
                <input
                  type="date"
                  value={adForm.startDate || ""}
                  onChange={(e) => setAdForm({ ...adForm, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm"
                  required
                />
                <span className="flex-shrink-0 text-gray-800">Đến:</span>
                <input
                  type="date"
                  value={adForm.endDate || ""}
                  onChange={(e) => setAdForm({ ...adForm, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">
                Trạng thái
              </label>
              <div className="relative">
                <select
                  value={adForm.status || "Hoạt động"}
                  onChange={(e) => setAdForm({ ...adForm, status: e.target.value as "Hoạt động" | "Ngừng hoạt động" })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm font-semibold text-gray-800 appearance-none cursor-pointer"
                >
                  <option value="Hoạt động">Hoạt động</option>
                  <option value="Ngừng hoạt động">Ngừng hoạt động</option>
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">
                Link liên kết (Không bắt buộc)
              </label>
              <input
                type="url"
                value={adForm.link || ""}
                onChange={(e) => setAdForm({ ...adForm, link: e.target.value })}
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
                      onClick={() => setAdForm({ ...adForm, image: undefined })}
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
                          setAdForm({ ...adForm, image: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-6 pt-4 pb-2">
              <button
                type="button"
                onClick={() => setAdDialogOpen(false)}
                className="w-36 py-3 border border-gray-200 hover:bg-gray-50 text-gray-900 text-lg font-bold rounded-xl transition-all shadow-sm flex items-center justify-center"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="w-36 py-3 bg-[#e86b6b] hover:bg-[#e55956] text-white text-lg font-bold rounded-xl transition-all shadow-md flex items-center justify-center"
              >
                {dialogMode === "add" ? "Thêm" : "Sửa"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ==========================================
          CONFIRM DELETE DIALOG
          ========================================== */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-[460px] w-[95%] rounded-[24px] p-6 border border-gray-100 shadow-2xl bg-white text-[#2c3e50] outline-none [&>button]:hidden">
          <DialogHeader className="border-b border-gray-150 pb-3 -mx-6 px-6">
            <DialogTitle className="text-xl font-bold text-gray-900 text-left">
              {activeTab === "posts" && "Xóa bài viết"}
              {activeTab === "categories" && "Xóa danh mục"}
              {activeTab === "ads" && "Xóa quảng cáo"}
            </DialogTitle>
          </DialogHeader>

          <div className="py-6 text-center space-y-2">
            <h3 className="text-xl font-bold text-gray-900 leading-snug">
              {activeTab === "posts" && "Bạn có chắc chắn muốn xóa bài viết"}
              {activeTab === "categories" && "Bạn có chắc chắn muốn xóa danh mục"}
              {activeTab === "ads" && "Bạn có chắc chắn muốn xóa quảng cáo"}
            </h3>
            <p className="text-sm font-semibold text-[#E55956]">
              Dữ liệu bị xóa sẽ không thể khôi phục
            </p>
          </div>

          <div className="flex items-center justify-center gap-6 pb-2">
            <button
              onClick={() => setDeleteConfirmOpen(false)}
              className="w-36 py-3 border border-gray-200 hover:bg-gray-50 text-gray-900 text-lg font-bold rounded-xl transition-all shadow-sm flex items-center justify-center"
            >
              Không
            </button>
            <button
              onClick={executeDelete}
              className="w-36 py-3 bg-[#e86b6b] hover:bg-[#e55956] text-white text-lg font-bold rounded-xl transition-all shadow-md flex items-center justify-center"
            >
              Có
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ==========================================
          MODAL: ADD / EDIT MEDIA DIALOG
          ========================================== */}
      <Dialog open={mediaDialogOpen} onOpenChange={setMediaDialogOpen}>
        <DialogContent className="max-w-[460px] w-[95%] rounded-[24px] p-6 border border-gray-100 shadow-2xl bg-white text-[#2c3e50] outline-none [&>button]:hidden">
          <DialogHeader className="border-b border-gray-150 pb-3 -mx-6 px-6">
            <DialogTitle className="text-xl font-bold text-gray-900 text-left">
              {mediaDialogMode === "add" ? "Thêm file Media" : "Sửa file Media"}
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!mediaForm.title?.trim() || !mediaForm.url?.trim()) {
                toast.error("Vui lòng điền đầy đủ tiêu đề và URL!");
                return;
              }

              if (mediaDialogMode === "add") {
                const newItem: MediaItem = {
                  id: mediaItems.length > 0 ? Math.max(...mediaItems.map(m => m.id)) + 1 : 1,
                  title: mediaForm.title,
                  type: mediaForm.type || "image",
                  url: mediaForm.url,
                  size: mediaForm.size || "150 KB",
                  dimensions: mediaForm.type === "image" ? (mediaForm.dimensions || "1280x720") : undefined,
                  duration: mediaForm.type === "video" ? (mediaForm.duration || "01:00") : undefined,
                  createdAt: new Date().toLocaleDateString("en-GB"),
                  folder: activeFolder || "Public"
                };
                setMediaItems([newItem, ...mediaItems]);
                toast.success("Thêm file media mới thành công!");
              } else {
                setMediaItems(
                  mediaItems.map((m) =>
                    m.id === mediaEditId
                      ? ({ ...m, ...mediaForm } as MediaItem)
                      : m
                  )
                );
                toast.success("Cập nhật thông tin file media thành công!");
              }
              setMediaDialogOpen(false);
            }}
            className="space-y-4 pt-4"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Tiêu đề Media
              </label>
              <input
                type="text"
                value={mediaForm.title || ""}
                onChange={(e) => setMediaForm({ ...mediaForm, title: e.target.value })}
                placeholder="Nhập tiêu đề..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm font-medium"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Loại định dạng
              </label>
              <div className="relative">
                <select
                  value={mediaForm.type || "image"}
                  onChange={(e) => setMediaForm({ ...mediaForm, type: e.target.value as "image" | "video" })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm font-semibold text-gray-800 appearance-none cursor-pointer"
                >
                  <option value="image">Hình ảnh (Image)</option>
                  <option value="video">Phim / Video</option>
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Đường dẫn URL
              </label>
              <input
                type="text"
                value={mediaForm.url || ""}
                onChange={(e) => setMediaForm({ ...mediaForm, url: e.target.value })}
                placeholder="Ví dụ: /soulslike_game.png hoặc URL ngoài..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm font-mono"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Kích thước (Size)
                </label>
                <input
                  type="text"
                  value={mediaForm.size || ""}
                  onChange={(e) => setMediaForm({ ...mediaForm, size: e.target.value })}
                  placeholder="Ví dụ: 350 KB, 12 MB..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm font-medium"
                />
              </div>

              {mediaForm.type === "video" ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Thời lượng (Duration)
                  </label>
                  <input
                    type="text"
                    value={mediaForm.duration || ""}
                    onChange={(e) => setMediaForm({ ...mediaForm, duration: e.target.value })}
                    placeholder="Ví dụ: 01:24..."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm font-mono"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Độ phân giải (Resolution)
                  </label>
                  <input
                    type="text"
                    value={mediaForm.dimensions || ""}
                    onChange={(e) => setMediaForm({ ...mediaForm, dimensions: e.target.value })}
                    placeholder="Ví dụ: 1920x1080..."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm font-mono"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-6 pt-6 pb-2">
              <button
                type="button"
                onClick={() => setMediaDialogOpen(false)}
                className="w-36 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-900 text-sm font-bold rounded-xl transition-all shadow-sm flex items-center justify-center"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="w-36 py-2.5 bg-[#e86b6b] hover:bg-[#e55956] text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center"
              >
                {mediaDialogMode === "add" ? "Thêm mới" : "Lưu sửa"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ==========================================
          MODAL: MEDIA PREVIEW DIALOG
          ========================================== */}
      <Dialog open={mediaPreviewItem !== null} onOpenChange={(open) => {
        if (!open) setMediaPreviewItem(null);
      }}>
        <DialogContent className="max-w-[800px] w-[95%] rounded-[24px] p-5 border border-gray-100 shadow-2xl bg-slate-950 text-white outline-none flex flex-col gap-4 [&>button]:text-white">
          <DialogHeader className="border-b border-white/10 pb-3">
            <DialogTitle className="text-base font-bold text-white truncate text-left pr-8">
              Preview: {mediaPreviewItem?.title}
            </DialogTitle>
          </DialogHeader>

          <div className="w-full aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center border border-white/5 shadow-inner">
            {mediaPreviewItem?.type === "video" ? (
              <video
                src={mediaPreviewItem.url}
                controls
                autoPlay
                className="w-full max-h-[450px] object-contain"
              />
            ) : (
              mediaPreviewItem && (
                <img
                  src={mediaPreviewItem.url}
                  alt={mediaPreviewItem.title}
                  className="w-full h-full object-contain"
                />
              )
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-semibold text-gray-400 gap-3 border-t border-white/5 pt-3">
            <div className="space-y-1">
              <p>
                Đường dẫn: <span className="font-mono text-white select-all">{mediaPreviewItem?.url}</span>
              </p>
              <div className="flex gap-4">
                <span>Dung lượng: <strong className="text-white">{mediaPreviewItem?.size}</strong></span>
                {mediaPreviewItem?.dimensions && (
                  <span>Độ phân giải: <strong className="text-white font-mono">{mediaPreviewItem.dimensions}</strong></span>
                )}
                {mediaPreviewItem?.duration && (
                  <span>Thời lượng: <strong className="text-white font-mono">{mediaPreviewItem.duration}</strong></span>
                )}
                <span>Ngày tạo: <strong className="text-white">{mediaPreviewItem?.createdAt}</strong></span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (mediaPreviewItem) {
                  const copyUrl = mediaPreviewItem.url.startsWith("blob:") || mediaPreviewItem.url.startsWith("data:") || mediaPreviewItem.url.startsWith("http") ? mediaPreviewItem.url : (window.location.origin + mediaPreviewItem.url);
                  navigator.clipboard.writeText(copyUrl);
                  toast.success("Đã sao chép link media vào bộ nhớ tạm!");
                }
              }}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-center"
            >
              <Copy size={13} />
              <span>Copy Link</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
