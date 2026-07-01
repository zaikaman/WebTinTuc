import { NextRequest, NextResponse } from "next/server";

interface RedirectEntry {
  to_path: string;
  status_code: number;
}

const redirectCache = new Map<string, { data: RedirectEntry | null; cachedAt: number }>();
const CACHE_TTL_MS = 300_000; // 5 minutes cache

async function lookupRedirect(path: string): Promise<RedirectEntry | null> {
  const now = Date.now();
  const cached = redirectCache.get(path);

  if (cached && now - cached.cachedAt < CACHE_TTL_MS) {
    return cached.data;
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

    return entry;
  } catch {
    return null;
  }
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
