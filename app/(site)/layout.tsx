import { Suspense } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { getSiteSettings } from "@/lib/api/news";
import { OfflineDetector } from "@/components/OfflineDetector";
import PageViewTracker from "@/components/PageViewTracker";

export const revalidate = 60;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": `${siteUrl}/#breadcrumb`,
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Trang chủ",
      item: siteUrl,
    },
  ],
};

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { settings, categories } = await getSiteSettings();

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <PageViewTracker />
      <div className="w-full max-w-[970px] mx-auto min-h-screen flex flex-col">
        <Suspense fallback={<div className="h-[94px] bg-[#e24a48] w-full" />}>
          <Header brand={settings.brand} categories={categories} />
        </Suspense>
        <div className="flex-1">
          <OfflineDetector>{children}</OfflineDetector>
        </div>
        <Footer settings={settings} />
      </div>
    </>
  );
}
