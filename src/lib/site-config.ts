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

// Etapa de lanzamiento (2026-09): con poco tráfico, "0 vistas" o "3 vistas" le dice al comprador que
// al sitio no entra nadie. Las vistas se ocultan en tarjetas, listas y ficha; el vendedor las sigue
// viendo en su panel y el orden "Más vistas" sigue funcionando.
export const SHOW_PUBLIC_VIEW_COUNT = false;

// Antigüedad del aviso ("hace 2 meses", "Publicado hoy"): con pocos avisos, una fecha vieja hace parecer
// el sitio abandonado. Se oculta en tarjetas, listas y ficha; el dueño la sigue viendo en su panel y
// el orden "Más recientes" sigue funcionando.
export const SHOW_PUBLIC_LISTING_AGE = false;

// Directorio de concesionarias (/tiendas): mientras no haya ninguna cargada se sacan sus links del
// menú, del pie, de los accesos rápidos y del sitemap (la página sigue existiendo). "Sumá tu
// concesionaria" queda siempre. Poner en true cuando se sume la primera.
export const SHOW_STORES_DIRECTORY = false;

export function isCategoryEnabled(id: number | null | undefined): boolean {
  return id != null && ENABLED_CATEGORY_IDS.includes(id);
}

export function isCategorySlugEnabled(slug: string | null | undefined): boolean {
  return !!slug && ENABLED_CATEGORY_SLUGS.includes(slug);
}
