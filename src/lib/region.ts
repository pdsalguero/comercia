// Región foco del sitio (CuyoRodados). En los selectores de provincia estas van primero, en su
// propio grupo; el resto del país sigue disponible debajo, en "Otras provincias".
export const FOCUS_REGION_LABEL = "Cuyo";
export const FOCUS_PROVINCES = ["Mendoza", "San Juan", "San Luis"];

export function isFocusProvince(label: string): boolean {
  return FOCUS_PROVINCES.includes(label);
}

/** Orden único de provincias en todos los selects: Mendoza, San Juan, San Luis y después el resto alfabético. */
export function sortProvinces<T>(items: T[], labelOf: (item: T) => string): T[] {
  const rank = (l: string) => { const i = FOCUS_PROVINCES.indexOf(l); return i < 0 ? FOCUS_PROVINCES.length : i; };
  return [...items].sort((a, b) => {
    const la = labelOf(a), lb = labelOf(b);
    return rank(la) - rank(lb) || la.localeCompare(lb, "es");
  });
}
