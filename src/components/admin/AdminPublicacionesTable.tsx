"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AdminListingActions } from "./AdminListingActions";

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
const CAT: Record<number, string> = { 2: "Vehículos", 3: "Inmuebles" };

interface Listing {
  id: string;
  title: string;
  status: string;
  created_at: string;
  category_id: number;
  price: number;
  currency: string;
  view_count: number | null;
  featured_level: string | null;
  profiles: { full_name: string | null; username: string | null } | null;
}

const BULK_ACTIONS = [
  { value: "activate", label: "Activar",  color: "#10b981", bg: "#ecfdf5" },
  { value: "pause",    label: "Pausar",   color: "#d97706", bg: "#fef3c7" },
  { value: "remove",   label: "Remover",  color: "#ef4444", bg: "#fef2f2" },
  { value: "restore",  label: "Restaurar",color: "#6366f1", bg: "#eef2ff" },
];

export function AdminPublicacionesTable({ listings }: { listings: Listing[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [bulkReason, setBulkReason] = useState("");

  const allIds = listings.map(l => l.id);
  const allSelected = allIds.length > 0 && allIds.every(id => selected.has(id));
  const someSelected = selected.size > 0;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(allIds));
  }

  function toggleOne(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function doBulk(action: string, reason?: string) {
    startTransition(async () => {
      await fetch("/api/admin/listings/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [...selected], action, reason }),
      });
      setSelected(new Set());
      router.refresh();
    });
  }

  return (
    <div>
      {/* Bulk action bar */}
      {someSelected && (
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          padding: "10px 16px", marginBottom: "12px",
          background: "#1e293b", borderRadius: "10px",
          flexWrap: "wrap",
        }}>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>
            {selected.size} seleccionado{selected.size !== 1 ? "s" : ""}
          </span>
          <div style={{ width: "1px", height: "20px", background: "#334155" }} />
          {BULK_ACTIONS.map(a => (
            <button
              key={a.value}
              disabled={pending}
              onClick={() => a.value === "remove" ? setShowRemoveModal(true) : doBulk(a.value)}
              style={{
                padding: "5px 12px", borderRadius: "6px", border: "none",
                fontSize: "12px", fontWeight: 700, cursor: pending ? "wait" : "pointer",
                background: a.bg, color: a.color, opacity: pending ? 0.6 : 1,
              }}
            >
              {a.label}
            </button>
          ))}
          <button
            onClick={() => setSelected(new Set())}
            style={{
              marginLeft: "auto", padding: "5px 10px", borderRadius: "6px",
              border: "1px solid #334155", background: "transparent",
              color: "#94a3b8", fontSize: "12px", cursor: "pointer",
            }}
          >
            Deseleccionar
          </button>
        </div>
      )}

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              <th style={{ padding: "10px 14px", width: "36px" }}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  style={{ width: "15px", height: "15px", cursor: "pointer", accentColor: "#6366f1" }}
                />
              </th>
              {["Título", "Categoría", "Vendedor", "Precio", "Vistas", "Estado", "Fecha", "Acciones"].map(h => (
                <th key={h} style={{
                  padding: "10px 14px", textAlign: "left",
                  fontSize: "11px", fontWeight: 700, color: "#64748b",
                  textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {listings.map((l) => {
              const sc = STATUS_COLOR[l.status] ?? STATUS_COLOR.draft;
              const isSelected = selected.has(l.id);
              return (
                <tr
                  key={l.id}
                  style={{
                    borderTop: "1px solid #f1f5f9",
                    background: isSelected ? "#f5f3ff" : undefined,
                    transition: "background 0.1s",
                  }}
                >
                  <td style={{ padding: "11px 14px" }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleOne(l.id)}
                      style={{ width: "15px", height: "15px", cursor: "pointer", accentColor: "#6366f1" }}
                    />
                  </td>
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
        {!listings.length && (
          <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
            No se encontraron publicaciones
          </div>
        )}
      </div>

      {/* Bulk remove modal */}
      {showRemoveModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div style={{ background: "#fff", borderRadius: "14px", padding: "28px", width: "380px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <h3 style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
              Remover {selected.size} publicación{selected.size !== 1 ? "es" : ""}
            </h3>
            <p style={{ margin: "0 0 14px", fontSize: "12px", color: "#64748b" }}>Motivo (opcional):</p>
            <textarea
              value={bulkReason}
              onChange={e => setBulkReason(e.target.value)}
              placeholder="Ej: Contenido inapropiado, duplicados..."
              rows={3}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px", resize: "none", boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", gap: "8px", marginTop: "14px", justifyContent: "flex-end" }}>
              <button onClick={() => { setShowRemoveModal(false); setBulkReason(""); }}
                style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", fontSize: "12px", cursor: "pointer", color: "#64748b" }}>
                Cancelar
              </button>
              <button
                disabled={pending}
                onClick={() => { setShowRemoveModal(false); doBulk("remove", bulkReason); setBulkReason(""); }}
                style={{ padding: "8px 16px", borderRadius: "8px", border: "none", background: "#ef4444", color: "#fff", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
