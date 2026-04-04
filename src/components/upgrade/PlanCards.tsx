"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TIERS = [
  {
    key: "bronze",
    name: "Esencial",
    badge: "⭐ ESENCIAL",
    color: "#f97316",
    colorLight: "#fff7ed",
    colorBorder: "#fed7aa",
    gradient: "linear-gradient(135deg,#f97316,#fb923c)",
    shadow: "0 4px 24px rgba(249,115,22,0.18)",
    description: "Dale más visibilidad a tu publicación dentro de su categoría.",
    features: [
      "Aparece antes que los anuncios gratuitos",
      "Badge ⭐ Esencial",
      "Borde naranja destacado",
    ],
    prices: { 7: 699, 15: 1299, 30: 2499 },
    cta: "Activar Esencial",
  },
  {
    key: "silver",
    name: "Destacado",
    badge: "🚀 DESTACADO",
    color: "#6366f1",
    colorLight: "#eef2ff",
    colorBorder: "#c7d2fe",
    gradient: "linear-gradient(135deg,#6366f1,#818cf8)",
    shadow: "0 4px 24px rgba(99,102,241,0.22)",
    description: "Mayor exposición en toda la categoría con diseño diferenciado.",
    popular: true,
    features: [
      "Todo lo de Esencial",
      "Badge 🚀 Destacado",
      "Posición preferencial",
    ],
    prices: { 7: 1299, 15: 2299, 30: 4199 },
    cta: "Activar Destacado",
  },
  {
    key: "gold",
    name: "Premium",
    badge: "👑 PREMIUM",
    color: "#d97706",
    colorLight: "#fffbeb",
    colorBorder: "#fde68a",
    gradient: "linear-gradient(135deg,#f59e0b,#fbbf24)",
    shadow: "0 4px 24px rgba(251,191,36,0.28)",
    description: "Máxima visibilidad: aparece en la home y al tope de cada categoría.",
    features: [
      "Todo lo de Destacado",
      "Badge 👑 Premium",
      "Aparece en la home",
    ],
    prices: { 7: 1799, 15: 3299, 30: 6999 },
    cta: "Activar Premium",
  },
];

const DAYS = [7, 15, 30] as const;

interface Props {
  listingId?: string;
  freeCredits?: number;
}

export function PlanCards({ listingId, freeCredits = 0 }: Props) {
  const router = useRouter();
  // Single global selection: "tierKey_days"
  const [selected, setSelected] = useState("silver_30");
  const [loading, setLoading] = useState(false);
  const [freeLoading, setFreeLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  async function handleCheckout(planKey: string) {
    if (!listingId) return;
    setLoading(true);
    setCheckoutError(null);
    try {
      const res = await fetch("/api/mp/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing_id: listingId, plan_key: planKey }),
      });
      const data = await res.json();
      if (!res.ok || !data.init_point) {
        setCheckoutError(data.error ?? "Error al iniciar el pago");
        return;
      }
      window.location.href = data.init_point;
    } catch {
      setCheckoutError("Error de conexion. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function handleFreeDestacado() {
    if (!listingId) return;
    setFreeLoading(true);
    setCheckoutError(null);
    try {
      const res = await fetch("/api/mp/free-destacado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing_id: listingId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCheckoutError(data.error ?? "Error al activar el crédito");
        return;
      }
      window.location.href = `/listings/${listingId}?destacado=1`;
    } catch {
      setCheckoutError("Error de conexion. Intenta de nuevo.");
    } finally {
      setFreeLoading(false);
    }
  }

  return (
    <>
    {/* Banner de créditos gratuitos */}
    {freeCredits > 0 && listingId && (
      <div style={{
        background: "linear-gradient(135deg,#fffbeb,#fef3c7)",
        border: "2px solid #fbbf24",
        borderRadius: "14px",
        padding: "16px 20px",
        marginBottom: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "28px" }}>👑</span>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 800, color: "#92400e" }}>
              Tenés {freeCredits} crédito{freeCredits !== 1 ? "s" : ""} Premium gratuito{freeCredits !== 1 ? "s" : ""}
            </div>
            <div style={{ fontSize: "12px", color: "#b45309", marginTop: "2px" }}>
              Destacado Gold sin límite de tiempo, sin costo. ¡Úsalo en esta publicación!
            </div>
          </div>
        </div>
        <button
          onClick={handleFreeDestacado}
          disabled={freeLoading}
          style={{
            background: "linear-gradient(135deg,#f59e0b,#fbbf24)",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            padding: "11px 22px",
            fontSize: "14px",
            fontWeight: 700,
            cursor: freeLoading ? "default" : "pointer",
            opacity: freeLoading ? 0.7 : 1,
            boxShadow: "0 4px 14px rgba(251,191,36,0.4)",
            whiteSpace: "nowrap",
          }}
        >
          {freeLoading ? "Activando..." : "👑 Activar gratis"}
        </button>
      </div>
    )}

    {checkoutError && (
      <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", fontSize: "13px", color: "#b91c1c" }}>
        ❌ {checkoutError}
      </div>
    )}
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
      gap: "16px",
      alignItems: "start",
    }}>
      {TIERS.map((tier) => {
        const isThisTierSelected = selected.startsWith(tier.key + "_");
        const selDays = isThisTierSelected ? (parseInt(selected.split("_")[1]) as 7 | 15 | 30) : null;
        const ctaPrice = selDays ? tier.prices[selDays] : null;

        return (
          <div key={tier.key} style={{
            background: "#fff",
            borderRadius: "16px",
            border: `2px solid ${tier.colorBorder}`,
            boxShadow: tier.shadow,
            overflow: "hidden",
            position: "relative",
          }}>
            {/* Header */}
            <div style={{ background: tier.colorLight, padding: "16px 20px 14px", borderBottom: `1px solid ${tier.colorBorder}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <div style={{
                  display: "inline-block", background: tier.gradient, color: "#fff",
                  borderRadius: "6px", padding: "3px 9px", fontSize: "11px", fontWeight: 800,
                }}>
                  {tier.badge}
                </div>
                {tier.popular && (
                  <div style={{
                    background: tier.gradient, color: "#fff", borderRadius: "20px",
                    padding: "2px 9px", fontSize: "10px", fontWeight: 700,
                  }}>
                    MÁS ELEGIDO
                  </div>
                )}
              </div>
              <div style={{ fontSize: "16px", fontWeight: 800, color: "#111", marginBottom: "4px" }}>{tier.name}</div>
              <div style={{ fontSize: "12px", color: "#777", lineHeight: 1.4 }}>{tier.description}</div>
            </div>

            {/* Duration rows */}
            <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {DAYS.map((d) => {
                const p = tier.prices[d];
                const ppd = Math.round(p / d);
                const key = `${tier.key}_${d}`;
                const isSelected = selected === key;
                const isBest = d === 30;
                return (
                  <div
                    key={d}
                    onClick={() => setSelected(key)}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "10px 12px", borderRadius: "10px", cursor: "pointer",
                      border: isSelected ? `2px solid ${tier.color}` : "2px solid #f1f5f9",
                      background: isSelected ? tier.colorLight : "#fafafa",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{
                        width: "16px", height: "16px", borderRadius: "50%", flexShrink: 0,
                        border: isSelected ? `5px solid ${tier.color}` : "2px solid #cbd5e1",
                        background: "#fff",
                        transition: "all 0.15s",
                      }} />
                      <span style={{ fontSize: "13px", fontWeight: isSelected ? 700 : 500, color: isSelected ? tier.color : "#475569" }}>
                        {d} días
                      </span>
                      {isBest && (
                        <span style={{ fontSize: "9px", background: "#ecfdf5", color: "#10b981", padding: "1px 5px", borderRadius: "4px", fontWeight: 700 }}>
                          MEJOR PRECIO
                        </span>
                      )}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "15px", fontWeight: 800, color: isSelected ? tier.color : "#0f172a" }}>
                        ${p.toLocaleString("es-AR")}
                      </div>
                      <div style={{ fontSize: "10px", color: "#94a3b8" }}>
                        ${ppd.toLocaleString("es-AR")}/día
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Features */}
            <div style={{ padding: "0 20px 12px" }}>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "5px" }}>
                {tier.features.map((f) => (
                  <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "7px", fontSize: "12px", color: "#555" }}>
                    <span style={{ color: tier.color, fontWeight: 700, flexShrink: 0 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA — only shown when coming from a listing */}
            {listingId && (
              <div style={{ padding: "0 20px 18px" }}>
                <button
                  disabled={!isThisTierSelected || loading}
                  onClick={() => handleCheckout(selected)}
                  style={{
                    width: "100%",
                    background: isThisTierSelected ? tier.gradient : "#e2e8f0",
                    color: isThisTierSelected ? "#fff" : "#94a3b8",
                    border: "none", borderRadius: "10px", padding: "13px",
                    fontSize: "14px", fontWeight: 700,
                    cursor: isThisTierSelected && !loading ? "pointer" : "default",
                    boxShadow: isThisTierSelected ? tier.shadow : "none",
                    opacity: loading && isThisTierSelected ? 0.7 : 1,
                  }}
                >
                  {loading && isThisTierSelected
                    ? "Procesando..."
                    : isThisTierSelected && ctaPrice
                      ? `${tier.cta} · ${selDays}d · $${ctaPrice.toLocaleString("es-AR")}`
                      : tier.cta}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
    </>
  );
}
