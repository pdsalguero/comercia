// Categorías que existen en /category/[slug] (habilitadas o no; ver ENABLED_CATEGORY_SLUGS en site-config).
// Un slug que no está acá es un 404 real (lo valida category/[slug]/layout.tsx).
export const CATEGORY_META: Record<string, { name: string; icon: string }> = {
  vehicles:        { name: "Vehículos",         icon: "🚗" },
  "real-estate":   { name: "Inmuebles",         icon: "🏠" },
  phones:          { name: "Celulares",          icon: "📱" },
  electronics:     { name: "Tecnología",         icon: "💻" },
  appliances:      { name: "Electrodomésticos",  icon: "🧊" },
  clothing:        { name: "Ropa y Calzado",     icon: "👗" },
  "home-garden":   { name: "Hogar y Muebles", icon: "🛋️" },
  sports:          { name: "Deportes",           icon: "⚽" },
  tools:           { name: "Herramientas",       icon: "🔧" },
  babies:          { name: "Bebés y Niños",      icon: "👶" },
  books:           { name: "Música, Libros y Revistas", icon: "📚" },
  "beauty-health": { name: "Belleza y Salud",    icon: "💄" },
  toys:            { name: "Juegos y Juguetes",  icon: "🧸" },
  pets:            { name: "Mascotas",           icon: "🐾" },
  services:        { name: "Servicios",          icon: "🛠️" },
  other:           { name: "Otros",              icon: "📦" },
};

export function isKnownCategorySlug(slug: string): boolean {
  return Object.prototype.hasOwnProperty.call(CATEGORY_META, slug);
}
