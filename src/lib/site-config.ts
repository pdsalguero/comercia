// Categorías habilitadas en la etapa actual del sitio.
// Fuente única de verdad: la usan la UI (navbar, home, listados), los endpoints
// de escritura (que rechazan categorías no habilitadas) y las lecturas públicas.
// Para reabrir una categoría (ej. Inmuebles = 3, Servicios = 26) sumar su id y slug acá.

export const ENABLED_CATEGORY_IDS: number[] = [2]; // Vehículos
export const ENABLED_CATEGORY_SLUGS: string[] = ["vehicles"];

export const DEFAULT_CATEGORY_SLUG = "vehicles";

// Programa de fundadores: los primeros `slots` usuarios que se registran reciben `credits` créditos
// de destacado Premium (sin vencimiento). La regla real vive en la base de datos, en el trigger
// assign_early_adopter_credits (supabase/migrations/20260403000001_free_destacado_credits.sql):
// si se cambia allá, cambiar estos valores también, porque son los que se muestran en el sitio.
export const FOUNDER_PROGRAM = { slots: 100, credits: 10 } as const;

export function isCategoryEnabled(id: number | null | undefined): boolean {
  return id != null && ENABLED_CATEGORY_IDS.includes(id);
}

export function isCategorySlugEnabled(slug: string | null | undefined): boolean {
  return !!slug && ENABLED_CATEGORY_SLUGS.includes(slug);
}
