/**
 * Static vehicle models by brand slug and tipo.
 * Key = attrs.brand slug (e.g. "toyota", "mercedes_benz").
 * Auto models from autos.json; camioneta models from camionetas_utilitarios_suv.json.
 */
export const MODELOS_POR_MARCA: Record<string, { autos: string[]; camionetas: string[] }> = {
  alfa_romeo: {
    autos: ["145", "146", "147", "155", "156", "159", "164", "166", "Alfasud", "Giulietta", "Mito"],
    camionetas: ["Stelvio"],
  },
  audi: {
    autos: ["A1", "A3", "A4", "A5", "A6", "A7", "A8", "S3", "S4", "TT"],
    camionetas: ["Q2", "Q3", "Q5", "Q6", "Q7", "Q8"],
  },
  baic: {
    autos: ["D20", "EU5", "U5"],
    camionetas: ["BJ30", "BJ40", "BJ60", "Senova", "X25", "X35", "X55"],
  },
  bmw: {
    autos: ["De Carlo", "M2", "M3", "M5", "M6", "Serie 1", "Serie 2", "Serie 3", "Serie 4", "Serie 5", "Serie 7", "Z3", "Z4"],
    camionetas: ["Bertone", "X1", "X3", "X4", "X5", "X6"],
  },
  byd: {
    autos: ["Dolphin Mini"],
    camionetas: ["Song Pro", "Yuan Pro"],
  },
  changan: {
    autos: ["Alsvin"],
    camionetas: ["UNI-T", "CX20", "CS75", "CS95", "CX70"],
  },
  chery: {
    autos: ["Arrizo", "Face", "Fulwin", "QQ", "Skin"],
    camionetas: ["Tiggo"],
  },
  chevrolet: {
    autos: ["400", "Agile", "Astra", "Aveo", "Camaro", "Celta", "Chevette", "Chevy", "Classic", "Cobalt", "Corsa", "Cruze", "Impala", "Joy", "Kadett", "Meriva", "Monza", "Onix", "Prisma", "Sonic", "Spark", "Spin", "Super Sport", "Tigra", "Vectra", "Zafira"],
    camionetas: ["Apache", "Avalanche", "Blazer", "Brava", "C10", "C20", "Captiva", "Cheyenne", "Combo", "Corsa", "D20", "Equinox", "Grand Vitara", "Ipanema", "Lumina", "Luv", "Montana", "S10", "Silverado", "Spin", "Tracker", "Trailblazer", "Trooper", "Van", "Venture"],
  },
  chrysler: {
    autos: ["C300", "Eagle", "Neon", "PT Cruiser", "Sebring", "Stratus", "Valiant"],
    camionetas: ["Caravan", "Grand Caravan", "Voyager"],
  },
  citroen: {
    autos: ["2CV", "3CV", "Aircross", "America", "Ami 8", "C-Elysee", "C3", "C3 Picasso", "C4", "C4 Picasso", "C4 VTS", "C5", "C6", "DS3", "DS4", "Pallas", "Saxo", "Xantia", "Xsara", "Xsara Picasso", "ZX"],
    camionetas: ["AK", "Basalt", "Berlingo", "C15", "C3 Aircross", "C4 Cactus", "C5 Aircross", "Citroneta", "Jumper", "Jumpy", "Mehari", "SpaceTourer"],
  },
  coradir: {
    autos: ["Chiki", "Tito S2", "Tito S5"],
    camionetas: ["Tita", "Tita Cuadrilla"],
  },
  cupra: {
    autos: ["Formentor", "León", "Born"],
    camionetas: [],
  },
  daewoo: {
    autos: ["Espero", "Lanos", "Matiz", "Racer", "Tico"],
    camionetas: ["Koronado", "Labo"],
  },
  daihatsu: {
    autos: ["Applause", "Charade", "Cuore"],
    camionetas: ["Feroza", "Porter", "Terios", "Wide"],
  },
  datsun: {
    autos: ["160", "180"],
    camionetas: [],
  },
  dfsk: {
    autos: [],
    camionetas: ["C31", "C32", "C35", "E5", "Glory", "K01h"],
  },
  dkw: {
    autos: ["Auto Union"],
    camionetas: [],
  },
  dodge: {
    autos: ["1500", "1800", "Coronado", "GTX", "Polara", "Valiant"],
    camionetas: ["Caravan", "D-100", "D-200", "Dakota", "Journey", "Ram"],
  },
  fiat: {
    autos: ["1100", "125", "128", "132", "133", "147", "1500", "1600", "500", "600", "800", "Argo", "Barchetta", "Bravo", "Brio", "Cronos", "Duna", "Europa", "Grand Siena", "Idea", "Linea", "Marea", "Mobi", "Palio", "Punto", "Regatta", "Siena", "Sorpasso", "Stilo", "Super Europa", "Tempra", "Tipo", "Uno"],
    camionetas: ["125", "1500", "Doblo", "Ducato", "Fastback", "Fiorino", "Iveco", "Pulse", "Qubo", "Strada", "Titano", "Toro"],
  },
  ford: {
    autos: ["A", "C-Max", "Escort", "Fairlane", "Falcon", "Fiesta", "Fiesta Kinetic Design", "Fiesta Max", "Focus", "Galaxy", "Ka", "Mondeo", "Mustang", "Orion", "Puma", "S-Max", "Sierra", "T", "Taunus"],
    camionetas: ["Bronco", "Courier", "Econoline", "EcoSport", "Escape", "Everest", "Explorer", "F100", "F150", "F150 Lariat", "F150 Raptor", "F250", "F350", "F400", "Kuga", "Maverick", "Ranchero", "Ranger", "Ranger Raptor", "Splash", "Territory", "Transit", "Tremor", "Van"],
  },
  foton: {
    autos: [],
    camionetas: ["Tunland G7", "Tunland V9"],
  },
  geely: {
    autos: ["All New Emgrand 7"],
    camionetas: ["Emgrand", "EX5"],
  },
  gmc: {
    autos: ["Chevette"],
    camionetas: [],
  },
  great_wall: {
    autos: [],
    camionetas: ["H3", "H5", "Hover", "Pickup"],
  },
  haval: {
    autos: [],
    camionetas: ["H1", "H2", "H6", "Jolion", "Wingle 5", "Wingle 6"],
  },
  honda: {
    autos: ["Accord", "Acura", "City", "Civic", "CRX", "Fit", "Integra", "Legend", "NSX", "Prelude"],
    camionetas: ["CR-V", "HR-V", "Passport", "Pilot", "Stream", "WR-V", "ZR-V"],
  },
  hummer: {
    autos: [],
    camionetas: ["H1", "H2", "H3"],
  },
  hyundai: {
    autos: ["Accent", "Atos", "Coupe", "Elantra", "Excel", "Genesis", "HB20", "I10", "I30", "Matrix", "Sonata", "Veloster"],
    camionetas: ["Creta", "Galloper", "H1", "H100", "HD-78", "Kona", "Matrix", "Santa Fe", "Staria", "Terracan", "Trajet", "Tucson", "Veracruz"],
  },
  ika: {
    autos: ["Rambler Ambassador", "Rambler Classic"],
    camionetas: [],
  },
  isuzu: {
    autos: [],
    camionetas: ["Amigo", "Axiom", "LTD", "Pick-Up", "Rodeo", "Trooper"],
  },
  iveco: {
    autos: [],
    camionetas: ["Daily"],
  },
  jac: {
    autos: ["J3", "J5", "J7"],
    camionetas: ["J2", "J3"],
  },
  jaguar: {
    autos: [],
    camionetas: ["F-Pace"],
  },
  jeep: {
    autos: [],
    camionetas: ["Bertone", "Cherokee", "Commander", "Compass", "Estanciera", "Gladiator", "Grand Cherokee", "IKA", "New Cherokee", "Patriot", "Renegade", "Willys", "Wrangler"],
  },
  jetour: {
    autos: [],
    camionetas: ["Dashing", "T1", "T2", "X50", "X70", "X70 Plus"],
  },
  jmc: {
    autos: [],
    camionetas: ["Gran Avenue", "N601", "N800", "N900"],
  },
  kia: {
    autos: ["Avella", "Cerato", "K3 Sedán", "Pride", "Rio", "Rondo", "Sephia", "Soul"],
    camionetas: ["Asia", "Besta", "Carnival", "K", "K2400", "K2500", "K3 Cross", "Mohave", "Pregio", "Sorento", "Soul", "Sportage"],
  },
  lada: {
    autos: ["Tavria"],
    camionetas: ["Niva"],
  },
  lancia: {
    autos: ["Delta"],
    camionetas: [],
  },
  land_rover: {
    autos: [],
    camionetas: ["Defender", "Discovery", "Freelander", "Range Rover", "Santana"],
  },
  lexus: {
    autos: ["GS", "RCF"],
    camionetas: [],
  },
  lifan: {
    autos: [],
    camionetas: ["Foison Box", "Foison Cargo", "Foison Truck", "Myway", "X50", "X60", "X70"],
  },
  mahindra: {
    autos: [],
    camionetas: ["Bolero", "Pik-Up", "XUV"],
  },
  mazda: {
    autos: ["121", "323", "328", "626", "929", "RX"],
    camionetas: ["E1600", "Navaja", "Pick-Up", "Serie B", "Tribute"],
  },
  mercedes_benz: {
    autos: ["Clase A", "Clase B", "Clase C", "Clase CL", "Clase CLC", "Clase CLK", "Clase CLS", "Clase D", "Clase E", "Clase S", "Clase SL", "Clase SLC", "Clase SLK", "Clase SLR", "Smart"],
    camionetas: ["240", "GLA", "GLB", "GLC", "GLE", "GLK", "GLX", "MB", "ML", "Sprinter", "Viano", "Vito"],
  },
  mg: {
    autos: ["MG3", "MG5", "MG6"],
    camionetas: ["MG ZS", "MG RX5"],
  },
  mini: {
    autos: ["Cooper", "Cooper S", "Countryman"],
    camionetas: [],
  },
  mitsubishi: {
    autos: ["Colt", "Eagle", "Eclipse", "Galant", "Lancer", "Proton", "Sapporo"],
    camionetas: ["Expo", "Galloper", "L100", "L200", "L300", "Montero", "Nativa", "Outlander", "Space Wagon", "Triton", "Varica"],
  },
  nissan: {
    autos: ["370Z", "Bluebird", "Datsun", "Laurel", "March", "Micra", "Note", "NX", "Quest", "Sentra", "SX", "Teana", "Tiida", "Versa"],
    camionetas: ["AX Limited", "D21", "D22", "D23", "Frontier", "Kicks", "Murano", "Navara", "NP", "Pathfinder", "Patrol", "Pick-Up", "Serena", "Terrano", "Trade", "XTerra", "XTrail"],
  },
  opel: {
    autos: ["Astra", "GL", "Lister", "Vectra"],
    camionetas: [],
  },
  peugeot: {
    autos: ["106", "205", "206", "207", "208", "301", "306", "307", "308", "403", "404", "405", "406", "407", "408", "504", "505", "508", "605", "806", "807", "RCZ"],
    camionetas: ["2008", "3008", "4008", "5008", "403", "404", "504", "Boxer", "Expert", "Hoggar", "Partner", "Traveller"],
  },
  piaggio: {
    autos: [],
    camionetas: ["Porter"],
  },
  porsche: {
    autos: ["944", "Boxster", "Carrera"],
    camionetas: ["Cayenne", "Macan"],
  },
  range_rover: {
    autos: [],
    camionetas: ["Range Rover", "Range Rover Sport", "Range Rover Velar", "Range Rover Evoque"],
  },
  rastrojero: {
    autos: [],
    camionetas: ["Frontalito", "Rastrojero"],
  },
  renault: {
    autos: ["Clio", "Dacia", "Fluence", "Fuego", "Gordini", "Kwid", "Laguna", "Latitude", "Logan", "Megane", "R11", "R12", "R18", "R19", "R21", "R4", "R5", "R6", "R9", "Sandero", "Scenic", "Symbol", "Torino", "Twingo"],
    camionetas: ["4F", "Alaskan", "Arkana", "Boreal", "Captur", "Duster", "Express", "Kangoo", "Kardian", "Koleos", "Kwid", "Master", "Murano", "Oroch", "Rodeo", "Trafic"],
  },
  rover: {
    autos: ["CityRover", "GTI", "Serie 100", "Serie 200", "Serie 400", "Serie 600", "Serie 800"],
    camionetas: [],
  },
  seat: {
    autos: ["Alhambra", "Altea", "Cordoba", "Ibiza", "Leon", "Marbella", "Toledo"],
    camionetas: ["Inca", "Tarraco"],
  },
  shineray: {
    autos: [],
    camionetas: ["SWM", "T30", "T32", "X30 Furgón", "X30 Minivan"],
  },
  skoda: {
    autos: ["440"],
    camionetas: [],
  },
  smart: {
    autos: ["Forfour", "Fortwo Cabrio", "Fortwo Coupe"],
    camionetas: [],
  },
  ssangyong: {
    autos: [],
    camionetas: ["Actyon", "Istana", "Korando", "Musso"],
  },
  subaru: {
    autos: ["4WD", "Impreza", "Legacy", "SVX"],
    camionetas: ["Crosstrek", "Forester", "Tribeca"],
  },
  suzuki: {
    autos: ["Alto", "Baleno", "Cervo", "Fronte", "Fun", "Maruti", "Swift", "Wagon R"],
    camionetas: ["Grand Vitara", "Jimny", "LJ80", "LJ81", "Maruti", "Nakai", "Samurai", "Sidekick", "Super Carry", "Vitara"],
  },
  tata: {
    autos: [],
    camionetas: ["Sumo", "Telcoline"],
  },
  toyota: {
    autos: ["86", "Avensis", "Camry", "Carina", "Celica", "Corolla", "Corona", "Crown", "Etios", "Fielder", "Prius", "Yaris"],
    camionetas: ["C-HR", "Corolla Cross", "Four Runner", "Hiace", "Hilux", "Hilux SW4", "Innova", "Land Cruiser", "Prado", "Previa", "RAV-4", "Tundra", "Van"],
  },
  volkswagen: {
    autos: ["1500", "Bora", "Carat", "CrossFox", "Escarabajo", "Fox", "Gacel", "Gol", "Gol Country", "Gol Trend", "Golf", "New Beetle", "Passat", "Pointer", "Polo", "Quantum", "Santana", "Scirocco", "Senda", "Suran", "Up", "Vento", "Virtus", "Voyage"],
    camionetas: ["Amarok", "Caddy", "Courier", "Kombi", "Multivan", "Nivus", "Saveiro", "Sharan", "T-Cross", "Taos", "Tera", "Tiguan", "Touareg", "Transporter", "VW Furgon"],
  },
  volvo: {
    autos: ["850", "960", "C30", "C70", "S40", "S60", "V40", "V70"],
    camionetas: ["CX60", "V50", "XC60", "XC70", "XC90"],
  },
  zanella: {
    autos: [],
    camionetas: ["Force Truck"],
  },
};

/**
 * Returns model list for the given brand slug and vehicle tipo.
 * Returns empty array if no data available.
 */
export function getModelosPorMarca(brandSlug: string, tipo: "auto" | "camioneta" | "camion"): string[] {
  if (tipo === "camion") return MODELOS_CAMION[brandSlug] ?? [];
  const entry = MODELOS_POR_MARCA[brandSlug];
  if (!entry) return [];
  return tipo === "camioneta" ? entry.camionetas : entry.autos;
}

export const CAMION_BRANDS_LIST: { value: string; label: string }[] = [
  { value: "aeolus",        label: "Aeolus" },
  { value: "agrale",        label: "Agrale" },
  { value: "bedford",       label: "Bedford" },
  { value: "chevrolet",     label: "Chevrolet" },
  { value: "daihatsu",      label: "Daihatsu" },
  { value: "deutz",         label: "Deutz" },
  { value: "dfm",           label: "DFM" },
  { value: "dfsk",          label: "DFSK" },
  { value: "dimex",         label: "Dimex" },
  { value: "dodge",         label: "Dodge" },
  { value: "fiat",          label: "Fiat" },
  { value: "ford",          label: "Ford" },
  { value: "foton",         label: "Foton" },
  { value: "grosspal",      label: "Grosspal" },
  { value: "hino",          label: "Hino" },
  { value: "hyundai",       label: "Hyundai" },
  { value: "international", label: "International" },
  { value: "isuzu",         label: "Isuzu" },
  { value: "iveco",         label: "Iveco" },
  { value: "jmc",           label: "JMC" },
  { value: "kia",           label: "Kia" },
  { value: "mack",          label: "Mack" },
  { value: "mercedes_benz", label: "Mercedes Benz" },
  { value: "nissan",        label: "Nissan" },
  { value: "renault",       label: "Renault" },
  { value: "scania",        label: "Scania" },
  { value: "shineray",      label: "Shineray" },
  { value: "tata",          label: "Tata" },
  { value: "toyota",        label: "Toyota" },
  { value: "volkswagen",    label: "Volkswagen" },
  { value: "volvo",         label: "Volvo" },
  { value: "zanella",       label: "Zanella" },
];

export const MODELOS_CAMION: Record<string, string[]> = {
  aeolus:        ["Captain-C", "Captain-D", "Captain-E"],
  agrale:        ["A7500", "A8700", "A10000", "6000", "MA 15.0", "MT 17.0"],
  bedford:       ["J6LZ7", "TD", "TJ"],
  chevrolet:     ["C60", "C70", "Kodiak", "NPR", "NQR", "NKR"],
  daihatsu:      ["Delta V57", "Delta V58", "Delta V118"],
  deutz:         ["Decaroli", "Dynamic", "Magirus 160", "Magirus 200"],
  dfm:           ["Captain", "Duolika", "T01", "Z50"],
  dfsk:          ["C31", "C32", "C35", "V21", "V22"],
  dimex:         ["D1416", "D1622", "D1721", "D1725"],
  dodge:         ["D-400", "D-500", "D-600", "D-800", "DP-800"],
  fiat:          ["150 Turbo", "190.29", "190.33", "619 N1", "619 T1", "673"],
  ford:          [
    "F-350", "F-4000", "F-14000",
    "Cargo 712", "Cargo 915", "Cargo 1119", "Cargo 1517",
    "Cargo 1722", "Cargo 1723", "Cargo 1932", "Cargo 1933",
    "Cargo 2042", "Cargo 2842",
  ],
  foton:         ["Aumark S1 614", "Aumark S3 815", "Aumark S3 916", "Auman EST", "Auman GTL", "TM3"],
  grosspal:      ["Bigua", "G720", "G740"],
  hino:          ["Serie 300 - 514", "Serie 300 - 616", "Serie 300 - 716", "Serie 300 - 816", "Serie 500 - 1627"],
  hyundai:       ["H100", "HD65", "HD72", "HD78", "HD120", "Xcient"],
  international: ["4400", "7600", "9800", "9800i"],
  isuzu:         ["Forward", "FVR", "NPR 75", "NQR 90"],
  iveco:         [
    "619 (Classic)",
    "Daily 55C17", "Daily 70C17",
    "Vertis 130V19",
    "Tector 9", "Tector 11", "Tector 15", "Tector 17", "Tector 24",
    "Hi-Road", "S-Way", "S-Way 530",
    "Stralis 460", "Stralis Hi-Way",
    "Trakker",
  ],
  jmc:           ["Conquer", "N720", "N900"],
  kia:           ["K2500", "K2700"],
  mack:          ["CH613", "Granite", "R600", "Vision"],
  mercedes_benz: [
    "L-1114", "L-1517", "L-1518", "L-1620", "L-1624",
    "Accelo 815", "Accelo 1016",
    "Atego 1419", "Atego 1721", "Atego 1726", "Atego 1729",
    "Axor 1933", "Axor 2036", "Axor 2544",
    "Actros 2045", "Actros 2548", "Actros 2651",
    "Arocs 3342", "Arocs 4145",
  ],
  nissan:        ["Atleon", "NT400 Cabstar"],
  renault:       ["D-Wide", "Kerax", "Magnum", "Mascott", "Midlum", "Premium 380", "Premium 440"],
  scania:        [
    "112 H", "113 H",
    "P250", "P280 XT", "P310", "P340",
    "G380", "G410", "G410 XT", "G450 XT", "G460",
    "R440", "R480", "R500", "R540", "R620 V8",
    "Scania Super 420", "Scania Super 460", "Scania Super 560",
  ],
  shineray:      ["T30", "T32", "T50", "T52"],
  tata:          ["608", "709", "LPT 1613", "Xenon (Truck version)"],
  toyota:        ["Dyna"],
  volkswagen:    [
    "13.180", "17.220", "18.310 Titan",
    "Delivery 6.160", "Delivery 9.170", "Delivery 11.180",
    "Constellation 14.190", "Constellation 17.230", "Constellation 17.280",
    "Constellation 19.330", "Constellation 19.360",
    "Constellation 24.280", "Constellation 25.360",
    "Meteor 28.460", "Meteor 29.520",
  ],
  volvo:         [
    "NL 10", "NL 12",
    "VM 270", "VM 330", "VM 360",
    "FM 330", "FM 380", "FM 420", "FM 460",
    "FMX 420", "FMX 460",
    "FH 16", "FH 420", "FH 460", "FH 500", "FH 540",
  ],
  zanella:       ["Z-Truck"],
};
