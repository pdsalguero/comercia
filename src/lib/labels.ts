// Diccionario único de etiquetas que ve el usuario: combustible, transmisión, estado, tipo de vehículo,
// fechas relativas y plurales. Los avisos guardan el valor (sin tildes, en minúscula) y cada pantalla
// muestra la etiqueta de acá, así el mismo dato se lee igual en la tarjeta, la ficha, los filtros y los
// formularios. Módulo sin imports: lo usan tanto el servidor como el navegador.

export interface LabeledOption { value: string; label: string }

export const FUEL_OPTIONS: LabeledOption[] = [
  { value: "nafta",     label: "Nafta" },
  { value: "diesel",    label: "Diésel" },
  { value: "gnc",       label: "GNC" },
  { value: "nafta_gnc", label: "Nafta + GNC" },
  { value: "electrico", label: "Eléctrico" },
  { value: "hibrido",   label: "Híbrido" },
  { value: "glp",       label: "GLP" },
];

export const TRANSMISSION_OPTIONS: LabeledOption[] = [
  { value: "manual",     label: "Manual" },
  { value: "automatica", label: "Automática" },
  { value: "cvt",        label: "CVT" },
];

export const CONDITION_OPTIONS: LabeledOption[] = [
  { value: "new",       label: "Nuevo" },
  { value: "like_new",  label: "Como nuevo" },
  { value: "very_good", label: "Muy bueno" },
  { value: "good",      label: "Bueno" },
  { value: "fair",      label: "Regular" },
  { value: "for_parts", label: "Para repuestos" },
];

/** Tipos de vehículo en plural: filtros, menú y títulos de listado. */
export const VEHICLE_TYPE_OPTIONS: LabeledOption[] = [
  { value: "auto",        label: "Autos" },
  { value: "camioneta",   label: "Pickups / SUV / Utilitarios" },
  { value: "moto",        label: "Motos" },
  { value: "cuatriciclo", label: "Cuatriciclos" },
  { value: "utv",         label: "Areneros / UTV" },
  { value: "camion",      label: "Camiones" },
  { value: "nautica",     label: "Náutica" },
  { value: "otro",        label: "Otros vehículos" },
];

/** El mismo tipo en singular, para describir un aviso ("Tipo: Moto") y el formulario de publicar. */
export const VEHICLE_TYPE_SINGULAR: Record<string, string> = {
  auto: "Auto",
  camioneta: "Pickup / SUV / Utilitario",
  moto: "Moto",
  cuatriciclo: "Cuatriciclo",
  utv: "Arenero / UTV",
  camion: "Camión",
  nautica: "Náutica",
  "plan-ahorro": "Plan de ahorro",
  otro: "Otro vehículo",
};

/** Versión corta para chips y breadcrumbs, donde no entra el nombre completo. */
export const VEHICLE_TYPE_SHORT: Record<string, string> = {
  ...VEHICLE_TYPE_SINGULAR,
  camioneta: "Pickup/SUV",
  utv: "Arenero/UTV",
};

const toMap = (opts: LabeledOption[]) => Object.fromEntries(opts.map((o) => [o.value, o.label]));
export const FUEL_LABELS: Record<string, string> = toMap(FUEL_OPTIONS);
export const TRANSMISSION_LABELS: Record<string, string> = toMap(TRANSMISSION_OPTIONS);
export const CONDITION_LABELS: Record<string, string> = toMap(CONDITION_OPTIONS);
export const VEHICLE_TYPE_LABELS: Record<string, string> = toMap(VEHICLE_TYPE_OPTIONS);

function fold(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, "").trim();
}

/**
 * Lleva un combustible o transmisión escrito de cualquier forma ("Diésel", "automática", "Nafta + GNC")
 * al valor que se guarda y filtra. Lo que no se reconoce queda como vino, recortado.
 */
export function normalizeSpecValue(kind: "fuel" | "transmission", raw: unknown): string {
  const s = String(raw ?? "").trim();
  if (!s) return "";
  const key = fold(s);
  const opts = kind === "fuel" ? FUEL_OPTIONS : TRANSMISSION_OPTIONS;
  const hit = opts.find((o) => fold(o.value) === key || fold(o.label) === key);
  if (hit) return hit.value;
  if (kind === "transmission" && key.startsWith("autom")) return "automatica";
  return s;
}

function labelFrom(map: Record<string, string>, raw: unknown): string {
  const s = String(raw ?? "").trim();
  if (!s) return "";
  if (map[s]) return map[s];
  // Valores viejos o cargados a mano: "diésel", "Automática".
  const hit = Object.entries(map).find(([v, l]) => fold(v) === fold(s) || fold(l) === fold(s));
  return hit ? hit[1] : s.charAt(0).toUpperCase() + s.slice(1);
}

export const fuelLabel = (v: unknown) => labelFrom(FUEL_LABELS, v);
export const transmissionLabel = (v: unknown) => labelFrom(TRANSMISSION_LABELS, v);
export const conditionLabel = (v: unknown) => labelFrom(CONDITION_LABELS, v);

/** "1 publicación", "3 publicaciones", "1.250 vistas". */
export function plural(n: number, singular: string, pluralForm: string): string {
  return `${n.toLocaleString("es-AR")} ${n === 1 ? singular : pluralForm}`;
}

/** Fecha relativa con un solo formato en todo el sitio: "recién", "hace 5 minutos", "hace 1 mes". */
export function timeAgo(date: string | Date, now: Date = new Date()): string {
  const secs = Math.max(0, Math.floor((now.getTime() - new Date(date).getTime()) / 1000));
  const mins = Math.floor(secs / 60);
  if (mins < 1) return "recién";
  if (mins < 60) return `hace ${plural(mins, "minuto", "minutos")}`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${plural(hours, "hora", "horas")}`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `hace ${plural(days, "día", "días")}`;
  const months = Math.floor(days / 30);
  if (months < 12) return `hace ${plural(months, "mes", "meses")}`;
  return `hace ${plural(Math.floor(days / 365), "año", "años")}`;
}
