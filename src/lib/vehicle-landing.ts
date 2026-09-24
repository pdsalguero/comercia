// URLs limpias e indexables del listado de vehículos: /motos, /motos/benelli, /autos/san-juan,
// /autos/toyota/san-juan. El middleware las reescribe a /category/vehicles?type=…&brand=…&v_province=…
// (la página de categoría sigue siendo una sola) y redirige con 301 las URLs viejas con query a estas.
// Cualquier otro filtro viaja como query (/motos?price_max=…) y esa variante va con noindex.
import { MARCAS_CATALOGO } from "@/data/catalogo/marcas.generated";
import { RE_LOCATIONS } from "@/lib/re-locations";

export const LANDING_TYPE_SLUGS: Record<string, string> = {
  auto: "autos",
  camioneta: "pickups-suv",
  moto: "motos",
  cuatriciclo: "cuatriciclos",
  utv: "utv",
  camion: "camiones",
};
const SLUG_TO_TYPE = Object.fromEntries(Object.entries(LANDING_TYPE_SLUGS).map(([t, s]) => [s, t]));

// Marcas del catálogo: "mercedes_benz" ↔ "mercedes-benz" en la URL.
const BRAND_VALUES = new Set(Object.values(MARCAS_CATALOGO).flat().map((b) => b.value));
const brandToSegment = (brand: string) => brand.replace(/_/g, "-");
const segmentToBrand = (segment: string) => {
  const v = segment.replace(/-/g, "_");
  return BRAND_VALUES.has(v) ? v : null;
};
const isProvinceKey = (k: string) => Object.prototype.hasOwnProperty.call(RE_LOCATIONS, k);

/** Parámetros que forman la landing; el resto son filtros (y la página ya no es indexable). */
export const LANDING_KEYS = ["type", "brand", "v_province"] as const;
/** Parámetros que no cambian qué página es: se conservan en una landing indexable. */
const INDEXABLE_EXTRA_KEYS = new Set(["page"]);

export interface LandingParts { type: string; brand?: string; province?: string }

/** "/motos/benelli" → { type: "moto", brand: "benelli" }. null si el path no es una landing. */
export function parseLandingPath(pathname: string): LandingParts | null {
  const segs = pathname.replace(/\/+$/, "").split("/").filter(Boolean);
  if (segs.length === 0 || segs.length > 3) return null;
  const type = SLUG_TO_TYPE[segs[0]];
  if (!type) return null;
  if (segs.length === 1) return { type };
  if (segs.length === 2) {
    if (isProvinceKey(segs[1])) return { type, province: segs[1] };
    const brand = segmentToBrand(segs[1]);
    return brand ? { type, brand } : null;
  }
  const brand = segmentToBrand(segs[1]);
  return brand && isProvinceKey(segs[2]) ? { type, brand, province: segs[2] } : null;
}

/** Path de la landing para esa combinación, o null si no tiene una (tipo sin landing, marca fuera del catálogo…). */
export function landingPath(parts: { type?: string | null; brand?: string | null; province?: string | null }): string | null {
  const typeSlug = parts.type ? LANDING_TYPE_SLUGS[parts.type] : undefined;
  if (!typeSlug) return null;
  const brand = parts.brand ? parts.brand.toLowerCase() : null;
  if (brand && !BRAND_VALUES.has(brand)) return null;
  if (parts.province && !isProvinceKey(parts.province)) return null;
  return "/" + [typeSlug, brand && brandToSegment(brand), parts.province].filter(Boolean).join("/");
}

/**
 * Href del listado de vehículos para unos parámetros: la landing limpia con el resto como query si se puede,
 * si no /category/vehicles?…  Lo usan todos los links internos para no pasar por la redirección.
 */
export function vehiclesHref(params: URLSearchParams | Record<string, string | undefined | null>): string {
  const p = params instanceof URLSearchParams ? new URLSearchParams(params) : new URLSearchParams(
    Object.entries(params).filter((e): e is [string, string] => !!e[1])
  );
  const path = landingPath({ type: p.get("type"), brand: p.get("brand"), province: p.get("v_province") });
  if (!path) {
    const s = p.toString();
    return `/category/vehicles${s ? `?${s}` : ""}`;
  }
  for (const k of LANDING_KEYS) p.delete(k);
  const s = p.toString();
  return `${path}${s ? `?${s}` : ""}`;
}

/** ¿La combinación de parámetros es una landing indexable (sin filtros extra más allá de la página)? */
export function isIndexableLanding(params: Record<string, string | undefined>): boolean {
  if (!landingPath({ type: params.type, brand: params.brand, province: params.v_province })) return false;
  return Object.entries(params).every(
    ([k, v]) => !v || (LANDING_KEYS as readonly string[]).includes(k) || INDEXABLE_EXTRA_KEYS.has(k)
  );
}

/** Landing más cercana a un listado filtrado (para el canonical): tipo + marca + provincia si existen. */
export function closestLandingPath(params: Record<string, string | undefined>): string | null {
  return (
    landingPath({ type: params.type, brand: params.brand, province: params.v_province }) ??
    landingPath({ type: params.type, brand: params.brand }) ??
    landingPath({ type: params.type })
  );
}
