"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
} from "@/lib/api/adminClient";
import { formatDateForDisplay } from "@/components/admin/AdminUtils";
import DefaultTab from "@/components/admin/DefaultTab";
import CategoryDialog from "@/components/admin/CategoryDialog";
import DeleteConfirmDialog from "@/components/admin/DeleteConfirmDialog";
import { adminKeys } from "@/lib/query/adminKeys";
import { toast } from "sonner";
import type { Category } from "@/components/admin/AdminTypes";

const itemsPerPage = 6;
const QS = "?limit=100";

function mapCategories(items: any[]): Category[] {
  return (items || []).map((c: any) => ({
    id: c.id,
    name: c.name,
    postCount: c.postCount || 0,
    priority: c.priority || 0,
    status: c.status === "active" ? "Hoạt động" : "Ngừng hoạt động",
  }));
}

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoriesPage, setCategoriesPage] = useState(1);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [editId, setEditId] = useState<number | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState<Partial<Category>>({
    name: "",
    postCount: 0,
    priority: 1,
    status: "Hoạt động",
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [targetIdToDelete, setTargetIdToDelete] = useState<number | null>(null);
  const [isCategorySaving, setIsCategorySaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [localOverride, setLocalOverride] = useState<Category[] | null>(null);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: adminKeys.categories(QS),
    queryFn: () => getAdminCategories(QS),
    staleTime: 60_000,
  });

  const categories = localOverride ?? mapCategories(data?.items || []);

  const invalidate = useCallback(() => {
    setLocalOverride(null);
    void queryClient.invalidateQueries({ queryKey: adminKeys.categoriesRoot });
  }, [queryClient]);

  const filteredCategories = useMemo(
    () =>
      categories.filter(
        (cat) =>
          cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cat.id.toString() === searchQuery
      ),
    [categories, searchQuery]
  );

  const paginatedCategories = useMemo(() => {
    const start = (categoriesPage - 1) * itemsPerPage;
    return filteredCategories.slice(start, start + itemsPerPage);
  }, [filteredCategories, categoriesPage]);

  const categoriesTotalPages =
    Math.ceil(filteredCategories.length / itemsPerPage) || 1;

  const handleOpenAddDialog = useCallback(() => {
    setDialogMode("add");
    setEditId(null);
    setCategoryForm({ name: "", postCount: 0, priority: 0, status: "Hoạt động" });
    setCategoryDialogOpen(true);
  }, []);

  const handleOpenEditDialog = useCallback((item: Category) => {
    setDialogMode("edit");
    setEditId(item.id);
    setCategoryForm(item);
    setCategoryDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback((id: number) => {
    setTargetIdToDelete(id);
    setDeleteConfirmOpen(true);
  }, []);

  const handleCategoryPriorityChange = useCallback(
    async (catId: number, newPriority: number) => {
      const original = categories;
      setLocalOverride(
        categories.map((c) => (c.id === catId ? { ...c, priority: newPriority } : c))
      );
      try {
        await updateAdminCategory(catId, { priority: newPriority });
        toast.success("Cập nhật priority thành công!");
        invalidate();
      } catch (err: any) {
        setLocalOverride(original);
        toast.error(err?.message || "Lỗi khi cập nhật priority!");
      }
    },
    [categories, invalidate]
  );

  const handleCategoryStatusToggle = useCallback(
    async (cat: Category) => {
      const original = categories;
      const newLabel = cat.status === "Hoạt động" ? "Ngừng hoạt động" : "Hoạt động";
      const apiStatus = newLabel === "Hoạt động" ? "active" : "inactive";
      setLocalOverride(
        categories.map((c) => (c.id === cat.id ? { ...c, status: newLabel } : c))
      );
      try {
        await updateAdminCategory(cat.id, { status: apiStatus });
        toast.success(`Đã đổi trạng thái sang "${newLabel}"`);
        invalidate();
      } catch (e: any) {
        setLocalOverride(original);
        toast.error(e?.message || "Lỗi khi đổi trạng thái!");
      }
    },
    [categories, invalidate]
  );

  const executeDelete = useCallback(async () => {
    if (targetIdToDelete === null) return;
    setDeleteConfirmOpen(false);
    try {
      setIsDeleting(true);
      setLocalOverride(categories.filter((c) => c.id !== targetIdToDelete));
      await deleteAdminCategory(targetIdToDelete);
      toast.success("Xóa danh mục thành công!");
      invalidate();
    } catch (e: any) {
      toast.error(e?.message || "Lỗi khi xóa!");
      invalidate();
    } finally {
      setIsDeleting(false);
      setTargetIdToDelete(null);
    }
  }, [targetIdToDelete, categories, invalidate]);

  const handleFormSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!categoryForm.name?.trim()) {
        toast.error("Vui lòng nhập tên danh mục!");
        return;
      }
      const payload = {
        name: categoryForm.name,
        priority: Number(categoryForm.priority) || 0,
        status: categoryForm.status === "Hoạt động" ? "active" : "inactive",
      };
      setCategoryDialogOpen(false);
      setIsCategorySaving(true);
      try {
        if (dialogMode === "add") {
          toast.loading("Đang thêm danh mục...", { id: "cat-submit" });
          await createAdminCategory(payload as any);
          toast.success("Thêm danh mục mới thành công!", { id: "cat-submit" });
        } else if (editId) {
          toast.loading("Đang cập nhật...", { id: "cat-submit" });
          await updateAdminCategory(editId, payload as any);
          toast.success("Cập nhật danh mục thành công!", { id: "cat-submit" });
        }
        invalidate();
      } catch (e: any) {
        toast.error(e?.message || "Có lỗi xảy ra, vui lòng thử lại!", {
          id: "cat-submit",
        });
      } finally {
        setIsCategorySaving(false);
      }
    },
    [categoryForm, dialogMode, editId, invalidate]
  );

  const showLoading = isLoading && !data;

  return (
    <>
      <div className={isFetching && data ? "opacity-95" : undefined}>
        <DefaultTab
          activeTab="categories"
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          postStartDate=""
          onPostStartDateChange={() => {}}
          postEndDate=""
          onPostEndDateChange={() => {}}
          postCategoryFilter="all"
          onPostCategoryFilterChange={() => {}}
          categoryOptions={[]}
          onResetFilters={() => setSearchQuery("")}
          hideDeletedPosts={false}
          onHideDeletedPostsChange={() => {}}
          onOpenAddDialog={handleOpenAddDialog}
          postsLoading={false}
          paginatedPosts={[]}
          postsPage={1}
          postsTotalPages={1}
          onPostsPageChange={() => {}}
          onPostEdit={() => {}}
          onPostDelete={() => {}}
          categoriesLoading={showLoading}
          paginatedCategories={paginatedCategories}
          categoriesPage={categoriesPage}
          categoriesTotalPages={categoriesTotalPages}
          onCategoriesPageChange={setCategoriesPage}
          onCategoryEdit={handleOpenEditDialog}
          onCategoryDelete={handleConfirmDelete}
          onCategoryPriorityChange={handleCategoryPriorityChange}
          onCategoryStatusToggle={handleCategoryStatusToggle}
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
        />
      </div>

      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        dialogMode={dialogMode}
        categoryForm={categoryForm}
        isSaving={isCategorySaving}
        onFormChange={setCategoryForm}
        onSubmit={handleFormSubmit}
      />
      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        activeTab="categories"
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
