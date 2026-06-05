import type { Metadata } from "next";
import "@/styles/globals.css";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getSiteSettings } from "@/lib/api/news";

export const metadata: Metadata = {
  title: "Hello world project",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const siteSettings = await getSiteSettings();

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f4f6f8] text-[#333]">
        <div className="w-full max-w-[970px] mx-auto min-h-screen flex flex-col">
          <Header settings={siteSettings.header} />
          <div className="flex-1">{children}</div>
          <Footer settings={siteSettings} />
        </div>
      </body>
    </html>
  );
}
