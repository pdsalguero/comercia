import Link from "next/link";
import { emptyResultsCopy } from "@/lib/empty-results";

interface EmptyVehicleResultsProps {
  /** Lo que buscó la persona ("Toyota Corolla", "Motos"…); vacío si filtró solo por precio, año, etc. */
  wanted: string;
  /** Provincia filtrada, si hay. */
  province?: string;
  hasFilters: boolean;
  /** Avisos de `wanted` sin los demás filtros (0 si no hay ninguno). */
  wantedCount?: number;
  /** Misma búsqueda conservando solo tipo/marca/modelo. */
  relaxHref?: string;
  /** Misma búsqueda sin el filtro de provincia. */
  nationwideHref?: string;
  clearHref: string;
}

const secondaryBtn: React.CSSProperties = {
  background: "#fff", color: "#1e293b", border: "1.5px solid #cbd5e1", borderRadius: "10px",
  padding: "10px 20px", fontSize: "14px", fontWeight: 600, textDecoration: "none",
};

// Búsqueda vacía. Si no hay avisos de lo que se busca, se invita a publicar (en un sitio con poca oferta
// es lo más habitual); si hay pero otros filtros los dejan afuera, lo principal es ofrecer quitarlos.
export function EmptyVehicleResults({ wanted, province, hasFilters, wantedCount = 0, relaxHref, nationwideHref, clearHref }: EmptyVehicleResultsProps) {
  const { title, body, canRelax } = emptyResultsCopy({ wanted, province, hasFilters, wantedCount });

  return (
    <div style={{
      background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0",
      padding: "56px 24px", textAlign: "center",
    }}>
      <div style={{ fontSize: "44px", marginBottom: "12px" }}>🔍</div>
      <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: "0 0 8px" }}>{title}</h2>
      <p style={{ fontSize: "14px", color: "#64748b", margin: "0 auto 22px", maxWidth: "420px" }}>{body}</p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" }}>
        {canRelax && relaxHref ? (
          <Link
            href={relaxHref}
            style={{
              background: "#2563eb", color: "#fff", borderRadius: "10px", padding: "11px 20px",
              fontSize: "14px", fontWeight: 700, textDecoration: "none",
            }}
          >
            Quitar filtros ({wantedCount})
          </Link>
        ) : (
          <Link
            href="/listings/new"
            style={{
              background: "#2563eb", color: "#fff", borderRadius: "10px", padding: "11px 20px",
              fontSize: "14px", fontWeight: 700, textDecoration: "none",
            }}
          >
            Publicá el tuyo gratis
          </Link>
        )}
        {nationwideHref && (
          <Link href={nationwideHref} style={secondaryBtn}>
            Ver en todas las provincias
          </Link>
        )}
        {hasFilters && (
          <Link href={clearHref} style={secondaryBtn}>
            Ver todos los vehículos
          </Link>
        )}
      </div>
    </div>
  );
}
