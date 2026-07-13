import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import {
  REDIRECT_CACHE_MAX_SIZE,
  REDIRECT_CACHE_TTL_MS,
  REDIRECT_VERSION_CHECK_MS,
  getRedirectCacheVersion,
} from "@/lib/redirect-cache";

interface RedirectEntry {
  to_path: string;
  status_code: number;
}

/**
 * Per-process SEO redirect cache (path → entry | null).
 *
 * ## Multi-instance behavior
 * This Map lives in the current Node/Edge isolate only. On serverless platforms
 * (Vercel, etc.) each instance has its own copy — entries are never shared.
 *
 * After admin create/update/delete:
 * - With Upstash Redis: mutations bump `redirects:cache:version`; each instance
 *   polls every `REDIRECT_VERSION_CHECK_MS` and clears the Map on change
 *   (typical lag ≤ ~10s).
 * - Without Redis: stale rules can be served for up to `REDIRECT_CACHE_TTL_MS`
 *   (60s). Acceptable for SEO redirects; admins may wait one TTL after edits.
 *
 * Do not rely on this cache for security-critical routing.
 */
const redirectCache = new Map<string, { data: RedirectEntry | null; cachedAt: number }>();

/** Last shared generation observed by this isolate (Redis). */
let knownCacheVersion = 0;
let lastVersionCheckAt = 0;

/**
 * Evict the oldest expired entries when cache exceeds the max size.
 * Removes at least 20% of entries to avoid frequent evictions.
 */
function evictStaleCacheEntries(): void {
  if (redirectCache.size < REDIRECT_CACHE_MAX_SIZE) return;

  const now = Date.now();
  const entries = [...redirectCache.entries()];

  // Sort by cachedAt (oldest first)
  entries.sort(([, a], [, b]) => a.cachedAt - b.cachedAt);

  const targetSize = Math.max(Math.floor(REDIRECT_CACHE_MAX_SIZE * 0.8), 1);
  const toDelete = entries.slice(0, entries.length - targetSize);

  for (const [key] of toDelete) {
    // Also remove truly expired entries while we're at it
    if (now - redirectCache.get(key)!.cachedAt >= REDIRECT_CACHE_TTL_MS) {
      redirectCache.delete(key);
    }
  }

  // If still over the limit after removing expired, remove oldest entries
  if (redirectCache.size >= REDIRECT_CACHE_MAX_SIZE) {
    for (const [key] of toDelete) {
      redirectCache.delete(key);
      if (redirectCache.size < targetSize) break;
    }
  }
}

/**
 * If Redis reports a newer generation, drop the entire local Map so updated
 * redirect rules are re-fetched from Supabase. Fail-open: Redis errors leave
 * the cache in place and TTL still bounds staleness.
 */
async function maybeInvalidateFromSharedVersion(): Promise<void> {
  const now = Date.now();
  if (now - lastVersionCheckAt < REDIRECT_VERSION_CHECK_MS) return;
  lastVersionCheckAt = now;

  const remoteVersion = await getRedirectCacheVersion();
  if (remoteVersion === null) return;

  if (remoteVersion !== knownCacheVersion) {
    redirectCache.clear();
    knownCacheVersion = remoteVersion;
  }
}

async function lookupRedirect(path: string): Promise<RedirectEntry | null> {
  await maybeInvalidateFromSharedVersion();

  const now = Date.now();
  const cached = redirectCache.get(path);

  if (cached && now - cached.cachedAt < REDIRECT_CACHE_TTL_MS) {
    return cached.data;
  }

  // Expired entry — delete it now
  if (cached) {
    redirectCache.delete(path);
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) return null;

    const response = await fetch(
      `${supabaseUrl}/rest/v1/redirects?from_path=eq.${encodeURIComponent(path)}&select=to_path,status_code`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      },
    );

    if (!response.ok) return null;

    const data: RedirectEntry[] = await response.json();
    const entry = data[0] ?? null;

    // Cache the result (including null for valid pages without redirect)
    redirectCache.set(path, { data: entry, cachedAt: now });

    // Prevent unbounded growth
    evictStaleCacheEntries();

    return entry;
  } catch {
    return null;
  }
}

function isAdminLoginPath(pathname: string): boolean {
  return pathname === "/admin" || pathname === "/admin/";
}

function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

/**
 * Soft gate for /admin pages:
 * - Unauthenticated users may only open the login page (/admin).
 * - Authenticated *admin* users hitting /admin are sent to the dashboard.
 * - Protected /admin/* routes require a valid Supabase session *and* profiles.role === "admin".
 * - Non-admin authenticated users are not admitted into /admin/* (login excepted) to avoid redirect loops.
 *
 * This does not replace API requireAdmin; client bundles may still be public static assets.
 */
async function handleAdminGate(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;
  if (!isAdminPath(pathname)) return null;

  const { user, response, supabase } = await updateSession(request);
  const isLogin = isAdminLoginPath(pathname);

  if (!user && !isLogin) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin";
    loginUrl.search = "";
    const redirect = NextResponse.redirect(loginUrl);
    redirect.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
    // Preserve any refreshed/cleared auth cookies from updateSession.
    response.cookies.getAll().forEach((cookie) => {
      redirect.cookies.set(cookie.name, cookie.value);
    });
    return redirect;
  }

  // Role check for any authenticated session on admin routes
  let isAdmin = false;
  if (user && supabase) {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      isAdmin = profile?.role === "admin";
    } catch {
      isAdmin = false;
    }
  }

  // Non-admin with session: only allow login page (client will show "no permission")
  if (user && !isAdmin && !isLogin) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin";
    loginUrl.search = "";
    const redirect = NextResponse.redirect(loginUrl);
    redirect.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
    response.cookies.getAll().forEach((cookie) => {
      redirect.cookies.set(cookie.name, cookie.value);
    });
    return redirect;
  }

  // Only real admins get the login → dashboard bounce
  if (user && isAdmin && isLogin) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/admin/dashboard";
    dashboardUrl.search = "";
    const redirect = NextResponse.redirect(dashboardUrl);
    redirect.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
    response.cookies.getAll().forEach((cookie) => {
      redirect.cookies.set(cookie.name, cookie.value);
    });
    return redirect;
  }

  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin soft gate (session cookie check)
  if (isAdminPath(pathname)) {
    const adminResponse = await handleAdminGate(request);
    if (adminResponse) return adminResponse;
  }

  const skip =
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/.well-known/") ||
    pathname === "/favicon.ico" ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt";

  if (skip) return NextResponse.next();

  const redirect = await lookupRedirect(pathname);
  if (redirect) {
    const destination = new URL(redirect.to_path, request.url);
    return NextResponse.redirect(destination, { status: redirect.status_code });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico|css|js|woff2?|wav|mp3|mp4|json|txt)).*)",
  ],
};
