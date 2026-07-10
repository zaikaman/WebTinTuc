"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { getAdminSettings, updateAdminSettings, uploadAdminMedia } from "@/lib/api/adminClient";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminLogin from "@/components/admin/AdminLogin";
import LogoFooterTab from "@/components/admin/LogoFooterTab";
import LogoutDialog from "@/components/admin/LogoutDialog";
import { useAdminAuth } from "@/lib/hooks/useAdminAuth";
import { cachedSiteSettings, setCachedSiteSettings } from "@/lib/hooks/useSiteSettings";
import { toast } from "sonner";
import type { TabType } from "@/components/admin/AdminTypes";

export default function LogoFooterPage() {
  const router = useRouter();
  const auth = useAdminAuth();

  // --- Auth redirect ---
  useEffect(() => {
    if (!auth.isAuthVerified) return;
    if (!auth.isLoggedIn) {
      router.replace("/admin");
    }
  }, [auth.isAuthVerified, auth.isLoggedIn, router]);

  // --- Sidebar state ---
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  // --- Logo & Footer state ---
  const cachedSettingsRef = useRef<any>(cachedSiteSettings);

  const [logoWebsiteName, setLogoWebsiteName] = useState("Tên Web");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [footerOperator, setFooterOperator] = useState("Công ty TNHH PHD STUDIO");
  const [footerAddress, setFooterAddress] = useState("246 Lê Đình Cẩn, phường Tân Tạo, quận Bình Tân, Thành phố Hồ Chí Minh");
  const [footerResponsible, setFooterResponsible] = useState("Ông Phạm Hải Đăng");
  const [footerPhone, setFooterPhone] = useState("0327906965");
  const [footerEmail, setFooterEmail] = useState("congtyphdstudio@gmail.com");
  const [footerLicense, setFooterLicense] = useState("Số bao nhiêu ....");
  const [headerZaloUrl, setHeaderZaloUrl] = useState("https://zalo.me");
  const [headerEmailUrl, setHeaderEmailUrl] = useState("mailto:quangcao@linhka.vn");
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [isSettingsSaving, setIsSettingsSaving] = useState(false);

  // --- Load settings ---
  const loadSettings = useCallback(async () => {
    // If we have cached settings, just apply them without showing loading
    if (cachedSettingsRef.current) {
      const res = cachedSettingsRef.current;
      if (res.brand) {
        setLogoWebsiteName(res.brand.name || "Tên Web");
        setLogoUrl(res.brand.logo_url || null);
        setFooterOperator(res.brand.copyright || "");
        setHeaderZaloUrl(
          res.brand.socialLinks?.find((l: any) => l.platform === "zalo")?.href || "https://zalo.me"
        );
        setHeaderEmailUrl(
          res.brand.socialLinks?.find((l: any) => l.platform === "email")?.href || "mailto:quangcao@linhka.vn"
        );
      }
      if (res.footer) {
        setFooterAddress(res.footer.address || "");
        setFooterPhone(res.footer.phone || "");
        setFooterEmail(res.footer.email || "");
        setFooterLicense(res.footer.license || "");
        setFooterResponsible(res.footer.responsible || "");
      }
      setSettingsLoading(false);
      return;
    }

    try {
      setSettingsLoading(true);
      const res = await getAdminSettings();
      if (res) {
        cachedSettingsRef.current = res;
        if (res.brand) {
          setLogoWebsiteName(res.brand.name || "Tên Web");
          setLogoUrl(res.brand.logo_url || null);
          setFooterOperator(res.brand.copyright || "");
          setHeaderZaloUrl(
            res.brand.socialLinks?.find((l: any) => l.platform === "zalo")?.href || "https://zalo.me"
          );
          setHeaderEmailUrl(
            res.brand.socialLinks?.find((l: any) => l.platform === "email")?.href || "mailto:quangcao@linhka.vn"
          );
        }
        if (res.footer) {
          setFooterAddress(res.footer.address || "");
          setFooterPhone(res.footer.phone || "");
          setFooterEmail(res.footer.email || "");
          setFooterLicense(res.footer.license || "");
          setFooterResponsible(res.footer.responsible || "");
        }
      }
    } catch {
      // ignore
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (auth.isLoggedIn && auth.isAuthVerified) {
      loadSettings();
    }
  }, [auth.isLoggedIn, auth.isAuthVerified, loadSettings]);

  // --- Save handler ---
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
      cachedSettingsRef.current = updatedPayload;
      setCachedSiteSettings(updatedPayload); // Cập nhật cache toàn cục
      toast.success("Lưu thay đổi thành công!", { id: "save-logo-footer" });
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi lưu cấu hình!", { id: "save-logo-footer" });
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
  ]);

  // --- Upload logo handler ---
  const handleUploadLogo = useCallback(async (file: File) => {
    toast.loading("Đang tải ảnh logo lên...", { id: "upload-logo" });
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "settings");
      const res = await uploadAdminMedia(formData);
      if (res && res.url) {
        setLogoUrl(res.url);
        toast.success("Đã tải logo lên thành công!", { id: "upload-logo" });
      } else {
        throw new Error("Không nhận được URL từ server");
      }
    } catch (err: any) {
      toast.error("Tải logo thất bại: " + (err.message || err), { id: "upload-logo" });
    }
  }, []);

  const handleTabChange = useCallback(
    (tab: TabType) => {
      router.push(`/admin/${tab}`);
      setSidebarOpen(false);
    },
    [router]
  );

  // --- Loading state while verifying auth ---
  if (!auth.isAuthVerified) {
    return (
      <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#E55956] border-t-transparent rounded-full" />
      </div>
    );
  }

  // --- Login screen ---
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

  // --- Main layout ---
  return (
    <div className="min-h-screen bg-[#f4f6f8] text-[#2c3e50] font-sans antialiased flex animate-fade-in">
      {/* Sidebar */}
      <AdminSidebar
        activeTab={"logo-footer" as TabType}
        sidebarOpen={sidebarOpen}
        logoUrl={logoUrl}
        logoWebsiteName={logoWebsiteName}
        onTabChange={handleTabChange}
        onCloseSidebar={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Top navbar */}
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
              <span>Logo &amp; Footer</span>
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

        {/* Page content */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          <LogoFooterTab
            loading={settingsLoading}
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
        </main>
      </div>

      {/* Logout confirmation dialog */}
      <LogoutDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        onConfirm={auth.handleLogout}
      />
    </div>
  );
}
