"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

let cachedIsLoggedIn: boolean | null = null;
let cachedIsAuthVerified = false;

export function useAdminAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (cachedIsLoggedIn !== null) return cachedIsLoggedIn;
    if (typeof window === "undefined") return false;
    return localStorage.getItem("admin_logged_in") === "true";
  });
  const [isAuthVerified, setIsAuthVerified] = useState<boolean>(() => cachedIsAuthVerified);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isExplicitLogoutRef = useRef(false);

  // Session verification on mount
  useEffect(() => {
    const verifySession = async () => {
      const cached = localStorage.getItem("admin_logged_in");
      if (cached !== "true") {
        cachedIsAuthVerified = true;
        setIsAuthVerified(true);
        return;
      }
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          localStorage.removeItem("admin_logged_in");
          cachedIsLoggedIn = false;
          setIsLoggedIn(false);
        } else {
          cachedIsLoggedIn = true;
        }
      } catch {
        // Network error – trust localStorage for better UX
      } finally {
        cachedIsAuthVerified = true;
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

      const {
        data: profile,
        error: profileError,
      } = await supabase
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
      cachedIsLoggedIn = true;
      cachedIsAuthVerified = true;
      setIsLoggedIn(true);
      setIsAuthVerified(true);
      toast.success("Đăng nhập quản trị thành công!");
    } catch (err) {
      console.error(err);
      toast.error("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      isExplicitLogoutRef.current = true;
      await supabase.auth.signOut();
    } catch {
      // ignore
    } finally {
      localStorage.removeItem("admin_logged_in");
      cachedIsLoggedIn = false;
      cachedIsAuthVerified = true;
      setIsLoggedIn(false);
      setIsAuthVerified(true);
      toast.success("Đã đăng xuất khỏi hệ thống!");
    }
  };

  return {
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
    handleLogout,
  };
}
