// Precios de referencia vehicular CCA Argentina — Febrero 2026
// Fuente: https://www.cca.org.ar/descargas/precios/Autos.pdf
// Valores en USD

import { vehicleVersions } from "./vehicle-versions";

export const CAR_BRANDS: { value: string; label: string }[] = [
  { value: "agrale", label: "Agrale" },
  { value: "alfa_romeo", label: "Alfa Romeo" },
  { value: "audi", label: "Audi" },
  { value: "baic", label: "BAIC" },
  { value: "bmw", label: "BMW" },
  { value: "byd", label: "BYD" },
  { value: "changan", label: "Changan" },
  { value: "chery", label: "Chery" },
  { value: "chevrolet", label: "Chevrolet" },
  { value: "citroen", label: "Citroën" },
  { value: "cupra", label: "Cupra" },
  { value: "dodge", label: "Dodge" },
  { value: "fiat", label: "Fiat" },
  { value: "ford", label: "Ford" },
  { value: "geely", label: "Geely" },
  { value: "great_wall", label: "Great Wall" },
  { value: "haval", label: "Haval" },
  { value: "honda", label: "Honda" },
  { value: "hyundai", label: "Hyundai" },
  { value: "jac", label: "JAC" },
  { value: "jeep", label: "Jeep" },
  { value: "kia", label: "Kia" },
  { value: "mercedes_benz", label: "Mercedes Benz" },
  { value: "mg", label: "MG" },
  { value: "nissan", label: "Nissan" },
  { value: "peugeot", label: "Peugeot" },
  { value: "renault", label: "Renault" },
  { value: "seat", label: "SEAT" },
  { value: "skoda", label: "Skoda" },
  { value: "suzuki", label: "Suzuki" },
  { value: "toyota", label: "Toyota" },
  { value: "volkswagen", label: "Volkswagen" },
  { value: "volvo", label: "Volvo" },
];

export const CAR_MODELS: Record<string, string[]> = {
  agrale: ["AM 100", "AM 200"],
  alfa_romeo: ["147", "156", "159", "Giulia", "Giulietta", "MiTo", "Stelvio", "Tonale"],
  audi: ["A1", "A3", "A4", "A5", "A6", "A7", "A8", "Q2", "Q3", "Q5", "Q7", "Q8", "TT", "e-tron"],
  baic: ["BJ40", "X35", "X55"],
  bmw: [
    "Serie 1", "Serie 2", "Serie 2 Gran Coupe", "Serie 3", "Serie 4", "Serie 5", "Serie 7",
    "X1", "X2", "X3", "X4", "X5", "X6", "X7", "M3", "M5", "iX",
  ],
  byd: ["Atto 3", "Dolphin", "Dolphin Mini", "Han", "Seal", "Song Plus", "Song Pro", "Yuan Plus", "Yuan Pro"],
  changan: ["CS35", "CS55", "CS75", "Uni-K", "Uni-T", "Uni-V"],
  chery: [
    "Arrizo 5", "Arrizo 6", "QQ", "Tiggo 2", "Tiggo 3", "Tiggo 4", "Tiggo 4 Pro",
    "Tiggo 5", "Tiggo 5x", "Tiggo 7", "Tiggo 7 Pro", "Tiggo 8", "Tiggo 8 Pro",
  ],
  chevrolet: [
    // Clásicos nacionales
    "C-10", "C-14", "Camioneta 1500", "Corvair", "D-10", "D-14", "D-20", "Kadett",
    "Mariva", "Monza", "Opala",
    // Modernos
    "Agile", "Astra", "Blazer", "Camaro", "Captiva", "Celta", "Cobalt", "Colorado",
    "Cruze", "Equinox", "Joy", "Montana", "Onix", "Onix Plus", "S10", "Spin",
    "Tracker", "Trax", "Vectra", "Zafira",
  ],
  citroen: [
    // Clásicos
    "2CV", "Ami", "Berlina", "GS", "Mehari",
    // Modernos
    "Berlingo", "C3", "C3 Aircross", "C4", "C4 Cactus", "C5 Aircross", "Jumper", "Spacetourer",
  ],
  dodge: [
    // Clásicos nacionales
    "1500", "Polara", "GTX",
    // Modernos
    "Journey", "RAM 700", "RAM 1500", "RAM 2500",
  ],
  fiat: [
    // Clásicos nacionales
    "128", "147", "600", "Duna", "Premio", "Regata", "Tempra", "Tipo",
    // Modernos
    "Argo", "Cronos", "Doblo", "Ducato", "Fastback", "Fiorino", "Mobi",
    "Palio", "Pulse", "Siena", "Strada", "Toro", "Uno",
  ],
  ford: [
    // Clásicos nacionales
    "Escort", "F-100", "Fairlane", "Falcon", "Falcon Rural", "Falcon Futura",
    "Galaxy", "Sierra", "Taunus",
    // Modernos
    "Bronco", "Bronco Sport", "EcoSport", "Edge", "Escape", "Explorer",
    "F-150", "Fiesta", "Focus", "Fusion", "Ka", "Ka+", "Kuga",
    "Maverick", "Mondeo", "Mustang", "Ranger", "Territory",
  ],
  geely: ["Azkarra", "Coolray", "Emgrand", "GC2", "GX3 Pro", "Monjaro", "Tugella"],
  great_wall: ["Wingle 5", "Wingle 7"],
  haval: ["F5", "F7", "H1", "H2", "H4", "H6", "H9", "Jolion"],
  honda: [
    // Autos
    "Accord", "CR-V", "City", "Civic", "Fit", "HR-V", "Jazz", "Odyssey", "Pilot", "WR-V",
    // Motos
    "CB 190R", "CB 300R", "CB 500F", "CBR 500R", "CG 150", "CG 160", "NXR 160 Bros",
    "PCX 150", "Twister 250", "Wave 110", "XRE 190", "XRE 300", "Africa Twin",
  ],
  hyundai: [
    "Accent", "Creta", "Elantra", "HB20", "i10", "i30", "Ioniq", "Ioniq 5", "Ioniq 6",
    "ix35", "Kona", "Kona Eléctrico", "Santa Fe", "Sonata", "Staria", "Tucson", "Venue",
  ],
  jeep: [
    // Clásicos
    "CJ-5", "CJ-7", "Gladiator (clásico)", "Wagoneer",
    // Modernos
    "Cherokee", "Commander", "Compass", "Grand Cherokee", "Gladiator", "Renegade", "Wrangler",
  ],
  kia: [
    "Carnival", "Cerato", "EV6", "Morning", "Picanto", "Rio", "Seltos",
    "Sorento", "Soul", "Sportage", "Stinger", "Telluride",
  ],
  mercedes_benz: [
    "Clase A", "Clase B", "Clase C", "Clase E", "Clase S",
    "GLA", "GLB", "GLC", "GLE", "GLS", "AMG GT", "Sprinter", "Vito",
  ],
  nissan: [
    "Frontier", "Kicks", "Leaf", "March", "Murano", "Navara",
    "Pathfinder", "Qashqai", "Sentra", "Tiida", "Versa", "X-Trail",
  ],
  peugeot: [
    // Clásicos
    "104", "204", "304", "404", "504", "505", "604",
    "205", "306", "309", "405", "406", "605",
    // Modernos
    "2008", "208", "3008", "301", "308", "408", "5008", "508", "Landtrek", "Partner",
  ],
  renault: [
    // Clásicos nacionales
    "12", "18", "19", "21", "4", "6", "9", "Fuego", "Gordini", "Torino",
    // Modernos
    "Alaskan", "Captur", "Clio", "Duster", "Kangoo", "Koleos",
    "Logan", "Megane", "Oroch", "Sandero", "Stepway", "Symbol",
  ],
  suzuki: ["Baleno", "Grand Vitara", "Ignis", "Jimny", "S-Cross", "Swift", "Vitara"],
  toyota: [
    "Camry", "Corolla", "Corolla Cross", "Etios", "Fortuner", "GR86",
    "Highlander", "Hilux", "Land Cruiser", "Prado", "RAV4", "Supra", "SW4", "Yaris",
  ],
  volkswagen: [
    // Clásicos nacionales
    "1500", "1600", "Bora", "Escarabajo", "Fox", "Gacel", "Suran",
    // Modernos
    "Amarok", "Atlas", "Gol", "Golf", "Nivus", "Polo", "Saveiro",
    "T-Cross", "Taos", "Tiguan", "Up!", "Vento", "Virtus",
  ],
  volvo: ["S60", "S90", "V60", "XC40", "XC60", "XC90"],
  // ── Motos ────────────────────────────────────────────────────────────────
  aprilia: ["RS 125", "RS 660", "Shiver 900", "Tuono 660", "Tuono V4"],
  bajaj: [
    "Boxer 150", "CT 100", "Discover 125", "Dominar 250", "Dominar 400",
    "Pulsar 125", "Pulsar 150", "Pulsar 160 NS", "Pulsar 180", "Pulsar 200 NS",
    "Pulsar 220 F", "Pulsar 250 F", "Pulsar RS 200", "Rouser NS 200",
  ],
  benelli: [
    "502 C", "752 S", "Leoncino 250", "Leoncino 500", "TRK 250", "TRK 502",
    "TRK 502 X", "TRK 702", "TNT 150", "TNT 300", "TNT 600",
  ],
  beta: [
    "BS 110", "BS 150", "BS 200", "BS 250", "RR 125", "RR 200", "RR 250",
    "RR 300", "RR 390", "RR 430", "RR 480", "Xtrainer 300",
  ],
  cf_moto: ["150 NK", "250 NK", "300 NK", "400 NK", "650 NK", "650 MT", "800 MT"],
  corven: [
    "CX 150", "Energy 110", "Energy 125", "Energy 150", "Mirage 150",
    "Terrain 250", "Triax 150", "TXR 250",
  ],
  ducati: [
    "Diavel", "Hypermotard 950", "Monster 797", "Monster 821", "Monster SP",
    "Multistrada V2", "Multistrada V4", "Panigale V4", "Scrambler Icon",
    "Scrambler Nightshift", "SuperSport 950",
  ],
  gilera: ["GX 250", "VC 150", "VC 200", "SMX 200", "Trial 200"],
  guerrero: [
    "GR 110", "GR 150", "GR200 Ronin", "GXT 200", "Trip 110", "Trip 150",
  ],
  harley_davidson: [
    "Fat Bob", "Fat Boy", "Heritage Classic", "Iron 883", "Low Rider",
    "Road Glide", "Softail Standard", "Sportster S", "Street 750",
    "Street Glide", "Touring Road King",
  ],
  husqvarna: [
    "Norden 901", "Svartpilen 200", "Svartpilen 401", "Svartpilen 701",
    "Vitpilen 401", "Vitpilen 701",
  ],
  kawasaki: [
    "KLR 650", "KX 250", "Ninja 250", "Ninja 300", "Ninja 400",
    "Ninja 650", "Ninja ZX-6R", "Ninja ZX-10R", "Versys 650",
    "Versys-X 300", "Z400", "Z650", "Z900",
  ],
  ktm: [
    "200 Duke", "250 Duke", "390 Duke", "690 Duke", "890 Duke",
    "390 Adventure", "890 Adventure", "1290 Super Adventure",
    "RC 390", "1290 Super Duke R",
  ],
  motomel: [
    "Blitz 110", "CG 150 S2", "Sirius 150 S2", "Sirius 250", "Skua 150",
    "Skua 250", "Strato Euro 150", "Swing 110",
  ],
  royal_enfield: [
    "Classic 350", "Continental GT 650", "Himalayan 450", "Hunter 350",
    "Interceptor 650", "Meteor 350", "Scram 411",
  ],
  triumph: [
    "Bonneville T100", "Bonneville T120", "Speed Triple 1200",
    "Street Scrambler", "Street Triple", "Tiger 900", "Tiger 1200",
    "Trident 660",
  ],
  tvs: ["Apache RR 310", "Apache RTR 160", "Apache RTR 200", "Ntorq 125"],
  yamaha: [
    "Crypton 110", "Fazer FZ 150i", "FZ 16", "FZ 25", "FZS 250",
    "MT-03", "MT-07", "MT-09", "R3", "R15", "R1",
    "Tenere 700", "XTZ 125", "XTZ 150", "XTZ 250", "YBR 125",
    "YZF-R6", "NMAX 155",
  ],
  zanella: [
    "Due 150", "Due 200", "GTS 150", "Patagonian Eagle 150",
    "Patagonian Eagle 250", "RX 150 G3", "ZB 110", "ZB 150",
    "ZT 250", "ZTT 200",
  ],
};

// Precios de referencia por marca y año (USD)
export const PRICE_REF: Record<
  string,
  Record<number, { min: number; avg: number; max: number }>
> = {
  agrale: {
    2025: { min: 26353, avg: 33661, max: 46327 },
    2024: { min: 24629, avg: 31734, max: 44121 },
    2023: { min: 22776, avg: 29655, max: 42020 },
    2022: { min: 20907, avg: 27704, max: 40019 },
    2021: { min: 38114, avg: 38114, max: 38114 },
    2020: { min: 34649, avg: 34649, max: 34649 },
    2019: { min: 32382, avg: 32382, max: 32382 },
    2018: { min: 29749, avg: 29749, max: 29749 },
    2017: { min: 27307, avg: 27307, max: 27307 },
  },
  alfa_romeo: {
    2025: { min: 18393, avg: 60913, max: 196000 },
    2024: { min: 17027, avg: 59214, max: 217394 },
    2023: { min: 16224, avg: 54980, max: 197631 },
    2022: { min: 14807, avg: 51802, max: 187749 },
    2021: { min: 13855, avg: 58343, max: 173842 },
    2020: { min: 12843, avg: 89203, max: 165564 },
    2019: { min: 12353, avg: 77686, max: 143020 },
  },
  audi: {
    2025: { min: 39055, avg: 69250, max: 159223 },
    2024: { min: 35113, avg: 66522, max: 167605 },
    2023: { min: 31915, avg: 62576, max: 155189 },
    2022: { min: 30197, avg: 59517, max: 147430 },
    2021: { min: 26510, avg: 57683, max: 136509 },
    2020: { min: 25224, avg: 60433, max: 130009 },
    2019: { min: 31328, avg: 67091, max: 122712 },
    2018: { min: 26023, avg: 30451, max: 34879 },
    2017: { min: 23063, avg: 26676, max: 30289 },
  },
  baic: {
    2025: { min: 19904, avg: 39020, max: 66776 },
    2024: { min: 18430, avg: 30581, max: 60098 },
    2023: { min: 17552, avg: 19548, max: 21710 },
    2022: { min: 18388, avg: 19926, max: 21086 },
    2021: { min: 17026, avg: 18619, max: 20030 },
    2020: { min: 15765, avg: 16587, max: 17409 },
    2019: { min: 15153, avg: 15943, max: 16733 },
  },
  bmw: {
    2025: { min: 46583, avg: 95264, max: 218606 },
    2024: { min: 44365, avg: 95086, max: 202413 },
    2023: { min: 42252, avg: 92136, max: 192774 },
    2022: { min: 39104, avg: 63856, max: 122332 },
    2021: { min: 45760, avg: 68955, max: 111526 },
    2020: { min: 47163, avg: 62979, max: 73940 },
    2019: { min: 64606, avg: 64606, max: 64606 },
    2018: { min: 60734, avg: 60734, max: 60734 },
  },
  byd: {
    2025: { min: 22990, avg: 29990, max: 36990 },
    2024: { min: 24140, avg: 31490, max: 38840 },
  },
  changan: {
    2025: { min: 29793, avg: 32370, max: 34947 },
    2024: { min: 28303, avg: 30751, max: 33200 },
    2023: { min: 27479, avg: 29856, max: 32233 },
  },
  chery: {
    2025: { min: 14968, avg: 24490, max: 38528 },
    2024: { min: 14220, avg: 23671, max: 37202 },
    2023: { min: 13415, avg: 20230, max: 32989 },
    2022: { min: 12185, avg: 17879, max: 23227 },
    2021: { min: 10497, avg: 15971, max: 20399 },
    2020: { min: 14976, avg: 16376, max: 17777 },
    2019: { min: 13258, avg: 14498, max: 15738 },
    2018: { min: 12094, avg: 12094, max: 12094 },
  },
  chevrolet: {
    2025: { min: 15257, avg: 31667, max: 125703 },
    2024: { min: 14250, avg: 30030, max: 119418 },
    2023: { min: 13743, avg: 29133, max: 113447 },
    2022: { min: 12918, avg: 28506, max: 107775 },
    2021: { min: 14000, avg: 30105, max: 99791 },
    2020: { min: 12500, avg: 33762, max: 92399 },
    2019: { min: 84777, avg: 84777, max: 84777 },
  },
  citroen: {
    2025: { min: 15000, avg: 31000, max: 48000 },
    2024: { min: 13500, avg: 29328, max: 45500 },
    2023: { min: 12000, avg: 27228, max: 42200 },
    2022: { min: 11000, avg: 24350, max: 39000 },
    2021: { min: 10000, avg: 14300, max: 17400 },
    2020: { min: 14200, avg: 14200, max: 14200 },
  },
  dodge: {
    2025: { min: 18500, avg: 41500, max: 85000 },
    2024: { min: 17200, avg: 38233, max: 78000 },
    2023: { min: 15900, avg: 35333, max: 72000 },
    2022: { min: 14800, avg: 32200, max: 65000 },
    2021: { min: 13500, avg: 29233, max: 59000 },
    2020: { min: 54000, avg: 54000, max: 54000 },
  },
  fiat: {
    2025: { min: 9800, avg: 13870, max: 22000 },
    2024: { min: 9300, avg: 13150, max: 20900 },
    2023: { min: 8800, avg: 12470, max: 19800 },
    2022: { min: 8300, avg: 11830, max: 18800 },
    2021: { min: 7900, avg: 11220, max: 17900 },
  },
  ford: {
    2025: { min: 11500, avg: 40112, max: 75000 },
    2024: { min: 10900, avg: 37925, max: 71000 },
    2023: { min: 10300, avg: 33178, max: 67000 },
    2022: { min: 9800, avg: 30053, max: 63000 },
    2021: { min: 9300, avg: 22525, max: 50000 },
  },
  geely: {
    2025: { min: 28000, avg: 36500, max: 45000 },
    2024: { min: 26500, avg: 34550, max: 42600 },
    2023: { min: 25000, avg: 32650, max: 40300 },
    2022: { min: 23600, avg: 23600, max: 23600 },
  },
  great_wall: {
    2025: { min: 28000, avg: 30000, max: 32000 },
    2024: { min: 26500, avg: 28350, max: 30200 },
    2023: { min: 25000, avg: 26750, max: 28500 },
  },
  haval: {
    2025: { min: 27000, avg: 29500, max: 32000 },
    2024: { min: 25500, avg: 27850, max: 30200 },
    2023: { min: 24100, avg: 26300, max: 28500 },
    2022: { min: 22700, avg: 22700, max: 22700 },
  },
  honda: {
    2025: { min: 14500, avg: 27375, max: 42000 },
    2024: { min: 13700, avg: 25875, max: 39700 },
    2023: { min: 12900, avg: 24412, max: 37500 },
    2022: { min: 12200, avg: 22942, max: 35400 },
    2021: { min: 11500, avg: 21628, max: 33400 },
  },
  hyundai: {
    2025: { min: 20500, avg: 39409, max: 75000 },
    2024: { min: 19300, avg: 37272, max: 71000 },
    2023: { min: 18200, avg: 35172, max: 67000 },
    2022: { min: 17100, avg: 28875, max: 46000 },
    2021: { min: 16100, avg: 26550, max: 43300 },
  },
  jeep: {
    2025: { min: 29000, avg: 55055, max: 95000 },
    2024: { min: 27400, avg: 52088, max: 89800 },
    2023: { min: 25900, avg: 49177, max: 84700 },
    2022: { min: 24400, avg: 46411, max: 79900 },
    2021: { min: 23000, avg: 25850, max: 28700 },
  },
  kia: {
    2025: { min: 12000, avg: 33850, max: 75000 },
    2024: { min: 11300, avg: 32010, max: 71000 },
    2023: { min: 10700, avg: 30210, max: 67000 },
    2022: { min: 10100, avg: 21962, max: 42200 },
    2021: { min: 9500, avg: 21600, max: 39800 },
  },
  mercedes_benz: {
    2025: { min: 43000, avg: 72350, max: 120000 },
    2024: { min: 40700, avg: 68500, max: 113600 },
    2023: { min: 38400, avg: 64670, max: 107200 },
    2022: { min: 36200, avg: 64733, max: 101200 },
  },
  nissan: {
    2025: { min: 12500, avg: 35454, max: 65000 },
    2024: { min: 11800, avg: 33490, max: 61500 },
    2023: { min: 11100, avg: 31600, max: 58000 },
    2022: { min: 10500, avg: 29836, max: 54800 },
    2021: { min: 9900, avg: 22400, max: 51700 },
  },
  peugeot: {
    2025: { min: 16000, avg: 34800, max: 55000 },
    2024: { min: 15100, avg: 32900, max: 52000 },
    2023: { min: 14300, avg: 31110, max: 49100 },
    2022: { min: 13500, avg: 23083, max: 38000 },
    2021: { min: 12700, avg: 17300, max: 21500 },
  },
  renault: {
    2025: { min: 14000, avg: 27235, max: 65000 },
    2024: { min: 13200, avg: 25741, max: 61500 },
    2023: { min: 12500, avg: 24323, max: 58000 },
    2022: { min: 11800, avg: 21392, max: 54800 },
    2021: { min: 11100, avg: 14566, max: 19800 },
  },
  suzuki: {
    2025: { min: 15000, avg: 21800, max: 28000 },
    2024: { min: 14200, avg: 20620, max: 26500 },
    2023: { min: 13400, avg: 19460, max: 25000 },
    2022: { min: 12700, avg: 17725, max: 23600 },
    2021: { min: 12000, avg: 12000, max: 12000 },
  },
  toyota: {
    2025: { min: 13000, avg: 49966, max: 95000 },
    2024: { min: 12200, avg: 47253, max: 89800 },
    2023: { min: 11500, avg: 33981, max: 66900 },
    2022: { min: 10900, avg: 31240, max: 63200 },
    2021: { min: 10300, avg: 24860, max: 59600 },
  },
  volkswagen: {
    2025: { min: 10000, avg: 34900, max: 95000 },
    2024: { min: 9400, avg: 32995, max: 89800 },
    2023: { min: 8900, avg: 28336, max: 67000 },
    2022: { min: 8400, avg: 24206, max: 63000 },
    2021: { min: 7900, avg: 18420, max: 46100 },
    2020: { min: 7500, avg: 7850, max: 8200 },
    2019: { min: 7100, avg: 7400, max: 7700 },
  },
  volvo: {
    2025: { min: 52000, avg: 76400, max: 100000 },
    2024: { min: 49200, avg: 72260, max: 94600 },
    2023: { min: 46500, avg: 68200, max: 89300 },
    2022: { min: 43900, avg: 43900, max: 43900 },
  },
};

// Precios de referencia por modelo y año (USD)
export const MODEL_PRICE_REF: Record<
  string,
  Record<string, Record<number, { min: number; avg: number; max: number }>>
> = {
  agrale: {
    am_100: {
      2025: { min: 26353, avg: 27329, max: 28305 },
      2024: { min: 24629, avg: 25541, max: 26453 },
      2023: { min: 22776, avg: 23473, max: 24171 },
      2022: { min: 20907, avg: 21547, max: 22187 },
    },
    am_200: {
      2025: { min: 46327, avg: 46327, max: 46327 },
      2024: { min: 44121, avg: 44121, max: 44121 },
      2023: { min: 42020, avg: 42020, max: 42020 },
      2022: { min: 40019, avg: 40019, max: 40019 },
      2021: { min: 38114, avg: 38114, max: 38114 },
      2020: { min: 34649, avg: 34649, max: 34649 },
      2019: { min: 32382, avg: 32382, max: 32382 },
      2018: { min: 29749, avg: 29749, max: 29749 },
      2017: { min: 27307, avg: 27307, max: 27307 },
    },
  },
  alfa_romeo: {
    giulia: {
      2025: { min: 44922, avg: 73194, max: 119610 },
      2024: { min: 42783, avg: 69614, max: 113630 },
      2023: { min: 40644, avg: 65222, max: 105213 },
      2022: { min: 38611, avg: 42965, max: 47319 },
    },
    giulietta: {
      2025: { min: 24904, avg: 28226, max: 31261 },
      2024: { min: 24055, avg: 27151, max: 30196 },
      2023: { min: 22182, avg: 25242, max: 27845 },
      2022: { min: 21468, avg: 24504, max: 26948 },
      2021: { min: 20253, avg: 22838, max: 25423 },
    },
    mito: {
      2025: { min: 18393, avg: 21471, max: 24549 },
      2024: { min: 17027, avg: 20547, max: 24068 },
      2023: { min: 16224, avg: 18228, max: 20232 },
      2022: { min: 14807, avg: 14807, max: 14807 },
      2021: { min: 13855, avg: 13855, max: 13855 },
      2020: { min: 12843, avg: 12843, max: 12843 },
      2019: { min: 12353, avg: 12353, max: 12353 },
    },
    stelvio: {
      2025: { min: 52884, avg: 107985, max: 196000 },
      2024: { min: 45684, avg: 109309, max: 217394 },
      2023: { min: 44226, avg: 101776, max: 197631 },
      2022: { min: 42800, avg: 97325, max: 187749 },
      2021: { min: 173842, avg: 173842, max: 173842 },
      2020: { min: 165564, avg: 165564, max: 165564 },
      2019: { min: 143020, avg: 143020, max: 143020 },
    },
    tonale: {
      2025: { min: 59800, avg: 59800, max: 59800 },
      2024: { min: 51248, avg: 51248, max: 51248 },
      2023: { min: 46589, avg: 46589, max: 46589 },
    },
  },
  audi: {
    a1: {
      2025: { min: 40076, avg: 43626, max: 47176 },
      2024: { min: 44817, avg: 45567, max: 46317 },
      2023: { min: 41497, avg: 42191, max: 42886 },
      2022: { min: 39521, avg: 40131, max: 40742 },
      2021: { min: 36955, avg: 37339, max: 37724 },
      2020: { min: 35928, avg: 35928, max: 35928 },
      2019: { min: 33595, avg: 33595, max: 33595 },
    },
    a3: {
      2025: { min: 53709, avg: 55306, max: 56903 },
      2024: { min: 51151, avg: 52604, max: 54058 },
      2023: { min: 48593, avg: 48593, max: 48593 },
      2022: { min: 46279, avg: 46279, max: 46279 },
      2021: { min: 42851, avg: 42851, max: 42851 },
      2020: { min: 40446, avg: 40446, max: 40446 },
    },
    a4: {
      2025: { min: 52280, avg: 62789, max: 71077 },
      2024: { min: 49791, avg: 59800, max: 67693 },
      2023: { min: 46102, avg: 55826, max: 64048 },
      2022: { min: 43907, avg: 49253, max: 54599 },
      2021: { min: 41816, avg: 46908, max: 52000 },
    },
    a5: {
      2025: { min: 39055, avg: 52827, max: 66600 },
      2024: { min: 35113, avg: 48390, max: 61667 },
      2023: { min: 31915, avg: 45060, max: 58206 },
      2022: { min: 30634, avg: 30634, max: 30634 },
      2021: { min: 26510, avg: 26510, max: 26510 },
      2020: { min: 25224, avg: 25224, max: 25224 },
    },
    a6: {
      2025: { min: 68586, avg: 68586, max: 68586 },
      2024: { min: 61705, avg: 61705, max: 61705 },
      2023: { min: 51806, avg: 51806, max: 51806 },
      2022: { min: 45376, avg: 45376, max: 45376 },
      2021: { min: 39075, avg: 39075, max: 39075 },
      2020: { min: 35234, avg: 35234, max: 35234 },
      2019: { min: 31328, avg: 31328, max: 31328 },
      2018: { min: 26023, avg: 26023, max: 26023 },
      2017: { min: 23063, avg: 23063, max: 23063 },
    },
    a7: {
      2025: { min: 66970, avg: 66970, max: 66970 },
      2024: { min: 60252, avg: 60252, max: 60252 },
      2023: { min: 53396, avg: 53396, max: 53396 },
      2022: { min: 45919, avg: 45919, max: 45919 },
      2021: { min: 42382, avg: 42382, max: 42382 },
      2020: { min: 40944, avg: 40944, max: 40944 },
      2019: { min: 39041, avg: 39041, max: 39041 },
      2018: { min: 34879, avg: 34879, max: 34879 },
      2017: { min: 30289, avg: 30289, max: 30289 },
    },
    q3: {
      2025: { min: 41877, avg: 44779, max: 47682 },
      2024: { min: 39883, avg: 42647, max: 45412 },
    },
    q5: {
      2025: { min: 65845, avg: 83922, max: 102000 },
      2024: { min: 54158, avg: 78232, max: 102306 },
      2023: { min: 51119, avg: 51119, max: 51119 },
    },
    q7: {
      2025: { min: 39127, avg: 94304, max: 149482 },
      2024: { min: 35929, avg: 92067, max: 148206 },
      2023: { min: 32681, avg: 84954, max: 137228 },
      2022: { min: 30197, avg: 80445, max: 130693 },
      2021: { min: 121012, avg: 121012, max: 121012 },
      2020: { min: 115250, avg: 115250, max: 115250 },
      2019: { min: 108782, avg: 108782, max: 108782 },
    },
    q8: {
      2025: { min: 159223, avg: 159223, max: 159223 },
      2024: { min: 167605, avg: 167605, max: 167605 },
      2023: { min: 155189, avg: 155189, max: 155189 },
      2022: { min: 147430, avg: 147430, max: 147430 },
      2021: { min: 136509, avg: 136509, max: 136509 },
      2020: { min: 130009, avg: 130009, max: 130009 },
      2019: { min: 122712, avg: 122712, max: 122712 },
    },
    tt: {
      2025: { min: 83088, avg: 83088, max: 83088 },
      2024: { min: 75944, avg: 75944, max: 75944 },
      2023: { min: 66650, avg: 66650, max: 66650 },
      2022: { min: 58908, avg: 58908, max: 58908 },
    },
  },
  baic: {
    bj40: {
      2025: { min: 64059, avg: 65417, max: 66776 },
      2024: { min: 60098, avg: 60098, max: 60098 },
    },
    x35: {
      2025: { min: 19904, avg: 20942, max: 21980 },
      2024: { min: 18430, avg: 19391, max: 20352 },
      2023: { min: 17552, avg: 18467, max: 19383 },
      2022: { min: 18388, avg: 19346, max: 20305 },
      2021: { min: 17026, avg: 17913, max: 18801 },
      2020: { min: 15765, avg: 16587, max: 17409 },
      2019: { min: 15153, avg: 15943, max: 16733 },
    },
    x55: {
      2025: { min: 22381, avg: 22381, max: 22381 },
      2024: { min: 23446, avg: 23446, max: 23446 },
      2023: { min: 21710, avg: 21710, max: 21710 },
      2022: { min: 21086, avg: 21086, max: 21086 },
      2021: { min: 20030, avg: 20030, max: 20030 },
    },
  },
  bmw: {
    serie_1: {
      2025: { min: 46583, avg: 51968, max: 57354 },
      2024: { min: 44365, avg: 49425, max: 54486 },
      2023: { min: 42252, avg: 46351, max: 50450 },
      2022: { min: 39104, avg: 43576, max: 48048 },
      2021: { min: 45760, avg: 45760, max: 45760 },
    },
    serie_2_gran_coupe: {
      2025: { min: 50157, avg: 55578, max: 60999 },
      2024: { min: 48032, avg: 53498, max: 58965 },
      2023: { min: 56158, avg: 56158, max: 56158 },
      2022: { min: 51998, avg: 51998, max: 51998 },
      2021: { min: 49522, avg: 49522, max: 49522 },
      2020: { min: 47163, avg: 47163, max: 47163 },
    },
    serie_3: {
      2025: { min: 61900, avg: 72200, max: 82500 },
      2024: { min: 68090, avg: 79420, max: 90750 },
      2023: { min: 65839, avg: 73675, max: 81511 },
      2022: { min: 60962, avg: 68944, max: 76926 },
      2021: { min: 58059, avg: 64643, max: 71228 },
      2020: { min: 67836, avg: 67836, max: 67836 },
      2019: { min: 64606, avg: 64606, max: 64606 },
      2018: { min: 60734, avg: 60734, max: 60734 },
    },
    serie_4: {
      2025: { min: 84500, avg: 87636, max: 90772 },
      2024: { min: 86233, avg: 89591, max: 92950 },
      2023: { min: 88260, avg: 88260, max: 88260 },
      2022: { min: 83847, avg: 83847, max: 83847 },
      2021: { min: 77636, avg: 77636, max: 77636 },
      2020: { min: 73940, avg: 73940, max: 73940 },
    },
    serie_5: {
      2025: { min: 65525, avg: 65525, max: 65525 },
      2024: { min: 62248, avg: 62248, max: 62248 },
      2023: { min: 57414, avg: 57414, max: 57414 },
    },
    serie_7: {
      2025: { min: 215651, avg: 215651, max: 215651 },
      2024: { min: 199677, avg: 199677, max: 199677 },
      2023: { min: 190168, avg: 190168, max: 190168 },
    },
    x1: {
      2025: { min: 62900, avg: 70400, max: 77900 },
      2024: { min: 69190, avg: 77440, max: 85690 },
      2023: { min: 63496, avg: 69397, max: 75298 },
    },
    x3: {
      2025: { min: 66370, avg: 79135, max: 91900 },
      2024: { min: 63210, avg: 82150, max: 101090 },
      2023: { min: 58732, avg: 58732, max: 58732 },
      2022: { min: 49724, avg: 49724, max: 49724 },
    },
    x5: {
      2025: { min: 145661, avg: 162780, max: 179900 },
      2024: { min: 134871, avg: 166380, max: 197890 },
      2023: { min: 128448, avg: 157164, max: 185881 },
      2022: { min: 122332, avg: 122332, max: 122332 },
      2021: { min: 111526, avg: 111526, max: 111526 },
    },
    x6: {
      2025: { min: 55578, avg: 55578, max: 55578 },
      2024: { min: 51406, avg: 51406, max: 51406 },
      2023: { min: 45369, avg: 45369, max: 45369 },
      2022: { min: 41771, avg: 41771, max: 41771 },
    },
    x7: {
      2025: { min: 218606, avg: 218606, max: 218606 },
      2024: { min: 202413, avg: 202413, max: 202413 },
      2023: { min: 192774, avg: 192774, max: 192774 },
    },
  },
  byd: {
    dolphin_mini: {
      2025: { min: 22990, avg: 23490, max: 23990 },
      2024: { min: 24140, avg: 24665, max: 25190 },
    },
    song_pro: {
      2025: { min: 34990, avg: 35990, max: 36990 },
      2024: { min: 36740, avg: 37790, max: 38840 },
    },
    yuan_pro: {
      2025: { min: 29990, avg: 30490, max: 30990 },
      2024: { min: 31490, avg: 32015, max: 32540 },
    },
  },
  changan: {
    cs55: {
      2025: { min: 29793, avg: 29793, max: 29793 },
      2024: { min: 28303, avg: 28303, max: 28303 },
      2023: { min: 27479, avg: 27479, max: 27479 },
    },
    cs75: {
      2025: { min: 34947, avg: 34947, max: 34947 },
      2024: { min: 33200, avg: 33200, max: 33200 },
      2023: { min: 32233, avg: 32233, max: 32233 },
    },
  },
  chery: {
    arrizo_5: {
      2025: { min: 14968, avg: 16200, max: 17432 },
      2024: { min: 14220, avg: 15390, max: 16561 },
      2023: { min: 13415, avg: 14519, max: 15623 },
      2022: { min: 12185, avg: 13187, max: 14190 },
      2021: { min: 10497, avg: 11361, max: 12225 },
    },
    tiggo_2: {
      2025: { min: 17105, avg: 18123, max: 19142 },
      2024: { min: 16291, avg: 17260, max: 18230 },
      2023: { min: 15476, avg: 16397, max: 17319 },
      2022: { min: 15016, avg: 15910, max: 16804 },
      2021: { min: 14021, avg: 14855, max: 15690 },
    },
    tiggo_3: {
      2025: { min: 20167, avg: 20525, max: 20883 },
      2024: { min: 18673, avg: 19255, max: 19838 },
      2023: { min: 17784, avg: 18236, max: 18688 },
      2022: { min: 16894, avg: 17172, max: 17450 },
      2021: { min: 15448, avg: 15743, max: 16038 },
      2020: { min: 14976, avg: 14976, max: 14976 },
      2019: { min: 13258, avg: 13258, max: 13258 },
      2018: { min: 12094, avg: 12094, max: 12094 },
    },
    tiggo_4: {
      2025: { min: 26880, avg: 29795, max: 32518 },
      2024: { min: 25600, avg: 28376, max: 30969 },
      2023: { min: 20736, avg: 22984, max: 25085 },
      2022: { min: 19200, avg: 21282, max: 23227 },
      2021: { min: 18286, avg: 19342, max: 20399 },
    },
    tiggo_5: {
      2025: { min: 23929, avg: 23931, max: 23933 },
      2024: { min: 22157, avg: 22446, max: 22736 },
      2023: { min: 21102, avg: 21259, max: 21417 },
      2022: { min: 20047, avg: 20146, max: 20245 },
      2021: { min: 18291, avg: 18554, max: 18817 },
      2020: { min: 17777, avg: 17777, max: 17777 },
      2019: { min: 15738, avg: 15738, max: 15738 },
    },
    tiggo_7: {
      2025: { min: 32900, avg: 32900, max: 32900 },
      2024: { min: 37202, avg: 37202, max: 37202 },
    },
    tiggo_8: {
      2025: { min: 38528, avg: 38528, max: 38528 },
      2024: { min: 36694, avg: 36694, max: 36694 },
      2023: { min: 32989, avg: 32989, max: 32989 },
    },
  },
  chevrolet: {
    camaro: {
      2025: { min: 81845, avg: 103774, max: 125703 },
      2024: { min: 77690, avg: 98554, max: 119418 },
      2023: { min: 70856, avg: 92151, max: 113447 },
      2022: { min: 66998, avg: 87386, max: 107775 },
      2021: { min: 63648, avg: 81719, max: 99791 },
      2020: { min: 92399, avg: 92399, max: 92399 },
      2019: { min: 84777, avg: 84777, max: 84777 },
    },
    captiva: {
      2025: { min: 23487, avg: 23487, max: 23487 },
      2024: { min: 21362, avg: 21362, max: 21362 },
    },
    cobalt: {
      2025: { min: 15257, avg: 15895, max: 16533 },
      2024: { min: 14250, avg: 14779, max: 15308 },
      2023: { min: 13743, avg: 14253, max: 14763 },
      2022: { min: 12918, avg: 13397, max: 13877 },
    },
    cruze: {
      2025: { min: 21687, avg: 25062, max: 26916 },
      2024: { min: 20603, avg: 23951, max: 25570 },
      2023: { min: 19756, avg: 22871, max: 24520 },
      2022: { min: 19292, avg: 21725, max: 24158 },
    },
    equinox: {
      2025: { min: 23819, avg: 26231, max: 28644 },
      2024: { min: 22685, avg: 24982, max: 27280 },
      2023: { min: 22029, avg: 24005, max: 25981 },
      2022: { min: 19931, avg: 21212, max: 22494 },
      2021: { min: 18454, avg: 19641, max: 20828 },
    },
    joy: {
      2025: { min: 18054, avg: 18054, max: 18054 },
      2024: { min: 17194, avg: 17194, max: 17194 },
      2023: { min: 16376, avg: 16376, max: 16376 },
      2022: { min: 15596, avg: 15596, max: 15596 },
      2021: { min: 14853, avg: 14853, max: 14853 },
    },
    montana: {
      2025: { min: 23523, avg: 26596, max: 30201 },
      2024: { min: 22403, avg: 25329, max: 28763 },
      2023: { min: 23582, avg: 25453, max: 27325 },
    },
    onix: {
      2025: { min: 23969, avg: 25661, max: 27155 },
      2024: { min: 22828, avg: 24439, max: 25862 },
      2023: { min: 21686, avg: 23217, max: 24569 },
      2022: { min: 20654, avg: 22112, max: 23399 },
      2021: { min: 19670, avg: 21037, max: 22229 },
      2020: { min: 20740, avg: 20955, max: 21171 },
    },
    s10: {
      2025: { min: 20000, avg: 27500, max: 35000 },
      2024: { min: 18500, avg: 25750, max: 33000 },
      2023: { min: 17000, avg: 23500, max: 30000 },
      2022: { min: 15500, avg: 21250, max: 27000 },
      2021: { min: 14000, avg: 19250, max: 24500 },
      2020: { min: 12500, avg: 17250, max: 22000 },
    },
  },
  citroen: {
    berlingo: {
      2025: { min: 15000, avg: 15000, max: 15000 },
      2024: { min: 13500, avg: 13500, max: 13500 },
      2023: { min: 12000, avg: 12000, max: 12000 },
      2022: { min: 11000, avg: 11000, max: 11000 },
      2021: { min: 10000, avg: 10000, max: 10000 },
    },
    c3: {
      2025: { min: 20500, avg: 21750, max: 23000 },
      2024: { min: 19500, avg: 20700, max: 21900 },
      2023: { min: 18200, avg: 19350, max: 20500 },
      2022: { min: 17000, avg: 18050, max: 19100 },
      2021: { min: 15500, avg: 16450, max: 17400 },
      2020: { min: 14200, avg: 14200, max: 14200 },
    },
    c4: {
      2025: { min: 29500, avg: 33750, max: 38000 },
      2024: { min: 28000, avg: 32100, max: 36200 },
      2023: { min: 26500, avg: 30000, max: 33500 },
      2022: { min: 25000, avg: 25000, max: 25000 },
    },
    c5_aircross: {
      2025: { min: 43000, avg: 45500, max: 48000 },
      2024: { min: 40700, avg: 43100, max: 45500 },
      2023: { min: 37700, avg: 39950, max: 42200 },
      2022: { min: 35000, avg: 37000, max: 39000 },
    },
  },
  dodge: {
    journey: {
      2025: { min: 18500, avg: 19750, max: 21000 },
      2024: { min: 17200, avg: 18350, max: 19500 },
      2023: { min: 15900, avg: 17000, max: 18100 },
      2022: { min: 14800, avg: 15800, max: 16800 },
      2021: { min: 13500, avg: 14350, max: 15200 },
    },
    ram_1500: {
      2025: { min: 85000, avg: 85000, max: 85000 },
      2024: { min: 78000, avg: 78000, max: 78000 },
      2023: { min: 72000, avg: 72000, max: 72000 },
      2022: { min: 65000, avg: 65000, max: 65000 },
      2021: { min: 59000, avg: 59000, max: 59000 },
      2020: { min: 54000, avg: 54000, max: 54000 },
    },
  },
  fiat: {
    argo: {
      2025: { min: 12000, avg: 13666, max: 15800 },
      2024: { min: 11400, avg: 12966, max: 15000 },
      2023: { min: 10800, avg: 12300, max: 14200 },
      2022: { min: 10200, avg: 11666, max: 13500 },
      2021: { min: 9700, avg: 11066, max: 12800 },
    },
    cronos: {
      2025: { min: 11500, avg: 13133, max: 15200 },
      2024: { min: 10900, avg: 12433, max: 14400 },
      2023: { min: 10300, avg: 11800, max: 13700 },
      2022: { min: 9800, avg: 11200, max: 13000 },
      2021: { min: 9300, avg: 10600, max: 12300 },
    },
    fiorino: {
      2025: { min: 10500, avg: 10500, max: 10500 },
      2024: { min: 9900, avg: 9900, max: 9900 },
      2023: { min: 9400, avg: 9400, max: 9400 },
      2022: { min: 8900, avg: 8900, max: 8900 },
      2021: { min: 8400, avg: 8400, max: 8400 },
    },
    mobi: {
      2025: { min: 9800, avg: 9800, max: 9800 },
      2024: { min: 9300, avg: 9300, max: 9300 },
      2023: { min: 8800, avg: 8800, max: 8800 },
      2022: { min: 8300, avg: 8300, max: 8300 },
      2021: { min: 7900, avg: 7900, max: 7900 },
    },
    strada: {
      2025: { min: 16000, avg: 19000, max: 22000 },
      2024: { min: 15200, avg: 18050, max: 20900 },
      2023: { min: 14400, avg: 17100, max: 19800 },
      2022: { min: 13700, avg: 16250, max: 18800 },
      2021: { min: 13000, avg: 15450, max: 17900 },
    },
  },
  ford: {
    bronco_sport: {
      2025: { min: 55000, avg: 60000, max: 65000 },
      2024: { min: 52000, avg: 56750, max: 61500 },
    },
    edge: {
      2025: { min: 52000, avg: 52000, max: 52000 },
      2024: { min: 49000, avg: 49000, max: 49000 },
      2023: { min: 45500, avg: 45500, max: 45500 },
      2022: { min: 42000, avg: 42000, max: 42000 },
      2021: { min: 38500, avg: 38500, max: 38500 },
    },
    focus: {
      2025: { min: 18000, avg: 19750, max: 21500 },
      2024: { min: 17000, avg: 18600, max: 20200 },
      2023: { min: 16000, avg: 17500, max: 19000 },
      2022: { min: 15100, avg: 16500, max: 17900 },
      2021: { min: 14200, avg: 15550, max: 16900 },
    },
    fusion: {
      2025: { min: 23000, avg: 26000, max: 29000 },
      2024: { min: 21700, avg: 24550, max: 27400 },
      2023: { min: 20400, avg: 23100, max: 25800 },
      2022: { min: 19200, avg: 21750, max: 24300 },
      2021: { min: 18100, avg: 20500, max: 22900 },
    },
    ka: {
      2025: { min: 11500, avg: 12150, max: 12800 },
      2024: { min: 10900, avg: 11500, max: 12100 },
      2023: { min: 10300, avg: 10900, max: 11500 },
      2022: { min: 9800, avg: 10350, max: 10900 },
      2021: { min: 9300, avg: 9800, max: 10300 },
    },
    kuga: {
      2025: { min: 27000, avg: 31000, max: 35000 },
      2024: { min: 25500, avg: 29250, max: 33000 },
      2023: { min: 24000, avg: 27500, max: 31000 },
      2022: { min: 22500, avg: 25750, max: 29000 },
    },
    maverick: {
      2025: { min: 55000, avg: 55000, max: 55000 },
      2024: { min: 52000, avg: 52000, max: 52000 },
      2023: { min: 49000, avg: 49000, max: 49000 },
    },
    mustang: {
      2025: { min: 64000, avg: 64000, max: 64000 },
      2024: { min: 60500, avg: 60500, max: 60500 },
      2023: { min: 57000, avg: 57000, max: 57000 },
      2022: { min: 53500, avg: 53500, max: 53500 },
      2021: { min: 50000, avg: 50000, max: 50000 },
    },
    ranger: {
      2025: { min: 68000, avg: 71500, max: 75000 },
      2024: { min: 64500, avg: 67750, max: 71000 },
      2023: { min: 61000, avg: 64000, max: 67000 },
      2022: { min: 58000, avg: 60500, max: 63000 },
    },
    territory: {
      2025: { min: 30000, avg: 30000, max: 30000 },
      2024: { min: 28500, avg: 28500, max: 28500 },
      2023: { min: 27000, avg: 27000, max: 27000 },
      2022: { min: 25500, avg: 25500, max: 25500 },
    },
  },
  geely: {
    coolray: {
      2025: { min: 28000, avg: 28000, max: 28000 },
      2024: { min: 26500, avg: 26500, max: 26500 },
      2023: { min: 25000, avg: 25000, max: 25000 },
      2022: { min: 23600, avg: 23600, max: 23600 },
    },
    monjaro: {
      2025: { min: 45000, avg: 45000, max: 45000 },
      2024: { min: 42600, avg: 42600, max: 42600 },
      2023: { min: 40300, avg: 40300, max: 40300 },
    },
  },
  great_wall: {
    wingle_5: {
      2025: { min: 28000, avg: 30000, max: 32000 },
      2024: { min: 26500, avg: 28350, max: 30200 },
      2023: { min: 25000, avg: 26750, max: 28500 },
    },
  },
  haval: {
    h6: {
      2025: { min: 32000, avg: 32000, max: 32000 },
      2024: { min: 30200, avg: 30200, max: 30200 },
      2023: { min: 28500, avg: 28500, max: 28500 },
    },
    jolion: {
      2025: { min: 27000, avg: 27000, max: 27000 },
      2024: { min: 25500, avg: 25500, max: 25500 },
      2023: { min: 24100, avg: 24100, max: 24100 },
      2022: { min: 22700, avg: 22700, max: 22700 },
    },
  },
  honda: {
    cr_v: {
      2025: { min: 38000, avg: 40000, max: 42000 },
      2024: { min: 36000, avg: 37850, max: 39700 },
      2023: { min: 34000, avg: 35750, max: 37500 },
      2022: { min: 32100, avg: 33750, max: 35400 },
      2021: { min: 30300, avg: 31850, max: 33400 },
    },
    city: {
      2025: { min: 18500, avg: 18500, max: 18500 },
      2024: { min: 17500, avg: 17500, max: 17500 },
      2023: { min: 16500, avg: 16500, max: 16500 },
      2022: { min: 15600, avg: 15600, max: 15600 },
      2021: { min: 14700, avg: 14700, max: 14700 },
    },
    civic: {
      2025: { min: 22500, avg: 25750, max: 29000 },
      2024: { min: 21200, avg: 24300, max: 27400 },
      2023: { min: 20000, avg: 22900, max: 25800 },
      2022: { min: 18800, avg: 21550, max: 24300 },
      2021: { min: 17700, avg: 20300, max: 22900 },
    },
    fit: {
      2025: { min: 14500, avg: 14500, max: 14500 },
      2024: { min: 13700, avg: 13700, max: 13700 },
      2023: { min: 12900, avg: 12900, max: 12900 },
      2022: { min: 12200, avg: 12200, max: 12200 },
      2021: { min: 11500, avg: 11500, max: 11500 },
    },
    hr_v: {
      2025: { min: 26500, avg: 26500, max: 26500 },
      2024: { min: 25000, avg: 25000, max: 25000 },
      2023: { min: 23600, avg: 23600, max: 23600 },
      2022: { min: 22200, avg: 22200, max: 22200 },
      2021: { min: 20900, avg: 20900, max: 20900 },
    },
    wr_v: {
      2025: { min: 28000, avg: 28000, max: 28000 },
      2024: { min: 26500, avg: 26500, max: 26500 },
      2023: { min: 25000, avg: 25000, max: 25000 },
    },
  },
  hyundai: {
    creta: {
      2025: { min: 29000, avg: 31500, max: 34000 },
      2024: { min: 27500, avg: 29850, max: 32200 },
      2023: { min: 26000, avg: 28200, max: 30400 },
      2022: { min: 24600, avg: 26650, max: 28700 },
    },
    elantra: {
      2025: { min: 20500, avg: 26250, max: 32000 },
      2024: { min: 19300, avg: 24750, max: 30200 },
      2023: { min: 18200, avg: 23350, max: 28500 },
      2022: { min: 17100, avg: 17100, max: 17100 },
      2021: { min: 16100, avg: 16100, max: 16100 },
    },
    ioniq_6: {
      2025: { min: 75000, avg: 75000, max: 75000 },
      2024: { min: 71000, avg: 71000, max: 71000 },
      2023: { min: 67000, avg: 67000, max: 67000 },
    },
    kona: {
      2025: { min: 24000, avg: 28000, max: 32000 },
      2024: { min: 22700, avg: 26450, max: 30200 },
      2023: { min: 21400, avg: 24950, max: 28500 },
      2022: { min: 20200, avg: 23550, max: 26900 },
      2021: { min: 19000, avg: 19000, max: 19000 },
    },
    kona_electrico: {
      2025: { min: 52000, avg: 52000, max: 52000 },
      2024: { min: 49200, avg: 49200, max: 49200 },
      2023: { min: 46500, avg: 46500, max: 46500 },
    },
    santa_fe: {
      2025: { min: 55000, avg: 55000, max: 55000 },
      2024: { min: 52000, avg: 52000, max: 52000 },
      2023: { min: 49000, avg: 49000, max: 49000 },
      2022: { min: 46000, avg: 46000, max: 46000 },
      2021: { min: 43300, avg: 43300, max: 43300 },
    },
    tucson: {
      2025: { min: 35000, avg: 40000, max: 45000 },
      2024: { min: 33100, avg: 37850, max: 42600 },
      2023: { min: 31200, avg: 35700, max: 40200 },
      2022: { min: 29500, avg: 33750, max: 38000 },
      2021: { min: 27800, avg: 27800, max: 27800 },
    },
  },
  jeep: {
    commander: {
      2025: { min: 45000, avg: 48500, max: 52000 },
      2024: { min: 42700, avg: 45950, max: 49200 },
      2023: { min: 40400, avg: 43450, max: 46500 },
      2022: { min: 38200, avg: 41050, max: 43900 },
    },
    compass: {
      2025: { min: 36000, avg: 41000, max: 46000 },
      2024: { min: 34100, avg: 38800, max: 43500 },
      2023: { min: 32200, avg: 36650, max: 41100 },
      2022: { min: 30400, avg: 34600, max: 38800 },
      2021: { min: 28700, avg: 28700, max: 28700 },
    },
    grand_cherokee: {
      2025: { min: 72000, avg: 72000, max: 72000 },
      2024: { min: 68100, avg: 68100, max: 68100 },
      2023: { min: 64300, avg: 64300, max: 64300 },
      2022: { min: 60700, avg: 60700, max: 60700 },
    },
    renegade: {
      2025: { min: 29000, avg: 32250, max: 35500 },
      2024: { min: 27400, avg: 30500, max: 33600 },
      2023: { min: 25900, avg: 28800, max: 31700 },
      2022: { min: 24400, avg: 27150, max: 29900 },
      2021: { min: 23000, avg: 23000, max: 23000 },
    },
    wrangler: {
      2025: { min: 85000, avg: 90000, max: 95000 },
      2024: { min: 80400, avg: 85100, max: 89800 },
      2023: { min: 75800, avg: 80250, max: 84700 },
      2022: { min: 71500, avg: 75700, max: 79900 },
    },
  },
  kia: {
    cerato: {
      2025: { min: 22000, avg: 25000, max: 28000 },
      2024: { min: 20800, avg: 23650, max: 26500 },
      2023: { min: 19600, avg: 22300, max: 25000 },
      2022: { min: 18500, avg: 21050, max: 23600 },
      2021: { min: 17400, avg: 17400, max: 17400 },
    },
    ev6: {
      2025: { min: 75000, avg: 75000, max: 75000 },
      2024: { min: 71000, avg: 71000, max: 71000 },
      2023: { min: 67000, avg: 67000, max: 67000 },
    },
    morning: {
      2025: { min: 14000, avg: 14000, max: 14000 },
      2024: { min: 13200, avg: 13200, max: 13200 },
      2023: { min: 12500, avg: 12500, max: 12500 },
      2022: { min: 11800, avg: 11800, max: 11800 },
      2021: { min: 11100, avg: 11100, max: 11100 },
    },
    picanto: {
      2025: { min: 12000, avg: 12000, max: 12000 },
      2024: { min: 11300, avg: 11300, max: 11300 },
      2023: { min: 10700, avg: 10700, max: 10700 },
      2022: { min: 10100, avg: 10100, max: 10100 },
      2021: { min: 9500, avg: 9500, max: 9500 },
    },
    rio: {
      2025: { min: 14500, avg: 14500, max: 14500 },
      2024: { min: 13700, avg: 13700, max: 13700 },
      2023: { min: 12900, avg: 12900, max: 12900 },
      2022: { min: 12200, avg: 12200, max: 12200 },
    },
    seltos: {
      2025: { min: 30000, avg: 30000, max: 30000 },
      2024: { min: 28400, avg: 28400, max: 28400 },
      2023: { min: 26800, avg: 26800, max: 26800 },
      2022: { min: 25300, avg: 25300, max: 25300 },
    },
    sorento: {
      2025: { min: 50000, avg: 50000, max: 50000 },
      2024: { min: 47300, avg: 47300, max: 47300 },
      2023: { min: 44700, avg: 44700, max: 44700 },
      2022: { min: 42200, avg: 42200, max: 42200 },
      2021: { min: 39800, avg: 39800, max: 39800 },
    },
    sportage: {
      2025: { min: 38000, avg: 38000, max: 38000 },
      2024: { min: 35900, avg: 35900, max: 35900 },
      2023: { min: 33900, avg: 33900, max: 33900 },
      2022: { min: 32000, avg: 32000, max: 32000 },
      2021: { min: 30200, avg: 30200, max: 30200 },
    },
    stinger: {
      2025: { min: 55000, avg: 55000, max: 55000 },
      2024: { min: 52000, avg: 52000, max: 52000 },
      2023: { min: 49000, avg: 49000, max: 49000 },
    },
  },
  mercedes_benz: {
    clase_a: {
      2025: { min: 43000, avg: 43250, max: 43500 },
      2024: { min: 40700, avg: 40950, max: 41200 },
      2023: { min: 38400, avg: 38650, max: 38900 },
      2022: { min: 36200, avg: 36450, max: 36700 },
    },
    clase_c: {
      2025: { min: 72000, avg: 81000, max: 90000 },
      2024: { min: 68200, avg: 76700, max: 85200 },
      2023: { min: 64400, avg: 72400, max: 80400 },
      2022: { min: 60800, avg: 68350, max: 75900 },
    },
    clase_e: {
      2025: { min: 92000, avg: 92000, max: 92000 },
      2024: { min: 87000, avg: 87000, max: 87000 },
      2023: { min: 82200, avg: 82200, max: 82200 },
      2022: { min: 77600, avg: 77600, max: 77600 },
    },
    gla: {
      2025: { min: 52000, avg: 60000, max: 68000 },
      2024: { min: 49200, avg: 56800, max: 64400 },
      2023: { min: 46500, avg: 53650, max: 60800 },
    },
    glb: {
      2025: { min: 55000, avg: 55000, max: 55000 },
      2024: { min: 52100, avg: 52100, max: 52100 },
      2023: { min: 49200, avg: 49200, max: 49200 },
    },
    glc: {
      2025: { min: 88000, avg: 88000, max: 88000 },
      2024: { min: 83400, avg: 83400, max: 83400 },
      2023: { min: 78700, avg: 78700, max: 78700 },
    },
    gle: {
      2025: { min: 120000, avg: 120000, max: 120000 },
      2024: { min: 113600, avg: 113600, max: 113600 },
      2023: { min: 107200, avg: 107200, max: 107200 },
      2022: { min: 101200, avg: 101200, max: 101200 },
    },
  },
  nissan: {
    frontier: {
      2025: { min: 55000, avg: 60000, max: 65000 },
      2024: { min: 52000, avg: 56750, max: 61500 },
      2023: { min: 49000, avg: 53500, max: 58000 },
      2022: { min: 46300, avg: 50550, max: 54800 },
      2021: { min: 51700, avg: 51700, max: 51700 },
    },
    kicks: {
      2025: { min: 27500, avg: 29750, max: 32000 },
      2024: { min: 26000, avg: 28100, max: 30200 },
      2023: { min: 24600, avg: 26550, max: 28500 },
      2022: { min: 23200, avg: 25050, max: 26900 },
      2021: { min: 21900, avg: 21900, max: 21900 },
    },
    leaf: {
      2025: { min: 35000, avg: 35000, max: 35000 },
      2024: { min: 33000, avg: 33000, max: 33000 },
      2023: { min: 31100, avg: 31100, max: 31100 },
      2022: { min: 29300, avg: 29300, max: 29300 },
    },
    march: {
      2025: { min: 12500, avg: 12500, max: 12500 },
      2024: { min: 11800, avg: 11800, max: 11800 },
      2023: { min: 11100, avg: 11100, max: 11100 },
      2022: { min: 10500, avg: 10500, max: 10500 },
      2021: { min: 9900, avg: 9900, max: 9900 },
    },
    murano: {
      2025: { min: 55000, avg: 55000, max: 55000 },
      2024: { min: 52000, avg: 52000, max: 52000 },
      2023: { min: 49100, avg: 49100, max: 49100 },
      2022: { min: 46400, avg: 46400, max: 46400 },
    },
    sentra: {
      2025: { min: 23000, avg: 23000, max: 23000 },
      2024: { min: 21700, avg: 21700, max: 21700 },
      2023: { min: 20500, avg: 20500, max: 20500 },
      2022: { min: 19300, avg: 19300, max: 19300 },
      2021: { min: 18200, avg: 18200, max: 18200 },
    },
    tiida: {
      2025: { min: 13000, avg: 13000, max: 13000 },
      2024: { min: 12200, avg: 12200, max: 12200 },
      2023: { min: 11500, avg: 11500, max: 11500 },
      2022: { min: 10900, avg: 10900, max: 10900 },
      2021: { min: 10300, avg: 10300, max: 10300 },
    },
    x_trail: {
      2025: { min: 32000, avg: 36000, max: 40000 },
      2024: { min: 30200, avg: 34000, max: 37800 },
      2023: { min: 28500, avg: 32100, max: 35700 },
      2022: { min: 26900, avg: 30300, max: 33700 },
    },
  },
  peugeot: {
    "2008": {
      2025: { min: 27000, avg: 29500, max: 32000 },
      2024: { min: 25500, avg: 27850, max: 30200 },
      2023: { min: 24100, avg: 26350, max: 28600 },
      2022: { min: 22800, avg: 24900, max: 27000 },
      2021: { min: 21500, avg: 21500, max: 21500 },
    },
    "208": {
      2025: { min: 20000, avg: 22000, max: 24000 },
      2024: { min: 18900, avg: 20800, max: 22700 },
      2023: { min: 17900, avg: 19700, max: 21500 },
      2022: { min: 16900, avg: 18600, max: 20300 },
      2021: { min: 15900, avg: 17500, max: 19100 },
    },
    "3008": {
      2025: { min: 45000, avg: 50000, max: 55000 },
      2024: { min: 42600, avg: 47300, max: 52000 },
      2023: { min: 40300, avg: 44700, max: 49100 },
      2022: { min: 38000, avg: 38000, max: 38000 },
    },
    "408": {
      2025: { min: 35000, avg: 38500, max: 42000 },
      2024: { min: 33100, avg: 36400, max: 39700 },
      2023: { min: 31300, avg: 34400, max: 37500 },
    },
    "5008": {
      2025: { min: 52000, avg: 52000, max: 52000 },
      2024: { min: 49200, avg: 49200, max: 49200 },
      2023: { min: 46500, avg: 46500, max: 46500 },
    },
    partner: {
      2025: { min: 16000, avg: 16000, max: 16000 },
      2024: { min: 15100, avg: 15100, max: 15100 },
      2023: { min: 14300, avg: 14300, max: 14300 },
      2022: { min: 13500, avg: 13500, max: 13500 },
      2021: { min: 12700, avg: 12700, max: 12700 },
    },
  },
  renault: {
    alaskan: {
      2025: { min: 65000, avg: 65000, max: 65000 },
      2024: { min: 61500, avg: 61500, max: 61500 },
      2023: { min: 58000, avg: 58000, max: 58000 },
      2022: { min: 54800, avg: 54800, max: 54800 },
    },
    captur: {
      2025: { min: 22000, avg: 26333, max: 32000 },
      2024: { min: 20800, avg: 24866, max: 30200 },
      2023: { min: 19700, avg: 23500, max: 28500 },
      2022: { min: 18600, avg: 22233, max: 27000 },
      2021: { min: 17500, avg: 18650, max: 19800 },
    },
    clio: {
      2025: { min: 17000, avg: 19500, max: 22000 },
      2024: { min: 16100, avg: 18450, max: 20800 },
      2023: { min: 15200, avg: 17450, max: 19700 },
      2022: { min: 14400, avg: 16500, max: 18600 },
      2021: { min: 13500, avg: 13500, max: 13500 },
    },
    duster: {
      2025: { min: 22000, avg: 27500, max: 33000 },
      2024: { min: 20800, avg: 26000, max: 31200 },
      2023: { min: 19700, avg: 24600, max: 29500 },
      2022: { min: 18600, avg: 23200, max: 27800 },
      2021: { min: 17500, avg: 17500, max: 17500 },
    },
    kangoo: {
      2025: { min: 14000, avg: 14000, max: 14000 },
      2024: { min: 13200, avg: 13200, max: 13200 },
      2023: { min: 12500, avg: 12500, max: 12500 },
      2022: { min: 11800, avg: 11800, max: 11800 },
      2021: { min: 11100, avg: 11100, max: 11100 },
    },
    koleos: {
      2025: { min: 38000, avg: 43000, max: 48000 },
      2024: { min: 35900, avg: 40650, max: 45400 },
      2023: { min: 33900, avg: 38400, max: 42900 },
    },
    logan: {
      2025: { min: 15000, avg: 15750, max: 16500 },
      2024: { min: 14200, avg: 14900, max: 15600 },
      2023: { min: 13400, avg: 14050, max: 14700 },
      2022: { min: 12700, avg: 13300, max: 13900 },
      2021: { min: 12000, avg: 12550, max: 13100 },
    },
    oroch: {
      2025: { min: 38000, avg: 38000, max: 38000 },
      2024: { min: 35900, avg: 35900, max: 35900 },
      2023: { min: 33900, avg: 33900, max: 33900 },
      2022: { min: 32000, avg: 32000, max: 32000 },
    },
    sandero: {
      2025: { min: 14500, avg: 18250, max: 22000 },
      2024: { min: 13700, avg: 17250, max: 20800 },
      2023: { min: 12900, avg: 16300, max: 19700 },
      2022: { min: 12200, avg: 12200, max: 12200 },
      2021: { min: 11500, avg: 11500, max: 11500 },
    },
    stepway: {
      2025: { min: 19000, avg: 19000, max: 19000 },
      2024: { min: 17900, avg: 17900, max: 17900 },
      2023: { min: 17000, avg: 17000, max: 17000 },
      2022: { min: 16000, avg: 16000, max: 16000 },
      2021: { min: 15100, avg: 15100, max: 15100 },
    },
  },
  suzuki: {
    jimny: {
      2025: { min: 25000, avg: 25000, max: 25000 },
      2024: { min: 23600, avg: 23600, max: 23600 },
      2023: { min: 22300, avg: 22300, max: 22300 },
    },
    swift: {
      2025: { min: 15000, avg: 16000, max: 17000 },
      2024: { min: 14200, avg: 15150, max: 16100 },
      2023: { min: 13400, avg: 14300, max: 15200 },
      2022: { min: 12700, avg: 13550, max: 14400 },
      2021: { min: 12000, avg: 12000, max: 12000 },
    },
    vitara: {
      2025: { min: 24000, avg: 26000, max: 28000 },
      2024: { min: 22700, avg: 24600, max: 26500 },
      2023: { min: 21400, avg: 23200, max: 25000 },
      2022: { min: 20200, avg: 21900, max: 23600 },
    },
  },
  toyota: {
    corolla: {
      2025: { min: 35000, avg: 40000, max: 45000 },
      2024: { min: 33100, avg: 37850, max: 42600 },
      2023: { min: 31300, avg: 35800, max: 40300 },
      2022: { min: 29500, avg: 33750, max: 38000 },
      2021: { min: 27800, avg: 27800, max: 27800 },
    },
    corolla_cross: {
      2025: { min: 42000, avg: 45000, max: 48000 },
      2024: { min: 39700, avg: 42550, max: 45400 },
      2023: { min: 37500, avg: 40200, max: 42900 },
      2022: { min: 35400, avg: 35400, max: 35400 },
    },
    etios: {
      2025: { min: 13000, avg: 13250, max: 13500 },
      2024: { min: 12200, avg: 12450, max: 12700 },
      2023: { min: 11500, avg: 11750, max: 12000 },
      2022: { min: 10900, avg: 11100, max: 11300 },
      2021: { min: 10300, avg: 10500, max: 10700 },
    },
    highlander: {
      2025: { min: 95000, avg: 95000, max: 95000 },
      2024: { min: 89800, avg: 89800, max: 89800 },
    },
    hilux: {
      2025: { min: 38000, avg: 67666, max: 90000 },
      2024: { min: 36000, avg: 64033, max: 85200 },
      2023: { min: 34000, avg: 50450, max: 66900 },
      2022: { min: 32100, avg: 47650, max: 63200 },
      2021: { min: 59600, avg: 59600, max: 59600 },
    },
    rav4: {
      2025: { min: 65000, avg: 71500, max: 78000 },
      2024: { min: 61500, avg: 67600, max: 73700 },
      2023: { min: 58000, avg: 58000, max: 58000 },
      2022: { min: 54800, avg: 54800, max: 54800 },
    },
    supra: {
      2025: { min: 68000, avg: 68000, max: 68000 },
      2024: { min: 64400, avg: 64400, max: 64400 },
    },
    yaris: {
      2025: { min: 20000, avg: 22000, max: 24000 },
      2024: { min: 18900, avg: 20800, max: 22700 },
      2023: { min: 17900, avg: 19700, max: 21500 },
      2022: { min: 16900, avg: 18600, max: 20300 },
      2021: { min: 15900, avg: 15900, max: 15900 },
    },
  },
  volkswagen: {
    amarok: {
      2025: { min: 58000, avg: 76000, max: 95000 },
      2024: { min: 54900, avg: 71900, max: 89800 },
      2023: { min: 51800, avg: 59400, max: 67000 },
      2022: { min: 48900, avg: 55950, max: 63000 },
      2021: { min: 46100, avg: 46100, max: 46100 },
    },
    gol: {
      2025: { min: 13000, avg: 13750, max: 14500 },
      2024: { min: 12200, avg: 12950, max: 13700 },
      2023: { min: 11500, avg: 12200, max: 12900 },
      2022: { min: 10900, avg: 11550, max: 12200 },
      2021: { min: 10300, avg: 10300, max: 10300 },
    },
    nivus: {
      2025: { min: 26000, avg: 28000, max: 30000 },
      2024: { min: 24600, avg: 26500, max: 28400 },
      2023: { min: 23200, avg: 25000, max: 26800 },
      2022: { min: 21900, avg: 23600, max: 25300 },
    },
    polo: {
      2025: { min: 16000, avg: 20000, max: 24000 },
      2024: { min: 15100, avg: 18900, max: 22700 },
      2023: { min: 14300, avg: 17900, max: 21500 },
      2022: { min: 13500, avg: 16900, max: 20300 },
    },
    t_cross: {
      2025: { min: 28000, avg: 30500, max: 33000 },
      2024: { min: 26500, avg: 28850, max: 31200 },
      2023: { min: 25000, avg: 27250, max: 29500 },
      2022: { min: 23600, avg: 23600, max: 23600 },
    },
    taos: {
      2025: { min: 40000, avg: 44000, max: 48000 },
      2024: { min: 37800, avg: 41600, max: 45400 },
      2023: { min: 35700, avg: 39300, max: 42900 },
      2022: { min: 33700, avg: 33700, max: 33700 },
    },
    tiguan: {
      2025: { min: 48000, avg: 55000, max: 62000 },
      2024: { min: 45400, avg: 52050, max: 58700 },
      2023: { min: 42900, avg: 49150, max: 55400 },
      2022: { min: 40500, avg: 40500, max: 40500 },
    },
    up: {
      2025: { min: 10000, avg: 11500, max: 13500 },
      2024: { min: 9400, avg: 10800, max: 12700 },
      2023: { min: 8900, avg: 10233, max: 12000 },
      2022: { min: 8400, avg: 9633, max: 11300 },
      2021: { min: 7900, avg: 8300, max: 8700 },
      2020: { min: 7500, avg: 7850, max: 8200 },
      2019: { min: 7100, avg: 7400, max: 7700 },
    },
    vento: {
      2025: { min: 24000, avg: 26500, max: 29000 },
      2024: { min: 22700, avg: 25050, max: 27400 },
      2023: { min: 21500, avg: 23650, max: 25800 },
      2022: { min: 20300, avg: 22300, max: 24300 },
      2021: { min: 19100, avg: 19100, max: 19100 },
    },
  },
  volvo: {
    xc40: {
      2025: { min: 52000, avg: 56000, max: 60000 },
      2024: { min: 49200, avg: 53000, max: 56800 },
      2023: { min: 46500, avg: 50050, max: 53600 },
      2022: { min: 43900, avg: 43900, max: 43900 },
    },
    xc60: {
      2025: { min: 75000, avg: 85000, max: 95000 },
      2024: { min: 70900, avg: 80350, max: 89800 },
      2023: { min: 66900, avg: 75800, max: 84700 },
    },
    xc90: {
      2025: { min: 100000, avg: 100000, max: 100000 },
      2024: { min: 94600, avg: 94600, max: 94600 },
      2023: { min: 89300, avg: 89300, max: 89300 },
    },
  },
};

// ─── Versiones por marca y modelo (fuente: CCA Autos.pdf) ────
export const CAR_VERSIONS = vehicleVersions as unknown as Record<string, Record<string, string[]>>;

export function getVersions(brand: string, model: string): string[] {
  const bk = brand.toLowerCase().replace(/[\s-]/g, "_");
  const brandVersions = CAR_VERSIONS[bk];
  if (!brandVersions) return [];
  // CCA usa MAYÚSCULAS — buscar coincidencia case-insensitive
  const modelUpper = model.toUpperCase();
  const key = Object.keys(brandVersions).find(
    (k) => k.toUpperCase() === modelUpper,
  );
  return key ? (brandVersions[key] as unknown as string[]) : [];
}

export function getBrands(): { value: string; label: string }[] {
  return CAR_BRANDS;
}

// Compatibilidad con VehicleFields.tsx
export { MOTO_BRANDS_LIST as MOTO_BRANDS } from "@/data/modelos-motos";

export function getModelsForBrand(brand: string): string[] {
  return getModels(brand);
}

export function getBrandLabel(value: string): string {
  return CAR_BRANDS.find((b) => b.value === value)?.label ?? value;
}

export function getModels(brand: string): string[] {
  const key = brand.toLowerCase().replace(/[\s-]/g, "_");
  return CAR_MODELS[key] ?? [];
}

export function getPriceRef(
  brand: string,
  year: number,
): { min: number; avg: number; max: number } | null {
  const key = brand.toLowerCase().replace(/[\s-]/g, "_");
  return PRICE_REF[key]?.[year] ?? null;
}

export function getModelPriceRef(
  brand: string,
  model: string,
  year: number,
): { min: number; avg: number; max: number } | null {
  const bk = brand
    .toLowerCase()
    .replace(
      /[\s\-éëü]/g,
      (c: string) => ({ " ": "_", "-": "_", é: "e", ë: "e", ü: "u" })[c] ?? "_",
    );
  const mk = model
    .toLowerCase()
    .replace(
      /[\s\-/!éóú]/g,
      (c: string) =>
        ({ " ": "_", "-": "_", "/": "_", "!": "", é: "e", ó: "o", ú: "u" })[
          c
        ] ?? "_",
    );
  return MODEL_PRICE_REF[bk]?.[mk]?.[year] ?? getPriceRef(brand, year);
}

/** Años disponibles para una marca y modelo */
export function getAvailableYears(brand: string, model: string): number[] {
  const bk = brand.toLowerCase().replace(/[\s-]/g, "_");
  const mk = model.toLowerCase().replace(/[\s\-/!]/g, "_");
  const ref = MODEL_PRICE_REF[bk]?.[mk];
  if (!ref) return [];
  return Object.keys(ref)
    .map(Number)
    .sort((a, b) => b - a);
}
