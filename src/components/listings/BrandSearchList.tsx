"use client";
import { useState } from "react";
import Link from "next/link";

interface BrandItem { value: string; label: string; count: number; }

interface Props {
  brands: BrandItem[];
  activeBrand?: string;
  /** Current page URL without brand param, e.g. "/category/vehicles?type=auto" */
  baseHref: string;
  topN?: number;
}

export function BrandSearchList({ brands, activeBrand, baseHref, topN = 5 }: Props) {
  const [query, setQuery]       = useState("");
  const [expanded, setExpanded] = useState(false);

  const filtered  = query ? brands.filter(b => b.label.toLowerCase().includes(query.toLowerCase())) : brands;
  const showToggle = !query && brands.length > topN;
  const visible   = showToggle && !expanded ? filtered.slice(0, topN) : filtered;

  function href(brandValue: string | undefined) {
    const [path, qs] = baseHref.split("?");
    const u = new URLSearchParams(qs ?? "");
    if (brandValue) u.set("brand", brandValue); else u.delete("brand");
    const s = u.toString();
    return s ? `${path}?${s}` : path;
  }

  return (
    <div>
      {brands.length > topN && (
        <div style={{ padding: "8px 14px 4px" }}>
          <input
            placeholder="Buscar marca..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              width: "100%", border: "1.5px solid #e2e8f0", borderRadius: "6px",
              padding: "6px 10px", fontSize: "12px", outline: "none",
              boxSizing: "border-box", fontFamily: "inherit",
            }}
          />
        </div>
      )}

      {visible.map(b => {
        const active = activeBrand === b.value;
        return (
          <Link key={b.value} href={href(active ? undefined : b.value)} style={{ textDecoration: "none" }}>
            <div style={{
              padding: "8px 16px", fontSize: "13px", cursor: "pointer",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              background: active ? "#eff6ff" : "transparent",
              color: active ? "#2563eb" : "#444",
              fontWeight: active ? 700 : 400,
              borderLeft: active ? "3px solid #2563eb" : "3px solid transparent",
            }}>
              <span>{b.label}</span>
              <span style={{
                fontSize: "11px", fontWeight: 600, padding: "1px 6px",
                borderRadius: "20px",
                background: active ? "#dbeafe" : "#f1f5f9",
                color: active ? "#2563eb" : "#888",
              }}>{b.count}</span>
            </div>
          </Link>
        );
      })}

      {showToggle && (
        <button
          type="button"
          onClick={() => setExpanded(e => !e)}
          style={{
            width: "100%", padding: "8px 16px", fontSize: "12px", fontWeight: 600,
            color: "#2563eb", background: "none", border: "none", cursor: "pointer",
            textAlign: "left",
          }}
        >
          {expanded ? "Ver menos" : `Ver todas las marcas (${brands.length})`}
        </button>
      )}
    </div>
  );
}
