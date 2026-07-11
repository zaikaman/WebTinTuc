"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminArticles,
  deleteAdminArticle,
  restoreAdminArticle,
  getAdminCategories,
} from "@/lib/api/adminClient";
import { formatDateForDisplay } from "@/components/admin/AdminUtils";
import DefaultTab from "@/components/admin/DefaultTab";
import DeleteConfirmDialog from "@/components/admin/DeleteConfirmDialog";
import QueryErrorBanner from "@/components/admin/QueryErrorBanner";
import { adminKeys } from "@/lib/query/adminKeys";
import { toast } from "sonner";
import type { Post } from "@/components/admin/AdminTypes";
import { Loader2 } from "lucide-react";

const PostEditorView = dynamic(() => import("./PostEditorView"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[50vh] flex items-center justify-center">
      <Loader2 className="animate-spin text-[#E55956]" size={32} />
    </div>
  ),
});

const PAGE_SIZE = 20;

function mapPosts(items: any[]): Post[] {
  return (items || []).map((a: any) => ({
    id: a.id,
    title: a.title,
    category: a.categories?.name || "Tin tức",
    views: a.views || 0,
    status: a.status === "published" ? "Đã đăng" : "Nháp",
    createdAt: a.created_at
      ? new Date(a.created_at).toISOString().split("T")[0]
      : "",
    content: "",
    coverImage: a.thumbnail_key || "",
    isDeleted: !!a.deleted_at,
  }));
}

function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function PostsPage() {
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounced(searchQuery, 350);
  const [postCategoryFilter, setPostCategoryFilter] = useState("all");
  const [postStartDate, setPostStartDate] = useState("");
  const [postEndDate, setPostEndDate] = useState("");
  const [hideDeletedPosts, setHideDeletedPosts] = useState(true);
  const [postsPage, setPostsPage] = useState(1);

  const [currentView, setCurrentView] = useState<"list" | "editor">("list");
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [editId, setEditId] = useState<number | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [targetIdToDelete, setTargetIdToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [restoringId, setRestoringId] = useState<number | null>(null);

  // Categories for filter + editor
  const { data: categoriesData } = useQuery({
    queryKey: adminKeys.categories("?limit=100"),
    queryFn: () => getAdminCategories("?limit=100"),
    staleTime: 120_000,
  });

  const categories = categoriesData?.items || [];
  const categoryOptions = useMemo(
    () => Array.from(new Set(categories.map((c: any) => c.name))),
    [categories]
  );

  const categoryId = useMemo(() => {
    if (postCategoryFilter === "all") return undefined;
    const found = categories.find((c: any) => c.name === postCategoryFilter);
    return found?.id as number | undefined;
  }, [postCategoryFilter, categories]);

  // Filter fingerprint: when filters change, use page 1 immediately (same render)
  // and sync postsPage state so it cannot snap back to the old page.
  const filterKey = useMemo(
    () =>
      JSON.stringify({
        search: debouncedSearch || "",
        hideDeletedPosts,
        categoryId: categoryId ?? null,
        postStartDate,
        postEndDate,
      }),
    [debouncedSearch, hideDeletedPosts, categoryId, postStartDate, postEndDate]
  );
  const filterPageRef = useRef({ key: filterKey, page: postsPage });
  if (filterPageRef.current.key !== filterKey) {
    filterPageRef.current = { key: filterKey, page: 1 };
  } else {
    filterPageRef.current = { key: filterKey, page: postsPage };
  }
  const effectivePage = filterPageRef.current.page;

  useEffect(() => {
    if (postsPage !== 1 && effectivePage === 1) {
      setPostsPage(1);
    }
    // Only when filter-driven page reset is active
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  const listParams = useMemo(
    () => ({
      page: effectivePage,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined,
      includeDeleted: !hideDeletedPosts,
      categoryId,
      publishedFrom: postStartDate
        ? new Date(postStartDate + "T00:00:00").toISOString()
        : undefined,
      publishedTo: postEndDate
        ? new Date(postEndDate + "T23:59:59").toISOString()
        : undefined,
    }),
    [
      effectivePage,
      debouncedSearch,
      hideDeletedPosts,
      categoryId,
      postStartDate,
      postEndDate,
    ]
  );

  const qs = useMemo(() => {
    const parts = [`page=${listParams.page}`, `limit=${listParams.limit}`];
    // Only send includeDeleted=true when showing deleted; omit means hide deleted
    if (listParams.includeDeleted) parts.push("includeDeleted=true");
    if (listParams.search)
      parts.push(`search=${encodeURIComponent(listParams.search)}`);
    if (listParams.categoryId)
      parts.push(`categoryId=${listParams.categoryId}`);
    if (listParams.publishedFrom)
      parts.push(`publishedFrom=${encodeURIComponent(listParams.publishedFrom)}`);
    if (listParams.publishedTo)
      parts.push(`publishedTo=${encodeURIComponent(listParams.publishedTo)}`);
    return `?${parts.join("&")}`;
  }, [listParams]);

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: adminKeys.articles(listParams as any),
    queryFn: () => getAdminArticles(qs),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

  // Server filters deleted when hide is on; client filter is a safety net
  // (also avoids showing deleted items from stale React Query placeholderData).
  const posts = useMemo(() => {
    const list = mapPosts(data?.items || []);
    if (hideDeletedPosts) return list.filter((p) => !p.isDeleted);
    return list;
  }, [data, hideDeletedPosts]);
  const totalPages = data?.meta?.totalPages || 1;

  const invalidatePosts = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: adminKeys.articlesRoot });
  }, [queryClient]);

  const handleOpenAddDialog = useCallback(() => {
    setDialogMode("add");
    setEditId(null);
    setCurrentView("editor");
  }, []);

  const handleOpenEditDialog = useCallback((item: Post) => {
    setDialogMode("edit");
    setEditId(item.id);
    setCurrentView("editor");
  }, []);

  const handleConfirmDelete = useCallback((id: number) => {
    setTargetIdToDelete(id);
    setDeleteConfirmOpen(true);
  }, []);

  const handleRestore = useCallback(
    async (id: number) => {
      try {
        setRestoringId(id);
        toast.loading("Đang khôi phục bài viết...", { id: "post-restore" });
        await restoreAdminArticle(id);
        toast.success("Khôi phục bài viết thành công!", { id: "post-restore" });
        invalidatePosts();
      } catch (err: any) {
        toast.error(err?.message || "Lỗi khi khôi phục bài viết!", {
          id: "post-restore",
        });
      } finally {
        setRestoringId(null);
      }
    },
    [invalidatePosts]
  );

  const executeDelete = useCallback(async () => {
    if (targetIdToDelete === null) return;
    setDeleteConfirmOpen(false);
    try {
      setIsDeleting(true);
      await deleteAdminArticle(targetIdToDelete);
      toast.success("Xóa bài viết thành công!");
      invalidatePosts();
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi xóa!");
    } finally {
      setIsDeleting(false);
      setTargetIdToDelete(null);
    }
  }, [targetIdToDelete, invalidatePosts]);

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setPostCategoryFilter("all");
    setPostStartDate("");
    setPostEndDate("");
    setHideDeletedPosts(true);
    setPostsPage(1);
  }, []);

  // Restore draft editor on mount
  useEffect(() => {
    try {
      if (localStorage.getItem("admin_editor_current_view") === "editor") {
        const savedMode = localStorage.getItem("admin_editor_dialog_mode");
        const savedEditId = localStorage.getItem("admin_editor_edit_id");
        setDialogMode((savedMode as "add" | "edit") || "add");
        if (savedEditId && savedEditId !== "null") {
          setEditId(Number(savedEditId));
        }
        setCurrentView("editor");
      }
    } catch {
      // ignore
    }
  }, []);

  const handleEditorBack = useCallback(() => {
    setCurrentView("list");
  }, []);

  const handleEditorSaved = useCallback(() => {
    invalidatePosts();
    setCurrentView("list");
  }, [invalidatePosts]);

  if (currentView === "editor") {
    return (
      <PostEditorView
        mode={dialogMode}
        editId={editId}
        categories={categories}
        categoryOptions={
          categoryOptions.length > 0 ? categoryOptions : ["Tin tức"]
        }
        onBack={handleEditorBack}
        onSaved={handleEditorSaved}
      />
    );
  }

  const showLoading = isLoading && !data;

  return (
    <>
      <div className={isFetching && data ? "opacity-95" : undefined}>
        {isError && (
          <div className="mb-4">
            <QueryErrorBanner
              message={(error as Error)?.message || "Không thể tải danh sách bài viết."}
              onRetry={() => void refetch()}
              isRetrying={isFetching}
            />
          </div>
        )}
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
          postsLoading={showLoading}
          paginatedPosts={posts}
          postsPage={effectivePage}
          postsTotalPages={totalPages}
          onPostsPageChange={setPostsPage}
          onPostEdit={handleOpenEditDialog}
          onPostDelete={handleConfirmDelete}
          onPostRestore={handleRestore}
          restoringPostId={restoringId}
          categoriesLoading={false}
          paginatedCategories={[]}
          categoriesPage={1}
          categoriesTotalPages={1}
          onCategoriesPageChange={() => {}}
          onCategoryEdit={() => {}}
          onCategoryDelete={() => {}}
          onCategoryPriorityChange={() => {}}
          onCategoryStatusToggle={() => {}}
          adsLoading={false}
          paginatedAds={[]}
          adsPage={1}
          adsTotalPages={1}
          onAdsPageChange={() => {}}
          onAdEdit={() => {}}
          onAdDelete={() => {}}
          onAdStatusToggle={() => {}}
          accountsLoading={false}
          paginatedAccounts={[]}
          accountsPage={1}
          accountsTotalPages={1}
          onAccountsPageChange={() => {}}
          onAccountEdit={() => {}}
          onAccountDelete={() => {}}
          formatDateForDisplay={formatDateForDisplay}
          pageSize={PAGE_SIZE}
        />
      </div>

      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        activeTab="posts"
        isDeleting={isDeleting}
        onConfirm={executeDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setTargetIdToDelete(null);
        }}
      />
    </>
  );
}
