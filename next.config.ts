import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const analyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const isDev = process.env.NODE_ENV !== "production";

/** Safe origin extraction for CSP allowlists. */
function originFromEnv(value: string | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

/**
 * Production-oriented CSP.
 * Next.js still needs 'unsafe-inline' for hydration / JSON-LD without a nonce pipeline.
 * Dev adds 'unsafe-eval' + ws for HMR.
 */
function buildContentSecurityPolicy(): string {
  const supabaseOrigin =
    originFromEnv(process.env.NEXT_PUBLIC_SUPABASE_URL) ?? "https://*.supabase.co";
  const r2Origin =
    originFromEnv(process.env.NEXT_PUBLIC_R2_PUBLIC_URL) ??
    originFromEnv(process.env.R2_PUBLIC_URL) ??
    "https://*.r2.dev";

  const supabaseWs = supabaseOrigin.startsWith("https://")
    ? supabaseOrigin.replace("https://", "wss://")
    : null;

  const scriptSrc = isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'";

  const connectSrc = [
    "'self'",
    supabaseOrigin,
    ...(supabaseWs ? [supabaseWs] : []),
    // Fallback wildcards cover multi-project / preview envs
    "https://*.supabase.co",
    "wss://*.supabase.co",
    r2Origin,
    "https://*.r2.dev",
    "https://*.r2.cloudflarestorage.com",
    ...(isDev ? ["ws:", "wss:"] : []),
  ].join(" ");

  const directives = [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src ${connectSrc}`,
    "media-src 'self' blob: https:",
    // Article embeds (YouTube / Vimeo); tighten further if custom iframes are dropped
    "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    // Avoid forcing HTTPS upgrade on plain http://localhost during dev
    ...(!isDev ? ["upgrade-insecure-requests"] : []),
  ];

  return directives.join("; ");
}

/** Applied to every response (public, admin, API) — not only marketing pages. */
const securityHeaders: { key: string; value: string }[] = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Legacy clickjacking defense; CSP frame-ancestors is the modern equivalent
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "payment=()",
      "usb=()",
      "interest-cohort=()",
      "browsing-topics=()",
    ].join(", "),
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Content-Security-Policy", value: buildContentSecurityPolicy() },
];

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  typescript: {
    // Fail production builds on type errors — do not ship type-broken code
    ignoreBuildErrors: false,
  },
  experimental: {
    staleTimes: {
      dynamic: 120,
      static: 300,
    },
    optimizePackageImports: [
      "@radix-ui/react-dialog",
      "lucide-react",
      "framer-motion",
      "@tanstack/react-query",
    ],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "*.r2.dev", pathname: "/**" },
      { protocol: "https", hostname: "*.r2.cloudflarestorage.com", pathname: "/**" },
    ],
  },
  async headers() {
    return [
      {
        // Long-lived cache for static public assets
        source: "/:all+(png|jpg|jpeg|gif|webp|avif|svg|ico|css|js|woff2?)",
        locale: false,
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Site-wide security headers (includes /admin, /api, /_next)
        // HSTS is also applied here so admin/API are not excluded.
        // On Vercel, TLS terminates at the edge for all hosts; this header
        // enforces HTTPS on subsequent visits for every path.
        source: "/(.*)",
        locale: false,
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/categories/:slug",
        destination: "/:slug",
        permanent: false,
      },
    ];
  },
};

export default analyzer(nextConfig);
