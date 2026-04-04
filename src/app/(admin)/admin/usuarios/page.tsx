import { createClient } from "@/lib/supabase/server";
import { AdminUserActions } from "@/components/admin/AdminUserActions";

export default async function AdminUsuarios({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string }>;
}) {
  const { q, filter } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select("id, full_name, username, created_at, is_blocked, is_verified, is_store, is_admin, blocked_reason, avatar_url, free_destacado_credits")
    .order("created_at", { ascending: false })
    .limit(100);

  if (filter === "blocked") query = query.eq("is_blocked", true);
  if (filter === "verified") query = query.eq("is_verified", true);
  if (filter === "stores") query = query.eq("is_store", true);
  if (q) query = query.or(`full_name.ilike.%${q}%,username.ilike.%${q}%`);

  const { data: users } = await query;

  return (
    <div>
      <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>Usuarios</h1>
      <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>
        Gestioná usuarios del sitio — {users?.length ?? 0} resultados
      </p>

      {/* Filters */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "18px", flexWrap: "wrap" }}>
        {[
          { label: "Todos", value: "" },
          { label: "Bloqueados", value: "blocked" },
          { label: "Verificados", value: "verified" },
          { label: "Tiendas", value: "stores" },
        ].map(({ label, value }) => (
          <a
            key={value}
            href={`/admin/usuarios?filter=${value}${q ? `&q=${q}` : ""}`}
            style={{
              padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
              textDecoration: "none",
              background: filter === value || (!filter && !value) ? "#0f172a" : "#fff",
              color: filter === value || (!filter && !value) ? "#fff" : "#64748b",
              border: "1px solid #e2e8f0",
            }}
          >
            {label}
          </a>
        ))}

        <form method="GET" action="/admin/usuarios" style={{ marginLeft: "auto" }}>
          <input type="hidden" name="filter" value={filter ?? ""} />
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar por nombre o usuario..."
            style={{
              padding: "6px 12px", borderRadius: "8px", border: "1px solid #e2e8f0",
              fontSize: "12px", width: "220px", outline: "none",
            }}
          />
        </form>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "650px" }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {["Usuario", "Nombre", "Registrado", "Créditos", "Estado", "Acciones"].map((h) => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((u: any) => (
              <tr key={u.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{
                      width: "30px", height: "30px", borderRadius: "50%", background: "#f1f5f9",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "12px", fontWeight: 700, color: "#334155", flexShrink: 0, overflow: "hidden",
                    }}>
                      {u.avatar_url
                        ? <img src={u.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : (u.full_name?.[0] ?? u.username?.[0] ?? "?").toUpperCase()}
                    </div>
                    <span style={{ fontSize: "12px", color: "#334155" }}>@{u.username ?? "—"}</span>
                  </div>
                </td>
                <td style={{ padding: "12px 16px", fontSize: "12px", color: "#0f172a", fontWeight: 500 }}>
                  {u.full_name ?? "—"}
                  {u.is_admin && <span style={{ marginLeft: "6px", fontSize: "9px", background: "#fef3c7", color: "#92400e", padding: "1px 5px", borderRadius: "4px", fontWeight: 700 }}>ADMIN</span>}
                  {u.is_store && <span style={{ marginLeft: "4px", fontSize: "9px", background: "#ede9fe", color: "#7c3aed", padding: "1px 5px", borderRadius: "4px", fontWeight: 700 }}>TIENDA</span>}
                </td>
                <td style={{ padding: "12px 16px", fontSize: "11px", color: "#94a3b8" }}>
                  {new Date(u.created_at).toLocaleDateString("es-AR")}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{
                    fontSize: "12px", fontWeight: 700,
                    color: u.free_destacado_credits > 0 ? "#7c3aed" : "#94a3b8",
                    background: u.free_destacado_credits > 0 ? "#f5f3ff" : "#f8fafc",
                    padding: "2px 8px", borderRadius: "6px",
                  }}>
                    👑 {u.free_destacado_credits ?? 0}
                  </span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  {u.is_blocked ? (
                    <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", background: "#fef2f2", color: "#ef4444" }}>BLOQUEADO</span>
                  ) : u.is_verified ? (
                    <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", background: "#ecfdf5", color: "#10b981" }}>VERIFICADO</span>
                  ) : (
                    <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", background: "#f1f5f9", color: "#64748b" }}>ACTIVO</span>
                  )}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <AdminUserActions user={u} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {!users?.length && (
          <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
            No se encontraron usuarios
          </div>
        )}
      </div>
    </div>
  );
}
