import { createServiceClient } from "@/lib/supabase/service";
import { AdminPublicacionesTable } from "@/components/admin/AdminPublicacionesTable";


export default async function AdminPublicaciones({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; cat?: string }>;
}) {
  const { q, status, cat } = await searchParams;
  const supabase = createServiceClient();

  let query = supabase
    .from("listings")
    .select("id, title, status, created_at, category_id, price, currency, user_id, view_count, featured_level")
    .order("created_at", { ascending: false })
    .limit(100);

  if (status) query = query.eq("status", status);
  if (cat) query = query.eq("category_id", Number(cat));
  if (q) query = query.ilike("title", `%${q}%`);

  const { data: listingsRaw, error } = await query;
  if (error) console.error("[admin/publicaciones] query error:", error.message);

  // Fetch profiles separately to avoid FK join issues
  const userIds = [...new Set((listingsRaw ?? []).map(l => l.user_id).filter(Boolean))];
  const { data: profileRows } = userIds.length > 0
    ? await supabase.from("profiles").select("id, full_name, username").in("id", userIds)
    : { data: [] };
  const profileMap = Object.fromEntries((profileRows ?? []).map(p => [p.id, p]));

  const listings = (listingsRaw ?? []).map(l => ({
    ...l,
    profiles: profileMap[l.user_id] ?? null,
  }));

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

      <AdminPublicacionesTable listings={(listings ?? []) as any} />
    </div>
  );
}
