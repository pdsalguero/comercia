"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#f1f5f9" }}>
        <div style={{
          minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
          padding: "24px",
        }}>
          <div style={{
            background: "#fff", borderRadius: "16px", padding: "48px 40px", maxWidth: "460px",
            width: "100%", border: "1px solid #e2e8f0", boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", margin: "0 0 10px" }}>
              Algo salió mal
            </h1>
            <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.6, margin: "0 0 28px" }}>
              Ocurrió un error inesperado. El equipo ya fue notificado automáticamente.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={reset}
                style={{
                  background: "linear-gradient(135deg,#f97316,#fb923c)", color: "#fff",
                  border: "none", borderRadius: "10px", padding: "12px 24px",
                  fontWeight: 700, fontSize: "14px", cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(249,115,22,0.35)",
                }}
              >
                Reintentar
              </button>
              <Link href="/" style={{ textDecoration: "none" }}>
                <div style={{
                  background: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0",
                  borderRadius: "10px", padding: "12px 24px",
                  fontWeight: 600, fontSize: "14px", cursor: "pointer",
                }}>
                  Ir al inicio
                </div>
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
