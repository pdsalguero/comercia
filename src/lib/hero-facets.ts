// Opciones del buscador del hero. Las marcas son el catálogo completo de cada tipo, con las que
// tienen avisos activos primero y su contador; los modelos con stock se calculan acá y el resto
// del catálogo se pide al elegir la marca (/api/vehiculos/modelos).
// Se ejecuta en el servidor: los listados de modelos (pesados) no viajan al navegador.
import { brandLabel } from "@/lib/brand-label";
import { CAMION_BRANDS_LIST } from "@/data/vehiculos";
import { MOTO_BRANDS_LIST, CUATRI_BRANDS_LIST, UTV_BRANDS_LIST } from "@/data/modelos-motos";
import { MARCAS_CATALOGO } from "@/data/catalogo/marcas.generated";
import { VEHICLE_TYPE_OPTIONS } from "@/lib/labels";

export type FacetOption = { value: string; label: string };
/** `count` = avisos activos de esa marca (0 si es solo del catálogo). */
export type BrandOption = FacetOption & { count: number };

export type VehicleFacets = {
  /** Tipos con stock, en orden de presentación. */
  types: FacetOption[];
  /** Catálogo de marcas por tipo (con stock primero). La clave "" agrupa todos los tipos. */
  brandsByType: Record<string, BrandOption[]>;
  /** Tipos en los que cada marca tiene avisos. */
  typesByBrand: Record<string, string[]>;
  /** Modelos con stock por marca. */
  modelsByBrand: Record<string, string[]>;
};

export const EMPTY_VEHICLE_FACETS: VehicleFacets = { types: [], brandsByType: {}, typesByBrand: {}, modelsByBrand: {} };

// Tipos sin catálogo propio (náutica, otros) solo ofrecen las marcas que tienen avisos.
const CATALOG_BY_TYPE: Record<string, FacetOption[]> = {
  auto: MARCAS_CATALOGO.auto,
  camioneta: MARCAS_CATALOGO.camioneta,
  moto: MOTO_BRANDS_LIST,
  cuatriciclo: CUATRI_BRANDS_LIST,
  utv: UTV_BRANDS_LIST,
  camion: CAMION_BRANDS_LIST,
};


const byLabel = (a: FacetOption, b: FacetOption) => a.label.localeCompare(b.label, "es");

// "otro" es el comodín de los formularios de publicar: no sirve como marca a buscar si no tiene avisos.
const isCatalogBrand = (b: FacetOption) => b.value !== "otro";

/** Catálogo del tipo (o de todos, con key "") con los conteos de stock; las marcas con avisos van primero. */
function mergeBrands(key: string, counts: Map<string, number> | undefined): BrandOption[] {
  const catalogs = key ? [CATALOG_BY_TYPE[key] ?? []] : Object.values(CATALOG_BY_TYPE);
  const all = new Map<string, BrandOption>();
  for (const b of catalogs.flat()) {
    if (isCatalogBrand(b) && !all.has(b.value)) all.set(b.value, { ...b, count: 0 });
  }
  for (const [value, count] of counts ?? []) {
    all.set(value, { value, label: brandLabel(value), count });
  }
  const options = [...all.values()];
  return [
    ...options.filter((b) => b.count > 0).sort((a, b) => b.count - a.count || byLabel(a, b)),
    ...options.filter((b) => b.count === 0).sort(byLabel),
  ];
}

export function buildVehicleFacets(rows: { attributes: unknown }[]): VehicleFacets {
  const typesSeen = new Set<string>();
  const brandCounts = new Map<string, Map<string, number>>(); // tipo ("" = todos) -> (marca -> avisos)
  const typesByBrand = new Map<string, Set<string>>();
  const modelsByBrand = new Map<string, Map<string, string>>(); // marca -> (modelo en minúsculas -> modelo original)

  const addBrand = (key: string, brand: string) => {
    if (!brandCounts.has(key)) brandCounts.set(key, new Map());
    const counts = brandCounts.get(key)!;
    counts.set(brand, (counts.get(brand) ?? 0) + 1);
  };

  for (const row of rows) {
    const a = (row.attributes ?? {}) as Record<string, unknown>;
    const type = typeof a.sub_category === "string" ? a.sub_category : "";
    const brand = typeof a.brand === "string" ? a.brand : "";
    const model = typeof a.model === "string" ? a.model.trim() : "";

    if (type) typesSeen.add(type);
    if (!brand) continue;
    addBrand("", brand);
    if (type) {
      addBrand(type, brand);
      if (!typesByBrand.has(brand)) typesByBrand.set(brand, new Set());
      typesByBrand.get(brand)!.add(type);
    }
    if (model) {
      if (!modelsByBrand.has(brand)) modelsByBrand.set(brand, new Map());
      const key = model.toLowerCase();
      if (!modelsByBrand.get(brand)!.has(key)) modelsByBrand.get(brand)!.set(key, model);
    }
  }

  const brandsByType: Record<string, BrandOption[]> = { "": mergeBrands("", brandCounts.get("")) };
  for (const t of VEHICLE_TYPE_OPTIONS) brandsByType[t.value] = mergeBrands(t.value, brandCounts.get(t.value));

  return {
    // Solo los tipos con stock: alimenta la grilla "Tipos de vehículo" del home.
    // El desplegable del buscador usa la lista completa (VEHICLE_TYPE_OPTIONS).
    types: VEHICLE_TYPE_OPTIONS.filter((t) => typesSeen.has(t.value)),
    brandsByType,
    typesByBrand: Object.fromEntries([...typesByBrand].map(([brand, types]) => [brand, [...types]])),
    modelsByBrand: Object.fromEntries(
      [...modelsByBrand].map(([brand, models]) => [
        brand,
        [...models.values()].sort((x, y) => x.localeCompare(y, "es", { numeric: true })),
      ])
    ),
  };
}
