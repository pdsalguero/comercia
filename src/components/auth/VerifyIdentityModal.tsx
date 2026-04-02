"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "comerxia_verify_modal_seen";

interface Props {
  isVerified: boolean;
}

export function VerifyIdentityModal({ isVerified }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isVerified) return;
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      // Small delay so dashboard renders first
      const t = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(t);
    }
  }, [isVerified]);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(15,23,42,0.55)",
        backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
      }}
      onClick={dismiss}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: "20px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.2)",
          maxWidth: "440px", width: "100%",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%)",
          padding: "28px 28px 24px",
          position: "relative",
        }}>
          <button
            onClick={dismiss}
            style={{
              position: "absolute", top: "14px", right: "14px",
              background: "rgba(255,255,255,0.15)", border: "none",
              borderRadius: "50%", width: "28px", height: "28px",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#fff", fontSize: "16px",
            }}
          >
            ×
          </button>
          <div style={{
            width: "56px", height: "56px", borderRadius: "16px",
            background: "rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: "14px",
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <polyline points="9 12 11 14 15 10"/>
            </svg>
          </div>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>
            ¡Verificá tu identidad!
          </h2>
          <p style={{ margin: "6px 0 0", fontSize: "13px", color: "rgba(255,255,255,0.8)", lineHeight: 1.4 }}>
            Generá más confianza y vendé más rápido
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: "24px 28px" }}>
          {/* Benefits */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
            {[
              { icon: "✅", title: "Badge verificado en tus publicaciones", desc: "Los compradores verán que sos un vendedor de confianza." },
              { icon: "🔼", title: "Mayor visibilidad en resultados", desc: "Tus avisos aparecen mejor posicionados frente a los no verificados." },
              { icon: "💬", title: "Más consultas y ventas", desc: "Los compradores prefieren contactar a vendedores verificados." },
              { icon: "🔒", title: "Cuenta más segura", desc: "Protegés tu cuenta contra accesos no autorizados." },
            ].map((b) => (
              <div key={b.title} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "20px", flexShrink: 0, lineHeight: 1 }}>{b.icon}</span>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b" }}>{b.title}</div>
                  <div style={{ fontSize: "12px", color: "#64748b", marginTop: "1px" }}>{b.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* How to */}
          <div style={{
            background: "#f8fafc", borderRadius: "10px",
            padding: "12px 14px", marginBottom: "20px",
            border: "1px solid #e2e8f0",
          }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
              Cómo verificar
            </div>
            {[
              "Ir a Configuración de tu cuenta",
              "Elegir verificación por email o SMS",
              "Ingresar el código que recibís",
            ].map((step, i) => (
              <div key={i} style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: i < 2 ? "6px" : 0 }}>
                <div style={{
                  width: "20px", height: "20px", borderRadius: "50%",
                  background: "#2563eb", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "10px", fontWeight: 800, flexShrink: 0,
                }}>
                  {i + 1}
                </div>
                <span style={{ fontSize: "12px", color: "#475569" }}>{step}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div style={{ display: "flex", gap: "10px" }}>
            <Link
              href="/dashboard/settings?tab=identity"
              onClick={dismiss}
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                padding: "11px 0",
                background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
                color: "#fff", borderRadius: "10px",
                fontSize: "13px", fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 2px 8px rgba(37,99,235,0.35)",
              }}
            >
              Verificar ahora
            </Link>
            <button
              onClick={dismiss}
              style={{
                padding: "11px 16px",
                background: "#f1f5f9", color: "#64748b",
                border: "none", borderRadius: "10px",
                fontSize: "13px", fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Después
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
