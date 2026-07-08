"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Menu, LayoutDashboard, LogOut } from "lucide-react";
import {
  getAdminAccounts,
  createAdminAccount,
  updateAdminAccount,
  deleteAdminAccount,
} from "@/lib/api/adminClient";
import { formatDateForDisplay } from "@/components/admin/AdminUtils";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminLogin from "@/components/admin/AdminLogin";
import DefaultTab from "@/components/admin/DefaultTab";
import AccountDialog from "@/components/admin/AccountDialog";
import DeleteConfirmDialog from "@/components/admin/DeleteConfirmDialog";
import LogoutDialog from "@/components/admin/LogoutDialog";
import { useAdminAuth } from "@/lib/hooks/useAdminAuth";
import { useSiteSettings } from "@/lib/hooks/useSiteSettings";
import { toast } from "sonner";
import type { TabType, AdminAccount } from "@/components/admin/AdminTypes";

const itemsPerPage = 6;

export default function AccountsPage() {
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

  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [accountsPage, setAccountsPage] = useState(1);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [editAccountId, setEditAccountId] = useState<string | null>(null);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [accountForm, setAccountForm] = useState<Partial<AdminAccount & { password?: string }>>({
    username: "", display_name: "", email: "", password: "", role: "admin",
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [targetAccountIdToDelete, setTargetAccountIdToDelete] = useState<string | null>(null);
  const [isAccountSaving, setIsAccountSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadAccounts = useCallback(async () => {
    try {
      setAccountsLoading(true);
      const res = await getAdminAccounts("?limit=100");
      if (res && res.items) setAccounts(res.items);
    } catch (err: any) {
      toast.error(err?.message || "Không thể tải danh sách tài khoản");
    } finally {
      setAccountsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (auth.isLoggedIn && auth.isAuthVerified) loadAccounts();
  }, [auth.isLoggedIn, auth.isAuthVerified, loadAccounts]);

  const filteredAccounts = useMemo(
    () =>
      accounts.filter((acc) => {
        const q = searchQuery.toLowerCase();
        return (acc.username || "").toLowerCase().includes(q) ||
          (acc.display_name || "").toLowerCase().includes(q) ||
          (acc.email || "").toLowerCase().includes(q);
      }),
    [accounts, searchQuery]
  );

  const paginatedAccounts = useMemo(() => {
    const start = (accountsPage - 1) * itemsPerPage;
    return filteredAccounts.slice(start, start + itemsPerPage);
  }, [filteredAccounts, accountsPage]);

  const accountsTotalPages = Math.ceil(filteredAccounts.length / itemsPerPage) || 1;

  const handleOpenAddDialog = useCallback(() => {
    setDialogMode("add");
    setEditAccountId(null);
    setAccountForm({ username: "", display_name: "", email: "", password: "", role: "admin" });
    setAccountDialogOpen(true);
  }, []);

  const handleOpenEditDialog = useCallback((item: AdminAccount) => {
    setDialogMode("edit");
    setEditAccountId(item.id);
    setAccountForm({
      username: item.username,
      display_name: item.display_name,
      email: item.email || "",
      password: "",
      role: item.role,
    });
    setAccountDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback((id: string) => {
    setTargetAccountIdToDelete(id);
    setDeleteConfirmOpen(true);
  }, []);

  const executeDelete = useCallback(async () => {
    if (targetAccountIdToDelete === null) return;
    setDeleteConfirmOpen(false);
    try {
      setIsDeleting(true);
      setAccounts((prev) => prev.filter((a) => a.id !== targetAccountIdToDelete));
      await deleteAdminAccount(targetAccountIdToDelete);
      toast.success("Xóa tài khoản thành công!");
    } catch (e: any) {
      toast.error(e?.message || "Lỗi khi xóa!");
    } finally {
      setIsDeleting(false);
      setTargetAccountIdToDelete(null);
    }
  }, [targetAccountIdToDelete]);

  const handleFormSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!accountForm.username?.trim()) { toast.error("Vui lòng nhập tên đăng nhập!"); return; }
      if (!accountForm.display_name?.trim()) { toast.error("Vui lòng nhập tên hiển thị!"); return; }
      if (!accountForm.email?.trim()) { toast.error("Vui lòng nhập email!"); return; }
      if (dialogMode === "add" && !accountForm.password?.trim()) { toast.error("Vui lòng nhập mật khẩu!"); return; }

      const original = [...accounts];
      setAccountDialogOpen(false);

      if (dialogMode === "add") {
        const payload = {
          email: accountForm.email.trim(),
          password: accountForm.password?.trim(),
          username: accountForm.username.trim(),
          display_name: accountForm.display_name.trim(),
          role: accountForm.role || "admin",
        };
        const tempId = `temp-${Date.now()}`;
        setAccounts((prev) => [
          { id: tempId, username: payload.username, display_name: payload.display_name, email: payload.email, role: payload.role, created_at: new Date().toISOString() },
          ...prev,
        ]);
        toast.loading("Đang thêm tài khoản...", { id: "account-submit" });
        setIsAccountSaving(true);
        try {
          const newAcc: any = await createAdminAccount(payload);
          toast.success("Thêm tài khoản mới thành công!", { id: "account-submit" });
          setAccounts((prev) =>
            prev.map((a) =>
              a.id === tempId
                ? { id: newAcc.id, username: newAcc.username, display_name: newAcc.display_name, email: newAcc.email, role: newAcc.role, created_at: newAcc.created_at }
                : a
            )
          );
        } catch (e: any) {
          setAccounts(original);
          toast.error(e?.message || "Có lỗi xảy ra, vui lòng thử lại!", { id: "account-submit" });
        } finally {
          setIsAccountSaving(false);
        }
      } else if (editAccountId) {
        const payload: any = {
          email: accountForm.email.trim(),
          username: accountForm.username.trim(),
          display_name: accountForm.display_name.trim(),
          role: accountForm.role || "admin",
        };
        if (accountForm.password?.trim()) payload.password = accountForm.password.trim();

        setAccounts((prev) =>
          prev.map((a) =>
            a.id === editAccountId
              ? { ...a, username: payload.username, display_name: payload.display_name, email: payload.email, role: payload.role }
              : a
          )
        );
        toast.loading("Đang cập nhật...", { id: "account-submit" });
        setIsAccountSaving(true);
        try {
          await updateAdminAccount(editAccountId, payload);
          toast.success("Cập nhật tài khoản thành công!", { id: "account-submit" });
        } catch (err: any) {
          setAccounts(original);
          toast.error(err.message || "Có lỗi xảy ra, vui lòng thử lại!", { id: "account-submit" });
        } finally {
          setIsAccountSaving(false);
        }
      }
    },
    [accountForm, dialogMode, editAccountId, accounts]
  );

  const handleTabChange = useCallback((tab: TabType) => {
    router.push(`/admin/${tab}`);
    setSidebarOpen(false);
  }, [router]);

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
        activeTab={"accounts" as TabType}
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
              <span>Quản lý Tài khoản</span>
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
            activeTab="accounts"
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
            categoriesLoading={false} paginatedCategories={[]} categoriesPage={1} categoriesTotalPages={1}
            onCategoriesPageChange={() => {}} onCategoryEdit={() => {}} onCategoryDelete={() => {}}
            onCategoryPriorityChange={() => {}} onCategoryStatusToggle={() => {}}
            adsLoading={false} paginatedAds={[]} adsPage={1} adsTotalPages={1}
            onAdsPageChange={() => {}} onAdEdit={() => {}} onAdDelete={() => {}} onAdStatusToggle={() => {}}
            accountsLoading={accountsLoading} paginatedAccounts={paginatedAccounts}
            accountsPage={accountsPage} accountsTotalPages={accountsTotalPages}
            onAccountsPageChange={setAccountsPage}
            onAccountEdit={handleOpenEditDialog}
            onAccountDelete={handleConfirmDelete}
            formatDateForDisplay={formatDateForDisplay}
          />
        </main>
      </div>

      <AccountDialog
        open={accountDialogOpen}
        onOpenChange={setAccountDialogOpen}
        dialogMode={dialogMode}
        accountForm={accountForm}
        isSaving={isAccountSaving}
        onFormChange={setAccountForm}
        onSubmit={handleFormSubmit}
      />
      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        activeTab="accounts"
        isDeleting={isDeleting}
        onConfirm={executeDelete}
        onCancel={() => { setDeleteConfirmOpen(false); setTargetAccountIdToDelete(null); }}
      />
      <LogoutDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen} onConfirm={auth.handleLogout} />
    </div>
  );
}
