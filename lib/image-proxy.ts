/**
 * Known image hostnames that are allowed to be served directly (no proxy needed).
 * These domains are already configured in next.config.ts `images.remotePatterns`.
 */
const ALLOWED_HOSTNAMES = [
  'r2.dev',
  'r2.cloudflarestorage.com',
  'images.unsplash.com',
]

/**
 * Transform an external image URL to go through our local image proxy,
 * so Next.js `<Image>` can optimize it without needing a `remotePatterns` entry.
 *
 * - Relative paths (`/...`) are returned as-is.
 * - Data URIs (`data:...`) are returned as-is.
 * - URLs from known hostnames (R2, Unsplash) are returned as-is.
 * - All other external URLs are rewritten to `/api/image-proxy?url=...`.
 *
 * @param url - The image URL to potentially proxy.
 * @returns The original URL (if local or allowed) or a proxied URL.
 */
export function proxyImageUrl(url: string | null | undefined): string {
  if (!url) return ''

  // Local relative paths need no proxy
  if (url.startsWith('/')) return url

  // Data URIs need no proxy
  if (url.startsWith('data:')) return url

  // Already a proxy URL? Don't re-wrap
  if (url.startsWith('/api/image-proxy?')) return url

  try {
    const parsed = new URL(url)

    // Check if the hostname is from an already-allowed domain
    const isAllowed = ALLOWED_HOSTNAMES.some(
      (allowed) => parsed.hostname === allowed || parsed.hostname.endsWith(`.${allowed}`)
    )

    if (isAllowed) return url

    // For truly external images, proxy through our server
    return `/api/image-proxy?url=${encodeURIComponent(url)}`
  } catch {
    // Invalid URL – return as-is and let the browser handle it
    return url
  }
}
