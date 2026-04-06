"use client";

import { useState } from "react";
import Link from "next/link";

const SUBJECTS = [
  "Consulta general",
  "Problema con un aviso",
  "Problema con mi cuenta",
  "Denunciar un usuario",
  "Solicitar eliminación de datos",
  "Propuesta comercial",
  "Otro",
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: SUBJECTS[0], message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setStatus(res.ok ? "ok" : "error");
    } catch {
      setStatus("error");
    }
  };

  const inp: React.CSSProperties = {
    width: "100%", border: "1.5px solid #e2e8f0", borderRadius: "8px",
    padding: "10px 14px", fontSize: "14px", outline: "none",
    fontFamily: "inherit", color: "#0f172a", background: "#fff",
    boxSizing: "border-box",
  };

  const lbl: React.CSSProperties = {
    display: "block", fontSize: "13px", fontWeight: 600,
    color: "#374151", marginBottom: "6px",
  };

  if (status === "ok") {
    return (
      <div style={{ maxWidth: "520px", margin: "64px auto", padding: "0 16px" }}>
        <div style={{
          background: "#fff", borderRadius: "20px", padding: "48px 40px",
          border: "1px solid #e2e8f0", textAlign: "center",
          boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
        }}>
          <div style={{ fontSize: "56px", marginBottom: "16px" }}>✅</div>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", margin: "0 0 10px" }}>
            ¡Mensaje enviado con éxito!
          </h2>
          <p style={{ fontSize: "15px", color: "#64748b", lineHeight: 1.6, margin: "0 0 28px" }}>
            Te responderemos a la brevedad a{" "}
            <strong style={{ color: "#0f172a" }}>{form.email}</strong>{" "}
            desde <strong style={{ color: "#0f172a" }}>contacto@comerxia.com.ar</strong>.
          </p>
          <button
            onClick={() => { setForm({ name: "", email: "", phone: "", subject: SUBJECTS[0], message: "" }); setStatus("idle"); }}
            style={{
              background: "linear-gradient(135deg,#f97316,#fb923c)", color: "#fff",
              border: "none", borderRadius: "10px", padding: "12px 28px",
              fontWeight: 700, fontSize: "14px", cursor: "pointer",
              boxShadow: "0 4px 14px rgba(249,115,22,0.35)",
            }}
          >
            Enviar otro mensaje
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", padding: "32px 16px 64px" }}>

      {/* Breadcrumb */}
      <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "24px" }}>
        <Link href="/" style={{ color: "#94a3b8", textDecoration: "none" }}>Inicio</Link>
        {" › "}
        <span style={{ color: "#475569" }}>Contacto</span>
      </div>

      {/* Form card */}
      <div style={{ background: "#fff", borderRadius: "16px", padding: "36px", border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>
          Contáctenos
        </h1>
        <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "32px" }}>
          Completá el formulario y te respondemos en menos de 24 horas hábiles.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={lbl}>Nombre <span style={{ color: "#ef4444" }}>*</span></label>
              <input style={inp} value={form.name} onChange={e => set("name", e.target.value)} placeholder="Tu nombre completo" required />
            </div>
            <div>
              <label style={lbl}>Email <span style={{ color: "#ef4444" }}>*</span></label>
              <input style={inp} type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="tucorreo@ejemplo.com" required />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={lbl}>Teléfono / WhatsApp</label>
              <input style={inp} type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+54 264 000-0000" />
            </div>
            <div>
              <label style={lbl}>Asunto</label>
              <select
                value={form.subject}
                onChange={e => set("subject", e.target.value)}
                style={{ ...inp, appearance: "none", WebkitAppearance: "none", cursor: "pointer" }}
              >
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={lbl}>Mensaje <span style={{ color: "#ef4444" }}>*</span></label>
            <textarea
              value={form.message}
              onChange={e => set("message", e.target.value)}
              placeholder="Describí tu consulta con el mayor detalle posible..."
              rows={6}
              required
              style={{ ...inp, resize: "vertical", minHeight: "140px" }}
            />
          </div>

          {status === "error" && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "12px 16px", fontSize: "13px", color: "#dc2626" }}>
              Hubo un error al enviar el mensaje. Intentá nuevamente o escribinos directamente a{" "}
              <a href="mailto:contacto@comerxia.com.ar" style={{ color: "#dc2626", fontWeight: 700 }}>contacto@comerxia.com.ar</a>.
            </div>
          )}

          <button
            type="submit"
            disabled={status === "sending"}
            style={{
              background: status === "sending" ? "#94a3b8" : "linear-gradient(135deg,#f97316,#fb923c)",
              color: "#fff", border: "none", borderRadius: "10px",
              padding: "14px", fontSize: "15px", fontWeight: 800,
              cursor: status === "sending" ? "default" : "pointer",
              boxShadow: status === "sending" ? "none" : "0 4px 14px rgba(249,115,22,0.35)",
              transition: "all 0.15s",
            }}
          >
            {status === "sending" ? "Enviando..." : "Enviar mensaje →"}
          </button>
        </form>
      </div>

      {/* Contact channels */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "20px" }}>
        <a href="mailto:contacto@comerxia.com.ar" style={{ textDecoration: "none" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "12px",
            background: "#fff", borderRadius: "12px", padding: "16px",
            border: "1.5px solid #e0e7ff",
          }}>
            <div style={{
              width: "38px", height: "38px", borderRadius: "9px", flexShrink: 0,
              background: "linear-gradient(135deg,#6366f1,#818cf8)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.5px" }}>Email</div>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#0f172a" }}>contacto@comerxia.com.ar</div>
            </div>
          </div>
        </a>

        <a href="https://wa.me/5492645115818" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "12px",
            background: "#fff", borderRadius: "12px", padding: "16px",
            border: "1.5px solid #bbf7d0",
          }}>
            <div style={{
              width: "38px", height: "38px", borderRadius: "9px", flexShrink: 0,
              background: "linear-gradient(135deg,#22c55e,#16a34a)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#16a34a", textTransform: "uppercase", letterSpacing: "0.5px" }}>WhatsApp</div>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#0f172a" }}>+54 9 264 511-5818</div>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}
