import Link from "next/link";

// Contenido de la página 404, compartido por app/not-found.tsx y (main)/not-found.tsx.
export function NotFoundContent() {
  return (
    <main style={{ background: "#f5f5f5", minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 16px" }}>
      <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "40px 28px", maxWidth: "460px", width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: "13px", fontWeight: 800, color: "#1d6fb8", letterSpacing: "2px", marginBottom: "8px" }}>ERROR 404</div>
        <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", margin: "0 0 10px", textWrap: "balance" }}>
          No encontramos esta página
        </h1>
        <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 24px", lineHeight: 1.5 }}>
          Puede que el aviso ya no esté publicado o que el link tenga un error. Probá buscar lo que necesitás entre los autos y motos de Cuyo.
        </p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/category/vehicles" style={{ background: "#1d6fb8", color: "#fff", borderRadius: "10px", padding: "11px 20px", fontSize: "14px", fontWeight: 700, textDecoration: "none" }}>
            Ver vehículos
          </Link>
          <Link href="/" style={{ background: "#fff", color: "#1e293b", border: "1.5px solid #cbd5e1", borderRadius: "10px", padding: "10px 20px", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>
            Ir al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
