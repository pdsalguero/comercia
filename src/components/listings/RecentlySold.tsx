import Link from "next/link";
import { ImageOff } from "lucide-react";
import { storageImg } from "@/lib/storage-image";
import { listingUrl } from "@/lib/listing-url";
import { soldMonthLabel } from "@/lib/labels";

export interface SoldItem {
  id: string;
  title: string;
  price: number | null;
  currency: string | null;
  neighborhood: string | null;
  attributes: Record<string, unknown> | null;
  sold_at: string | null;
  cover_image: string | null;
}

/**
 * "Vendidos recientemente" (home): avisos reales que el vendedor marcó como vendidos en los últimos
 * 6 meses, con su último precio publicado. Sirven de referencia de precios. No dice "vendidos en
 * CuyoRodados": puede haber ventas hechas por fuera del sitio, y cada tarjeta muestra la fecha real.
 */
export function RecentlySold({ items }: { items: SoldItem[] }) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="recently-sold-title">
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "8px", marginBottom: "10px", flexWrap: "wrap" }}>
        <h2 id="recently-sold-title" className="home-section-title" style={{ margin: 0 }}>Vendidos recientemente</h2>
        <span style={{ fontSize: "13px", color: "#64748b" }}>Último precio publicado de vehículos que ya se vendieron</span>
      </div>
      <div className="recently-sold-row" style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "6px", scrollbarWidth: "thin" }}>
        {items.map((l) => {
          const a = l.attributes ?? {};
          const km = a.km ?? a.mileage;
          const specs = [a.year, km != null && km !== "" ? `${Number(km).toLocaleString("es-AR")} km` : null].filter(Boolean).join(" · ");
          const price = l.price ? `${l.currency === "USD" ? "US$" : "$"} ${Number(l.price).toLocaleString("es-AR")}` : null;
          return (
            <Link
              key={l.id}
              href={listingUrl(l.id, l.title)}
              style={{
                flex: "0 0 200px", background: "#fff", borderRadius: "12px", overflow: "hidden",
                border: "1px solid #e2e8f0", textDecoration: "none", color: "inherit",
                display: "flex", flexDirection: "column",
              }}
            >
              <div style={{ position: "relative", height: "130px", background: "#f1f5f9" }}>
                {l.cover_image
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={storageImg(l.cover_image, 400, 70, 260, "cover")} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(40%)" }} />
                  : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}><ImageOff size={28} aria-hidden="true" /></div>}
                <span style={{
                  position: "absolute", top: "8px", left: "8px",
                  background: "#334155", color: "#fff", fontSize: "12px", fontWeight: 800,
                  letterSpacing: "0.6px", borderRadius: "6px", padding: "2px 8px",
                }}>
                  VENDIDO
                </span>
              </div>
              <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: "3px" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
                  {l.title}
                </div>
                {specs && <div style={{ fontSize: "12px", color: "#475569" }}>{specs}</div>}
                {price && <div style={{ fontSize: "15px", fontWeight: 800, color: "#475569" }}>{price}</div>}
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>{soldMonthLabel(l.sold_at)}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
