import valuaciones from "@/data/catalogo/valuaciones.generated.json";

// Valuación fiscal DNRPA por marca + modelo + año (solo servidor: el JSON pesa ~1 MB).
// La tabla la genera tools/catalogo-vehiculos/construir_catalogo.py con los mismos nombres de marca y
// modelo que usa el formulario de publicar; cada año guarda [mínimo, máximo] entre las versiones.

type Data = { vigencia: string | null; valores: Record<string, Record<string, [number, number]>> };
const DATA = valuaciones as unknown as Data;

export const VALUACION_VIGENCIA = DATA.vigencia;

// Igual que norm() del script: mayúsculas, Ë/É → E, solo letras y números
const norm = (s: string) => s.toUpperCase().replace(/[ËÉ]/g, "E").replace(/[^A-Z0-9]/g, "");

/**
 * Exacto, o si no, el rango entre las versiones que empiezan con ese modelo: en motos DNRPA trae el
 * nombre completo ("800MT Explore Edition", "800MT Sport") y el formulario, el modelo ("800MT").
 * El prefijo se acepta solo con un número y 4+ caracteres, para no juntar "TNT" con toda la línea.
 */
export function dnrpaValuation(brand: string, model: string, year: string | number, data: Data = DATA): [number, number] | null {
  const m = norm(model);
  const y = String(year);
  if (!brand || !m) return null;
  const exact = data.valores[`${brand}|${m}`]?.[y];
  if (exact) return exact;
  if (m.length < 4 || !/\d/.test(m)) return null;
  const prefix = `${brand}|${m}`;
  let lo = Infinity, hi = 0;
  for (const [k, years] of Object.entries(data.valores)) {
    const v = k.startsWith(prefix) ? years[y] : undefined;
    if (v) { lo = Math.min(lo, v[0]); hi = Math.max(hi, v[1]); }
  }
  return hi ? [lo, hi] : null;
}
