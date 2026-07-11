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
import { adminKeys } from "@/lib/query/adminKeys";
import { toast } from "sonner";
import type { MediaItem } from "@/components/admin/AdminTypes";

const mediaItemsPerPage = 6;

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
        ? f.key.split("/")[0]
        : "",
  }));
}

export default function MediaPage() {
  const queryClient = useQueryClient();
  const [mediaSort, setMediaSort] = useState<"newest" | "oldest" | "az">("newest");
  const [mediaSearchQuery, setMediaSearchQuery] = useState("");
  const [mediaTypeFilter, setMediaTypeFilter] = useState<"all" | "image" | "video">("all");
  const [activeFolder, setActiveFolder] = useState<string>("");
  const [folders, setFolders] = useState<string[]>(["articles", "ads", "categories"]);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isMediaUploading, setIsMediaUploading] = useState(false);
  const [deletingMediaKey, setDeletingMediaKey] = useState<string | null>(null);
  const [mediaPage, setMediaPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Root = show ALL media (recursive). Subfolder = only that folder (fast).
  // Non-recursive root only returns files with no prefix (usually empty) + CommonPrefixes.
  const isRoot = !activeFolder;
  const prefix = isRoot ? "" : `${activeFolder.replace(/\/$/, "")}/`;
  const recursive = isRoot;

  const { data, isLoading, isFetching } = useQuery({
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

  useEffect(() => {
    const fromApi = rootFoldersData?.subFolders?.map((sf: any) => sf.name) || [];
    // Also derive folders from recursive root file keys (covers edge cases)
    const fromFiles =
      isRoot && data?.files
        ? data.files
            .map((f: any) => (f.key?.includes("/") ? f.key.split("/")[0] : ""))
            .filter(Boolean)
        : [];
    const unique = Array.from(
      new Set([...fromApi, ...fromFiles, "articles", "ads", "categories"])
    );
    setFolders(unique);
  }, [rootFoldersData, data, isRoot]);

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
        invalidateMedia();
        e.target.value = "";
      }
    },
    [activeFolder, invalidateMedia]
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
      if (!confirm("Bạn có chắc chắn muốn xóa file media này không?")) return;
      (async () => {
        try {
          setDeletingMediaKey(key);
          toast.loading("Đang xóa...", { id: "media-delete" });
          await deleteAdminMedia(key);
          toast.success("Đã xóa file media thành công!", { id: "media-delete" });
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
      setFolders((prev) =>
        Array.from(new Set([...prev, newFolderName.trim()]))
      );
      invalidateMedia();
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi tạo thư mục!", { id: "media-folder" });
    }
  }, [newFolderName, activeFolder, invalidateMedia]);

  const showLoading = isLoading && !data;

  return (
    <>
      <div className={isFetching && data ? "opacity-95" : undefined}>
        <MediaTab
          loading={showLoading}
          isUploading={isMediaUploading}
          mediaTypeFilter={mediaTypeFilter}
          onMediaTypeFilterChange={setMediaTypeFilter as any}
          mediaSearchQuery={mediaSearchQuery}
          onMediaSearchQueryChange={setMediaSearchQuery}
          folders={folders}
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
