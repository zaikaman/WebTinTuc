"use client";

import { useEffect } from "react";

interface ViewTrackerProps {
  articleId?: number | undefined;
}

export default function ViewTracker({ articleId }: ViewTrackerProps) {
  useEffect(() => {
    if (!articleId) return;

    fetch("/api/articles/view", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ articleId }),
    }).catch((err) => {
      console.error("Failed to record article view:", err);
    });
  }, [articleId]);

  return null;
}
