"use client";

import { useState, useTransition } from "react";

interface Props {
  id: string;
  title: string;
  onDelete: (formData: FormData) => Promise<void>;
}

export function DeleteButton({ id, title, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    const fd = new FormData();
    fd.set("id", id);
    startTransition(async () => {
      await onDelete(fd);
      setOpen(false);
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          background: "#fff",
          color: "#dc2626",
          border: "1px solid #fecaca",
          borderRadius: "6px",
          padding: "5px 10px",
          fontSize: "12px",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        Eliminar
      </button>

      {open && (
        <div
          onClick={() => !pending && setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(15,23,42,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(2px)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "380px",
              margin: "0 16px",
              boxShadow: "0 24px 48px rgba(0,0,0,0.18)",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div style={{
              background: "linear-gradient(135deg,#fef2f2,#fff5f5)",
              padding: "24px 24px 20px",
              borderBottom: "1px solid #fecaca",
              textAlign: "center",
            }}>
              <div style={{
                width: "52px", height: "52px", borderRadius: "50%",
                background: "#fee2e2", margin: "0 auto 12px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "24px",
              }}>
                🗑️
              </div>
              <div style={{ fontSize: "17px", fontWeight: 800, color: "#1e293b", marginBottom: "6px" }}>
                Eliminar aviso
              </div>
              <div style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.5 }}>
                ¿Seguro que querés eliminar<br />
                <strong style={{ color: "#1e293b" }}>"{title}"</strong>?
              </div>
            </div>

            {/* Warning */}
            <div style={{
              margin: "16px 20px 0",
              background: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: "8px",
              padding: "10px 14px",
              display: "flex", gap: "8px", alignItems: "flex-start",
            }}>
              <span style={{ fontSize: "14px", flexShrink: 0 }}>⚠️</span>
              <span style={{ fontSize: "12px", color: "#92400e", lineHeight: 1.5 }}>
                Esta acción es permanente. Se eliminarán las fotos, estadísticas y todos los datos del aviso.
              </span>
            </div>

            {/* Actions */}
            <div style={{
              display: "flex", gap: "10px",
              padding: "20px",
            }}>
              <button
                onClick={() => setOpen(false)}
                disabled={pending}
                style={{
                  flex: 1,
                  background: "#f1f5f9", color: "#475569",
                  border: "1px solid #e2e8f0", borderRadius: "8px",
                  padding: "11px", fontSize: "14px",
                  fontWeight: 700, cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={pending}
                style={{
                  flex: 1,
                  background: pending ? "#fca5a5" : "#dc2626",
                  color: "#fff",
                  border: "none", borderRadius: "8px",
                  padding: "11px", fontSize: "14px",
                  fontWeight: 700,
                  cursor: pending ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                }}
              >
                {pending ? (
                  <>
                    <span style={{
                      width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.4)",
                      borderTopColor: "#fff", borderRadius: "50%",
                      display: "inline-block", animation: "spin 0.7s linear infinite",
                    }} />
                    Eliminando...
                  </>
                ) : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
