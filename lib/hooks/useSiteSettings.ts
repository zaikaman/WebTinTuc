"use client";

import { useState, useEffect } from "react";
import { getAdminSettings } from "@/lib/api/adminClient";

// Module-level cache so the API is called only once across all pages / remounts
let cachedSiteSettings: any = null;
let inflight: Promise<any> | null = null;

function loadSettingsOnce() {
  if (cachedSiteSettings) return Promise.resolve(cachedSiteSettings);
  if (inflight) return inflight;
  inflight = getAdminSettings()
    .then((res) => {
      if (res) cachedSiteSettings = res;
      return res;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export function useSiteSettings() {
  const [logoUrl, setLogoUrl] = useState<string | null>(
    () => cachedSiteSettings?.brand?.logo_url || null
  );
  const [logoWebsiteName, setLogoWebsiteName] = useState(
    () => cachedSiteSettings?.brand?.name || "Admin"
  );
  const [loading, setLoading] = useState(() => !cachedSiteSettings);

  useEffect(() => {
    if (cachedSiteSettings) {
      setLogoWebsiteName(cachedSiteSettings.brand?.name || "Admin");
      setLogoUrl(cachedSiteSettings.brand?.logo_url || null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    loadSettingsOnce()
      .then((res) => {
        if (cancelled || !res) return;
        setLogoWebsiteName(res.brand?.name || "Admin");
        setLogoUrl(res.brand?.logo_url || null);
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

