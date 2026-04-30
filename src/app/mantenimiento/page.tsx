export const dynamic = "force-static";

export default function MantenimientoPage() {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>ComerxIA — En mantenimiento</title>
      </head>
      <body style={{ margin: 0, fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#f8fafc" }}>
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          textAlign: "center",
        }}>
          <div style={{
            background: "#fff",
            borderRadius: "20px",
            padding: "48px 40px",
            maxWidth: "480px",
            width: "100%",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          }}>
            <div style={{ fontSize: "56px", marginBottom: "16px" }}>🔧</div>

            <h1 style={{
              fontSize: "26px",
              fontWeight: 800,
              color: "#0f172a",
              margin: "0 0 12px",
              letterSpacing: "-0.5px",
            }}>
              Estamos en mantenimiento
            </h1>

            <p style={{
              color: "#64748b",
              fontSize: "15px",
              lineHeight: 1.6,
              margin: "0 0 32px",
            }}>
              Estamos realizando mejoras en el sitio. Volvemos en breve.
            </p>

            <div style={{
              background: "#f1f5f9",
              borderRadius: "12px",
              padding: "16px 20px",
              marginBottom: "28px",
            }}>
              <p style={{ margin: 0, fontSize: "13px", color: "#475569" }}>
                Si tenés una consulta urgente podés escribirnos a{" "}
                <a
                  href="mailto:hola@comerxia.com.ar"
                  style={{ color: "#3b82f6", textDecoration: "none", fontWeight: 600 }}
                >
                  hola@comerxia.com.ar
                </a>
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <div style={{
                width: "28px", height: "28px",
                background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                borderRadius: "6px",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ color: "#fff", fontSize: "14px", fontWeight: 800 }}>C</span>
              </div>
              <span style={{ fontWeight: 700, fontSize: "15px", color: "#0f172a" }}>ComerxIA</span>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
