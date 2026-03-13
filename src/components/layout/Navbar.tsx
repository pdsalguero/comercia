"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

interface Suggestion {
  id: string;
  title: string;
  price: number;
  currency: string;
}

export function Navbar({ user, hideSearch }: { user?: User | null; hideSearch?: boolean }) {
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fetch suggestions with debounce
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

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
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

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const displayName =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email?.split("@")[0] ??
    "Mi cuenta";

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 50 }}>
      {/* Main bar — white */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #e2e8f0",
          padding: "0 24px",
          height: "60px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ flexShrink: 0 }}>
            <span
              style={{
                fontSize: "22px",
                fontWeight: 900,
                color: "#0f172a",
                letterSpacing: "-0.5px",
              }}
            >
              Comerx<span style={{ color: "#6366f1" }}>IA</span>
            </span>
          </Link>

          {/* Nav links — desktop */}
          <div
            className="hidden md:flex items-center gap-5"
            style={{ marginLeft: "8px" }}
          >
            {[
              { label: "Avisos", href: "/listings" },
              { label: "Categorías", href: "/listings" },
              { label: "Vendedores", href: "/listings" },
            ].map((l) => (
              <Link
                key={l.href + l.label}
                href={l.href}
                style={{
                  fontSize: "14px",
                  color: "#64748b",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                }}
                className="hover:text-indigo-600 transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Search bar — center */}
          <div
            ref={searchRef}
            style={{
              flex: 1,
              maxWidth: "480px",
              margin: "0 auto",
              display: hideSearch ? "none" : "block",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#f8fafc",
                border: "1.5px solid #e2e8f0",
                borderRadius: showSuggestions && suggestions.length > 0 ? "10px 10px 0 0" : "10px",
                overflow: "hidden",
                transition: "border-color 0.15s",
              }}
            >
              <span
                style={{
                  paddingLeft: "14px",
                  fontSize: "16px",
                  color: "#94a3b8",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                🔍
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                  if (e.key === "Escape") setShowSuggestions(false);
                }}
                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                placeholder="¿Qué estás buscando?"
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  padding: "10px 12px",
                  fontSize: "14px",
                  color: "#0f172a",
                  background: "transparent",
                }}
              />
              {query && (
                <button
                  onClick={() => { setQuery(""); setSuggestions([]); setShowSuggestions(false); }}
                  style={{
                    paddingRight: "12px",
                    background: "none",
                    border: "none",
                    color: "#94a3b8",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  background: "#fff",
                  border: "1.5px solid #e2e8f0",
                  borderTop: "none",
                  borderRadius: "0 0 10px 10px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
                  zIndex: 100,
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
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      borderTop: i > 0 ? "1px solid #f1f5f9" : "none",
                      fontSize: "13px",
                      color: "#0f172a",
                    }}
                    className="hover:bg-slate-50"
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ color: "#94a3b8", fontSize: "12px" }}>🔍</span>
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
                    padding: "9px 14px",
                    fontSize: "12px",
                    color: "#6366f1",
                    fontWeight: 600,
                    cursor: "pointer",
                    borderTop: "1px solid #f1f5f9",
                    background: "#f8faff",
                    textAlign: "center",
                  }}
                  className="hover:bg-indigo-50"
                >
                  Ver todos los resultados para "{query}"
                </div>
              </div>
            )}
          </div>

          {/* Actions — desktop */}
          <div
            className="hidden md:flex items-center gap-3"
            style={{ flexShrink: 0, marginLeft: "auto" }}
          >
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  style={{ fontSize: "14px", color: "#475569", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}
                  className="hover:text-indigo-600"
                >
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "50%",
                    background: "#eef2ff", border: "1.5px solid #c7d2fe",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "12px", fontWeight: 800, color: "#6366f1",
                  }}>
                    {displayName[0].toUpperCase()}
                  </div>
                  {displayName}
                </Link>
                <button
                  onClick={handleSignOut}
                  style={{ fontSize: "14px", color: "#94a3b8", fontWeight: 500, background: "none", border: "none", cursor: "pointer" }}
                  className="hover:text-red-500"
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  style={{ fontSize: "14px", color: "#475569", fontWeight: 600 }}
                  className="hover:text-indigo-600"
                >
                  Ingresar
                </Link>
                <Link
                  href="/register"
                  style={{ fontSize: "14px", color: "#475569" }}
                  className="hover:text-indigo-600"
                >
                  Crear cuenta
                </Link>
              </>
            )}
            <Link href="/listings/new">
              <button
                style={{
                  background: "linear-gradient(135deg, #f97316, #fb923c)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontWeight: 800,
                  fontSize: "13px",
                  cursor: "pointer",
                  boxShadow: "0 2px 10px rgba(249,115,22,0.35)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  whiteSpace: "nowrap",
                }}
              >
                📸 Publicar con IA
                <span style={{
                  background: "rgba(255,255,255,0.25)",
                  borderRadius: "4px",
                  padding: "1px 5px",
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                }}>GRATIS</span>
              </button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 ml-auto"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: "none",
              border: "none",
              fontSize: "22px",
              cursor: "pointer",
              color: "#475569",
            }}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Category nav — subtle */}
      <div
        style={{ background: "#fff", borderBottom: "1px solid #f1f5f9" }}
        className="hidden md:block"
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            gap: "24px",
            overflowX: "auto",
          }}
        >
          {[
            { name: "Vehículos",     slug: "vehicles" },
            { name: "Inmuebles",     slug: "real-estate" },
            { name: "Celulares",     slug: "phones" },
            { name: "Electrónica",   slug: "electronics" },
            { name: "Electrod.",     slug: "appliances" },
            { name: "Ropa",          slug: "clothing" },
            { name: "Hogar",         slug: "home-garden" },
            { name: "Deportes",      slug: "sports" },
            { name: "Herramientas",  slug: "tools" },
            { name: "Bebés",         slug: "babies" },
            { name: "Libros",        slug: "books" },
            { name: "Belleza",       slug: "beauty-health" },
            { name: "Mascotas",      slug: "pets" },
            { name: "Otros",         slug: "other" },
          ].map((cat) => (
            <Link key={cat.slug} href={`/category/${cat.slug}`}>
              <span
                style={{
                  display: "inline-block",
                  padding: "8px 2px",
                  fontSize: "13px",
                  color: "#64748b",
                  whiteSpace: "nowrap",
                  borderBottom: "2px solid transparent",
                  transition: "all 0.15s",
                }}
                className="hover:text-indigo-600 hover:border-indigo-400"
              >
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          style={{
            background: "#fff",
            borderTop: "1px solid #f1f5f9",
            padding: "16px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
          className="md:hidden"
        >
          {!hideSearch && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                overflow: "hidden",
              }}
            >
              <span style={{ paddingLeft: "12px", color: "#94a3b8" }}>🔍</span>
              <input
                type="text"
                placeholder="¿Qué estás buscando?"
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  padding: "10px 12px",
                  fontSize: "14px",
                  background: "transparent",
                }}
              />
            </div>
          )}
          <Link href="/listings/new" onClick={() => setMenuOpen(false)}>
            <button
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #f97316, #fb923c)",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "11px",
                fontWeight: 800,
                fontSize: "14px",
                cursor: "pointer",
                boxShadow: "0 2px 10px rgba(249,115,22,0.3)",
              }}
            >
              📸 Publicar con IA — Gratis
            </button>
          </Link>
          {user ? (
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <Link href="/dashboard" style={{ fontSize: "14px", color: "#475569", fontWeight: 600 }}>
                👤 {displayName}
              </Link>
              <button
                onClick={handleSignOut}
                style={{ fontSize: "14px", color: "#94a3b8", background: "none", border: "none", cursor: "pointer" }}
              >
                Salir
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "16px" }}>
              <Link href="/login" style={{ fontSize: "14px", color: "#475569", fontWeight: 600 }}>
                Ingresar
              </Link>
              <Link href="/register" style={{ fontSize: "14px", color: "#475569" }}>
                Crear cuenta
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
