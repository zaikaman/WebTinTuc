"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import AdminQueryProvider from "@/lib/query/AdminQueryProvider";
import { AdminAuthProvider, useAdminAuth } from "@/lib/hooks/useAdminAuth";
import AdminShell from "@/components/admin/AdminShell";
import AdminLogin from "@/components/admin/AdminLogin";
import { adminKeys } from "@/lib/query/adminKeys";
import {
  getAdminDashboardStats,
  getAdminCategories,
  getAdminArticles,
} from "@/lib/api/adminClient";

function AdminGate({ children }: { children: React.ReactNode }) {
  const auth = useAdminAuth();
  const pathname = usePathname() || "/admin";
  const router = useRouter();
  const queryClient = useQueryClient();
  const warmedRef = useRef(false);

  const isLoginPath = pathname === "/admin" || pathname === "/admin/";

  // Soft client redirect (middleware also gates)
  useEffect(() => {
    if (!auth.isAuthVerified) return;
    if (!auth.isLoggedIn && !isLoginPath) {
      router.replace("/admin");
    }
    if (auth.isLoggedIn && isLoginPath) {
      router.replace("/admin/dashboard");
    }
  }, [auth.isAuthVerified, auth.isLoggedIn, isLoginPath, router]);

  // Warm React Query + server caches after login (idle)
  useEffect(() => {
    if (!auth.isLoggedIn || !auth.isAuthVerified || warmedRef.current) return;
    warmedRef.current = true;

    const warm = () => {
      void queryClient.prefetchQuery({
        queryKey: adminKeys.dashboard({}),
        queryFn: () => getAdminDashboardStats({}),
        staleTime: 60_000,
      });
      void queryClient.prefetchQuery({
        queryKey: adminKeys.categories("?limit=100"),
        queryFn: () => getAdminCategories("?limit=100"),
        staleTime: 60_000,
      });
      void queryClient.prefetchQuery({
        queryKey: adminKeys.articles({
          page: 1,
          limit: 20,
          includeDeleted: false,
        }),
        queryFn: () =>
          getAdminArticles("?page=1&limit=20&includeDeleted=false"),
        staleTime: 30_000,
      });
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const id = window.requestIdleCallback(warm, { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }
    const t = setTimeout(warm, 200);
    return () => clearTimeout(t);
  }, [auth.isLoggedIn, auth.isAuthVerified, queryClient]);

  if (!auth.isAuthVerified) {
    return (
      <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#E55956] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!auth.isLoggedIn) {
    if (!isLoginPath) {
      return (
        <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-[#E55956] border-t-transparent rounded-full" />
        </div>
      );
    }
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

  if (isLoginPath) {
    return (
      <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#E55956] border-t-transparent rounded-full" />
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminQueryProvider>
      <AdminAuthProvider>
        <AdminGate>{children}</AdminGate>
      </AdminAuthProvider>
    </AdminQueryProvider>
  );
}
