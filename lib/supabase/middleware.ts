import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refresh Supabase auth cookies and return the validated user (if any).
 * Used by Next.js middleware for soft gates on /admin pages.
 * API routes still enforce requireAdmin — this is not a substitute for API auth.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return { user: null, response: supabaseResponse, supabase: null };
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  // Important: getUser() revalidates the JWT with Supabase Auth (do not use getSession here).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { user, response: supabaseResponse, supabase };
}
