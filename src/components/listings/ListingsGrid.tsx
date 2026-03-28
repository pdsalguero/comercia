"use client";

import { useListingsView } from "./ListingsViewContext";
import { ListingCard } from "./ListingCard";
import { ListingListCard, type ListingListCardProps } from "./ListingListCard";

// ── Label maps ───────────────────────────────────────────────────────────────
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

function buildBreadcrumbs(
  attrs: Record<string, string | number | boolean | null> | undefined,
): ListingListCardProps["breadcrumbs"] {
  if (!attrs) return [];
  const chips: ListingListCardProps["breadcrumbs"] = [];

  // Vehicles: sub_category > brand > model > year
  if (attrs.sub_category) {
    chips.push({ label: VEH_SUBCATS[String(attrs.sub_category)] ?? cap(String(attrs.sub_category)), variant: "primary" });
  }
  if (attrs.brand) chips.push({ label: cap(String(attrs.brand)) });
  if (attrs.model) chips.push({ label: String(attrs.model) });

  // Real estate: operation_type > property_type > bedrooms
  if (attrs.operation_type) {
    chips.push({ label: RE_OP[String(attrs.operation_type)] ?? cap(String(attrs.operation_type)), variant: "primary" });
  }
  if (attrs.property_type) {
    chips.push({ label: RE_PROP[String(attrs.property_type)] ?? cap(String(attrs.property_type)) });
  }
  if (attrs.bedrooms) chips.push({ label: `${attrs.bedrooms} dorm.` });

  return chips;
}

interface Listing {
  id: string;
  title: string;
  price: number | null;
  currency: string | null;
  cover_image: string | null;
  neighborhood: string | null;
  featured_level: string | null;
  attributes?: Record<string, string | number | boolean | null>;
  view_count: number | null;
  created_at: string | null;
  is_store: boolean | null;
  store_name: string | null;
}

interface Props {
  featured: Listing[];
  regular: Listing[];
}

export function ListingsGrid({ featured, regular }: Props) {
  const { view } = useListingsView();

  const renderItems = (items: Listing[], isLast = false) =>
    view === "grid" ? (
      <div className="grid-cols-auto">
        {items.map((l) => (
          <ListingCard
            key={l.id}
            id={l.id}
            title={l.title}
            price={l.price ?? 0}
            currency={l.currency ?? "ARS"}
            cover_image={l.cover_image}
            neighborhood={l.neighborhood ?? undefined}
            featured_level={(l.featured_level as any) ?? null}
            attributes={l.attributes}
            view_count={l.view_count}
            created_at={l.created_at}
            is_store={l.is_store}
            store_name={l.store_name}
          />
        ))}
      </div>
    ) : (
      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        {items.map((l, i) => (
          <ListingListCard
            key={l.id}
            id={l.id}
            title={l.title}
            price={l.price}
            currency={l.currency}
            featured_level={l.featured_level}
            cover_image={l.cover_image}
            condition={(l.attributes?.condition as string | null) ?? null}
            neighborhood={l.neighborhood}
            view_count={l.view_count}
            created_at={l.created_at}
            breadcrumbs={buildBreadcrumbs(l.attributes)}
            showDivider={i < items.length - 1}
          />
        ))}
      </div>
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {featured.length > 0 && renderItems(featured)}
      {regular.length > 0 && renderItems(regular)}
    </div>
  );
}
