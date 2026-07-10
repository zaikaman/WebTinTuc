"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminLogin from "@/components/admin/AdminLogin";
import { useAdminAuth } from "@/lib/hooks/useAdminAuth";
import { toast } from "sonner";

export default function AdminDashboard() {
  const {
    isLoggedIn,
    isAuthVerified,
    loginUsername,
    loginPassword,
    showPassword,
    isLoading,
    setLoginUsername,
    setLoginPassword,
    setShowPassword,
    handleLogin,
  } = useAdminAuth();

  const pathname = usePathname();
  const router = useRouter();

  // Redirect logic (client soft lock; middleware also gates /admin/*)
  useEffect(() => {
    if (!isAuthVerified) return;

    if (!isLoggedIn && pathname && pathname !== "/admin" && pathname !== "/admin/") {
      router.replace("/admin");
      toast.warning("Vui lòng đăng nhập trước!");
    }

    if (isLoggedIn && (pathname === "/admin" || pathname === "/admin/")) {
      router.replace("/admin/dashboard");
    }
  }, [isLoggedIn, isAuthVerified, pathname, router]);

  // Loading spinner while verifying
  if (!isAuthVerified) {
    return (
      <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#E55956] border-t-transparent rounded-full" />
      </div>
    );
  }

  // Login screen
  if (!isLoggedIn) {
    return (
      <AdminLogin
        loginUsername={loginUsername}
        loginPassword={loginPassword}
        showPassword={showPassword}
        isLoading={isLoading}
        onUsernameChange={setLoginUsername}
        onPasswordChange={setLoginPassword}
        onTogglePassword={() => setShowPassword(!showPassword)}
        onSubmit={handleLogin}
      />
    );
  }

  // Loading spinner while redirecting
  return (
    <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-[#E55956] border-t-transparent rounded-full" />
    </div>
  );
}
