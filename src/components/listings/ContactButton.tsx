"use client";

import { useState } from "react";

interface Props {
  listingId: string;
  listingTitle: string;
  sellerId: string;
  sellerName: string;
}

export function ContactButton({ listingId, listingTitle, sellerId, sellerName }: Props) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    if (!message.trim()) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing_id: listingId, receiver_id: sellerId, content: message }),
      });
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Error al enviar");
        return;
      }
      setSent(true);
      setMessage("");
    } finally {
      setSending(false);
    }
  }

  function handleClose() {
    setOpen(false);
    setSent(false);
    setError(null);
    setMessage("");
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          flex: 1, padding: "11px 8px", background: "#f1f5f9", color: "#334155",
          border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "13px",
          fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
        Contactar
      </button>

      {open && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "16px",
          }}
          onClick={handleClose}
        >
          <div
            style={{
              background: "#fff", borderRadius: "14px", width: "100%", maxWidth: "440px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
              overflow: "hidden",
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: "16px", fontWeight: 800, color: "#1e293b" }}>
                  Contactar a {sellerName}
                </div>
                <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "340px" }}>
                  Re: {listingTitle}
                </div>
              </div>
              <button onClick={handleClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: "20px", lineHeight: 1, padding: "0 0 0 8px" }}>
                ×
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "18px 20px" }}>
              {sent ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ fontSize: "40px", marginBottom: "10px" }}>✅</div>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "#1e293b", marginBottom: "4px" }}>¡Mensaje enviado!</div>
                  <div style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "18px" }}>El vendedor recibirá tu mensaje en sus mensajes.</div>
                  <button onClick={handleClose} style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 24px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
                    Cerrar
                  </button>
                </div>
              ) : (
                <>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder={`Hola ${sellerName}, estoy interesado en tu publicación...`}
                    rows={5}
                    style={{
                      width: "100%", border: "1.5px solid #e2e8f0", borderRadius: "8px",
                      padding: "10px 12px", fontSize: "13px", outline: "none",
                      resize: "vertical", fontFamily: "inherit", color: "#1e293b",
                      boxSizing: "border-box",
                    }}
                    onFocus={e => { e.target.style.borderColor = "#2563eb"; }}
                    onBlur={e => { e.target.style.borderColor = "#e2e8f0"; }}
                  />
                  {error && <div style={{ fontSize: "12px", color: "#dc2626", marginTop: "6px" }}>{error}</div>}
                  <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                    <button onClick={handleClose} style={{ flex: 1, padding: "10px", background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                      Cancelar
                    </button>
                    <button
                      onClick={handleSend}
                      disabled={sending || !message.trim()}
                      style={{
                        flex: 2, padding: "10px", background: sending || !message.trim() ? "#93c5fd" : "#2563eb",
                        color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px",
                        fontWeight: 700, cursor: sending || !message.trim() ? "not-allowed" : "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                      {sending ? "Enviando..." : "Enviar mensaje"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
