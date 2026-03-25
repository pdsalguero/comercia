// Brands from MLA Autos y Camionetas catalog (IDs from Mercado Libre)
export const MARCAS_AUTOS: { id: string; name: string }[] = [
  { id: "60249",    name: "Toyota" },
  { id: "58955",    name: "Chevrolet" },
  { id: "389374",   name: "Ford" },
  { id: "389370",   name: "Volkswagen" },
  { id: "389369",   name: "Renault" },
  { id: "389376",   name: "Honda" },
  { id: "389371",   name: "Peugeot" },
  { id: "389375",   name: "Hyundai" },
  { id: "389379",   name: "Jeep" },
  { id: "389373",   name: "Fiat" },
  { id: "389381",   name: "Nissan" },
  { id: "389380",   name: "Kia" },
  { id: "389382",   name: "Mitsubishi" },
  { id: "389378",   name: "Citroën" },
  { id: "389384",   name: "BMW" },
  { id: "389385",   name: "Mercedes-Benz" },
  { id: "389386",   name: "Audi" },
  { id: "66395",    name: "Chrysler" },
  { id: "389383",   name: "Subaru" },
  { id: "389388",   name: "Chery" },
  { id: "389389",   name: "BYD" },
  { id: "389390",   name: "BAIC" },
  { id: "389391",   name: "Geely" },
  { id: "389392",   name: "JAC" },
  { id: "389393",   name: "Great Wall" },
  { id: "389394",   name: "Haval" },
  { id: "389397",   name: "Changan" },
  { id: "389402",   name: "Porsche" },
  { id: "389409",   name: "Land Rover" },
  { id: "389411",   name: "Volvo" },
  { id: "389412",   name: "Skoda" },
  { id: "389413",   name: "SEAT" },
  { id: "389419",   name: "MG" },
  { id: "389426",   name: "Alfa Romeo" },
  { id: "17525505", name: "Cupra" },
  { id: "66708",    name: "Dodge" },
  { id: "60811",    name: "Mazda" },
];

/** Vehicle types used in the publication form */
export const TIPOS_VEHICULO = [
  { value: "auto",      label: "Auto" },
  { value: "camioneta", label: "Camioneta / SUV" },
  { value: "moto",      label: "Moto" },
  { value: "camion",    label: "Camión" },
  { value: "nautica",   label: "Náutica" },
  { value: "otro",      label: "Otro" },
];

/**
 * CAR_BRANDS slugs to show per vehicle tipo.
 * Used to filter the brand select when tipo = "auto" or "camioneta".
 */
export const MARCAS_POR_TIPO: Record<"auto" | "camioneta", Set<string>> = {
  auto: new Set([
    "toyota", "chevrolet", "ford", "volkswagen", "renault", "honda",
    "peugeot", "hyundai", "fiat", "nissan", "kia", "citroen",
    "bmw", "mercedes_benz", "audi", "chrysler", "subaru",
    "chery", "byd", "baic", "geely", "jac", "changan",
    "porsche", "volvo", "skoda", "seat", "mg", "alfa_romeo", "cupra",
    "dodge", "mazda",
  ]),
  camioneta: new Set([
    "toyota", "chevrolet", "ford", "volkswagen", "renault", "honda",
    "hyundai", "jeep", "fiat", "nissan", "kia", "mitsubishi", "citroen",
    "bmw", "mercedes_benz", "audi", "subaru",
    "chery", "byd", "baic", "great_wall", "haval", "changan", "jac",
    "land_rover", "volvo", "skoda", "seat", "mg", "cupra",
    "dodge", "mazda",
  ]),
};

/**
 * Returns the Mercado Libre brand ID for a given brand slug stored in attrs.brand.
 * Returns null if the brand is not in MARCAS_AUTOS.
 */
export function getMarcaMLId(brandSlug: string): string | null {
  const norm = (s: string) =>
    s.toLowerCase().replace(/[\s\-_áéíóúü]/g, "").replace("ç", "c");
  const n = norm(brandSlug);
  return MARCAS_AUTOS.find((m) => norm(m.name) === n)?.id ?? null;
}
