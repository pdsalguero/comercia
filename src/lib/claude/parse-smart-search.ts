// src/lib/claude/parse-smart-search.ts
//
// "Búsqueda inteligente" del hero: traduce una frase en lenguaje natural
// ("SUV de menos de 3 años con aire acondicionado") a los filtros de /category/vehicles.
// Mismo patrón que analyze-photo.ts (fetch directo a la API de Claude, sin SDK) — ver esa
// referencia para el estilo del proyecto.
import { CAR_BRANDS } from "@/lib/vehicle-data";
import { CAMION_BRANDS_LIST } from "@/data/vehiculos";
import { MOTO_BRANDS_LIST, CUATRI_BRANDS_LIST, UTV_BRANDS_LIST } from "@/data/modelos-motos";

// Catálogo real de marcas (mismo que usa el buscador del hero) — se usa para validar/normalizar
// lo que devuelve la IA, no se le manda el catálogo completo al prompt (sería carísimo en tokens).
const KNOWN_BRANDS = [
  ...new Set(
    [...CAR_BRANDS, ...CAMION_BRANDS_LIST, ...MOTO_BRANDS_LIST, ...CUATRI_BRANDS_LIST, ...UTV_BRANDS_LIST]
      .map((b) => b.value)
      .filter((v) => v !== "otra" && v !== "otro")
  ),
];

const SUBCATS = ["auto", "camioneta", "moto", "cuatriciclo", "utv", "camion", "nautica"];
const FUELS = ["nafta", "diesel", "gnc", "electrico", "hibrido"];
const TRANSMISSIONS = ["manual", "automatica", "cvt"];
const CONDITIONS = ["new", "used"];
// Mismos keys que VEHICLE_FEAT_KEYS en category/[slug]/page.tsx
const FEATURES = ["has_gnc", "has_ac", "power_steering", "has_airbags", "rear_camera", "power_windows", "central_lock"];

const SYSTEM_PROMPT = `Traducís búsquedas de vehículos en lenguaje natural (mercado argentino) a filtros estructurados.
Devolvés SOLO JSON válido. Cero texto adicional, cero markdown, cero explicaciones fuera del JSON.
Nunca inventás una marca, modelo o valor que no esté explícito o claramente implícito en el texto — ante la duda, dejá el campo en null.`;

export interface SmartSearchFilters {
  sub_category: string | null;
  brand: string | null;
  price_min: number | null;
  price_max: number | null;
  year_from: number | null;
  year_to: number | null;
  km_max: number | null;
  fuel: string | null;
  transmission: string | null;
  condition: "new" | "used" | null;
  features: string[];
  q: string | null;
}

function buildUserPrompt(query: string): string {
  const currentYear = new Date().getFullYear();
  return `Hoy es ${currentYear}. Convertí esta búsqueda a filtros:

"${query}"

Devolvé EXACTAMENTE este JSON (usá null en los campos que no apliquen — no rellenes de más):
{
  "sub_category": "auto|camioneta|moto|cuatriciclo|utv|camion|nautica" o null,
  "brand": "marca mencionada, en minúsculas (ej: toyota, ford)" o null,
  "price_min": número (ARS) o null,
  "price_max": número (ARS) o null,
  "year_from": año (número de 4 dígitos) o null,
  "year_to": año (número de 4 dígitos) o null,
  "km_max": número o null,
  "fuel": "nafta|diesel|gnc|electrico|hibrido" o null,
  "transmission": "manual|automatica|cvt" o null,
  "condition": "new" (0km) | "used" o null,
  "features": subconjunto de ["has_gnc","has_ac","power_steering","has_airbags","rear_camera","power_windows","central_lock"], [] si ninguno aplica,
  "q": palabra suelta que no encaje en ningún campo de arriba (ej. un modelo puntual como "Hilux"), o null
}

Reglas de interpretación:
- "menos de N años" / "no más de N años de antigüedad" → year_from = ${currentYear} - N
- "SUV" / "4x4" (sin especificar que es auto chico) → sub_category = "camioneta"
- "con aire" / "aire acondicionado" → agregar "has_ac" a features
- "con GNC" / "a gas" → fuel = "gnc" (NO va en features)
- "con airbags" → agregar "has_airbags"
- "con cámara de retroceso" → agregar "rear_camera"
- "0km" / "nuevo" (nunca usado) → condition = "new"
- "usado" → condition = "used"
- Precio: "por menos de X" / "hasta X" → price_max = X. "X millones" = X × 1.000.000. "X mil" / "X lucas" = X × 1.000.
- Si el texto no menciona nada de un campo, ese campo va en null (o [] para features) — no asumas.`;
}

export async function parseSmartSearch(query: string): Promise<SmartSearchFilters> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserPrompt(query) }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Claude API error: ${err.error?.message ?? response.statusText}`);
  }

  const data = await response.json();
  const raw = data.content?.[0]?.text ?? "";
  const clean = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  let parsed: any;
  try {
    parsed = JSON.parse(clean);
  } catch {
    throw new Error(`No se pudo interpretar la búsqueda: ${raw.slice(0, 200)}`);
  }

  // ── Normalizar/validar contra los catálogos reales — nunca devolver un valor que el
  //    listado no sepa filtrar (mismo criterio que analyze-photo.ts con brand/fuel/etc.) ──
  let brand: string | null = null;
  if (parsed.brand) {
    const b = String(parsed.brand).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
    brand = KNOWN_BRANDS.find((vb) => b === vb || b.includes(vb) || vb.includes(b)) ?? null;
  }

  const sub_category = SUBCATS.includes(parsed.sub_category) ? parsed.sub_category : null;
  const fuel = FUELS.includes(parsed.fuel) ? parsed.fuel : null;
  const transmission = TRANSMISSIONS.includes(parsed.transmission) ? parsed.transmission : null;
  const condition = CONDITIONS.includes(parsed.condition) ? parsed.condition : null;
  const features = Array.isArray(parsed.features) ? parsed.features.filter((f: string) => FEATURES.includes(f)) : [];

  const toNum = (v: unknown): number | null => {
    const n = Number(v);
    return v != null && Number.isFinite(n) && n > 0 ? n : null;
  };

  return {
    sub_category,
    brand,
    price_min: toNum(parsed.price_min),
    price_max: toNum(parsed.price_max),
    year_from: toNum(parsed.year_from),
    year_to: toNum(parsed.year_to),
    km_max: toNum(parsed.km_max),
    fuel,
    transmission,
    condition,
    features,
    q: typeof parsed.q === "string" && parsed.q.trim() ? parsed.q.trim() : null,
  };
}
