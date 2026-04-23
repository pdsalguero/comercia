"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/ui/Logo";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

interface Suggestion {
  id: string;
  title: string;
  price: number;
  currency: string;
}

export function Navbar({ user, hideSearch, initialUnreadCount = 0 }: { user?: User | null; hideSearch?: boolean; initialUnreadCount?: number }) {
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const CATEGORIES = [
    { name: "Vehículos",             slug: "vehicles",      active: true  },
    { name: "Inmuebles",             slug: "real-estate",   active: true  },
    { name: "Celulares",             slug: "phones",        active: false },
    { name: "Tecnología",            slug: "electronics",   active: false },
    { name: "Electrodomésticos",     slug: "appliances",    active: false },
    { name: "Ropa y Calzado",        slug: "clothing",      active: false },
    { name: "Hogar y Muebles",       slug: "home-garden",   active: false },
    { name: "Deportes",              slug: "sports",        active: false },
    { name: "Herramientas",          slug: "tools",         active: false },
    { name: "Bebés y Niños",         slug: "babies",        active: false },
    { name: "Música, Libros y Rev.", slug: "books",         active: false },
    { name: "Belleza y Salud",       slug: "beauty-health", active: false },
    { name: "Juegos y Juguetes",     slug: "toys",          active: false },
    { name: "Mascotas",              slug: "pets",          active: false },
    { name: "Servicios",             slug: "services",      active: false },
    { name: "Otros",                 slug: "other",         active: false },
  ];

  // Realtime: incrementa el badge cuando llega un mensaje nuevo
  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    const fetchUnread = async () => {
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("receiver_id", user.id)
        .eq("is_read", false);
      setUnreadCount(count ?? 0);
    };
    const channel = supabase
      .channel("navbar-unread")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `receiver_id=eq.${user.id}` }, () => {
        setUnreadCount((c) => c + 1);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages", filter: `receiver_id=eq.${user.id}` }, fetchUnread)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

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
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCatOpen(false);
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
        className="navbar-bar"
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
          <Link href="/" style={{ flexShrink: 0, textDecoration: "none", display: "flex", alignItems: "center" }}>
            <Logo height={46} />
          </Link>

          {/* Nav links — desktop */}
          <div
            className="hidden md:flex items-center gap-5"
            style={{ marginLeft: "8px" }}
          >
            {/* Categorías dropdown */}
            <div ref={catRef} style={{ position: "relative" }}>
              <button
                onClick={() => setCatOpen((o) => !o)}
                style={{
                  fontSize: "14px", color: catOpen ? "#6366f1" : "#64748b",
                  fontWeight: 500, background: "none", border: "none",
                  cursor: "pointer", display: "flex", alignItems: "center",
                  gap: "4px", padding: 0, whiteSpace: "nowrap",
                }}
              >
                Categorías
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{ transform: catOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {catOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 12px)", left: 0,
                  background: "#fff", borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                  zIndex: 200, minWidth: "220px", overflow: "hidden",
                }}>
                  {CATEGORIES.filter(c => c.active).map((cat, i) => (
                    <Link
                      key={cat.slug}
                      href={`/category/${cat.slug}`}
                      onClick={() => setCatOpen(false)}
                      style={{ textDecoration: "none" }}
                    >
                      <div style={{
                        padding: "9px 16px",
                        fontSize: "13px", color: "#334155",
                        display: "flex", alignItems: "center", gap: "10px",
                        borderTop: i > 0 ? "1px solid #f8fafc" : "none",
                        cursor: "pointer",
                      }}
                      className="hover:bg-indigo-50 hover:text-indigo-700"
                      >
                        <CategoryIcon slug={cat.slug} size={18} />
                        {cat.name}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/listings" style={{ fontSize: "14px", color: "#64748b", fontWeight: 500, whiteSpace: "nowrap" }}
              className="hover:text-indigo-600 transition-colors">
              Avisos
            </Link>
            <Link href="/tiendas" style={{ fontSize: "14px", color: "#64748b", fontWeight: 500, whiteSpace: "nowrap" }}
              className="hover:text-indigo-600 transition-colors">
              Tiendas
            </Link>
          </div>

          {/* Search bar — center */}
          <div
            ref={searchRef}
            className="navbar-search"
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
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <div style={{
                      width: "28px", height: "28px", borderRadius: "50%",
                      background: "#eef2ff", border: "1.5px solid #c7d2fe",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "12px", fontWeight: 800, color: "#6366f1",
                    }}>
                      {displayName[0].toUpperCase()}
                    </div>
                    {unreadCount > 0 && (
                      <span style={{
                        position: "absolute", top: "-2px", right: "-2px",
                        width: "9px", height: "9px", borderRadius: "50%",
                        background: "#ef4444", border: "1.5px solid #fff",
                      }} />
                    )}
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

      {/* Mobile menu — slide-in drawer */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setMenuOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 49 }}
          />

          {/* Drawer */}
          <div style={{
            position: "fixed", top: 0, right: 0,
            width: "82%", maxWidth: "320px",
            height: "auto", maxHeight: "100dvh",
            background: "#fff", zIndex: 51,
            display: "flex", flexDirection: "column",
            boxShadow: "-6px 0 32px rgba(0,0,0,0.18)",
            overflowY: "auto",
          }}>

            {/* Drawer header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 18px", borderBottom: "1px solid #f1f5f9", flexShrink: 0,
            }}>
              <Logo height={38} />
              <button
                onClick={() => setMenuOpen(false)}
                style={{
                  background: "#f1f5f9", border: "none", borderRadius: "50%",
                  width: 32, height: 32, fontSize: "15px", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "#475569",
                }}
              >
                ✕
              </button>
            </div>

            {/* User card */}
            {user ? (
              <Link href="/dashboard" onClick={() => setMenuOpen(false)} style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "14px 18px", borderBottom: "1px solid #f1f5f9",
                  background: "#fafbff",
                }}>
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: "50%",
                      background: "linear-gradient(135deg, #6366f1, #818cf8)",
                      color: "#fff", display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: "17px", fontWeight: 800,
                    }}>
                      {displayName[0].toUpperCase()}
                    </div>
                    {unreadCount > 0 && (
                      <span style={{
                        position: "absolute", top: 0, right: 0,
                        width: "12px", height: "12px", borderRadius: "50%",
                        background: "#ef4444", border: "2px solid #fff",
                      }} />
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontWeight: 700, fontSize: "14px", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {displayName}
                      </span>
                      {unreadCount > 0 && (
                        <span style={{
                          background: "#ef4444", color: "#fff",
                          fontSize: "10px", fontWeight: 700,
                          padding: "1px 5px", borderRadius: "20px", flexShrink: 0,
                        }}>
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "12px", color: "#6366f1", fontWeight: 600 }}>
                      Ver mi perfil →
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <div style={{
                display: "flex", gap: "8px",
                padding: "14px 18px", borderBottom: "1px solid #f1f5f9",
              }}>
                <Link href="/login" onClick={() => setMenuOpen(false)} style={{ textDecoration: "none", flex: 1 }}>
                  <button style={{
                    width: "100%", padding: "9px", borderRadius: "8px",
                    border: "1.5px solid #e2e8f0", background: "#fff",
                    fontSize: "13px", fontWeight: 600, color: "#475569", cursor: "pointer",
                  }}>
                    Ingresar
                  </button>
                </Link>
                <Link href="/register" onClick={() => setMenuOpen(false)} style={{ textDecoration: "none", flex: 1 }}>
                  <button style={{
                    width: "100%", padding: "9px", borderRadius: "8px",
                    border: "none", background: "#eef2ff",
                    fontSize: "13px", fontWeight: 600, color: "#6366f1", cursor: "pointer",
                  }}>
                    Crear cuenta
                  </button>
                </Link>
              </div>
            )}

            {/* Tabs: Avisos | Tiendas */}
            <div style={{ display: "flex", borderBottom: "1px solid #f1f5f9", flexShrink: 0 }}>
              {[
                { label: "Avisos", href: "/listings" },
                { label: "Tiendas", href: "/tiendas" },
              ].map((tab) => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  onClick={() => setMenuOpen(false)}
                  style={{ textDecoration: "none", flex: 1, textAlign: "center" }}
                >
                  <div style={{
                    padding: "12px 0",
                    fontSize: "14px", fontWeight: 600,
                    color: "#64748b",
                    borderBottom: "2px solid transparent",
                  }}
                  className="hover:text-indigo-600"
                  >
                    {tab.label}
                  </div>
                </Link>
              ))}
            </div>

            {/* Body */}
            <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {/* Publish CTA */}
              <Link href="/listings/new" onClick={() => setMenuOpen(false)} style={{ textDecoration: "none" }}>
                <button style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #f97316, #fb923c)",
                  color: "#fff", border: "none", borderRadius: "10px",
                  padding: "14px", fontWeight: 800, fontSize: "15px",
                  cursor: "pointer", display: "flex", alignItems: "center",
                  justifyContent: "center", gap: "8px",
                  boxShadow: "0 3px 12px rgba(249,115,22,0.35)",
                }}>
                  ⚡ Publicar nuevo aviso
                </button>
              </Link>

              {/* Quick nav */}
              <div style={{ marginTop: "6px", display: "flex", flexDirection: "column", gap: "2px" }}>
                {CATEGORIES.filter(c => c.active).map((cat) => (
                  <Link key={cat.slug} href={`/category/${cat.slug}`} onClick={() => setMenuOpen(false)} style={{ textDecoration: "none" }}>
                    <div style={{
                      display: "flex", alignItems: "center", gap: "10px",
                      padding: "9px 10px", borderRadius: "8px", fontSize: "13px",
                      color: "#475569", fontWeight: 500,
                    }}
                    className="hover:bg-slate-50 hover:text-indigo-600"
                    >
                      <CategoryIcon slug={cat.slug} size={16} />
                      {cat.name}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Footer */}
            {user && (
              <div style={{
                padding: "12px 18px", borderTop: "1px solid #f1f5f9", flexShrink: 0,
              }}>
                <button
                  onClick={() => { handleSignOut(); setMenuOpen(false); }}
                  style={{
                    width: "100%", background: "none", border: "1.5px solid #fee2e2",
                    borderRadius: "8px", padding: "9px", fontSize: "13px",
                    fontWeight: 600, color: "#ef4444", cursor: "pointer",
                  }}
                >
                  Cerrar sesión
                </button>
              </div>
            )}

            <div style={{
              padding: "10px 18px", background: "#6366f1", flexShrink: 0,
              textAlign: "center",
            }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#fff" }}>El marketplace inteligente con IA</div>
              <div style={{ fontSize: "11px", color: "#c7d2fe" }}>Subi foto • IA redacta</div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
