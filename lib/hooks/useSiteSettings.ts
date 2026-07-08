"use client";

import { useState, useEffect } from "react";
import { getAdminSettings } from "@/lib/api/adminClient";

// Module-level cache so the API is called only once across all pages
let cachedSiteSettings: any = null;

export function useSiteSettings() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoWebsiteName, setLogoWebsiteName] = useState("Admin");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (cachedSiteSettings) {
      const res = cachedSiteSettings;
      setLogoWebsiteName(res.brand?.name || "Admin");
      setLogoUrl(res.brand?.logo_url || null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getAdminSettings()
      .then((res) => {
        if (cancelled) return;
        if (res) {
          cachedSiteSettings = res;
          setLogoWebsiteName(res.brand?.name || "Admin");
          setLogoUrl(res.brand?.logo_url || null);
        }
      })
      .catch(() => {
        // ignore
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { logoUrl, logoWebsiteName, loading };
}
