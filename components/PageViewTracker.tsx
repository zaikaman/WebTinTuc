"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Records site-wide page views once per pathname per browser session.
 * Writes Redis key page:views:YYYY-MM-DD (flushed by /api/cron/flush).
 */
export default function PageViewTracker() {
  const pathname = usePathname();
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    // Skip admin / API noise if this component is ever reused outside (site)
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) return;
    if (lastSent.current === pathname) return;

    const storageKey = `pv:${pathname}`;
    try {
      if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(storageKey)) {
        lastSent.current = pathname;
        return;
      }
      sessionStorage?.setItem(storageKey, "1");
    } catch {
      // sessionStorage may be unavailable (private mode / blocked)
    }

    lastSent.current = pathname;

    fetch("/api/analytics/page-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname }),
      keepalive: true,
    }).catch((err) => {
      console.error("Failed to record page view:", err);
    });
  }, [pathname]);

  return null;
}
