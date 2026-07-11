"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminAccounts,
  createAdminAccount,
  updateAdminAccount,
  deleteAdminAccount,
} from "@/lib/api/adminClient";
import { formatDateForDisplay } from "@/components/admin/AdminUtils";
import DefaultTab from "@/components/admin/DefaultTab";
import AccountDialog from "@/components/admin/AccountDialog";
import DeleteConfirmDialog from "@/components/admin/DeleteConfirmDialog";
import QueryErrorBanner from "@/components/admin/QueryErrorBanner";
import { adminKeys } from "@/lib/query/adminKeys";
import { useAdminAuth } from "@/lib/hooks/useAdminAuth";
import { toast } from "sonner";
import type { AdminAccount } from "@/components/admin/AdminTypes";

const itemsPerPage = 6;
const QS = "?limit=100";

export default function AccountsPage() {
  const queryClient = useQueryClient();
  const { adminProfile } = useAdminAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [accountsPage, setAccountsPage] = useState(1);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [editAccountId, setEditAccountId] = useState<string | null>(null);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [accountForm, setAccountForm] = useState<
    Partial<AdminAccount & { password?: string }>
  >({
    username: "",
    display_name: "",
    email: "",
    password: "",
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [targetAccountIdToDelete, setTargetAccountIdToDelete] = useState<
    string | null
  >(null);
  const [isAccountSaving, setIsAccountSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [localOverride, setLocalOverride] = useState<AdminAccount[] | null>(null);

  const isSelfDelete =
    Boolean(targetAccountIdToDelete) &&
    Boolean(adminProfile?.id) &&
    targetAccountIdToDelete === adminProfile?.id;

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: adminKeys.accounts(QS),
    queryFn: () => getAdminAccounts(QS),
    staleTime: 60_000,
  });

  const accounts = localOverride ?? data?.items ?? [];

  const invalidate = useCallback(() => {
    setLocalOverride(null);
    void queryClient.invalidateQueries({ queryKey: adminKeys.accountsRoot });
  }, [queryClient]);

  const filteredAccounts = useMemo(
    () =>
      accounts.filter((acc) => {
        const q = searchQuery.toLowerCase();
        return (
          (acc.username || "").toLowerCase().includes(q) ||
          (acc.display_name || "").toLowerCase().includes(q) ||
          (acc.email || "").toLowerCase().includes(q)
        );
      }),
    [accounts, searchQuery]
  );

  const paginatedAccounts = useMemo(() => {
    const start = (accountsPage - 1) * itemsPerPage;
    return filteredAccounts.slice(start, start + itemsPerPage);
  }, [filteredAccounts, accountsPage]);

  const accountsTotalPages =
    Math.ceil(filteredAccounts.length / itemsPerPage) || 1;

  const handleOpenAddDialog = useCallback(() => {
    setDialogMode("add");
    setEditAccountId(null);
    setAccountForm({
      username: "",
      display_name: "",
      email: "",
      password: "",
    });
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
    });
    setAccountDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback((id: string) => {
    setTargetAccountIdToDelete(id);
    setDeleteConfirmOpen(true);
  }, []);

  const executeDelete = useCallback(async () => {
    if (targetAccountIdToDelete === null) return;
    const selfDelete =
      Boolean(adminProfile?.id) && targetAccountIdToDelete === adminProfile?.id;
    setDeleteConfirmOpen(false);
    try {
      setIsDeleting(true);
      setLocalOverride(accounts.filter((a) => a.id !== targetAccountIdToDelete));
      await deleteAdminAccount(targetAccountIdToDelete, {
        confirmSelfDelete: selfDelete,
      });
      toast.success("Xóa tài khoản thành công!");
      invalidate();
    } catch (e: any) {
      toast.error(e?.message || "Lỗi khi xóa!");
      invalidate();
    } finally {
      setIsDeleting(false);
      setTargetAccountIdToDelete(null);
    }
  }, [targetAccountIdToDelete, accounts, invalidate, adminProfile?.id]);

  const handleFormSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!accountForm.username?.trim()) {
        toast.error("Vui lòng nhập tên đăng nhập!");
        return;
      }
      if (!accountForm.display_name?.trim()) {
        toast.error("Vui lòng nhập tên hiển thị!");
        return;
      }
      if (!accountForm.email?.trim()) {
        toast.error("Vui lòng nhập email!");
        return;
      }
      if (dialogMode === "add" && !accountForm.password?.trim()) {
        toast.error("Vui lòng nhập mật khẩu!");
        return;
      }

      setIsAccountSaving(true);
      try {
        if (dialogMode === "add") {
          toast.loading("Đang thêm tài khoản...", { id: "account-submit" });
          await createAdminAccount({
            email: accountForm.email.trim(),
            password: accountForm.password?.trim(),
            username: accountForm.username.trim(),
            display_name: accountForm.display_name.trim(),
          });
          toast.success("Thêm tài khoản mới thành công!", { id: "account-submit" });
        } else if (editAccountId) {
          const payload: any = {
            email: accountForm.email.trim(),
            username: accountForm.username.trim(),
            display_name: accountForm.display_name.trim(),
          };
          if (accountForm.password?.trim()) payload.password = accountForm.password.trim();
          toast.loading("Đang cập nhật...", { id: "account-submit" });
          await updateAdminAccount(editAccountId, payload);
          toast.success("Cập nhật tài khoản thành công!", { id: "account-submit" });
        }
        setAccountDialogOpen(false);
        invalidate();
      } catch (err: any) {
        toast.error(err?.message || "Có lỗi xảy ra, vui lòng thử lại!", {
          id: "account-submit",
        });
      } finally {
        setIsAccountSaving(false);
      }
    },
    [accountForm, dialogMode, editAccountId, invalidate]
  );

  const showLoading = isLoading && !data;

  return (
    <>
      <div className={isFetching && data ? "opacity-95" : undefined}>
        {isError && (
          <div className="mb-4">
            <QueryErrorBanner
              message={(error as Error)?.message || "Không thể tải danh sách tài khoản."}
              onRetry={() => void refetch()}
              isRetrying={isFetching}
            />
          </div>
        )}
        <DefaultTab
          activeTab="accounts"
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
          adsLoading={false}
          paginatedAds={[]}
          adsPage={1}
          adsTotalPages={1}
          onAdsPageChange={() => {}}
          onAdEdit={() => {}}
          onAdDelete={() => {}}
          onAdStatusToggle={() => {}}
          accountsLoading={showLoading}
          paginatedAccounts={paginatedAccounts}
          accountsPage={accountsPage}
          accountsTotalPages={accountsTotalPages}
          onAccountsPageChange={setAccountsPage}
          onAccountEdit={handleOpenEditDialog}
          onAccountDelete={handleConfirmDelete}
          formatDateForDisplay={formatDateForDisplay}
          pageSize={itemsPerPage}
        />
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
        isSelfDelete={isSelfDelete}
        onConfirm={executeDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setTargetAccountIdToDelete(null);
        }}
      />
    </>
  );
}
