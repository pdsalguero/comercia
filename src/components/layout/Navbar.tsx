"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

export function Navbar({ user, hideSearch }: { user?: User | null; hideSearch?: boolean }) {
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

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
            style={{
              flex: 1,
              maxWidth: "480px",
              margin: "0 auto",
              display: hideSearch ? "none" : "flex",
              alignItems: "center",
              background: "#f8fafc",
              border: "1.5px solid #e2e8f0",
              borderRadius: "10px",
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
                onClick={() => setQuery("")}
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
            { name: "Vehículos",  slug: "vehicles" },
            { name: "Inmuebles",  slug: "real-estate" },
            { name: "Tecnología", slug: "electronics" },
            { name: "Ropa", slug: "clothing" },
            { name: "Hogar", slug: "home-garden" },
            { name: "Deportes", slug: "sports" },
            { name: "Herramientas", slug: "tools" },
            { name: "Libros", slug: "books" },
            { name: "Mascotas", slug: "pets" },
            { name: "Otros", slug: "other" },
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
