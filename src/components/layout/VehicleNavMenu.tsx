"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { vehiclesHref } from "@/lib/vehicle-landing";

type Brand = { value: string; label: string; count: number };

// Las listas se piden una sola vez por tipo y se reutilizan mientras la pestaña siga abierta.
const cache = new Map<string, Brand[]>();

interface VehicleNavMenuProps {
  label: string;
  href: string;
  /** Tipo de vehículo (auto, camioneta, moto…): define qué marcas se listan. */
  tipo: string;
  className?: string;
}

/**
 * Enlace de la barra superior que, al pasar el mouse (o enfocarlo con el teclado), muestra las
 * marcas de ese tipo. Con clic el enlace navega igual, así que en pantallas táctiles no cambia nada.
 */
export function VehicleNavMenu({ label, href, tipo, className }: VehicleNavMenuProps) {
  const [open, setOpen] = useState(false);
  const [brands, setBrands] = useState<Brand[] | null>(cache.get(tipo) ?? null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = () => {
    const cached = cache.get(tipo);
    if (cached) { setBrands(cached); return; }
    fetch(`/api/vehiculos/marcas?tipo=${tipo}`)
      .then((r) => (r.ok ? (r.json() as Promise<Brand[]>) : []))
      .catch(() => [] as Brand[])
      .then((list) => { cache.set(tipo, list); setBrands(list); });
  };

  const show = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { setOpen(true); load(); }, 120);
  };
  const hide = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), 160);
  };

  const withStock = (brands ?? []).filter((b) => b.count > 0);
  const others = (brands ?? []).filter((b) => b.count === 0);
  const brandHref = (value: string) => vehiclesHref({ type: tipo, brand: value });

  const brandLink = (b: Brand) => (
    <Link
      key={b.value}
      href={brandHref(b.value)}
      onClick={() => setOpen(false)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px",
        padding: "7px 10px", borderRadius: "8px", fontSize: "13px",
        color: "#334155", fontWeight: 500, textDecoration: "none",
      }}
      className="hover:bg-indigo-50 hover:text-indigo-700"
    >
      <span>{b.label}</span>
      {b.count > 0 && <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600 }}>{b.count}</span>}
    </Link>
  );

  const groupTitle = (text: string) => (
    <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.6px", textTransform: "uppercase", padding: "6px 10px 4px" }}>
      {text}
    </div>
  );

  return (
    <div
      className={className}
      style={{ position: "relative" }}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) hide(); }}
    >
      <Link
        href={href}
        style={{ fontSize: "14px", color: open ? "#1d6fb8" : "#64748b", fontWeight: 500, whiteSpace: "nowrap" }}
        className="hover:text-indigo-600 transition-colors"
      >
        {label}
      </Link>

      {open && (
        // El relleno superior es transparente y "puentea" el espacio entre el enlace y el panel
        <div style={{ position: "absolute", top: "100%", left: "-12px", paddingTop: "14px", zIndex: 200 }}>
          <div style={{
            width: "300px", background: "#fff", borderRadius: "12px",
            border: "1px solid #e2e8f0", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", padding: "8px",
          }}>
            {brands === null ? (
              <div style={{ padding: "14px 10px", fontSize: "12px", color: "#94a3b8" }}>Cargando marcas…</div>
            ) : (
              <>
                {withStock.length > 0 && (
                  <>
                    {groupTitle("Con avisos")}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px" }}>{withStock.map(brandLink)}</div>
                  </>
                )}
                {others.length > 0 && (
                  <>
                    {groupTitle(withStock.length > 0 ? "Más buscadas" : "Marcas más buscadas")}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px" }}>{others.map(brandLink)}</div>
                  </>
                )}
              </>
            )}
            <Link
              href={href}
              onClick={() => setOpen(false)}
              style={{
                display: "block", marginTop: "8px", padding: "9px 10px", borderTop: "1px solid #f1f5f9",
                fontSize: "12px", fontWeight: 600, color: "#1d6fb8", textDecoration: "none",
              }}
            >
              Ver todo en {label} →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
