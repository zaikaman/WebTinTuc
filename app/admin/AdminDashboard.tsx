"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminLogin from "@/components/admin/AdminLogin";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("admin_logged_in") === "true";
  });
  const [isAuthVerified, setIsAuthVerified] = useState<boolean>(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  // Redirect logic
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

  // Session verification
  useEffect(() => {
    const verifySession = async () => {
      const cached = localStorage.getItem("admin_logged_in");
      if (cached !== "true") {
        setIsAuthVerified(true);
        return;
      }
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          localStorage.removeItem("admin_logged_in");
          setIsLoggedIn(false);
        }
      } catch {
        // Network error — trust localStorage
      } finally {
        setIsAuthVerified(true);
      }
    };
    verifySession();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername || !loginPassword) {
      toast.error("Vui lòng điền đầy đủ thông tin đăng nhập!");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginUsername.trim(),
        password: loginPassword,
      });

      if (error || !data.user) {
        toast.error("Email hoặc mật khẩu không chính xác!");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profileError || !profile || profile.role !== "admin") {
        await supabase.auth.signOut();
        toast.error("Tài khoản này không có quyền quản trị!");
        return;
      }

      localStorage.setItem("admin_logged_in", "true");
      setIsLoggedIn(true);
      setIsAuthVerified(true);
      toast.success("Đăng nhập quản trị thành công!");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Lỗi kết nối, vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

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
