"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminSettings,
  updateAdminSettings,
  uploadAdminMedia,
} from "@/lib/api/adminClient";
import LogoFooterTab from "@/components/admin/LogoFooterTab";
import QueryErrorBanner from "@/components/admin/QueryErrorBanner";
import { adminKeys } from "@/lib/query/adminKeys";
import { updateSiteSettingsCache } from "@/lib/hooks/useSiteSettings";
import { toast } from "sonner";
import { useUnsavedChangesWarning } from "@/lib/hooks/useUnsavedChangesWarning";

function applySettingsToForm(
  data: any,
  setters: {
    setLogoWebsiteName: (v: string) => void;
    setLogoUrl: (v: string | null) => void;
    setFooterOperator: (v: string) => void;
    setHeaderZaloUrl: (v: string) => void;
    setHeaderEmailUrl: (v: string) => void;
    setFooterAddress: (v: string) => void;
    setFooterPhone: (v: string) => void;
    setFooterEmail: (v: string) => void;
    setFooterLicense: (v: string) => void;
    setFooterResponsible: (v: string) => void;
  }
) {
  if (data.brand) {
    setters.setLogoWebsiteName(data.brand.name || "Tên Web");
    setters.setLogoUrl(data.brand.logo_url || null);
    setters.setFooterOperator(data.brand.copyright || "");
    setters.setHeaderZaloUrl(
      data.brand.socialLinks?.find((l: any) => l.platform === "zalo")?.href ||
        "https://zalo.me"
    );
    setters.setHeaderEmailUrl(
      data.brand.socialLinks?.find((l: any) => l.platform === "email")?.href ||
        "mailto:quangcao@linhka.vn"
    );
  }
  if (data.footer) {
    setters.setFooterAddress(data.footer.address || "");
    setters.setFooterPhone(data.footer.phone || "");
    setters.setFooterEmail(data.footer.email || "");
    setters.setFooterLicense(data.footer.license || "");
    setters.setFooterResponsible(data.footer.responsible || "");
  }
}

export default function LogoFooterPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, isFetching, isError, error, refetch, dataUpdatedAt } = useQuery({
    queryKey: adminKeys.settings,
    queryFn: () => getAdminSettings(),
    staleTime: 120_000,
  });

  const [logoWebsiteName, setLogoWebsiteName] = useState("Tên Web");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [footerOperator, setFooterOperator] = useState("Công ty TNHH PHD STUDIO");
  const [footerAddress, setFooterAddress] = useState(
    "246 Lê Đình Cẩn, phường Tân Tạo, quận Bình Tân, Thành phố Hồ Chí Minh"
  );
  const [footerResponsible, setFooterResponsible] = useState("Ông Phạm Hải Đăng");
  const [footerPhone, setFooterPhone] = useState("0327906965");
  const [footerEmail, setFooterEmail] = useState("congtyphdstudio@gmail.com");
  const [footerLicense, setFooterLicense] = useState("Số bao nhiêu ....");
  const [headerZaloUrl, setHeaderZaloUrl] = useState("https://zalo.me");
  const [headerEmailUrl, setHeaderEmailUrl] = useState(
    "mailto:quangcao@linhka.vn"
  );
  const [isSettingsSaving, setIsSettingsSaving] = useState(false);
  const [lastHydratedAt, setLastHydratedAt] = useState(0);
  const [dirty, setDirty] = useState(false);

  // Kích hoạt chặn đóng tab / F5 khi có thay đổi chưa lưu
  useUnsavedChangesWarning(dirty);

  // Re-hydrate whenever query data is newer and form is not dirty
  useEffect(() => {
    if (!data || !dataUpdatedAt) return;
    if (dirty && lastHydratedAt > 0) return;
    if (dataUpdatedAt === lastHydratedAt) return;
    applySettingsToForm(data, {
      setLogoWebsiteName,
      setLogoUrl,
      setFooterOperator,
      setHeaderZaloUrl,
      setHeaderEmailUrl,
      setFooterAddress,
      setFooterPhone,
      setFooterEmail,
      setFooterLicense,
      setFooterResponsible,
    });
    setLastHydratedAt(dataUpdatedAt);
    setDirty(false);
  }, [data, dataUpdatedAt, dirty, lastHydratedAt]);

  const markDirty = useCallback(<T,>(setter: (v: T) => void) => {
    return (v: T) => {
      setDirty(true);
      setter(v);
    };
  }, []);

  const handleSave = useCallback(async () => {
    try {
      setIsSettingsSaving(true);
      toast.loading("Đang lưu cấu hình...", { id: "save-logo-footer" });
      const updatedPayload = {
        brand: {
          name: logoWebsiteName,
          logo_url: logoUrl,
          copyright: footerOperator,
          utilityLinks: [],
          socialLinks: [
            {
              label: "Zalo",
              href: headerZaloUrl || "https://zalo.me",
              platform: "zalo",
            },
            {
              label: "Email",
              href: headerEmailUrl || "mailto:quangcao@linhka.vn",
              platform: "email",
            },
          ],
        },
        footer: {
          address: footerAddress,
          phone: footerPhone,
          email: footerEmail,
          license: footerLicense,
          responsible: footerResponsible,
        },
      };
      await updateAdminSettings(updatedPayload);
      queryClient.setQueryData(adminKeys.settings, updatedPayload);
      updateSiteSettingsCache(updatedPayload);
      setDirty(false);
      toast.success("Lưu thay đổi thành công!", { id: "save-logo-footer" });
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi lưu cấu hình!", {
        id: "save-logo-footer",
      });
    } finally {
      setIsSettingsSaving(false);
    }
  }, [
    logoWebsiteName,
    logoUrl,
    footerOperator,
    headerZaloUrl,
    headerEmailUrl,
    footerAddress,
    footerPhone,
    footerEmail,
    footerLicense,
    footerResponsible,
    queryClient,
  ]);

  const handleUploadLogo = useCallback(async (file: File) => {
    toast.loading("Đang tải ảnh logo lên...", { id: "upload-logo" });
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "settings");
      const res = await uploadAdminMedia(formData);
      if (res?.url) {
        setDirty(true);
        setLogoUrl(res.url);
        toast.success("Đã tải logo lên thành công!", { id: "upload-logo" });
      } else {
        throw new Error("Không nhận được URL từ server");
      }
    } catch (err: any) {
      toast.error("Tải logo thất bại: " + (err.message || err), {
        id: "upload-logo",
      });
    }
  }, []);

  const showLoading = isLoading && !data && lastHydratedAt === 0;

  return (
    <div className={isFetching && data ? "opacity-95" : undefined}>
      {isError && (
        <div className="mb-4">
          <QueryErrorBanner
            message={(error as Error)?.message || "Không thể tải cấu hình Logo & Footer."}
            onRetry={() => void refetch()}
            isRetrying={isFetching}
          />
        </div>
      )}
      <LogoFooterTab
        loading={showLoading}
        isSaving={isSettingsSaving}
        logoUrl={logoUrl}
        logoWebsiteName={logoWebsiteName}
        headerZaloUrl={headerZaloUrl}
        headerEmailUrl={headerEmailUrl}
        footerOperator={footerOperator}
        footerAddress={footerAddress}
        footerPhone={footerPhone}
        footerEmail={footerEmail}
        footerLicense={footerLicense}
        footerResponsible={footerResponsible}
        onLogoUrlChange={markDirty(setLogoUrl)}
        onLogoWebsiteNameChange={markDirty(setLogoWebsiteName)}
        onHeaderZaloUrlChange={markDirty(setHeaderZaloUrl)}
        onHeaderEmailUrlChange={markDirty(setHeaderEmailUrl)}
        onFooterOperatorChange={markDirty(setFooterOperator)}
        onFooterAddressChange={markDirty(setFooterAddress)}
        onFooterPhoneChange={markDirty(setFooterPhone)}
        onFooterEmailChange={markDirty(setFooterEmail)}
        onFooterLicenseChange={markDirty(setFooterLicense)}
        onFooterResponsibleChange={markDirty(setFooterResponsible)}
        onSave={handleSave}
        onUploadLogo={handleUploadLogo}
      />
    </div>
  );
}
