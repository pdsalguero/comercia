"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface Store {
  id: string;
  store_name: string | null;
  store_slug: string | null;
  store_logo_url: string | null;
  store_banner_url: string | null;
  store_verified: boolean | null;
  store_description: string | null;
  listing_count: number;
  main_cat_label: string | null;
}

const CAT_COLORS: Record<string, string> = {
  vehicles: "linear-gradient(135deg,#1e3a5f,#3b82f6)",
  "real-estate": "linear-gradient(135deg,#14532d,#22c55e)",
  phones: "linear-gradient(135deg,#1e1b4b,#6366f1)",
  electronics: "linear-gradient(135deg,#0f172a,#334155)",
  appliances: "linear-gradient(135deg,#1c1917,#78716c)",
  clothing: "linear-gradient(135deg,#4a044e,#ec4899)",
  "home-garden": "linear-gradient(135deg,#3f2b0f,#d97706)",
  sports: "linear-gradient(135deg,#052e16,#16a34a)",
  tools: "linear-gradient(135deg,#1c1917,#b45309)",
  books: "linear-gradient(135deg,#1e3a5f,#0284c7)",
  pets: "linear-gradient(135deg,#431407,#ea580c)",
  "beauty-health": "linear-gradient(135deg,#500724,#f43f5e)",
  toys: "linear-gradient(135deg,#1e1b4b,#8b5cf6)",
  babies: "linear-gradient(135deg,#0c4a6e,#38bdf8)",
  services: "linear-gradient(135deg,#1e293b,#475569)",
};

export function StoreCarousel({ stores }: { stores: Store[] }) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const VISIBLE = 4;

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % stores.length);
    }, 3500);
  };

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [stores.length]);

  const prev = () => { setCurrent((c) => (c - 1 + stores.length) % stores.length); resetTimer(); };
  const next = () => { setCurrent((c) => (c + 1) % stores.length); resetTimer(); };

  // Build visible slice (circular)
  const visible = Array.from({ length: Math.min(VISIBLE, stores.length) }, (_, i) =>
    stores[(current + i) % stores.length]
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontWeight: 800, fontSize: "15px", color: "#0f172a" }}>🏪 Tiendas Virtuales</span>
          <span style={{ background: "#dbeafe", color: "#1d4ed8", borderRadius: "5px", padding: "1px 7px", fontSize: "9px", fontWeight: 800 }}>NUEVO</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Dot indicators */}
          <div style={{ display: "flex", gap: "4px" }}>
            {stores.map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrent(i); resetTimer(); }}
                style={{
                  width: i === current ? "16px" : "6px", height: "6px", borderRadius: "3px",
                  background: i === current ? "#3b82f6" : "#cbd5e1",
                  border: "none", cursor: "pointer", padding: 0,
                  transition: "width 0.25s, background 0.25s",
                }}
              />
            ))}
          </div>
          {/* Arrows */}
          <div style={{ display: "flex", gap: "4px" }}>
            <button onClick={prev} style={{ width: "26px", height: "26px", borderRadius: "50%", border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button onClick={next} style={{ width: "26px", height: "26px", borderRadius: "50%", border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
          <Link href="/tiendas" style={{ fontSize: "12px", color: "#6366f1", textDecoration: "none", fontWeight: 600 }}>
            Ver todas →
          </Link>
        </div>
      </div>

      {/* Cards */}
      <div className="grid-cols-4" style={{ gap: "10px" }}>
        {visible.map((store, idx) => {
          const bg = store.store_banner_url
            ? undefined
            : CAT_COLORS[store.main_cat_label?.toLowerCase().replace(/ /g, "-") ?? ""] ?? "linear-gradient(135deg,#1e293b,#334155)";

          return (
            <Link key={`${store.id}-${idx}`} href={`/tienda/${store.store_slug}`} style={{ textDecoration: "none", display: "block" }}>
              <div style={{
                background: "#fff", borderRadius: "12px", overflow: "hidden",
                border: "1px solid #e8e8e8", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s",
              }}>
                {/* Image area */}
                <div style={{
                  height: "90px", position: "relative", overflow: "hidden",
                  background: bg,
                  ...(store.store_banner_url ? {} : {}),
                }}>
                  {store.store_banner_url && (
                    <img src={store.store_banner_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  )}
                  {/* Logo circle */}
                  <div style={{
                    position: "absolute", bottom: "8px", left: "10px",
                    width: "36px", height: "36px", borderRadius: "50%",
                    background: "#fff", border: "2px solid rgba(255,255,255,0.9)",
                    overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                  }}>
                    {store.store_logo_url
                      ? <img src={store.store_logo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <span style={{ fontSize: "16px" }}>🏪</span>
                    }
                  </div>
                  {store.store_verified && (
                    <div style={{
                      position: "absolute", top: "6px", right: "6px",
                      background: "#2563eb", color: "#fff",
                      borderRadius: "20px", padding: "2px 7px",
                      fontSize: "9px", fontWeight: 800,
                      display: "flex", alignItems: "center", gap: "3px",
                    }}>
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      Verificada
                    </div>
                  )}
                </div>

                {/* Info */}
                <div style={{ padding: "8px 10px 10px" }}>
                  <div style={{ fontWeight: 800, fontSize: "12px", color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                    {store.store_name}
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: "2px" }}>
                    {store.store_description
                      ? store.store_description.slice(0, 45)
                      : store.listing_count > 0
                        ? `${store.listing_count} artículos`
                        : "Tienda virtual"}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Upsell bar */}
      <div style={{
        marginTop: "10px", background: "linear-gradient(135deg,#eff6ff,#dbeafe)",
        border: "1px solid #bfdbfe", borderRadius: "10px",
        padding: "10px 16px", display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: "12px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>🏪</span>
          <div>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#1e3a8a" }}>¿Tenés un negocio?</span>
            <span style={{ fontSize: "12px", color: "#1d4ed8", marginLeft: "6px" }}>· Creá tu tienda virtual gratis</span>
          </div>
        </div>
        <Link href="/dashboard/store">
          <div style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)", color: "#fff", borderRadius: "7px", padding: "6px 14px", fontWeight: 800, fontSize: "12px", cursor: "pointer", whiteSpace: "nowrap" }}>
            Crear tienda →
          </div>
        </Link>
      </div>
    </div>
  );
}
