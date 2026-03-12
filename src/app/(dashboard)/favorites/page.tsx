import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FavoriteButton } from "@/components/listings/FavoriteButton";
import PinIcon from "@/components/ui/PinIcon";

function formatPrice(price: number, currency = "ARS") {
  if (currency === "USD") return `U$S ${price.toLocaleString("es-AR")}`;
  return `$ ${price.toLocaleString("es-AR")}`;
}

function cover(listing: any): string | null {
  const imgs = listing.listing_images as { url: string; position: number }[] | null;
  if (!imgs?.length) return null;
  return [...imgs].sort((a, b) => a.position - b.position)[0]?.url ?? null;
}

const CONDITION_LABELS: Record<string, string> = {
  new: "Nuevo", like_new: "Como nuevo", very_good: "Muy bueno",
  good: "Bueno", fair: "Regular",
};

export default async function FavoritesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: rows, error } = await supabase
    .from("listing_favorites")
    .select(`
      created_at,
      listings (
        id, title, price, currency, condition, neighborhood, status,
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
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
            ❤️ Mis favoritos
          </h1>
          <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0" }}>
            {favorites.length > 0
              ? `${favorites.length} aviso${favorites.length !== 1 ? "s" : ""} guardado${favorites.length !== 1 ? "s" : ""}`
              : "Todavía no guardaste ningún aviso"}
          </p>
        </div>
        {favorites.length > 0 && (
          <Link href="/listings" style={{ textDecoration: "none" }}>
            <button style={{
              background: "#6366f1", color: "#fff", border: "none",
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
          <div style={{ fontSize: "52px", marginBottom: "12px" }}>🤍</div>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>
            No tenés favoritos todavía
          </div>
          <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "24px", maxWidth: "320px", margin: "0 auto 24px" }}>
            Guardá avisos que te interesan tocando el ❤️ en cualquier publicación.
          </p>
          <Link href="/listings">
            <button style={{
              background: "#6366f1", color: "#fff", border: "none",
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
            const isPaused = listing.status === "paused";
            return (
              <div key={listing.id} style={{
                background: "#fff", borderRadius: "12px",
                border: "1px solid #e2e8f0", overflow: "hidden",
                opacity: isPaused ? 0.65 : 1,
                position: "relative",
              }}>
                {/* Image */}
                <Link href={`/listings/${listing.id}`} style={{ textDecoration: "none", display: "block" }}>
                  <div style={{ height: "170px", background: "#f1f5f9", position: "relative", overflow: "hidden" }}>
                    {img
                      ? <img src={img} alt={listing.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px" }}>📦</div>
                    }
                    {isPaused && (
                      <div style={{
                        position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <span style={{ background: "#1e293b", color: "#fff", borderRadius: "6px", padding: "4px 10px", fontSize: "11px", fontWeight: 700 }}>
                          Aviso pausado
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
                    <div style={{ fontSize: "17px", fontWeight: 800, color: "#f97316", marginBottom: "2px" }}>
                      {formatPrice(listing.price, listing.currency)}
                    </div>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                      {listing.condition && (
                        <span style={{ fontSize: "11px", color: "#22c55e", fontWeight: 600 }}>
                          {CONDITION_LABELS[listing.condition] ?? listing.condition}
                        </span>
                      )}
                      {listing.neighborhood && (
                        <span style={{ fontSize: "11px", color: "#94a3b8", display: "inline-flex", alignItems: "center", gap: "3px" }}><PinIcon size={10} /> {listing.neighborhood}</span>
                      )}
                    </div>
                  </div>
                </Link>

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
