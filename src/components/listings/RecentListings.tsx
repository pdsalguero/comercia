"use client";
import { useState } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import { buildBreadcrumbs } from "@/lib/listing-breadcrumbs";
import { ListingCard } from "./ListingCard";
import { ListingCardSkeleton } from "./ListingCardSkeleton";
import { ListingListCard } from "./ListingListCard";

type Listing = {
  id: string;
  title: string;
  description?: string | null;
  price: number;
  currency: string;
  condition: string;
  neighborhood: string;
  created_at?: string | null;
  bumped_at?: string | null;
  view_count?: number | null;
  featured_level?: string | null;
  attributes?: Record<string, string | number | boolean | null> | null;
  listing_images?: { url: string; position: number }[];
  is_store?: boolean | null;
  store_name?: string | null;
  whatsapp_url?: string | null;
  price_drop_pct?: number | null;
};

function cover(listing: Listing): string | null {
  const imgs = listing.listing_images;
  if (!imgs?.length) return null;
  return [...imgs].sort((a, b) => a.position - b.position)[0]?.url ?? null;
}

function photos(listing: Listing): string[] {
  const imgs = listing.listing_images;
  if (!imgs?.length) return [];
  return [...imgs].sort((a, b) => a.position - b.position).map((img) => img.url);
}

export function RecentListings({
  items,
  viewAllHref = "/listings",
  title = "Últimos avisos",
  loading = false,
}: {
  items: Listing[];
  viewAllHref?: string;
  title?: string;
  loading?: boolean;
}) {
  const [view, setView] = useState<"grid" | "list">("grid");

  return (
    <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid #f1f5f9" }}>
        <span style={{ fontWeight: 800, fontSize: "15px", color: "#0f172a", display: "flex", alignItems: "center", gap: "7px" }}>
          <Clock size={17} strokeWidth={1.9} color="#1d6fb8" />
          {title}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Toggle buttons */}
          <div style={{ display: "flex", border: "1.5px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
            <button
              onClick={() => setView("grid")}
              title="Ver en grilla"
              style={{
                border: "none", padding: "5px 8px", cursor: "pointer",
                background: view === "grid" ? "#1d6fb8" : "#fff",
                color: view === "grid" ? "#fff" : "#94a3b8",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.15s",
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
            </button>
            <button
              onClick={() => setView("list")}
              title="Ver en lista"
              style={{
                border: "none", padding: "5px 8px", cursor: "pointer",
                background: view === "list" ? "#1d6fb8" : "#fff",
                color: view === "list" ? "#fff" : "#94a3b8",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.15s",
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </div>
          <Link href={viewAllHref} style={{ fontSize: "12px", color: "#1d6fb8", textDecoration: "none", fontWeight: 600 }}>
            Ver todos →
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid-cols-4" style={{ padding: "14px" }}>
          {Array.from({ length: 4 }).map((_, i) => <ListingCardSkeleton key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 24px", color: "#94a3b8" }}>
          <div style={{ fontSize: "36px", marginBottom: "8px" }}>📭</div>
          <div style={{ fontWeight: 700, fontSize: "15px", color: "#0f172a", marginBottom: "4px" }}>Todavía no hay avisos</div>
          <div style={{ fontSize: "13px", marginBottom: "14px" }}>¡Sé el primero en vender en CuyoRodados!</div>
          <Link href="/listings/new">
            <button style={{ background: "#1d6fb8", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 24px", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>
              Publicar el primer aviso
            </button>
          </Link>
        </div>
      ) : view === "grid" ? (
        // Misma tarjeta que el resto del sitio, para que el home tenga un único diseño de aviso
        <div className="grid-cols-4" style={{ padding: "14px" }}>
          {items.map((l) => (
            <ListingCard
              key={l.id}
              id={l.id}
              title={l.title}
              price={l.price ?? 0}
              currency={l.currency ?? "ARS"}
              cover_image={cover(l)}
              condition={l.condition}
              neighborhood={l.neighborhood}
              featured_level={(l.featured_level as "gold" | "silver" | "bronze" | null | undefined) ?? null}
              attributes={l.attributes ?? undefined}
              view_count={l.view_count ?? null}
              created_at={l.created_at ?? null}
              bumped_at={l.bumped_at ?? null}
              is_store={l.is_store ?? null}
              store_name={l.store_name ?? null}
              photo_count={l.listing_images?.length ?? null}
              photos={photos(l)}
              priceDropPct={l.price_drop_pct ?? null}
            />
          ))}
        </div>
      ) : (
        // Misma fila que /listings y /category — miniatura grande y ficha marca/modelo,
        // en vez de la fila angosta que dejaba casi todo el ancho vacío.
        items.map((l, i) => (
          <ListingListCard
            key={l.id}
            id={l.id}
            title={l.title}
            price={l.price ?? 0}
            currency={l.currency ?? "ARS"}
            featured_level={l.featured_level ?? null}
            cover_image={cover(l)}
            condition={l.condition}
            neighborhood={l.neighborhood}
            view_count={l.view_count ?? null}
            created_at={l.created_at ?? null}
            bumped_at={l.bumped_at ?? null}
            is_store={l.is_store}
            store_name={l.store_name}
            breadcrumbs={buildBreadcrumbs(l.attributes)}
            attributes={l.attributes}
            description={l.description ?? null}
            photo_count={l.listing_images?.length ?? null}
            photos={photos(l)}
            whatsappUrl={l.whatsapp_url ?? null}
            priceDropPct={l.price_drop_pct ?? null}
            showDivider={i < items.length - 1}
          />
        ))
      )}
    </div>
  );
}
