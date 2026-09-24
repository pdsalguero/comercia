"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Camera, Fuel, Cog, ChevronLeft, ChevronRight } from "lucide-react";
import { FavoriteButton } from "./FavoriteButton";
import { PriceDropBadge } from "./PriceDropBadge";
import PinIcon from "@/components/ui/PinIcon";
import { ZONE_TO_PROVINCE } from "@/lib/re-locations";
import { listingUrl } from "@/lib/listing-url";
import { storageImg, fallbackToOriginal } from "@/lib/storage-image";
import { fuelLabel as toFuelLabel, transmissionLabel as toTransmissionLabel, timeAgo } from "@/lib/labels";

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
  bumped_at?: string | null;
  is_store?: boolean | null;
  store_name?: string | null;
  priority?: boolean;
  /** Total de fotos del aviso — muestra un contador sobre la miniatura cuando hay más de una */
  photo_count?: number | null;
  /** Todas las fotos del aviso, en orden — si hay más de una se pueden navegar con flechas
      sobre la miniatura sin salir de la tarjeta. Si no se pasa, se usa solo cover_image. */
  photos?: string[] | null;
  /** Porcentaje de la última baja de precio, si fue reciente (ver lib/price-drops.ts). */
  priceDropPct?: number | null;
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
  bumped_at,
  is_store,
  store_name,
  priority = false,
  photo_count,
  photos,
  priceDropPct,
}: ListingCardProps) {
  // Resolve date labels client-side only to avoid SSR/hydration mismatch with Date.now()
  const [dateLabel, setDateLabel] = useState<"today" | string | null>(null);
  const gallery = photos && photos.length > 0 ? photos : cover_image ? [cover_image] : [];
  const [photoIndex, setPhotoIndex] = useState(0);
  const activePhoto = gallery[photoIndex] ?? null;
  // preventDefault + stopPropagation: la tarjeta entera es un <Link>, sin esto el click en la
  // flecha navegaría al aviso además de cambiar de foto (mismo patrón que FavoriteButton).
  const prevPhoto = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setPhotoIndex((i) => (i - 1 + gallery.length) % gallery.length); };
  const nextPhoto = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setPhotoIndex((i) => (i + 1) % gallery.length); };
  useEffect(() => {
    if (!created_at) return;
    setDateLabel(isToday(created_at) ? "today" : timeAgo(created_at));
  }, [created_at]);
  const year = attributes?.year;
  const km = attributes?.mileage ?? attributes?.km;
  const hasVehicleMeta = year || km;
  const isVehicle = !!attributes?.sub_category;
  const fuelLabel = isVehicle ? toFuelLabel(attributes?.fuel) || undefined : undefined;
  const transmissionLabel = isVehicle ? toTransmissionLabel(attributes?.transmission) || undefined : undefined;

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
    <Link href={listingUrl(id, title)} prefetch={false} style={{ textDecoration: "none", display: "block", height: "100%" }}>
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          overflow: "hidden",
          border: featured_level === "gold"
            ? "2px solid #fbbf24"
            : featured_level === "silver"
            ? "2px solid #1d6fb8"
            : featured_level === "bronze"
            ? "2px solid #f97316"
            : "1px solid #e8e8e8",
          boxShadow: featured_level === "gold"
            ? "0 2px 12px rgba(251,191,36,0.25)"
            : featured_level === "silver"
            ? "0 2px 12px rgba(29,111,184,0.2)"
            : featured_level === "bronze"
            ? "0 2px 8px rgba(249,115,22,0.15)"
            : "0 1px 4px rgba(0,0,0,0.06)",
          transition: "transform 0.15s, box-shadow 0.15s",
          cursor: "pointer",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
        className="hover:-translate-y-1 hover:shadow-md"
      >
        {/* Image */}
        <div className="lc-img" style={{ aspectRatio: "4 / 3", background: "#f1f5f9", position: "relative", overflow: "hidden" }}>
          {activePhoto ? (
            <>
              {/* Fondo: la misma foto agrandada y desenfocada, así las fotos verticales no quedan con barras */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={storageImg(activePhoto, 480, 75, 360)}
                alt=""
                aria-hidden="true"
                loading={priority ? "eager" : "lazy"}
                decoding="async"
                style={{
                  position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
                  filter: "blur(18px) saturate(1.15)", transform: "scale(1.25)", opacity: 0.75,
                }}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={storageImg(activePhoto, 480, 75, 360)}
                onError={fallbackToOriginal(activePhoto)}
                alt={gallery.length > 1 ? `${title} – foto ${photoIndex + 1} de ${gallery.length}` : title}
                loading={priority ? "eager" : "lazy"}
                decoding="async"
                style={{ position: "relative", width: "100%", height: "100%", objectFit: "contain" }}
              />
            </>
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
              background: "linear-gradient(135deg,#1d6fb8,#4d94d1)",
              color: "#fff", borderRadius: "20px", padding: "3px 10px",
              fontSize: "10px", fontWeight: 800,
              boxShadow: "0 2px 8px rgba(29,111,184,0.45)",
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
                background: "linear-gradient(135deg,#3b82f6,#1d6fb8)",
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

          {gallery.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Foto anterior"
                onClick={prevPhoto}
                style={{
                  position: "absolute", top: "50%", left: "6px", transform: "translateY(-50%)",
                  background: "rgba(15,23,42,0.55)", border: "none", borderRadius: "50%",
                  width: "26px", height: "26px", display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "#fff", padding: 0,
                }}
              >
                <ChevronLeft size={16} strokeWidth={2.5} />
              </button>
              <button
                type="button"
                aria-label="Foto siguiente"
                onClick={nextPhoto}
                style={{
                  position: "absolute", top: "50%", right: "6px", transform: "translateY(-50%)",
                  background: "rgba(15,23,42,0.55)", border: "none", borderRadius: "50%",
                  width: "26px", height: "26px", display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "#fff", padding: 0,
                }}
              >
                <ChevronRight size={16} strokeWidth={2.5} />
              </button>
            </>
          )}

          {gallery.length > 1 && (
            <div style={{
              position: "absolute", bottom: "8px", right: "8px",
              background: "rgba(15,23,42,0.72)",
              backdropFilter: "blur(6px)",
              color: "#fff", borderRadius: "20px", padding: "3px 8px",
              fontSize: "11px", fontWeight: 700,
              display: "flex", alignItems: "center", gap: "4px",
            }}>
              <Camera size={11} strokeWidth={2.2} />
              {photoIndex + 1}/{photo_count ?? gallery.length}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="lc-content" style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column" }}>
          <h3 className="lc-title" style={{
            fontSize: "14px", fontWeight: 600, color: "#111",
            marginBottom: "6px", lineHeight: 1.35,
            overflow: "hidden", textOverflow: "ellipsis",
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const,
          }}>
            {title}
          </h3>

          <div className="lc-price" style={{ fontSize: "16px", fontWeight: 700, color: price === 0 ? "#1d6fb8" : "#0f172a", marginBottom: "4px", letterSpacing: "-0.2px", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            {price === 0 ? "Consultar" : formatPrice(price, currency)}
            {price > 0 && priceDropPct ? <PriceDropBadge pct={priceDropPct} /> : null}
          </div>

          {hasVehicleMeta && (
            <div className="lc-meta" style={{ fontSize: "13px", color: "#555", marginBottom: "4px" }}>
              {[year, km ? `${Number(km).toLocaleString("es-AR")} Km` : null]
                .filter(Boolean).join(" | ")}
            </div>
          )}

          {(transmissionLabel || fuelLabel) && (
            <div className="lc-meta" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>
              {transmissionLabel && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
                  <Cog size={12} strokeWidth={2} />
                  {transmissionLabel}
                </span>
              )}
              {fuelLabel && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
                  <Fuel size={12} strokeWidth={2} />
                  {fuelLabel}
                </span>
              )}
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

          <div style={{ fontSize: "12px", color: "#888", marginTop: "auto" }}>
            {/* Row 1: location */}
            <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
              <PinIcon size={11} />
              <span>{locationLabel}</span>
            </div>
            {/* Row 2: views (left) + date (right) — fixed height so all cards align */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: "18px" }}>
              <div>
                {view_count != null && view_count > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: "3px", color: "#aaa" }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    <span style={{ whiteSpace: "nowrap" }}>
                      {view_count.toLocaleString("es-AR")}<span className="lc-views-label"> vistas</span>
                    </span>
                  </div>
                )}
              </div>
              <div>
                {dateLabel && (
                  dateLabel === "today" ? (
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
                      <span style={{ fontSize: "11px", whiteSpace: "nowrap" }}>{dateLabel}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
