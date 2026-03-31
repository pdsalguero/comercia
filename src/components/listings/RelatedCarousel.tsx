"use client";
import { useRef } from "react";

interface Props {
  children: React.ReactNode;
  title: string;
}

export function RelatedCarousel({ children, title }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(dir: "left" | "right") {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "right" ? 480 : -480, behavior: "smooth" });
  }

  return (
    <div style={{ marginTop: "28px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#333", margin: 0 }}>
          {title}
        </h2>
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            onClick={() => scroll("left")}
            aria-label="Anterior"
            style={{
              width: "32px", height: "32px", borderRadius: "50%",
              border: "1.5px solid #e2e8f0", background: "#fff",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              color: "#64748b", flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Siguiente"
            style={{
              width: "32px", height: "32px", borderRadius: "50%",
              border: "1.5px solid #e2e8f0", background: "#fff",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              color: "#64748b", flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        style={{
          display: "flex", gap: "14px",
          overflowX: "auto", paddingBottom: "8px",
          scrollbarWidth: "none",
          scrollSnapType: "x mandatory",
        }}
      >
        {children}
      </div>

      <style>{`
        div[data-carousel] > a { scroll-snap-align: start; }
      `}</style>
    </div>
  );
}
