"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

/** Soft UI flag only — never used as a security decision. */
const ADMIN_UI_FLAG = "admin_logged_in";

/** Module-level session cache so remounts / soft navigations skip cold auth when possible. */
let sessionCache: { isAdmin: boolean; checkedAt: number } | null = null;
const SESSION_CACHE_TTL_MS = 5 * 60_000;

function clearAdminUiFlag() {
  try {
    localStorage.removeItem(ADMIN_UI_FLAG);
  } catch {
    // ignore
  }
}

function setAdminUiFlag() {
  try {
    localStorage.setItem(ADMIN_UI_FLAG, "true");
  } catch {
    // ignore
  }
}

export type AdminAuthValue = {
  isLoggedIn: boolean;
  isAuthVerified: boolean;
  loginUsername: string;
  loginPassword: string;
  showPassword: boolean;
  isLoading: boolean;
  setLoginUsername: (v: string) => void;
  setLoginPassword: (v: string) => void;
  setShowPassword: (v: boolean) => void;
  handleLogin: (e: React.FormEvent) => Promise<void>;
  handleLogout: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

async function verifyAdminSessionNetwork(): Promise<boolean> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return false;

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
    return false;
  }

  return true;
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => sessionCache?.isAdmin === true);
  const [isAuthVerified, setIsAuthVerified] = useState(() => {
    if (!sessionCache) return false;
    return Date.now() - sessionCache.checkedAt < SESSION_CACHE_TTL_MS;
  });
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const verifyingRef = useRef(false);

  const markLoggedOut = useCallback(() => {
    clearAdminUiFlag();
    sessionCache = { isAdmin: false, checkedAt: Date.now() };
    setIsLoggedIn(false);
  }, []);

  const markLoggedIn = useCallback(() => {
    setAdminUiFlag();
    sessionCache = { isAdmin: true, checkedAt: Date.now() };
    setIsLoggedIn(true);
  }, []);

  const verifyAdminSession = useCallback(async (): Promise<boolean> => {
    const ok = await verifyAdminSessionNetwork();
    if (ok) {
      markLoggedIn();
      return true;
    }
    markLoggedOut();
    return false;
  }, [markLoggedIn, markLoggedOut]);

  // Session verification on mount — use warm cache for instant paint, revalidate in background.
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (verifyingRef.current) return;
      verifyingRef.current = true;

      const cacheFresh =
        sessionCache && Date.now() - sessionCache.checkedAt < SESSION_CACHE_TTL_MS;

      if (cacheFresh) {
        if (!cancelled) {
          setIsLoggedIn(sessionCache!.isAdmin);
          setIsAuthVerified(true);
        }
        // Background revalidate without blocking UI
        try {
          const ok = await verifyAdminSessionNetwork();
          if (!cancelled) {
            if (ok) markLoggedIn();
            else markLoggedOut();
            setIsAuthVerified(true);
          }
        } catch {
          // Keep cached optimistic state on network blip
        } finally {
          verifyingRef.current = false;
        }
        return;
      }

      try {
        await verifyAdminSession();
      } catch {
        markLoggedOut();
      } finally {
        if (!cancelled) setIsAuthVerified(true);
        verifyingRef.current = false;
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [verifyAdminSession, markLoggedIn, markLoggedOut]);

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

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
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
    },
    [loginUsername, loginPassword, markLoggedIn, markLoggedOut]
  );

  const handleLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    } finally {
      markLoggedOut();
      setIsAuthVerified(true);
      toast.success("Đã đăng xuất khỏi hệ thống!");
    }
  }, [markLoggedOut]);

  const value = useMemo<AdminAuthValue>(
    () => ({
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
    }),
    [
      isLoggedIn,
      isAuthVerified,
      loginUsername,
      loginPassword,
      showPassword,
      isLoading,
      handleLogin,
      handleLogout,
    ]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

/**
 * Client-side admin soft lock (must be under AdminAuthProvider).
 * Real authorization is enforced by API requireAdmin + middleware session gate.
 */
export function useAdminAuth(): AdminAuthValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return ctx;
}
