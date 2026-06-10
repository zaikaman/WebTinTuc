"use client";

import React, { useState, useMemo } from "react";
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
  ChevronDown
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
}

type TabType = "posts" | "categories" | "ads";

export default function AdminPage() {
  // ==========================================
  // STATE DEFINITIONS
  // ==========================================
  const [activeTab, setActiveTab] = useState<TabType>("posts");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<"list" | "editor">("list");
  const [postCoverImage, setPostCoverImage] = useState<string | null>(null);
  const [postContent, setPostContent] = useState<string>("");

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
      status: "Hoạt động"
    },
    {
      id: 2,
      name: "Long châu",
      position: "SideBar 1",
      clicks: 899,
      startDate: "2026-04-23",
      endDate: "2026-07-23",
      status: "Hoạt động"
    },
    {
      id: 3,
      name: "Nivea",
      position: "SideBar 2",
      clicks: 1003,
      startDate: "2026-05-01",
      endDate: "2026-08-16",
      status: "Hoạt động"
    },
    {
      id: 4,
      name: "Thế giới di động",
      position: "Footer",
      clicks: 432,
      startDate: "2026-04-30",
      endDate: "2026-06-30",
      status: "Hoạt động"
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
  const itemsPerPage = 6;

  // Dialog / Modal Form states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
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
    status: "Hoạt động"
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
        priority: categories.length + 1,
        status: "Hoạt động"
      });
      setDialogOpen(true);
    } else {
      setAdForm({
        name: "",
        position: "Header",
        clicks: 0,
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "Hoạt động"
      });
      setDialogOpen(true);
    }
  };

  const handleOpenEditDialog = (item: any) => {
    setDialogMode("edit");
    setEditId(item.id);
    if (activeTab === "posts") {
      setPostForm(item);
      setPostContent(item.content || "");
      setPostCoverImage(item.coverImage || null);
      setCurrentView("editor");
    } else if (activeTab === "categories") {
      setCategoryForm(item);
      setDialogOpen(true);
    } else {
      setAdForm(item);
      setDialogOpen(true);
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
          postCount: Number(categoryForm.postCount) || 0,
          priority: Number(categoryForm.priority) || 0,
          status: categoryForm.status || "Hoạt động"
        };
        setCategories([...categories, newCategory]);
        toast.success("Thêm danh mục mới thành công!");
      } else {
        setCategories(categories.map(c => (c.id === editId ? { ...c, ...categoryForm } as Category : c)));
        toast.success("Cập nhật danh mục thành công!");
      }
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
          status: adForm.status || "Hoạt động"
        };
        setAds([newAd, ...ads]);
        toast.success("Thêm quảng cáo mới thành công!");
      } else {
        setAds(ads.map(a => (a.id === editId ? { ...a, ...adForm } as Ad : a)));
        toast.success("Cập nhật quảng cáo thành công!");
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
              <button type="button" className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900" title="Bold">
                <Bold size={15} />
              </button>
              <button type="button" className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900" title="Italic">
                <Italic size={15} />
              </button>
              <button type="button" className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900" title="Underline">
                <Underline size={15} />
              </button>

              <div className="h-4 w-px bg-gray-200 mx-1" />

              {/* Alignment */}
              <button type="button" className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900" title="Align Left">
                <AlignLeft size={15} />
              </button>
              <button type="button" className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900" title="Align Center">
                <AlignCenter size={15} />
              </button>
              <button type="button" className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900" title="Align Right">
                <AlignRight size={15} />
              </button>
              <button type="button" className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900" title="Align Justify">
                <AlignJustify size={15} />
              </button>

              <div className="h-4 w-px bg-gray-200 mx-1" />

              {/* Lists */}
              <button type="button" className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900" title="Bullet List">
                <List size={15} />
              </button>
              <button type="button" className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900" title="Numbered List">
                <ListOrdered size={15} />
              </button>

              <div className="h-4 w-px bg-gray-200 mx-1" />

              {/* Media */}
              <button type="button" className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900" title="Insert Image">
                <ImageIcon size={15} />
              </button>
              <button type="button" className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900" title="Insert Video">
                <Video size={15} />
              </button>

            </div>

            {/* Editor Textarea */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col min-h-[450px]">
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Bắt đầu nội dung bài viết..."
                className="w-full flex-1 resize-none outline-none text-sm leading-relaxed text-gray-800 placeholder-gray-400 bg-transparent border-none"
              />
            </div>

          </div>

          {/* Right Column (Settings) */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            
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
        } lg:relative lg:flex`}
      >
        <div>
          {/* Logo Brand Header */}
          <div className="flex items-center gap-3.5 mb-10 mt-2">
            <div className="w-[50px] h-[50px] bg-[#d9d9d9] rounded-full flex-shrink-0 border-2 border-white/25 shadow-sm" />
            <span className="font-extrabold text-[22px] tracking-tight drop-shadow-sm">Logo</span>
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
              <ImageIcon size={18} className="flex-shrink-0" />
              <span>Quản lý AD</span>
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
                {activeTab === "posts" && "Quản lý bài viết"}
                {activeTab === "categories" && "Quản lý danh mục"}
                {activeTab === "ads" && "Quản lý AD"}
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-bold text-gray-900">Administrator</span>
              <span className="text-[10px] font-semibold text-[#E55956] uppercase tracking-wider">Super Admin</span>
            </div>
            <div className="w-[40px] h-[40px] rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 border border-slate-300">
              AD
            </div>
          </div>
        </header>

        {/* CONTAINER CONTENT */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          
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

          {/* ==========================================
              DATA TABLE WRAPPER
              ========================================== */}
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
                                onClick={() => handleOpenEditDialog(post)}
                                className="p-1.5 border border-amber-200 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                              >
                                <SquarePen size={15} />
                              </button>
                              <button
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
                                onClick={() => handleOpenEditDialog(cat)}
                                className="p-1.5 border border-amber-200 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                              >
                                <SquarePen size={15} />
                              </button>
                              <button
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
                          <td className="py-4 px-4 text-gray-900 font-semibold">{ad.name}</td>
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
                                onClick={() => handleOpenEditDialog(ad)}
                                className="p-1.5 border border-amber-200 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                              >
                                <SquarePen size={15} />
                              </button>
                              <button
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

            {/* ==========================================
                PAGINATION CONTROLLER
                ========================================== */}
            <div className="py-4 px-6 border-t border-gray-150 flex items-center justify-center">
              <div className="inline-flex items-center bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden divide-x divide-gray-200">
                
                {/* Prev Button */}
                <button
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

            {/* CATEGORIES FIELDS */}
            {activeTab === "categories" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Tên danh mục
                  </label>
                  <input
                    type="text"
                    value={categoryForm.name || ""}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    placeholder="Nhập tên danh mục..."
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-gray-50/50"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Priority
                    </label>
                    <input
                      type="number"
                      value={categoryForm.priority ?? 0}
                      onChange={(e) => setCategoryForm({ ...categoryForm, priority: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-gray-50/50"
                      min="0"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Số bài viết
                    </label>
                    <input
                      type="number"
                      value={categoryForm.postCount ?? 0}
                      onChange={(e) => setCategoryForm({ ...categoryForm, postCount: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-gray-50/50"
                      min="0"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Trạng thái
                  </label>
                  <select
                    value={categoryForm.status || ""}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        status: e.target.value as "Hoạt động" | "Ngừng hoạt động"
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-gray-50/50"
                  >
                    <option value="Hoạt động">Hoạt động</option>
                    <option value="Ngừng hoạt động">Ngừng hoạt động</option>
                  </select>
                </div>
              </>
            )}

            {/* ADS FIELDS */}
            {activeTab === "ads" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Tên AD
                  </label>
                  <input
                    type="text"
                    value={adForm.name || ""}
                    onChange={(e) => setAdForm({ ...adForm, name: e.target.value })}
                    placeholder="Nhập tên AD..."
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-gray-50/50"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Vị trí hiển thị
                    </label>
                    <select
                      value={adForm.position || ""}
                      onChange={(e) => setAdForm({ ...adForm, position: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-gray-50/50"
                    >
                      <option value="Header">Header</option>
                      <option value="Top Banner">Top Banner</option>
                      <option value="SideBar 1">SideBar 1</option>
                      <option value="SideBar 2">SideBar 2</option>
                      <option value="SideBar 3">SideBar 3</option>
                      <option value="Footer">Footer</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Clicks
                    </label>
                    <input
                      type="number"
                      value={adForm.clicks ?? 0}
                      onChange={(e) => setAdForm({ ...adForm, clicks: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-gray-50/50"
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Ngày bắt đầu
                    </label>
                    <input
                      type="date"
                      value={adForm.startDate || ""}
                      onChange={(e) => setAdForm({ ...adForm, startDate: e.target.value })}
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-gray-50/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Ngày kết thúc
                    </label>
                    <input
                      type="date"
                      value={adForm.endDate || ""}
                      onChange={(e) => setAdForm({ ...adForm, endDate: e.target.value })}
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-gray-50/50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Trạng thái
                  </label>
                  <select
                    value={adForm.status || ""}
                    onChange={(e) =>
                      setAdForm({ ...adForm, status: e.target.value as "Hoạt động" | "Ngừng hoạt động" })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-gray-50/50"
                  >
                    <option value="Hoạt động">Hoạt động</option>
                    <option value="Ngừng hoạt động">Ngừng hoạt động</option>
                  </select>
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
          CONFIRM DELETE DIALOG
          ========================================== */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-sm w-[90%] rounded-2xl p-6 border-none shadow-2xl bg-white text-[#2c3e50] outline-none">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>Xác nhận xóa</span>
            </DialogTitle>
          </DialogHeader>

          <div className="py-2 text-sm text-gray-600">
            Bạn có chắc chắn muốn xóa bản ghi này khỏi cơ sở dữ liệu? Hành động này không thể hoàn tác.
          </div>

          <DialogFooter className="flex flex-row items-center justify-end gap-2.5 pt-4">
            <button
              onClick={() => setDeleteConfirmOpen(false)}
              className="px-4.5 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-bold rounded-xl transition-all"
            >
              Hủy
            </button>
            <button
              onClick={executeDelete}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-all shadow-md"
            >
              Đồng ý xóa
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
