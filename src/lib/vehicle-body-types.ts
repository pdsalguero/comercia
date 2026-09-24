// Carrocería (categoría vehículo más fina, tipo ChileAutos) — solo para autos y camionetas,
// que hoy son los dos tipos que más mezclan carrocerías distintas bajo un mismo sub_category.
// Mismo patrón que MOTO_SUBTIPOS (src/data/modelos-motos.ts): un sub-filtro anidado que solo
// aparece cuando ya se eligió el tipo de vehículo. No hay valor "suv" en AUTO_BODY_TYPES a
// propósito — SUV ya vive dentro de sub_category="camioneta" ("Pickups / SUV / Utilitarios"),
// duplicarlo en autos generaría dos rutas distintas para el mismo vehículo.
export const AUTO_BODY_TYPES: { value: string; label: string }[] = [
  { value: "sedan",         label: "Sedán" },
  { value: "hatchback",     label: "Hatchback" },
  { value: "coupe",         label: "Coupé" },
  { value: "rural",         label: "Rural / Familiar" },
  { value: "minivan",       label: "Minivan / Monovolumen" },
  { value: "descapotable",  label: "Descapotable" },
  { value: "otro",          label: "Otro" },
];

export const CAMIONETA_BODY_TYPES: { value: string; label: string }[] = [
  { value: "pickup_simple", label: "Pickup cabina simple" },
  { value: "pickup_doble",  label: "Pickup doble cabina" },
  { value: "suv",           label: "SUV" },
  { value: "furgon",        label: "Furgón / Utilitario" },
  { value: "otro",          label: "Otro" },
];

export const BODY_TYPES_BY_SUBCAT: Record<string, { value: string; label: string }[]> = {
  auto: AUTO_BODY_TYPES,
  camioneta: CAMIONETA_BODY_TYPES,
};

export function bodyTypeOptions(subCategory: string | undefined | null): { value: string; label: string }[] {
  return BODY_TYPES_BY_SUBCAT[subCategory ?? ""] ?? [];
}

export function bodyTypeLabel(subCategory: string | undefined | null, value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  return bodyTypeOptions(subCategory).find((b) => b.value === value)?.label;
}
