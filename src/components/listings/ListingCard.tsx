"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { FavoriteButton } from "./FavoriteButton";
import PinIcon from "@/components/ui/PinIcon";
import { ZONE_TO_PROVINCE } from "@/lib/re-locations";

interface ListingCardProps {
  id: string;
  title: string;
  price: number;
  currency?: string;
  cover_image: string | null;
  category?: string;
  condition?: string;
  neighborhood?: string | null;
  featured_level?: "gold" | "silver" | "bronze" | null;
  attributes?: Record<string, string | number | boolean | null>;
  size?: "normal" | "large";
  view_count?: number | null;
  created_at?: string | null;
  is_store?: boolean | null;
  store_name?: string | null;
  priority?: boolean;
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "hace un momento";
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
  const days = Math.floor(diff / 86400);
  if (days === 1) return "hace 1 día";
  if (days < 30) return `hace ${days} días`;
  const months = Math.floor(days / 30);
  if (months === 1) return "hace 1 mes";
  if (months < 12) return `hace ${months} meses`;
  return `hace ${Math.floor(months / 12)} años`;
}

function isToday(dateStr: string) {
  return Date.now() - new Date(dateStr).getTime() < 86400 * 1000;
}

function formatPrice(price: number, currency = "ARS") {
  if (currency === "USD") return `US$ ${price.toLocaleString("es-AR")}`;
  return `$ ${price.toLocaleString("es-AR")}`;
}

export function ListingCard({
  id,
  title,
  price,
  currency = "ARS",
  cover_image,
  neighborhood,
  featured_level,
  attributes,
  view_count,
  created_at,
  is_store,
  store_name,
  priority = false,
}: ListingCardProps) {
  // Resolve date label client-side only to avoid SSR/hydration mismatch with Date.now()
  const [dateLabel, setDateLabel] = useState<"today" | string | null>(null);
  useEffect(() => {
    if (!created_at) return;
    setDateLabel(isToday(created_at) ? "today" : timeAgo(created_at));
  }, [created_at]);
  const year = attributes?.year;
  const km = attributes?.mileage ?? attributes?.km;
  const hasVehicleMeta = year || km;
  const isVehicle = !!attributes?.sub_category;

  // Generic meta: brand · model | storage / capacity / volume
  // For vehicles, brand/model is already in the title — don't duplicate
  const brand = !hasVehicleMeta && !isVehicle && attributes?.brand ? String(attributes.brand) : null;
  const model = !hasVehicleMeta && !isVehicle && attributes?.model ? String(attributes.model) : null;
  const subSpecRaw = !hasVehicleMeta
    ? (attributes?.storage ?? attributes?.capacity ?? attributes?.volume ?? attributes?.size ?? null)
    : null;
  const subSpec = typeof subSpecRaw === "boolean" || subSpecRaw === null ? null : subSpecRaw;
  const brandModelLine = brand || model ? [brand, model].filter(Boolean).join(" · ") : null;

  // Show province if zone is known, otherwise fall back to neighborhood (extract province if "locality, province")
  const zoneSlug = attributes?.zone as string | undefined;
  const rawLocation = (zoneSlug && ZONE_TO_PROVINCE[zoneSlug]) ?? neighborhood ?? "Argentina";
  const locationLabel = rawLocation.includes(",") ? rawLocation.split(",").pop()!.trim() : rawLocation;

  return (
    <Link href={`/listings/${id}`} style={{ textDecoration: "none", display: "block" }}>
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          overflow: "hidden",
          border: featured_level === "gold"
            ? "2px solid #fbbf24"
            : featured_level === "silver"
            ? "2px solid #6366f1"
            : featured_level === "bronze"
            ? "2px solid #f97316"
            : "1px solid #e8e8e8",
          boxShadow: featured_level === "gold"
            ? "0 2px 12px rgba(251,191,36,0.25)"
            : featured_level === "silver"
            ? "0 2px 12px rgba(99,102,241,0.2)"
            : featured_level === "bronze"
            ? "0 2px 8px rgba(249,115,22,0.15)"
            : "0 1px 4px rgba(0,0,0,0.06)",
          transition: "transform 0.15s, box-shadow 0.15s",
          cursor: "pointer",
          height: "100%",
        }}
        className="hover:-translate-y-1 hover:shadow-md"
      >
        {/* Image */}
        <div className="lc-img" style={{ height: "155px", background: "#f5f5f5", position: "relative", overflow: "hidden" }}>
          {cover_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover_image}
              alt={title}
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          ) : (
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px" }}>
              📦
            </div>
          )}

          {featured_level === "gold" && (
            <div style={{
              position: "absolute", top: "10px", left: "10px",
              background: "linear-gradient(135deg,#eab308,#fde047)",
              color: "#713f12", borderRadius: "20px", padding: "3px 10px",
              fontSize: "10px", fontWeight: 800,
              boxShadow: "0 2px 8px rgba(234,179,8,0.5)",
            }}>
              👑 PREMIUM
            </div>
          )}
          {featured_level === "silver" && (
            <div style={{
              position: "absolute", top: "10px", left: "10px",
              background: "linear-gradient(135deg,#6366f1,#818cf8)",
              color: "#fff", borderRadius: "20px", padding: "3px 10px",
              fontSize: "10px", fontWeight: 800,
              boxShadow: "0 2px 8px rgba(99,102,241,0.45)",
            }}>
              🚀 DESTACADO
            </div>
          )}
          {featured_level === "bronze" && (
            <div style={{
              position: "absolute", top: "10px", left: "10px",
              background: "linear-gradient(135deg,#c2410c,#ea580c)",
              color: "#fff", borderRadius: "20px", padding: "3px 10px",
              fontSize: "10px", fontWeight: 800,
              boxShadow: "0 2px 8px rgba(194,65,12,0.4)",
            }}>
              ⭐ ESENCIAL
            </div>
          )}

          {is_store && (
            <div style={{
              position: "absolute", bottom: "8px", left: "8px",
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(6px)",
              color: "#0f172a", borderRadius: "20px", padding: "3px 9px 3px 6px",
              fontSize: "11px", fontWeight: 700,
              display: "flex", alignItems: "center", gap: "5px",
              boxShadow: "0 1px 6px rgba(0,0,0,0.18)",
              letterSpacing: "0.01em",
            }}>
              <span style={{
                width: "18px", height: "18px", borderRadius: "50%",
                background: "linear-gradient(135deg,#3b82f6,#6366f1)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l1-5h16l1 5"/><path d="M3 9a2 2 0 0 0 2 2 2 2 0 0 0 2-2 2 2 0 0 0 2 2 2 2 0 0 0 2-2 2 2 0 0 0 2 2 2 2 0 0 0 2-2"/>
                  <path d="M5 11v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9"/>
                </svg>
              </span>
              {store_name ?? "Tienda oficial"}
            </div>
          )}

          <FavoriteButton listingId={id} variant="card" />
        </div>

        {/* Content */}
        <div className="lc-content" style={{ padding: "12px 14px" }}>
          <h3 className="lc-title" style={{
            fontSize: "14px", fontWeight: 600, color: "#111",
            marginBottom: "6px", lineHeight: 1.35,
            overflow: "hidden", textOverflow: "ellipsis",
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const,
          }}>
            {title}
          </h3>

          <div className="lc-price" style={{ fontSize: "16px", fontWeight: 700, color: price === 0 ? "#6366f1" : "#0f172a", marginBottom: "4px", letterSpacing: "-0.2px" }}>
            {price === 0 ? "Consultar" : formatPrice(price, currency)}
          </div>

          {hasVehicleMeta && (
            <div className="lc-meta" style={{ fontSize: "13px", color: "#555", marginBottom: "4px" }}>
              {[year, km ? `${Number(km).toLocaleString("es-AR")} Km` : null]
                .filter(Boolean).join(" | ")}
            </div>
          )}

          {brandModelLine && (
            <div className="lc-meta" style={{ fontSize: "12px", fontWeight: 600, color: "#3b82f6", marginBottom: "2px", textTransform: "capitalize" }}>
              {brandModelLine}
            </div>
          )}
          {subSpec && (
            <div className="lc-meta" style={{ fontSize: "11px", color: "#888", marginBottom: "2px" }}>
              {String(subSpec)}
            </div>
          )}

          <div style={{ fontSize: "12px", color: "#888" }}>
            {/* Row 1: location + views */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <PinIcon size={11} />
                <span>{locationLabel}</span>
              </div>
              {view_count != null && view_count > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: "3px", color: "#aaa" }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <span>{view_count.toLocaleString("es-AR")} vistas</span>
                </div>
              )}
            </div>
            {/* Row 2: date */}
            {dateLabel && (
              <div style={{ marginTop: "4px", display: "flex", justifyContent: "flex-end" }}>
                {dateLabel === "today" ? (
                  <span style={{
                    display: "inline-flex", alignItems: "center", height: "18px",
                    background: "linear-gradient(135deg,#22c55e,#16a34a)",
                    color: "#fff", borderRadius: "5px",
                    padding: "0 7px", fontSize: "10px", fontWeight: 800,
                    letterSpacing: "0.3px", whiteSpace: "nowrap",
                  }}>
                    Publicado hoy
                  </span>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "3px", color: "#bbb" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span style={{ fontSize: "11px" }}>{dateLabel}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
