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

export type AdminProfile = {
  email: string;
  displayName: string;
  username: string;
  role: string;
  initials: string;
};

export type AdminAuthValue = {
  isLoggedIn: boolean;
  isAuthVerified: boolean;
  loginUsername: string;
  loginPassword: string;
  showPassword: boolean;
  isLoading: boolean;
  adminProfile: AdminProfile | null;
  setLoginUsername: (v: string) => void;
  setLoginPassword: (v: string) => void;
  setShowPassword: (v: boolean) => void;
  handleLogin: (e: React.FormEvent) => Promise<void>;
  handleLogout: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

function buildAdminProfile(
  user: { email?: string | null },
  profile: { role?: string; display_name?: string | null; username?: string | null }
): AdminProfile {
  const displayName =
    profile.display_name?.trim() ||
    profile.username?.trim() ||
    user.email?.split("@")[0] ||
    "Admin";
  const username = profile.username?.trim() || user.email || "admin";
  const initials = displayName
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "AD";
  return {
    email: user.email || "",
    displayName,
    username,
    role: profile.role || "admin",
    initials,
  };
}

async function verifyAdminSessionNetwork(): Promise<{
  ok: boolean;
  profile: AdminProfile | null;
}> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return { ok: false, profile: null };

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, display_name, username")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "admin") {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    return { ok: false, profile: null };
  }

  return { ok: true, profile: buildAdminProfile(user, profile) };
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
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const verifyingRef = useRef(false);

  const markLoggedOut = useCallback(() => {
    clearAdminUiFlag();
    sessionCache = { isAdmin: false, checkedAt: Date.now() };
    setIsLoggedIn(false);
    setAdminProfile(null);
  }, []);

  const markLoggedIn = useCallback((profile?: AdminProfile | null) => {
    setAdminUiFlag();
    sessionCache = { isAdmin: true, checkedAt: Date.now() };
    setIsLoggedIn(true);
    if (profile) setAdminProfile(profile);
  }, []);

  const verifyAdminSession = useCallback(async (): Promise<boolean> => {
    const result = await verifyAdminSessionNetwork();
    if (result.ok) {
      markLoggedIn(result.profile);
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
          const result = await verifyAdminSessionNetwork();
          if (!cancelled) {
            if (result.ok) markLoggedIn(result.profile);
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
        // Server-side login enforces IP rate limit + failure lockout before Supabase auth.
        const res = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: loginUsername.trim(),
            password: loginPassword,
          }),
          cache: "no-store",
        });

        let payload: {
          success?: boolean;
          message?: string;
          data?: {
            profile: AdminProfile;
            session: { access_token: string; refresh_token: string };
          };
        } | null = null;
        try {
          payload = await res.json();
        } catch {
          payload = null;
        }

        if (!res.ok || !payload?.success || !payload.data?.session || !payload.data?.profile) {
          markLoggedOut();
          toast.error(payload?.message || "Email hoặc mật khẩu không chính xác!");
          return;
        }

        const { error: sessionError } = await supabase.auth.setSession({
          access_token: payload.data.session.access_token,
          refresh_token: payload.data.session.refresh_token,
        });

        if (sessionError) {
          markLoggedOut();
          toast.error("Không thể thiết lập phiên đăng nhập. Vui lòng thử lại!");
          return;
        }

        markLoggedIn(payload.data.profile);
        setIsAuthVerified(true);
        setLoginPassword("");
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
      adminProfile,
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
      adminProfile,
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
