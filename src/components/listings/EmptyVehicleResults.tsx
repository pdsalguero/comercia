import Link from "next/link";

interface EmptyVehicleResultsProps {
  /** Lo que buscó la persona ("Toyota Corolla", "Motos"…); vacío si filtró solo por precio, año, etc. */
  wanted: string;
  /** Provincia filtrada, si hay. */
  province?: string;
  hasFilters: boolean;
  /** Misma búsqueda sin el filtro de provincia. */
  nationwideHref?: string;
  clearHref: string;
}

// Búsqueda vacía: en un sitio con poca oferta es lo más habitual, así que se aprovecha para
// invitar a publicar en lugar de mostrar un "no se encontraron avisos" sin salida.
export function EmptyVehicleResults({ wanted, province, hasFilters, nationwideHref, clearHref }: EmptyVehicleResultsProps) {
  const title = !hasFilters
    ? "Todavía no hay vehículos publicados"
    : wanted
      ? `Todavía no hay avisos de ${wanted}${province ? ` en ${province}` : ""}`
      : "No encontramos avisos con esos filtros";
  const body = !hasFilters
    ? "Sé el primero en publicar el tuyo."
    : "¿Tenés uno para vender? Publicalo gratis y aparecés primero para quienes lo buscan.";

  return (
    <div style={{
      background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0",
      padding: "56px 24px", textAlign: "center",
    }}>
      <div style={{ fontSize: "44px", marginBottom: "12px" }}>🔍</div>
      <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: "0 0 8px" }}>{title}</h2>
      <p style={{ fontSize: "14px", color: "#64748b", margin: "0 auto 22px", maxWidth: "420px" }}>{body}</p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" }}>
        <Link
          href="/listings/new"
          style={{
            background: "#2563eb", color: "#fff", borderRadius: "10px", padding: "11px 20px",
            fontSize: "14px", fontWeight: 700, textDecoration: "none",
          }}
        >
          Publicá el tuyo gratis
        </Link>
        {nationwideHref && (
          <Link
            href={nationwideHref}
            style={{
              background: "#fff", color: "#1e293b", border: "1.5px solid #cbd5e1", borderRadius: "10px",
              padding: "10px 20px", fontSize: "14px", fontWeight: 600, textDecoration: "none",
            }}
          >
            Buscar en todo el país
          </Link>
        )}
        {hasFilters && (
          <Link
            href={clearHref}
            style={{
              background: "#fff", color: "#1e293b", border: "1.5px solid #cbd5e1", borderRadius: "10px",
              padding: "10px 20px", fontSize: "14px", fontWeight: 600, textDecoration: "none",
            }}
          >
            Ver todos los vehículos
          </Link>
        )}
      </div>
    </div>
  );
}
