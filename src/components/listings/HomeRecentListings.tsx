"use client";

import { useEffect, useRef, useState } from "react";
import { useHomeProvince } from "./HomeProvinceContext";
import { RecentListings } from "./RecentListings";

type Listing = {
  id: string;
  title: string;
  price: number;
  currency: string;
  condition: string;
  neighborhood: string;
  created_at?: string | null;
  view_count?: number | null;
  listing_images?: { url: string; position: number }[];
  categories?: { name: string; slug: string } | null;
  is_store?: boolean | null;
  store_name?: string | null;
};

export function HomeRecentListings({ initialItems }: { initialItems: Listing[] }) {
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

  return (
    <div style={{ opacity: loading ? 0.5 : 1, transition: "opacity 0.2s" }}>
      <RecentListings items={items} viewAllHref={viewAllHref} />
    </div>
  );
}
