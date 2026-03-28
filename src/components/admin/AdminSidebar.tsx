"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin",                label: "Dashboard",      icon: "📊" },
  { href: "/admin/usuarios",       label: "Usuarios",       icon: "👥" },
  { href: "/admin/publicaciones",  label: "Publicaciones",  icon: "📋" },
];

interface Props {
  admin: { name: string; avatar: string | null };
}

export function AdminSidebar({ admin }: Props) {
  const pathname = usePathname();

  return (
    <aside style={{
      width: "220px",
      minHeight: "100vh",
      background: "#0f172a",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ fontSize: "13px", fontWeight: 800, color: "#f97316", letterSpacing: "0.05em" }}>
          COMERCIA
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
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 20px",
                margin: "2px 8px",
                borderRadius: "8px",
                background: active ? "rgba(249,115,22,0.15)" : "transparent",
                cursor: "pointer",
                transition: "background 0.15s",
              }}>
                <span style={{ fontSize: "15px" }}>{icon}</span>
                <span style={{
                  fontSize: "13px",
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
            width: "32px", height: "32px", borderRadius: "50%",
            background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "14px", color: "#f97316", fontWeight: 700, flexShrink: 0,
          }}>
            {admin.avatar
              ? <img src={admin.avatar} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
              : (admin.name?.[0] ?? "A").toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "#e2e8f0" }}>{admin.name}</div>
            <div style={{ fontSize: "10px", color: "#475569" }}>Administrador</div>
          </div>
        </div>
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{
            marginTop: "12px", fontSize: "11px", color: "#64748b",
            textAlign: "center", cursor: "pointer",
          }}>
            ← Volver al sitio
          </div>
        </Link>
      </div>
    </aside>
  );
}
