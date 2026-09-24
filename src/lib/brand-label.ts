// Nombre para mostrar de una marca guardada como slug ("cfmoto" → "CFMoto", "mercedes_benz" → "Mercedes-Benz").
// Sale del catálogo de marcas (solo marcas, ~20 KB), así que también se puede usar en componentes de cliente.
import { MARCAS_CATALOGO } from "@/data/catalogo/marcas.generated";

const BRAND_LABELS = new Map<string, string>(
  Object.values(MARCAS_CATALOGO).flat().map((b) => [b.value, b.label])
);

export function brandLabel(value: string): string {
  const v = value.trim();
  return (
    BRAND_LABELS.get(v) ??
    BRAND_LABELS.get(v.toLowerCase()) ??
    v.split(/[_-]/).filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
  );
}
