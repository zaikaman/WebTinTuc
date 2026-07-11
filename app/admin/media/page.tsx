"use client";

import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminMedia,
  uploadAdminMedia,
  deleteAdminMedia,
  createAdminFolder,
} from "@/lib/api/adminClient";
import MediaTab from "@/components/admin/MediaTab";
import FolderDialog from "@/components/admin/FolderDialog";
import QueryErrorBanner from "@/components/admin/QueryErrorBanner";
import { adminKeys } from "@/lib/query/adminKeys";
import { toast } from "sonner";
import type { MediaItem } from "@/components/admin/AdminTypes";

const mediaItemsPerPage = 6;
const DEFAULT_ROOT_FOLDERS = ["articles", "ads", "categories"];

function mapFiles(files: any[], folderPrefix: string): MediaItem[] {
  return (files || []).map((f: any, idx: number) => ({
    id: idx + 1,
    key: f.key,
    title: f.name,
    type: f.type,
    url: f.url,
    size: (f.size / 1024).toFixed(2) + " KB",
    createdAt: f.lastModified
      ? new Date(f.lastModified).toISOString().split("T")[0]
      : "",
    folder: folderPrefix
      ? folderPrefix.replace(/\/$/, "")
      : f.key.includes("/")
        ? f.key.split("/").slice(0, -1).join("/")
        : "",
  }));
}

/** Normalize folder path: no leading/trailing slashes */
function normalizeFolderPath(path: string): string {
  return path.replace(/^\/+|\/+$/g, "");
}

export default function MediaPage() {
  const queryClient = useQueryClient();
  const [mediaSort, setMediaSort] = useState<"newest" | "oldest" | "az">("newest");
  const [mediaSearchQuery, setMediaSearchQuery] = useState("");
  const [mediaTypeFilter, setMediaTypeFilter] = useState<"all" | "image" | "video">("all");
  /** Full path relative to bucket root, e.g. "articles" or "articles/foo" */
  const [activeFolder, setActiveFolder] = useState<string>("");
  /** Full folder paths for the tree (root-level + nested under active) */
  const [folders, setFolders] = useState<string[]>(DEFAULT_ROOT_FOLDERS);
  const [hiddenFolders, setHiddenFolders] = useState<Set<string>>(new Set());
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isMediaUploading, setIsMediaUploading] = useState(false);
  const [deletingMediaKey, setDeletingMediaKey] = useState<string | null>(null);
  const [mediaPage, setMediaPage] = useState(1);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Root = show ALL media (recursive). Subfolder = only that folder (fast).
  const isRoot = !activeFolder;
  const prefix = isRoot ? "" : `${normalizeFolderPath(activeFolder)}/`;
  const recursive = isRoot;

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: adminKeys.media(prefix, recursive),
    queryFn: () => getAdminMedia(prefix, recursive),
    staleTime: 45_000,
  });

  // Non-recursive root listing just for folder names (CommonPrefixes)
  const { data: rootFoldersData } = useQuery({
    queryKey: adminKeys.media("", false),
    queryFn: () => getAdminMedia("", false),
    staleTime: 120_000,
  });

  // When inside a folder, also list its immediate subfolders
  const { data: activeFolderData } = useQuery({
    queryKey: adminKeys.media(prefix, false),
    queryFn: () => getAdminMedia(prefix, false),
    staleTime: 45_000,
    enabled: !isRoot,
  });

  useEffect(() => {
    const rootPaths: string[] =
      rootFoldersData?.subFolders?.map((sf: any) =>
        normalizeFolderPath(sf.path || sf.name)
      ) || [];

    // Derive top-level from recursive root file keys
    const fromFiles =
      isRoot && data?.files
        ? data.files
            .map((f: any) =>
              f.key?.includes("/") ? f.key.split("/")[0] : ""
            )
            .filter(Boolean)
        : [];

    // Nested subfolders under current active folder
    const nestedPaths: string[] =
      activeFolderData?.subFolders?.map((sf: any) =>
        normalizeFolderPath(sf.path || `${activeFolder}/${sf.name}`)
      ) || [];

    const fromApi = [
      ...DEFAULT_ROOT_FOLDERS,
      ...rootPaths,
      ...fromFiles,
      ...nestedPaths,
    ].filter((f) => f && !hiddenFolders.has(f));

    setFolders((prev) => {
      const unique = Array.from(
        new Set([...fromApi, ...prev.filter((f) => !hiddenFolders.has(f))])
      );
      if (
        unique.length === prev.length &&
        unique.every((f) => prev.includes(f))
      ) {
        return prev;
      }
      return unique;
    });
  }, [rootFoldersData, data, isRoot, activeFolderData, activeFolder, hiddenFolders]);

  const mediaItems = useMemo(
    () => mapFiles(data?.files || [], activeFolder),
    [data, activeFolder]
  );

  const invalidateMedia = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: adminKeys.mediaRoot });
  }, [queryClient]);

  const filteredMedia = useMemo(() => {
    const filtered = mediaItems.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(mediaSearchQuery.toLowerCase()) ||
        item.url.toLowerCase().includes(mediaSearchQuery.toLowerCase());
      const matchesType =
        mediaTypeFilter === "all" || item.type === mediaTypeFilter;
      return matchesSearch && matchesType;
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
      if (mediaSort === "az") return a.title.localeCompare(b.title);
      return 0;
    });
  }, [mediaItems, mediaSearchQuery, mediaTypeFilter, mediaSort]);

  const paginatedMedia = useMemo(() => {
    const start = (mediaPage - 1) * mediaItemsPerPage;
    return filteredMedia.slice(start, start + mediaItemsPerPage);
  }, [filteredMedia, mediaPage]);

  const mediaTotalPages =
    Math.ceil(filteredMedia.length / mediaItemsPerPage) || 1;

  useEffect(() => {
    setMediaPage(1);
    setSelectedKeys(new Set());
  }, [mediaSearchQuery, mediaTypeFilter, activeFolder]);

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
            if (activeFolder) formData.append("folder", normalizeFolderPath(activeFolder));
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
        invalidateMedia();
        e.target.value = "";
      }
    },
    [activeFolder, invalidateMedia]
  );

  const handleFolderDelete = useCallback(
    (folderPath: string) => {
      if (
        confirm(
          `Ẩn thư mục "${folderPath}" khỏi danh sách hiển thị?\n\nLưu ý: Thao tác này chỉ ẩn trên giao diện, không xóa file trên R2.`
        )
      ) {
        setHiddenFolders((prev) => new Set([...prev, folderPath]));
        setFolders((prev) => prev.filter((f) => f !== folderPath));
        if (activeFolder === folderPath || activeFolder.startsWith(folderPath + "/")) {
          setActiveFolder("");
        }
        toast.success(`Đã ẩn thư mục: ${folderPath}`);
      }
    },
    [activeFolder]
  );

  const handleMediaDelete = useCallback(
    (key: string) => {
      if (!confirm("Bạn có chắc chắn muốn xóa file media này không?")) return;
      (async () => {
        try {
          setDeletingMediaKey(key);
          toast.loading("Đang xóa...", { id: "media-delete" });
          await deleteAdminMedia(key);
          toast.success("Đã xóa file media thành công!", { id: "media-delete" });
          setSelectedKeys((prev) => {
            const next = new Set(prev);
            next.delete(key);
            return next;
          });
          invalidateMedia();
        } catch (err: any) {
          toast.error(err?.message || "Lỗi khi xóa file media!", {
            id: "media-delete",
          });
        } finally {
          setDeletingMediaKey(null);
        }
      })();
    },
    [invalidateMedia]
  );

  const handleBulkDelete = useCallback(async () => {
    if (selectedKeys.size === 0) return;
    if (
      !confirm(
        `Bạn có chắc chắn muốn xóa ${selectedKeys.size} file media đã chọn không?`
      )
    ) {
      return;
    }
    toast.loading(`Đang xóa ${selectedKeys.size} file...`, { id: "media-bulk-delete" });
    try {
      for (const key of selectedKeys) {
        await deleteAdminMedia(key);
      }
      toast.success(`Đã xóa ${selectedKeys.size} file!`, { id: "media-bulk-delete" });
      setSelectedKeys(new Set());
      invalidateMedia();
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi xóa hàng loạt!", {
        id: "media-bulk-delete",
      });
      invalidateMedia();
    }
  }, [selectedKeys, invalidateMedia]);

  const handleMediaCopyUrl = useCallback(async (url: string) => {
    const copyUrl =
      url.startsWith("blob:") || url.startsWith("data:") || url.startsWith("http")
        ? url
        : window.location.origin + url;
    try {
      await navigator.clipboard.writeText(copyUrl);
      toast.success("Đã sao chép link media vào bộ nhớ tạm!");
    } catch {
      toast.error("Không thể sao chép (trình duyệt chặn quyền clipboard).");
    }
  }, []);

  const handleMediaPreview = useCallback((url: string) => {
    const previewUrl =
      url.startsWith("blob:") || url.startsWith("data:") || url.startsWith("http")
        ? url
        : window.location.origin + url;
    window.open(previewUrl, "_blank");
  }, []);

  const handleCreateFolder = useCallback(async () => {
    const name = newFolderName.trim();
    if (!name) return;
    try {
      toast.loading("Đang tạo thư mục...", { id: "media-folder" });
      await createAdminFolder(name, activeFolder ? normalizeFolderPath(activeFolder) : "");
      const fullPath = activeFolder
        ? `${normalizeFolderPath(activeFolder)}/${name}`
        : name;
      toast.success(`Đã thêm thư mục: ${fullPath}`, {
        id: "media-folder",
      });
      setFolderDialogOpen(false);
      setNewFolderName("");
      setFolders((prev) => Array.from(new Set([...prev, fullPath])));
      invalidateMedia();
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi tạo thư mục!", { id: "media-folder" });
    }
  }, [newFolderName, activeFolder, invalidateMedia]);

  const showLoading = isLoading && !data;

  // Folders to show in sidebar: root-level when at root; siblings+children when nested
  const visibleFolders = useMemo(() => {
    if (isRoot) {
      // Only top-level folder names (no slash)
      return folders.filter((f) => !f.includes("/"));
    }
    // Show immediate children of active folder + path segments for breadcrumb navigation
    const parent = normalizeFolderPath(activeFolder);
    const children = folders.filter(
      (f) => f.startsWith(parent + "/") && !f.slice(parent.length + 1).includes("/")
    );
    // Also show other top-level for navigation back
    const topLevel = folders.filter((f) => !f.includes("/"));
    return Array.from(new Set([...topLevel, ...children]));
  }, [folders, activeFolder, isRoot]);

  return (
    <>
      <div className={isFetching && data ? "opacity-95" : undefined}>
        {isError && (
          <div className="mb-4">
            <QueryErrorBanner
              message={(error as Error)?.message || "Không thể tải thư viện media."}
              onRetry={() => void refetch()}
              isRetrying={isFetching}
            />
          </div>
        )}
        <MediaTab
          loading={showLoading}
          isUploading={isMediaUploading}
          mediaTypeFilter={mediaTypeFilter}
          onMediaTypeFilterChange={setMediaTypeFilter as any}
          mediaSearchQuery={mediaSearchQuery}
          onMediaSearchQueryChange={setMediaSearchQuery}
          folders={visibleFolders}
          activeFolder={activeFolder}
          onActiveFolderChange={setActiveFolder}
          onFolderDelete={handleFolderDelete}
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
          onMediaDelete={handleMediaDelete}
          onMediaCopyUrl={handleMediaCopyUrl}
          onMediaPreview={handleMediaPreview}
          onUploadClick={() => fileInputRef.current?.click()}
          selectedKeys={selectedKeys}
          onSelectedKeysChange={setSelectedKeys}
          onBulkDelete={handleBulkDelete}
        />
      </div>

      <FolderDialog
        open={folderDialogOpen}
        onOpenChange={setFolderDialogOpen}
        newFolderName={newFolderName}
        onFolderNameChange={setNewFolderName}
        activeFolder={activeFolder}
        onCreateFolder={handleCreateFolder}
      />

      <input
        ref={fileInputRef}
        type="file"
        id="media-direct-upload"
        className="hidden"
        multiple
        accept="image/*,video/*"
        onChange={handleMediaDirectUpload}
      />
    </>
  );
}
