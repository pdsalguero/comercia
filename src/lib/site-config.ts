// Categorías habilitadas en la etapa actual del sitio.
// Fuente única de verdad: la usan la UI (navbar, home, listados), los endpoints
// de escritura (que rechazan categorías no habilitadas) y las lecturas públicas.
// Para reabrir una categoría (ej. Inmuebles = 3, Servicios = 26) sumar su id y slug acá.

export const ENABLED_CATEGORY_IDS: number[] = [2]; // Vehículos
export const ENABLED_CATEGORY_SLUGS: string[] = ["vehicles"];

export const DEFAULT_CATEGORY_SLUG = "vehicles";

export function isCategoryEnabled(id: number | null | undefined): boolean {
  return id != null && ENABLED_CATEGORY_IDS.includes(id);
}

export function isCategorySlugEnabled(slug: string | null | undefined): boolean {
  return !!slug && ENABLED_CATEGORY_SLUGS.includes(slug);
}
