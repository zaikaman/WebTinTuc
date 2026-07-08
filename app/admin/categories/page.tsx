"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Menu, LayoutDashboard, LogOut } from "lucide-react";
import {
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
} from "@/lib/api/adminClient";
import { formatDateForDisplay } from "@/components/admin/AdminUtils";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminLogin from "@/components/admin/AdminLogin";
import DefaultTab from "@/components/admin/DefaultTab";
import CategoryDialog from "@/components/admin/CategoryDialog";
import DeleteConfirmDialog from "@/components/admin/DeleteConfirmDialog";
import LogoutDialog from "@/components/admin/LogoutDialog";
import { useAdminAuth } from "@/lib/hooks/useAdminAuth";
import { useSiteSettings } from "@/lib/hooks/useSiteSettings";
import { toast } from "sonner";
import type { TabType, Category } from "@/components/admin/AdminTypes";

const itemsPerPage = 6;

export default function CategoriesPage() {
  const router = useRouter();
  const auth = useAdminAuth();
  const siteSettings = useSiteSettings();

  useEffect(() => {
    if (!auth.isAuthVerified) return;
    if (!auth.isLoggedIn) router.replace("/admin");
  }, [auth.isAuthVerified, auth.isLoggedIn, router]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesPage, setCategoriesPage] = useState(1);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [editId, setEditId] = useState<number | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState<Partial<Category>>({
    name: "", postCount: 0, priority: 1, status: "Hoạt động",
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [targetIdToDelete, setTargetIdToDelete] = useState<number | null>(null);
  const [isCategorySaving, setIsCategorySaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      const res = await getAdminCategories("?limit=100");
      if (res && res.items) {
        setCategories(
          res.items.map((c: any) => ({
            id: c.id,
            name: c.name,
            postCount: c.postCount || 0,
            priority: c.priority || 0,
            status: c.status === "active" ? "Hoạt động" : "Ngừng hoạt động",
          }))
        );
      }
    } catch (err: any) {
      toast.error(err?.message || "Không thể tải danh sách danh mục");
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (auth.isLoggedIn && auth.isAuthVerified) loadCategories();
  }, [auth.isLoggedIn, auth.isAuthVerified, loadCategories]);

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

  const categoriesTotalPages = Math.ceil(filteredCategories.length / itemsPerPage) || 1;

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
      const original = [...categories];
      setCategories((prev) =>
        prev.map((c) => (c.id === catId ? { ...c, priority: newPriority } : c))
      );
      try {
        await updateAdminCategory(catId, { priority: newPriority });
        toast.success("Cập nhật priority thành công!");
        } catch (err: any) {
        setCategories(original);
        toast.error(err?.message || "Lỗi khi cập nhật priority!");
      }
    },
    [categories]
  );

  const handleCategoryStatusToggle = useCallback(
    async (cat: Category) => {
      const original = [...categories];
      const newLabel = cat.status === "Hoạt động" ? "Ngừng hoạt động" : "Hoạt động";
      const apiStatus = newLabel === "Hoạt động" ? "active" : "inactive";
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, status: newLabel } : c))
      );
      try {
        await updateAdminCategory(cat.id, { status: apiStatus });
        toast.success(`Đã đổi trạng thái sang "${newLabel}"`);
    } catch (e: any) {
      setCategories(original);
      toast.error(e?.message || "Lỗi khi đổi trạng thái!");
    }
    },
    [categories]
  );

  const executeDelete = useCallback(async () => {
    if (targetIdToDelete === null) return;
    setDeleteConfirmOpen(false);
    try {
      setIsDeleting(true);
      setCategories((prev) => prev.filter((c) => c.id !== targetIdToDelete));
      await deleteAdminCategory(targetIdToDelete);
      toast.success("Xóa danh mục thành công!");
    } catch (e: any) {
      toast.error(e?.message || "Lỗi khi xóa!");
    } finally {
      setIsDeleting(false);
      setTargetIdToDelete(null);
    }
  }, [targetIdToDelete]);

  const handleFormSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!categoryForm.name?.trim()) {
        toast.error("Vui lòng nhập tên danh mục!");
        return;
      }
      const original = [...categories];
      const payload = {
        name: categoryForm.name,
        priority: Number(categoryForm.priority) || 0,
        status: categoryForm.status === "Hoạt động" ? "active" : "inactive",
      };
      setCategoryDialogOpen(false);

      if (dialogMode === "add") {
        const tempId = -Date.now();
        setCategories((prev) => [
          { id: tempId, name: payload.name, priority: payload.priority, status: categoryForm.status || "Hoạt động", postCount: 0 },
          ...prev,
        ]);
        toast.loading("Đang thêm danh mục...", { id: "cat-submit" });
        setIsCategorySaving(true);
        try {
          const newCat: any = await createAdminCategory(payload as any);
          toast.success("Thêm danh mục mới thành công!", { id: "cat-submit" });
          setCategories((prev) =>
            prev.map((c) =>
              c.id === tempId
                ? {
                    id: newCat.id,
                    name: newCat.name,
                    postCount: newCat.postCount || 0,
                    priority: newCat.priority || 0,
                    status: newCat.status === "active" ? "Hoạt động" : "Ngừng hoạt động",
                  }
                : c
            )
          );
        } catch (e: any) {
          setCategories(original);
          toast.error(e?.message || "Có lỗi xảy ra, vui lòng thử lại!", { id: "cat-submit" });
        } finally {
          setIsCategorySaving(false);
        }
      } else if (editId) {
        setCategories((prev) =>
          prev.map((c) =>
            c.id === editId
              ? { ...c, name: payload.name, priority: payload.priority, status: categoryForm.status || "Hoạt động" }
              : c
          )
        );
        toast.loading("Đang cập nhật...", { id: "cat-submit" });
        setIsCategorySaving(true);
        try {
          await updateAdminCategory(editId, payload as any);
          toast.success("Cập nhật danh mục thành công!", { id: "cat-submit" });
        } catch (e: any) {
          setCategories(original);
          toast.error(e?.message || "Có lỗi xảy ra, vui lòng thử lại!", { id: "cat-submit" });
        } finally {
          setIsCategorySaving(false);
        }
      }
    },
    [categoryForm, dialogMode, editId, categories]
  );

  const handleTabChange = useCallback(
    (tab: TabType) => {
      router.push(`/admin/${tab}`);
      setSidebarOpen(false);
    },
    [router]
  );

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

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-[#2c3e50] font-sans antialiased flex animate-fade-in">
      <AdminSidebar
        activeTab={"categories" as TabType}
        sidebarOpen={sidebarOpen}
        logoUrl={siteSettings.logoUrl}
        logoWebsiteName={siteSettings.logoWebsiteName}
        onTabChange={handleTabChange}
        onCloseSidebar={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
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
              <span>Quản lý danh mục</span>
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

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          <DefaultTab
            activeTab="categories"
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            postStartDate="" onPostStartDateChange={() => {}}
            postEndDate="" onPostEndDateChange={() => {}}
            postCategoryFilter="all" onPostCategoryFilterChange={() => {}}
            categoryOptions={[]}
            onResetFilters={() => setSearchQuery("")}
            hideDeletedPosts={false} onHideDeletedPostsChange={() => {}}
            onOpenAddDialog={handleOpenAddDialog}
            postsLoading={false} paginatedPosts={[]} postsPage={1} postsTotalPages={1}
            onPostsPageChange={() => {}} onPostEdit={() => {}} onPostDelete={() => {}}
            categoriesLoading={categoriesLoading} paginatedCategories={paginatedCategories}
            categoriesPage={categoriesPage} categoriesTotalPages={categoriesTotalPages}
            onCategoriesPageChange={setCategoriesPage}
            onCategoryEdit={handleOpenEditDialog}
            onCategoryDelete={handleConfirmDelete}
            onCategoryPriorityChange={handleCategoryPriorityChange}
            onCategoryStatusToggle={handleCategoryStatusToggle}
            adsLoading={false} paginatedAds={[]} adsPage={1} adsTotalPages={1}
            onAdsPageChange={() => {}} onAdEdit={() => {}} onAdDelete={() => {}} onAdStatusToggle={() => {}}
            accountsLoading={false} paginatedAccounts={[]} accountsPage={1} accountsTotalPages={1}
            onAccountsPageChange={() => {}} onAccountEdit={() => {}} onAccountDelete={() => {}}
            formatDateForDisplay={formatDateForDisplay}
          />
        </main>
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
        onCancel={() => { setDeleteConfirmOpen(false); setTargetIdToDelete(null); }}
      />
      <LogoutDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen} onConfirm={auth.handleLogout} />
    </div>
  );
}
