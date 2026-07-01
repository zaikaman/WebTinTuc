"use client";

import React, { useEffect, useState } from "react";
import { OfflinePageContent } from "./OfflinePageContent";

export function OfflineDetector({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);

      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  const checkConnection = () => {
    if (typeof window !== "undefined") {
      const online = navigator.onLine;
      setIsOnline(online);
      if (online) {
        console.log("Connection restored!");
      }
    }
  };

  // Render children on server/hydration to avoid mismatch, switch on client when offline
  if (mounted && !isOnline) {
    return <OfflinePageContent onCheckConnection={checkConnection} />;
  }

  return <>{children}</>;
}
