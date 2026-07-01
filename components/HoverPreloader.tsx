"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function HoverPreloader() {
  const router = useRouter();

  useEffect(() => {
    // Only prefetch on client side
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;

    let prefetchTimeout: NodeJS.Timeout | null = null;
    const prefetchedUrls = new Set<string>();

    const handleHoverOrTouch = (e: MouseEvent | TouchEvent) => {
      // Find closest anchor tag
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Filter: only prefetch relative paths to pages (exclude admin, api, static files, external sites, and anchor tags)
      const shouldPrefetch =
        href.startsWith("/") &&
        !href.startsWith("/admin") &&
        !href.startsWith("/api") &&
        !href.startsWith("/_next") &&
        !href.includes(".") &&
        href !== "#";

      if (!shouldPrefetch || prefetchedUrls.has(href)) return;

      // Preload optimized Next.js images inside the link immediately to prevent loading flicker on navigation
      const img = anchor.querySelector("img");
      if (img) {
        const srcAttr = img.getAttribute("src") || img.src;
        if (srcAttr) {
          try {
            if (srcAttr.includes("/_next/image") || srcAttr.includes("url=")) {
              const urlObj = new URL(srcAttr, window.location.origin);
              const originalUrl = urlObj.searchParams.get("url");
              if (originalUrl) {
                const isMobile = window.innerWidth <= 768;
                const detailWidth = isMobile ? 640 : 1080;
                const detailSrc = `/_next/image?url=${encodeURIComponent(originalUrl)}&w=${detailWidth}&q=75`;
                if (!prefetchedUrls.has(detailSrc)) {
                  const preloadDetailImg = new Image();
                  preloadDetailImg.src = detailSrc;
                  prefetchedUrls.add(detailSrc);
                }
              }
            } else if (!prefetchedUrls.has(srcAttr)) {
              const preloadImg = new Image();
              preloadImg.src = srcAttr;
              prefetchedUrls.add(srcAttr);
            }
          } catch (err) {
            if (!prefetchedUrls.has(srcAttr)) {
              const preloadImg = new Image();
              preloadImg.src = srcAttr;
              prefetchedUrls.add(srcAttr);
            }
          }
        }
      }

      // Prefetch after a small delay (50ms) of hover to prevent prefetching on accidental rapid cursor sweeps
      if (e.type === "mouseover") {
        if (prefetchTimeout) clearTimeout(prefetchTimeout);
        prefetchTimeout = setTimeout(() => {
          router.prefetch(href);
          prefetchedUrls.add(href);
        }, 50);
      } else {
        // Touch start triggers prefetch immediately
        router.prefetch(href);
        prefetchedUrls.add(href);
      }
    };

    const handleMouseLeave = () => {
      if (prefetchTimeout) {
        clearTimeout(prefetchTimeout);
        prefetchTimeout = null;
      }
    };

    // Attach mouseover, touchstart, and mouseout events
    document.addEventListener("mouseover", handleHoverOrTouch, { passive: true });
    document.addEventListener("touchstart", handleHoverOrTouch, { passive: true });
    document.addEventListener("mouseout", handleMouseLeave, { passive: true });

    return () => {
      document.removeEventListener("mouseover", handleHoverOrTouch);
      document.removeEventListener("touchstart", handleHoverOrTouch);
      document.removeEventListener("mouseout", handleMouseLeave);
      if (prefetchTimeout) clearTimeout(prefetchTimeout);
    };
  }, [router]);

  return null;
}
