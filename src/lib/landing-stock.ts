// Cuántos avisos activos tiene cada landing limpia (/motos, /motos/benelli, /autos/san-juan, …).
// Lo usan el sitemap (solo landings con avisos) y la metadata del listado (noindex si está vacía).
// Solo servidor. La provincia se resuelve igual que el filtro v_province de /category/vehicles:
// attributes.zone de esa provincia, o su nombre en city/neighborhood.
import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { RE_LOCATIONS } from "@/lib/re-locations";
import { landingPath } from "@/lib/vehicle-landing";

const PROVINCES = Object.entries(RE_LOCATIONS).map(([key, p]) => ({
  key,
  name: p.label.toLowerCase(),
  zones: new Set(p.zones.map((z) => z.value)),
}));

export function provinceKeysOf(row: { zone?: string | null; city?: string | null; neighborhood?: string | null }): string[] {
  const zone = row.zone ?? "";
  const city = (row.city ?? "").toLowerCase();
  const nb = (row.neighborhood ?? "").toLowerCase();
  return PROVINCES.filter((p) => p.zones.has(zone) || city.includes(p.name) || nb.includes(p.name)).map((p) => p.key);
}

/** Conteo por path de landing, a partir de filas de avisos activos. */
export function countLandings(
  rows: { type?: string | null; brand?: string | null; zone?: string | null; city?: string | null; neighborhood?: string | null }[]
): Record<string, number> {
  const counts: Record<string, number> = {};
  const add = (path: string | null) => { if (path) counts[path] = (counts[path] ?? 0) + 1; };
  for (const r of rows) {
    if (!r.type) continue;
    const brand = r.brand ? r.brand.toLowerCase() : null;
    const provinces = provinceKeysOf(r);
    add(landingPath({ type: r.type }));
    if (brand) add(landingPath({ type: r.type, brand }));
    for (const province of provinces) {
      add(landingPath({ type: r.type, province }));
      if (brand) add(landingPath({ type: r.type, brand, province }));
    }
  }
  return counts;
}

export const getLandingCounts = unstable_cache(
  async (): Promise<Record<string, number>> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("listings")
      .select("city, neighborhood, type:attributes->>sub_category, brand:attributes->>brand, zone:attributes->>zone")
      .eq("status", "active")
      .eq("category_id", 2)
      .limit(10000);
    if (error) {
      console.error("[landing-stock]", error.message);
      return {};
    }
    return countLandings((data ?? []) as Parameters<typeof countLandings>[0]);
  },
  ["vehicle-landing-counts"],
  { revalidate: 600 }
);
