/**
 * Genera una URL SEO-friendly para un aviso.
 * Formato: /listings/{title-slug}-{uuid}
 * El UUID completo al final permite lookup por PK sin overhead.
 */
export function listingUrl(id: string, title: string): string {
  const slug = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")   // quitar tildes
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return `/listings/${slug}-${id}`;
}

/** Extrae el UUID de un parámetro de ruta que puede ser:
 *  - UUID puro:          "9f5e75d0-d319-4296-85e0-456b42db5b6a"
 *  - Slug + UUID:        "toyota-hilux-sw4-9f5e75d0-d319-4296-85e0-456b42db5b6a"
 */
export function extractListingId(param: string): string {
  const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const match = param.match(UUID_RE);
  return match ? match[0] : param;
}
