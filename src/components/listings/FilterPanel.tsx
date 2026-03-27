"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export interface FilterValues {
  condition?: string;
  price_min?: string;
  price_max?: string;
  brand?: string;
  fuel?: string;
  transmission?: string;
  year_from?: string;
  year_to?: string;
  km_max?: string;
  sub_category?: string;
  re_sub?: string;
  operation?: string;
  bedrooms?: string;
  size?: string;
  q?: string;
  order?: string;
  location?: string;
  category?: string;
}

interface Props {
  category?: string;
  categoryId?: number | null;
  currentFilters: FilterValues;
  totalCount: number;
  mode: "desktop" | "mobile";
  basePath?: string;
}

const VEHICLE_SLUGS = ["vehicles", "autos", "camionetas", "motos", "utilitarios", "pickups", "vehiculos"];
const REALESTATE_SLUGS = ["real-estate", "inmuebles", "casas", "departamentos", "terrenos"];
const CLOTHING_SLUGS = ["clothing", "ropa", "indumentaria"];

export function FilterPanel({ category, categoryId, currentFilters, totalCount, mode, basePath = "/listings" }: Props) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<FilterValues>(currentFilters);

  const slug = (category ?? "").toLowerCase();
  const isVehicles = VEHICLE_SLUGS.includes(slug);
  const isRealEstate = REALESTATE_SLUGS.includes(slug);
  const isClothing = CLOTHING_SLUGS.includes(slug);

  const [availableBrands, setAvailableBrands] = useState<string[]>([]);

  useEffect(() => {
    if (!categoryId) return;
    const supabase = createClient();
    const fetchBrands = async () => {
      let q = supabase
        .from("listings")
        .select("attributes")
        .eq("status", "active")
        .eq("category_id", categoryId)
        .not("attributes->brand", "is", null);
      if (filters.sub_category) {
        q = q.eq("attributes->>sub_category" as any, filters.sub_category);
      }
      const { data } = await q;
      const brands = [
        ...new Set(
          (data ?? [])
            .map((l: any) => l.attributes?.brand as string | undefined)
            .filter(Boolean)
            .map((b: string) => b.charAt(0).toUpperCase() + b.slice(1).toLowerCase())
        ),
      ].sort() as string[];
      setAvailableBrands(brands);
    };
    fetchBrands();
  }, [categoryId, filters.sub_category]);

  const activeCount = [
    filters.condition, filters.brand, filters.fuel, filters.transmission,
    filters.year_from, filters.year_to, filters.km_max, filters.sub_category,
    filters.re_sub, filters.operation, filters.bedrooms,
    filters.size, filters.price_min, filters.price_max,
  ].filter(Boolean).length;

  function applyFilters(f: FilterValues) {
    const sp = new URLSearchParams();
    const keys: (keyof FilterValues)[] = [
      "q", "category", "condition", "price_min", "price_max", "order", "location",
      "brand", "fuel", "transmission", "year_from", "year_to", "km_max", "sub_category",
      "re_sub", "operation", "bedrooms", "size",
    ];
    for (const k of keys) {
      const v = f[k];
      if (v) sp.set(k, v);
    }
    router.push(`${basePath}?${sp.toString()}`);
    setDrawerOpen(false);
  }

  function clearFilters() {
    const cleared: FilterValues = {
      q: currentFilters.q,
      category: currentFilters.category,
      order: currentFilters.order,
    };
    setFilters(cleared);
    applyFilters(cleared);
  }

  const inputStyle: React.CSSProperties = {
    border: "1.5px solid #e2e8f0", borderRadius: "6px",
    padding: "7px 10px", fontSize: "13px", outline: "none",
    width: "100%", boxSizing: "border-box" as const, fontFamily: "inherit",
  };
  const selectStyle: React.CSSProperties = { ...inputStyle, background: "#fff", cursor: "pointer" };

  const sectionLabel: React.CSSProperties = {
    fontSize: "12px", fontWeight: 700, color: "#475569",
    textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "10px",
  };

  const subLabel: React.CSSProperties = {
    fontSize: "11px", fontWeight: 700, color: "#888",
    textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "5px",
  };

  function PillGroup<T extends string>({ value, onChange, options }: {
    value: T | undefined;
    onChange: (v: T | undefined) => void;
    options: { value: T; label: string }[];
  }) {
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {options.map(o => {
          const active = (value ?? "") === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value === "" ? undefined : (o.value || undefined) as T | undefined)}
              style={{
                padding: "5px 10px", borderRadius: "20px", fontSize: "12px",
                border: `1.5px solid ${active ? "#2563eb" : "#e2e8f0"}`,
                background: active ? "#eff6ff" : "#fff",
                color: active ? "#2563eb" : "#475569",
                fontWeight: active ? 700 : 400, cursor: "pointer",
              }}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    );
  }

  function SelectFilter({ label, field, options }: {
    label: string;
    field: keyof FilterValues;
    options: { value: string; label: string }[];
  }) {
    return (
      <div>
        <div style={subLabel}>{label}</div>
        <select
          value={filters[field] ?? ""}
          onChange={e => setFilters(f => ({ ...f, [field]: e.target.value || undefined }))}
          style={selectStyle}
        >
          <option value="">Todos</option>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    );
  }

  function FilterBody() {
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>

        {/* ── VEHÍCULOS ── */}
        {isVehicles && (
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #f5f5f5", display: "flex", flexDirection: "column", gap: "14px" }}>

            {/* Tipo de vehículo */}
            <div>
              <div style={sectionLabel}>Tipo de vehículo</div>
              <PillGroup
                value={filters.sub_category as any}
                onChange={v => setFilters(f => ({ ...f, sub_category: v }))}
                options={[
                  { value: "" as any, label: "Todos" },
                  { value: "auto" as any, label: "Autos" },
                  { value: "camioneta" as any, label: "Pickups / SUV / Utilitarios" },
                  { value: "moto" as any, label: "Motos" },
                  { value: "cuatriciclo" as any, label: "Cuatriciclos" },
                  { value: "utv" as any, label: "Areneros" },
                ]}
              />
            </div>

            {/* Marca */}
            {availableBrands.length > 0 && (
              <div>
                <div style={subLabel}>Marca</div>
                <select
                  value={filters.brand ?? ""}
                  onChange={e => setFilters(f => ({ ...f, brand: e.target.value || undefined }))}
                  style={selectStyle}
                >
                  <option value="">Todas las marcas</option>
                  {availableBrands.map(brand => (
                    <option key={brand} value={brand.toLowerCase()}>{brand}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Combustible */}
            <SelectFilter label="Combustible" field="fuel" options={[
              { value: "nafta", label: "Nafta" },
              { value: "diesel", label: "Diesel" },
              { value: "gnc", label: "GNC" },
              { value: "electrico", label: "Eléctrico" },
              { value: "hibrido", label: "Híbrido" },
            ]} />

            {/* Transmisión */}
            <SelectFilter label="Transmisión" field="transmission" options={[
              { value: "manual", label: "Manual" },
              { value: "automatica", label: "Automática" },
              { value: "cvt", label: "CVT" },
            ]} />

            {/* Año */}
            <div>
              <div style={subLabel}>Año</div>
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <input
                  type="number" placeholder="Desde" value={filters.year_from ?? ""}
                  onChange={e => setFilters(f => ({ ...f, year_from: e.target.value || undefined }))}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <span style={{ color: "#94a3b8", fontSize: "12px" }}>—</span>
                <input
                  type="number" placeholder="Hasta" value={filters.year_to ?? ""}
                  onChange={e => setFilters(f => ({ ...f, year_to: e.target.value || undefined }))}
                  style={{ ...inputStyle, flex: 1 }}
                />
              </div>
            </div>

            {/* Kilómetros */}
            <div>
              <div style={subLabel}>Kilómetros máx.</div>
              <PillGroup
                value={filters.km_max as any}
                onChange={v => setFilters(f => ({ ...f, km_max: v }))}
                options={[
                  { value: "" as any, label: "Sin límite" },
                  { value: "50000" as any, label: "Hasta 50.000" },
                  { value: "100000" as any, label: "Hasta 100.000" },
                  { value: "150000" as any, label: "Hasta 150.000" },
                ]}
              />
            </div>
          </div>
        )}

        {/* ── INMUEBLES ── */}
        {isRealEstate && (
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #f5f5f5", display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={sectionLabel}>Inmueble</div>
            <SelectFilter label="Operación" field="operation" options={[
              { value: "venta", label: "Venta" },
              { value: "alquiler", label: "Alquiler" },
              { value: "alquiler-temporal", label: "Alquiler temporal" },
            ]} />
            <SelectFilter label="Tipo" field="re_sub" options={[
              { value: "casa", label: "Casa" },
              { value: "departamento", label: "Departamento" },
              { value: "terreno", label: "Terreno / Lote" },
              { value: "local", label: "Local / Oficina" },
              { value: "galpon", label: "Galpón" },
              { value: "cochera", label: "Cochera" },
            ]} />
            <SelectFilter label="Dormitorios" field="bedrooms" options={[
              { value: "monoambiente", label: "Monoambiente" },
              { value: "1", label: "1 dormitorio" },
              { value: "2", label: "2 dormitorios" },
              { value: "3", label: "3 dormitorios" },
              { value: "4", label: "4+ dormitorios" },
            ]} />
          </div>
        )}

        {/* ── INDUMENTARIA ── */}
        {isClothing && (
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #f5f5f5" }}>
            <SelectFilter label="Talle" field="size" options={[
              { value: "XS", label: "XS" }, { value: "S", label: "S" }, { value: "M", label: "M" },
              { value: "L", label: "L" }, { value: "XL", label: "XL" }, { value: "XXL", label: "XXL" },
            ]} />
          </div>
        )}

        {/* ── PRECIO ── */}
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #f5f5f5" }}>
          <div style={sectionLabel}>Precio</div>
          <div style={{ display: "flex", gap: "6px" }}>
            <input
              type="number" placeholder="Mínimo" value={filters.price_min ?? ""}
              onChange={e => setFilters(f => ({ ...f, price_min: e.target.value || undefined }))}
              style={{ ...inputStyle, flex: 1 }}
            />
            <input
              type="number" placeholder="Máximo" value={filters.price_max ?? ""}
              onChange={e => setFilters(f => ({ ...f, price_max: e.target.value || undefined }))}
              style={{ ...inputStyle, flex: 1 }}
            />
          </div>
        </div>

        {/* ── CONDICIÓN ── */}
        <div style={{ padding: "14px 16px" }}>
          <div style={sectionLabel}>Condición</div>
          <PillGroup
            value={filters.condition as any}
            onChange={v => setFilters(f => ({ ...f, condition: v }))}
            options={[
              { value: "" as any, label: "Todas" },
              { value: "new" as any, label: "Nuevo" },
              { value: "like_new" as any, label: "Como nuevo" },
              { value: "very_good" as any, label: "Muy bueno" },
              { value: "good" as any, label: "Bueno" },
            ]}
          />
        </div>

      </div>
    );
  }

  const applyBtn = (
    <button
      type="button"
      onClick={() => applyFilters(filters)}
      style={{
        width: "100%", background: "#2563eb", color: "#fff",
        border: "none", borderRadius: "8px", padding: "10px",
        fontWeight: 700, fontSize: "13px", cursor: "pointer",
      }}
    >
      Aplicar filtros
    </button>
  );

  const clearBtn = activeCount > 0 && (
    <button
      type="button"
      onClick={clearFilters}
      style={{
        background: "none", border: "none", color: "#dc2626",
        fontSize: "13px", fontWeight: 600, cursor: "pointer", padding: "4px 0",
      }}
    >
      ✕ Limpiar filtros
    </button>
  );

  // ── DESKTOP MODE ──
  if (mode === "desktop") {
    return (
      <div className="filter-panel-desktop" style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
        <div style={{
          padding: "12px 16px", borderBottom: "1px solid #f0f0f0",
          fontSize: "13px", fontWeight: 700, color: "#333",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          Filtros
          {activeCount > 0 && (
            <span style={{
              background: "#f97316", color: "#fff", borderRadius: "20px",
              fontSize: "11px", fontWeight: 700, padding: "1px 7px",
            }}>{activeCount}</span>
          )}
        </div>
        <FilterBody />
        <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {applyBtn}
          {clearBtn}
        </div>
      </div>
    );
  }

  // ── MOBILE MODE: trigger button + bottom drawer ──
  return (
    <>
      <button
        type="button"
        className="filter-btn-mobile"
        onClick={() => setDrawerOpen(true)}
        style={{
          alignItems: "center", gap: "6px",
          padding: "8px 14px", border: "1.5px solid #e2e8f0",
          borderRadius: "8px", background: "#fff",
          fontSize: "13px", fontWeight: 600, color: "#334155",
          cursor: "pointer", flexShrink: 0,
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="20" y2="12" /><line x1="12" y1="18" x2="20" y2="18" />
          <circle cx="4" cy="6" r="2" fill="currentColor" stroke="none" />
          <circle cx="4" cy="12" r="2" fill="currentColor" stroke="none" />
          <circle cx="4" cy="18" r="2" fill="currentColor" stroke="none" />
        </svg>
        Filtrar
        {activeCount > 0 && (
          <span style={{
            background: "#f97316", color: "#fff", borderRadius: "50%",
            width: 18, height: 18, fontSize: 10, fontWeight: 700,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
          }}>
            {activeCount}
          </span>
        )}
      </button>

      {drawerOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setDrawerOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100 }}
          />
          {/* Drawer */}
          <div style={{
            position: "fixed", bottom: 0, left: 0, right: 0,
            height: "80vh", background: "#fff", borderRadius: "16px 16px 0 0",
            zIndex: 101, display: "flex", flexDirection: "column",
            boxShadow: "0 -4px 24px rgba(0,0,0,0.15)",
          }}>
            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "16px 20px", borderBottom: "1px solid #f0f0f0", flexShrink: 0,
            }}>
              <span style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>
                Filtros
                {activeCount > 0 && (
                  <span style={{
                    marginLeft: "8px", background: "#f97316", color: "#fff",
                    borderRadius: "20px", fontSize: "11px", fontWeight: 700, padding: "1px 7px",
                  }}>{activeCount}</span>
                )}
              </span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                style={{
                  background: "#f1f5f9", border: "none", borderRadius: "50%",
                  width: 32, height: 32, cursor: "pointer", fontSize: "16px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>
            {/* Body */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              <FilterBody />
            </div>
            {/* Footer */}
            <div style={{
              padding: "16px 20px", borderTop: "1px solid #f0f0f0",
              display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0,
              background: "#fff",
            }}>
              {applyBtn}
              <div style={{ textAlign: "center" }}>
                {clearBtn}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
