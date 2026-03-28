import { createClient } from "@/lib/supabase/server";
import { AdminListingActions } from "@/components/admin/AdminListingActions";

const STATUS_LABEL: Record<string, string> = {
  active: "Activa", draft: "Borrador", paused: "Pausada",
  sold: "Vendida", expired: "Expirada", removed: "Removida",
};
const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  active:  { bg: "#ecfdf5", color: "#10b981" },
  draft:   { bg: "#f1f5f9", color: "#64748b" },
  paused:  { bg: "#fef3c7", color: "#d97706" },
  sold:    { bg: "#eff6ff", color: "#3b82f6" },
  expired: { bg: "#f1f5f9", color: "#94a3b8" },
  removed: { bg: "#fef2f2", color: "#ef4444" },
};

export default async function AdminPublicaciones({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; cat?: string }>;
}) {
  const { q, status, cat } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("listings")
    .select("id, title, status, created_at, category_id, price, currency, user_id, view_count, removed_by_admin, removed_reason, featured_level, profiles(full_name, username)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (status) query = query.eq("status", status);
  if (cat) query = query.eq("category_id", Number(cat));
  if (q) query = query.ilike("title", `%${q}%`);

  const { data: listings } = await query;

  const CAT: Record<number, string> = { 2: "Vehículos", 3: "Inmuebles" };

  return (
    <div>
      <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>Publicaciones</h1>
      <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>
        Gestioná todos los avisos del sitio — {listings?.length ?? 0} resultados
      </p>

      {/* Filters */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "18px", flexWrap: "wrap" }}>
        {[
          { label: "Todas", value: "" },
          { label: "Activas", value: "active" },
          { label: "Pausadas", value: "paused" },
          { label: "Removidas", value: "removed" },
          { label: "Vendidas", value: "sold" },
        ].map(({ label, value }) => (
          <a
            key={value}
            href={`/admin/publicaciones?status=${value}${q ? `&q=${q}` : ""}${cat ? `&cat=${cat}` : ""}`}
            style={{
              padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
              textDecoration: "none",
              background: (status ?? "") === value ? "#0f172a" : "#fff",
              color: (status ?? "") === value ? "#fff" : "#64748b",
              border: "1px solid #e2e8f0",
            }}
          >
            {label}
          </a>
        ))}

        <form method="GET" action="/admin/publicaciones" style={{ marginLeft: "auto" }}>
          <input type="hidden" name="status" value={status ?? ""} />
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar por título..."
            style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px", width: "220px", outline: "none" }}
          />
        </form>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {["Título", "Categoría", "Vendedor", "Precio", "Vistas", "Estado", "Fecha", "Acciones"].map((h) => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(listings ?? []).map((l: any) => {
              const sc = STATUS_COLOR[l.status] ?? STATUS_COLOR.draft;
              return (
                <tr key={l.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "11px 14px", maxWidth: "200px" }}>
                    <div style={{ fontSize: "12px", color: "#0f172a", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      <a href={`/listings/${l.id}`} target="_blank" style={{ color: "#0f172a", textDecoration: "none" }}>{l.title}</a>
                    </div>
                    {l.featured_level === "gold" && (
                      <span style={{ fontSize: "9px", background: "#fef3c7", color: "#92400e", padding: "1px 5px", borderRadius: "4px", fontWeight: 700 }}>DESTACADO</span>
                    )}
                  </td>
                  <td style={{ padding: "11px 14px", fontSize: "11px", color: "#64748b", whiteSpace: "nowrap" }}>
                    {CAT[l.category_id] ?? `Cat ${l.category_id}`}
                  </td>
                  <td style={{ padding: "11px 14px", fontSize: "11px", color: "#334155" }}>
                    {l.profiles?.full_name ?? l.profiles?.username ?? "—"}
                  </td>
                  <td style={{ padding: "11px 14px", fontSize: "12px", color: "#0f172a", fontWeight: 600, whiteSpace: "nowrap" }}>
                    {l.currency === "USD" ? "U$D" : "$"} {Number(l.price).toLocaleString("es-AR")}
                  </td>
                  <td style={{ padding: "11px 14px", fontSize: "11px", color: "#64748b", textAlign: "center" }}>
                    {l.view_count ?? 0}
                  </td>
                  <td style={{ padding: "11px 14px" }}>
                    <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", ...sc }}>
                      {STATUS_LABEL[l.status] ?? l.status}
                    </span>
                  </td>
                  <td style={{ padding: "11px 14px", fontSize: "11px", color: "#94a3b8", whiteSpace: "nowrap" }}>
                    {new Date(l.created_at).toLocaleDateString("es-AR")}
                  </td>
                  <td style={{ padding: "11px 14px" }}>
                    <AdminListingActions listing={l} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!listings?.length && (
          <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
            No se encontraron publicaciones
          </div>
        )}
      </div>
    </div>
  );
}
