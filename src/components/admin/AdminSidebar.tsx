"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const NAV = [
  { href: "/admin",               label: "Dashboard",     icon: "📊" },
  { href: "/admin/usuarios",      label: "Usuarios",      icon: "👥" },
  { href: "/admin/publicaciones", label: "Publicaciones", icon: "📋" },
  { href: "/admin/pagos",         label: "Pagos",         icon: "💰" },
  { href: "/admin/resenas",       label: "Reseñas",       icon: "⭐" },
];

interface Props {
  admin: { name: string; avatar: string | null };
}

export function AdminSidebar({ admin }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const sidebarContent = (
    <aside style={{
      width: "220px",
      minHeight: "100%",
      background: "#0f172a",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ fontSize: "13px", fontWeight: 800, color: "#f97316", letterSpacing: "0.05em" }}>
          COMERXIA
        </div>
        <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 600, marginTop: "2px" }}>
          Panel de Administración
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 0" }}>
        {NAV.map(({ href, label, icon }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link key={href} href={href} style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "12px 20px", margin: "2px 8px", borderRadius: "8px",
                background: active ? "rgba(249,115,22,0.15)" : "transparent",
                cursor: "pointer", transition: "background 0.15s",
                minHeight: "44px",
              }}>
                <span style={{ fontSize: "16px" }}>{icon}</span>
                <span style={{
                  fontSize: "14px",
                  fontWeight: active ? 700 : 400,
                  color: active ? "#f97316" : "#94a3b8",
                }}>
                  {label}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Admin info */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "50%",
            background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "15px", color: "#f97316", fontWeight: 700, flexShrink: 0, overflow: "hidden",
          }}>
            {admin.avatar
              ? <img src={admin.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : (admin.name?.[0] ?? "A").toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {admin.name}
            </div>
            <div style={{ fontSize: "10px", color: "#475569" }}>Administrador</div>
          </div>
        </div>
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{
            marginTop: "12px", fontSize: "12px", color: "#64748b",
            textAlign: "center", cursor: "pointer", padding: "8px",
          }}>
            ← Volver al sitio
          </div>
        </Link>
      </div>
    </aside>
  );

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────── */}
      <div className="admin-sidebar-desktop">
        {sidebarContent}
      </div>

      {/* ── Mobile top bar ──────────────────────────────────── */}
      <div className="admin-topbar-mobile">
        <button
          onClick={() => setOpen(true)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            padding: "10px", display: "flex", alignItems: "center",
            minWidth: "44px", minHeight: "44px", justifyContent: "center",
          }}
          aria-label="Abrir menú"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <span style={{ fontSize: "14px", fontWeight: 800, color: "#f97316" }}>COMERXIA Admin</span>
        <div style={{ width: "44px" }} />
      </div>

      {/* ── Mobile drawer overlay ────────────────────────────── */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)",
          }}
        />
      )}
      <div
        className="admin-drawer-mobile"
        style={{
          position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 201,
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s ease",
          width: "240px",
        }}
      >
        {sidebarContent}
      </div>

      <style>{`
        .admin-sidebar-desktop { display: none; }
        .admin-topbar-mobile {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 12px; height: 52px;
          background: #fff; border-bottom: 1px solid #e2e8f0;
          position: sticky; top: 0; z-index: 100;
          width: 100%;
        }
        .admin-drawer-mobile { display: block; }
        @media (min-width: 768px) {
          .admin-sidebar-desktop { display: flex; }
          .admin-topbar-mobile { display: none; }
          .admin-drawer-mobile { display: none; }
        }
      `}</style>
    </>
  );
}
