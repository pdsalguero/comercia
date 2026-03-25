/**
 * Static vehicle models by brand slug and tipo.
 * Key = attrs.brand slug (e.g. "toyota", "mercedes_benz").
 * Derived from MLA Autos y Camionetas catalog.
 */
export const MODELOS_POR_MARCA: Record<string, { autos: string[]; camionetas: string[] }> = {
  toyota: {
    autos: ["Corolla", "Corolla Cross", "Yaris", "Yaris Sedan", "Camry", "Camry Hybrid", "Etios", "Prius", "Supra", "86", "GR86", "GR Corolla", "Auris", "Celica", "bZ4X"],
    camionetas: ["Hilux", "Hilux GR-Sport", "Hilux SW4", "RAV4", "RAV4 Hybrid", "Fortuner", "Land Cruiser", "Land Cruiser 200", "Land Cruiser 300", "Corolla Cross", "Hiace", "Highlander", "4Runner"],
  },
  chevrolet: {
    autos: ["Onix", "Onix Plus", "Cruze", "Cruze Hatchback", "Spark", "Sonic", "Spin", "Camaro", "Malibu", "Aveo", "Cobalt", "Agile", "Chevy"],
    camionetas: ["Tracker", "S10", "S10 Max", "Montana", "Equinox", "Captiva", "Trailblazer", "Blazer", "Traverse", "Tahoe", "Suburban"],
  },
  ford: {
    autos: ["Fiesta", "Fiesta Hatchback", "Focus", "Focus Hatchback", "Ka", "EcoSport", "Mustang", "Mustang Mach-E", "Fusion", "Mondeo", "Escort", "Taurus", "Puma", "Falcon", "Fairlane", "Taunus"],
    camionetas: ["Ranger", "Ranger Raptor", "Ranger Wildtrak", "EcoSport SUV", "Territory", "Edge", "Explorer", "Bronco", "F-150", "F100", "Falcon Pick-up"],
  },
  volkswagen: {
    autos: ["Gol", "Gol Trend", "Polo", "Polo GTI", "Vento", "Golf", "Golf GTI", "Golf R", "Passat", "Jetta", "Bora", "Virtus", "Voyage", "Beetle", "Saveiro"],
    camionetas: ["Tiguan", "Tiguan Allspace", "T-Cross", "Amarok", "Amarok V6", "Touareg", "Teramont", "Atlas"],
  },
  renault: {
    autos: ["Clio", "Clio RS", "Logan", "Fluence", "Mégane", "Mégane RS", "Scenic", "Laguna", "Torino", "R4", "R5", "12", "Fuego"],
    camionetas: ["Sandero", "Sandero Stepway", "Kwid", "Captur", "Captur E-Tech", "Duster", "Duster Oroch", "Kangoo", "Koleos"],
  },
  honda: {
    autos: ["Civic", "Civic Type R", "Civic Si", "Accord", "Jazz", "City", "Fit", "Insight"],
    camionetas: ["HR-V", "CR-V", "CR-V Hybrid", "Pilot", "Ridgeline"],
  },
  peugeot: {
    autos: ["208", "208 GT", "208 Electric", "307", "308", "308 SW", "206", "207", "301", "405", "504", "505"],
    camionetas: ["2008", "3008", "3008 GT", "3008 Hybrid", "5008", "4008"],
  },
  hyundai: {
    autos: ["i10", "i20", "i30", "i30 N", "Elantra", "Accent", "Sonata", "Sonata Hybrid"],
    camionetas: ["Creta", "Kona", "Kona Electric", "Santa Fe", "Tucson", "Venue"],
  },
  jeep: {
    autos: [],
    camionetas: ["Renegade", "Compass", "Cherokee", "Grand Cherokee", "Wrangler", "Wrangler Unlimited", "Gladiator"],
  },
  fiat: {
    autos: ["Argo", "Argo Drive", "Uno", "Palio", "Palio Weekend", "Siena", "Punto", "Linea", "Panda", "Doblò", "128", "600"],
    camionetas: ["Toro", "Strada", "Strada Working", "500X"],
  },
  nissan: {
    autos: ["March", "Versa", "Sentra", "Altima", "Leaf"],
    camionetas: ["Kicks", "Kicks N-Turbo", "X-Trail", "Frontier", "Frontier PRO", "Qashqai", "Pathfinder"],
  },
  kia: {
    autos: ["Picanto", "Cerato", "Cerato GT", "Stinger", "Forte"],
    camionetas: ["Sportage", "Sportage Hybrid", "Sorento", "Niro", "Carnival", "Telluride"],
  },
  mitsubishi: {
    autos: ["Lancer", "Lancer Evo", "Mirage"],
    camionetas: ["Outlander", "Outlander PHEV", "ASX", "L200", "Pajero", "Montero"],
  },
  citroen: {
    autos: ["C3", "C4", "C-Elysée", "Berlingo", "C1", "C5", "2CV"],
    camionetas: ["C3 Aircross", "C5 Aircross", "C4 Cactus"],
  },
  bmw: {
    autos: ["Serie 1", "Serie 2", "Serie 3", "Serie 5", "M340i", "M440i", "Z4", "i8"],
    camionetas: ["X1", "X2", "X3", "X5", "X6", "X7"],
  },
  mercedes_benz: {
    autos: ["Clase A", "Clase C", "Clase E", "Clase S", "CLA", "C63 AMG", "AMG GT"],
    camionetas: ["GLA", "GLB", "GLC", "GLE", "GLS", "GLC 63 AMG"],
  },
  audi: {
    autos: ["A1", "A3", "A3 Sedan", "A4", "A6", "A8", "RS6", "S5", "R8"],
    camionetas: ["Q2", "Q3", "Q4 e-tron", "Q5", "Q7", "RS Q3"],
  },
  chrysler: {
    autos: ["300C", "Sebring"],
    camionetas: ["Pacifica", "Pacifica Hybrid"],
  },
  subaru: {
    autos: ["Impreza", "Impreza WRX", "WRX", "Legacy", "BRZ"],
    camionetas: ["Forester", "Outback", "Crosstrek", "Solterra"],
  },
  chery: {
    autos: ["QQ", "Fulwin", "A3", "A5"],
    camionetas: ["Tiggo", "Tiggo 5", "Tiggo 7", "Tiggo 8", "Tiggo Pro"],
  },
  byd: {
    autos: ["Dolphin", "Seagull", "Qin", "Qin DM-i", "Song", "Song Plus"],
    camionetas: ["Yuan Plus", "Yuan Plus DM-i", "Song Plus DM-i"],
  },
  baic: {
    autos: ["EC5", "Senova", "D50"],
    camionetas: ["BJ40", "X55", "X35"],
  },
  geely: {
    autos: ["Emgrand", "GS", "Geometry A"],
    camionetas: ["Boyue", "Boyue Pro", "Geometry C"],
  },
  jac: {
    autos: ["J3", "J5", "J7"],
    camionetas: ["JS4", "JS6"],
  },
  great_wall: {
    autos: [],
    camionetas: ["Wingle", "Haval H6", "Haval H9"],
  },
  haval: {
    autos: [],
    camionetas: ["H2", "H4", "H6", "H8", "H9"],
  },
  changan: {
    autos: ["Alsvin", "UNI-T", "CX20"],
    camionetas: ["CS75", "CS95", "CX70"],
  },
  porsche: {
    autos: ["911", "911 Turbo", "911 Carrera", "Panamera", "Boxster", "Cayman", "Taycan"],
    camionetas: ["Cayenne", "Cayenne Turbo", "Macan"],
  },
  land_rover: {
    autos: [],
    camionetas: ["Discovery", "Discovery Sport", "Defender", "Freelander"],
  },
  range_rover: {
    autos: [],
    camionetas: ["Range Rover", "Range Rover Sport", "Range Rover Velar", "Range Rover Evoque"],
  },
  volvo: {
    autos: ["S60", "S90", "V60", "V90"],
    camionetas: ["XC40", "XC60", "XC90"],
  },
  skoda: {
    autos: ["Octavia", "Octavia RS", "Rapid", "Superb", "Citigo"],
    camionetas: ["Yeti", "Karoq", "Kodiaq"],
  },
  seat: {
    autos: ["Ibiza", "Ibiza FR", "León", "Mii"],
    camionetas: ["Arona", "Tarraco"],
  },
  cupra: {
    autos: ["Formentor", "León", "Born"],
    camionetas: ["Formentor SUV", "Terramar"],
  },
  mg: {
    autos: ["MG3", "MG5", "MG6"],
    camionetas: ["MG ZS", "MG RX5"],
  },
  alfa_romeo: {
    autos: ["Giulia", "Giulia Quadrifoglio", "Mito"],
    camionetas: ["Stelvio"],
  },
  dodge: {
    autos: ["Charger", "Challenger", "Dart"],
    camionetas: ["RAM 1500", "Durango", "Journey"],
  },
  mazda: {
    autos: ["Mazda2", "Mazda3", "Mazda6", "MX-5"],
    camionetas: ["CX-3", "CX-5", "CX-9", "BT-50"],
  },
};

/**
 * Returns model list for the given brand slug and vehicle tipo.
 * Returns empty array if no data available.
 */
export function getModelosPorMarca(brandSlug: string, tipo: "auto" | "camioneta"): string[] {
  const entry = MODELOS_POR_MARCA[brandSlug];
  if (!entry) return [];
  return tipo === "camioneta" ? entry.camionetas : entry.autos;
}
