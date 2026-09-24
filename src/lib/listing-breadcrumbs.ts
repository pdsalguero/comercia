// Chips "Auto · Honda · Civic" que se muestran debajo del título en la vista en lista
// (ListingListCard). Se comparte entre /listings, /category/[slug] y la home para que
// las tres tengan el mismo diseño de fila — ver [[project-list-view-whitespace]].
import { brandLabel } from "@/lib/brand-label";
import { VEHICLE_TYPE_SHORT } from "@/lib/labels";
import { vehiclesHref } from "@/lib/vehicle-landing";

export interface BreadcrumbChip {
  label: string;
  variant?: "primary" | "secondary";
  /** Si está, el chip es un link que filtra por ese valor — ver [[project-listlist-card-chip-links]] */
  href?: string;
}

const VEH_SUBCATS = VEHICLE_TYPE_SHORT;
const RE_OP: Record<string, string> = {
  venta: "Venta", alquiler: "Alquiler", "alquiler-temporal": "Alq. Temp.",
};
const RE_PROP: Record<string, string> = {
  casa: "Casa", departamento: "Dpto.", terreno: "Terreno",
  finca: "Finca", local: "Local", galpon: "Galpón", cochera: "Cochera",
};

function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

// basePath por defecto para cada grupo de chips — quien ya tenga una página con filtros activos
// (ej. category/[slug]) puede pasar su propio `buildUrl` en vez de usar esta función, para que el
// click preserve el resto de los filtros en vez de armar una URL "limpia" — ver el uso en
// category/[slug]/page.tsx (vista en lista), que arma sus propios hrefs con su `buildUrl` local.
export function buildBreadcrumbs(
  attrs: Record<string, string | number | boolean | null> | undefined | null,
  realEstateBasePath = "/category/real-estate",
): BreadcrumbChip[] {
  if (!attrs) return [];
  const chips: BreadcrumbChip[] = [];

  const type = attrs.sub_category ? String(attrs.sub_category) : undefined;
  const brand = attrs.brand ? String(attrs.brand).toLowerCase() : undefined;
  const model = attrs.model ? String(attrs.model) : undefined;

  // Vehicles: tipo > marca > modelo. Marca y modelo van dentro del tipo, así el link cae en la URL
  // limpia (/motos/benelli) y no mezcla modelos homónimos de otro fabricante o tipo.
  if (type) {
    chips.push({ label: VEH_SUBCATS[type] ?? cap(type), variant: "primary", href: vehiclesHref({ type }) });
  }
  if (brand) {
    chips.push({ label: brandLabel(brand), href: vehiclesHref({ type, brand }) });
  }
  if (model) {
    chips.push({ label: model, href: vehiclesHref({ type, brand, model }) });
  }

  // Real estate: operation_type > property_type > bedrooms
  if (attrs.operation_type) {
    const val = String(attrs.operation_type);
    chips.push({
      label: RE_OP[val] ?? cap(val),
      variant: "primary",
      href: `${realEstateBasePath}?operation=${encodeURIComponent(val)}`,
    });
  }
  if (attrs.property_type) {
    const val = String(attrs.property_type);
    chips.push({ label: RE_PROP[val] ?? cap(val), href: `${realEstateBasePath}?re_sub=${encodeURIComponent(val)}` });
  }
  if (attrs.bedrooms) {
    chips.push({ label: `${attrs.bedrooms} dorm.`, href: `${realEstateBasePath}?bedrooms=${encodeURIComponent(String(attrs.bedrooms))}` });
  }

  return chips;
}
