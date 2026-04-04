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
  const [resetSent, setResetSent] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [creditAmount, setCreditAmount] = useState(1);

  async function doAction(action: string, body?: object) {
    setLoading(action);
    await fetch(`/api/admin/users/${user.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...body }),
    });
    setLoading(null);
    if (action === "reset_password") { setResetSent(true); return; }
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
      {resetSent
        ? <span style={{ fontSize: "11px", color: "#10b981", fontWeight: 600 }}>✅ Email enviado</span>
        : btn("Reset pass", "reset_password", "#7c3aed", "#f5f3ff")
      }
      {btn("👑 Créditos", "add_credits", "#d97706", "#fffbeb", () => setShowCredits(true))}

      {showCredits && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: "14px", padding: "28px", width: "320px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <h3 style={{ margin: "0 0 8px", fontSize: "15px", color: "#0f172a", fontWeight: 700 }}>
              Asignar créditos Gold a {user.full_name ?? "este usuario"}
            </h3>
            <p style={{ margin: "0 0 14px", fontSize: "12px", color: "#64748b" }}>
              Cada crédito permite destacar 1 publicación como Gold sin costo.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <button onClick={() => setCreditAmount(v => Math.max(1, v - 1))}
                style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#f8fafc", fontSize: "16px", cursor: "pointer", fontWeight: 700 }}>−</button>
              <span style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", minWidth: "32px", textAlign: "center" }}>{creditAmount}</span>
              <button onClick={() => setCreditAmount(v => v + 1)}
                style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#f8fafc", fontSize: "16px", cursor: "pointer", fontWeight: 700 }}>+</button>
            </div>
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button onClick={() => { setShowCredits(false); setCreditAmount(1); }}
                style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", fontSize: "12px", cursor: "pointer", color: "#64748b" }}>
                Cancelar
              </button>
              <button onClick={() => { setShowCredits(false); doAction("add_credits", { amount: creditAmount }); setCreditAmount(1); }}
                style={{ padding: "8px 16px", borderRadius: "8px", border: "none", background: "#f59e0b", color: "#fff", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
                Asignar {creditAmount} crédito{creditAmount !== 1 ? "s" : ""}
              </button>
            </div>
          </div>
        </div>
      )}

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
