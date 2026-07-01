import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getSiteSettings } from "@/lib/api/news";
import { OfflineDetector } from "@/components/OfflineDetector";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { settings, categories } = await getSiteSettings();

  return (
    <div className="w-full max-w-[970px] mx-auto min-h-screen flex flex-col">
      <Header brand={settings.brand} categories={categories} />
      <div className="flex-1">
        <OfflineDetector>{children}</OfflineDetector>
      </div>
      <Footer settings={settings} />
    </div>
  );
}

