// Textos del estado vacío de /category/vehicles (EmptyVehicleResults).

export type EmptyResultsInput = {
  /** Qué buscaba ("Toyota Hilux", "motos"); vacío si solo filtró por precio, año, etc. */
  wanted: string;
  province?: string;
  hasFilters: boolean;
  /** Avisos de `wanted` (tipo/marca/modelo) sin los demás filtros. */
  wantedCount: number;
};

export type EmptyResultsCopy = {
  title: string;
  body: string;
  /** Hay avisos de lo buscado que otros filtros dejan afuera: ofrecer quitar filtros. */
  canRelax: boolean;
};

export function emptyResultsCopy({ wanted, province, hasFilters, wantedCount }: EmptyResultsInput): EmptyResultsCopy {
  if (!hasFilters) {
    return { title: "Todavía no hay vehículos publicados", body: "Sé el primero en publicar el tuyo.", canRelax: false };
  }
  // Hay avisos de lo que busca, pero los demás filtros (precio, año, provincia…) los dejan afuera
  if (wanted && wantedCount > 0) {
    return {
      title: "No encontramos avisos con estos filtros",
      body: `Hay ${wantedCount} ${wantedCount === 1 ? "aviso" : "avisos"} de ${wanted}, pero ninguno cumple con todos los filtros. Probá quitando algunos.`,
      canRelax: true,
    };
  }
  if (wanted) {
    return {
      title: `Todavía no hay avisos de ${wanted}${province ? ` en ${province}` : ""}`,
      body: "¿Tenés uno para vender? Publicalo gratis y aparecés primero para quienes lo buscan.",
      canRelax: false,
    };
  }
  return {
    title: "No encontramos avisos con estos filtros",
    body: "Probá quitando algunos filtros o ampliando el rango de precio o año.",
    canRelax: false,
  };
}
