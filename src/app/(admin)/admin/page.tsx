import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: totalListings },
    { count: activeListings },
    { count: removedListings },
    { count: totalUsers },
    { count: blockedUsers },
    { count: totalStores },
  ] = await Promise.all([
    supabase.from("listings").select("*", { count: "exact", head: true }),
    supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "removed"),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_blocked", true),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_store", true),
  ]);

  // Recent listings
  const { data: recentListings } = await supabase
    .from("listings")
    .select("id, title, status, created_at, category_id, price, currency")
    .order("created_at", { ascending: false })
    .limit(8);

  // Recent users
  const { data: recentUsers } = await supabase
    .from("profiles")
    .select("id, full_name, username, created_at, is_blocked, is_verified")
    .order("created_at", { ascending: false })
    .limit(8);

  const stats = [
    { label: "Publicaciones totales", value: totalListings ?? 0, icon: "📋", color: "#6366f1", bg: "#eef2ff" },
    { label: "Publicaciones activas", value: activeListings ?? 0, icon: "✅", color: "#10b981", bg: "#ecfdf5" },
    { label: "Publicaciones removidas", value: removedListings ?? 0, icon: "🚫", color: "#ef4444", bg: "#fef2f2" },
    { label: "Usuarios registrados", value: totalUsers ?? 0, icon: "👥", color: "#3b82f6", bg: "#eff6ff" },
    { label: "Usuarios bloqueados", value: blockedUsers ?? 0, icon: "🔒", color: "#f59e0b", bg: "#fffbeb" },
    { label: "Tiendas activas", value: totalStores ?? 0, icon: "🏪", color: "#8b5cf6", bg: "#f5f3ff" },
  ];

  return (
    <div>
      <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>
        Dashboard
      </h1>
      <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "28px" }}>
        Resumen general del sitio
      </p>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "32px" }}>
        {stats.map((s) => (
          <div key={s.label} style={{
            background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0",
            padding: "18px 20px", display: "flex", alignItems: "center", gap: "14px",
          }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "10px",
              background: s.bg, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "20px", flexShrink: 0,
            }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: s.color }}>{s.value.toLocaleString("es-AR")}</div>
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "1px" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Recent listings */}
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 700, fontSize: "13px", color: "#0f172a" }}>Últimas publicaciones</span>
            <a href="/admin/publicaciones" style={{ fontSize: "11px", color: "#6366f1", textDecoration: "none", fontWeight: 600 }}>Ver todas →</a>
          </div>
          {(recentListings ?? []).map((l: any) => (
            <div key={l.id} style={{ padding: "10px 18px", borderBottom: "1px solid #f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: "12px", color: "#334155", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "60%" }}>
                {l.title}
              </div>
              <span style={{
                fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px",
                background: l.status === "active" ? "#ecfdf5" : l.status === "removed" ? "#fef2f2" : "#f1f5f9",
                color: l.status === "active" ? "#10b981" : l.status === "removed" ? "#ef4444" : "#64748b",
              }}>
                {l.status}
              </span>
            </div>
          ))}
        </div>

        {/* Recent users */}
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 700, fontSize: "13px", color: "#0f172a" }}>Últimos usuarios</span>
            <a href="/admin/usuarios" style={{ fontSize: "11px", color: "#6366f1", textDecoration: "none", fontWeight: 600 }}>Ver todos →</a>
          </div>
          {(recentUsers ?? []).map((u: any) => (
            <div key={u.id} style={{ padding: "10px 18px", borderBottom: "1px solid #f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "12px", color: "#334155", fontWeight: 500 }}>{u.full_name ?? u.username ?? "Sin nombre"}</div>
                <div style={{ fontSize: "10px", color: "#94a3b8" }}>@{u.username ?? "—"}</div>
              </div>
              {u.is_blocked && (
                <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px", background: "#fef2f2", color: "#ef4444" }}>
                  BLOQUEADO
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
