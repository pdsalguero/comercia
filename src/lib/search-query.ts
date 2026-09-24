// Búsqueda por palabra clave (`q`) sin migraciones: cada palabra se convierte en una regex
// case-insensitive (operador `imatch` de PostgREST) que ignora acentos, y se busca en título,
// descripción, marca, modelo y versión. Todas las palabras tienen que aparecer (AND); cada una
// puede estar en cualquiera de los campos (OR).
//
// Por qué regex y no ILIKE: ILIKE no ignora acentos sin la extensión `unaccent` (requiere migración)
// y trata `%` y `_` como comodines. Acá los símbolos se escapan como clase de un carácter (`[%]`),
// así que "%" busca un "%" literal en vez de devolver todo.

/** Campos donde se busca cada palabra (sintaxis de PostgREST). */
export const KEYWORD_FIELDS_VEHICLE = [
  "title",
  "description",
  "attributes->>brand",
  "attributes->>model",
  "attributes->>version",
] as const;

// Frases que se escriben separadas pero son una marca: "cf moto" → cfmoto. Se aplican antes de partir en palabras.
const PHRASES: [RegExp, string][] = [
  [/\bcf\s+moto\b/g, "cfmoto"],
  [/\bmercedes[\s-]+benz\b/g, "mercedes"],
  [/\bgas\s+gas\b/g, "gasgas"],
  [/\broyal\s+enfield\b/g, "royal enfield"],
];

// Sinónimos por palabra: la palabra matchea cualquiera de las alternativas.
const SYNONYMS: Record<string, string[]> = {
  vw: ["vw", "volkswagen"],
  volkswagen: ["volkswagen", "vw"],
  chevy: ["chevy", "chevrolet"],
  mb: ["mercedes"],
  mercedes: ["mercedes"],
  citroen: ["citroen"],
};

const ACCENT_CLASS: Record<string, string> = {
  a: "[aáàäâ]",
  e: "[eéèëê]",
  i: "[iíìïî]",
  o: "[oóòöô]",
  u: "[uúùüû]",
  n: "[nñ]",
  c: "[cç]",
};

/** Minúsculas y sin acentos: "Baúl" → "baul". */
export function foldText(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** Parte la búsqueda en palabras normalizadas (sin acentos, con frases de marca unidas). */
export function tokenizeKeywords(q: string): string[] {
  let s = foldText(q).trim();
  for (const [re, rep] of PHRASES) s = s.replace(re, rep);
  // "royal enfield" queda como dos palabras a propósito: cada una matchea sola.
  return s.split(/\s+/).filter(Boolean).slice(0, 8);
}

/**
 * Regex para una palabra ya normalizada. Letras con sus variantes acentuadas; entre letra y número
 * admite un espacio o guion opcional ("sw4" encuentra "SW 4" y "SW-4"). Cualquier otro símbolo va
 * como clase literal (`[%]`, `[.]`); comillas y barras se descartan porque rompen la sintaxis de PostgREST.
 */
export function wordToRegex(word: string): string {
  let out = "";
  const chars = [...word];
  chars.forEach((ch, i) => {
    const prev = chars[i - 1];
    if (prev && ((/[a-z]/.test(prev) && /\d/.test(ch)) || (/\d/.test(prev) && /[a-z]/.test(ch)))) out += "[ -]?";
    if (ACCENT_CLASS[ch]) out += ACCENT_CLASS[ch];
    else if (/[a-z0-9]/.test(ch)) out += ch;
    else if (/["\\\]\[^]/.test(ch)) return;
    else out += `[${ch}]`;
  });
  return out;
}

function tokenRegex(token: string): string {
  const alts = SYNONYMS[token] ?? [token];
  const res = alts.map(wordToRegex).filter(Boolean);
  if (!res.length) return "";
  return res.length === 1 ? res[0] : `(${res.join("|")})`;
}

/**
 * Un filtro `or(...)` de PostgREST por palabra. Aplicar cada uno con `query.or(filtro)`
 * (varios `.or()` se combinan con AND). Devuelve [] si la búsqueda está vacía.
 */
export function buildKeywordFilters(q: string | undefined | null, fields: readonly string[] = KEYWORD_FIELDS_VEHICLE): string[] {
  if (!q) return [];
  return tokenizeKeywords(q)
    .map(tokenRegex)
    .filter(Boolean)
    .map((re) => fields.map((f) => `${f}.imatch."${re}"`).join(","));
}
