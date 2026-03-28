"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  user: {
    id: string;
    is_blocked: boolean;
    is_verified: boolean;
    is_admin: boolean;
    full_name: string | null;
  };
}

export function AdminUserActions({ user }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [showReason, setShowReason] = useState(false);
  const [reason, setReason] = useState("");

  async function doAction(action: string, body?: object) {
    setLoading(action);
    await fetch(`/api/admin/users/${user.id}`, {
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
        padding: "4px 10px", borderRadius: "6px", border: "none",
        fontSize: "11px", fontWeight: 600, cursor: loading ? "wait" : "pointer",
        background: bg, color,
        opacity: loading && loading !== action ? 0.5 : 1,
      }}
    >
      {loading === action ? "..." : label}
    </button>
  );

  return (
    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
      {user.is_blocked
        ? btn("Desbloquear", "unblock", "#10b981", "#ecfdf5")
        : btn("Bloquear", "block", "#ef4444", "#fef2f2", () => setShowReason(true))
      }
      {!user.is_verified && btn("Verificar", "verify", "#3b82f6", "#eff6ff")}

      {showReason && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div style={{ background: "#fff", borderRadius: "14px", padding: "28px", width: "360px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <h3 style={{ margin: "0 0 8px", fontSize: "15px", color: "#0f172a", fontWeight: 700 }}>
              Bloquear a {user.full_name ?? "este usuario"}
            </h3>
            <p style={{ margin: "0 0 14px", fontSize: "12px", color: "#64748b" }}>
              Indicá el motivo (opcional)
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej: Publicaciones fraudulentas, spam..."
              rows={3}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px", resize: "none", boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", gap: "8px", marginTop: "14px", justifyContent: "flex-end" }}>
              <button onClick={() => { setShowReason(false); setReason(""); }}
                style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", fontSize: "12px", cursor: "pointer", color: "#64748b" }}>
                Cancelar
              </button>
              <button onClick={() => { setShowReason(false); doAction("block", { reason }); setReason(""); }}
                style={{ padding: "8px 16px", borderRadius: "8px", border: "none", background: "#ef4444", color: "#fff", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
                Bloquear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
