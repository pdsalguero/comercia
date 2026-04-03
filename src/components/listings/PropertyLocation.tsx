"use client";

import { useState, useRef, useEffect } from "react";
import PinIcon from "@/components/ui/PinIcon";

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

interface Props {
  lat?: number;
  lng?: number;
  addressStr?: string;
  onChange: (lat: number, lng: number, address: string) => void;
}

const S = {
  input: {
    flex: 1, border: "none", outline: "none",
    padding: "11px 0", fontSize: "13px", color: "#334155",
    background: "transparent", fontFamily: "inherit",
  } as React.CSSProperties,
  suggestion: {
    padding: "9px 14px", cursor: "pointer", fontSize: "12px",
    color: "#334155", lineHeight: 1.4,
    display: "flex", alignItems: "flex-start", gap: "8px",
  } as React.CSSProperties,
};

export function PropertyLocation({ lat, lng, addressStr, onChange }: Props) {
  const [query, setQuery] = useState(addressStr ?? "");
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function handleInput(value: string) {
    setQuery(value);
    clearTimeout(timerRef.current);
    setActiveIdx(-1);
    if (value.length < 4) { setSuggestions([]); setOpen(false); return; }
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value + " San Juan Argentina")}&format=json&limit=6&countrycodes=AR&addressdetails=1`,
          { headers: { "Accept-Language": "es" } }
        );
        const data: NominatimResult[] = await res.json();
        setSuggestions(data);
        setOpen(data.length > 0);
      } catch {
        setSuggestions([]);
      }
      setLoading(false);
    }, 500);
  }

  function select(r: NominatimResult) {
    setQuery(r.display_name);
    setSuggestions([]);
    setOpen(false);
    onChange(parseFloat(r.lat), parseFloat(r.lon), r.display_name);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, suggestions.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1)); }
    else if (e.key === "Enter" && activeIdx >= 0) { e.preventDefault(); select(suggestions[activeIdx]); }
    else if (e.key === "Escape") setOpen(false);
  }

  useEffect(() => {
    function h(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
  const staticMapUrl = lat && lng
    ? `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s+3483fa(${lng},${lat})/${lng},${lat},15,0/640x220@2x?access_token=${TOKEN}`
    : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {/* Address search */}
      <div ref={containerRef} style={{ position: "relative" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          border: `1.5px solid ${lat ? "#2563eb" : "#e2e8f0"}`,
          borderRadius: "8px", padding: "0 12px", background: "#fff",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <input
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            onKeyDown={handleKey}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            placeholder="Ej: Mitre 234, Capital, San Juan"
            autoComplete="off"
            style={S.input}
          />
          {loading && (
            <span style={{ fontSize: "11px", color: "#94a3b8" }}>buscando...</span>
          )}
          {!loading && lat && (
            <button
              type="button"
              onClick={() => { setQuery(""); onChange(0, 0, ""); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: "16px", lineHeight: 1, padding: 0 }}
            >×</button>
          )}
        </div>

        {/* Dropdown */}
        {open && suggestions.length > 0 && (
          <div style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
            background: "#fff", borderRadius: "8px", border: "1px solid #e2e8f0",
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)", zIndex: 100, overflow: "hidden",
          }}>
            {suggestions.map((r, i) => (
              <div
                key={i}
                onMouseDown={() => select(r)}
                onMouseEnter={() => setActiveIdx(i)}
                style={{
                  ...S.suggestion,
                  background: i === activeIdx ? "#f0f7ff" : "transparent",
                  borderBottom: i < suggestions.length - 1 ? "1px solid #f8fafc" : "none",
                }}
              >
                <PinIcon size={13} />
                <span>{r.display_name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Map preview */}
      {staticMapUrl ? (
        <div style={{ borderRadius: "10px", overflow: "hidden", border: "1.5px solid #e2e8f0" }}>
          <img
            src={staticMapUrl}
            alt="Ubicación seleccionada"
            width={640}
            height={220}
            style={{ width: "100%", height: "220px", objectFit: "cover", display: "block" }}
          />
          <div style={{
            padding: "7px 12px", background: "#f8fafc",
            fontSize: "11px", color: "#94a3b8",
            display: "flex", alignItems: "center", gap: "4px",
          }}>
            <PinIcon size={10} /> {lat?.toFixed(5)}, {lng?.toFixed(5)}
          </div>
        </div>
      ) : (
        <div style={{
          height: "150px", borderRadius: "10px",
          border: "1.5px dashed #e2e8f0", background: "#f8fafc",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: "6px",
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <span style={{ fontSize: "12px", color: "#94a3b8" }}>Escribí la dirección para georreferenciar el inmueble</span>
        </div>
      )}
    </div>
  );
}
