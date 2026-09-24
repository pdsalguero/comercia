"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, X, Search } from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import { vehiclesHref } from "@/lib/vehicle-landing";

// Ejemplos que muestra el modal — cubren los tipos de filtro más comunes (km, equipamiento,
// precio) para que la persona vea de entrada qué tipo de frase entiende la búsqueda.
const SUGGESTIONS = [
  "Pickup diesel con pocos kilómetros",
  "Moto naked hasta $4.000.000",
  "Auto 0km con caja automática",
  "Utilitario con GNC y aire acondicionado",
];

interface SmartSearchFilters {
  sub_category: string | null;
  brand: string | null;
  price_min: number | null;
  price_max: number | null;
  year_from: number | null;
  year_to: number | null;
  km_max: number | null;
  fuel: string | null;
  transmission: string | null;
  condition: "new" | "used" | null;
  features: string[];
  q: string | null;
}

export function SmartSearchButton() {
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function buildParams(f: SmartSearchFilters): URLSearchParams {
    const params = new URLSearchParams();
    // "type" (no "sub_category"): mismo param que usa el resto del sitio para resaltar el tab
    // activo del sidebar — ver [[project-listings-page-redirect]].
    if (f.sub_category) params.set("type", f.sub_category);
    if (f.brand) params.set("brand", f.brand);
    if (f.price_min) params.set("price_min", String(f.price_min));
    if (f.price_max) params.set("price_max", String(f.price_max));
    if (f.year_from) params.set("year_from", String(f.year_from));
    if (f.year_to) params.set("year_to", String(f.year_to));
    if (f.km_max) params.set("km_max", String(f.km_max));
    if (f.fuel) params.set("fuel", f.fuel);
    if (f.transmission) params.set("transmission", f.transmission);
    if (f.condition) params.set("condition", f.condition);
    if (f.q) params.set("q", f.q);
    for (const feat of f.features ?? []) params.set(feat, "1");
    return params;
  }

  async function runSearch(text: string) {
    const q = text.trim();
    if (!q || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/smart-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo interpretar la búsqueda");
      const params = buildParams(data.filters);
      setOpen(false);
      router.push(vehiclesHref(params));
    } catch {
      // La IA puede fallar (rate limit, timeout, etc.) — no dejar a la persona sin nada:
      // ofrecerle buscar el texto tal cual como palabra clave.
      setError("No pudimos interpretar la búsqueda. Podés intentar de nuevo o buscarla como texto simple.");
    } finally {
      setLoading(false);
    }
  }

  function searchAsPlainText() {
    if (!query.trim()) return;
    setOpen(false);
    router.push(`/category/vehicles?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <>
      {/* En celular el texto se oculta por espacio: el aria-label mantiene el nombre del botón */}
      <button type="button" className="hero-smart-search-btn" onClick={() => setOpen(true)} aria-label="Contame qué buscás (búsqueda inteligente)" aria-haspopup="dialog">
        <Sparkles size={14} strokeWidth={2.2} aria-hidden="true" />
        <span className="hero-smart-search-btn-label">Contame qué buscás</span>
      </button>

      <Dialog open={open} onClose={() => { if (!loading) setOpen(false); }} labelledBy={titleId} maxWidth="520px">
          <div
            style={{
              background: "#fff", borderRadius: "16px", width: "100%",
              maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid #f1f5f9" }}>
              <h2 id={titleId} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                <Sparkles size={18} color="#1d6fb8" aria-hidden="true" />
                Contame qué buscás
              </h2>
              <button
                type="button"
                aria-label="Cerrar"
                onClick={() => setOpen(false)}
                style={{ background: "#f1f5f9", border: "none", borderRadius: "50%", width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", flexShrink: 0 }}
              >
                <X size={15} />
              </button>
            </div>

            <div style={{ padding: "20px 22px" }}>
              <label htmlFor="smart-search-input" style={{ fontSize: "13px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "8px" }}>
                ¿Qué auto o moto tenés en mente?
              </label>
              <textarea
                id="smart-search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); runSearch(query); } }}
                placeholder="Ej: pickup automática, poco uso y con GNC"
                rows={2}
                data-autofocus
                disabled={loading}
                style={{
                  width: "100%", border: "1.5px solid #cbd5e1", borderRadius: "10px",
                  padding: "12px 14px", fontSize: "14px", fontFamily: "inherit", resize: "none",
                  outline: "none", boxSizing: "border-box",
                }}
              />

              {error && (
                <div style={{ marginTop: "10px", fontSize: "12.5px", color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "8px 12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span>{error}</span>
                  <button type="button" onClick={searchAsPlainText} style={{ alignSelf: "flex-start", background: "none", border: "none", color: "#dc2626", fontWeight: 700, textDecoration: "underline", cursor: "pointer", fontSize: "12.5px", padding: 0 }}>
                    Buscar &ldquo;{query}&rdquo; como texto simple →
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => runSearch(query)}
                disabled={loading || !query.trim()}
                style={{
                  marginTop: "12px", width: "100%",
                  background: loading || !query.trim() ? "#cbd5e1" : "#1d6fb8",
                  color: "#fff", border: "none", borderRadius: "10px", padding: "12px",
                  fontSize: "14px", fontWeight: 700,
                  cursor: loading || !query.trim() ? "default" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                }}
              >
                <Search size={15} />
                {loading ? "Buscando..." : "Buscar"}
              </button>

              <div style={{ marginTop: "22px", fontSize: "12px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                Ideas para arrancar
              </div>
              <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="hero-smart-search-suggestion"
                    onClick={() => { setQuery(s); runSearch(s); }}
                    disabled={loading}
                    style={{
                      display: "flex", alignItems: "center", gap: "10px", textAlign: "left",
                      border: "1.5px solid #e2e8f0", borderRadius: "10px", padding: "12px 14px",
                      background: "#fff", cursor: loading ? "default" : "pointer",
                      fontSize: "13.5px", color: "#334155", fontFamily: "inherit",
                    }}
                  >
                    <Search size={14} color="#94a3b8" />
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
      </Dialog>
    </>
  );
}
