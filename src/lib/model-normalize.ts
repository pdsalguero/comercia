// Modelo de vehículo: se carga como texto libre con sugerencias del catálogo. Al guardar, si lo escrito
// coincide con un modelo conocido (sin importar mayúsculas, tildes, espacios, guiones ni puntos) se guarda
// el nombre del catálogo; si no, lo que escribió el vendedor, sin espacios de más. Así "hi-lux " y "HILUX"
// quedan como "Hilux" y el filtro por modelo los encuentra. Sin imports: sirve en servidor y navegador.

/** Clave de comparación: "Hi-Lux SRV" → "hiluxsrv". */
export function modelKey(raw: unknown): string {
  return String(raw ?? "")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[\s\-._/]+/g, "");
}

/** Recorta y colapsa espacios. */
export function cleanModelText(raw: unknown): string {
  return String(raw ?? "").replace(/\s+/g, " ").trim();
}

/** Nombre canónico si coincide con alguna opción; si no, el texto limpio. */
export function canonicalModel(raw: unknown, options: readonly string[]): string {
  const text = cleanModelText(raw);
  if (!text) return "";
  const key = modelKey(text);
  return options.find((m) => modelKey(m) === key) ?? text;
}

/** ¿Dos modelos son el mismo para filtrar? ("Hilux" = "HILUX" = "hi-lux"). */
export function sameModel(a: unknown, b: unknown): boolean {
  const ka = modelKey(a);
  return ka !== "" && ka === modelKey(b);
}
