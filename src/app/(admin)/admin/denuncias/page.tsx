import { createServiceClient } from "@/lib/supabase/service";
import { AdminReportActions } from "@/components/admin/AdminReportActions";
import Link from "next/link";

const REASON_LABELS: Record<string, string> = {
  scam:          "Posible estafa",
  fake:          "Producto falso",
  prohibited:    "Artículo prohibido",
  duplicate:     "Aviso duplicado",
  inappropriate: "Contenido inapropiado",
  other:         "Otro motivo",
};

const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  pending:   { bg: "#fef3c7", color: "#92400e", label: "Pendiente" },
  reviewed:  { bg: "#dcfce7", color: "#15803d", label: "Revisado"  },
  dismissed: { bg: "#f1f5f9", color: "#64748b", label: "Desestimado" },
};

export default async function AdminDenuncias({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;
  const service = createServiceClient();

  let query = service
    .from("listing_reports")
    .select("id, listing_id, reporter_id, reason, description, status, created_at")
    .order("created_at", { ascending: false })
    .limit(300);

  if (status) query = query.eq("status", status);
  if (q)      query = query.ilike("description", `%${q}%`);

  const { data: reports } = await query;
  const all = reports ?? [];

  // Fetch listings
  const listingIds = [...new Set(all.map(r => r.listing_id).filter(Boolean))];
  const { data: listingRows } = listingIds.length > 0
    ? await service.from("listings").select("id, title, user_id").in("id", listingIds)
    : { data: [] };
  const listingMap = Object.fromEntries((listingRows ?? []).map(l => [l.id, l]));

  // Fetch reporter profiles
  const reporterIds = [...new Set(all.map(r => r.reporter_id).filter(Boolean))];
  const { data: profileRows } = reporterIds.length > 0
    ? await service.from("profiles").select("id, full_name, username").in("id", reporterIds)
    : { data: [] };
  const profileMap = Object.fromEntries((profileRows ?? []).map(p => [p.id, p]));

  const pending   = all.filter(r => r.status === "pending").length;
  const reviewed  = all.filter(r => r.status === "reviewed").length;
  const dismissed = all.filter(r => r.status === "dismissed").length;

  const statusFilter = status ?? "";

  return (
    <div>
      <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>Denuncias</h1>
      <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>
        Avisos reportados por los usuarios — {all.length} en total
      </p>

      {/* Métricas */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px", marginBottom: "24px" }}>
        {[
          { label: "Total",        value: all.length, icon: "🚩", color: "#6366f1", bg: "#eef2ff" },
          { label: "Pendientes",   value: pending,    icon: "⏳", color: "#f59e0b", bg: "#fffbeb" },
          { label: "Revisados",    value: reviewed,   icon: "✅", color: "#10b981", bg: "#ecfdf5" },
          { label: "Desestimados", value: dismissed,  icon: "🗂️", color: "#94a3b8", bg: "#f8fafc" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: "10px", color: "#64748b", marginTop: "3px" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
        {[
          { label: "Todas", value: "" },
          { label: "Pendientes", value: "pending" },
          { label: "Revisadas", value: "reviewed" },
          { label: "Desestimadas", value: "dismissed" },
        ].map(({ label, value }) => (
          <a key={value} href={`/admin/denuncias?status=${value}${q ? `&q=${q}` : ""}`} style={{
            padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
            textDecoration: "none",
            background: statusFilter === value ? "#0f172a" : "#fff",
            color: statusFilter === value ? "#fff" : "#64748b",
            border: "1px solid #e2e8f0",
          }}>
            {label}
          </a>
        ))}
        <form method="GET" action="/admin/denuncias" style={{ marginLeft: "auto" }}>
          <input type="hidden" name="status" value={statusFilter} />
          <input name="q" defaultValue={q} placeholder="Buscar en descripción..."
            style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px", width: "220px", outline: "none" }} />
        </form>
      </div>

      {/* Tabla */}
      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Fecha", "Aviso", "Denunciante", "Motivo", "Detalle", "Estado", "Acciones"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {all.map(r => {
                const listing  = listingMap[r.listing_id];
                const reporter = profileMap[r.reporter_id];
                const st       = STATUS_COLORS[r.status] ?? STATUS_COLORS.pending;
                return (
                  <tr key={r.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "11px 16px", fontSize: "11px", color: "#94a3b8", whiteSpace: "nowrap" }}>
                      {new Date(r.created_at).toLocaleDateString("es-AR")}
                    </td>
                    <td style={{ padding: "11px 16px", maxWidth: "200px" }}>
                      {listing ? (
                        <Link href={`/listings/${r.listing_id}`} target="_blank" style={{ fontSize: "12px", fontWeight: 600, color: "#2563eb", textDecoration: "none", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {listing.title}
                        </Link>
                      ) : (
                        <span style={{ fontSize: "11px", color: "#94a3b8" }}>Aviso eliminado</span>
                      )}
                    </td>
                    <td style={{ padding: "11px 16px", whiteSpace: "nowrap" }}>
                      <div style={{ fontSize: "12px", fontWeight: 600, color: "#0f172a" }}>{reporter?.full_name ?? "—"}</div>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>@{reporter?.username ?? "anon"}</div>
                    </td>
                    <td style={{ padding: "11px 16px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "6px", background: "#fef3c7", color: "#92400e" }}>
                        {REASON_LABELS[r.reason] ?? r.reason}
                      </span>
                    </td>
                    <td style={{ padding: "11px 16px", fontSize: "12px", color: "#475569", maxWidth: "200px" }}>
                      {r.description ? (
                        <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {r.description}
                        </span>
                      ) : <span style={{ color: "#cbd5e1", fontStyle: "italic" }}>Sin detalle</span>}
                    </td>
                    <td style={{ padding: "11px 16px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "6px", background: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                    </td>
                    <td style={{ padding: "11px 16px" }}>
                      <AdminReportActions reportId={r.id} currentStatus={r.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {all.length === 0 && (
          <div style={{ padding: "48px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>Sin denuncias</div>
        )}
      </div>
    </div>
  );
}
