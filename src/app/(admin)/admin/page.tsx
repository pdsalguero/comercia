import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const service  = createServiceClient();

  const todayStart = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();

  const [
    { count: totalListings },
    { count: activeListings },
    { count: removedListings },
    { count: totalUsers },
    { count: blockedUsers },
    { count: totalStores },
    { count: landingViews },
    { count: landingViewsToday },
  ] = await Promise.all([
    supabase.from("listings").select("*", { count: "exact", head: true }),
    supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "removed"),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_blocked", true),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_store", true),
    service.from("page_views").select("*", { count: "exact", head: true }).eq("page", "landing"),
    service.from("page_views").select("*", { count: "exact", head: true }).eq("page", "landing").gte("created_at", todayStart),
  ]);

  // Visitor analytics
  const { data: viewsRaw } = await service
    .from("page_views")
    .select("device_type, browser, referrer, country, language, ip_hash, created_at")
    .eq("page", "landing")
    .order("created_at", { ascending: false })
    .limit(500);

  const views = viewsRaw ?? [];

  // Unique visitors (by ip_hash)
  const uniqueVisitors = new Set(views.map((v: any) => v.ip_hash).filter(Boolean)).size;
  const uniqueToday    = new Set(
    views.filter((v: any) => v.created_at >= todayStart).map((v: any) => v.ip_hash).filter(Boolean)
  ).size;

  // Device breakdown
  const deviceCount = views.reduce((acc: any, v: any) => {
    const d = v.device_type ?? "unknown";
    acc[d] = (acc[d] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Browser breakdown
  const browserCount = views.reduce((acc: any, v: any) => {
    const b = v.browser ?? "other";
    acc[b] = (acc[b] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Referrer breakdown (top 5, clean domain)
  const refCount = views.reduce((acc: any, v: any) => {
    let ref = v.referrer;
    if (!ref) { acc["directo"] = (acc["directo"] ?? 0) + 1; return acc; }
    try { ref = new URL(ref).hostname.replace("www.", ""); } catch {}
    acc[ref] = (acc[ref] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topReferrers = Object.entries(refCount)
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 5);

  // Hourly visits (last 24h)
  const hourlyMap: Record<number, number> = {};
  const now = Date.now();
  views
    .filter((v: any) => new Date(v.created_at).getTime() > now - 24 * 3600 * 1000)
    .forEach((v: any) => {
      const h = new Date(v.created_at).getHours();
      hourlyMap[h] = (hourlyMap[h] ?? 0) + 1;
    });
  const maxHourly = Math.max(1, ...Object.values(hourlyMap));

  // Recent views (last 10)
  const recentViews = views.slice(0, 10);

  // Recent listings & users
  const { data: recentListings } = await supabase
    .from("listings")
    .select("id, title, status, created_at")
    .order("created_at", { ascending: false })
    .limit(6);

  const { data: recentUsers } = await supabase
    .from("profiles")
    .select("id, full_name, username, created_at, is_blocked")
    .order("created_at", { ascending: false })
    .limit(6);

  const stats = [
    { label: "Publicaciones totales", value: totalListings ?? 0,   icon: "📋", color: "#6366f1", bg: "#eef2ff" },
    { label: "Publicaciones activas", value: activeListings ?? 0,  icon: "✅", color: "#10b981", bg: "#ecfdf5" },
    { label: "Removidas",             value: removedListings ?? 0, icon: "🚫", color: "#ef4444", bg: "#fef2f2" },
    { label: "Usuarios",              value: totalUsers ?? 0,      icon: "👥", color: "#3b82f6", bg: "#eff6ff" },
    { label: "Bloqueados",            value: blockedUsers ?? 0,    icon: "🔒", color: "#f59e0b", bg: "#fffbeb" },
    { label: "Tiendas",               value: totalStores ?? 0,     icon: "🏪", color: "#8b5cf6", bg: "#f5f3ff" },
    { label: "Visitas landing",       value: landingViews ?? 0,    icon: "👁", color: "#0ea5e9", bg: "#f0f9ff" },
    { label: "Visitas hoy",           value: landingViewsToday ?? 0, icon: "📅", color: "#FF8C00", bg: "#fff7ed" },
    { label: "Visitantes únicos",     value: uniqueVisitors,       icon: "🙋", color: "#14b8a6", bg: "#f0fdfa" },
    { label: "Únicos hoy",            value: uniqueToday,          icon: "✨", color: "#a855f7", bg: "#faf5ff" },
  ];

  const DEVICE_ICON: Record<string, string> = { mobile: "📱", tablet: "📲", desktop: "🖥️", unknown: "❓" };
  const BROWSER_ICON: Record<string, string> = { chrome: "🟡", safari: "🔵", firefox: "🟠", edge: "🔷", opera: "🔴", other: "⚪" };

  return (
    <div>
      <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", marginBottom: "4px" }}>Dashboard</h1>
      <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "24px" }}>Resumen general del sitio</p>

      {/* ── Stats grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", marginBottom: "28px" }}>
        {stats.map((s) => (
          <div key={s.label} style={{
            background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0",
            padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px",
          }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "10px",
              background: s.bg, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "18px", flexShrink: 0,
            }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value.toLocaleString("es-AR")}</div>
              <div style={{ fontSize: "10px", color: "#64748b", marginTop: "3px" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Visitor analytics ── */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", marginBottom: "14px" }}>Analítica de visitantes — landing</h2>

        <div className="admin-analytics-grid">

          {/* Dispositivos */}
          <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "16px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Dispositivos</div>
            {Object.entries(deviceCount).sort((a: any, b: any) => b[1] - a[1]).map(([device, count]: any) => (
              <div key={device} style={{ marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ fontSize: "13px", color: "#334155", display: "flex", alignItems: "center", gap: "6px" }}>
                    {DEVICE_ICON[device] ?? "❓"} {device}
                  </span>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>
                    {count} <span style={{ color: "#94a3b8", fontWeight: 400 }}>({Math.round(count / Math.max(1, views.length) * 100)}%)</span>
                  </span>
                </div>
                <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "3px" }}>
                  <div style={{ height: "100%", width: `${Math.round(count / Math.max(1, views.length) * 100)}%`, background: "#6366f1", borderRadius: "3px", transition: "width 0.3s" }} />
                </div>
              </div>
            ))}
            {Object.keys(deviceCount).length === 0 && <p style={{ fontSize: "12px", color: "#94a3b8" }}>Sin datos aún</p>}
          </div>

          {/* Navegadores */}
          <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "16px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Navegadores</div>
            {Object.entries(browserCount).sort((a: any, b: any) => b[1] - a[1]).map(([browser, count]: any) => (
              <div key={browser} style={{ marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ fontSize: "13px", color: "#334155", display: "flex", alignItems: "center", gap: "6px" }}>
                    {BROWSER_ICON[browser] ?? "⚪"} {browser}
                  </span>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>
                    {count} <span style={{ color: "#94a3b8", fontWeight: 400 }}>({Math.round(count / Math.max(1, views.length) * 100)}%)</span>
                  </span>
                </div>
                <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "3px" }}>
                  <div style={{ height: "100%", width: `${Math.round(count / Math.max(1, views.length) * 100)}%`, background: "#f97316", borderRadius: "3px" }} />
                </div>
              </div>
            ))}
            {Object.keys(browserCount).length === 0 && <p style={{ fontSize: "12px", color: "#94a3b8" }}>Sin datos aún</p>}
          </div>

          {/* Referrers */}
          <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "16px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Origen del tráfico</div>
            {topReferrers.map(([ref, count]: any) => (
              <div key={ref} style={{ marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ fontSize: "13px", color: "#334155", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "65%" }}>
                    🔗 {ref}
                  </span>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a", flexShrink: 0 }}>
                    {count} <span style={{ color: "#94a3b8", fontWeight: 400 }}>({Math.round(count / Math.max(1, views.length) * 100)}%)</span>
                  </span>
                </div>
                <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "3px" }}>
                  <div style={{ height: "100%", width: `${Math.round(count / Math.max(1, views.length) * 100)}%`, background: "#10b981", borderRadius: "3px" }} />
                </div>
              </div>
            ))}
            {topReferrers.length === 0 && <p style={{ fontSize: "12px", color: "#94a3b8" }}>Sin datos aún</p>}
          </div>

          {/* Actividad por hora (últimas 24h) */}
          <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "16px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Visitas por hora (últimas 24h)</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: "60px" }}>
              {Array.from({ length: 24 }, (_, h) => {
                const count = hourlyMap[h] ?? 0;
                const pct = Math.round(count / maxHourly * 100);
                return (
                  <div key={h} title={`${h}:00 — ${count} visitas`} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: "2px" }}>
                    <div style={{ width: "100%", height: `${Math.max(4, pct * 0.6)}px`, background: count > 0 ? "#6366f1" : "#e2e8f0", borderRadius: "2px", transition: "height 0.3s" }} />
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
              <span style={{ fontSize: "10px", color: "#94a3b8" }}>0h</span>
              <span style={{ fontSize: "10px", color: "#94a3b8" }}>12h</span>
              <span style={{ fontSize: "10px", color: "#94a3b8" }}>23h</span>
            </div>
          </div>

        </div>
      </div>

      {/* ── Últimas visitas ── */}
      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden", marginBottom: "24px" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #f1f5f9" }}>
          <span style={{ fontWeight: 700, fontSize: "13px", color: "#0f172a" }}>Últimas visitas al landing</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Hora", "Dispositivo", "Navegador", "País", "Idioma", "Origen"].map((h) => (
                  <th key={h} style={{ padding: "8px 14px", textAlign: "left", color: "#64748b", fontWeight: 600, fontSize: "11px", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentViews.map((v: any, i: number) => (
                <tr key={i} style={{ borderTop: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "8px 14px", color: "#475569", whiteSpace: "nowrap" }}>
                    {new Date(v.created_at).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td style={{ padding: "8px 14px" }}>{DEVICE_ICON[v.device_type] ?? "❓"} {v.device_type ?? "—"}</td>
                  <td style={{ padding: "8px 14px" }}>{BROWSER_ICON[v.browser] ?? "⚪"} {v.browser ?? "—"}</td>
                  <td style={{ padding: "8px 14px" }}>{v.country ?? "—"}</td>
                  <td style={{ padding: "8px 14px" }}>{v.language ?? "—"}</td>
                  <td style={{ padding: "8px 14px", color: "#64748b", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {v.referrer ? (() => { try { return new URL(v.referrer).hostname.replace("www.", ""); } catch { return v.referrer; } })() : "directo"}
                  </td>
                </tr>
              ))}
              {recentViews.length === 0 && (
                <tr><td colSpan={6} style={{ padding: "20px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>Sin visitas registradas aún</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Actividad reciente ── */}
      <div className="admin-activity-grid">
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 700, fontSize: "13px", color: "#0f172a" }}>Últimas publicaciones</span>
            <a href="/admin/publicaciones" style={{ fontSize: "11px", color: "#6366f1", textDecoration: "none", fontWeight: 600 }}>Ver todas →</a>
          </div>
          {(recentListings ?? []).map((l: any) => (
            <div key={l.id} style={{ padding: "10px 18px", borderBottom: "1px solid #f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: "12px", color: "#334155", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "65%" }}>
                {l.title}
              </div>
              <span style={{
                fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px", flexShrink: 0,
                background: l.status === "active" ? "#ecfdf5" : l.status === "removed" ? "#fef2f2" : "#f1f5f9",
                color: l.status === "active" ? "#10b981" : l.status === "removed" ? "#ef4444" : "#64748b",
              }}>
                {l.status}
              </span>
            </div>
          ))}
        </div>

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

      <style>{`
        .admin-analytics-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          margin-bottom: 24px;
        }
        .admin-activity-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 640px) {
          .admin-analytics-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (min-width: 1024px) {
          .admin-analytics-grid { grid-template-columns: 1fr 1fr 1fr 1fr; }
          .admin-activity-grid  { grid-template-columns: 1fr 1fr; gap: 20px; }
        }
      `}</style>
    </div>
  );
}
