"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

const PROVINCES = [
  "Todo el país",
  "Buenos Aires","CABA","Catamarca","Chaco","Chubut","Córdoba",
  "Corrientes","Entre Ríos","Formosa","Jujuy","La Pampa","La Rioja",
  "Mendoza","Misiones","Neuquén","Río Negro","Salta","San Juan",
  "San Luis","Santa Cruz","Santa Fe","Santiago del Estero",
  "Tierra del Fuego","Tucumán",
];

interface Suggestion {
  id: string;
  title: string;
  price: number;
  currency: string;
}

interface TopSubcat {
  label: string;
  href: string;
  icon: string;
}

export function HeroSearch({ topSubcats }: { topSubcats: TopSubcat[] }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputWrapRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Update rect whenever dropdown should be shown
  useEffect(() => {
    if (showSuggestions && inputWrapRef.current) {
      setRect(inputWrapRef.current.getBoundingClientRect());
    }
  }, [showSuggestions, suggestions]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/listings/search-suggestions?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      setSuggestions(data);
      setShowSuggestions(true);
    }, 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        searchRef.current && !searchRef.current.contains(e.target as Node) &&
        !(e.target as Element)?.closest?.("[data-hero-dropdown]")
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = () => {
    if (query.trim()) {
      setShowSuggestions(false);
      router.push(`/listings?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const dropdown = showSuggestions && suggestions.length > 0 && rect ? createPortal(
    <div
      data-hero-dropdown
      style={{
        position: "fixed",
        top: rect.bottom,
        left: rect.left,
        width: rect.width,
        background: "#fff",
        border: "1.5px solid #e2e8f0",
        borderTop: "none",
        borderRadius: "0 0 10px 10px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        zIndex: 99999,
        overflow: "hidden",
      }}
    >
      {suggestions.map((s, i) => (
        <div
          key={s.id}
          onMouseDown={() => {
            setShowSuggestions(false);
            router.push(`/listings/${s.id}`);
          }}
          style={{
            padding: "10px 14px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            cursor: "pointer",
            borderTop: i > 0 ? "1px solid #f1f5f9" : "none",
            fontSize: "13px", color: "#0f172a",
          }}
          className="hover:bg-slate-50"
        >
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#94a3b8" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
            {s.title}
          </span>
          <span style={{ color: "#6366f1", fontWeight: 700, fontSize: "12px", whiteSpace: "nowrap", marginLeft: "12px" }}>
            {s.currency === "USD" ? "U$D" : "$"} {s.price.toLocaleString("es-AR")}
          </span>
        </div>
      ))}
      <div
        onMouseDown={handleSearch}
        style={{
          padding: "9px 14px", fontSize: "12px",
          color: "#6366f1", fontWeight: 600, cursor: "pointer",
          borderTop: "1px solid #f1f5f9", background: "#f8faff", textAlign: "center",
        }}
        className="hover:bg-indigo-50"
      >
        Ver todos los resultados para "{query}"
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div style={{
      flex: 1, margin: "18px",
      background: "rgba(255,255,255,0.97)",
      borderRadius: "12px", padding: "20px 22px",
      backdropFilter: "blur(8px)",
      boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
    }}>
      <div style={{ fontSize: "22px", fontWeight: 900, color: "#0f172a", marginBottom: "14px", lineHeight: 1.2 }}>
        ✨ Comprá y vendé usados con IA
      </div>

      {/* Search row */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
        {/* Text input with suggestions */}
        <div ref={searchRef} style={{ flex: 1, minWidth: 0, position: "relative" }}>
          <div ref={inputWrapRef} style={{
            display: "flex", alignItems: "center", gap: "8px",
            border: "1.5px solid #e2e8f0",
            borderRadius: "10px",
            padding: "0 14px", background: "#fff",
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
                if (e.key === "Escape") setShowSuggestions(false);
              }}
              onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
              placeholder="¿Qué estás buscando hoy?"
              style={{
                flex: 1, border: "none", outline: "none", fontSize: "14px",
                background: "transparent", padding: "11px 0", color: "#333",
              }}
            />
            {query && (
              <button
                onClick={() => { setQuery(""); setSuggestions([]); setShowSuggestions(false); }}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "14px", padding: 0 }}
              >
                ✕
              </button>
            )}
          </div>
          {dropdown}
        </div>

        {/* Province select */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <select name="province" defaultValue="San Juan" style={{
            appearance: "none", WebkitAppearance: "none",
            border: "1.5px solid #e2e8f0", borderRadius: "10px",
            padding: "0 26px 0 30px", height: "44px", width: "140px",
            fontSize: "13px", fontWeight: 600, color: "#475569",
            background: "#fff", cursor: "pointer", outline: "none",
            fontFamily: "inherit",
          }}>
            {PROVINCES.map(p => <option key={p} value={p === "Todo el país" ? "" : p}>{p}</option>)}
          </select>
          <span style={{ position: "absolute", left: "9px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", display: "flex", alignItems: "center" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
          </span>
          <span style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", display: "flex", alignItems: "center" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </span>
        </div>

        <button
          onClick={handleSearch}
          style={{
            background: "#f97316", color: "#fff", border: "none",
            borderRadius: "10px", padding: "0 20px", height: "44px",
            fontWeight: 700, fontSize: "14px", cursor: "pointer",
            display: "flex", alignItems: "center", gap: "6px",
            boxShadow: "0 4px 14px rgba(249,115,22,0.35)", whiteSpace: "nowrap",
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          Buscar
        </button>
      </div>

      {/* Quick category pills */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {topSubcats.map(cat => (
          <Link key={cat.label} href={cat.href} style={{ textDecoration: "none" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "5px",
              background: "#f8fafc", border: "1.5px solid #e2e8f0",
              borderRadius: "20px", padding: "5px 12px",
              fontSize: "12px", fontWeight: 600, color: "#334155",
              cursor: "pointer",
            }}>
              <span>{cat.icon}</span> {cat.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
