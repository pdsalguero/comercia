"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ListingCard } from "./ListingCard";

const VISIBLE = 8;
const AUTO_INTERVAL = 5000;

interface Item {
  id: string;
  title: string;
  price: number | null;
  currency?: string | null;
  condition?: string | null;
  neighborhood?: string | null;
  featured_level?: string | null;
  attributes?: Record<string, any> | null;
  cover_image: string | null;
  view_count?: number | null;
  created_at?: string | null;
  is_store?: boolean | null;
  store_name?: string | null;
}

interface Props {
  title: string;
  items: Item[];
  href: string;
}

export function FeaturedCarousel({ title, items, href }: Props) {
  const [index, setIndex] = useState(0);
  const total = items.length;
  const isCarousel = total > VISIBLE;
  const maxIndex = Math.max(0, total - VISIBLE);

  const prev = useCallback(() => setIndex(i => Math.max(0, i - 1)), []);
  const next = useCallback(() => setIndex(i => (i >= maxIndex ? 0 : i + 1)), [maxIndex]);

  // Auto-rotate when carousel is needed
  useEffect(() => {
    if (!isCarousel) return;
    const t = setInterval(next, AUTO_INTERVAL);
    return () => clearInterval(t);
  }, [isCarousel, next]);

  const visible = items.slice(index, index + VISIBLE);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontWeight: 800, fontSize: "15px", color: "#0f172a" }}>{title}</span>
          <span style={{
            background: "linear-gradient(135deg,#f59e0b,#fbbf24)",
            color: "#fff", borderRadius: "5px", padding: "1px 7px",
            fontSize: "9px", fontWeight: 800,
          }}>PREMIUM</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {isCarousel && (
            <div style={{ display: "flex", gap: "4px" }}>
              <button
                onClick={prev}
                disabled={index === 0}
                style={{
                  width: "28px", height: "28px", borderRadius: "50%",
                  border: "1.5px solid #e2e8f0", background: index === 0 ? "#f8fafc" : "#fff",
                  cursor: index === 0 ? "default" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: index === 0 ? "#cbd5e1" : "#475569", fontSize: "14px",
                  transition: "all 0.15s",
                }}
              >‹</button>
              <button
                onClick={next}
                disabled={index >= maxIndex}
                style={{
                  width: "28px", height: "28px", borderRadius: "50%",
                  border: "1.5px solid #e2e8f0", background: index >= maxIndex ? "#f8fafc" : "#fff",
                  cursor: index >= maxIndex ? "default" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: index >= maxIndex ? "#cbd5e1" : "#475569", fontSize: "14px",
                  transition: "all 0.15s",
                }}
              >›</button>
            </div>
          )}
          <Link href={href} style={{ fontSize: "12px", color: "#6366f1", textDecoration: "none", fontWeight: 600 }}>
            Ver todos →
          </Link>
        </div>
      </div>

      {/* Cards */}
      <div className="grid-cols-4 featured-cards">
        {visible.map((l) => (
          <ListingCard
            key={l.id}
            id={l.id}
            title={l.title}
            price={l.price ?? 0}
            currency={l.currency ?? "ARS"}
            cover_image={l.cover_image}
            condition={l.condition ?? undefined}
            neighborhood={l.neighborhood ?? undefined}
            featured_level={(l.featured_level as any) ?? null}
            attributes={l.attributes ?? undefined}
            view_count={l.view_count ?? null}
            created_at={l.created_at ?? null}
            is_store={l.is_store ?? null}
            store_name={l.store_name ?? null}
          />
        ))}
      </div>

      {/* Dots */}
      {isCarousel && (
        <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "10px" }}>
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              style={{
                width: i === index ? "20px" : "6px",
                height: "6px",
                borderRadius: i === index ? "3px" : "50%",
                border: "none",
                background: i === index ? "#f97316" : "#cbd5e1",
                cursor: "pointer",
                padding: 0,
                transition: "all 0.2s",
              }}
            />
          ))}
        </div>
      )}

      {/* Upsell bar */}
      <div style={{
        marginTop: "10px",
        background: "linear-gradient(135deg,#fffbeb,#fef3c7)",
        border: "1px solid #fde68a", borderRadius: "10px",
        padding: "10px 16px", display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: "12px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>⭐</span>
          <div>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#92400e" }}>¿Querés aparecer aquí?</span>
            <span style={{ fontSize: "12px", color: "#b45309", marginLeft: "6px" }}>· Recibí 5× más consultas</span>
          </div>
        </div>
        <Link href="/upgrade">
          <button style={{
            background: "linear-gradient(135deg,#f59e0b,#fbbf24)", color: "#fff",
            border: "none", borderRadius: "7px", padding: "6px 14px",
            fontWeight: 800, fontSize: "12px", cursor: "pointer", whiteSpace: "nowrap",
          }}>
            Ver planes →
          </button>
        </Link>
      </div>
    </div>
  );
}
