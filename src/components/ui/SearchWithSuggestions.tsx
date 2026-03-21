"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface Suggestion {
  id: string;
  title: string;
  price: number;
  currency: string;
}

interface Props {
  placeholder?: string;
  initialValue?: string;
  action: string; // URL to navigate to on submit (with ?q=...)
  extraParams?: Record<string, string>; // other query params to preserve
  style?: React.CSSProperties;
}

export function SearchWithSuggestions({ placeholder = "Buscar...", initialValue = "", action, extraParams = {}, style }: Props) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSubmit = () => {
    setShowSuggestions(false);
    const params = new URLSearchParams(extraParams);
    if (query.trim()) params.set("q", query.trim());
    else params.delete("q");
    router.push(`${action}${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <div ref={wrapRef} style={{ position: "relative", ...style }}>
      <div style={{
        display: "flex", alignItems: "center",
        border: "1.5px solid #e2e8f0", borderRadius: "8px",
        background: "#f8fafc", overflow: "visible",
      }}>
        <span style={{ paddingLeft: "12px", color: "#94a3b8", display: "flex", alignItems: "center", flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
            if (e.key === "Escape") setShowSuggestions(false);
          }}
          onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
          placeholder={placeholder}
          style={{
            flex: 1, border: "none", outline: "none",
            padding: "9px 10px", fontSize: "13px",
            background: "transparent", color: "#0f172a", minWidth: 0,
          }}
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setSuggestions([]); setShowSuggestions(false); handleSubmit(); }}
            style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", paddingRight: "10px", fontSize: "13px" }}
          >
            ✕
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div style={{
          position: "absolute", top: "calc(100% + 2px)", left: 0, right: 0,
          background: "#fff", border: "1.5px solid #e2e8f0",
          borderRadius: "8px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          zIndex: 200, overflow: "hidden",
        }}>
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
                background: "#fff",
              }}
              className="hover:bg-slate-50"
            >
              <span style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                <span style={{ color: "#94a3b8", flexShrink: 0 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</span>
              </span>
              <span style={{ color: "#6366f1", fontWeight: 700, fontSize: "12px", whiteSpace: "nowrap", marginLeft: "12px", flexShrink: 0 }}>
                {s.currency === "USD" ? "U$D" : "$"} {s.price.toLocaleString("es-AR")}
              </span>
            </div>
          ))}
          <div
            onMouseDown={handleSubmit}
            style={{
              padding: "9px 14px", fontSize: "12px",
              color: "#6366f1", fontWeight: 600, cursor: "pointer",
              borderTop: "1px solid #f1f5f9", background: "#f8faff", textAlign: "center",
            }}
            className="hover:bg-indigo-50"
          >
            Ver todos los resultados para "{query}"
          </div>
        </div>
      )}
    </div>
  );
}
