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
  // Additional brands (no ML ID)
  { id: "", name: "Coradir" },
  { id: "", name: "Daewoo" },
  { id: "", name: "Daihatsu" },
  { id: "", name: "Datsun" },
  { id: "", name: "DFSK" },
  { id: "", name: "DKW" },
  { id: "", name: "Foton" },
  { id: "", name: "GMC" },
  { id: "", name: "Hummer" },
  { id: "", name: "IKA" },
  { id: "", name: "Isuzu" },
  { id: "", name: "Iveco" },
  { id: "", name: "Jaguar" },
  { id: "", name: "Jetour" },
  { id: "", name: "JMC" },
  { id: "", name: "Lada" },
  { id: "", name: "Lancia" },
  { id: "", name: "Lexus" },
  { id: "", name: "Lifan" },
  { id: "", name: "Mahindra" },
  { id: "", name: "Mini" },
  { id: "", name: "Opel" },
  { id: "", name: "Piaggio" },
  { id: "", name: "Rastrojero" },
  { id: "", name: "Rover" },
  { id: "", name: "Shineray" },
  { id: "", name: "Smart" },
  { id: "", name: "SsangYong" },
  { id: "", name: "Suzuki" },
  { id: "", name: "Tata" },
  { id: "", name: "Zanella" },
];

/** Vehicle types used in the publication form */
export const TIPOS_VEHICULO = [
  { value: "auto",         label: "Auto" },
  { value: "camioneta",    label: "Pickup / SUV / Utilitario" },
  { value: "moto",         label: "Moto" },
  { value: "cuatriciclo",  label: "Cuatriciclo" },
  { value: "utv",          label: "Areneros/UTV" },
  { value: "camion",       label: "Camión" },
  { value: "nautica",      label: "Náutica" },
  { value: "otro",         label: "Otro" },
];

/**
 * CAR_BRANDS slugs to show per vehicle tipo.
 * Used to filter the brand select when tipo = "auto" or "camioneta".
 */
export const MARCAS_POR_TIPO: Record<"auto" | "camioneta", Set<string>> = {
  auto: new Set([
    "toyota", "chevrolet", "ford", "volkswagen", "renault", "honda",
    "peugeot", "hyundai", "fiat", "nissan", "kia", "mitsubishi", "citroen",
    "bmw", "mercedes_benz", "audi", "chrysler", "subaru",
    "chery", "byd", "baic", "geely", "jac", "changan",
    "porsche", "volvo", "skoda", "seat", "mg", "alfa_romeo", "cupra",
    "dodge", "mazda",
    "coradir", "daewoo", "daihatsu", "datsun", "dkw", "gmc",
    "ika", "lada", "lancia", "lexus", "mini", "opel", "rover", "smart", "suzuki",
  ]),
  camioneta: new Set([
    "toyota", "chevrolet", "ford", "volkswagen", "renault", "honda",
    "hyundai", "jeep", "fiat", "nissan", "kia", "mitsubishi", "citroen",
    "bmw", "mercedes_benz", "audi", "subaru", "alfa_romeo",
    "chery", "byd", "baic", "great_wall", "haval", "changan", "jac",
    "land_rover", "volvo", "porsche", "dodge", "mazda",
    "coradir", "daewoo", "daihatsu", "dfsk", "foton",
    "hummer", "isuzu", "iveco", "jaguar", "jetour", "jmc",
    "lada", "lifan", "mahindra", "piaggio", "rastrojero",
    "shineray", "ssangyong", "suzuki", "tata", "zanella",
  ]),
};

export const NAUTICA_CATEGORIAS: {
  value: string;
  label: string;
  subcategorias: string[];
  marcas?: string[];
}[] = [
  {
    value: "embarcaciones",
    label: "Embarcaciones",
    subcategorias: ["Lanchas", "Veleros", "Semirrígidos", "Botes y Canoas", "Kayaks", "Catamaranes", "Pesca Deportiva"],
  },
  {
    value: "motos_de_agua",
    label: "Motos de Agua",
    subcategorias: ["Jet Ski", "Stand Up", "Recreativas", "Alta Performance"],
    marcas: ["Sea-Doo", "Yamaha", "Kawasaki", "Bombardier", "Polaris", "Otras marcas"],
  },
  {
    value: "propulsion_motores",
    label: "Propulsión y Motores",
    subcategorias: ["Motores Fuera de Borda", "Motores Internos", "Motores Eléctricos", "Repuestos de Motor"],
  },
  {
    value: "inflables_recreacion",
    label: "Inflables y Recreación",
    subcategorias: ["Inflables de Arrastre", "Bananas", "Plataformas Inflables", "Accesorios Inflables"],
  },
  {
    value: "accesorios_nauticos",
    label: "Accesorios Náuticos",
    subcategorias: ["Chalecos Salvavidas", "Electrónica Náutica", "Anclas y Amarras", "Cubiertas y Fundas", "Iluminación", "Equipamiento de Seguridad"],
  },
  {
    value: "servicios",
    label: "Servicios",
    subcategorias: ["Alquiler", "Guardería Náutica", "Mantenimiento", "Transporte"],
  },
];

export const OTROS_VEHICULOS_CATEGORIAS: {
  value: string;
  label: string;
  subcategorias: string[];
}[] = [
  {
    value: "movilidad_alternativa",
    label: "Movilidad Alternativa",
    subcategorias: ["Bicicletas", "Bicicletas Eléctricas", "Monopatines Eléctricos", "Scooters Eléctricos", "Triciclos Eléctricos", "Vehículos de Movilidad Reducida"],
  },
  {
    value: "vehiculos_recreativos",
    label: "Vehículos Recreativos",
    subcategorias: ["Kartings", "Cuatriciclos Infantiles", "Mini Vehículos"],
  },
  {
    value: "maquinaria_trabajo",
    label: "Maquinaria y Trabajo",
    subcategorias: ["Maquinaria Vial", "Maquinaria Pesada", "Máquinas Agrícolas", "Tractores", "Cosechadoras", "Pulverizadoras", "Autoelevadores", "Grúas"],
  },
  {
    value: "transporte_pasajeros",
    label: "Transporte de Pasajeros",
    subcategorias: ["Colectivos", "Buses", "Minibuses", "Combis", "Transporte Escolar"],
  },
  {
    value: "remolques_acoplados",
    label: "Remolques y Acoplados",
    subcategorias: ["Trailers", "Acoplados", "Carros", "Volquetes", "Remolques para Autos", "Remolques para Motos"],
  },
  {
    value: "casas_rodantes",
    label: "Casas Rodantes y Motorhome",
    subcategorias: ["Casas Rodantes", "Motorhomes", "Campers", "Mini Rodantes"],
  },
  {
    value: "rurales_tradicionales",
    label: "Vehículos Rurales y Tradicionales",
    subcategorias: ["Carretelas", "Sulkys", "Vehículos a Tracción Animal"],
  },
  {
    value: "industriales_especializados",
    label: "Industriales y Especializados",
    subcategorias: ["Vehículos Blindados", "Vehículos de Minería", "Equipos Petroleros", "Plataformas Elevadoras", "Camiones Especiales"],
  },
  {
    value: "otros",
    label: "Otros",
    subcategorias: ["Prototipos", "Vehículos Modificados", "Sin Clasificar"],
  },
];

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
