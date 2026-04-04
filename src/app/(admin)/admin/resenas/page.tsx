import { createServiceClient } from "@/lib/supabase/service";
import { AdminReviewActions } from "@/components/admin/AdminReviewActions";

const STARS = (rating: number) => "★".repeat(rating) + "☆".repeat(5 - rating);

export default async function AdminResenas({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; rating?: string }>;
}) {
  const { q, rating } = await searchParams;
  const service = createServiceClient();

  let query = service
    .from("reviews")
    .select("id, seller_id, reviewer_id, listing_id, rating, comment, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (rating) query = query.eq("rating", Number(rating));
  if (q) query = query.ilike("comment", `%${q}%`);

  const { data: reviews } = await query;

  // Perfiles de sellers y reviewers
  const allUserIds = [...new Set([
    ...(reviews ?? []).map(r => r.seller_id),
    ...(reviews ?? []).map(r => r.reviewer_id),
  ].filter(Boolean))];

  const { data: profileRows } = allUserIds.length > 0
    ? await service.from("profiles").select("id, full_name, username").in("id", allUserIds)
    : { data: [] };
  const profileMap = Object.fromEntries((profileRows ?? []).map(p => [p.id, p]));

  // Métricas
  const all = reviews ?? [];
  const avgRating = all.length > 0 ? (all.reduce((sum, r) => sum + r.rating, 0) / all.length).toFixed(1) : "—";
  const ratingDist = [5, 4, 3, 2, 1].map(n => ({ n, count: all.filter(r => r.rating === n).length }));
  const withComment = all.filter(r => r.comment).length;

  return (
    <div>
      <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>Reseñas</h1>
      <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>
        Moderá las calificaciones del sitio — {all.length} reseñas
      </p>

      {/* Métricas */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", marginBottom: "24px" }}>
        {[
          { label: "Total reseñas", value: all.length, icon: "⭐", color: "#f59e0b", bg: "#fffbeb" },
          { label: "Calificación promedio", value: avgRating, icon: "📊", color: "#6366f1", bg: "#eef2ff" },
          { label: "Con comentario", value: withComment, icon: "💬", color: "#10b981", bg: "#ecfdf5" },
          { label: "Negativas (1-2★)", value: all.filter(r => r.rating <= 2).length, icon: "⚠️", color: "#ef4444", bg: "#fef2f2" },
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

      {/* Distribución de estrellas */}
      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "16px 20px", marginBottom: "20px" }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Distribución</div>
        {ratingDist.map(({ n, count }) => (
          <div key={n} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", color: "#f59e0b", width: "60px", flexShrink: 0 }}>{"★".repeat(n)}{"☆".repeat(5 - n)}</span>
            <div style={{ flex: 1, height: "8px", background: "#f1f5f9", borderRadius: "4px" }}>
              <div style={{ height: "100%", width: `${all.length > 0 ? Math.round(count / all.length * 100) : 0}%`, background: n >= 4 ? "#10b981" : n === 3 ? "#f59e0b" : "#ef4444", borderRadius: "4px" }} />
            </div>
            <span style={{ fontSize: "12px", color: "#64748b", width: "30px", textAlign: "right", flexShrink: 0 }}>{count}</span>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        {[
          { label: "Todas", value: "" },
          { label: "★★★★★", value: "5" },
          { label: "★★★★", value: "4" },
          { label: "★★★", value: "3" },
          { label: "★★", value: "2" },
          { label: "★", value: "1" },
        ].map(({ label, value }) => (
          <a key={value} href={`/admin/resenas?rating=${value}${q ? `&q=${q}` : ""}`} style={{
            padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
            textDecoration: "none",
            background: (rating ?? "") === value ? "#0f172a" : "#fff",
            color: (rating ?? "") === value ? "#fff" : "#64748b",
            border: "1px solid #e2e8f0",
          }}>
            {label}
          </a>
        ))}
        <form method="GET" action="/admin/resenas" style={{ marginLeft: "auto" }}>
          <input type="hidden" name="rating" value={rating ?? ""} />
          <input name="q" defaultValue={q} placeholder="Buscar en comentarios..."
            style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px", width: "220px", outline: "none" }} />
        </form>
      </div>

      {/* Tabla */}
      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {["Fecha", "Vendedor", "Comprador", "Calificación", "Comentario", "Acciones"].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {all.map(r => {
              const seller = profileMap[r.seller_id];
              const reviewer = profileMap[r.reviewer_id];
              return (
                <tr key={r.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "11px 16px", fontSize: "11px", color: "#94a3b8", whiteSpace: "nowrap" }}>
                    {new Date(r.created_at).toLocaleDateString("es-AR")}
                  </td>
                  <td style={{ padding: "11px 16px" }}>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "#0f172a" }}>{seller?.full_name ?? "—"}</div>
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>@{seller?.username ?? "—"}</div>
                  </td>
                  <td style={{ padding: "11px 16px" }}>
                    <div style={{ fontSize: "12px", color: "#334155" }}>{reviewer?.full_name ?? "—"}</div>
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>@{reviewer?.username ?? "—"}</div>
                  </td>
                  <td style={{ padding: "11px 16px" }}>
                    <span style={{ fontSize: "14px", color: r.rating >= 4 ? "#f59e0b" : r.rating === 3 ? "#94a3b8" : "#ef4444" }}>
                      {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                    </span>
                  </td>
                  <td style={{ padding: "11px 16px", fontSize: "12px", color: "#475569", maxWidth: "240px" }}>
                    {r.comment ? (
                      <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {r.comment}
                      </span>
                    ) : <span style={{ color: "#cbd5e1", fontStyle: "italic" }}>Sin comentario</span>}
                  </td>
                  <td style={{ padding: "11px 16px" }}>
                    <AdminReviewActions reviewId={r.id} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {all.length === 0 && (
          <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>Sin reseñas</div>
        )}
      </div>
    </div>
  );
}
