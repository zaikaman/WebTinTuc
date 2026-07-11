"use client";

import { useState, useEffect } from "react";
import { getAdminSettings } from "@/lib/api/adminClient";

// Module-level cache so the API is called only once across all pages / remounts
let cachedSiteSettings: any = null;
let inflight: Promise<any> | null = null;
/** Bumps when cache is updated so subscribed shells re-read brand data. */
let cacheVersion = 0;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((fn) => fn());
}

/** Update module cache after Logo & Footer save so the admin shell brand refreshes. */
export function updateSiteSettingsCache(settings: any) {
  cachedSiteSettings = settings;
  cacheVersion += 1;
  notifyListeners();
}

export function clearSiteSettingsCache() {
  cachedSiteSettings = null;
  inflight = null;
  cacheVersion += 1;
  notifyListeners();
}

function loadSettingsOnce() {
  if (cachedSiteSettings) return Promise.resolve(cachedSiteSettings);
  if (inflight) return inflight;
  inflight = getAdminSettings()
    .then((res) => {
      if (res) {
        cachedSiteSettings = res;
        cacheVersion += 1;
        notifyListeners();
      }
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
  const [, setVersion] = useState(cacheVersion);

  useEffect(() => {
    const onUpdate = () => {
      setVersion(cacheVersion);
      if (cachedSiteSettings) {
        setLogoWebsiteName(cachedSiteSettings.brand?.name || "Admin");
        setLogoUrl(cachedSiteSettings.brand?.logo_url || null);
        setLoading(false);
      }
    };
    listeners.add(onUpdate);
    return () => {
      listeners.delete(onUpdate);
    };
  }, []);

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

