import { createClient } from "@/lib/supabase/server";
import { MetadataRoute } from "next";
import { listingUrl } from "@/lib/listing-url";
import { ENABLED_CATEGORY_IDS, ENABLED_CATEGORY_SLUGS } from "@/lib/site-config";
import { SITE_URL } from "@/lib/site-url";
import { getLandingCounts } from "@/lib/landing-stock";

// Solo categorías habilitadas: las demás redirigen y no deben indexarse. /listings no va: redirige.
const STATIC_CATEGORIES = ENABLED_CATEGORY_SLUGS;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const [{ data: listings }, { data: stores }, landingCounts] = await Promise.all([
    supabase
      .from("listings")
      .select("id, title, updated_at")
      .eq("status", "active")
      .in("category_id", ENABLED_CATEGORY_IDS)
      .order("created_at", { ascending: false })
      .limit(5000),
    supabase
      .from("profiles")
      .select("store_slug, updated_at")
      .eq("is_store", true)
      .not("store_slug", "is", null),
    getLandingCounts(),
  ]);

  // lastmod = updated_at del aviso. Sumar una vista ya no lo cambia (migración
  // 20260924000001_listing_views_keep_updated_at).
  const listingUrls: MetadataRoute.Sitemap = (listings ?? []).map((l) => ({
    url: `${SITE_URL}${listingUrl(l.id, l.title)}`,
    lastModified: l.updated_at ? new Date(l.updated_at) : undefined,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryUrls: MetadataRoute.Sitemap = STATIC_CATEGORIES.map((slug) => ({
    url: `${SITE_URL}/category/${slug}`,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  // Landings limpias (/motos, /motos/benelli, /autos/san-juan…) solo si tienen avisos: vacías llevan noindex.
  // Más profundas = menos prioridad.
  const landingUrls: MetadataRoute.Sitemap = Object.entries(landingCounts)
    .filter(([, n]) => n > 0)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path]) => ({
      url: `${SITE_URL}${path}`,
      changeFrequency: "daily",
      priority: [0.8, 0.7, 0.6][path.split("/").length - 2] ?? 0.5,
    }));

  const storeUrls: MetadataRoute.Sitemap = (stores ?? [])
    .filter((s) => s.store_slug)
    .map((s) => ({
      url: `${SITE_URL}/tienda/${s.store_slug}`,
      lastModified: s.updated_at ? new Date(s.updated_at) : undefined,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

  return [
    { url: SITE_URL, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/tiendas`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/costo-transferencia`, changeFrequency: "monthly", priority: 0.7 },
    ...categoryUrls,
    ...landingUrls,
    ...listingUrls,
    ...storeUrls,
  ];
}
