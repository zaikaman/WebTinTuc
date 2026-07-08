"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Menu, LayoutDashboard, LogOut } from "lucide-react";
import {
  getAdminAds,
  createAdminAd,
  updateAdminAd,
  deleteAdminAd,
} from "@/lib/api/adminClient";
import { formatDateForDisplay } from "@/components/admin/AdminUtils";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminLogin from "@/components/admin/AdminLogin";
import DefaultTab from "@/components/admin/DefaultTab";
import AdDialog from "@/components/admin/AdDialog";
import DeleteConfirmDialog from "@/components/admin/DeleteConfirmDialog";
import LogoutDialog from "@/components/admin/LogoutDialog";
import { useAdminAuth } from "@/lib/hooks/useAdminAuth";
import { useSiteSettings } from "@/lib/hooks/useSiteSettings";
import { toast } from "sonner";
import type { TabType, Ad } from "@/components/admin/AdminTypes";

const itemsPerPage = 6;

export default function AdsPage() {
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

  const [ads, setAds] = useState<Ad[]>([]);
  const [adsLoading, setAdsLoading] = useState(true);
  const [adsPage, setAdsPage] = useState(1);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [editId, setEditId] = useState<number | null>(null);
  const [adDialogOpen, setAdDialogOpen] = useState(false);
  const [adForm, setAdForm] = useState<Partial<Ad>>({
    name: "", position: "header", clicks: 0,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    status: "Hoạt động", link: "",
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [targetIdToDelete, setTargetIdToDelete] = useState<number | null>(null);
  const [isAdSaving, setIsAdSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadAds = useCallback(async () => {
    try {
      setAdsLoading(true);
      const res = await getAdminAds("?limit=100");
      setAds(
        (res.items || []).map((a: any) => {
          const now = new Date();
          const startDateStr = a.starts_at ? a.starts_at.split("T")[0] : null;
          const endDateStr = a.ends_at ? a.ends_at.split("T")[0] : null;
          const start = startDateStr ? new Date(startDateStr + "T00:00:00") : null;
          const end = endDateStr ? new Date(endDateStr + "T23:59:59") : null;
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
            startDate: a.starts_at ? new Date(a.starts_at).toISOString().split("T")[0] : "",
            endDate: a.ends_at ? new Date(a.ends_at).toISOString().split("T")[0] : "",
            status: computedStatus,
            image: a.media_key || undefined,
            link: a.target_url || undefined,
          } as Ad;
        })
      );
    } catch (err: any) {
      console.error(err?.message);
    } finally {
      setAdsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (auth.isLoggedIn && auth.isAuthVerified) loadAds();
  }, [auth.isLoggedIn, auth.isAuthVerified, loadAds]);

  const filteredAds = useMemo(
    () =>
      ads.filter(
        (ad) =>
          ad.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ad.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ad.id.toString() === searchQuery
      ),
    [ads, searchQuery]
  );

  const paginatedAds = useMemo(() => {
    const start = (adsPage - 1) * itemsPerPage;
    return filteredAds.slice(start, start + itemsPerPage);
  }, [filteredAds, adsPage]);

  const adsTotalPages = Math.ceil(filteredAds.length / itemsPerPage) || 1;

  const handleOpenAddDialog = useCallback(() => {
    setDialogMode("add");
    setEditId(null);
    setAdForm({
      name: "", position: "Header", clicks: 0,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "Hoạt động", link: "",
    });
    setAdDialogOpen(true);
  }, []);

  const handleOpenEditDialog = useCallback((item: Ad) => {
    setDialogMode("edit");
    setEditId(item.id);
    setAdForm(item);
    setAdDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback((id: number) => {
    setTargetIdToDelete(id);
    setDeleteConfirmOpen(true);
  }, []);

  const handleAdStatusToggle = useCallback(
    async (ad: Ad) => {
      const original = [...ads];
      const isActive = ad.status === "Hoạt động" || ad.status === "Chờ chạy";
      const nextDbStatus = isActive ? "inactive" : "active";
      const now = new Date();
      const startDateStr = ad.startDate ? ad.startDate.split("T")[0] : null;
      const endDateStr = ad.endDate ? ad.endDate.split("T")[0] : null;
      const start = startDateStr ? new Date(startDateStr + "T00:00:00") : null;
      const end = endDateStr ? new Date(endDateStr + "T23:59:59") : null;
      let optimisticStatus = "Ngừng hoạt động";
      if (nextDbStatus === "active") {
        if (end && end < now) optimisticStatus = "Đã kết thúc";
        else if (start && start > now) optimisticStatus = "Chờ chạy";
        else optimisticStatus = "Hoạt động";
      }
      setAds((prev) => prev.map((a) => (a.id === ad.id ? { ...a, status: optimisticStatus } : a)));
      try {
        await updateAdminAd(ad.id, { status: nextDbStatus });
        toast.success(`Đã đổi trạng thái quảng cáo sang "${optimisticStatus}"`);
    } catch (e: any) {
      setAds(original);
      toast.error(e?.message || "Lỗi khi đổi trạng thái quảng cáo!");
    }
    },
    [ads]
  );

  const executeDelete = useCallback(async () => {
    if (targetIdToDelete === null) return;
    setDeleteConfirmOpen(false);
    try {
      setIsDeleting(true);
      setAds((prev) => prev.filter((a) => a.id !== targetIdToDelete));
      await deleteAdminAd(targetIdToDelete);
      toast.success("Xóa quảng cáo thành công!");
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
      if (!adForm.name?.trim()) {
        toast.error("Vui lòng nhập tên quảng cáo!");
        return;
      }
      const original = [...ads];
      const payload = {
        name: adForm.name,
        position: adForm.position || "header",
        type: "image",
        media_key: adForm.image || null,
        target_url: adForm.link || null,
        starts_at: adForm.startDate ? new Date(adForm.startDate + "T00:00:00").toISOString() : null,
        ends_at: adForm.endDate ? new Date(adForm.endDate + "T23:59:59").toISOString() : null,
        status: adForm.status === "Ngừng hoạt động" || adForm.status === "Đã kết thúc" ? "inactive" : "active",
      };
      setAdDialogOpen(false);

      const now = new Date();
      const startDateStr = adForm.startDate ? adForm.startDate.split("T")[0] : null;
      const endDateStr = adForm.endDate ? adForm.endDate.split("T")[0] : null;
      const start = startDateStr ? new Date(startDateStr + "T00:00:00") : null;
      const end = endDateStr ? new Date(endDateStr + "T23:59:59") : null;
      let computedStatus = "Ngừng hoạt động";
      if (payload.status === "active") {
        if (end && end < now) computedStatus = "Đã kết thúc";
        else if (start && start > now) computedStatus = "Chờ chạy";
        else computedStatus = "Hoạt động";
      }

      if (dialogMode === "add") {
        const tempId = -Date.now();
        setAds((prev) => [
          { id: tempId, name: payload.name, position: payload.position, clicks: 0, startDate: adForm.startDate || "", endDate: adForm.endDate || "", status: computedStatus, image: adForm.image, link: adForm.link },
          ...prev,
        ]);
        toast.loading("Đang thêm quảng cáo...", { id: "ad-submit" });
        setIsAdSaving(true);
        try {
          const newAd: any = await createAdminAd(payload as any);
          toast.success("Thêm quảng cáo mới thành công!", { id: "ad-submit" });
          setAds((prev) =>
            prev.map((a) =>
              a.id === tempId
                ? {
                    id: newAd.id, name: newAd.name, position: newAd.position, clicks: newAd.clicks || 0,
                    startDate: newAd.starts_at ? newAd.starts_at.split("T")[0] : "",
                    endDate: newAd.ends_at ? newAd.ends_at.split("T")[0] : "",
                    status: computedStatus, image: newAd.media_key || undefined, link: newAd.target_url || undefined,
                  }
                : a
            )
          );
        } catch (e: any) {
          setAds(original);
          toast.error(e?.message || "Có lỗi xảy ra, vui lòng thử lại!", { id: "ad-submit" });
        } finally {
          setIsAdSaving(false);
        }
      } else if (editId) {
        setAds((prev) =>
          prev.map((a) =>
            a.id === editId
              ? { ...a, name: payload.name, position: payload.position, startDate: adForm.startDate || "", endDate: adForm.endDate || "", status: computedStatus, image: adForm.image, link: adForm.link }
              : a
          )
        );
        toast.loading("Đang cập nhật...", { id: "ad-submit" });
        setIsAdSaving(true);
        try {
          await updateAdminAd(editId, payload as any);
          toast.success("Cập nhật quảng cáo thành công!", { id: "ad-submit" });
        } catch (e: any) {
          setAds(original);
          toast.error(e?.message || "Có lỗi xảy ra, vui lòng thử lại!", { id: "ad-submit" });
        } finally {
          setIsAdSaving(false);
        }
      }
    },
    [adForm, dialogMode, editId, ads]
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
        activeTab={"ads" as TabType}
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
              <span>Quản lý AD</span>
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
            activeTab="ads"
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
            adsLoading={adsLoading} paginatedAds={paginatedAds}
            adsPage={adsPage} adsTotalPages={adsTotalPages}
            onAdsPageChange={setAdsPage}
            onAdEdit={handleOpenEditDialog}
            onAdDelete={handleConfirmDelete}
            onAdStatusToggle={handleAdStatusToggle}
            accountsLoading={false} paginatedAccounts={[]} accountsPage={1} accountsTotalPages={1}
            onAccountsPageChange={() => {}} onAccountEdit={() => {}} onAccountDelete={() => {}}
            formatDateForDisplay={formatDateForDisplay}
          />
        </main>
      </div>

      <AdDialog
        open={adDialogOpen}
        onOpenChange={setAdDialogOpen}
        dialogMode={dialogMode}
        adForm={adForm}
        isSaving={isAdSaving}
        onFormChange={setAdForm}
        onSubmit={handleFormSubmit}
      />
      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        activeTab="ads"
        isDeleting={isDeleting}
        onConfirm={executeDelete}
        onCancel={() => { setDeleteConfirmOpen(false); setTargetIdToDelete(null); }}
      />
      <LogoutDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen} onConfirm={auth.handleLogout} />
    </div>
  );
}
