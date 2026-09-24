// Costo estimado de transferir un vehículo usado en las provincias de Cuyo.
//
// Son montos que cambian por ley: revisar al menos en enero (leyes impositivas provinciales) y
// cada vez que se actualiza el MRPA (cada 4 meses). Fuentes vigentes a septiembre 2026:
// - Arancel del Registro (DNRPA): 1% del mayor entre la valuación DNRPA y el valor declarado,
//   con mínimo de 32 MRPA (autos) o 15 MRPA (motos). Res. MJ 412/2026, desde el 01/09/2026.
//   MRPA = 0,5 UVA redondeado (Res. 308/2026): $1.040 desde septiembre 2026.
// - Sellos Mendoza: 1% para transferencias de autos y motos (Ley Impositiva 2026 N° 9680, art. 7);
//   0,5% si es un usado vendido con factura por una concesionaria inscripta.
// - Sellos San Juan: 0,40% (Ley 2803-I, art. 3.18) + 20% de adicional para acción social;
//   la base es el mayor entre el precio y la tabla de ACARA.
// - Sellos San Luis: 5‰ (Ley VIII-254/2025), con mínimo de $7.540 (autos) o $3.900 (motos);
//   la base no puede ser menor al avalúo del impuesto automotor.

export const TRANSFER_RATES_AS_OF = "septiembre de 2026";

const MRPA = 1040;
const REGISTRY_RATE = 0.01;
const REGISTRY_MIN_MRPA = { auto: 32, moto: 15 } as const;

export type VehicleKind = "auto" | "moto";

interface ProvinceRule {
  key: string;
  label: string;
  stampRate: number;
  stampMin?: Record<VehicleKind, number>;
  note: string;
}

const PROVINCE_RULES: ProvinceRule[] = [
  {
    key: "mendoza",
    label: "Mendoza",
    stampRate: 0.01,
    note: "Sellos 1% (0,5% si le comprás a una concesionaria con factura).",
  },
  {
    key: "san-juan",
    label: "San Juan",
    stampRate: 0.004 * 1.2,
    note: "Sellos 0,40% más 20% de adicional para acción social.",
  },
  {
    key: "san-luis",
    label: "San Luis",
    stampRate: 0.005,
    stampMin: { auto: 7540, moto: 3900 },
    note: "Sellos 0,5%, con un mínimo fijo.",
  },
];

export interface TransferEstimate {
  key: string;
  label: string;
  registry: number;
  stamps: number;
  total: number;
  note: string;
}

// Estima sobre el precio en pesos. El Registro y la provincia cobran sobre el mayor entre ese
// precio y la valuación oficial, así que el costo real puede ser algo mayor: mostrarlo como estimado.
export function estimateTransferCosts(priceArs: number, kind: VehicleKind): TransferEstimate[] {
  const registry = Math.max(priceArs * REGISTRY_RATE, REGISTRY_MIN_MRPA[kind] * MRPA);
  return PROVINCE_RULES.map((p) => {
    const stamps = Math.max(priceArs * p.stampRate, p.stampMin?.[kind] ?? 0);
    return {
      key: p.key,
      label: p.label,
      registry: Math.round(registry),
      stamps: Math.round(stamps),
      total: Math.round(registry + stamps),
      note: p.note,
    };
  });
}

export function vehicleKind(subCategory: string | null | undefined): VehicleKind {
  return subCategory === "moto" ? "moto" : "auto";
}
