"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminSettings,
  updateAdminSettings,
  uploadAdminMedia,
} from "@/lib/api/adminClient";
import LogoFooterTab from "@/components/admin/LogoFooterTab";
import { adminKeys } from "@/lib/query/adminKeys";
import { toast } from "sonner";

export default function LogoFooterPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, isFetching } = useQuery({
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
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!data || hydrated) return;
    if (data.brand) {
      setLogoWebsiteName(data.brand.name || "Tên Web");
      setLogoUrl(data.brand.logo_url || null);
      setFooterOperator(data.brand.copyright || "");
      setHeaderZaloUrl(
        data.brand.socialLinks?.find((l: any) => l.platform === "zalo")?.href ||
          "https://zalo.me"
      );
      setHeaderEmailUrl(
        data.brand.socialLinks?.find((l: any) => l.platform === "email")
          ?.href || "mailto:quangcao@linhka.vn"
      );
    }
    if (data.footer) {
      setFooterAddress(data.footer.address || "");
      setFooterPhone(data.footer.phone || "");
      setFooterEmail(data.footer.email || "");
      setFooterLicense(data.footer.license || "");
      setFooterResponsible(data.footer.responsible || "");
    }
    setHydrated(true);
  }, [data, hydrated]);

  // Re-hydrate when cache updates after save/invalidate
  useEffect(() => {
    if (!data || !hydrated) return;
  }, [data, hydrated]);

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

  const showLoading = isLoading && !data && !hydrated;

  return (
    <div className={isFetching && data ? "opacity-95" : undefined}>
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
        onLogoUrlChange={setLogoUrl}
        onLogoWebsiteNameChange={setLogoWebsiteName}
        onHeaderZaloUrlChange={setHeaderZaloUrl}
        onHeaderEmailUrlChange={setHeaderEmailUrl}
        onFooterOperatorChange={setFooterOperator}
        onFooterAddressChange={setFooterAddress}
        onFooterPhoneChange={setFooterPhone}
        onFooterEmailChange={setFooterEmail}
        onFooterLicenseChange={setFooterLicense}
        onFooterResponsibleChange={setFooterResponsible}
        onSave={handleSave}
        onUploadLogo={handleUploadLogo}
      />
    </div>
  );
}
