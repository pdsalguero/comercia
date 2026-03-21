"use client";
import { useState } from "react";
import Link from "next/link";
import PinIcon from "@/components/ui/PinIcon";

type Listing = {
  id: string;
  title: string;
  price: number;
  currency: string;
  condition: string;
  neighborhood: string;
  created_at?: string | null;
  view_count?: number | null;
  listing_images?: { url: string; position: number }[];
  categories?: { name: string; slug: string } | null;
  is_store?: boolean | null;
  store_name?: string | null;
};

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "hace un momento";
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
  const days = Math.floor(diff / 86400);
  if (days < 30) return `hace ${days} días`;
  const months = Math.floor(days / 30);
  if (months < 12) return `hace ${months} meses`;
  return `hace ${Math.floor(months / 12)} años`;
}

function cover(listing: Listing): string | null {
  const imgs = listing.listing_images;
  if (!imgs?.length) return null;
  return [...imgs].sort((a, b) => a.position - b.position)[0]?.url ?? null;
}

function conditionLabel(c: string) {
  if (c === "new") return "Nuevo";
  if (c === "like_new") return "Como nuevo";
  return "Usado";
}

export function RecentListings({ items }: { items: Listing[] }) {
  const [view, setView] = useState<"grid" | "list">("grid");

  return (
    <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid #f1f5f9" }}>
        <span style={{ fontWeight: 800, fontSize: "14px", color: "#0f172a" }}>🕐 Últimos avisos</span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Toggle buttons */}
          <div style={{ display: "flex", border: "1.5px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
            <button
              onClick={() => setView("grid")}
              title="Ver en grilla"
              style={{
                border: "none", padding: "5px 8px", cursor: "pointer",
                background: view === "grid" ? "#6366f1" : "#fff",
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
                background: view === "list" ? "#6366f1" : "#fff",
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
          <Link href="/listings" style={{ fontSize: "12px", color: "#6366f1", textDecoration: "none", fontWeight: 600 }}>
            Ver todos →
          </Link>
        </div>
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 24px", color: "#94a3b8" }}>
          <div style={{ fontSize: "36px", marginBottom: "8px" }}>📭</div>
          <div style={{ fontWeight: 700, fontSize: "15px", color: "#0f172a", marginBottom: "4px" }}>Todavía no hay avisos</div>
          <div style={{ fontSize: "13px", marginBottom: "14px" }}>¡Sé el primero en vender en ComerxIA!</div>
          <Link href="/listings/new">
            <button style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 24px", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>
              Publicar el primer aviso
            </button>
          </Link>
        </div>
      ) : view === "grid" ? (
        <div className="grid-cols-4" style={{ padding: "14px" }}>
          {items.map((l) => {
            const img = cover(l);
            return (
              <Link key={l.id} href={`/listings/${l.id}`} style={{ textDecoration: "none" }}>
                <div style={{
                  border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden",
                  background: "#fafafa", cursor: "pointer",
                  transition: "box-shadow 0.15s",
                }}
                className="hover:shadow-md"
                >
                  {/* Image */}
                  <div style={{ height: "120px", background: "#f0f4ff", position: "relative" }}>
                    {img
                      ? <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                      : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>📦</div>
                    }
                    {l.is_store && (
                      <div style={{
                        position: "absolute", bottom: "6px", left: "6px",
                        background: "rgba(255,255,255,0.92)",
                        backdropFilter: "blur(6px)",
                        color: "#0f172a", borderRadius: "20px", padding: "2px 7px 2px 5px",
                        fontSize: "10px", fontWeight: 700,
                        display: "flex", alignItems: "center", gap: "4px",
                        boxShadow: "0 1px 6px rgba(0,0,0,0.18)",
                      }}>
                        <span style={{
                          width: "15px", height: "15px", borderRadius: "50%",
                          background: "linear-gradient(135deg,#3b82f6,#6366f1)",
                          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}>
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9l1-5h16l1 5"/><path d="M3 9a2 2 0 0 0 2 2 2 2 0 0 0 2-2 2 2 0 0 0 2 2 2 2 0 0 0 2-2 2 2 0 0 0 2 2 2 2 0 0 0 2-2"/>
                            <path d="M5 11v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9"/>
                          </svg>
                        </span>
                        {l.store_name ?? "Tienda oficial"}
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div style={{ padding: "8px 10px" }}>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "#1e293b", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {l.title}
                    </div>
                    {l.categories?.name && (
                      <div style={{ fontSize: "10px", color: "#6366f1", fontWeight: 600, marginBottom: "4px" }}>
                        {l.categories.name}
                      </div>
                    )}
                    <div style={{ fontSize: "13px", fontWeight: 800, color: l.price === 0 ? "#94a3b8" : "#f97316", marginBottom: "4px" }}>
                      {l.price === 0 ? "Consultar" : `${l.currency === "USD" ? "U$S" : "$"}${l.price?.toLocaleString("es-AR")}`}
                    </div>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                      {l.condition && (
                        <span style={{ fontSize: "10px", color: "#22c55e", fontWeight: 600 }}>
                          {conditionLabel(l.condition)}
                        </span>
                      )}
                      {l.neighborhood && (() => { const nb = l.neighborhood; const loc = nb.includes(",") ? nb.split(",").pop()!.trim() : nb; return (
                        <span style={{ fontSize: "10px", color: "#94a3b8", display: "inline-flex", alignItems: "center", gap: "3px" }}><PinIcon size={9} /> {loc}</span>
                      ); })()}
                    </div>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center", marginTop: "2px" }}>
                      {(l.view_count ?? 0) > 0 && (
                        <span style={{ fontSize: "10px", color: "#bbb", display: "inline-flex", alignItems: "center", gap: "2px" }}>
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          {l.view_count}
                        </span>
                      )}
                      {l.created_at && (
                        <span style={{ fontSize: "10px", color: "#bbb" }}>{timeAgo(l.created_at)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        items.map((l, i) => {
          const img = cover(l);
          return (
            <Link key={l.id} href={`/listings/${l.id}`} style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "10px 16px",
                borderBottom: i < items.length - 1 ? "1px solid #f8fafc" : "none",
              }}
              className="hover:bg-slate-50"
              >
                <div style={{ width: "52px", height: "52px", borderRadius: "8px", overflow: "hidden", flexShrink: 0, background: "#f0f4ff", position: "relative" }}>
                  {img
                    ? <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>📦</div>
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b", marginBottom: "1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {l.title}
                  </div>
                  {l.is_store && (
                    <div style={{ fontSize: "10px", color: "#3b82f6", fontWeight: 700, marginBottom: "1px", display: "flex", alignItems: "center", gap: "3px" }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l1-5h16l1 5"/><path d="M3 9a2 2 0 0 0 2 2 2 2 0 0 0 2-2 2 2 0 0 0 2 2 2 2 0 0 0 2-2 2 2 0 0 0 2 2 2 2 0 0 0 2-2"/>
                        <path d="M5 11v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9"/>
                      </svg>
                      {l.store_name ?? "Tienda oficial"}
                    </div>
                  )}
                  {l.categories?.name && (
                    <div style={{ fontSize: "11px", color: "#6366f1", fontWeight: 600, marginBottom: "2px" }}>
                      {l.categories.name}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    {l.condition && (
                      <span style={{ fontSize: "11px", color: "#22c55e", fontWeight: 600 }}>
                        {conditionLabel(l.condition)}
                      </span>
                    )}
                    {l.neighborhood && (() => { const nb = l.neighborhood; const loc = nb.includes(",") ? nb.split(",").pop()!.trim() : nb; return <span style={{ fontSize: "11px", color: "#94a3b8", display: "inline-flex", alignItems: "center", gap: "3px" }}><PinIcon size={10} /> {loc}</span>; })()}
                    {(l.view_count ?? 0) > 0 && (
                      <span style={{ fontSize: "10px", color: "#bbb", display: "inline-flex", alignItems: "center", gap: "2px" }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        {l.view_count}
                      </span>
                    )}
                    {l.created_at && (
                      <span style={{ fontSize: "10px", color: "#bbb" }}>{timeAgo(l.created_at)}</span>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: "14px", fontWeight: 800, color: l.price === 0 ? "#94a3b8" : "#f97316", flexShrink: 0 }}>
                  {l.price === 0 ? "Consultar" : `${l.currency === "USD" ? "U$S" : "$"}${l.price?.toLocaleString("es-AR")}`}
                </div>
              </div>
            </Link>
          );
        })
      )}
    </div>
  );
}
