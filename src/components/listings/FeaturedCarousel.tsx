"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Crown } from "lucide-react";
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
  bumped_at?: string | null;
  is_store?: boolean | null;
  store_name?: string | null;
  photo_count?: number | null;
  photos?: string[] | null;
  price_drop_pct?: number | null;
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
          <span style={{ fontWeight: 800, fontSize: "15px", color: "#0f172a", display: "flex", alignItems: "center", gap: "7px" }}>
            <Crown size={17} strokeWidth={1.9} color="#d97706" />
            {title}
          </span>
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
          <Link href={href} style={{ fontSize: "12px", color: "#1d6fb8", textDecoration: "none", fontWeight: 600 }}>
            Ver todos →
          </Link>
        </div>
      </div>

      {/* Cards — los primeros 4 se marcan priority para mejorar LCP */}
      <div className="grid-cols-4 featured-cards">
        {visible.map((l, i) => (
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
            bumped_at={l.bumped_at ?? null}
            is_store={l.is_store ?? null}
            store_name={l.store_name ?? null}
            photo_count={l.photo_count ?? null}
            photos={l.photos ?? null}
            priceDropPct={l.price_drop_pct ?? null}
            priority={index === 0 && i < 4}
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

    </div>
  );
}
