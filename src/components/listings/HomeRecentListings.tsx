"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useHomeProvince } from "./HomeProvinceContext";
import { RecentListings } from "./RecentListings";

type Listing = {
  id: string;
  title: string;
  description?: string | null;
  price: number;
  currency: string;
  condition: string;
  city?: string | null;
  neighborhood: string;
  created_at?: string | null;
  bumped_at?: string | null;
  view_count?: number | null;
  featured_level?: string | null;
  attributes?: Record<string, string | number | boolean | null> | null;
  listing_images?: { url: string; position: number }[];
  categories?: { name: string; slug: string } | null;
  is_store?: boolean | null;
  store_name?: string | null;
  whatsapp_url?: string | null;
  price_drop_pct?: number | null;
};

const FEATURED_RANK: Record<string, number> = { gold: 3, silver: 2, bronze: 1 };

export function HomeRecentListings({ initialItems, title }: { initialItems: Listing[]; title?: string }) {
  const { province } = useHomeProvince();
  const initialRef = useRef(initialItems);
  const [items, setItems] = useState<Listing[]>(initialItems);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Province vacía → restaurar items iniciales del SSR, sin fetch
    if (!province) {
      setItems(initialRef.current);
      return;
    }

    setLoading(true);
    const controller = new AbortController();
    fetch(`/api/listings/home-recent?province=${encodeURIComponent(province)}`, {
      signal: controller.signal,
    })
      .then(async (r) => {
        const data = await r.json();
        if (Array.isArray(data)) {
          setItems(data);
        } else {
          console.error("[HomeRecentListings] unexpected response:", data);
          setItems([]);
        }
        setLoading(false);
      })
      .catch((e) => {
        if (e.name !== "AbortError") {
          console.error("[HomeRecentListings] fetch error:", e);
          setItems([]);
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [province]);

  const viewAllHref = province
    ? `/listings?location=${encodeURIComponent(province)}`
    : "/listings";

  // Los destacados van primero (el orden se mantiene estable dentro de cada nivel)
  const sorted = useMemo(
    () => [...items].sort((a, b) => (FEATURED_RANK[b.featured_level ?? ""] ?? 0) - (FEATURED_RANK[a.featured_level ?? ""] ?? 0)),
    [items]
  );

  return (
    <RecentListings items={sorted} viewAllHref={viewAllHref} title={title} loading={loading} />
  );
}
