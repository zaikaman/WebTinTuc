"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import {
  getAdminMedia,
  uploadAdminMedia,
  deleteAdminMedia,
  createAdminFolder,
} from "@/lib/api/adminClient";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminLogin from "@/components/admin/AdminLogin";
import MediaTab from "@/components/admin/MediaTab";
import FolderDialog from "@/components/admin/FolderDialog";
import LogoutDialog from "@/components/admin/LogoutDialog";
import { useAdminAuth } from "@/lib/hooks/useAdminAuth";
import { useSiteSettings } from "@/lib/hooks/useSiteSettings";
import { toast } from "sonner";
import type { TabType, MediaItem } from "@/components/admin/AdminTypes";

const mediaItemsPerPage = 6;

export default function MediaPage() {
  const router = useRouter();
  const auth = useAdminAuth();
  const siteSettings = useSiteSettings();

  // --- Auth redirect ---
  useEffect(() => {
    if (!auth.isAuthVerified) return;
    if (!auth.isLoggedIn) {
      router.replace("/admin");
    }
  }, [auth.isAuthVerified, auth.isLoggedIn, router]);

  // --- Sidebar state ---
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  // --- Media state ---
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaSort, setMediaSort] = useState<"newest" | "oldest" | "az">("newest");
  const [mediaSearchQuery, setMediaSearchQuery] = useState("");
  const [mediaTypeFilter, setMediaTypeFilter] = useState<"all" | "image" | "video">("all");
  const [activeFolder, setActiveFolder] = useState<string>("");
  const [folders, setFolders] = useState<string[]>([]);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isMediaUploading, setIsMediaUploading] = useState(false);
  const [deletingMediaKey, setDeletingMediaKey] = useState<string | null>(null);
  const [mediaPage, setMediaPage] = useState(1);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Loading Functions ---
  const loadMedia = useCallback(async () => {
    try {
      setMediaLoading(true);
      const res = await getAdminMedia("", true);
      if (res && res.files) {
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

  const loadFolders = useCallback(async () => {
    try {
      const res = await getAdminMedia("");
      if (res && res.subFolders) {
        const uniqueFolders = Array.from(
          new Set([
            ...res.subFolders.map((sf: any) => sf.name),
            "articles",
            "ads",
            "categories",
          ])
        );
        setFolders(uniqueFolders);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (auth.isLoggedIn && auth.isAuthVerified) {
      loadMedia();
      loadFolders();
    }
  }, [auth.isLoggedIn, auth.isAuthVerified, loadMedia, loadFolders]);

  // --- Filtered & Paginated Media ---
  const filteredMedia = useMemo(() => {
    const filtered = mediaItems.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(mediaSearchQuery.toLowerCase()) ||
        item.url.toLowerCase().includes(mediaSearchQuery.toLowerCase());
      const matchesType =
        mediaTypeFilter === "all" || item.type === mediaTypeFilter;
      const matchesFolder = activeFolder
        ? item.folder === activeFolder
        : true;
      return matchesSearch && matchesType && matchesFolder;
    });

    return filtered.sort((a, b) => {
      if (mediaSort === "newest") {
        return (
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );
      }
      if (mediaSort === "oldest") {
        return (
          new Date(a.createdAt || 0).getTime() -
          new Date(b.createdAt || 0).getTime()
        );
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

  const mediaTotalPages =
    Math.ceil(filteredMedia.length / mediaItemsPerPage) || 1;

  useEffect(() => {
    setMediaPage(1);
  }, [mediaSearchQuery, mediaTypeFilter, activeFolder]);

  // --- Handlers ---
  const handleMediaDirectUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
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

          toast.loading(`Đang tải lên ${file.name}...`, {
            id: `upload-${file.name}`,
          });
          try {
            const formData = new FormData();
            formData.append("file", file);
            if (activeFolder) formData.append("folder", activeFolder);

            await uploadAdminMedia(formData);
            toast.success(`Tải lên thành công: ${file.name}`, {
              id: `upload-${file.name}`,
            });
          } catch (err: any) {
            toast.error(`Lỗi tải lên ${file.name}: ${err.message}`, {
              id: `upload-${file.name}`,
            });
          }
        }
      } finally {
        setIsMediaUploading(false);
        loadMedia();
        e.target.value = "";
      }
    },
    [activeFolder, loadMedia]
  );

  const handleFolderDelete = useCallback(
    (folderName: string) => {
      if (
        confirm(
          `Bạn có chắc chắn muốn xóa thư mục "${folderName}" khỏi danh sách hiển thị?`
        )
      ) {
        setFolders((prev) => prev.filter((f) => f !== folderName));
        if (activeFolder === folderName) setActiveFolder("");
        toast.success(`Đã xóa thư mục: ${folderName}`);
      }
    },
    [activeFolder]
  );

  const handleMediaDelete = useCallback(
    (key: string) => {
      if (confirm("Bạn có chắc chắn muốn xóa file media này không?")) {
        (async () => {
          try {
            setDeletingMediaKey(key);
            toast.loading("Đang xóa...", { id: "media-delete" });
            await deleteAdminMedia(key);
            toast.success("Đã xóa file media thành công!", {
              id: "media-delete",
            });
            loadMedia();
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi xóa file media!", { id: "media-delete" });
          } finally {
            setDeletingMediaKey(null);
          }
        })();
      }
    },
    [loadMedia]
  );

  const handleMediaCopyUrl = useCallback((url: string) => {
    const copyUrl =
      url.startsWith("blob:") || url.startsWith("data:") || url.startsWith("http")
        ? url
        : window.location.origin + url;
    navigator.clipboard.writeText(copyUrl);
    toast.success("Đã sao chép link media vào bộ nhớ tạm!");
  }, []);

  const handleMediaPreview = useCallback((url: string) => {
    const previewUrl =
      url.startsWith("blob:") || url.startsWith("data:") || url.startsWith("http")
        ? url
        : window.location.origin + url;
    window.open(previewUrl, "_blank");
  }, []);

  const handleCreateFolder = useCallback(async () => {
    try {
      toast.loading("Đang tạo thư mục...", { id: "media-folder" });
      await createAdminFolder(newFolderName.trim(), activeFolder);
      toast.success(`Đã thêm thư mục: ${newFolderName.trim()}`, {
        id: "media-folder",
      });
      setFolderDialogOpen(false);
      setNewFolderName("");
      await loadFolders();
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi tạo thư mục!", { id: "media-folder" });
    }
  }, [newFolderName, activeFolder, loadFolders]);

  const handleTabChange = useCallback(
    (tab: TabType) => {
      router.push(`/admin/${tab}`);
      setSidebarOpen(false);
    },
    [router]
  );

  const handleOpenFolderDialog = useCallback(() => {
    setNewFolderName("");
    setFolderDialogOpen(true);
  }, []);

  // --- Loading state while verifying auth ---
  if (!auth.isAuthVerified) {
    return (
      <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#E55956] border-t-transparent rounded-full" />
      </div>
    );
  }

  // --- Login screen ---
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

  // --- Main layout ---
  return (
    <div className="min-h-screen bg-[#f4f6f8] text-[#2c3e50] font-sans antialiased flex animate-fade-in">
      {/* Sidebar */}
      <AdminSidebar
        activeTab={"media" as TabType}
        sidebarOpen={sidebarOpen}
        logoUrl={siteSettings.logoUrl}
        logoWebsiteName={siteSettings.logoWebsiteName}
        onTabChange={handleTabChange}
        onCloseSidebar={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Top navbar */}
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
              <span>Quản lý Media</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-sm font-bold text-gray-900">
                  Administrator
                </span>
                <span className="text-[10px] font-semibold text-[#E55956] uppercase tracking-wider">
                  Super Admin
                </span>
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

        {/* Page content */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
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
            onFolderDelete={handleFolderDelete}
            onOpenFolderDialog={handleOpenFolderDialog}
            mediaSort={mediaSort}
            onMediaSortChange={setMediaSort as any}
            filteredMedia={filteredMedia}
            paginatedMedia={paginatedMedia}
            mediaPage={mediaPage}
            mediaTotalPages={mediaTotalPages}
            onMediaPageChange={setMediaPage}
            deletingMediaKey={deletingMediaKey}
            onMediaDelete={handleMediaDelete}
            onMediaCopyUrl={handleMediaCopyUrl}
            onMediaPreview={handleMediaPreview}
            onUploadClick={() => fileInputRef.current?.click()}
          />
        </main>
      </div>

      {/* Folder Dialog */}
      <FolderDialog
        open={folderDialogOpen}
        onOpenChange={setFolderDialogOpen}
        newFolderName={newFolderName}
        onFolderNameChange={setNewFolderName}
        activeFolder={activeFolder}
        onCreateFolder={handleCreateFolder}
      />

      {/* Hidden file input for direct uploads */}
      <input
        ref={fileInputRef}
        type="file"
        id="media-direct-upload"
        className="hidden"
        multiple
        accept="image/*,video/*"
        onChange={handleMediaDirectUpload}
      />

      {/* Logout confirmation dialog */}
      <LogoutDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        onConfirm={auth.handleLogout}
      />
    </div>
  );
}
