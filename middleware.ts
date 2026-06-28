import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const redirectCache = new Map<string, { to_path: string; status_code: number; cachedAt: number }>();
const CACHE_TTL_MS = 60_000;

async function lookupRedirect(path: string) {
  const now = Date.now();
  const cached = redirectCache.get(path);

  if (cached && now - cached.cachedAt < CACHE_TTL_MS) {
    return cached;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("redirects")
    .select("to_path, status_code")
    .eq("from_path", path)
    .maybeSingle();

  if (data) {
    redirectCache.set(path, { ...data, cachedAt: now });
    return data;
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const skip =
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/.well-known/") ||
    pathname === "/favicon.ico" ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt";

  if (skip) return NextResponse.next();

  try {
    const redirect = await lookupRedirect(pathname);
    if (redirect) {
      const destination = new URL(redirect.to_path, request.url);
      return NextResponse.redirect(destination, { status: redirect.status_code });
    }
  } catch {
    // Keep the site available if redirect lookup fails.
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
