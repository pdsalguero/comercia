// Chips "Auto · Honda · Civic" que se muestran debajo del título en la vista en lista
// (ListingListCard). Se comparte entre /listings, /category/[slug] y la home para que
// las tres tengan el mismo diseño de fila — ver [[project-list-view-whitespace]].
export interface BreadcrumbChip {
  label: string;
  variant?: "primary" | "secondary";
  /** Si está, el chip es un link que filtra por ese valor — ver [[project-listlist-card-chip-links]] */
  href?: string;
}

const VEH_SUBCATS: Record<string, string> = {
  auto: "Auto", camioneta: "Pickup/SUV", moto: "Moto",
  cuatriciclo: "Cuatriciclo", utv: "UTV/Arenero",
  camion: "Camión", nautica: "Náutica",
};
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
  vehiclesBasePath = "/category/vehicles",
  realEstateBasePath = "/category/real-estate",
): BreadcrumbChip[] {
  if (!attrs) return [];
  const chips: BreadcrumbChip[] = [];

  const brand = attrs.brand ? String(attrs.brand).toLowerCase() : null;
  const model = attrs.model ? String(attrs.model) : null;

  // Vehicles: sub_category > brand > model — cada chip filtra por ESE valor solo (no acumula).
  if (attrs.sub_category) {
    const val = String(attrs.sub_category);
    chips.push({
      label: VEH_SUBCATS[val] ?? cap(val),
      variant: "primary",
      href: `${vehiclesBasePath}?type=${encodeURIComponent(val)}`,
    });
  }
  if (brand) {
    chips.push({ label: cap(brand), href: `${vehiclesBasePath}?brand=${encodeURIComponent(brand)}` });
  }
  if (model) {
    // Modelo va con marca (si la hay) para no mezclar modelos homónimos de otro fabricante.
    const p = new URLSearchParams();
    if (brand) p.set("brand", brand);
    p.set("model", model);
    chips.push({ label: model, href: `${vehiclesBasePath}?${p.toString()}` });
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
