"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { Dialog } from "@/components/ui/Dialog";

const REASONS = [
  { value: "scam",          label: "Posible estafa o fraude" },
  { value: "fake",          label: "Producto o información falsa" },
  { value: "prohibited",    label: "Artículo prohibido" },
  { value: "duplicate",     label: "Aviso duplicado" },
  { value: "inappropriate", label: "Contenido inapropiado" },
  { value: "other",         label: "Otro motivo" },
];

// Oculto a la vista pero accesible: el radio sigue recibiendo foco y flechas del teclado
// (antes era display:none y solo se podía elegir con el mouse).
const visuallyHidden: React.CSSProperties = {
  position: "absolute", width: "1px", height: "1px", padding: 0, margin: "-1px",
  overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0,
};

interface Props {
  listingId: string;
  isLoggedIn: boolean;
}

export function ReportButton({ listingId, isLoggedIn }: Props) {
  const titleId = useId();
  const [open, setOpen]           = useState(false);
  const [reason, setReason]       = useState("");
  const [description, setDesc]    = useState("");
  const [loading, setLoading]     = useState(false);
  const [done, setDone]           = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const handleOpen = () => {
    setDone(false);
    setError(null);
    setReason("");
    setDesc("");
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!reason) { setError("Seleccioná un motivo."); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing_id: listingId, reason, description }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Error al enviar la denuncia."); return; }
      setDone(true);
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        aria-haspopup="dialog"
        style={{
          display: "flex", alignItems: "center", gap: "5px",
          background: "none", border: "none", cursor: "pointer",
          fontSize: "12px", color: "#94a3b8", fontFamily: "inherit",
          padding: "6px 0", textDecoration: "none",
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
          <line x1="4" y1="22" x2="4" y2="15"/>
        </svg>
        Denunciar aviso
      </button>

      <Dialog open={open} onClose={() => setOpen(false)} labelledBy={titleId}>
        <div style={{
          background: "#fff", borderRadius: "16px",
          width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h2 id={titleId} style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: 0 }}>Denunciar aviso</h2>
              <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>Ayudá a mantener la comunidad segura</div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar" style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: "4px", lineHeight: 1 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div style={{ padding: "20px 24px" }}>
            {!isLoggedIn ? (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <div style={{ fontSize: "32px", marginBottom: "12px" }} aria-hidden="true">🔒</div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>Iniciá sesión para denunciar</div>
                <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>Tu denuncia es anónima para el vendedor.</div>
                <Link
                  href="/login"
                  data-autofocus
                  style={{ display: "inline-block", padding: "10px 24px", background: "#ef4444", color: "#fff", borderRadius: "8px", fontSize: "13px", fontWeight: 700, textDecoration: "none" }}
                >
                  Iniciar sesión
                </Link>
              </div>
            ) : done ? (
              <div style={{ textAlign: "center", padding: "16px 0" }} role="status">
                <div style={{ fontSize: "36px", marginBottom: "12px" }} aria-hidden="true">✅</div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", marginBottom: "6px" }}>Denuncia recibida</div>
                <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>Nuestro equipo la revisará en las próximas 48 hs. Gracias por contribuir a una comunidad más segura.</div>
                <button type="button" onClick={() => setOpen(false)} style={{ padding: "9px 24px", background: "#0f172a", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                  Cerrar
                </button>
              </div>
            ) : (
              <>
                {/* Reasons */}
                <fieldset style={{ border: "none", padding: 0, margin: "0 0 16px" }}>
                  <legend style={{ fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "10px", padding: 0 }}>¿Cuál es el motivo?</legend>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {REASONS.map((r, i) => (
                      <label key={r.value} className="report-reason" style={{
                        display: "flex", alignItems: "center", gap: "10px", position: "relative",
                        padding: "10px 12px", border: `2px solid ${reason === r.value ? "#ef4444" : "#e2e8f0"}`,
                        borderRadius: "8px", cursor: "pointer",
                        background: reason === r.value ? "#fef2f2" : "#fff",
                        transition: "all 0.12s",
                      }}>
                        <input
                          type="radio" name={`${titleId}-reason`} value={r.value}
                          checked={reason === r.value}
                          onChange={() => setReason(r.value)}
                          {...(i === 0 ? { "data-autofocus": true } : {})}
                          style={visuallyHidden}
                        />
                        <div aria-hidden="true" style={{
                          width: "16px", height: "16px", borderRadius: "50%", flexShrink: 0,
                          border: `2px solid ${reason === r.value ? "#ef4444" : "#d1d5db"}`,
                          background: reason === r.value ? "#ef4444" : "#fff",
                        }} />
                        <span style={{ fontSize: "13px", color: reason === r.value ? "#dc2626" : "#374151", fontWeight: reason === r.value ? 600 : 400 }}>
                          {r.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                {/* Description */}
                <div style={{ marginBottom: "16px" }}>
                  <label htmlFor={`${titleId}-desc`} style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "6px" }}>Detalles adicionales <span style={{ color: "#94a3b8", fontWeight: 400 }}>(opcional)</span></label>
                  <textarea
                    id={`${titleId}-desc`}
                    value={description}
                    onChange={e => setDesc(e.target.value)}
                    placeholder="Contanos más sobre el problema..."
                    maxLength={500}
                    rows={3}
                    style={{
                      width: "100%", boxSizing: "border-box",
                      border: "1.5px solid #e2e8f0", borderRadius: "8px",
                      padding: "10px 12px", fontSize: "13px", color: "#0f172a",
                      fontFamily: "inherit", resize: "vertical", outline: "none",
                    }}
                  />
                </div>

                {error && (
                  <div role="alert" style={{ marginBottom: "12px", padding: "10px 12px", background: "#fef2f2", borderRadius: "8px", fontSize: "12px", color: "#dc2626", fontWeight: 600 }}>
                    {error}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{
                    width: "100%", padding: "11px", background: loading ? "#fca5a5" : "#ef4444",
                    color: "#fff", border: "none", borderRadius: "8px",
                    fontSize: "14px", fontWeight: 700, cursor: loading ? "wait" : "pointer",
                    fontFamily: "inherit", transition: "background 0.15s",
                  }}
                >
                  {loading ? "Enviando..." : "Enviar denuncia"}
                </button>
              </>
            )}
          </div>
        </div>
      </Dialog>
    </>
  );
}
