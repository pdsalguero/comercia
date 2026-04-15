"use client";

import { useState } from "react";
import Link from "next/link";
import PinIcon from "@/components/ui/PinIcon";

interface Item {
  id: string;
  title: string;
  price: number | null;
  currency: string | null;
  neighborhood: string | null;
  view_count: number;
  cover: string | null;
}

const CONDITION_LABELS: Record<string, string> = {
  new: "Nuevo", like_new: "Como nuevo", very_good: "Muy bueno",
  good: "Bueno", fair: "Regular", for_parts: "Para repuestos",
};

export function MostVisitedCarousel({ items }: { items: Item[] }) {
  const [idx, setIdx] = useState(0);
  if (!items.length) return null;
  const item = items[idx];

  return (
    <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0", overflow: "hidden" }}>

      {/* Header */}
      <div style={{ padding: "11px 14px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
          </svg>
          <span style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b" }}>Más visitados</span>
        </div>
        {/* Arrows */}
        <div style={{ display: "flex", gap: "2px" }}>
          <button
            onClick={() => setIdx(i => (i - 1 + items.length) % items.length)}
            style={{ width: "24px", height: "24px", borderRadius: "6px", border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button
            onClick={() => setIdx(i => (i + 1) % items.length)}
            style={{ width: "24px", height: "24px", borderRadius: "6px", border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>

      {/* Card */}
      <Link href={`/listings/${item.id}`} style={{ textDecoration: "none", display: "block" }}>
        {item.cover && (
          <div style={{ position: "relative", height: "130px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.cover} alt="" loading="lazy" decoding="async" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(0,0,0,0.55)", borderRadius: "6px", padding: "2px 7px", display: "flex", alignItems: "center", gap: "4px" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              <span style={{ fontSize: "10px", fontWeight: 700, color: "#fff" }}>{item.view_count.toLocaleString("es-AR")}</span>
            </div>
          </div>
        )}
        <div style={{ padding: "10px 14px 14px" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b", marginBottom: "5px", lineHeight: 1.3,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {item.title}
          </div>
          {item.price ? (
            <div style={{ fontSize: "14px", fontWeight: 800, color: "#f97316", marginBottom: "4px" }}>
              {item.currency === "USD" ? "U$D" : "$"} {item.price.toLocaleString("es-AR")}
            </div>
          ) : (
            <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>Precio a consultar</div>
          )}
          {item.neighborhood && (
            <div style={{ fontSize: "11px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "3px" }}>
              <PinIcon size={10} /> {item.neighborhood}
            </div>
          )}
        </div>
      </Link>

      {/* Dot indicators */}
      <div style={{ display: "flex", justifyContent: "center", gap: "5px", paddingBottom: "12px" }}>
        {items.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)} style={{ width: i === idx ? "16px" : "6px", height: "6px", borderRadius: "3px", background: i === idx ? "#f97316" : "#e2e8f0", border: "none", cursor: "pointer", padding: 0, transition: "all 0.2s" }} />
        ))}
      </div>
    </div>
  );
}
