"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, Gauge, Cog, Fuel, Camera, ChevronLeft, ChevronRight, Clock, Eye, ArrowUp } from "lucide-react";
import PinIcon from "@/components/ui/PinIcon";
import { FavoriteButton } from "./FavoriteButton";
import { PriceDropBadge } from "./PriceDropBadge";
import { SaleTermsBadges } from "./SaleTermsBadges";
import { storageImg, fallbackToOriginal } from "@/lib/storage-image";
import { listingUrl } from "@/lib/listing-url";
import { listingProvince } from "@/lib/listing-location";
import type { BreadcrumbChip } from "@/lib/listing-breadcrumbs";
import { CONDITION_LABELS as BASE_CONDITION_LABELS, fuelLabel as toFuelLabel, transmissionLabel as toTransmissionLabel, plural, timeAgo } from "@/lib/labels";

export interface ListingListCardProps {
  id: string;
  title: string;
  price: number | null;
  currency: string | null;
  featured_level: string | null;
  cover_image: string | null;
  condition: string | null;
  /** Provincia (avisos nuevos); junto con neighborhood y attributes.zone se resuelve la provincia a mostrar */
  city?: string | null;
  neighborhood: string | null;
  view_count?: number | null;
  created_at?: string | null;
  bumped_at?: string | null;
  /** Optional attribute chips shown below the title (e.g. sub-category, brand, model) */
  breadcrumbs?: BreadcrumbChip[];
  is_store?: boolean | null;
  store_name?: string | null;
  showDivider?: boolean;
  /** Año/km/combustible/transmisión */
  attributes?: Record<string, string | number | boolean | null> | null;
  /** Texto del aviso — se recorta a 2 líneas */
  description?: string | null;
  /** Total de fotos — muestra un contador sobre la miniatura cuando hay más de una */
  photo_count?: number | null;
  /** Todas las fotos del aviso, en orden — si hay más de una se pueden navegar con flechas
      sobre la miniatura sin salir de la tarjeta. Si no se pasa, se usa solo cover_image. */
  photos?: string[] | null;
  /** Link de wa.me ya armado (o null si el vendedor no tiene WhatsApp cargado / lo ocultó) */
  whatsappUrl?: string | null;
  /** Porcentaje de la última baja de precio, si fue reciente (ver lib/price-drops.ts). */
  priceDropPct?: number | null;
}

const CONDITION_LABELS: Record<string, string> = { ...BASE_CONDITION_LABELS, used: "Usado" };

const FEATURED_BADGE: Record<string, { label: string; bg: string; fg: string }> = {
  gold: { label: "👑 Premium", bg: "linear-gradient(135deg,#eab308,#fde047)", fg: "#713f12" },
  silver: { label: "🚀 Destacado", bg: "linear-gradient(135deg,#1d6fb8,#4d94d1)", fg: "#fff" },
  bronze: { label: "⭐ Esencial", bg: "linear-gradient(135deg,#c2410c,#ea580c)", fg: "#fff" },
};

function WhatsAppIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L0 24l6.335-1.512A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.8 9.8 0 01-5.003-1.367l-.36-.214-3.732.891.935-3.618-.235-.373A9.787 9.787 0 012.182 12C2.182 6.579 6.579 2.182 12 2.182c5.42 0 9.818 4.397 9.818 9.818 0 5.42-4.398 9.818-9.818 9.818z"/>
    </svg>
  );
}

export function ListingListCard({
  id,
  title,
  price,
  currency,
  featured_level,
  cover_image,
  condition,
  city,
  neighborhood,
  view_count,
  created_at,
  bumped_at,
  breadcrumbs,
  is_store,
  store_name,
  showDivider = true,
  attributes,
  description,
  photo_count,
  whatsappUrl,
  photos,
  priceDropPct,
}: ListingListCardProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const router = useRouter();
  const gallery = photos && photos.length > 0 ? photos : cover_image ? [cover_image] : [];
  const [photoIndex, setPhotoIndex] = useState(0);
  const activePhoto = gallery[photoIndex] ?? null;
  const prevPhoto = (e: React.MouseEvent) => { e.stopPropagation(); e.preventDefault(); setPhotoIndex((i) => (i - 1 + gallery.length) % gallery.length); };
  const nextPhoto = (e: React.MouseEvent) => { e.stopPropagation(); e.preventDefault(); setPhotoIndex((i) => (i + 1) % gallery.length); };
  const priceStr =
    price && price > 0
      ? `${currency === "USD" ? "U$S" : "$"} ${price.toLocaleString("es-AR")}`
      : null;

  const isVehicle = !!attributes?.sub_category;
  const year = isVehicle ? attributes?.year : null;
  const km = isVehicle ? (attributes?.mileage ?? attributes?.km) : null;
  const fuelLabel = isVehicle ? toFuelLabel(attributes?.fuel) || undefined : undefined;
  const transmissionLabel = isVehicle ? toTransmissionLabel(attributes?.transmission) || undefined : undefined;
  const hasSpecs = !!(year || km != null || fuelLabel || transmissionLabel);
  const badge = featured_level ? FEATURED_BADGE[featured_level] : null;
  // En listados solo la provincia (la localidad se ve en la ficha)
  const province = listingProvince({ city, neighborhood, attributes });

  // La fila no puede ser un único <a>: los chips (tipo/marca/modelo) y WhatsApp son sus propios links
  // y un <a> no puede anidar otro. Por eso la foto y el título son <Link> reales (se abren en otra
  // pestaña y Google los rastrea) y el click en el resto de la fila navega igual por JS.
  const href = listingUrl(id, title);
  return (
      <div
        className={`listing-list-card${badge ? ` llc-lvl-${featured_level}` : ""}`}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a, button")) return; // ya navega/actúa ese elemento
          router.push(href);
        }}
        style={{
          display: "flex",
          gap: "18px",
          padding: "16px",
          borderBottom: showDivider ? "1px solid #f1f5f9" : "none",
          background: "#ffffff",
          transition: "background 0.15s",
          cursor: "pointer",
          position: "relative",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
      >
        {/* Image — sin height fijo: estira para llenar el alto de la fila (el contenido de la
            derecha varía: con chips/descripción es más alto que sin ellos) y así no deja
            espacio en blanco debajo. minHeight evita que quede muy chata en filas cortas. */}
        <div className="llc-img" style={{
          width: "220px",
          minHeight: "165px",
          alignSelf: "stretch",
          borderRadius: "8px",
          overflow: "hidden",
          flexShrink: 0,
          background: "#f0f4ff",
          position: "relative",
        }}>
          {/* Link duplicado del título: fuera del orden de tabulación para no repetir el foco */}
          <Link href={href} tabIndex={-1} style={{ display: "block", width: "100%", height: "100%" }}>
            {activePhoto
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={storageImg(activePhoto, 460, 75, 340, "cover")} onError={fallbackToOriginal(activePhoto)} alt={gallery.length > 1 ? `${title} – foto ${photoIndex + 1} de ${gallery.length}` : title} loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>📦</div>
            }
          </Link>

          {badge && (
            <div className="llc-badge" style={{
              position: "absolute", top: "8px", left: "8px",
              background: badge.bg, color: badge.fg,
              borderRadius: "20px", padding: "2px 8px",
              fontSize: "12px", fontWeight: 800, whiteSpace: "nowrap",
            }}>
              {/* "👑 Premium": en celular solo se ve el ícono (la foto es chica); el texto queda para lectores */}
              <span aria-hidden="true">{badge.label.split(" ")[0]}</span>
              <span className="llc-badge-text"> {badge.label.split(" ").slice(1).join(" ")}</span>
            </div>
          )}

          <FavoriteButton listingId={id} variant="card" />

          {/* Flechas de navegación — solo si hay más de una foto. stopPropagation para no
              disparar la navegación al aviso (la tarjeta entera es clickeable). */}
          {gallery.length > 1 && (
            <>
              <button
                type="button"
                className="tap-44"
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
                className="tap-44"
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
            <div className="llc-count" style={{
              position: "absolute", bottom: "8px", right: "8px",
              background: "rgba(15,23,42,0.72)", color: "#fff",
              borderRadius: "20px", padding: "3px 8px",
              fontSize: "12px", fontWeight: 700,
              display: "flex", alignItems: "center", gap: "4px",
            }}>
              <Camera size={11} strokeWidth={2.2} />
              {photoIndex + 1}/{photo_count ?? gallery.length}
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
          {/* Price */}
          <div className="llc-price" style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            {priceStr
              ? <span style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a" }}>{priceStr}</span>
              : <span style={{ fontSize: "16px", fontWeight: 700, color: "#1d6fb8" }}>A consultar</span>
            }
            {priceStr && priceDropPct ? <PriceDropBadge pct={priceDropPct} size="md" /> : null}
            {isVehicle && <SaleTermsBadges attributes={attributes} />}
          </div>

          {/* Title */}
          <Link href={href} className="llc-title-link" style={{
            fontSize: "14.5px", fontWeight: 700, color: "#0f172a", lineHeight: 1.3, textDecoration: "none",
            overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box",
            WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const,
          }}>
            {title}
          </Link>

          {/* Tienda oficial */}
          {is_store && (
            <div style={{ fontSize: "12px", color: "#3b82f6", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l1-5h16l1 5"/><path d="M3 9a2 2 0 0 0 2 2 2 2 0 0 0 2-2 2 2 0 0 0 2 2 2 2 0 0 0 2-2 2 2 0 0 0 2 2 2 2 0 0 0 2-2"/>
                <path d="M5 11v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9"/>
              </svg>
              {store_name ?? "Tienda oficial"}
            </div>
          )}

          {/* Celular: año · km en una línea (reemplaza a la fila de specs con íconos, que ahí se oculta) */}
          {isVehicle && (year != null || km != null) && (
            <div className="llc-mspecs" style={{ fontSize: "13px", color: "#334155", fontWeight: 600 }}>
              {[year, km != null ? `${Number(km).toLocaleString("es-AR")} km` : null].filter((v) => v != null && v !== "").join(" · ")}
            </div>
          )}

          {/* Breadcrumb chips — si traen href, filtran por ese valor al hacer click. En celular se
              ocultan: repiten lo que ya dice el título y hacen la tarjeta el doble de alta. */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div className="llc-chips" style={{ display: "flex", gap: "4px", alignItems: "center", flexWrap: "wrap" }}>
              {breadcrumbs.map((chip, i) => {
                const chipStyle: React.CSSProperties = {
                  fontSize: "12px",
                  fontWeight: 600,
                  borderRadius: "4px",
                  padding: "1px 6px",
                  textDecoration: "none",
                  ...(chip.variant === "primary"
                    ? { color: "#1d6fb8", background: "#e8f1fa" }
                    : { color: "#475569", background: "#f1f5f9" }),
                };
                return chip.href ? (
                  <Link
                    key={i}
                    href={chip.href}
                    // Frena la propagación para que no dispare también la navegación al aviso (la fila entera es clickeable).
                    onClick={(e) => e.stopPropagation()}
                    style={chipStyle}
                    className="llc-chip-link"
                  >
                    {chip.label}
                  </Link>
                ) : (
                  <span key={i} style={chipStyle}>
                    {chip.label}
                  </span>
                );
              })}
            </div>
          )}

          {/* Condition + Location */}
          <div className="llc-loc" style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            {condition && CONDITION_LABELS[condition] && (
              <span style={{ fontSize: "12px", color: "#22c55e", fontWeight: 600 }}>
                {CONDITION_LABELS[condition]}
              </span>
            )}
            {province && (
              <span style={{ fontSize: "12px", color: "#64748b", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <PinIcon size={11} /> {province}
              </span>
            )}
          </div>

          {/* Specs: año, km, transmisión, combustible — una sola fila entre dos separadores */}
          {hasSpecs && (
            <div className="llc-specs" style={{
              display: "flex", alignItems: "center", flexWrap: "wrap", gap: "16px",
              fontSize: "12.5px", color: "#475569",
              padding: "8px 0", borderTop: "1px solid #f1f5f9", borderBottom: "1px solid #f1f5f9",
            }}>
              {year != null && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", whiteSpace: "nowrap" }}>
                  <Calendar size={13} strokeWidth={2} color="#94a3b8" /> {year}
                </span>
              )}
              {km != null && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", whiteSpace: "nowrap" }}>
                  <Gauge size={13} strokeWidth={2} color="#94a3b8" /> {Number(km).toLocaleString("es-AR")} km
                </span>
              )}
              {transmissionLabel && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", whiteSpace: "nowrap" }}>
                  <Cog size={13} strokeWidth={2} color="#94a3b8" /> {transmissionLabel}
                </span>
              )}
              {fuelLabel && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", whiteSpace: "nowrap" }}>
                  <Fuel size={13} strokeWidth={2} color="#94a3b8" /> {fuelLabel}
                </span>
              )}
            </div>
          )}

          {/* Descripción — 2 líneas (en celular se oculta, ver .llc-desc) */}
          {description && (
            <div className="llc-desc" style={{
              fontSize: "12.5px", color: "#94a3b8", lineHeight: 1.45,
              overflow: "hidden", display: "-webkit-box",
              WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const,
            }}>
              {description}
            </div>
          )}

          {/* Footer: fecha/vistas a la izquierda (se oculta en celular, ver .llc-meta), WhatsApp
              a la derecha. En celular WhatsApp queda como ícono redondo en la esquina de la tarjeta
              (.llc-wa) para no ocupar una fila propia. */}
          <div className="llc-footer" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: "2px", gap: "10px" }}>
            <div className="llc-meta" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {mounted && created_at && (() => {
                const hasBump = bumped_at && new Date(bumped_at).getTime() - new Date(created_at).getTime() > 3600 * 1000;
                return hasBump ? (
                  <>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "12px", color: "#cbd5e1" }}>
                      <Clock size={11} strokeWidth={2} /> {timeAgo(created_at)}
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "12px", color: "#94a3b8" }}>
                      <ArrowUp size={11} strokeWidth={2.2} /> act. {timeAgo(bumped_at!)}
                    </span>
                  </>
                ) : (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "12px", color: "#cbd5e1" }}>
                    <Clock size={11} strokeWidth={2} /> {timeAgo(created_at)}
                  </span>
                );
              })()}
              {view_count != null && view_count > 0 && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "12px", color: "#cbd5e1" }}>
                  <Eye size={11} strokeWidth={2} /> {plural(view_count, "vista", "vistas")}
                </span>
              )}
            </div>

            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="llc-wa"
                aria-label={`Consultar por WhatsApp: ${title}`}
                style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px",
                  background: "#25d366", color: "#fff", fontSize: "12.5px", fontWeight: 700,
                  padding: "8px 14px", borderRadius: "8px", textDecoration: "none",
                  boxShadow: "0 2px 8px rgba(37,211,102,.3)", flexShrink: 0, marginLeft: "auto",
                }}
              >
                <WhatsAppIcon /> <span className="llc-wa-text">WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      </div>
  );
}
