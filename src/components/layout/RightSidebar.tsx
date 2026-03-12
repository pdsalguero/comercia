import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PinIcon from "@/components/ui/PinIcon";

async function getNearbyListing() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select("id, title, price, currency, condition, neighborhood, listing_images(url, position)")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  if (!data) return null;
  const imgs = data.listing_images as { url: string; position: number }[] | null;
  const cover = imgs?.slice().sort((a, b) => a.position - b.position)[0]?.url ?? null;
  return { ...data, cover };
}

export async function RightSidebar({ showPublicar = true }: { showPublicar?: boolean }) {
  const nearby = await getNearbyListing();

  return (
    <aside style={{ display: "flex", flexDirection: "column", gap: "14px", width: "240px", flexShrink: 0 }}>

      {/* Publicar con IA — solo en páginas sin hero */}
      {showPublicar && (
        <div style={{
          background: "linear-gradient(160deg, #1e1b4b 0%, #312e81 60%, #4c1d95 100%)",
          borderRadius: "14px", padding: "20px 16px",
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: "10px", position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", width: "100px", height: "100px", background: "rgba(249,115,22,0.2)", borderRadius: "50%", top: "-30px", right: "-20px", filter: "blur(35px)" }} />
          <div style={{ fontSize: "36px", lineHeight: 1 }}>📸</div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "15px", fontWeight: 900, color: "#fff", marginBottom: "4px" }}>Publicá con IA</div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>
              Sacá una foto de tu producto<br />y generamos todo el aviso<br />automáticamente
            </div>
          </div>
          <Link href="/listings/new" style={{ width: "100%" }}>
            <button style={{
              width: "100%", background: "linear-gradient(135deg,#f97316,#fb923c)",
              color: "#fff", border: "none", borderRadius: "9px",
              padding: "11px 0", fontWeight: 800, fontSize: "13px",
              cursor: "pointer", boxShadow: "0 4px 14px rgba(249,115,22,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            }}>
              📸 Subir foto
            </button>
          </Link>
          <div style={{ display: "flex", gap: "10px" }}>
            {["✓ Gratis", "✓ 30 seg."].map(t => (
              <span key={t} style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>{t}</span>
            ))}
          </div>
        </div>
      )}

      {/* Destacá tu aviso */}
      <div style={{
        background: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0",
        padding: "18px 16px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
          <span style={{ fontSize: "22px", lineHeight: 1 }}>✦</span>
          <span style={{ fontSize: "15px", fontWeight: 900, color: "#1e293b" }}>Destacá tu aviso</span>
        </div>
        <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 14px", lineHeight: 1.6 }}>
          Aparecé primero y recibí hasta <strong style={{ color: "#1e293b" }}>5×</strong> más consultas
        </p>
        <Link href="/upgrade" style={{ width: "100%", textDecoration: "none" }}>
          <button style={{
            width: "100%", background: "linear-gradient(135deg,#f59e0b,#fbbf24)",
            color: "#fff", border: "none", borderRadius: "10px",
            padding: "12px", fontWeight: 800, fontSize: "14px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            boxShadow: "0 4px 14px rgba(245,158,11,0.35)",
          }}>
            <span style={{ fontSize: "16px" }}>🎟️</span> Ver planes
          </button>
        </Link>
      </div>

      {/* Cerca de vos */}
      {nearby && (
        <div style={{
          background: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}>
          <div style={{ padding: "12px 14px 10px", display: "flex", alignItems: "center", gap: "6px", borderBottom: "1px solid #f1f5f9" }}>
            <PinIcon size={14} />
            <span style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b" }}>Cerca de vos</span>
          </div>
          <Link href={`/listings/${nearby.id}`} style={{ textDecoration: "none" }}>
            <div>
              {nearby.cover && (
                <img src={nearby.cover} alt="" style={{ width: "100%", height: "130px", objectFit: "cover", display: "block" }} />
              )}
              <div style={{ padding: "10px 14px 14px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b", marginBottom: "4px", lineHeight: 1.3,
                  display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {nearby.title}
                </div>
                <div style={{ fontSize: "13px", fontWeight: 800, color: "#f97316", marginBottom: "2px" }}>
                  {nearby.currency === "USD" ? "U$S" : "$"}{nearby.price?.toLocaleString("es-AR")}
                </div>
                {nearby.condition && (
                  <div style={{ fontSize: "11px", color: "#94a3b8" }}>{nearby.condition}</div>
                )}
                {nearby.neighborhood && (
                  <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px", display: "flex", alignItems: "center", gap: "3px" }}><PinIcon size={10} /> {nearby.neighborhood}</div>
                )}
              </div>
            </div>
          </Link>
        </div>
      )}
    </aside>
  );
}
