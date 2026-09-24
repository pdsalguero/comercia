import { redirect } from "next/navigation";
import { RE_LOCATIONS } from "@/lib/re-locations";

// La única categoría habilitada es Vehículos (ver src/lib/site-config.ts), así que "todos los
// avisos" y "vehículos" son exactamente el mismo listado. Esta ruta quedó de antes del rebrand
// vehicles-only con su propio sidebar/hero/filtros genéricos (multi-categoría, con "Marca" y
// "Tipo de vehículo" que no filtraban nada) — /category/vehicles es la página real y mantenida,
// con el mismo sidebar por tipo/marca/año/precio, breadcrumb y selector de provincia que el resto
// del sitio. /listings sigue existiendo porque el buscador del navbar y links viejos apuntan acá:
// reenvía ahí en vez de duplicar esa lógica.
export default async function ListingsRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string; condition?: string;
    price_min?: string; price_max?: string; order?: string; location?: string;
    brand?: string; fuel?: string; transmission?: string;
    year_from?: string; year_to?: string; km_max?: string;
    sub_category?: string; type?: string; model?: string;
  }>;
}) {
  const sp = await searchParams;
  const params = new URLSearchParams();

  if (sp.q) params.set("q", sp.q);
  if (sp.condition) params.set("condition", sp.condition);
  if (sp.price_min) params.set("price_min", sp.price_min);
  if (sp.price_max) params.set("price_max", sp.price_max);
  if (sp.order) params.set("order", sp.order);
  if (sp.brand) params.set("brand", sp.brand);
  if (sp.fuel) params.set("fuel", sp.fuel);
  if (sp.transmission) params.set("transmission", sp.transmission);
  if (sp.year_from) params.set("year_from", sp.year_from);
  if (sp.year_to) params.set("year_to", sp.year_to);
  if (sp.km_max) params.set("km_max", sp.km_max);
  // /category/vehicles usa "type" (no "sub_category") para resaltar el tab activo del sidebar
  // y mostrarlo en el breadcrumb — "sub_category" ahí solo es un fallback de lectura de query.
  if (sp.type || sp.sub_category) params.set("type", (sp.type || sp.sub_category)!);
  if (sp.model) params.set("model", sp.model);

  // "location" acá era el nombre de la provincia (ej. "Buenos Aires"); /category/vehicles usa
  // la clave de RE_LOCATIONS (ej. "buenos-aires") en v_province.
  if (sp.location) {
    const key = Object.entries(RE_LOCATIONS).find(
      ([, prov]) => prov.label.toLowerCase() === sp.location!.toLowerCase()
    )?.[0];
    if (key) params.set("v_province", key);
  }

  const qs = params.toString();
  redirect(`/category/vehicles${qs ? `?${qs}` : ""}`);
}
