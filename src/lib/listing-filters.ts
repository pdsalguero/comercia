// Validación de filtros numéricos de la URL y orden por precio, compartidos por /category, /tienda y /seller.

/**
 * Entero no negativo de un parámetro de URL, o undefined si no es válido.
 * Rechaza negativos, decimales, notación científica ("1e3"), "Infinity" y textos.
 */
export function parseNonNegativeInt(raw: string | undefined | null, max = 1e12): number | undefined {
  if (raw == null) return undefined;
  const s = String(raw).trim();
  if (!/^\d{1,13}$/.test(s)) return undefined;
  const n = Number(s);
  return n <= max ? n : undefined;
}

type RangeKeys = { price_min?: string; price_max?: string; year_from?: string; year_to?: string; km_max?: string };

/**
 * Devuelve una copia de los searchParams con precio, año y km validados: los inválidos se descartan
 * y si mínimo > máximo se invierten. Todo lo que viene después (consulta, chips, inputs, links) usa
 * esta copia, así ningún chip puede mostrar "$-5.000".
 */
export function sanitizeRangeParams<T extends RangeKeys>(sp: T): T {
  const out: T = { ...sp };
  const pair = (minKey: keyof RangeKeys, maxKey: keyof RangeKeys, max?: number) => {
    let lo = parseNonNegativeInt(sp[minKey], max);
    let hi = parseNonNegativeInt(sp[maxKey], max);
    if (lo != null && hi != null && lo > hi) [lo, hi] = [hi, lo];
    out[minKey] = lo != null ? String(lo) : undefined;
    out[maxKey] = hi != null ? String(hi) : undefined;
  };
  pair("price_min", "price_max");
  // Años de 4 cifras razonables; un año fuera de rango se descarta.
  pair("year_from", "year_to", 2100);
  for (const k of ["year_from", "year_to"] as const) {
    if (out[k] != null && Number(out[k]) < 1900) out[k] = undefined;
  }
  const km = parseNonNegativeInt(sp.km_max);
  out.km_max = km != null ? String(km) : undefined;
  return out;
}

/** Precio utilizable para ordenar: null si el aviso es "A consultar" (sin precio o precio 0). */
export function priceForSort(price: number | string | null | undefined): number | null {
  if (price == null) return null;
  const n = Number(price);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Compara por precio dejando siempre al final los "A consultar", en orden ascendente y descendente. */
export function comparePrice(
  a: { price?: number | string | null },
  b: { price?: number | string | null },
  desc: boolean,
): number {
  const av = priceForSort(a.price);
  const bv = priceForSort(b.price);
  if (av == null && bv == null) return 0;
  if (av == null) return 1;
  if (bv == null) return -1;
  return desc ? bv - av : av - bv;
}
