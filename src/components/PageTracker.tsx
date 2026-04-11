"use client";
import { useEffect } from "react";

export default function PageTracker({ page }: { page: string }) {
  useEffect(() => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page }),
    }).catch(() => {});
  }, [page]);
  return null;
}
