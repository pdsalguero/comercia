// scripts/fetch-vehicle-data.ts
// Ejecutar UNA SOLA VEZ para generar src/lib/vehicle-data.ts
// npx tsx src/scripts/fetch-vehicle-data.ts

import fs from "fs";

const BASE = "https://api.mercadolibre.com";

// Modelos hardcodeados para las marcas más populares en Argentina
// (La API pública de ML no expone modelos sin OAuth)
const HARDCODED_MODELS: Record<string, string[]> = {
  Toyota: ["Corolla", "Hilux", "Etios", "Yaris", "SW4", "Land Cruiser", "RAV4", "Camry", "Fortuner", "Prado", "GR86", "Supra"],
  Volkswagen: ["Gol", "Polo", "Golf", "Vento", "Amarok", "Tiguan", "T-Cross", "Virtus", "Nivus", "Saveiro", "Up!", "Taos", "Atlas"],
  Ford: ["Ka", "EcoSport", "Ranger", "Focus", "Fiesta", "Mondeo", "Territory", "Bronco", "Mustang", "Explorer", "Edge", "Maverick"],
  Chevrolet: ["Onix", "Cruze", "Tracker", "Spin", "Trax", "Captiva", "S10", "Montana", "Equinox", "Blazer", "Colorado", "Agile", "Cobalt"],
  Renault: ["Sandero", "Logan", "Duster", "Kwid", "Kangoo", "Stepway", "Captur", "Clio", "Megane", "Symbol", "Oroch", "Koleos"],
  Peugeot: ["208", "308", "408", "2008", "3008", "5008", "508", "Partner", "Expert", "Landtrek", "301"],
  Fiat: ["Palio", "Uno", "Siena", "Cronos", "Pulse", "Fastback", "Strada", "Doblo", "Ducato", "Toro", "500", "Mobi", "Argo"],
  Honda: ["Fit", "City", "Civic", "HR-V", "CR-V", "Accord", "Jazz", "WR-V", "Ridgeline", "Pilot", "Odyssey"],
  Hyundai: ["HB20", "i30", "Elantra", "Tucson", "Santa Fe", "Creta", "i10", "Accent", "Sonata", "ix35", "Venue", "Staria"],
  Kia: ["Picanto", "Rio", "Cerato", "Sportage", "Sorento", "Carnival", "Soul", "Stinger", "Seltos", "EV6", "Telluride"],
  Nissan: ["March", "Versa", "Sentra", "Tiida", "Frontier", "Kicks", "Qashqai", "X-Trail", "Murano", "Pathfinder", "Navara"],
  Citroën: ["C3", "C4", "C5", "Berlingo", "Jumper", "C3 Aircross", "C4 Cactus", "C5 Aircross", "Spacetourer"],
  BMW: ["Serie 1", "Serie 2", "Serie 3", "Serie 4", "Serie 5", "Serie 7", "X1", "X2", "X3", "X4", "X5", "X6", "X7", "M3", "M5"],
  "Mercedes-Benz": ["Clase A", "Clase B", "Clase C", "Clase E", "Clase S", "GLA", "GLB", "GLC", "GLE", "GLS", "Sprinter", "Vito", "AMG GT"],
  Audi: ["A1", "A3", "A4", "A5", "A6", "A7", "A8", "Q2", "Q3", "Q5", "Q7", "Q8", "TT", "R8", "e-tron"],
  Jeep: ["Renegade", "Compass", "Cherokee", "Grand Cherokee", "Wrangler", "Gladiator"],
  Suzuki: ["Alto", "Swift", "Baleno", "Vitara", "S-Cross", "Ignis", "Jimny", "Grand Vitara"],
  Chery: ["QQ", "Tiggo 2", "Tiggo 4", "Tiggo 5x", "Tiggo 7", "Tiggo 8", "Arrizo 5", "Arrizo 6"],
  Geely: ["GC2", "GX3 Pro", "Emgrand", "Coolray", "Tugella", "Azkarra"],
  BYD: ["F3", "Yuan Plus", "Atto 3", "Han", "Dolphin", "Song", "Tang", "Seal"],
  Mitsubishi: ["Lancer", "Galant", "Eclipse", "Outlander", "ASX", "L200", "Montero", "Pajero", "Eclipse Cross"],
  Subaru: ["Impreza", "Legacy", "Outback", "Forester", "XV", "WRX", "BRZ", "Crosstrek"],
  Mazda: ["2", "3", "6", "CX-3", "CX-5", "CX-9", "MX-5", "BT-50"],
  Volvo: ["S60", "S90", "V60", "V90", "XC40", "XC60", "XC90"],
  "Land Rover": ["Defender", "Discovery", "Discovery Sport", "Range Rover", "Range Rover Sport", "Range Rover Evoque", "Freelander"],
  Porsche: ["911", "Cayenne", "Macan", "Panamera", "Taycan", "718 Cayman", "718 Boxster"],
  Tesla: ["Model 3", "Model S", "Model X", "Model Y", "Cybertruck"],
  RAM: ["700", "1500", "2500", "3500", "ProMaster"],
  Dodge: ["Charger", "Challenger", "Durango", "Journey", "Neon"],
  Haval: ["H1", "H2", "H4", "H6", "H9", "F5", "F7", "Jolion"],
  JAC: ["J3", "J4", "J5", "J7", "S1", "S2", "S3", "T6", "T8"],
  Maxus: ["G10", "T60", "T90", "D90", "EV80", "V80"],
  GWM: ["Pao", "Ora 03", "Poer", "Tank 300"],
};

// Marcas de motos más populares en Argentina (hardcodeadas)
const MOTO_BRANDS_HARDCODED = [
  "Honda", "Yamaha", "Kawasaki", "Suzuki", "Beta", "Zanella",
  "Corven", "Motomel", "Guerrero", "Gilera", "Bajaj", "TVS",
  "Ducati", "BMW", "KTM", "Husqvarna", "Royal Enfield", "Harley-Davidson",
  "Triumph", "Benelli", "CF Moto", "Aprilia", "Lifan", "Rieju",
  "SYM", "Kymco", "Piaggio", "Vespa",
];

interface MLAttribute {
  id: string;
  values?: { id: string; name: string }[];
}

async function fetchJSON(url: string): Promise<MLAttribute[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
  return res.json() as Promise<MLAttribute[]>;
}

async function getBrands(
  categoryId: string,
): Promise<{ id: string; name: string }[]> {
  const attrs = await fetchJSON(`${BASE}/categories/${categoryId}/attributes`);
  const brandAttr = attrs.find((a) => a.id === "BRAND");
  if (!brandAttr?.values) return [];
  return brandAttr.values
    .map((v) => ({ id: v.id, name: v.name }))
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
}

async function main() {
  console.log("🚗 Fetching vehicle data from MercadoLibre API...\n");

  // ── 1. Marcas de autos (desde API pública) ───────────────────
  console.log("Fetching car brands (MLA1744)...");
  const carBrands = await getBrands("MLA1744");
  console.log(`  → ${carBrands.length} marcas encontradas`);

  // ── 2. Modelos hardcodeados ──────────────────────────────────
  // La API pública de ML no expone modelos sin OAuth2
  console.log("\nUsing hardcoded models for popular brands...");
  const brandModels: Record<string, string[]> = HARDCODED_MODELS;
  console.log(`  → ${Object.keys(brandModels).length} marcas con modelos`);
  console.log(`  → ${Object.values(brandModels).flat().length} modelos totales`);

  // ── 3. Marcas de motos (hardcodeadas) ───────────────────────
  console.log("\nUsing hardcoded moto brands...");
  const motoBrands = MOTO_BRANDS_HARDCODED.map((name) => ({
    value: name.toLowerCase().replace(/\s+/g, "-"),
    label: name,
  }));
  console.log(`  → ${motoBrands.length} marcas de motos`);

  // ── 4. Generar el archivo TypeScript ────────────────────────
  const output = `// src/lib/vehicle-data.ts
// AUTO-GENERADO — ejecutar src/scripts/fetch-vehicle-data.ts para actualizar
// Fuente: marcas desde API pública MercadoLibre Argentina, modelos hardcodeados
// Generado: ${new Date().toISOString().slice(0, 10)}

export interface BrandOption {
  value: string
  label: string
}

// ─── Marcas de autos y camionetas ────────────────────────────
export const CAR_BRANDS: BrandOption[] = ${JSON.stringify(
    carBrands.map((b) => ({
      value: b.name.toLowerCase().replace(/\s+/g, "-"),
      label: b.name,
    })),
    null,
    2,
  )}

// ─── Modelos por marca ────────────────────────────────────────
export const CAR_MODELS: Record<string, string[]> = ${JSON.stringify(brandModels, null, 2)}

// ─── Marcas de motos ─────────────────────────────────────────
export const MOTO_BRANDS: BrandOption[] = ${JSON.stringify(motoBrands, null, 2)}

// ─── Helpers ─────────────────────────────────────────────────
export function getModelsForBrand(brand: string): string[] {
  const key = Object.keys(CAR_MODELS).find(
    k => k.toLowerCase() === brand.toLowerCase()
  )
  return key ? CAR_MODELS[key] : []
}

export function getBrandLabel(value: string): string {
  const found = CAR_BRANDS.find(b => b.value === value)
  return found?.label ?? value
}
`;

  fs.writeFileSync("src/lib/vehicle-data.ts", output);
  console.log("\n✅ Generado: src/lib/vehicle-data.ts");
  console.log(`   ${carBrands.length} marcas de autos`);
  console.log(`   ${Object.keys(brandModels).length} marcas con modelos`);
  console.log(`   ${Object.values(brandModels).flat().length} modelos totales`);
  console.log(`   ${motoBrands.length} marcas de motos`);
}

main().catch(console.error);
