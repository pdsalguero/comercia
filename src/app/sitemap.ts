import { createClient } from "@/lib/supabase/server";
import { MetadataRoute } from "next";

const BASE = "https://comercia.com.ar";

const STATIC_CATEGORIES = [
  "vehicles", "real-estate", "phones", "electronics", "appliances",
  "clothing", "home-garden", "sports", "tools", "babies",
  "books", "beauty-health", "toys", "pets", "services", "other",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const [{ data: listings }, { data: stores }] = await Promise.all([
    supabase
      .from("listings")
      .select("id, updated_at")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(5000),
    supabase
      .from("profiles")
      .select("store_slug, updated_at")
      .eq("is_store", true)
      .not("store_slug", "is", null),
  ]);

  const listingUrls: MetadataRoute.Sitemap = (listings ?? []).map((l) => ({
    url: `${BASE}/listings/${l.id}`,
    lastModified: l.updated_at ? new Date(l.updated_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryUrls: MetadataRoute.Sitemap = STATIC_CATEGORIES.map((slug) => ({
    url: `${BASE}/category/${slug}`,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const storeUrls: MetadataRoute.Sitemap = (stores ?? [])
    .filter((s) => s.store_slug)
    .map((s) => ({
      url: `${BASE}/tienda/${s.store_slug}`,
      lastModified: s.updated_at ? new Date(s.updated_at) : new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    }));

  return [
    { url: BASE, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE}/listings`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/tiendas`, changeFrequency: "weekly", priority: 0.6 },
    ...categoryUrls,
    ...listingUrls,
    ...storeUrls,
  ];
}
