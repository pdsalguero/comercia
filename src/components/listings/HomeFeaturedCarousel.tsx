"use client";

import { useMemo, useRef } from "react";
import { useHomeProvince } from "./HomeProvinceContext";
import { FeaturedCarousel } from "./FeaturedCarousel";
import { listingProvince } from "@/lib/listing-location";

interface Item {
  id: string;
  title: string;
  price: number | null;
  currency?: string | null;
  condition?: string | null;
  city?: string | null;
  neighborhood?: string | null;
  featured_level?: string | null;
  attributes?: Record<string, any> | null;
  cover_image: string | null;
  view_count?: number | null;
  created_at?: string | null;
  bumped_at?: string | null;
  is_store?: boolean | null;
  store_name?: string | null;
  photo_count?: number | null;
  photos?: string[] | null;
  price_drop_pct?: number | null;
}

export function HomeFeaturedCarousel({
  initialItems,
  href,
}: {
  initialItems: Item[];
  href: string;
}) {
  const { province } = useHomeProvince();
  const allItems = useRef(initialItems);

  const items = useMemo(() => {
    if (!province) return allItems.current;
    return allItems.current.filter((item) => listingProvince(item).toLowerCase() === province.toLowerCase());
  }, [province]);

  const viewAllHref = province ? `${href}?location=${encodeURIComponent(province)}` : href;

  if (items.length === 0) return null;

  return <FeaturedCarousel title="Destacados" items={items} href={viewAllHref} />;
}
