"use client";

import { useEffect } from "react";

export function ViewTracker({ listingId }: { listingId: string }) {
  useEffect(() => {
    const key = `viewed_${listingId}`;
    const stored = localStorage.getItem(key);
    // Expire at midnight — format: "YYYY-MM-DD"
    const today = new Date().toISOString().slice(0, 10);
    if (stored === today) return;
    localStorage.setItem(key, today);
    fetch("/api/listings/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listing_id: listingId }),
    });
  }, [listingId]);

  return null;
}
