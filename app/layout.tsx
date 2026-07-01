import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["vietnamese", "latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
  fallback: ["Tahoma", "Geneva", "system-ui", "sans-serif"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";
const siteName = "WebTinTuc";
const defaultDescription = "Trang tin tức tổng hợp - Cập nhật tin tức nhanh chóng, chính xác, đa dạng các lĩnh vực: công nghệ, game, anime, phim ảnh, kiến thức và nhiều hơn nữa.";
const ogImage = `${siteUrl}/screen-3.webp`;

export const metadata: Metadata = {
  title: {
    default: `${siteName} - Tin tức, Game, Anime, Công nghệ mới nhất`,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName,
    title: `${siteName} - Tin tức, Game, Anime, Công nghệ mới nhất`,
    description: defaultDescription,
    url: "/",
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: siteName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} - Tin tức, Game, Anime, Công nghệ mới nhất`,
    description: defaultDescription,
    images: [ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#e24a48",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteName,
  url: siteUrl,
  description: defaultDescription,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteUrl}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

import { HoverPreloader } from "@/components/HoverPreloader";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://supabase.co" />
        <link rel="preconnect" href="https://*.r2.dev" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://*.r2.dev" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-[#f4f6f8] text-[#333] font-sans antialiased">
        <HoverPreloader />
        {children}
      </body>
    </html>
  );
}

