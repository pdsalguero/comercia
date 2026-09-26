import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FavoriteButton } from "@/components/listings/FavoriteButton";
import PinIcon from "@/components/ui/PinIcon";
import { formatListingPrice, favoriteStatus } from "@/lib/listing-display";
import { listingUrl } from "@/lib/listing-url";
import { listingProvince } from "@/lib/listing-location";
import { conditionLabel, plural } from "@/lib/labels";
import { Heart, ImageOff } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Favoritos", description: "Los avisos que guardaste en CuyoRodados." };

function CardLink({ href, children }: { href: string | null; children: React.ReactNode }) {
  if (!href) return <div style={{ display: "block" }}>{children}</div>;
  return <Link href={href} style={{ textDecoration: "none", display: "block" }}>{children}</Link>;
}

function cover(listing: any): string | null {
  const imgs = listing.listing_images as { url: string; position: number }[] | null;
  if (!imgs?.length) return null;
  return [...imgs].sort((a, b) => a.position - b.position)[0]?.url ?? null;
}

export default async function FavoritesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: rows, error } = await supabase
    .from("listing_favorites")
    .select(`
      created_at,
      listings (
        id, title, price, currency, condition, city, neighborhood, attributes, status, category_id,
        listing_images (url, position)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const favorites = (rows ?? [])
    .map((r: any) => ({ ...r.listings, savedAt: r.created_at }))
    .filter((l: any) => l?.id);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <Heart size={20} color="#e11d48" fill="#e11d48" aria-hidden="true" />
            Mis favoritos
          </h1>
          <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0" }}>
            {favorites.length > 0
              ? plural(favorites.length, "aviso guardado", "avisos guardados")
              : "Todavía no guardaste ningún aviso"}
          </p>
        </div>
        {favorites.length > 0 && (
          <Link href="/category/vehicles" style={{ textDecoration: "none" }}>
            <button style={{
              background: "#1d6fb8", color: "#fff", border: "none",
              borderRadius: "8px", padding: "8px 16px",
              fontWeight: 700, fontSize: "13px", cursor: "pointer",
            }}>
              Explorar más
            </button>
          </Link>
        )}
      </div>

      {/* Empty state */}
      {favorites.length === 0 && (
        <div style={{
          background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0",
          padding: "64px 24px", textAlign: "center",
        }}>
          <div style={{ marginBottom: "12px", display: "flex", justifyContent: "center", color: "#cbd5e1" }}>
            <Heart size={48} strokeWidth={1.5} aria-hidden="true" />
          </div>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>
            No tenés favoritos todavía
          </div>
          <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "24px", maxWidth: "320px", margin: "0 auto 24px" }}>
            Guardá avisos que te interesan tocando el corazón en cualquier publicación.
          </p>
          <Link href="/category/vehicles">
            <button style={{
              background: "#1d6fb8", color: "#fff", border: "none",
              borderRadius: "8px", padding: "12px 28px",
              fontWeight: 700, fontSize: "14px", cursor: "pointer",
            }}>
              Explorar avisos
            </button>
          </Link>
        </div>
      )}

      {/* Grid */}
      {favorites.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "14px",
        }}>
          {favorites.map((listing: any) => {
            const img = cover(listing);
            const status = favoriteStatus(listing);
            const isPaused = status === "paused";
            const isUnavailable = status === "unavailable";
            return (
              <div key={listing.id} style={{
                background: "#fff", borderRadius: "12px",
                border: "1px solid #e2e8f0", overflow: "hidden",
                opacity: isPaused || isUnavailable ? 0.65 : 1,
                position: "relative",
              }}>
                {/* Image */}
                {/* Un aviso no disponible (vendido, vencido o de otra categoría) no lleva a ningún lado:
                    solo queda la opción de quitarlo de favoritos. */}
                <CardLink href={isUnavailable ? null : listingUrl(listing.id, listing.title)}>
                  <div style={{ height: "170px", background: "#f1f5f9", position: "relative", overflow: "hidden" }}>
                    {img
                      ? <img src={img} alt={listing.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}><ImageOff size={36} aria-hidden="true" /></div>
                    }
                    {(isPaused || isUnavailable) && (
                      <div style={{
                        position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <span style={{ background: "#1e293b", color: "#fff", borderRadius: "6px", padding: "4px 10px", fontSize: "12px", fontWeight: 700 }}>
                          {isUnavailable ? "No disponible" : "Aviso pausado"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ padding: "12px 14px 8px" }}>
                    <div style={{
                      fontSize: "13px", fontWeight: 600, color: "#1e293b",
                      marginBottom: "4px", lineHeight: 1.35,
                      overflow: "hidden", textOverflow: "ellipsis",
                      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const,
                    }}>
                      {listing.title}
                    </div>
                    <div style={{ fontSize: "17px", fontWeight: 800, color: isUnavailable ? "#94a3b8" : "#f97316", marginBottom: "2px" }}>
                      {isUnavailable ? "No disponible" : formatListingPrice(listing.price, listing.currency)}
                    </div>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                      {listing.condition && (
                        <span style={{ fontSize: "12px", color: "#22c55e", fontWeight: 600 }}>
                          {conditionLabel(listing.condition)}
                        </span>
                      )}
                      {listingProvince(listing) && (
                        <span style={{ fontSize: "12px", color: "#94a3b8", display: "inline-flex", alignItems: "center", gap: "3px" }}><PinIcon size={10} /> {listingProvince(listing)}</span>
                      )}
                    </div>
                  </div>
                </CardLink>

                {/* Favorite toggle (removes from list) */}
                <div style={{ padding: "0 14px 12px" }}>
                  <FavoriteButton listingId={listing.id} variant="detail" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "12px 16px", fontSize: "13px", color: "#dc2626" }}>
          Error al cargar favoritos. Asegurate de haber ejecutado la migración SQL.
        </div>
      )}
    </div>
  );
}
