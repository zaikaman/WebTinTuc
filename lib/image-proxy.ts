/**
 * Normalize image URLs for public rendering.
 *
 * Images are expected to live on R2 (or hosts already in `next.config.ts`
 * `images.remotePatterns`, e.g. Unsplash). The open public `/api/image-proxy`
 * endpoint was removed (SSRF / bandwidth abuse risk).
 *
 * - Relative paths (`/...`) and data URIs are returned as-is.
 * - Legacy wrappers `/api/image-proxy?url=...` are unwrapped to the original URL.
 * - All other absolute URLs are returned as-is (no server-side fetch proxy).
 *
 * Admin flows that still need to fetch an external image (import link → R2,
 * crop) use the authenticated `/api/admin/proxy-image` endpoint instead.
 */
export function proxyImageUrl(url: string | null | undefined): string {
  if (!url) return ""

  // Data URIs need no transformation
  if (url.startsWith("data:")) return url

  // Relative path — may still be a legacy proxy wrapper
  if (url.startsWith("/") && !url.startsWith("//")) {
    if (url.startsWith("/api/image-proxy?")) {
      try {
        const original = new URL(url, "http://localhost").searchParams.get("url")
        if (original) return proxyImageUrl(original)
      } catch {
        // Invalid wrapper — fall through
      }
    }
    return url
  }

  // Absolute URL (http/https/protocol-relative) — serve directly
  return url
}
