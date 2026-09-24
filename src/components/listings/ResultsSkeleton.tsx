import { ListingCardSkeleton } from "./ListingCardSkeleton";

// Esqueleto de las páginas de resultados (categoría y avisos): barra lateral de filtros + grilla de tarjetas.
// Se muestra al navegar, mientras el servidor arma la página.
export function ResultsSkeleton() {
  return (
    <div className="results-skeleton" role="status" aria-label="Cargando avisos">
      <aside className="results-skeleton-side" aria-hidden="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: i === 0 ? "150px" : "100px", borderRadius: "10px" }} />
        ))}
      </aside>
      <div style={{ minWidth: 0 }}>
        <div className="skeleton" style={{ height: "88px", borderRadius: "12px", marginBottom: "14px" }} aria-hidden="true" />
        <div className="grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <ListingCardSkeleton key={i} />)}
        </div>
      </div>
    </div>
  );
}
