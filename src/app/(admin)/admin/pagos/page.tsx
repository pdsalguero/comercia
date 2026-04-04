import { createServiceClient } from "@/lib/supabase/service";
import { AdminPagoActions } from "@/components/admin/AdminPagoActions";

const PLAN_LABEL: Record<string, string> = {
  bronze_7: "Esencial 7d", bronze_15: "Esencial 15d", bronze_30: "Esencial 30d",
  silver_7: "Destacado 7d", silver_15: "Destacado 15d", silver_30: "Destacado 30d",
  gold_7: "Premium 7d", gold_15: "Premium 15d", gold_30: "Premium 30d",
  gold_free: "Premium Gold (gratis)",
};

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  approved: { bg: "#ecfdf5", color: "#10b981", label: "Aprobado" },
  free:     { bg: "#f5f3ff", color: "#7c3aed", label: "Gratuito" },
  pending:  { bg: "#fffbeb", color: "#f59e0b", label: "Pendiente" },
  rejected: { bg: "#fef2f2", color: "#ef4444", label: "Rechazado" },
  cancelled:{ bg: "#f1f5f9", color: "#64748b", label: "Cancelado" },
};

export default async function AdminPagos({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const service = createServiceClient();

  let query = service
    .from("pagos")
    .select("id, user_id, plan_key, plan_name, amount, mp_status, mp_payment_id, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (status) query = query.eq("mp_status", status);

  const { data: pagos } = await query;

  // Perfiles
  const userIds = [...new Set((pagos ?? []).map(p => p.user_id).filter(Boolean))];
  const { data: profileRows } = userIds.length > 0
    ? await service.from("profiles").select("id, full_name, username").in("id", userIds)
    : { data: [] };
  const profileMap = Object.fromEntries((profileRows ?? []).map(p => [p.id, p]));

  const all = pagos ?? [];
  const totalRecaudado = all.filter(p => p.mp_status === "approved").reduce((sum, p) => sum + (p.amount ?? 0), 0);
  const totalAprobados = all.filter(p => p.mp_status === "approved").length;
  const totalGratuitos = all.filter(p => p.mp_status === "free").length;
  const planCount = all.filter(p => p.mp_status === "approved").reduce((acc, p) => {
    acc[p.plan_key] = (acc[p.plan_key] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topPlan = Object.entries(planCount).sort((a, b) => b[1] - a[1])[0];

  return (
    <div>
      <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>Pagos</h1>
      <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>
        Historial de transacciones — {all.length} registros
      </p>

      {/* Métricas */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", marginBottom: "24px" }}>
        {[
          { label: "Total recaudado", value: `$${totalRecaudado.toLocaleString("es-AR")}`, icon: "💰", color: "#10b981", bg: "#ecfdf5" },
          { label: "Pagos aprobados", value: totalAprobados, icon: "✅", color: "#3b82f6", bg: "#eff6ff" },
          { label: "Créditos gratuitos", value: totalGratuitos, icon: "🎁", color: "#7c3aed", bg: "#f5f3ff" },
          { label: "Plan más vendido", value: topPlan ? (PLAN_LABEL[topPlan[0]] ?? topPlan[0]) : "—", icon: "🏆", color: "#f59e0b", bg: "#fffbeb" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: "10px", color: "#64748b", marginTop: "3px" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        {[
          { label: "Todos", value: "" },
          { label: "Aprobados", value: "approved" },
          { label: "Gratuitos", value: "free" },
          { label: "Pendientes", value: "pending" },
          { label: "Rechazados", value: "rejected" },
        ].map(({ label, value }) => (
          <a key={value} href={`/admin/pagos?status=${value}`} style={{
            padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
            textDecoration: "none",
            background: (status ?? "") === value ? "#0f172a" : "#fff",
            color: (status ?? "") === value ? "#fff" : "#64748b",
            border: "1px solid #e2e8f0",
          }}>
            {label}
          </a>
        ))}
      </div>

      {/* Tabla */}
      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "640px" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Fecha", "Usuario", "Plan", "Monto", "ID Pago MP", "Estado", ""].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {all.map(p => {
                const profile = profileMap[p.user_id];
                const st = STATUS_STYLE[p.mp_status] ?? STATUS_STYLE.pending;
                return (
                  <tr key={p.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "11px 16px", fontSize: "12px", color: "#64748b", whiteSpace: "nowrap" }}>
                      {new Date(p.created_at).toLocaleDateString("es-AR")}
                    </td>
                    <td style={{ padding: "11px 16px" }}>
                      <div style={{ fontSize: "12px", fontWeight: 600, color: "#0f172a" }}>{profile?.full_name ?? "—"}</div>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>@{profile?.username ?? "—"}</div>
                    </td>
                    <td style={{ padding: "11px 16px", fontSize: "12px", color: "#334155" }}>
                      {PLAN_LABEL[p.plan_key] ?? p.plan_name}
                    </td>
                    <td style={{ padding: "11px 16px", fontSize: "13px", fontWeight: 700, color: p.amount === 0 ? "#7c3aed" : "#0f172a" }}>
                      {p.amount === 0 ? "Gratis" : `$${p.amount.toLocaleString("es-AR")}`}
                    </td>
                    <td style={{ padding: "11px 16px", fontSize: "11px", color: "#94a3b8", fontFamily: "monospace" }}>
                      {p.mp_payment_id ?? "—"}
                    </td>
                    <td style={{ padding: "11px 16px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 9px", borderRadius: "6px", background: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                    </td>
                    <td style={{ padding: "11px 16px" }}>
                      <AdminPagoActions pagoId={p.id} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {all.length === 0 && (
            <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>Sin pagos registrados</div>
          )}
        </div>
      </div>
    </div>
  );
}
