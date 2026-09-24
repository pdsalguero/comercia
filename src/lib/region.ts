// Región foco del sitio (CuyoRodados). En los selectores de provincia estas van primero, en su
// propio grupo; el resto del país sigue disponible debajo, en "Otras provincias".
export const FOCUS_REGION_LABEL = "Cuyo";
export const FOCUS_PROVINCES = ["Mendoza", "San Juan", "San Luis"];

export function isFocusProvince(label: string): boolean {
  return FOCUS_PROVINCES.includes(label);
}
