"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminAds,
  createAdminAd,
  updateAdminAd,
  deleteAdminAd,
} from "@/lib/api/adminClient";
import { formatDateForDisplay } from "@/components/admin/AdminUtils";
import DefaultTab from "@/components/admin/DefaultTab";
import AdDialog from "@/components/admin/AdDialog";
import DeleteConfirmDialog from "@/components/admin/DeleteConfirmDialog";
import QueryErrorBanner from "@/components/admin/QueryErrorBanner";
import { adminKeys } from "@/lib/query/adminKeys";
import { toast } from "sonner";
import type { Ad } from "@/components/admin/AdminTypes";

const itemsPerPage = 6;
const QS = "?limit=100";

function mapAds(items: any[]): Ad[] {
  return (items || []).map((a: any) => {
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
  });
}

export default function AdsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [adsPage, setAdsPage] = useState(1);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [editId, setEditId] = useState<number | null>(null);
  const [adDialogOpen, setAdDialogOpen] = useState(false);
  const [adForm, setAdForm] = useState<Partial<Ad>>({
    name: "",
    position: "header",
    clicks: 0,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    status: "Hoạt động",
    link: "",
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [targetIdToDelete, setTargetIdToDelete] = useState<number | null>(null);
  const [isAdSaving, setIsAdSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [localOverride, setLocalOverride] = useState<Ad[] | null>(null);

  const { data, isLoading, isFetching, isError, refetch, error } = useQuery({
    queryKey: adminKeys.ads(QS),
    queryFn: () => getAdminAds(QS),
    staleTime: 60_000,
  });

  const ads = localOverride ?? mapAds(data?.items || []);

  const invalidate = useCallback(() => {
    setLocalOverride(null);
    void queryClient.invalidateQueries({ queryKey: adminKeys.adsRoot });
  }, [queryClient]);

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
      name: "",
      position: "header",
      clicks: 0,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "Hoạt động",
      link: "",
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
      const original = ads;
      const isActive = ad.status === "Hoạt động" || ad.status === "Chờ chạy";
      const nextDbStatus = isActive ? "inactive" : "active";
      const now = new Date();
      const start = ad.startDate ? new Date(ad.startDate + "T00:00:00") : null;
      const end = ad.endDate ? new Date(ad.endDate + "T23:59:59") : null;
      let optimisticStatus = "Ngừng hoạt động";
      if (nextDbStatus === "active") {
        if (end && end < now) optimisticStatus = "Đã kết thúc";
        else if (start && start > now) optimisticStatus = "Chờ chạy";
        else optimisticStatus = "Hoạt động";
      }
      setLocalOverride(ads.map((a) => (a.id === ad.id ? { ...a, status: optimisticStatus } : a)));
      try {
        await updateAdminAd(ad.id, { status: nextDbStatus });
        toast.success(`Đã đổi trạng thái quảng cáo sang "${optimisticStatus}"`);
        invalidate();
      } catch (e: any) {
        setLocalOverride(original);
        toast.error(e?.message || "Lỗi khi đổi trạng thái quảng cáo!");
      }
    },
    [ads, invalidate]
  );

  const executeDelete = useCallback(async () => {
    if (targetIdToDelete === null) return;
    setDeleteConfirmOpen(false);
    try {
      setIsDeleting(true);
      setLocalOverride(ads.filter((a) => a.id !== targetIdToDelete));
      await deleteAdminAd(targetIdToDelete);
      toast.success("Xóa quảng cáo thành công!");
      invalidate();
    } catch (e: any) {
      toast.error(e?.message || "Lỗi khi xóa!");
      invalidate();
    } finally {
      setIsDeleting(false);
      setTargetIdToDelete(null);
    }
  }, [targetIdToDelete, ads, invalidate]);

  const handleFormSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!adForm.name?.trim()) {
        toast.error("Vui lòng nhập tên quảng cáo!");
        return;
      }
      if (adForm.image?.startsWith("data:")) {
        toast.error("Ảnh quảng cáo chưa được tải lên. Vui lòng chọn lại ảnh!");
        return;
      }
      const payload = {
        name: adForm.name,
        position: adForm.position || "header",
        type: "image",
        media_key: adForm.image || null,
        target_url: adForm.link || null,
        starts_at: adForm.startDate
          ? new Date(adForm.startDate + "T00:00:00").toISOString()
          : null,
        ends_at: adForm.endDate
          ? new Date(adForm.endDate + "T23:59:59").toISOString()
          : null,
        status:
          adForm.status === "Ngừng hoạt động" || adForm.status === "Đã kết thúc"
            ? "inactive"
            : "active",
      };
      setIsAdSaving(true);
      try {
        if (dialogMode === "add") {
          toast.loading("Đang thêm quảng cáo...", { id: "ad-submit" });
          await createAdminAd(payload as any);
          toast.success("Thêm quảng cáo mới thành công!", { id: "ad-submit" });
        } else if (editId) {
          toast.loading("Đang cập nhật...", { id: "ad-submit" });
          await updateAdminAd(editId, payload as any);
          toast.success("Cập nhật quảng cáo thành công!", { id: "ad-submit" });
        }
        setAdDialogOpen(false);
        invalidate();
      } catch (e: any) {
        toast.error(e?.message || "Có lỗi xảy ra, vui lòng thử lại!", {
          id: "ad-submit",
        });
      } finally {
        setIsAdSaving(false);
      }
    },
    [adForm, dialogMode, editId, invalidate]
  );

  const showLoading = isLoading && !data;

  return (
    <>
      <div className={isFetching && data ? "opacity-95" : undefined}>
        {isError && (
          <div className="mb-4">
            <QueryErrorBanner
              message={(error as Error)?.message || "Không thể tải danh sách quảng cáo."}
              onRetry={() => void refetch()}
              isRetrying={isFetching}
            />
          </div>
        )}
        <DefaultTab
          activeTab="ads"
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
          categoriesLoading={false}
          paginatedCategories={[]}
          categoriesPage={1}
          categoriesTotalPages={1}
          onCategoriesPageChange={() => {}}
          onCategoryEdit={() => {}}
          onCategoryDelete={() => {}}
          onCategoryPriorityChange={() => {}}
          onCategoryStatusToggle={() => {}}
          adsLoading={showLoading}
          paginatedAds={paginatedAds}
          adsPage={adsPage}
          adsTotalPages={adsTotalPages}
          onAdsPageChange={setAdsPage}
          onAdEdit={handleOpenEditDialog}
          onAdDelete={handleConfirmDelete}
          onAdStatusToggle={handleAdStatusToggle}
          accountsLoading={false}
          paginatedAccounts={[]}
          accountsPage={1}
          accountsTotalPages={1}
          onAccountsPageChange={() => {}}
          onAccountEdit={() => {}}
          onAccountDelete={() => {}}
          formatDateForDisplay={formatDateForDisplay}
          pageSize={itemsPerPage}
        />
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
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setTargetIdToDelete(null);
        }}
      />
    </>
  );
}
