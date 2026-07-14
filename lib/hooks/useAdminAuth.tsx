"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

/** Soft UI flag only — never used as a security decision. */
const ADMIN_UI_FLAG = "admin_logged_in";

/** Module-level session cache so remounts / soft navigations skip cold auth when possible. */
let sessionCache: { isAdmin: boolean; checkedAt: number } | null = null;
const SESSION_CACHE_TTL_MS = 5 * 60_000;

// ─── useSyncExternalStore helpers ─────────────────────────────────────────────
// Allows reading localStorage without causing a Server/Client hydration mismatch.
// React uses getServerSnapshot during SSR + the hydration pass (always returns false),
// then switches to getSnapshot on the client after hydration completes.
function subscribeToAdminFlag(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}
function getAdminFlagSnapshot() {
  if (sessionCache) return sessionCache.isAdmin;
  try {
    return localStorage.getItem(ADMIN_UI_FLAG) === "true";
  } catch {
    return false;
  }
}
function getAdminFlagServerSnapshot() {
  // Server & initial hydration: always false to match SSR output
  return false;
}
function getAuthVerifiedSnapshot() {
  if (sessionCache) {
    return Date.now() - sessionCache.checkedAt < SESSION_CACHE_TTL_MS;
  }
  try {
    return localStorage.getItem(ADMIN_UI_FLAG) === "true";
  } catch {
    return false;
  }
}
// ──────────────────────────────────────────────────────────────────────────────

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
  id: string;
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
  user: { id: string; email?: string | null },
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
    id: user.id,
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
  // Read isLoggedIn from localStorage via useSyncExternalStore.
  // getAdminFlagServerSnapshot always returns false → Server HTML = Client initial HTML.
  // After hydration, React switches to getAdminFlagSnapshot → reads localStorage instantly.
  // This eliminates the Hydration mismatch while still being fast (no useEffect flash).
  const isLoggedInFromStore = useSyncExternalStore(
    subscribeToAdminFlag,
    getAdminFlagSnapshot,
    getAdminFlagServerSnapshot,
  );
  const isAuthVerifiedFromStore = useSyncExternalStore(
    subscribeToAdminFlag,
    getAuthVerifiedSnapshot,
    getAdminFlagServerSnapshot,
  );

  // Override state: markLoggedIn/markLoggedOut write to localStorage + sessionCache,
  // which triggers useSyncExternalStore to re-read. But for direct programmatic
  // state transitions (e.g. after login API call), we keep manual overrides.
  const [isLoggedInOverride, setIsLoggedInOverride] = useState<boolean | null>(null);
  const [isAuthVerifiedOverride, setIsAuthVerifiedOverride] = useState<boolean | null>(null);

  const isLoggedIn = isLoggedInOverride ?? isLoggedInFromStore;
  const isAuthVerified = isAuthVerifiedOverride ?? isAuthVerifiedFromStore;

  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const verifyingRef = useRef(false);

  const markLoggedOut = useCallback(() => {
    clearAdminUiFlag();
    sessionCache = { isAdmin: false, checkedAt: Date.now() };
    setIsLoggedInOverride(false);
    setIsAuthVerifiedOverride(null); // Let store re-read localStorage
    setAdminProfile(null);
  }, []);

  const markLoggedIn = useCallback((profile?: AdminProfile | null) => {
    setAdminUiFlag();
    sessionCache = { isAdmin: true, checkedAt: Date.now() };
    setIsLoggedInOverride(true);
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
          setIsLoggedInOverride(sessionCache!.isAdmin);
          setIsAuthVerifiedOverride(true);
        }
        // Background revalidate without blocking UI
        try {
          const result = await verifyAdminSessionNetwork();
          if (!cancelled) {
            if (result.ok) markLoggedIn(result.profile);
            else markLoggedOut();
            setIsAuthVerifiedOverride(true);
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
        if (!cancelled) setIsAuthVerifiedOverride(true);
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
        setIsAuthVerifiedOverride(true);
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
        setIsAuthVerifiedOverride(true);
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
      setIsAuthVerifiedOverride(true);
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
