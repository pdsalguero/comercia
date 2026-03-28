"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  listing: {
    id: string;
    status: string;
    featured_level: string | null;
    title: string;
  };
}

export function AdminListingActions({ listing }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [showReason, setShowReason] = useState(false);
  const [reason, setReason] = useState("");

  async function doAction(action: string, body?: object) {
    setLoading(action);
    await fetch(`/api/admin/listings/${listing.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...body }),
    });
    setLoading(null);
    router.refresh();
  }

  const btn = (label: string, action: string, color: string, bg: string, onClick?: () => void) => (
    <button
      disabled={!!loading}
      onClick={onClick ?? (() => doAction(action))}
      style={{
        padding: "4px 9px", borderRadius: "6px", border: "none",
        fontSize: "11px", fontWeight: 600, cursor: loading ? "wait" : "pointer",
        background: bg, color,
        opacity: loading && loading !== action ? 0.5 : 1,
      }}
    >
      {loading === action ? "..." : label}
    </button>
  );

  const isRemoved = listing.status === "removed";
  const isActive = listing.status === "active";

  return (
    <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
      {isRemoved
        ? btn("Restaurar", "restore", "#10b981", "#ecfdf5")
        : btn("Remover", "remove", "#ef4444", "#fef2f2", () => setShowReason(true))
      }
      {isActive && listing.featured_level !== "gold" && btn("Destacar", "feature", "#d97706", "#fffbeb")}
      {isActive && listing.featured_level === "gold" && btn("Quitar dest.", "unfeature", "#64748b", "#f1f5f9")}

      {showReason && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div style={{ background: "#fff", borderRadius: "14px", padding: "28px", width: "360px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <h3 style={{ margin: "0 0 8px", fontSize: "15px", color: "#0f172a", fontWeight: 700 }}>
              Remover publicación
            </h3>
            <p style={{ margin: "0 0 6px", fontSize: "12px", color: "#64748b" }}>"{listing.title}"</p>
            <p style={{ margin: "0 0 14px", fontSize: "12px", color: "#64748b" }}>Motivo (opcional):</p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej: Contenido inapropiado, fraude, duplicado..."
              rows={3}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px", resize: "none", boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", gap: "8px", marginTop: "14px", justifyContent: "flex-end" }}>
              <button onClick={() => { setShowReason(false); setReason(""); }}
                style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", fontSize: "12px", cursor: "pointer", color: "#64748b" }}>
                Cancelar
              </button>
              <button onClick={() => { setShowReason(false); doAction("remove", { reason }); setReason(""); }}
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
