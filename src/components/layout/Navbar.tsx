"use client";

import Link from "next/link";
import { useState } from "react";

export function Navbar() {
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

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
              comerc<span style={{ color: "#6366f1" }}>IA</span>
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
              display: "flex",
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
              placeholder="Buscar en San Juan..."
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
            <Link href="/listings/new">
              <button
                style={{
                  background: "#6366f1",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 18px",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(99,102,241,0.25)",
                  transition: "all 0.15s",
                }}
              >
                + Publicar aviso
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
            { name: "Electrónica", slug: "electronics" },
            { name: "Vehículos", slug: "vehicles" },
            { name: "Inmuebles", slug: "real-estate" },
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
              placeholder="Buscar en San Juan..."
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
          <Link href="/listings/new" onClick={() => setMenuOpen(false)}>
            <button
              style={{
                width: "100%",
                background: "#6366f1",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "11px",
                fontWeight: 700,
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              + Publicar aviso
            </button>
          </Link>
          <div style={{ display: "flex", gap: "16px" }}>
            <Link
              href="/login"
              style={{ fontSize: "14px", color: "#475569", fontWeight: 600 }}
            >
              Ingresar
            </Link>
            <Link
              href="/register"
              style={{ fontSize: "14px", color: "#475569" }}
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
