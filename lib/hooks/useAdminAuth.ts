"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

/** Soft UI flag only — never used as a security decision. */
const ADMIN_UI_FLAG = "admin_logged_in";

function clearAdminUiFlag() {
  try {
    localStorage.removeItem(ADMIN_UI_FLAG);
  } catch {
    // ignore storage errors (private mode, etc.)
  }
}

function setAdminUiFlag() {
  try {
    localStorage.setItem(ADMIN_UI_FLAG, "true");
  } catch {
    // ignore
  }
}

/**
 * Client-side admin soft lock.
 * Real authorization is enforced by API `requireAdmin` + middleware session gate.
 * This hook must fail closed: never show admin UI without a verified admin session.
 */
export function useAdminAuth() {
  // Always start logged-out; wait for server-validated session before showing admin UI.
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const markLoggedOut = useCallback(() => {
    clearAdminUiFlag();
    setIsLoggedIn(false);
  }, []);

  const markLoggedIn = useCallback(() => {
    setAdminUiFlag();
    setIsLoggedIn(true);
  }, []);

  const verifyAdminSession = useCallback(async (): Promise<boolean> => {
    // getUser() validates with the Auth server (not a trusted local cache like getSession).
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      markLoggedOut();
      return false;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "admin") {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
      markLoggedOut();
      return false;
    }

    markLoggedIn();
    return true;
  }, [markLoggedIn, markLoggedOut]);

  // Session verification on mount — fail closed on any error / network failure.
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        await verifyAdminSession();
      } catch {
        // Network / unexpected error: do not trust localStorage or show admin UI.
        markLoggedOut();
      } finally {
        if (!cancelled) setIsAuthVerified(true);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [verifyAdminSession, markLoggedOut]);

  // Keep UI in sync across tabs / explicit sign-out elsewhere.
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        markLoggedOut();
        setIsAuthVerified(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [markLoggedOut]);

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
        markLoggedOut();
        toast.error("Tài khoản này không có quyền quản trị!");
        return;
      }

      markLoggedIn();
      setIsAuthVerified(true);
      toast.success("Đăng nhập quản trị thành công!");
    } catch (err) {
      console.error(err);
      markLoggedOut();
      toast.error("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore network errors — still clear local UI state
    } finally {
      markLoggedOut();
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
