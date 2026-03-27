import { createClient } from "@/lib/supabase/server";
import { ListingCard } from "@/components/listings/ListingCard";
import { ListingListCard } from "@/components/listings/ListingListCard";
import { SubcategoryPills } from "@/components/ui/SubcategoryPills";
import type { SubcatPill } from "@/components/ui/SubcategoryPills";
import { FilterPanel } from "@/components/listings/FilterPanel";
import { notFound } from "next/navigation";
import Link from "next/link";
import PinIcon from "@/components/ui/PinIcon";
import { RE_LOCATIONS, ALL_RE_ZONES } from "@/lib/re-locations";
import { OrderSelect } from "@/components/ui/OrderSelect";
import { SearchWithSuggestions } from "@/components/ui/SearchWithSuggestions";
import type { Metadata } from "next";

const VEHICLE_BRANDS = [
  { value: "toyota", label: "Toyota" },
  { value: "volkswagen", label: "Volkswagen" },
  { value: "ford", label: "Ford" },
  { value: "chevrolet", label: "Chevrolet" },
  { value: "renault", label: "Renault" },
  { value: "peugeot", label: "Peugeot" },
  { value: "fiat", label: "Fiat" },
  { value: "honda", label: "Honda" },
  { value: "hyundai", label: "Hyundai" },
  { value: "kia", label: "Kia" },
  { value: "nissan", label: "Nissan" },
  { value: "citroen", label: "Citroën" },
  { value: "bmw", label: "BMW" },
  { value: "mercedes-benz", label: "Mercedes-Benz" },
  { value: "audi", label: "Audi" },
  { value: "jeep", label: "Jeep" },
  { value: "dodge", label: "Dodge" },
  { value: "chery", label: "Chery" },
  { value: "byd", label: "BYD" },
];

const VEHICLE_TYPES = [
  { value: "auto", label: "Autos" },
  { value: "camioneta", label: "Pickups / SUV / Utilitarios" },
  { value: "moto", label: "Motos" },
  { value: "cuatriciclo", label: "Cuatriciclos" },
  { value: "utv", label: "Areneros" },
  { value: "camion", label: "Camiones" },
  { value: "nautica", label: "Náutica" },
];

const FUELS = [
  { value: "nafta", label: "Nafta" },
  { value: "diesel", label: "Diesel" },
  { value: "gnc", label: "GNC" },
  { value: "electrico", label: "Eléctrico" },
  { value: "hibrido", label: "Híbrido" },
];

const TRANSMISSIONS = [
  { value: "manual", label: "Manual" },
  { value: "automatica", label: "Automática" },
  { value: "cvt", label: "CVT" },
];

const CATEGORY_META: Record<string, { name: string; icon: string }> = {
  vehicles:        { name: "Vehículos",         icon: "🚗" },
  "real-estate":   { name: "Inmuebles",         icon: "🏠" },
  phones:          { name: "Celulares",          icon: "📱" },
  electronics:     { name: "Tecnología",         icon: "💻" },
  appliances:      { name: "Electrodomésticos",  icon: "🧊" },
  clothing:        { name: "Ropa y Calzado",     icon: "👗" },
  "home-garden":   { name: "Hogar y Muebles", icon: "🛋️" },
  sports:          { name: "Deportes",           icon: "⚽" },
  tools:           { name: "Herramientas",       icon: "🔧" },
  babies:          { name: "Bebés y Niños",      icon: "👶" },
  books:           { name: "Música, Libros y Revistas", icon: "📚" },
  "beauty-health": { name: "Belleza y Salud",    icon: "💄" },
  toys:            { name: "Juegos y Juguetes",  icon: "🧸" },
  pets:            { name: "Mascotas",           icon: "🐾" },
  services:        { name: "Servicios",          icon: "🛠️" },
  other:           { name: "Otros",              icon: "📦" },
};

const PHONE_BRANDS = [
  { value: "apple", label: "Apple" },
  { value: "samsung", label: "Samsung" },
  { value: "motorola", label: "Motorola" },
  { value: "xiaomi", label: "Xiaomi" },
  { value: "lg", label: "LG" },
  { value: "nokia", label: "Nokia" },
  { value: "huawei", label: "Huawei" },
  { value: "realme", label: "Realme" },
  { value: "tcl", label: "TCL" },
];

const PHONE_TYPES = [
  { value: "smartphone", label: "Smartphones" },
  { value: "basico", label: "Celulares básicos" },
  { value: "acc-phone", label: "Accesorios" },
  { value: "repuesto-phone", label: "Repuestos" },
];

const APPLIANCE_TYPES = [
  { value: "heladera", label: "Heladeras" },
  { value: "lavarropas", label: "Lavarropas" },
  { value: "aire", label: "Aire acondicionado" },
  { value: "microondas", label: "Microondas" },
  { value: "horno", label: "Hornos" },
  { value: "cocina", label: "Cocinas" },
  { value: "lavavajillas", label: "Lavavajillas" },
  { value: "secarropas", label: "Secarropas" },
  { value: "aspiradora", label: "Aspiradoras" },
  { value: "otro-electrod", label: "Otros" },
];

const HG_TYPES = [
  { value: "decoracion",      label: "Decoración y Ambientación" },
  { value: "cocina-comedor",  label: "Cocina y Comedor" },
  { value: "banos",           label: "Baños y Sanitarios" },
  { value: "dormitorio",      label: "Dormitorio y Descanso" },
  { value: "limpieza",        label: "Limpieza del Hogar" },
  { value: "iluminacion",     label: "Iluminación" },
  { value: "jardin-exterior", label: "Jardín y Exterior" },
  { value: "muebles",         label: "Muebles y Estantes" },
  { value: "organizacion",    label: "Organización y Almacenaje" },
  { value: "seguridad",       label: "Seguridad del Hogar" },
  { value: "textil",          label: "Textiles del Hogar" },
  { value: "otro",            label: "Otro" },
];

const SPORTS_TYPES = [
  { value: "futbol",    label: "Fútbol" },
  { value: "bicicleta", label: "Bicicleta" },
  { value: "fitness",   label: "Fitness / Gym" },
  { value: "pelota",    label: "Pelotas / Equipos" },
  { value: "raqueta",   label: "Raqueta / Pala" },
  { value: "natacion",  label: "Natación" },
  { value: "camping",   label: "Camping / Outdoor" },
  { value: "ropa-dep",  label: "Ropa deportiva" },
  { value: "otro",      label: "Otro" },
];

const TOOLS_TYPES = [
  { value: "accesorios", label: "Accesorios para Herramientas" },
  { value: "cajas-org",  label: "Cajas y Organizadores" },
  { value: "electrica",  label: "Herramientas Eléctricas" },
  { value: "industrial", label: "Herramientas Industriales" },
  { value: "manual",     label: "Herramientas Manuales" },
  { value: "neumatica",  label: "Herramientas Neumáticas" },
  { value: "jardineria", label: "Herramientas para Jardín" },
  { value: "medicion",   label: "Medición y Diagnóstico" },
  { value: "soldadura",  label: "Soldadura y Corte" },
  { value: "otro",       label: "Otro" },
];

const TOYS_TYPES = [
  { value: "juguetes-accion",   label: "Juguetes de Acción" },
  { value: "arte-manualidades", label: "Arte y Manualidades" },
  { value: "construccion",      label: "Construcción y Encastre" },
  { value: "juegos-mesa",       label: "Juegos de Mesa y Cartas" },
  { value: "juegos-exterior",   label: "Juegos al Aire Libre" },
  { value: "peluches",          label: "Peluches y Muñecos" },
  { value: "vehiculos-juguete", label: "Vehículos de Juguete" },
  { value: "juguetes-bebe",     label: "Juguetes para Bebés" },
  { value: "electronicos",      label: "Electrónicos para Niños" },
  { value: "puzzles",           label: "Puzzles y Rompecabezas" },
  { value: "patines",           label: "Patines y Monopatines" },
  { value: "instrumentos",      label: "Instrumentos Musicales Infantiles" },
  { value: "coleccionables",    label: "Figuritas y Coleccionables" },
  { value: "otro",              label: "Otro" },
];

const BOOKS_TYPES = [
  { value: "libros",      label: "Libros" },
  { value: "revistas",    label: "Revistas y Publicaciones" },
  { value: "comic-manga", label: "Cómics y Manga" },
  { value: "ebooks",      label: "Libros Digitales" },
  { value: "musica",      label: "Música (CDs y Vinilos)" },
  { value: "peliculas",   label: "Películas y Series" },
  { value: "cursos",      label: "Cursos y Tutoriales" },
  { value: "catalogos",   label: "Catálogos e Instructivos" },
  { value: "otro",        label: "Otro" },
];

const PETS_TYPES = [
  { value: "perros",        label: "Perros" },
  { value: "gatos",         label: "Gatos" },
  { value: "aves",          label: "Aves y Pájaros" },
  { value: "peces",         label: "Peces y Acuarios" },
  { value: "roedores",      label: "Roedores y Conejos" },
  { value: "reptiles",      label: "Reptiles y Anfibios" },
  { value: "caballos",      label: "Caballos y Equinos" },
  { value: "collar-correa", label: "Collares y Correas" },
  { value: "ropa-mascotas", label: "Ropa y Accesorios" },
  { value: "jaulas-camas",  label: "Jaulas, Camas y Transportes" },
  { value: "higiene",       label: "Higiene y Cuidado" },
  { value: "alimentacion",  label: "Alimentación y Snacks" },
  { value: "juguetes-mas",  label: "Juguetes para Mascotas" },
  { value: "otro",          label: "Otro" },
];

const OTHER_TYPES = [
  { value: "arte-antiguedades",  label: "Arte y Antigüedades" },
  { value: "coleccionables",     label: "Coleccionables" },
  { value: "instrumentos",       label: "Instrumentos Musicales" },
  { value: "joyeria-relojes",    label: "Joyería y Relojes" },
  { value: "videojuegos",        label: "Videojuegos y Consolas" },
  { value: "industria-comercio", label: "Industria y Comercio" },
  { value: "oficina-libreria",   label: "Oficina y Librería" },
  { value: "alimentos-bebidas",  label: "Alimentos y Bebidas" },
  { value: "construccion",       label: "Materiales de Construcción" },
  { value: "campo-agro",         label: "Campo y Agro" },
  { value: "souvenirs-fiestas",  label: "Souvenirs y Fiestas" },
  { value: "viajes-turismo",     label: "Viajes y Turismo" },
  { value: "otro",               label: "Otro" },
];

const SERVICES_TYPES = [
  { value: "asesoramiento",  label: "Asesoramiento Legal y Contable" },
  { value: "belleza-serv",   label: "Belleza y Estética" },
  { value: "diseno",         label: "Diseño y Comunicación" },
  { value: "cursos",         label: "Cursos y Clases" },
  { value: "delivery",       label: "Delivery y Envíos" },
  { value: "eventos",        label: "Fiestas y Eventos" },
  { value: "fotografia",     label: "Fotografía y Audiovisual" },
  { value: "construccion",   label: "Construcción y Reformas" },
  { value: "imprenta",       label: "Imprenta y Gráfica" },
  { value: "mecanica",       label: "Mecánica y Vehículos" },
  { value: "salud",          label: "Salud y Bienestar" },
  { value: "mascotas-serv",  label: "Servicios para Mascotas" },
  { value: "limpieza",       label: "Limpieza y Mantenimiento" },
  { value: "informatica",    label: "Informática y Tecnología" },
  { value: "transporte",     label: "Transporte y Mudanzas" },
  { value: "turismo",        label: "Turismo y Viajes" },
  { value: "otro",           label: "Otro" },
];

const TECH_GROUPS: Record<string, { label: string; items: string[] }> = {
  computacion: { label: "Computación",                items: ["notebook","pc","tablet","monitor","componentes-pc","impresion","conectividad","otro-comp"] },
  camaras:     { label: "Cámaras y Accesorios",       items: ["camara","acc-camara","filmadora","otro-camara"] },
  consolas:    { label: "Consolas y Videojuegos",     items: ["videojuego","consola-ps","consola-nintendo","consola","otro-consola"] },
  electronica: { label: "Electrónica, Audio y Video", items: ["audio","acc-audio-video","componentes-electronicos","drone","audio-vehiculo","otro-elec"] },
  tv:          { label: "Televisores",                items: ["tv","otro-tv"] },
  otros:       { label: "Otros",                      items: ["otro"] },
};
// reverse map: sub_category → group key
const SUBCAT_TO_GROUP: Record<string, string> = {};
for (const [g, { items }] of Object.entries(TECH_GROUPS)) for (const s of items) SUBCAT_TO_GROUP[s] = g;

const BABY_TYPES = [
  { value: "andadores",    label: "Andadores y Vehículos" },
  { value: "bano",         label: "Artículos de Baño" },
  { value: "maternidad",   label: "Maternidad y Embarazo" },
  { value: "chupetes",     label: "Chupetes y Mordillos" },
  { value: "alimentacion", label: "Comida y Alimentación" },
  { value: "corralito",    label: "Corralitos y Cunas" },
  { value: "cuarto",       label: "Cuarto del Bebé" },
  { value: "higiene",      label: "Higiene y Cuidado" },
  { value: "juguetes-bebe",label: "Juguetes para Bebés" },
  { value: "lactancia",    label: "Lactancia" },
  { value: "paseo",        label: "Paseo y Transporte" },
  { value: "ropa",         label: "Ropa y Calzado" },
  { value: "salud",        label: "Salud del Bebé" },
  { value: "seguridad",    label: "Seguridad para Bebés" },
  { value: "otro",         label: "Otro" },
];

const BEAUTY_TYPES = [
  { value: "cuidado-piel", label: "Cuidado de la piel" },
  { value: "cabello", label: "Cabello" },
  { value: "maquillaje", label: "Maquillaje" },
  { value: "perfume", label: "Perfumes" },
  { value: "bienestar", label: "Bienestar y salud" },
  { value: "herramientas-belleza", label: "Herramientas de belleza" },
];

const RE_PROPERTY_TYPES = [
  { value: "casa", label: "Casa" },
  { value: "departamento", label: "Departamento" },
  { value: "terreno", label: "Terreno / Lote" },
  { value: "finca", label: "Finca / Campo" },
  { value: "local", label: "Local / Oficina" },
  { value: "galpon", label: "Galpón / Depósito" },
  { value: "cochera", label: "Cochera" },
];

const RE_OPERATIONS = [
  { value: "venta", label: "Venta" },
  { value: "alquiler", label: "Alquiler" },
  { value: "alquiler-temporal", label: "Temp." },
];

const RE_BEDROOMS = [
  { value: "monoambiente", label: "Monoambiente" },
  { value: "1", label: "1 dorm." },
  { value: "2", label: "2 dorm." },
  { value: "3", label: "3 dorm." },
  { value: "4", label: "4 dorm." },
  { value: "5+", label: "5+" },
];

const RE_FEATURES = [
  { key: "garage", label: "Cochera" },
  { key: "pool", label: "Pileta" },
  { key: "elevator", label: "Ascensor" },
  { key: "furnished", label: "Amoblado" },
  { key: "pets_allowed", label: "Mascotas" },
  { key: "air_conditioning", label: "A/A" },
  { key: "grill", label: "Parrilla" },
  { key: "security", label: "Seguridad 24hs" },
  { key: "private_complex", label: "Barrio privado" },
  { key: "credit_eligible", label: "Apto crédito" },
];

type Params = { slug: string };
type SP = {
  q?: string; order?: string;
  // vehicle
  type?: string; sub_category?: string; brand?: string; model?: string;
  year_from?: string; year_to?: string;
  km_max?: string; fuel?: string; transmission?: string;
  seller_type?: string; v_province?: string; v_zone?: string;
  // real estate
  re_type?: string; re_operation?: string; re_province?: string; re_zone?: string;
  re_bedrooms?: string; re_bathrooms?: string;
  m2_min?: string; m2_max?: string; re_seller?: string;
  garage?: string; pool?: string; elevator?: string; furnished?: string;
  pets_allowed?: string; air_conditioning?: string; grill?: string;
  security?: string; private_complex?: string; credit_eligible?: string;
  // electronics
  tech_group?: string; tech_type?: string; tech_brand?: string; tech_province?: string; tech_condition?: string;
  // phones
  phone_type?: string; phone_brand?: string; phone_storage?: string; phone_condition?: string;
  phone_ram?: string; phone_os?: string; phone_sim?: string; phone_province?: string;
  phone_box?: string; phone_charger?: string; phone_unlocked?: string; phone_trade?: string;
  // appliances
  appliance_type?: string; appliance_brand?: string; appliance_condition?: string; appliance_province?: string;
  // clothing
  clothing_type?: string; clothing_gender?: string; clothing_brand?: string; clothing_condition?: string; clothing_province?: string;
  // babies
  baby_type?: string; baby_brand?: string; baby_condition?: string; baby_province?: string;
  // beauty
  beauty_type?: string; beauty_brand?: string; beauty_condition?: string; beauty_province?: string;
  // home-garden
  hg_type?: string; hg_brand?: string; hg_condition?: string; hg_province?: string;
  // sports
  sport_type?: string; sport_brand?: string; sport_condition?: string; sport_province?: string;
  // tools
  tool_type?: string; tool_brand?: string; tool_condition?: string; tool_province?: string;
  // toys
  toy_type?: string; toy_brand?: string; toy_condition?: string; toy_province?: string;
  // books
  book_type?: string; book_condition?: string; book_province?: string;
  // pets
  pet_type?: string; pet_province?: string;
  // services
  serv_type?: string; serv_province?: string;
  // other
  other_type?: string; other_condition?: string;
  // price
  price_min?: string; price_max?: string;
  // view
  view?: string;
  // general FilterPanel params (aliases for category-specific ones)
  condition?: string;
  re_sub?: string;
  operation?: string;
  bedrooms?: string;
  size?: string;
};

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const meta = CATEGORY_META[slug];
  if (!meta) return { title: "Categoría" };
  return {
    title: `${meta.name} en San Juan`,
    description: `Comprá y vendé ${meta.name.toLowerCase()} en San Juan. Los mejores avisos clasificados en ComerxIA.`,
    alternates: { canonical: `/category/${slug}` },
    openGraph: {
      title: `${meta.name} en San Juan | ComerxIA`,
      description: `Encontrá ${meta.name.toLowerCase()} en San Juan. Marketplace con IA.`,
      type: "website",
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SP>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  const meta = CATEGORY_META[slug];
  if (!meta) notFound();

  const isVehicles = slug === "vehicles";
  const isRealEstate = slug === "real-estate";
  const isPhones = slug === "phones";
  const isElectronics = slug === "electronics";
  const isAppliances = slug === "appliances";
  const isClothing = slug === "clothing";
  const isBabies = slug === "babies";
  const isBeauty = slug === "beauty-health";
  const isHomeGarden = slug === "home-garden";
  const isSports = slug === "sports";
  const isTools = slug === "tools";
  const isToys = slug === "toys";
  const isBooks = slug === "books";
  const isPets = slug === "pets";
  const isServices = slug === "services";
  const isOther = slug === "other";

  const supabase = await createClient();

  // Get category id
  const { data: cat } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!cat) notFound();

  // Build query (cast to any to avoid TS deep instantiation error with many chained .eq calls)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = supabase
    .from("listings")
    .select(`id, title, price, currency, condition, neighborhood, created_at, attributes, featured_level, view_count, user_id, listing_images(url, position)`)
    .eq("status", "active")
    .eq("category_id", cat.id) as any;

  if (sp.q) {
    // Normalize: split into tokens and also generate a no-space variant
    // e.g. "CB500" → tokens ["CB500", "CB 500"] handled by requiring each word token
    const rawTokens = sp.q.trim().split(/\s+/).filter(Boolean);
    // Build a pattern that matches tokens with optional spaces between alphanumeric groups
    // e.g. "CB500" becomes "%CB%500%" to match "CB 500", "CB500", "CB-500"
    const buildFuzzyPattern = (token: string) => {
      // Insert % between letter/digit transitions to allow spaces/separators
      return "%" + token.replace(/([a-zA-Z])(\d)/g, "$1%$2").replace(/(\d)([a-zA-Z])/g, "$1%$2") + "%";
    };
    for (const token of rawTokens) {
      query = query.ilike("title", buildFuzzyPattern(token));
    }
  }
  if (sp.price_min) query = query.gte("price", Number(sp.price_min));
  if (sp.price_max) query = query.lte("price", Number(sp.price_max));
  // General condition filter (from FilterPanel)
  if (sp.condition) query = query.eq("condition", sp.condition);

  // Vehicle-specific JSON filters
  if (isVehicles) {
    const vehicleType = sp.sub_category || sp.type;
    if (vehicleType) query = query.eq("attributes->>sub_category" as any, vehicleType);
    if (sp.brand) query = query.eq("attributes->>brand" as any, sp.brand);
    if (sp.fuel) query = query.eq("attributes->>fuel" as any, sp.fuel);
    if (sp.transmission) query = query.eq("attributes->>transmission" as any, sp.transmission);
    if (sp.seller_type) query = query.eq("attributes->>seller_type" as any, sp.seller_type);
    if (sp.v_zone) {
      query = query.eq("attributes->>zone" as any, sp.v_zone);
    } else if (sp.v_province && RE_LOCATIONS[sp.v_province]) {
      const provinceZones = RE_LOCATIONS[sp.v_province].zones.map(z => z.value);
      query = query.in("attributes->>zone" as any, provinceZones);
    }
  }

  // Phones-specific JSON filters
  if (isPhones) {
    if (sp.phone_type) query = query.eq("attributes->>sub_category" as any, sp.phone_type);
    if (sp.phone_brand) query = query.eq("attributes->>brand" as any, sp.phone_brand);
    if (sp.phone_storage) query = query.eq("attributes->>storage" as any, sp.phone_storage.toLowerCase());
    if (sp.phone_condition) query = query.eq("condition", sp.phone_condition);
    if (sp.phone_ram) query = query.eq("attributes->>ram" as any, sp.phone_ram);
    if (sp.phone_os) query = query.eq("attributes->>os" as any, sp.phone_os);
    if (sp.phone_sim) query = query.eq("attributes->>sim_type" as any, sp.phone_sim);
    if (sp.phone_province) query = query.ilike("neighborhood", `%${sp.phone_province}%`);
  }

  // Electronics-specific JSON filters
  if (isElectronics) {
    if (sp.tech_type) query = query.eq("attributes->>sub_category" as any, sp.tech_type);
    else if (sp.tech_group && TECH_GROUPS[sp.tech_group]) query = query.in("attributes->>sub_category" as any, TECH_GROUPS[sp.tech_group].items);
    if (sp.tech_brand) query = query.eq("attributes->>brand" as any, sp.tech_brand);
    if (sp.tech_province) query = query.ilike("neighborhood", `%${sp.tech_province}%`);
    if (sp.tech_condition) query = query.eq("condition", sp.tech_condition);
  }

  // Appliances-specific JSON filters
  if (isAppliances) {
    if (sp.appliance_type) query = query.eq("attributes->>sub_category" as any, sp.appliance_type);
    if (sp.appliance_brand) query = query.eq("attributes->>brand" as any, sp.appliance_brand);
    if (sp.appliance_condition) query = query.eq("condition", sp.appliance_condition);
    if (sp.appliance_province) query = query.ilike("neighborhood", `%${sp.appliance_province}%`);
  }

  // Clothing-specific JSON filters
  if (isClothing) {
    if (sp.clothing_type) query = query.eq("attributes->>sub_category" as any, sp.clothing_type);
    if (sp.clothing_gender) query = query.eq("attributes->>gender" as any, sp.clothing_gender);
    if (sp.clothing_brand) query = query.eq("attributes->>brand" as any, sp.clothing_brand);
    if (sp.clothing_condition) query = query.eq("condition", sp.clothing_condition);
    if (sp.clothing_province) query = query.ilike("neighborhood", `%${sp.clothing_province}%`);
  }

  // Babies-specific JSON filters
  if (isBabies) {
    if (sp.baby_type) query = query.eq("attributes->>sub_category" as any, sp.baby_type);
    if (sp.baby_brand) query = query.eq("attributes->>brand" as any, sp.baby_brand);
    if (sp.baby_condition) query = query.eq("condition", sp.baby_condition);
    if (sp.baby_province) query = query.ilike("neighborhood", `%${sp.baby_province}%`);
  }

  // Beauty-specific JSON filters
  if (isBeauty) {
    if (sp.beauty_type) query = query.eq("attributes->>sub_category" as any, sp.beauty_type);
    if (sp.beauty_brand) query = query.eq("attributes->>brand" as any, sp.beauty_brand);
    if (sp.beauty_condition) query = query.eq("condition", sp.beauty_condition);
    if (sp.beauty_province) query = query.ilike("neighborhood", `%${sp.beauty_province}%`);
  }

  // Home-garden-specific JSON filters
  if (isHomeGarden) {
    if (sp.hg_type) query = query.eq("attributes->>sub_category" as any, sp.hg_type);
    if (sp.hg_brand) query = query.eq("attributes->>brand" as any, sp.hg_brand);
    if (sp.hg_condition) query = query.eq("condition", sp.hg_condition);
    if (sp.hg_province) query = query.ilike("neighborhood", `%${sp.hg_province}%`);
  }

  // Sports-specific JSON filters
  if (isSports) {
    if (sp.sport_type) query = query.eq("attributes->>sub_category" as any, sp.sport_type);
    if (sp.sport_brand) query = query.eq("attributes->>brand" as any, sp.sport_brand);
    if (sp.sport_condition) query = query.eq("condition", sp.sport_condition);
    if (sp.sport_province) query = query.ilike("neighborhood", `%${sp.sport_province}%`);
  }

  // Tools-specific JSON filters
  if (isTools) {
    if (sp.tool_type) query = query.eq("attributes->>sub_category" as any, sp.tool_type);
    if (sp.tool_brand) query = query.eq("attributes->>brand" as any, sp.tool_brand);
    if (sp.tool_condition) query = query.eq("condition", sp.tool_condition);
    if (sp.tool_province) query = query.ilike("neighborhood", `%${sp.tool_province}%`);
  }

  // Toys-specific JSON filters
  if (isToys) {
    if (sp.toy_type) query = query.eq("attributes->>sub_category" as any, sp.toy_type);
    if (sp.toy_brand) query = query.eq("attributes->>brand" as any, sp.toy_brand);
    if (sp.toy_condition) query = query.eq("condition", sp.toy_condition);
    if (sp.toy_province) query = query.ilike("neighborhood", `%${sp.toy_province}%`);
  }

  // Books-specific JSON filters
  if (isBooks) {
    if (sp.book_type) query = query.eq("attributes->>sub_category" as any, sp.book_type);
    if (sp.book_condition) query = query.eq("condition", sp.book_condition);
    if (sp.book_province) query = query.ilike("neighborhood", `%${sp.book_province}%`);
  }

  // Pets-specific JSON filters
  if (isPets) {
    if (sp.pet_type) query = query.eq("attributes->>sub_category" as any, sp.pet_type);
    if (sp.pet_province) query = query.ilike("neighborhood", `%${sp.pet_province}%`);
  }

  // Services-specific JSON filters
  if (isServices) {
    if (sp.serv_type) query = query.eq("attributes->>sub_category" as any, sp.serv_type);
    if (sp.serv_province) query = query.ilike("neighborhood", `%${sp.serv_province}%`);
  }

  // Other-specific filters
  if (isOther) {
    if (sp.other_type) query = query.eq("attributes->>sub_category" as any, sp.other_type);
    if (sp.other_condition) query = query.eq("condition", sp.other_condition);
  }

  // Real-estate-specific JSON filters
  if (isRealEstate) {
    const reSub = sp.re_sub || sp.re_type;
    const reOp  = sp.operation || sp.re_operation;
    const reBed = sp.bedrooms || sp.re_bedrooms;
    if (reSub) query = query.eq("attributes->>sub_category" as any, reSub);
    if (reOp)  query = query.eq("attributes->>operation" as any, reOp);
    if (sp.re_zone) {
      query = query.eq("attributes->>zone" as any, sp.re_zone);
    } else if (sp.re_province && RE_LOCATIONS[sp.re_province]) {
      const provinceZones = RE_LOCATIONS[sp.re_province].zones.map(z => z.value);
      query = query.in("attributes->>zone" as any, provinceZones);
    }
    if (reBed) query = query.eq("attributes->>bedrooms" as any, reBed);
    if (sp.re_bathrooms) query = query.eq("attributes->>bathrooms" as any, sp.re_bathrooms);
    if (sp.re_seller) query = query.eq("attributes->>seller_type" as any, sp.re_seller);
  }

  // featured_level sorted in JS after fetch (gold > silver > bronze > null)
  if (sp.order === "price_asc") query = query.order("price", { ascending: true });
  else if (sp.order === "price_desc") query = query.order("price", { ascending: false });
  else if (sp.order === "views") query = query.order("view_count", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  const FEAT_ORDER: Record<string, number> = { gold: 0, silver: 1, bronze: 2 };
  const { data: rawListings } = await (query as any).limit(200);

  // Fetch store info separately (FK join causes empty results when FK constraint is missing)
  const userIds = [...new Set(((rawListings as any[]) ?? []).map((l: any) => l.user_id).filter(Boolean))];
  const { data: storeProfiles } = userIds.length > 0
    ? await supabase.from("profiles").select("id, is_store, store_name").in("id", userIds)
    : { data: [] };
  const storeMap: Record<string, { is_store: boolean; store_name: string | null }> = {};
  for (const p of (storeProfiles ?? [])) (storeMap as any)[p.id] = p;

  // Numeric and boolean filters done in JS (PostgREST can't reliably cast JSONB text fields)
  const RE_FEAT_KEYS = RE_FEATURES.map(f => f.key);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filtered = (rawListings as any[])?.filter((l: any) => {
    const a = (l.attributes as any) ?? {};
    if (sp.km_max) {
      const km = Number(a.km);
      if (!isNaN(km) && km > Number(sp.km_max)) return false;
    }
    if (sp.year_from) {
      const year = Number(a.year);
      if (!isNaN(year) && year < Number(sp.year_from)) return false;
    }
    if (sp.year_to) {
      const year = Number(a.year);
      if (!isNaN(year) && year > Number(sp.year_to)) return false;
    }
    if (isRealEstate) {
      if (sp.m2_min) { const m2 = Number(a.m2_covered); if (!isNaN(m2) && m2 < Number(sp.m2_min)) return false; }
      if (sp.m2_max) { const m2 = Number(a.m2_covered); if (!isNaN(m2) && m2 > Number(sp.m2_max)) return false; }
      for (const feat of RE_FEAT_KEYS) {
        if ((sp as any)[feat] === "1" && !a[feat]) return false;
      }
    }
    if (isPhones) {
      if (sp.phone_box === "1" && !a.includes_box) return false;
      if (sp.phone_charger === "1" && !a.includes_charger) return false;
      if (sp.phone_unlocked === "1" && !a.unlocked) return false;
      if (sp.phone_trade === "1" && !a.accepts_trade) return false;
    }
    // General FilterPanel filters
    if (sp.size && a.size !== sp.size) return false;
    return true;
  });
  const listings = filtered?.slice().sort((a: any, b: any) => {
    if (sp.order === "price_asc") return (a.price ?? 0) - (b.price ?? 0);
    if (sp.order === "price_desc") return (b.price ?? 0) - (a.price ?? 0);
    if (sp.order === "views") return (b.view_count ?? 0) - (a.view_count ?? 0);
    // Default: featured first (gold > silver > bronze > null)
    const fa = FEAT_ORDER[a.featured_level ?? ""] ?? 3;
    const fb = FEAT_ORDER[b.featured_level ?? ""] ?? 3;
    return fa - fb;
  }) ?? [];

  // Count per brand/type for vehicles; per property type for real estate; per type/brand for electronics
  let brandCounts: Record<string, number> = {};
  let typeCounts: Record<string, number> = {};
  let reTypeCounts: Record<string, number> = {};
  let techGroupCounts: Record<string, number> = {};
  let techTypeCounts: Record<string, number> = {};
  let techBrandCounts: Record<string, number> = {};
  let techProvinceCounts: Record<string, number> = {};
  let techConditionCounts: Record<string, number> = {};
  let phoneBrandCounts: Record<string, number> = {};
  let phoneTypeCounts: Record<string, number> = {};
  let phoneStorageCounts: Record<string, number> = {};
  let phoneRamCounts: Record<string, number> = {};
  let phoneOsCounts: Record<string, number> = {};
  let phoneSimCounts: Record<string, number> = {};
  let phoneConditionCounts: Record<string, number> = {};
  let phoneProvinceCounts: Record<string, number> = {};
  let applianceTypeCounts: Record<string, number> = {};
  let applianceBrandCounts: Record<string, number> = {};
  let applianceConditionCounts: Record<string, number> = {};
  let applianceProvinceCounts: Record<string, number> = {};
  let clothingTypeCounts: Record<string, number> = {};
  let clothingGenderCounts: Record<string, number> = {};
  let clothingBrandCounts: Record<string, number> = {};
  let clothingConditionCounts: Record<string, number> = {};
  let clothingProvinceCounts: Record<string, number> = {};
  let babyTypeCounts: Record<string, number> = {};
  let babyBrandCounts: Record<string, number> = {};
  let babyConditionCounts: Record<string, number> = {};
  let babyProvinceCounts: Record<string, number> = {};
  let beautyTypeCounts: Record<string, number> = {};
  let beautyBrandCounts: Record<string, number> = {};
  let beautyConditionCounts: Record<string, number> = {};
  let beautyProvinceCounts: Record<string, number> = {};
  let hgTypeCounts: Record<string, number> = {};
  let hgBrandCounts: Record<string, number> = {};
  let hgConditionCounts: Record<string, number> = {};
  let hgProvinceCounts: Record<string, number> = {};
  let sportTypeCounts: Record<string, number> = {};
  let sportBrandCounts: Record<string, number> = {};
  let sportConditionCounts: Record<string, number> = {};
  let sportProvinceCounts: Record<string, number> = {};
  let toolTypeCounts: Record<string, number> = {};
  let toolBrandCounts: Record<string, number> = {};
  let toolConditionCounts: Record<string, number> = {};
  let toolProvinceCounts: Record<string, number> = {};
  let toyTypeCounts: Record<string, number> = {};
  let toyBrandCounts: Record<string, number> = {};
  let toyConditionCounts: Record<string, number> = {};
  let toyProvinceCounts: Record<string, number> = {};
  let bookTypeCounts: Record<string, number> = {};
  let bookConditionCounts: Record<string, number> = {};
  let bookProvinceCounts: Record<string, number> = {};
  let petTypeCounts: Record<string, number> = {};
  let petProvinceCounts: Record<string, number> = {};
  let servTypeCounts: Record<string, number> = {};
  let servProvinceCounts: Record<string, number> = {};
  let otherTypeCounts: Record<string, number> = {};
  let otherConditionCounts: Record<string, number> = {};
  let vProvinceCounts: Record<string, number> = {};
  let vZoneCounts: Record<string, number> = {};
  if (isVehicles || isRealEstate || isElectronics || isPhones || isAppliances || isClothing || isBabies || isBeauty || isHomeGarden || isSports || isTools || isToys || isBooks || isPets || isServices || isOther) {
    const { data: all } = await supabase
      .from("listings")
      .select("attributes, condition, neighborhood")
      .eq("status", "active")
      .eq("category_id", cat.id);
    for (const row of all ?? []) {
      const t = (row.attributes as any)?.sub_category;
      if (isVehicles) {
        const b = (row.attributes as any)?.brand;
        const zone = (row.attributes as any)?.zone as string | undefined;
        if (t) typeCounts[t] = (typeCounts[t] ?? 0) + 1;
        // Filter brands by selected type
        const activeVType = sp.sub_category || sp.type;
        if (b && (!activeVType || t === activeVType)) brandCounts[b] = (brandCounts[b] ?? 0) + 1;
        // Province/zone counts
        if (zone) {
          const provKey = Object.entries(RE_LOCATIONS).find(([, p]) => p.zones.some(z => z.value === zone))?.[0];
          if (provKey) {
            vProvinceCounts[provKey] = (vProvinceCounts[provKey] ?? 0) + 1;
            if (!sp.v_province || sp.v_province === provKey) {
              vZoneCounts[zone] = (vZoneCounts[zone] ?? 0) + 1;
            }
          }
        }
      }
      if (isRealEstate && t) reTypeCounts[t] = (reTypeCounts[t] ?? 0) + 1;
      if (isElectronics) {
        const b = (row.attributes as any)?.brand;
        if (t) {
          techTypeCounts[t] = (techTypeCounts[t] ?? 0) + 1;
          const grp = SUBCAT_TO_GROUP[t];
          if (grp) techGroupCounts[grp] = (techGroupCounts[grp] ?? 0) + 1;
        }
        const groupItems = sp.tech_group ? TECH_GROUPS[sp.tech_group]?.items ?? [] : null;
        const typeMatchesGroup = !groupItems || (t && groupItems.includes(t));
        if (b && (!sp.tech_type || t === sp.tech_type) && typeMatchesGroup) techBrandCounts[b] = (techBrandCounts[b] ?? 0) + 1;
        const nb = (row as any).neighborhood as string | undefined;
        if (nb && (!sp.tech_type || t === sp.tech_type) && typeMatchesGroup && (!sp.tech_brand || b === sp.tech_brand)) {
          const prov = nb.includes(",") ? nb.split(",").pop()!.trim() : nb.trim();
          if (prov) techProvinceCounts[prov] = (techProvinceCounts[prov] ?? 0) + 1;
        }
        const cond = (row as any).condition;
        if (cond && (!sp.tech_type || t === sp.tech_type) && typeMatchesGroup && (!sp.tech_brand || b === sp.tech_brand)) {
          techConditionCounts[cond] = (techConditionCounts[cond] ?? 0) + 1;
        }
      }
      if (isPhones) {
        const b = (row.attributes as any)?.brand;
        const storage = (row.attributes as any)?.storage;
        const ram = (row.attributes as any)?.ram;
        const os = (row.attributes as any)?.os;
        const sim = (row.attributes as any)?.sim_type;
        if (t) phoneTypeCounts[t] = (phoneTypeCounts[t] ?? 0) + 1;
        if (b) phoneBrandCounts[b] = (phoneBrandCounts[b] ?? 0) + 1;
        if (storage) phoneStorageCounts[storage] = (phoneStorageCounts[storage] ?? 0) + 1;
        if (ram) phoneRamCounts[ram] = (phoneRamCounts[ram] ?? 0) + 1;
        if (os) phoneOsCounts[os] = (phoneOsCounts[os] ?? 0) + 1;
        if (sim) phoneSimCounts[sim] = (phoneSimCounts[sim] ?? 0) + 1;
        const cond = (row as any).condition;
        if (cond) phoneConditionCounts[cond] = (phoneConditionCounts[cond] ?? 0) + 1;
        const nb = (row as any).neighborhood as string | undefined;
        if (nb) {
          const prov = nb.includes(",") ? nb.split(",").pop()!.trim() : nb.trim();
          if (prov) phoneProvinceCounts[prov] = (phoneProvinceCounts[prov] ?? 0) + 1;
        }
      }
      if (isAppliances) {
        const b = (row.attributes as any)?.brand;
        if (t) applianceTypeCounts[t] = (applianceTypeCounts[t] ?? 0) + 1;
        if (b && (!sp.appliance_type || t === sp.appliance_type)) applianceBrandCounts[b] = (applianceBrandCounts[b] ?? 0) + 1;
        const cond = (row as any).condition;
        if (cond && (!sp.appliance_type || t === sp.appliance_type) && (!sp.appliance_brand || b === sp.appliance_brand)) {
          applianceConditionCounts[cond] = (applianceConditionCounts[cond] ?? 0) + 1;
        }
        const nb = (row as any).neighborhood as string | undefined;
        if (nb && (!sp.appliance_type || t === sp.appliance_type) && (!sp.appliance_brand || b === sp.appliance_brand)) {
          const prov = nb.includes(",") ? nb.split(",").pop()!.trim() : nb.trim();
          if (prov) applianceProvinceCounts[prov] = (applianceProvinceCounts[prov] ?? 0) + 1;
        }
      }
      if (isClothing) {
        const b = (row.attributes as any)?.brand as string | undefined;
        const g = (row.attributes as any)?.gender as string | undefined;
        if (t) clothingTypeCounts[t] = (clothingTypeCounts[t] ?? 0) + 1;
        if (g && (!sp.clothing_type || t === sp.clothing_type)) clothingGenderCounts[g] = (clothingGenderCounts[g] ?? 0) + 1;
        if (b && (!sp.clothing_type || t === sp.clothing_type) && (!sp.clothing_gender || g === sp.clothing_gender)) {
          clothingBrandCounts[b.trim()] = (clothingBrandCounts[b.trim()] ?? 0) + 1;
        }
        const cond = (row as any).condition;
        if (cond && (!sp.clothing_type || t === sp.clothing_type) && (!sp.clothing_gender || g === sp.clothing_gender)) {
          clothingConditionCounts[cond] = (clothingConditionCounts[cond] ?? 0) + 1;
        }
        const nb = (row as any).neighborhood as string | undefined;
        if (nb && (!sp.clothing_type || t === sp.clothing_type) && (!sp.clothing_gender || g === sp.clothing_gender)) {
          const prov = nb.includes(",") ? nb.split(",").pop()!.trim() : nb.trim();
          if (prov) clothingProvinceCounts[prov] = (clothingProvinceCounts[prov] ?? 0) + 1;
        }
      }
      if (isBabies) {
        const b = (row.attributes as any)?.brand;
        if (t) babyTypeCounts[t] = (babyTypeCounts[t] ?? 0) + 1;
        if (b && (!sp.baby_type || t === sp.baby_type)) babyBrandCounts[b] = (babyBrandCounts[b] ?? 0) + 1;
        const cond = (row as any).condition;
        if (cond && (!sp.baby_type || t === sp.baby_type) && (!sp.baby_brand || b === sp.baby_brand)) {
          babyConditionCounts[cond] = (babyConditionCounts[cond] ?? 0) + 1;
        }
        const nb = (row as any).neighborhood as string | undefined;
        if (nb && (!sp.baby_type || t === sp.baby_type) && (!sp.baby_brand || b === sp.baby_brand)) {
          const prov = nb.includes(",") ? nb.split(",").pop()!.trim() : nb.trim();
          if (prov) babyProvinceCounts[prov] = (babyProvinceCounts[prov] ?? 0) + 1;
        }
      }
      if (isBeauty) {
        const b = (row.attributes as any)?.brand;
        if (t) beautyTypeCounts[t] = (beautyTypeCounts[t] ?? 0) + 1;
        if (b && (!sp.beauty_type || t === sp.beauty_type)) beautyBrandCounts[b] = (beautyBrandCounts[b] ?? 0) + 1;
        const cond = (row as any).condition;
        if (cond && (!sp.beauty_type || t === sp.beauty_type) && (!sp.beauty_brand || b === sp.beauty_brand)) {
          beautyConditionCounts[cond] = (beautyConditionCounts[cond] ?? 0) + 1;
        }
        const nb = (row as any).neighborhood as string | undefined;
        if (nb && (!sp.beauty_type || t === sp.beauty_type) && (!sp.beauty_brand || b === sp.beauty_brand)) {
          const prov = nb.includes(",") ? nb.split(",").pop()!.trim() : nb.trim();
          if (prov) beautyProvinceCounts[prov] = (beautyProvinceCounts[prov] ?? 0) + 1;
        }
      }
      if (isHomeGarden) {
        const b = (row.attributes as any)?.brand;
        if (t) hgTypeCounts[t] = (hgTypeCounts[t] ?? 0) + 1;
        if (b && (!sp.hg_type || t === sp.hg_type)) hgBrandCounts[b] = (hgBrandCounts[b] ?? 0) + 1;
        const cond = (row as any).condition;
        if (cond && (!sp.hg_type || t === sp.hg_type) && (!sp.hg_brand || b === sp.hg_brand)) {
          hgConditionCounts[cond] = (hgConditionCounts[cond] ?? 0) + 1;
        }
        const nb = (row as any).neighborhood as string | undefined;
        if (nb && (!sp.hg_type || t === sp.hg_type) && (!sp.hg_brand || b === sp.hg_brand)) {
          const prov = nb.includes(",") ? nb.split(",").pop()!.trim() : nb.trim();
          if (prov) hgProvinceCounts[prov] = (hgProvinceCounts[prov] ?? 0) + 1;
        }
      }
      if (isSports) {
        const b = (row.attributes as any)?.brand;
        if (t) sportTypeCounts[t] = (sportTypeCounts[t] ?? 0) + 1;
        if (b && (!sp.sport_type || t === sp.sport_type)) sportBrandCounts[b] = (sportBrandCounts[b] ?? 0) + 1;
        const cond = (row as any).condition;
        if (cond && (!sp.sport_type || t === sp.sport_type) && (!sp.sport_brand || b === sp.sport_brand)) {
          sportConditionCounts[cond] = (sportConditionCounts[cond] ?? 0) + 1;
        }
        const nb = (row as any).neighborhood as string | undefined;
        if (nb && (!sp.sport_type || t === sp.sport_type) && (!sp.sport_brand || b === sp.sport_brand)) {
          const prov = nb.includes(",") ? nb.split(",").pop()!.trim() : nb.trim();
          if (prov) sportProvinceCounts[prov] = (sportProvinceCounts[prov] ?? 0) + 1;
        }
      }
      if (isTools) {
        const b = (row.attributes as any)?.brand;
        if (t) toolTypeCounts[t] = (toolTypeCounts[t] ?? 0) + 1;
        if (b && (!sp.tool_type || t === sp.tool_type)) toolBrandCounts[b] = (toolBrandCounts[b] ?? 0) + 1;
        const cond = (row as any).condition;
        if (cond && (!sp.tool_type || t === sp.tool_type) && (!sp.tool_brand || b === sp.tool_brand)) {
          toolConditionCounts[cond] = (toolConditionCounts[cond] ?? 0) + 1;
        }
        const nb = (row as any).neighborhood as string | undefined;
        if (nb && (!sp.tool_type || t === sp.tool_type) && (!sp.tool_brand || b === sp.tool_brand)) {
          const prov = nb.includes(",") ? nb.split(",").pop()!.trim() : nb.trim();
          if (prov) toolProvinceCounts[prov] = (toolProvinceCounts[prov] ?? 0) + 1;
        }
      }
      if (isToys) {
        const b = (row.attributes as any)?.brand;
        if (t) toyTypeCounts[t] = (toyTypeCounts[t] ?? 0) + 1;
        if (b && (!sp.toy_type || t === sp.toy_type)) toyBrandCounts[b] = (toyBrandCounts[b] ?? 0) + 1;
        const cond = (row as any).condition;
        if (cond && (!sp.toy_type || t === sp.toy_type) && (!sp.toy_brand || b === sp.toy_brand)) {
          toyConditionCounts[cond] = (toyConditionCounts[cond] ?? 0) + 1;
        }
        const nb = (row as any).neighborhood as string | undefined;
        if (nb && (!sp.toy_type || t === sp.toy_type) && (!sp.toy_brand || b === sp.toy_brand)) {
          const prov = nb.includes(",") ? nb.split(",").pop()!.trim() : nb.trim();
          if (prov) toyProvinceCounts[prov] = (toyProvinceCounts[prov] ?? 0) + 1;
        }
      }
      if (isBooks) {
        if (t) bookTypeCounts[t] = (bookTypeCounts[t] ?? 0) + 1;
        const cond = (row as any).condition;
        if (cond && (!sp.book_type || t === sp.book_type)) {
          bookConditionCounts[cond] = (bookConditionCounts[cond] ?? 0) + 1;
        }
        const nb = (row as any).neighborhood as string | undefined;
        if (nb && (!sp.book_type || t === sp.book_type)) {
          const prov = nb.includes(",") ? nb.split(",").pop()!.trim() : nb.trim();
          if (prov) bookProvinceCounts[prov] = (bookProvinceCounts[prov] ?? 0) + 1;
        }
      }
      if (isPets) {
        if (t) petTypeCounts[t] = (petTypeCounts[t] ?? 0) + 1;
        const nb = (row as any).neighborhood as string | undefined;
        if (nb && (!sp.pet_type || t === sp.pet_type)) {
          const prov = nb.includes(",") ? nb.split(",").pop()!.trim() : nb.trim();
          if (prov) petProvinceCounts[prov] = (petProvinceCounts[prov] ?? 0) + 1;
        }
      }
      if (isServices) {
        if (t) servTypeCounts[t] = (servTypeCounts[t] ?? 0) + 1;
        const nb = (row as any).neighborhood as string | undefined;
        if (nb && (!sp.serv_type || t === sp.serv_type)) {
          const prov = nb.includes(",") ? nb.split(",").pop()!.trim() : nb.trim();
          if (prov) servProvinceCounts[prov] = (servProvinceCounts[prov] ?? 0) + 1;
        }
      }
      if (isOther) {
        if (t) otherTypeCounts[t] = (otherTypeCounts[t] ?? 0) + 1;
        const cond = (row as any).condition;
        if (cond) otherConditionCounts[cond] = (otherConditionCounts[cond] ?? 0) + 1;
      }
    }
  }

  function buildUrl(overrides: Partial<SP & { order: string }>) {
    const merged: Record<string, string | undefined> = {
      q: sp.q, order: sp.order,
      // vehicle
      type: sp.type, sub_category: sp.sub_category, brand: sp.brand, model: sp.model,
      year_from: sp.year_from, year_to: sp.year_to,
      km_max: sp.km_max, fuel: sp.fuel, transmission: sp.transmission,
      seller_type: sp.seller_type, v_province: sp.v_province, v_zone: sp.v_zone,
      // real estate
      re_type: sp.re_type, re_operation: sp.re_operation, re_province: sp.re_province, re_zone: sp.re_zone,
      re_bedrooms: sp.re_bedrooms, re_bathrooms: sp.re_bathrooms,
      m2_min: sp.m2_min, m2_max: sp.m2_max, re_seller: sp.re_seller,
      garage: sp.garage, pool: sp.pool, elevator: sp.elevator, furnished: sp.furnished,
      pets_allowed: sp.pets_allowed, air_conditioning: sp.air_conditioning,
      grill: sp.grill, security: sp.security, private_complex: sp.private_complex,
      credit_eligible: sp.credit_eligible,
      // electronics
      tech_group: sp.tech_group, tech_type: sp.tech_type, tech_brand: sp.tech_brand, tech_province: sp.tech_province, tech_condition: sp.tech_condition,
      // phones
      phone_type: sp.phone_type, phone_brand: sp.phone_brand, phone_storage: sp.phone_storage, phone_condition: sp.phone_condition,
      phone_ram: sp.phone_ram, phone_os: sp.phone_os, phone_sim: sp.phone_sim, phone_province: sp.phone_province,
      phone_box: sp.phone_box, phone_charger: sp.phone_charger, phone_unlocked: sp.phone_unlocked, phone_trade: sp.phone_trade,
      // appliances
      appliance_type: sp.appliance_type, appliance_brand: sp.appliance_brand, appliance_condition: sp.appliance_condition, appliance_province: sp.appliance_province,
      // clothing
      clothing_type: sp.clothing_type, clothing_gender: sp.clothing_gender, clothing_brand: sp.clothing_brand, clothing_condition: sp.clothing_condition, clothing_province: sp.clothing_province,
      // babies
      baby_type: sp.baby_type, baby_brand: sp.baby_brand, baby_condition: sp.baby_condition, baby_province: sp.baby_province,
      // beauty
      beauty_type: sp.beauty_type, beauty_brand: sp.beauty_brand, beauty_condition: sp.beauty_condition, beauty_province: sp.beauty_province,
      // home-garden
      hg_type: sp.hg_type, hg_brand: sp.hg_brand, hg_condition: sp.hg_condition, hg_province: sp.hg_province,
      // sports
      sport_type: sp.sport_type, sport_brand: sp.sport_brand, sport_condition: sp.sport_condition, sport_province: sp.sport_province,
      // tools
      tool_type: sp.tool_type, tool_brand: sp.tool_brand, tool_condition: sp.tool_condition, tool_province: sp.tool_province,
      // toys
      toy_type: sp.toy_type, toy_brand: sp.toy_brand, toy_condition: sp.toy_condition, toy_province: sp.toy_province,
      // books
      book_type: sp.book_type, book_condition: sp.book_condition, book_province: sp.book_province,
      // pets
      pet_type: sp.pet_type, pet_province: sp.pet_province,
      // services
      serv_type: sp.serv_type, serv_province: sp.serv_province,
      // other
      other_type: sp.other_type, other_condition: sp.other_condition,
      // price
      price_min: sp.price_min, price_max: sp.price_max,
      // view
      view: sp.view,
      // FilterPanel general params
      condition: sp.condition, re_sub: sp.re_sub, operation: sp.operation, bedrooms: sp.bedrooms, size: sp.size,
      ...overrides as Record<string, string | undefined>,
    };
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    const s = p.toString();
    return `/category/${slug}${s ? `?${s}` : ""}`;
  }

  const hasFilters = Object.values(sp).some(Boolean);

  // ── Subcategory pills (mobile only) — maps each category to its type param + label list
  const CLOTHING_TYPES_INLINE = [
    { value: "ropa", label: "Ropa" }, { value: "calzado", label: "Calzado" },
    { value: "accesorio", label: "Accesorios" }, { value: "bolso", label: "Bolso / Cartera" },
  ];
  const subcatPillsConfig: { typeParam: string | undefined; clearOverride: Record<string, undefined>; types: { value: string; label: string }[]; counts: Record<string, number> } | null = (() => {
    if (isVehicles)    return { typeParam: sp.type,           clearOverride: { type: undefined },                         types: VEHICLE_TYPES,           counts: typeCounts };
    if (isRealEstate)  return { typeParam: sp.re_type,        clearOverride: { re_type: undefined },                      types: RE_PROPERTY_TYPES,       counts: reTypeCounts };
    if (isPhones)      return { typeParam: sp.phone_type,     clearOverride: { phone_type: undefined },                   types: PHONE_TYPES,             counts: phoneTypeCounts };
    if (isElectronics) return { typeParam: sp.tech_group,     clearOverride: { tech_group: undefined, tech_type: undefined }, types: Object.entries(TECH_GROUPS).map(([v, g]) => ({ value: v, label: g.label })), counts: techGroupCounts };
    if (isAppliances)  return { typeParam: sp.appliance_type, clearOverride: { appliance_type: undefined },               types: APPLIANCE_TYPES,         counts: applianceTypeCounts };
    if (isClothing)    return { typeParam: sp.clothing_type,  clearOverride: { clothing_type: undefined },                types: CLOTHING_TYPES_INLINE,   counts: clothingTypeCounts };
    if (isBabies)      return { typeParam: sp.baby_type,      clearOverride: { baby_type: undefined },                   types: BABY_TYPES,              counts: babyTypeCounts };
    if (isBeauty)      return { typeParam: sp.beauty_type,    clearOverride: { beauty_type: undefined },                  types: BEAUTY_TYPES,            counts: beautyTypeCounts };
    if (isHomeGarden)  return { typeParam: sp.hg_type,        clearOverride: { hg_type: undefined },                     types: HG_TYPES,                counts: hgTypeCounts };
    if (isSports)      return { typeParam: sp.sport_type,     clearOverride: { sport_type: undefined },                  types: SPORTS_TYPES,            counts: sportTypeCounts };
    if (isTools)       return { typeParam: sp.tool_type,      clearOverride: { tool_type: undefined },                   types: TOOLS_TYPES,             counts: toolTypeCounts };
    if (isToys)        return { typeParam: sp.toy_type,       clearOverride: { toy_type: undefined },                    types: TOYS_TYPES,              counts: toyTypeCounts };
    if (isBooks)       return { typeParam: sp.book_type,      clearOverride: { book_type: undefined },                   types: BOOKS_TYPES,             counts: bookTypeCounts };
    if (isPets)        return { typeParam: sp.pet_type,       clearOverride: { pet_type: undefined },                    types: PETS_TYPES,              counts: petTypeCounts };
    if (isServices)    return { typeParam: sp.serv_type,      clearOverride: { serv_type: undefined },                   types: SERVICES_TYPES,          counts: servTypeCounts };
    if (isOther)       return { typeParam: sp.other_type,     clearOverride: { other_type: undefined },                  types: OTHER_TYPES,             counts: otherTypeCounts };
    return null;
  })();

  // For the "select" href we set the first key from clearOverride to t.value (reset others)
  const subcatPills: SubcatPill[] = subcatPillsConfig
    ? subcatPillsConfig.types
        .filter(t => (subcatPillsConfig.counts[t.value] ?? 0) > 0)
        .map(t => {
          const selectOverride: Record<string, string | undefined> = { ...subcatPillsConfig.clearOverride };
          // Set first key to the selected value
          selectOverride[Object.keys(selectOverride)[0]] = t.value;
          return {
            name: t.label,
            href: buildUrl(selectOverride as any),
            count: subcatPillsConfig.counts[t.value] ?? 0,
            active: subcatPillsConfig.typeParam === t.value,
          };
        })
    : [];
  const subcatAllHref = subcatPillsConfig ? buildUrl(subcatPillsConfig.clearOverride as any) : `/category/${slug}`;
  const subcatIsAllActive = !subcatPillsConfig?.typeParam;

  // ── Filter chip helper
  function FilterSection({ title }: { title: string; children: React.ReactNode }) {
    return null; // just for type reference
  }

  return (
    <div className="category-page-wrapper" style={{ maxWidth: "1400px", margin: "0 auto", padding: "16px 16px 0" }}>
    <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>


      <div className="listing-layout">

        {/* ── Sidebar ── */}
        <aside className="listing-sidebar">

          {/* Vehicle type tabs */}
          {isVehicles && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Tipo de vehículo
              </div>
              {VEHICLE_TYPES.filter(t => typeCounts[t.value] > 0).map((t) => {
                const active = sp.type === t.value;
                return (
                  <Link key={t.value} href={buildUrl({ type: active ? undefined : t.value })} style={{ textDecoration: "none" }}>
                    <div style={{
                      padding: "9px 16px", fontSize: "13px", cursor: "pointer",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      background: active ? "#eff6ff" : "transparent",
                      color: active ? "#2563eb" : "#444",
                      fontWeight: active ? 700 : 400,
                      borderLeft: active ? "3px solid #2563eb" : "3px solid transparent",
                    }}>
                      <span>{t.label}</span>
                      <span style={{
                        fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px",
                        background: active ? "#dbeafe" : "#f1f5f9",
                        color: active ? "#2563eb" : "#888",
                      }}>{typeCounts[t.value]}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Brand */}
          {isVehicles && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Marca
              </div>
              <div style={{ maxHeight: "260px", overflowY: "auto" }}>
                {VEHICLE_BRANDS.filter(b => brandCounts[b.value] > 0).map((b) => {
                  const active = sp.brand === b.value;
                  return (
                    <Link key={b.value} href={buildUrl({ brand: active ? undefined : b.value })} style={{ textDecoration: "none" }}>
                      <div style={{
                        padding: "8px 16px", fontSize: "13px", cursor: "pointer",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        background: active ? "#eff6ff" : "transparent",
                        color: active ? "#2563eb" : "#444",
                        fontWeight: active ? 700 : 400,
                        borderLeft: active ? "3px solid #2563eb" : "3px solid transparent",
                      }}>
                        <span>{b.label}</span>
                        <span style={{
                          fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px",
                          background: active ? "#dbeafe" : "#f1f5f9",
                          color: active ? "#2563eb" : "#888",
                        }}>{brandCounts[b.value]}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Year range (vehicles) */}
          {isVehicles && (
            <form method="GET" action={`/category/${slug}`} style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              {Object.entries(sp).map(([k, v]) =>
                v && k !== "year_from" && k !== "year_to"
                  ? <input key={k} type="hidden" name={k} value={v} />
                  : null
              )}
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Año
              </div>
              <div style={{ padding: "12px 16px", display: "flex", gap: "8px" }}>
                <input name="year_from" type="number" defaultValue={sp.year_from} placeholder="Desde"
                  style={{ border: "1.5px solid #e2e8f0", borderRadius: "6px", padding: "7px 8px", fontSize: "13px", outline: "none", width: "50%", boxSizing: "border-box" as const }} />
                <input name="year_to" type="number" defaultValue={sp.year_to} placeholder="Hasta"
                  style={{ border: "1.5px solid #e2e8f0", borderRadius: "6px", padding: "7px 8px", fontSize: "13px", outline: "none", width: "50%", boxSizing: "border-box" as const }} />
              </div>
              <div style={{ padding: "0 16px 12px" }}>
                <button type="submit" style={{
                  background: "#2563eb", color: "#fff", border: "none", borderRadius: "6px",
                  padding: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer", width: "100%",
                }}>Aplicar</button>
              </div>
            </form>
          )}

          {/* KM max */}
          {isVehicles && (
            <form method="GET" action={`/category/${slug}`} style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              {Object.entries(sp).map(([k, v]) =>
                v && k !== "km_max" ? <input key={k} type="hidden" name={k} value={v} /> : null
              )}
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Kilómetros (máx.)
              </div>
              <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                {[50000, 100000, 150000, 200000].map(km => (
                  <Link key={km} href={buildUrl({ km_max: sp.km_max === String(km) ? undefined : String(km) })} style={{ textDecoration: "none" }}>
                    <div style={{
                      padding: "7px 10px", borderRadius: "6px", fontSize: "13px", cursor: "pointer",
                      background: sp.km_max === String(km) ? "#eff6ff" : "#f8fafc",
                      color: sp.km_max === String(km) ? "#2563eb" : "#444",
                      fontWeight: sp.km_max === String(km) ? 700 : 400,
                      border: sp.km_max === String(km) ? "1.5px solid #bfdbfe" : "1.5px solid transparent",
                    }}>
                      Hasta {km.toLocaleString("es-AR")} km
                    </div>
                  </Link>
                ))}
              </div>
            </form>
          )}

          {/* Fuel */}
          {isVehicles && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Combustible
              </div>
              {FUELS.map(f => {
                const active = sp.fuel === f.value;
                return (
                  <Link key={f.value} href={buildUrl({ fuel: active ? undefined : f.value })} style={{ textDecoration: "none" }}>
                    <div style={{
                      padding: "8px 16px", fontSize: "13px", cursor: "pointer",
                      background: active ? "#eff6ff" : "transparent",
                      color: active ? "#2563eb" : "#444",
                      fontWeight: active ? 700 : 400,
                      borderLeft: active ? "3px solid #2563eb" : "3px solid transparent",
                    }}>
                      {f.label}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Transmission */}
          {isVehicles && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Transmisión
              </div>
              {TRANSMISSIONS.map(t => {
                const active = sp.transmission === t.value;
                return (
                  <Link key={t.value} href={buildUrl({ transmission: active ? undefined : t.value })} style={{ textDecoration: "none" }}>
                    <div style={{
                      padding: "8px 16px", fontSize: "13px", cursor: "pointer",
                      background: active ? "#eff6ff" : "transparent",
                      color: active ? "#2563eb" : "#444",
                      fontWeight: active ? 700 : 400,
                      borderLeft: active ? "3px solid #2563eb" : "3px solid transparent",
                    }}>
                      {t.label}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Seller type */}
          {isVehicles && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Vendedor
              </div>
              {[{ value: "particular", label: "Particular" }, { value: "concesionaria", label: "Concesionaria" }].map(s => {
                const active = sp.seller_type === s.value;
                return (
                  <Link key={s.value} href={buildUrl({ seller_type: active ? undefined : s.value })} style={{ textDecoration: "none" }}>
                    <div style={{
                      padding: "8px 16px", fontSize: "13px", cursor: "pointer",
                      background: active ? "#eff6ff" : "transparent",
                      color: active ? "#2563eb" : "#444",
                      fontWeight: active ? 700 : 400,
                      borderLeft: active ? "3px solid #2563eb" : "3px solid transparent",
                    }}>
                      {s.label}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Province (vehicles) */}
          {isVehicles && Object.keys(vProvinceCounts).length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Provincia
              </div>
              {Object.entries(RE_LOCATIONS)
                .filter(([k]) => (vProvinceCounts[k] ?? 0) > 0)
                .map(([k, prov]) => {
                  const active = sp.v_province === k;
                  return (
                    <Link key={k} href={buildUrl({ v_province: active ? undefined : k, v_zone: undefined })} style={{ textDecoration: "none" }}>
                      <div style={{
                        padding: "8px 16px", fontSize: "13px", cursor: "pointer",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        background: active ? "#eff6ff" : "transparent",
                        color: active ? "#2563eb" : "#444",
                        fontWeight: active ? 700 : 400,
                        borderLeft: active ? "3px solid #2563eb" : "3px solid transparent",
                      }}>
                        <span>{prov.label}</span>
                        <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>
                          {vProvinceCounts[k]}
                        </span>
                      </div>
                    </Link>
                  );
                })}
            </div>
          )}

          {/* Locality (vehicles) — shown when province selected */}
          {isVehicles && sp.v_province && RE_LOCATIONS[sp.v_province] && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Localidad
              </div>
              {RE_LOCATIONS[sp.v_province].zones
                .filter(z => (vZoneCounts[z.value] ?? 0) > 0)
                .map(z => {
                  const active = sp.v_zone === z.value;
                  return (
                    <Link key={z.value} href={buildUrl({ v_zone: active ? undefined : z.value })} style={{ textDecoration: "none" }}>
                      <div style={{
                        padding: "8px 16px", fontSize: "13px", cursor: "pointer",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        background: active ? "#eff6ff" : "transparent",
                        color: active ? "#2563eb" : "#444",
                        fontWeight: active ? 700 : 400,
                        borderLeft: active ? "3px solid #2563eb" : "3px solid transparent",
                      }}>
                        <span>{z.label}</span>
                        <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>
                          {vZoneCounts[z.value]}
                        </span>
                      </div>
                    </Link>
                  );
                })}
            </div>
          )}

          {/* ── Electronics filters ── */}

          {/* Grupo (electronics) */}
          {isElectronics && Object.keys(techGroupCounts).length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Grupo
              </div>
              {Object.entries(TECH_GROUPS).filter(([k]) => (techGroupCounts[k] ?? 0) > 0).map(([k, g]) => {
                const active = sp.tech_group === k;
                return (
                  <Link key={k} href={buildUrl({ tech_group: active ? undefined : k, tech_type: undefined })} style={{ textDecoration: "none" }}>
                    <div style={{
                      padding: "9px 16px", fontSize: "13px", cursor: "pointer",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      background: active ? "#eff6ff" : "transparent",
                      color: active ? "#2563eb" : "#444",
                      fontWeight: active ? 700 : 400,
                      borderLeft: active ? "3px solid #2563eb" : "3px solid transparent",
                    }}>
                      <span>{g.label}</span>
                      <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>
                        {techGroupCounts[k]}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Tipo de producto */}
          {isElectronics && Object.keys(techTypeCounts).length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Tipo de producto
              </div>
              {[
                { value: "notebook", label: "Notebook / Laptop" },
                { value: "pc", label: "PC / Escritorio" },
                { value: "tablet", label: "Tablets" },
                { value: "monitor", label: "Monitores" },
                { value: "componentes-pc", label: "Componentes de PC" },
                { value: "impresion", label: "Impresión" },
                { value: "conectividad", label: "Conectividad y Redes" },
                { value: "camara", label: "Cámaras Digitales" },
                { value: "acc-camara", label: "Accesorios para Cámaras" },
                { value: "filmadora", label: "Filmadoras" },
                { value: "videojuego", label: "Videojuegos" },
                { value: "consola-ps", label: "Para PlayStation" },
                { value: "consola-nintendo", label: "Para Nintendo" },
                { value: "consola", label: "Otras consolas" },
                { value: "audio", label: "Audio / Parlantes" },
                { value: "acc-audio-video", label: "Electrónica / Audio y Video" },
                { value: "drone", label: "Drones" },
                { value: "audio-vehiculo", label: "Audio para Vehículos" },
                { value: "tv", label: "Televisores" },
              ].filter(t => (techTypeCounts[t.value] ?? 0) > 0 && (!sp.tech_group || TECH_GROUPS[sp.tech_group]?.items.includes(t.value))).map(t => {
                const active = sp.tech_type === t.value;
                return (
                  <Link key={t.value} href={buildUrl({ tech_type: active ? undefined : t.value })} style={{ textDecoration: "none" }}>
                    <div style={{
                      padding: "9px 16px", fontSize: "13px", cursor: "pointer",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      background: active ? "#eff6ff" : "transparent",
                      color: active ? "#2563eb" : "#444",
                      fontWeight: active ? 700 : 400,
                      borderLeft: active ? "3px solid #2563eb" : "3px solid transparent",
                    }}>
                      <span>{t.label}</span>
                      <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>
                        {techTypeCounts[t.value]}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Marca (electronics) */}
          {isElectronics && Object.keys(techBrandCounts).length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Marca
              </div>
              <div style={{ maxHeight: "220px", overflowY: "auto" }}>
                {Object.entries(techBrandCounts).sort((a, b) => b[1] - a[1]).map(([brand, count]) => {
                  const active = sp.tech_brand === brand;
                  return (
                    <Link key={brand} href={buildUrl({ tech_brand: active ? undefined : brand })} style={{ textDecoration: "none" }}>
                      <div style={{
                        padding: "8px 16px", fontSize: "13px", cursor: "pointer",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        background: active ? "#eff6ff" : "transparent",
                        color: active ? "#2563eb" : "#444",
                        fontWeight: active ? 700 : 400,
                        borderLeft: active ? "3px solid #2563eb" : "3px solid transparent",
                      }}>
                        <span style={{ textTransform: "capitalize" }}>{brand}</span>
                        <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>
                          {count}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Provincia (electronics) */}
          {isElectronics && Object.keys(techProvinceCounts).length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Provincia
              </div>
              <div style={{ maxHeight: "220px", overflowY: "auto" }}>
                {Object.entries(techProvinceCounts).sort((a, b) => b[1] - a[1]).map(([prov, count]) => {
                  const active = sp.tech_province === prov;
                  return (
                    <Link key={prov} href={buildUrl({ tech_province: active ? undefined : prov })} style={{ textDecoration: "none" }}>
                      <div style={{
                        padding: "8px 16px", fontSize: "13px", cursor: "pointer",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        background: active ? "#eff6ff" : "transparent",
                        color: active ? "#2563eb" : "#444",
                        fontWeight: active ? 700 : 400,
                        borderLeft: active ? "3px solid #2563eb" : "3px solid transparent",
                      }}>
                        <span>{prov}</span>
                        <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>
                          {count}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Phones filters ── */}

          {/* Tipo de celular */}
          {isPhones && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Tipo
              </div>
              {PHONE_TYPES.filter(t => (phoneTypeCounts[t.value] ?? 0) > 0).map((t) => {
                const active = sp.phone_type === t.value;
                return (
                  <Link key={t.value} href={buildUrl({ phone_type: active ? undefined : t.value })} style={{ textDecoration: "none" }}>
                    <div style={{
                      padding: "9px 16px", fontSize: "13px", cursor: "pointer",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      background: active ? "#eff6ff" : "transparent",
                      color: active ? "#2563eb" : "#444",
                      fontWeight: active ? 700 : 400,
                      borderLeft: active ? "3px solid #2563eb" : "3px solid transparent",
                    }}>
                      <span>{t.label}</span>
                      <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>
                        {phoneTypeCounts[t.value]}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Marca (phones) */}
          {isPhones && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Marca
              </div>
              <div style={{ maxHeight: "220px", overflowY: "auto" }}>
                {Object.entries(phoneBrandCounts).sort((a, b) => b[1] - a[1]).map(([brand, count]) => {
                  const knownLabel = PHONE_BRANDS.find(b => b.value === brand)?.label;
                  const label = knownLabel ?? (brand.charAt(0).toUpperCase() + brand.slice(1));
                  const active = sp.phone_brand === brand;
                  return (
                    <Link key={brand} href={buildUrl({ phone_brand: active ? undefined : brand })} style={{ textDecoration: "none" }}>
                      <div style={{
                        padding: "8px 16px", fontSize: "13px", cursor: "pointer",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        background: active ? "#eff6ff" : "transparent",
                        color: active ? "#2563eb" : "#444",
                        fontWeight: active ? 700 : 400,
                        borderLeft: active ? "3px solid #2563eb" : "3px solid transparent",
                      }}>
                        <span>{label}</span>
                        <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>
                          {count}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Almacenamiento (phones) */}
          {isPhones && Object.keys(phoneStorageCounts).length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Almacenamiento
              </div>
              <div style={{ padding: "10px 16px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {[{v:"16gb",l:"16 GB"},{v:"32gb",l:"32 GB"},{v:"64gb",l:"64 GB"},{v:"128gb",l:"128 GB"},{v:"256gb",l:"256 GB"},{v:"512gb",l:"512 GB"},{v:"1tb",l:"1 TB"}].filter(s => phoneStorageCounts[s.v] > 0).map(s => {
                  const active = sp.phone_storage === s.v;
                  return (
                    <Link key={s.v} href={buildUrl({ phone_storage: active ? undefined : s.v })} style={{ textDecoration: "none" }}>
                      <span style={{ display: "inline-block", padding: "5px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer", background: active ? "#2563eb" : "#f1f5f9", color: active ? "#fff" : "#555" }}>
                        {s.l}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* RAM (phones) */}
          {isPhones && Object.keys(phoneRamCounts).length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Memoria RAM
              </div>
              <div style={{ padding: "10px 16px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {[{v:"2gb",l:"2 GB"},{v:"3gb",l:"3 GB"},{v:"4gb",l:"4 GB"},{v:"6gb",l:"6 GB"},{v:"8gb",l:"8 GB"},{v:"12gb",l:"12 GB"},{v:"16gb",l:"16 GB"}].filter(s => phoneRamCounts[s.v] > 0).map(s => {
                  const active = sp.phone_ram === s.v;
                  return (
                    <Link key={s.v} href={buildUrl({ phone_ram: active ? undefined : s.v })} style={{ textDecoration: "none" }}>
                      <span style={{ display: "inline-block", padding: "5px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer", background: active ? "#2563eb" : "#f1f5f9", color: active ? "#fff" : "#555" }}>
                        {s.l}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sistema operativo (phones) */}
          {isPhones && Object.keys(phoneOsCounts).length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Sistema Operativo
              </div>
              {[{v:"android",l:"Android"},{v:"ios",l:"iOS (iPhone)"},{v:"harmonyos",l:"HarmonyOS"}].filter(o => phoneOsCounts[o.v] > 0).map(o => {
                const active = sp.phone_os === o.v;
                return (
                  <Link key={o.v} href={buildUrl({ phone_os: active ? undefined : o.v })} style={{ textDecoration: "none" }}>
                    <div style={{ padding: "8px 16px", fontSize: "13px", cursor: "pointer", background: active ? "#eff6ff" : "transparent", color: active ? "#2563eb" : "#444", fontWeight: active ? 700 : 400, borderLeft: active ? "3px solid #2563eb" : "3px solid transparent" }}>
                      {o.l}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Tipo de SIM (phones) */}
          {isPhones && Object.keys(phoneSimCounts).length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Tipo de SIM
              </div>
              {[{v:"nano-sim",l:"Nano SIM"},{v:"dual-sim",l:"Dual SIM"},{v:"esim",l:"eSIM"},{v:"dual-sim-esim",l:"Dual SIM + eSIM"},{v:"micro-sim",l:"Micro SIM"}].filter(s => phoneSimCounts[s.v] > 0).map(s => {
                const active = sp.phone_sim === s.v;
                return (
                  <Link key={s.v} href={buildUrl({ phone_sim: active ? undefined : s.v })} style={{ textDecoration: "none" }}>
                    <div style={{ padding: "8px 16px", fontSize: "13px", cursor: "pointer", background: active ? "#eff6ff" : "transparent", color: active ? "#2563eb" : "#444", fontWeight: active ? 700 : 400, borderLeft: active ? "3px solid #2563eb" : "3px solid transparent" }}>
                      {s.l}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}


          {/* Características (phones) */}
          {isPhones && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Características
              </div>
              <div style={{ padding: "10px 16px", display: "flex", flexDirection: "column", gap: "6px" }}>
                {[
                  { param: "phone_box", label: "Con caja original" },
                  { param: "phone_charger", label: "Con cargador" },
                  { param: "phone_unlocked", label: "Liberado" },
                  { param: "phone_trade", label: "Acepta permuta" },
                ].map(f => {
                  const active = (sp as any)[f.param] === "1";
                  return (
                    <Link key={f.param} href={buildUrl({ [f.param]: active ? undefined : "1" } as any)} style={{ textDecoration: "none" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer", border: active ? "1.5px solid #2563eb" : "1.5px solid #e2e8f0", background: active ? "#eff6ff" : "#fff", color: active ? "#2563eb" : "#555", width: "100%", boxSizing: "border-box" as const }}>
                        {active ? "✓ " : ""}{f.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Appliances filters ── */}

          {/* Tipo de electrodoméstico */}
          {isAppliances && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Tipo
              </div>
              {APPLIANCE_TYPES.filter(t => (applianceTypeCounts[t.value] ?? 0) > 0).map((t) => {
                const active = sp.appliance_type === t.value;
                return (
                  <Link key={t.value} href={buildUrl({ appliance_type: active ? undefined : t.value })} style={{ textDecoration: "none" }}>
                    <div style={{
                      padding: "9px 16px", fontSize: "13px", cursor: "pointer",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      background: active ? "#eff6ff" : "transparent",
                      color: active ? "#2563eb" : "#444",
                      fontWeight: active ? 700 : 400,
                      borderLeft: active ? "3px solid #2563eb" : "3px solid transparent",
                    }}>
                      <span>{t.label}</span>
                      <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>
                        {applianceTypeCounts[t.value]}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Marca (appliances) */}
          {isAppliances && Object.keys(applianceBrandCounts).length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Marca
              </div>
              <div style={{ maxHeight: "220px", overflowY: "auto" }}>
                {Object.entries(applianceBrandCounts).sort((a, b) => b[1] - a[1]).map(([brand, count]) => {
                  const active = sp.appliance_brand === brand;
                  return (
                    <Link key={brand} href={buildUrl({ appliance_brand: active ? undefined : brand })} style={{ textDecoration: "none" }}>
                      <div style={{ padding: "8px 16px", fontSize: "13px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: active ? "#eff6ff" : "transparent", color: active ? "#2563eb" : "#444", fontWeight: active ? 700 : 400, borderLeft: active ? "3px solid #2563eb" : "3px solid transparent" }}>
                        <span style={{ textTransform: "capitalize" }}>{brand}</span>
                        <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>{count}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Estado (appliances) */}
          {isAppliances && Object.keys(applianceConditionCounts).length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Estado
              </div>
              {[{value:"new",label:"Nuevo"},{value:"like_new",label:"Como nuevo"},{value:"very_good",label:"Muy bueno"},{value:"good",label:"Bueno"},{value:"fair",label:"Regular"}].filter(c => applianceConditionCounts[c.value] > 0).map(c => {
                const active = sp.appliance_condition === c.value;
                return (
                  <Link key={c.value} href={buildUrl({ appliance_condition: active ? undefined : c.value })} style={{ textDecoration: "none" }}>
                    <div style={{ padding: "8px 16px", fontSize: "13px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: active ? "#eff6ff" : "transparent", color: active ? "#2563eb" : "#444", fontWeight: active ? 700 : 400, borderLeft: active ? "3px solid #2563eb" : "3px solid transparent" }}>
                      <span>{c.label}</span>
                      <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>{applianceConditionCounts[c.value]}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Provincia (appliances) */}
          {isAppliances && Object.keys(applianceProvinceCounts).length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Provincia
              </div>
              <div style={{ maxHeight: "220px", overflowY: "auto" }}>
                {Object.entries(applianceProvinceCounts).sort((a, b) => b[1] - a[1]).map(([prov, count]) => {
                  const active = sp.appliance_province === prov;
                  return (
                    <Link key={prov} href={buildUrl({ appliance_province: active ? undefined : prov })} style={{ textDecoration: "none" }}>
                      <div style={{ padding: "8px 16px", fontSize: "13px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: active ? "#eff6ff" : "transparent", color: active ? "#2563eb" : "#444", fontWeight: active ? 700 : 400, borderLeft: active ? "3px solid #2563eb" : "3px solid transparent" }}>
                        <span>{prov}</span>
                        <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>{count}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Home-garden filters ── */}

          {/* Tipo (home-garden) */}
          {isHomeGarden && Object.keys(hgTypeCounts).length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Tipo</div>
              {HG_TYPES.filter(t => (hgTypeCounts[t.value] ?? 0) > 0).map((t) => {
                const active = sp.hg_type === t.value;
                return (
                  <Link key={t.value} href={buildUrl({ hg_type: active ? undefined : t.value })} style={{ textDecoration: "none" }}>
                    <div style={{ padding: "9px 16px", fontSize: "13px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: active ? "#eff6ff" : "transparent", color: active ? "#2563eb" : "#444", fontWeight: active ? 700 : 400, borderLeft: active ? "3px solid #2563eb" : "3px solid transparent" }}>
                      <span>{t.label}</span>
                      <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>{hgTypeCounts[t.value]}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Marca (home-garden) */}
          {isHomeGarden && Object.keys(hgBrandCounts).length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Marca</div>
              <div style={{ maxHeight: "220px", overflowY: "auto" }}>
                {Object.entries(hgBrandCounts).sort((a, b) => b[1] - a[1]).map(([brand, count]) => {
                  const active = sp.hg_brand === brand;
                  return (
                    <Link key={brand} href={buildUrl({ hg_brand: active ? undefined : brand })} style={{ textDecoration: "none" }}>
                      <div style={{ padding: "8px 16px", fontSize: "13px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: active ? "#eff6ff" : "transparent", color: active ? "#2563eb" : "#444", fontWeight: active ? 700 : 400, borderLeft: active ? "3px solid #2563eb" : "3px solid transparent" }}>
                        <span style={{ textTransform: "capitalize" }}>{brand}</span>
                        <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>{count}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Estado (home-garden) */}
          {isHomeGarden && Object.keys(hgConditionCounts).length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Estado</div>
              {[{value:"new",label:"Nuevo"},{value:"like_new",label:"Como nuevo"},{value:"very_good",label:"Muy bueno"},{value:"good",label:"Bueno"},{value:"fair",label:"Regular"}].filter(c => hgConditionCounts[c.value] > 0).map(c => {
                const active = sp.hg_condition === c.value;
                return (
                  <Link key={c.value} href={buildUrl({ hg_condition: active ? undefined : c.value })} style={{ textDecoration: "none" }}>
                    <div style={{ padding: "8px 16px", fontSize: "13px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: active ? "#eff6ff" : "transparent", color: active ? "#2563eb" : "#444", fontWeight: active ? 700 : 400, borderLeft: active ? "3px solid #2563eb" : "3px solid transparent" }}>
                      <span>{c.label}</span>
                      <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>{hgConditionCounts[c.value]}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Provincia (home-garden) */}
          {isHomeGarden && Object.keys(hgProvinceCounts).length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Provincia</div>
              <div style={{ maxHeight: "220px", overflowY: "auto" }}>
                {Object.entries(hgProvinceCounts).sort((a, b) => b[1] - a[1]).map(([prov, count]) => {
                  const active = sp.hg_province === prov;
                  return (
                    <Link key={prov} href={buildUrl({ hg_province: active ? undefined : prov })} style={{ textDecoration: "none" }}>
                      <div style={{ padding: "8px 16px", fontSize: "13px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: active ? "#eff6ff" : "transparent", color: active ? "#2563eb" : "#444", fontWeight: active ? 700 : 400, borderLeft: active ? "3px solid #2563eb" : "3px solid transparent" }}>
                        <span>{prov}</span>
                        <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>{count}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Sports filters ── */}

          {/* Tipo (sports) */}
          {isSports && Object.keys(sportTypeCounts).length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Tipo</div>
              {SPORTS_TYPES.filter(t => (sportTypeCounts[t.value] ?? 0) > 0).map((t) => {
                const active = sp.sport_type === t.value;
                return (
                  <Link key={t.value} href={buildUrl({ sport_type: active ? undefined : t.value })} style={{ textDecoration: "none" }}>
                    <div style={{ padding: "9px 16px", fontSize: "13px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: active ? "#eff6ff" : "transparent", color: active ? "#2563eb" : "#444", fontWeight: active ? 700 : 400, borderLeft: active ? "3px solid #2563eb" : "3px solid transparent" }}>
                      <span>{t.label}</span>
                      <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>{sportTypeCounts[t.value]}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Marca (sports) */}
          {isSports && Object.keys(sportBrandCounts).length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Marca</div>
              <div style={{ maxHeight: "220px", overflowY: "auto" }}>
                {Object.entries(sportBrandCounts).sort((a, b) => b[1] - a[1]).map(([brand, count]) => {
                  const active = sp.sport_brand === brand;
                  return (
                    <Link key={brand} href={buildUrl({ sport_brand: active ? undefined : brand })} style={{ textDecoration: "none" }}>
                      <div style={{ padding: "8px 16px", fontSize: "13px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: active ? "#eff6ff" : "transparent", color: active ? "#2563eb" : "#444", fontWeight: active ? 700 : 400, borderLeft: active ? "3px solid #2563eb" : "3px solid transparent" }}>
                        <span style={{ textTransform: "capitalize" }}>{brand}</span>
                        <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>{count}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Estado (sports) */}
          {isSports && Object.keys(sportConditionCounts).length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Estado</div>
              {[{value:"new",label:"Nuevo"},{value:"like_new",label:"Como nuevo"},{value:"very_good",label:"Muy bueno"},{value:"good",label:"Bueno"},{value:"fair",label:"Regular"}].filter(c => sportConditionCounts[c.value] > 0).map(c => {
                const active = sp.sport_condition === c.value;
                return (
                  <Link key={c.value} href={buildUrl({ sport_condition: active ? undefined : c.value })} style={{ textDecoration: "none" }}>
                    <div style={{ padding: "8px 16px", fontSize: "13px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: active ? "#eff6ff" : "transparent", color: active ? "#2563eb" : "#444", fontWeight: active ? 700 : 400, borderLeft: active ? "3px solid #2563eb" : "3px solid transparent" }}>
                      <span>{c.label}</span>
                      <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>{sportConditionCounts[c.value]}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Provincia (sports) */}
          {isSports && Object.keys(sportProvinceCounts).length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Provincia</div>
              <div style={{ maxHeight: "220px", overflowY: "auto" }}>
                {Object.entries(sportProvinceCounts).sort((a, b) => b[1] - a[1]).map(([prov, count]) => {
                  const active = sp.sport_province === prov;
                  return (
                    <Link key={prov} href={buildUrl({ sport_province: active ? undefined : prov })} style={{ textDecoration: "none" }}>
                      <div style={{ padding: "8px 16px", fontSize: "13px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: active ? "#eff6ff" : "transparent", color: active ? "#2563eb" : "#444", fontWeight: active ? 700 : 400, borderLeft: active ? "3px solid #2563eb" : "3px solid transparent" }}>
                        <span>{prov}</span>
                        <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>{count}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Tools filters ── */}

          {/* Tipo (tools) */}
          {isTools && Object.keys(toolTypeCounts).length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Tipo</div>
              {TOOLS_TYPES.filter(t => (toolTypeCounts[t.value] ?? 0) > 0).map((t) => {
                const active = sp.tool_type === t.value;
                return (
                  <Link key={t.value} href={buildUrl({ tool_type: active ? undefined : t.value })} style={{ textDecoration: "none" }}>
                    <div style={{ padding: "9px 16px", fontSize: "13px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: active ? "#eff6ff" : "transparent", color: active ? "#2563eb" : "#444", fontWeight: active ? 700 : 400, borderLeft: active ? "3px solid #2563eb" : "3px solid transparent" }}>
                      <span>{t.label}</span>
                      <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>{toolTypeCounts[t.value]}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Marca (tools) */}
          {isTools && Object.keys(toolBrandCounts).length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Marca</div>
              <div style={{ maxHeight: "220px", overflowY: "auto" }}>
                {Object.entries(toolBrandCounts).sort((a, b) => b[1] - a[1]).map(([brand, count]) => {
                  const active = sp.tool_brand === brand;
                  return (
                    <Link key={brand} href={buildUrl({ tool_brand: active ? undefined : brand })} style={{ textDecoration: "none" }}>
                      <div style={{ padding: "8px 16px", fontSize: "13px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: active ? "#eff6ff" : "transparent", color: active ? "#2563eb" : "#444", fontWeight: active ? 700 : 400, borderLeft: active ? "3px solid #2563eb" : "3px solid transparent" }}>
                        <span style={{ textTransform: "capitalize" }}>{brand}</span>
                        <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>{count}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Estado (tools) */}
          {isTools && Object.keys(toolConditionCounts).length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Estado</div>
              {[{value:"new",label:"Nuevo"},{value:"like_new",label:"Como nuevo"},{value:"very_good",label:"Muy bueno"},{value:"good",label:"Bueno"},{value:"fair",label:"Regular"}].filter(c => toolConditionCounts[c.value] > 0).map(c => {
                const active = sp.tool_condition === c.value;
                return (
                  <Link key={c.value} href={buildUrl({ tool_condition: active ? undefined : c.value })} style={{ textDecoration: "none" }}>
                    <div style={{ padding: "8px 16px", fontSize: "13px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: active ? "#eff6ff" : "transparent", color: active ? "#2563eb" : "#444", fontWeight: active ? 700 : 400, borderLeft: active ? "3px solid #2563eb" : "3px solid transparent" }}>
                      <span>{c.label}</span>
                      <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>{toolConditionCounts[c.value]}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Provincia (tools) */}
          {isTools && Object.keys(toolProvinceCounts).length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Provincia</div>
              <div style={{ maxHeight: "220px", overflowY: "auto" }}>
                {Object.entries(toolProvinceCounts).sort((a, b) => b[1] - a[1]).map(([prov, count]) => {
                  const active = sp.tool_province === prov;
                  return (
                    <Link key={prov} href={buildUrl({ tool_province: active ? undefined : prov })} style={{ textDecoration: "none" }}>
                      <div style={{ padding: "8px 16px", fontSize: "13px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: active ? "#eff6ff" : "transparent", color: active ? "#2563eb" : "#444", fontWeight: active ? 700 : 400, borderLeft: active ? "3px solid #2563eb" : "3px solid transparent" }}>
                        <span>{prov}</span>
                        <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>{count}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Toys filters ── */}

          {/* Tipo (toys) */}
          {isToys && Object.keys(toyTypeCounts).length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Tipo</div>
              {TOYS_TYPES.filter(t => (toyTypeCounts[t.value] ?? 0) > 0).map((t) => {
                const active = sp.toy_type === t.value;
                return (
                  <Link key={t.value} href={buildUrl({ toy_type: active ? undefined : t.value })} style={{ textDecoration: "none" }}>
                    <div style={{ padding: "9px 16px", fontSize: "13px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: active ? "#eff6ff" : "transparent", color: active ? "#2563eb" : "#444", fontWeight: active ? 700 : 400, borderLeft: active ? "3px solid #2563eb" : "3px solid transparent" }}>
                      <span>{t.label}</span>
                      <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>{toyTypeCounts[t.value]}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Marca (toys) */}
          {isToys && Object.keys(toyBrandCounts).length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Marca</div>
              <div style={{ maxHeight: "220px", overflowY: "auto" }}>
                {Object.entries(toyBrandCounts).sort((a, b) => b[1] - a[1]).map(([brand, count]) => {
                  const active = sp.toy_brand === brand;
                  return (
                    <Link key={brand} href={buildUrl({ toy_brand: active ? undefined : brand })} style={{ textDecoration: "none" }}>
                      <div style={{ padding: "8px 16px", fontSize: "13px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: active ? "#eff6ff" : "transparent", color: active ? "#2563eb" : "#444", fontWeight: active ? 700 : 400, borderLeft: active ? "3px solid #2563eb" : "3px solid transparent" }}>
                        <span style={{ textTransform: "capitalize" }}>{brand}</span>
                        <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>{count}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Estado (toys) */}
          {isToys && Object.keys(toyConditionCounts).length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Estado</div>
              {[{value:"new",label:"Nuevo"},{value:"like_new",label:"Como nuevo"},{value:"very_good",label:"Muy bueno"},{value:"good",label:"Bueno"},{value:"fair",label:"Regular"}].filter(c => toyConditionCounts[c.value] > 0).map(c => {
                const active = sp.toy_condition === c.value;
                return (
                  <Link key={c.value} href={buildUrl({ toy_condition: active ? undefined : c.value })} style={{ textDecoration: "none" }}>
                    <div style={{ padding: "8px 16px", fontSize: "13px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: active ? "#eff6ff" : "transparent", color: active ? "#2563eb" : "#444", fontWeight: active ? 700 : 400, borderLeft: active ? "3px solid #2563eb" : "3px solid transparent" }}>
                      <span>{c.label}</span>
                      <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>{toyConditionCounts[c.value]}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Provincia (toys) */}
          {isToys && Object.keys(toyProvinceCounts).length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Provincia</div>
              <div style={{ maxHeight: "220px", overflowY: "auto" }}>
                {Object.entries(toyProvinceCounts).sort((a, b) => b[1] - a[1]).map(([prov, count]) => {
                  const active = sp.toy_province === prov;
                  return (
                    <Link key={prov} href={buildUrl({ toy_province: active ? undefined : prov })} style={{ textDecoration: "none" }}>
                      <div style={{ padding: "8px 16px", fontSize: "13px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: active ? "#eff6ff" : "transparent", color: active ? "#2563eb" : "#444", fontWeight: active ? 700 : 400, borderLeft: active ? "3px solid #2563eb" : "3px solid transparent" }}>
                        <span>{prov}</span>
                        <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>{count}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Books filters ── */}

          {/* Tipo (books) */}
          {isBooks && Object.keys(bookTypeCounts).length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Tipo</div>
              {BOOKS_TYPES.filter(t => (bookTypeCounts[t.value] ?? 0) > 0).map((t) => {
                const active = sp.book_type === t.value;
                return (
                  <Link key={t.value} href={buildUrl({ book_type: active ? undefined : t.value })} style={{ textDecoration: "none" }}>
                    <div style={{ padding: "9px 16px", fontSize: "13px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: active ? "#eff6ff" : "transparent", color: active ? "#2563eb" : "#444", fontWeight: active ? 700 : 400, borderLeft: active ? "3px solid #2563eb" : "3px solid transparent" }}>
                      <span>{t.label}</span>
                      <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>{bookTypeCounts[t.value]}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Estado (books) */}
          {isBooks && Object.keys(bookConditionCounts).length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Estado</div>
              {[{value:"new",label:"Nuevo"},{value:"like_new",label:"Como nuevo"},{value:"very_good",label:"Muy bueno"},{value:"good",label:"Bueno"},{value:"fair",label:"Regular"}].filter(c => bookConditionCounts[c.value] > 0).map(c => {
                const active = sp.book_condition === c.value;
                return (
                  <Link key={c.value} href={buildUrl({ book_condition: active ? undefined : c.value })} style={{ textDecoration: "none" }}>
                    <div style={{ padding: "8px 16px", fontSize: "13px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: active ? "#eff6ff" : "transparent", color: active ? "#2563eb" : "#444", fontWeight: active ? 700 : 400, borderLeft: active ? "3px solid #2563eb" : "3px solid transparent" }}>
                      <span>{c.label}</span>
                      <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>{bookConditionCounts[c.value]}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Provincia (books) */}
          {isBooks && Object.keys(bookProvinceCounts).length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Provincia</div>
              <div style={{ maxHeight: "220px", overflowY: "auto" }}>
                {Object.entries(bookProvinceCounts).sort((a, b) => b[1] - a[1]).map(([prov, count]) => {
                  const active = sp.book_province === prov;
                  return (
                    <Link key={prov} href={buildUrl({ book_province: active ? undefined : prov })} style={{ textDecoration: "none" }}>
                      <div style={{ padding: "8px 16px", fontSize: "13px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: active ? "#eff6ff" : "transparent", color: active ? "#2563eb" : "#444", fontWeight: active ? 700 : 400, borderLeft: active ? "3px solid #2563eb" : "3px solid transparent" }}>
                        <span>{prov}</span>
                        <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>{count}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Pets filters ── */}

          {/* Tipo (pets) */}
          {isPets && Object.keys(petTypeCounts).length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Tipo</div>
              {PETS_TYPES.filter(t => (petTypeCounts[t.value] ?? 0) > 0).map((t) => {
                const active = sp.pet_type === t.value;
                return (
                  <Link key={t.value} href={buildUrl({ pet_type: active ? undefined : t.value })} style={{ textDecoration: "none" }}>
                    <div style={{ padding: "9px 16px", fontSize: "13px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: active ? "#eff6ff" : "transparent", color: active ? "#2563eb" : "#444", fontWeight: active ? 700 : 400, borderLeft: active ? "3px solid #2563eb" : "3px solid transparent" }}>
                      <span>{t.label}</span>
                      <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>{petTypeCounts[t.value]}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Provincia (pets) */}
          {isPets && Object.keys(petProvinceCounts).length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Provincia</div>
              <div style={{ maxHeight: "220px", overflowY: "auto" }}>
                {Object.entries(petProvinceCounts).sort((a, b) => b[1] - a[1]).map(([prov, count]) => {
                  const active = sp.pet_province === prov;
                  return (
                    <Link key={prov} href={buildUrl({ pet_province: active ? undefined : prov })} style={{ textDecoration: "none" }}>
                      <div style={{ padding: "8px 16px", fontSize: "13px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: active ? "#eff6ff" : "transparent", color: active ? "#2563eb" : "#444", fontWeight: active ? 700 : 400, borderLeft: active ? "3px solid #2563eb" : "3px solid transparent" }}>
                        <span>{prov}</span>
                        <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>{count}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Services filters ── */}

          {/* Rubro (services) */}
          {isServices && Object.keys(servTypeCounts).length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Rubro</div>
              {SERVICES_TYPES.filter(t => (servTypeCounts[t.value] ?? 0) > 0).map((t) => {
                const active = sp.serv_type === t.value;
                return (
                  <Link key={t.value} href={buildUrl({ serv_type: active ? undefined : t.value })} style={{ textDecoration: "none" }}>
                    <div style={{ padding: "9px 16px", fontSize: "13px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: active ? "#eff6ff" : "transparent", color: active ? "#2563eb" : "#444", fontWeight: active ? 700 : 400, borderLeft: active ? "3px solid #2563eb" : "3px solid transparent" }}>
                      <span>{t.label}</span>
                      <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>{servTypeCounts[t.value]}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Provincia (services) */}
          {isServices && Object.keys(servProvinceCounts).length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Provincia</div>
              <div style={{ maxHeight: "220px", overflowY: "auto" }}>
                {Object.entries(servProvinceCounts).sort((a, b) => b[1] - a[1]).map(([prov, count]) => {
                  const active = sp.serv_province === prov;
                  return (
                    <Link key={prov} href={buildUrl({ serv_province: active ? undefined : prov })} style={{ textDecoration: "none" }}>
                      <div style={{ padding: "8px 16px", fontSize: "13px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: active ? "#eff6ff" : "transparent", color: active ? "#2563eb" : "#444", fontWeight: active ? 700 : 400, borderLeft: active ? "3px solid #2563eb" : "3px solid transparent" }}>
                        <span>{prov}</span>
                        <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>{count}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Clothing filters ── */}

          {/* Tipo (clothing) */}
          {isClothing && Object.keys(clothingTypeCounts).length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Tipo</div>
              {[{value:"ropa",label:"Ropa"},{value:"calzado",label:"Calzado"},{value:"accesorio",label:"Accesorio"},{value:"bolso",label:"Bolso / Cartera"},{value:"otro",label:"Otro"}].filter(o => (clothingTypeCounts[o.value] ?? 0) > 0).map(o => {
                const active = sp.clothing_type === o.value;
                return (
                  <Link key={o.value} href={buildUrl({ clothing_type: active ? undefined : o.value })} style={{ textDecoration: "none" }}>
                    <div style={{ padding: "9px 16px", fontSize: "13px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: active ? "#eff6ff" : "transparent", color: active ? "#2563eb" : "#444", fontWeight: active ? 700 : 400, borderLeft: active ? "3px solid #2563eb" : "3px solid transparent" }}>
                      <span>{o.label}</span>
                      <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>{clothingTypeCounts[o.value]}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Género (clothing) */}
          {isClothing && Object.keys(clothingGenderCounts).length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Género</div>
              {[{value:"mujer",label:"Mujer"},{value:"hombre",label:"Hombre"},{value:"unisex",label:"Unisex"},{value:"nino",label:"Niño/a"},{value:"bebe",label:"Bebé"},{value:"otro",label:"Otro"}].filter(o => (clothingGenderCounts[o.value] ?? 0) > 0).map(o => {
                const active = sp.clothing_gender === o.value;
                return (
                  <Link key={o.value} href={buildUrl({ clothing_gender: active ? undefined : o.value })} style={{ textDecoration: "none" }}>
                    <div style={{ padding: "9px 16px", fontSize: "13px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: active ? "#eff6ff" : "transparent", color: active ? "#2563eb" : "#444", fontWeight: active ? 700 : 400, borderLeft: active ? "3px solid #2563eb" : "3px solid transparent" }}>
                      <span>{o.label}</span>
                      <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>{clothingGenderCounts[o.value]}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Marca (clothing) */}
          {isClothing && Object.keys(clothingBrandCounts).length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Marca</div>
              <div style={{ maxHeight: "220px", overflowY: "auto" }}>
                {Object.entries(clothingBrandCounts).sort((a, b) => b[1] - a[1]).map(([brand, count]) => {
                  const active = sp.clothing_brand === brand;
                  return (
                    <Link key={brand} href={buildUrl({ clothing_brand: active ? undefined : brand })} style={{ textDecoration: "none" }}>
                      <div style={{ padding: "8px 16px", fontSize: "13px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: active ? "#eff6ff" : "transparent", color: active ? "#2563eb" : "#444", fontWeight: active ? 700 : 400, borderLeft: active ? "3px solid #2563eb" : "3px solid transparent" }}>
                        <span style={{ textTransform: "capitalize" }}>{brand}</span>
                        <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>{count}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Estado (clothing) */}
          {isClothing && Object.keys(clothingConditionCounts).length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Estado</div>
              {[{value:"new",label:"Nuevo"},{value:"like_new",label:"Como nuevo"},{value:"very_good",label:"Muy bueno"},{value:"good",label:"Bueno"},{value:"fair",label:"Regular"}].filter(c => clothingConditionCounts[c.value] > 0).map(c => {
                const active = sp.clothing_condition === c.value;
                return (
                  <Link key={c.value} href={buildUrl({ clothing_condition: active ? undefined : c.value })} style={{ textDecoration: "none" }}>
                    <div style={{ padding: "8px 16px", fontSize: "13px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: active ? "#eff6ff" : "transparent", color: active ? "#2563eb" : "#444", fontWeight: active ? 700 : 400, borderLeft: active ? "3px solid #2563eb" : "3px solid transparent" }}>
                      <span>{c.label}</span>
                      <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>{clothingConditionCounts[c.value]}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Provincia (clothing) */}
          {isClothing && Object.keys(clothingProvinceCounts).length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Provincia</div>
              <div style={{ maxHeight: "220px", overflowY: "auto" }}>
                {Object.entries(clothingProvinceCounts).sort((a, b) => b[1] - a[1]).map(([prov, count]) => {
                  const active = sp.clothing_province === prov;
                  return (
                    <Link key={prov} href={buildUrl({ clothing_province: active ? undefined : prov })} style={{ textDecoration: "none" }}>
                      <div style={{ padding: "8px 16px", fontSize: "13px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: active ? "#eff6ff" : "transparent", color: active ? "#2563eb" : "#444", fontWeight: active ? 700 : 400, borderLeft: active ? "3px solid #2563eb" : "3px solid transparent" }}>
                        <span>{prov}</span>
                        <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>{count}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Babies filters ── */}

          {/* Tipo de artículo bebé */}
          {isBabies && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Tipo
              </div>
              {BABY_TYPES.filter(t => (babyTypeCounts[t.value] ?? 0) > 0).map((t) => {
                const active = sp.baby_type === t.value;
                return (
                  <Link key={t.value} href={buildUrl({ baby_type: active ? undefined : t.value })} style={{ textDecoration: "none" }}>
                    <div style={{
                      padding: "9px 16px", fontSize: "13px", cursor: "pointer",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      background: active ? "#eff6ff" : "transparent",
                      color: active ? "#2563eb" : "#444",
                      fontWeight: active ? 700 : 400,
                      borderLeft: active ? "3px solid #2563eb" : "3px solid transparent",
                    }}>
                      <span>{t.label}</span>
                      <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>
                        {babyTypeCounts[t.value]}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Marca (babies) */}
          {isBabies && Object.keys(babyBrandCounts).length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Marca</div>
              <div style={{ maxHeight: "220px", overflowY: "auto" }}>
                {Object.entries(babyBrandCounts).sort((a, b) => b[1] - a[1]).map(([brand, count]) => {
                  const active = sp.baby_brand === brand;
                  return (
                    <Link key={brand} href={buildUrl({ baby_brand: active ? undefined : brand })} style={{ textDecoration: "none" }}>
                      <div style={{ padding: "8px 16px", fontSize: "13px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: active ? "#eff6ff" : "transparent", color: active ? "#2563eb" : "#444", fontWeight: active ? 700 : 400, borderLeft: active ? "3px solid #2563eb" : "3px solid transparent" }}>
                        <span style={{ textTransform: "capitalize" }}>{brand}</span>
                        <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>{count}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Estado (babies) */}
          {isBabies && Object.keys(babyConditionCounts).length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Estado</div>
              {[{value:"new",label:"Nuevo"},{value:"like_new",label:"Como nuevo"},{value:"very_good",label:"Muy bueno"},{value:"good",label:"Bueno"},{value:"fair",label:"Regular"}].filter(c => babyConditionCounts[c.value] > 0).map(c => {
                const active = sp.baby_condition === c.value;
                return (
                  <Link key={c.value} href={buildUrl({ baby_condition: active ? undefined : c.value })} style={{ textDecoration: "none" }}>
                    <div style={{ padding: "8px 16px", fontSize: "13px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: active ? "#eff6ff" : "transparent", color: active ? "#2563eb" : "#444", fontWeight: active ? 700 : 400, borderLeft: active ? "3px solid #2563eb" : "3px solid transparent" }}>
                      <span>{c.label}</span>
                      <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>{babyConditionCounts[c.value]}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Provincia (babies) */}
          {isBabies && Object.keys(babyProvinceCounts).length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Provincia</div>
              <div style={{ maxHeight: "220px", overflowY: "auto" }}>
                {Object.entries(babyProvinceCounts).sort((a, b) => b[1] - a[1]).map(([prov, count]) => {
                  const active = sp.baby_province === prov;
                  return (
                    <Link key={prov} href={buildUrl({ baby_province: active ? undefined : prov })} style={{ textDecoration: "none" }}>
                      <div style={{ padding: "8px 16px", fontSize: "13px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: active ? "#eff6ff" : "transparent", color: active ? "#2563eb" : "#444", fontWeight: active ? 700 : 400, borderLeft: active ? "3px solid #2563eb" : "3px solid transparent" }}>
                        <span>{prov}</span>
                        <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>{count}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Beauty & Health filters ── */}

          {/* Tipo (beauty) */}
          {isBeauty && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Tipo
              </div>
              {BEAUTY_TYPES.filter(t => (beautyTypeCounts[t.value] ?? 0) > 0).map((t) => {
                const active = sp.beauty_type === t.value;
                return (
                  <Link key={t.value} href={buildUrl({ beauty_type: active ? undefined : t.value })} style={{ textDecoration: "none" }}>
                    <div style={{
                      padding: "9px 16px", fontSize: "13px", cursor: "pointer",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      background: active ? "#eff6ff" : "transparent",
                      color: active ? "#2563eb" : "#444",
                      fontWeight: active ? 700 : 400,
                      borderLeft: active ? "3px solid #2563eb" : "3px solid transparent",
                    }}>
                      <span>{t.label}</span>
                      <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>
                        {beautyTypeCounts[t.value]}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Marca (beauty) */}
          {isBeauty && Object.keys(beautyBrandCounts).length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Marca</div>
              <div style={{ maxHeight: "220px", overflowY: "auto" }}>
                {Object.entries(beautyBrandCounts).sort((a, b) => b[1] - a[1]).map(([brand, count]) => {
                  const active = sp.beauty_brand === brand;
                  return (
                    <Link key={brand} href={buildUrl({ beauty_brand: active ? undefined : brand })} style={{ textDecoration: "none" }}>
                      <div style={{ padding: "8px 16px", fontSize: "13px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: active ? "#eff6ff" : "transparent", color: active ? "#2563eb" : "#444", fontWeight: active ? 700 : 400, borderLeft: active ? "3px solid #2563eb" : "3px solid transparent" }}>
                        <span style={{ textTransform: "capitalize" }}>{brand}</span>
                        <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>{count}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Estado (beauty) */}
          {isBeauty && Object.keys(beautyConditionCounts).length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Estado</div>
              {[{value:"new",label:"Nuevo"},{value:"like_new",label:"Como nuevo"},{value:"very_good",label:"Muy bueno"},{value:"good",label:"Bueno"},{value:"fair",label:"Regular"}].filter(c => beautyConditionCounts[c.value] > 0).map(c => {
                const active = sp.beauty_condition === c.value;
                return (
                  <Link key={c.value} href={buildUrl({ beauty_condition: active ? undefined : c.value })} style={{ textDecoration: "none" }}>
                    <div style={{ padding: "8px 16px", fontSize: "13px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: active ? "#eff6ff" : "transparent", color: active ? "#2563eb" : "#444", fontWeight: active ? 700 : 400, borderLeft: active ? "3px solid #2563eb" : "3px solid transparent" }}>
                      <span>{c.label}</span>
                      <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>{beautyConditionCounts[c.value]}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Provincia (beauty) */}
          {isBeauty && Object.keys(beautyProvinceCounts).length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Provincia</div>
              <div style={{ maxHeight: "220px", overflowY: "auto" }}>
                {Object.entries(beautyProvinceCounts).sort((a, b) => b[1] - a[1]).map(([prov, count]) => {
                  const active = sp.beauty_province === prov;
                  return (
                    <Link key={prov} href={buildUrl({ beauty_province: active ? undefined : prov })} style={{ textDecoration: "none" }}>
                      <div style={{ padding: "8px 16px", fontSize: "13px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: active ? "#eff6ff" : "transparent", color: active ? "#2563eb" : "#444", fontWeight: active ? 700 : 400, borderLeft: active ? "3px solid #2563eb" : "3px solid transparent" }}>
                        <span>{prov}</span>
                        <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>{count}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Real estate filters ── */}

          {/* Property type */}
          {isRealEstate && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Tipo de propiedad
              </div>
              {RE_PROPERTY_TYPES.filter(t => (reTypeCounts[t.value] ?? 0) > 0).map((t) => {
                const active = sp.re_type === t.value;
                return (
                  <Link key={t.value} href={buildUrl({ re_type: active ? undefined : t.value })} style={{ textDecoration: "none" }}>
                    <div style={{
                      padding: "9px 16px", fontSize: "13px", cursor: "pointer",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      background: active ? "#eff6ff" : "transparent",
                      color: active ? "#2563eb" : "#444",
                      fontWeight: active ? 700 : 400,
                      borderLeft: active ? "3px solid #2563eb" : "3px solid transparent",
                    }}>
                      <span>{t.label}</span>
                      <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>
                        {reTypeCounts[t.value]}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Operation */}
          {isRealEstate && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Operación
              </div>
              <div style={{ padding: "10px 16px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {RE_OPERATIONS.map(op => {
                  const active = sp.re_operation === op.value;
                  return (
                    <Link key={op.value} href={buildUrl({ re_operation: active ? undefined : op.value })} style={{ textDecoration: "none" }}>
                      <span style={{
                        display: "inline-block", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer",
                        background: active ? "#2563eb" : "#f1f5f9",
                        color: active ? "#fff" : "#555",
                      }}>{op.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Province + Locality */}
          {isRealEstate && (
            <form method="GET" action={`/category/${slug}`} style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              {Object.entries(sp).map(([k, v]) =>
                v && k !== "re_province" && k !== "re_zone" ? <input key={k} type="hidden" name={k} value={v} /> : null
              )}
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Ubicación
              </div>
              <div style={{ padding: "10px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", marginBottom: "4px", textTransform: "uppercase" as const, letterSpacing: "0.4px" }}>Provincia</div>
                  <select
                    name="re_province"
                    defaultValue={sp.re_province ?? ""}
                    style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: "6px", padding: "7px 10px", fontSize: "13px", outline: "none", background: "#fff" }}
                  >
                    <option value="">Todas las provincias</option>
                    {Object.entries(RE_LOCATIONS).map(([key, prov]) => (
                      <option key={key} value={key}>{prov.label}</option>
                    ))}
                  </select>
                </div>
                {(() => {
                  const provKey = sp.re_province ?? "san-juan";
                  const zones = RE_LOCATIONS[provKey]?.zones ?? RE_LOCATIONS["san-juan"].zones;
                  return (
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", marginBottom: "4px", textTransform: "uppercase" as const, letterSpacing: "0.4px" }}>
                        Localidad
                      </div>
                      <select
                        name="re_zone"
                        defaultValue={sp.re_zone ?? ""}
                        style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: "6px", padding: "7px 10px", fontSize: "13px", outline: "none", background: "#fff" }}
                      >
                        <option value="">Todas las localidades</option>
                        {zones.map(z => (
                          <option key={z.value} value={z.value}>{z.label}</option>
                        ))}
                      </select>
                    </div>
                  );
                })()}
                <button type="submit" style={{ width: "100%", background: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", padding: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
                  Aplicar
                </button>
              </div>
            </form>
          )}

          {/* Bedrooms */}
          {isRealEstate && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Dormitorios
              </div>
              <div style={{ padding: "10px 16px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {RE_BEDROOMS.map(b => {
                  const active = sp.re_bedrooms === b.value;
                  return (
                    <Link key={b.value} href={buildUrl({ re_bedrooms: active ? undefined : b.value })} style={{ textDecoration: "none" }}>
                      <span style={{ display: "inline-block", padding: "5px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer", background: active ? "#2563eb" : "#f1f5f9", color: active ? "#fff" : "#555" }}>
                        {b.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bathrooms */}
          {isRealEstate && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Baños
              </div>
              <div style={{ padding: "10px 16px", display: "flex", gap: "6px" }}>
                {["1", "2", "3", "4+"].map(b => {
                  const active = sp.re_bathrooms === b;
                  return (
                    <Link key={b} href={buildUrl({ re_bathrooms: active ? undefined : b })} style={{ textDecoration: "none" }}>
                      <span style={{ display: "inline-block", padding: "5px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer", background: active ? "#2563eb" : "#f1f5f9", color: active ? "#fff" : "#555" }}>
                        {b}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* m2 range */}
          {isRealEstate && (
            <form method="GET" action={`/category/${slug}`} style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              {Object.entries(sp).map(([k, v]) =>
                v && k !== "m2_min" && k !== "m2_max" ? <input key={k} type="hidden" name={k} value={v} /> : null
              )}
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Superficie (m²)
              </div>
              <div style={{ padding: "12px 16px", display: "flex", gap: "8px" }}>
                <input name="m2_min" type="number" defaultValue={sp.m2_min} placeholder="Mín."
                  style={{ border: "1.5px solid #e2e8f0", borderRadius: "6px", padding: "7px 8px", fontSize: "13px", outline: "none", width: "50%", boxSizing: "border-box" as const }} />
                <input name="m2_max" type="number" defaultValue={sp.m2_max} placeholder="Máx."
                  style={{ border: "1.5px solid #e2e8f0", borderRadius: "6px", padding: "7px 8px", fontSize: "13px", outline: "none", width: "50%", boxSizing: "border-box" as const }} />
              </div>
              <div style={{ padding: "0 16px 12px" }}>
                <button type="submit" style={{ width: "100%", background: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", padding: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
                  Aplicar
                </button>
              </div>
            </form>
          )}

          {/* Features */}
          {isRealEstate && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Características
              </div>
              <div style={{ padding: "10px 16px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {RE_FEATURES.map(f => {
                  const active = (sp as any)[f.key] === "1";
                  return (
                    <Link key={f.key} href={buildUrl({ [f.key]: active ? undefined : "1" } as any)} style={{ textDecoration: "none" }}>
                      <span style={{ display: "inline-block", padding: "5px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer", border: active ? "1.5px solid #2563eb" : "1.5px solid #e2e8f0", background: active ? "#eff6ff" : "#fff", color: active ? "#2563eb" : "#555" }}>
                        {active ? "✓ " : ""}{f.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Seller type (real estate) */}
          {isRealEstate && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Publicado por
              </div>
              {[{ value: "particular", label: "Dueño directo" }, { value: "inmobiliaria", label: "Inmobiliaria" }].map(s => {
                const active = sp.re_seller === s.value;
                return (
                  <Link key={s.value} href={buildUrl({ re_seller: active ? undefined : s.value })} style={{ textDecoration: "none" }}>
                    <div style={{ padding: "8px 16px", fontSize: "13px", cursor: "pointer", background: active ? "#eff6ff" : "transparent", color: active ? "#2563eb" : "#444", fontWeight: active ? 700 : 400, borderLeft: active ? "3px solid #2563eb" : "3px solid transparent" }}>
                      {s.label}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Provincia (phones) */}
          {isPhones && Object.keys(phoneProvinceCounts).length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Provincia
              </div>
              <div style={{ maxHeight: "220px", overflowY: "auto" }}>
                {Object.entries(phoneProvinceCounts).sort((a, b) => b[1] - a[1]).map(([prov, count]) => {
                  const active = sp.phone_province === prov;
                  return (
                    <Link key={prov} href={buildUrl({ phone_province: active ? undefined : prov })} style={{ textDecoration: "none" }}>
                      <div style={{
                        padding: "8px 16px", fontSize: "13px", cursor: "pointer",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        background: active ? "#eff6ff" : "transparent",
                        color: active ? "#2563eb" : "#444",
                        fontWeight: active ? 700 : 400,
                        borderLeft: active ? "3px solid #2563eb" : "3px solid transparent",
                      }}>
                        <span>{prov}</span>
                        <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>
                          {count}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Condición (phones) */}
          {isPhones && Object.keys(phoneConditionCounts).length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Condición
              </div>
              {[
                { value: "new", label: "Nuevo" },
                { value: "like_new", label: "Como nuevo" },
                { value: "very_good", label: "Muy bueno" },
                { value: "good", label: "Bueno" },
                { value: "fair", label: "Regular" },
              ].filter(c => phoneConditionCounts[c.value] > 0).map(c => {
                const active = sp.phone_condition === c.value;
                return (
                  <Link key={c.value} href={buildUrl({ phone_condition: active ? undefined : c.value })} style={{ textDecoration: "none" }}>
                    <div style={{
                      padding: "8px 16px", fontSize: "13px", cursor: "pointer",
                      background: active ? "#eff6ff" : "transparent",
                      color: active ? "#2563eb" : "#444",
                      fontWeight: active ? 700 : 400,
                      borderLeft: active ? "3px solid #2563eb" : "3px solid transparent",
                    }}>
                      {c.label}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Estado (electronics) */}
          {isElectronics && Object.keys(techConditionCounts).length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Estado
              </div>
              {[
                { value: "new", label: "Nuevo" },
                { value: "like_new", label: "Como nuevo" },
                { value: "very_good", label: "Muy bueno" },
                { value: "good", label: "Bueno" },
                { value: "fair", label: "Regular" },
              ].filter(c => techConditionCounts[c.value] > 0).map(c => {
                const active = sp.tech_condition === c.value;
                return (
                  <Link key={c.value} href={buildUrl({ tech_condition: active ? undefined : c.value })} style={{ textDecoration: "none" }}>
                    <div style={{
                      padding: "8px 16px", fontSize: "13px", cursor: "pointer",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      background: active ? "#eff6ff" : "transparent",
                      color: active ? "#2563eb" : "#444",
                      fontWeight: active ? 700 : 400,
                      borderLeft: active ? "3px solid #2563eb" : "3px solid transparent",
                    }}>
                      <span>{c.label}</span>
                      <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>
                        {techConditionCounts[c.value]}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Subcategoría (other) */}
          {isOther && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Subcategoría
              </div>
              {OTHER_TYPES.filter(t => (otherTypeCounts[t.value] ?? 0) > 0 || sp.other_type === t.value).map((t) => {
                const active = sp.other_type === t.value;
                return (
                  <Link key={t.value} href={buildUrl({ other_type: active ? undefined : t.value })} style={{ textDecoration: "none" }}>
                    <div style={{
                      padding: "9px 16px", fontSize: "13px", cursor: "pointer",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      background: active ? "#eff6ff" : "transparent",
                      color: active ? "#2563eb" : "#444",
                      fontWeight: active ? 700 : 400,
                      borderLeft: active ? "3px solid #2563eb" : "3px solid transparent",
                    }}>
                      <span>{t.label}</span>
                      {(otherTypeCounts[t.value] ?? 0) > 0 && (
                        <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>
                          {otherTypeCounts[t.value]}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Condición (other) */}
          {isOther && Object.keys(otherConditionCounts).length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Condición
              </div>
              {[
                { value: "new", label: "Nuevo" },
                { value: "like_new", label: "Como nuevo" },
                { value: "very_good", label: "Muy bueno" },
                { value: "good", label: "Bueno" },
                { value: "fair", label: "Regular" },
              ].filter(c => otherConditionCounts[c.value] > 0).map(c => {
                const active = sp.other_condition === c.value;
                return (
                  <Link key={c.value} href={buildUrl({ other_condition: active ? undefined : c.value })} style={{ textDecoration: "none" }}>
                    <div style={{
                      padding: "8px 16px", fontSize: "13px", cursor: "pointer",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      background: active ? "#eff6ff" : "transparent",
                      color: active ? "#2563eb" : "#444",
                      fontWeight: active ? 700 : 400,
                      borderLeft: active ? "3px solid #2563eb" : "3px solid transparent",
                    }}>
                      <span>{c.label}</span>
                      <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>
                        {otherConditionCounts[c.value]}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Price */}
          <form method="GET" action={`/category/${slug}`} style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
            {Object.entries(sp).map(([k, v]) =>
              v && k !== "price_min" && k !== "price_max"
                ? <input key={k} type="hidden" name={k} value={v} />
                : null
            )}
            <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Precio
            </div>
            <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <input name="price_min" type="number" defaultValue={sp.price_min} placeholder="Mínimo"
                style={{ border: "1.5px solid #e2e8f0", borderRadius: "6px", padding: "7px 10px", fontSize: "13px", outline: "none", width: "100%", boxSizing: "border-box" as const }} />
              <input name="price_max" type="number" defaultValue={sp.price_max} placeholder="Máximo"
                style={{ border: "1.5px solid #e2e8f0", borderRadius: "6px", padding: "7px 10px", fontSize: "13px", outline: "none", width: "100%", boxSizing: "border-box" as const }} />
              <button type="submit" style={{
                background: "#2563eb", color: "#fff", border: "none", borderRadius: "6px",
                padding: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer",
              }}>Aplicar</button>
            </div>
          </form>

          {/* Clear filters */}
          {hasFilters && (
            <Link href={`/category/${slug}`} style={{ textDecoration: "none" }}>
              <div style={{
                background: "#fff", borderRadius: "10px", padding: "10px 16px",
                fontSize: "13px", color: "#dc2626", fontWeight: 600,
                textAlign: "center", border: "1px solid #fee2e2", cursor: "pointer",
              }}>
                ✕ Limpiar filtros
              </div>
            </Link>
          )}

          {/* FilterPanel — desktop */}
          <FilterPanel
            mode="desktop"
            category={slug}
            categoryId={cat.id}
            currentFilters={{
              q: sp.q, order: sp.order,
              price_min: sp.price_min, price_max: sp.price_max,
              condition: sp.condition,
              sub_category: sp.sub_category || sp.type,
              brand: sp.brand,
              fuel: sp.fuel, transmission: sp.transmission,
              year_from: sp.year_from, year_to: sp.year_to, km_max: sp.km_max,
              re_sub: sp.re_sub || sp.re_type,
              operation: sp.operation || sp.re_operation,
              bedrooms: sp.bedrooms || sp.re_bedrooms,
              size: sp.size,
            }}
            totalCount={listings?.length ?? 0}
            basePath={`/category/${slug}`}
          />

          {/* Publicar con IA widget */}
          <div style={{
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            borderRadius: "10px", padding: "16px", color: "#fff",
          }}>
            <div style={{ fontSize: "13px", fontWeight: 700, marginBottom: "4px" }}>✨ Publicar con IA</div>
            <div style={{ fontSize: "12px", opacity: 0.85, marginBottom: "12px", lineHeight: 1.4 }}>
              Describí tu artículo y la IA completa título, precio y categoría.
            </div>
            <a href="/publish" style={{ textDecoration: "none" }}>
              <div style={{
                background: "#fff", color: "#6366f1", borderRadius: "6px",
                padding: "8px 12px", fontSize: "12px", fontWeight: 700,
                textAlign: "center", cursor: "pointer",
              }}>
                Publicar ahora →
              </div>
            </a>
          </div>
        </aside>

        {/* ── Main ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Top bar */}
          <div style={{
            background: "#fff", borderRadius: "10px", padding: "10px 16px",
            display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px",
          }}>
            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", color: "#64748b", flexWrap: "wrap" }}>
              <Link href="/" style={{ color: "#64748b", textDecoration: "none" }} className="hover:text-indigo-600">Inicio</Link>
              <span style={{ color: "#cbd5e1" }}>›</span>
              <Link href={`/category/${slug}`} style={{ color: "#64748b", textDecoration: "none" }} className="hover:text-indigo-600">{meta.name}</Link>
              {sp.type && (<><span style={{ color: "#cbd5e1" }}>›</span><span style={{ color: "#1e293b", fontWeight: 600 }}>{VEHICLE_TYPES.find(t => t.value === sp.type)?.label ?? sp.type}</span></>)}
              {sp.brand && (<><span style={{ color: "#cbd5e1" }}>›</span><span style={{ color: "#1e293b", fontWeight: 600 }}>{VEHICLE_BRANDS.find(b => b.value === sp.brand)?.label ?? sp.brand}</span></>)}
              {sp.re_type && (<><span style={{ color: "#cbd5e1" }}>›</span><span style={{ color: "#1e293b", fontWeight: 600 }}>{RE_PROPERTY_TYPES.find(t => t.value === sp.re_type)?.label ?? sp.re_type}</span></>)}
              {sp.tech_type && (<><span style={{ color: "#cbd5e1" }}>›</span><span style={{ color: "#1e293b", fontWeight: 600 }}>{sp.tech_type}</span></>)}
              {sp.tech_brand && (<><span style={{ color: "#cbd5e1" }}>›</span><span style={{ color: "#1e293b", fontWeight: 600, textTransform: "capitalize" }}>{sp.tech_brand}</span></>)}
              {sp.clothing_brand && (<><span style={{ color: "#cbd5e1" }}>›</span><span style={{ color: "#1e293b", fontWeight: 600 }}>{sp.clothing_brand}</span></>)}
              <span style={{ color: "#94a3b8", fontSize: "12px", marginLeft: "4px" }}>({listings?.length ?? 0})</span>
            </div>

            {/* Controls */}
            <div className="category-search-bar" style={{ display: "flex", gap: "8px", alignItems: "center", width: "100%" }}>
              <SearchWithSuggestions
                placeholder="Buscar en esta categoría..."
                initialValue={sp.q}
                action={`/category/${slug}`}
                extraParams={Object.fromEntries(Object.entries(sp).filter(([k, v]) => v !== undefined && k !== "q" && k !== "order") as [string, string][])}
                style={{ flex: 1, minWidth: 0 }}
              />

              <OrderSelect
                value={sp.order ?? ""}
                action={`/category/${slug}`}
                hiddenFields={Object.fromEntries(Object.entries(sp).filter(([k, v]) => v && k !== "order") as [string, string][])}
                className="sort-select"
              />

              {/* Grid / List toggle */}
              <div style={{ display: "flex", border: "1.5px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
                <Link href={buildUrl({ view: undefined })} style={{ textDecoration: "none" }}>
                  <div title="Ver en grilla" style={{
                    padding: "5px 8px", cursor: "pointer", display: "flex", alignItems: "center",
                    background: (sp.view ?? "grid") === "grid" ? "#6366f1" : "#fff",
                    color: (sp.view ?? "grid") === "grid" ? "#fff" : "#94a3b8",
                  }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                    </svg>
                  </div>
                </Link>
                <Link href={buildUrl({ view: "list" })} style={{ textDecoration: "none" }}>
                  <div title="Ver en lista" style={{
                    padding: "5px 8px", cursor: "pointer", display: "flex", alignItems: "center",
                    background: sp.view === "list" ? "#6366f1" : "#fff",
                    color: sp.view === "list" ? "#fff" : "#94a3b8",
                  }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                    </svg>
                  </div>
                </Link>
              </div>

              {/* FilterPanel — mobile button */}
              <FilterPanel
                mode="mobile"
                category={slug}
                categoryId={cat.id}
                currentFilters={{
                  q: sp.q, order: sp.order,
                  price_min: sp.price_min, price_max: sp.price_max,
                  condition: sp.condition,
                  sub_category: sp.sub_category || sp.type,
                  brand: sp.brand,
                  fuel: sp.fuel, transmission: sp.transmission,
                  year_from: sp.year_from, year_to: sp.year_to, km_max: sp.km_max,
                  re_sub: sp.re_sub || sp.re_type,
                  operation: sp.operation || sp.re_operation,
                  bedrooms: sp.bedrooms || sp.re_bedrooms,
                  size: sp.size,
                }}
                totalCount={listings?.length ?? 0}
                basePath={`/category/${slug}`}
              />
            </div>
          </div>

          {/* Active filter chips */}
          {hasFilters && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
              {isVehicles && sp.type && <Chip label={`Tipo: ${VEHICLE_TYPES.find(t => t.value === sp.type)?.label ?? sp.type}`} href={buildUrl({ type: undefined })} />}
              {isVehicles && sp.brand && <Chip label={`Marca: ${VEHICLE_BRANDS.find(b => b.value === sp.brand)?.label ?? sp.brand}`} href={buildUrl({ brand: undefined })} />}
              {isElectronics && sp.tech_group && <Chip label={TECH_GROUPS[sp.tech_group]?.label ?? sp.tech_group} href={buildUrl({ tech_group: undefined, tech_type: undefined })} />}
              {isElectronics && sp.tech_type && <Chip label={`Tipo: ${sp.tech_type}`} href={buildUrl({ tech_type: undefined })} />}
              {isElectronics && sp.tech_brand && <Chip label={`Marca: ${sp.tech_brand.charAt(0).toUpperCase() + sp.tech_brand.slice(1)}`} href={buildUrl({ tech_brand: undefined })} />}
              {isElectronics && sp.tech_province && <Chip label={sp.tech_province} href={buildUrl({ tech_province: undefined })} />}
              {isElectronics && sp.tech_condition && <Chip label={[{value:"new",label:"Nuevo"},{value:"like_new",label:"Como nuevo"},{value:"very_good",label:"Muy bueno"},{value:"good",label:"Bueno"},{value:"fair",label:"Regular"}].find(c=>c.value===sp.tech_condition)?.label ?? sp.tech_condition} href={buildUrl({ tech_condition: undefined })} />}
              {isClothing && sp.clothing_type && <Chip label={`Tipo: ${[{value:"ropa",label:"Ropa"},{value:"calzado",label:"Calzado"},{value:"accesorio",label:"Accesorio"},{value:"bolso",label:"Bolso / Cartera"},{value:"otro",label:"Otro"}].find(o=>o.value===sp.clothing_type)?.label ?? sp.clothing_type}`} href={buildUrl({ clothing_type: undefined })} />}
              {isClothing && sp.clothing_gender && <Chip label={[{value:"mujer",label:"Mujer"},{value:"hombre",label:"Hombre"},{value:"unisex",label:"Unisex"},{value:"nino",label:"Niño/a"},{value:"bebe",label:"Bebé"},{value:"otro",label:"Otro"}].find(o=>o.value===sp.clothing_gender)?.label ?? sp.clothing_gender} href={buildUrl({ clothing_gender: undefined })} />}
              {isClothing && sp.clothing_brand && <Chip label={`Marca: ${sp.clothing_brand.charAt(0).toUpperCase() + sp.clothing_brand.slice(1)}`} href={buildUrl({ clothing_brand: undefined })} />}
              {isClothing && sp.clothing_condition && <Chip label={[{value:"new",label:"Nuevo"},{value:"like_new",label:"Como nuevo"},{value:"very_good",label:"Muy bueno"},{value:"good",label:"Bueno"},{value:"fair",label:"Regular"}].find(c=>c.value===sp.clothing_condition)?.label ?? sp.clothing_condition} href={buildUrl({ clothing_condition: undefined })} />}
              {isClothing && sp.clothing_province && <Chip label={sp.clothing_province} href={buildUrl({ clothing_province: undefined })} />}
              {isAppliances && sp.appliance_type && <Chip label={`Tipo: ${APPLIANCE_TYPES.find(t => t.value === sp.appliance_type)?.label ?? sp.appliance_type}`} href={buildUrl({ appliance_type: undefined })} />}
              {isAppliances && sp.appliance_brand && <Chip label={`Marca: ${sp.appliance_brand.charAt(0).toUpperCase() + sp.appliance_brand.slice(1)}`} href={buildUrl({ appliance_brand: undefined })} />}
              {isAppliances && sp.appliance_condition && <Chip label={[{value:"new",label:"Nuevo"},{value:"like_new",label:"Como nuevo"},{value:"very_good",label:"Muy bueno"},{value:"good",label:"Bueno"},{value:"fair",label:"Regular"}].find(c=>c.value===sp.appliance_condition)?.label ?? sp.appliance_condition} href={buildUrl({ appliance_condition: undefined })} />}
              {isAppliances && sp.appliance_province && <Chip label={sp.appliance_province} href={buildUrl({ appliance_province: undefined })} />}
              {isBabies && sp.baby_type && <Chip label={`Tipo: ${BABY_TYPES.find(t => t.value === sp.baby_type)?.label ?? sp.baby_type}`} href={buildUrl({ baby_type: undefined })} />}
              {isBabies && sp.baby_brand && <Chip label={`Marca: ${sp.baby_brand.charAt(0).toUpperCase() + sp.baby_brand.slice(1)}`} href={buildUrl({ baby_brand: undefined })} />}
              {isBabies && sp.baby_condition && <Chip label={[{value:"new",label:"Nuevo"},{value:"like_new",label:"Como nuevo"},{value:"very_good",label:"Muy bueno"},{value:"good",label:"Bueno"},{value:"fair",label:"Regular"}].find(c=>c.value===sp.baby_condition)?.label ?? sp.baby_condition} href={buildUrl({ baby_condition: undefined })} />}
              {isBabies && sp.baby_province && <Chip label={sp.baby_province} href={buildUrl({ baby_province: undefined })} />}
              {isBeauty && sp.beauty_type && <Chip label={`Tipo: ${BEAUTY_TYPES.find(t => t.value === sp.beauty_type)?.label ?? sp.beauty_type}`} href={buildUrl({ beauty_type: undefined })} />}
              {isBeauty && sp.beauty_brand && <Chip label={`Marca: ${sp.beauty_brand.charAt(0).toUpperCase() + sp.beauty_brand.slice(1)}`} href={buildUrl({ beauty_brand: undefined })} />}
              {isBeauty && sp.beauty_condition && <Chip label={[{value:"new",label:"Nuevo"},{value:"like_new",label:"Como nuevo"},{value:"very_good",label:"Muy bueno"},{value:"good",label:"Bueno"},{value:"fair",label:"Regular"}].find(c=>c.value===sp.beauty_condition)?.label ?? sp.beauty_condition} href={buildUrl({ beauty_condition: undefined })} />}
              {isBeauty && sp.beauty_province && <Chip label={sp.beauty_province} href={buildUrl({ beauty_province: undefined })} />}
              {isHomeGarden && sp.hg_type && <Chip label={`Tipo: ${HG_TYPES.find(t => t.value === sp.hg_type)?.label ?? sp.hg_type}`} href={buildUrl({ hg_type: undefined })} />}
              {isHomeGarden && sp.hg_brand && <Chip label={`Marca: ${sp.hg_brand.charAt(0).toUpperCase() + sp.hg_brand.slice(1)}`} href={buildUrl({ hg_brand: undefined })} />}
              {isHomeGarden && sp.hg_condition && <Chip label={[{value:"new",label:"Nuevo"},{value:"like_new",label:"Como nuevo"},{value:"very_good",label:"Muy bueno"},{value:"good",label:"Bueno"},{value:"fair",label:"Regular"}].find(c=>c.value===sp.hg_condition)?.label ?? sp.hg_condition} href={buildUrl({ hg_condition: undefined })} />}
              {isHomeGarden && sp.hg_province && <Chip label={sp.hg_province} href={buildUrl({ hg_province: undefined })} />}
              {isSports && sp.sport_type && <Chip label={`Tipo: ${SPORTS_TYPES.find(t => t.value === sp.sport_type)?.label ?? sp.sport_type}`} href={buildUrl({ sport_type: undefined })} />}
              {isSports && sp.sport_brand && <Chip label={`Marca: ${sp.sport_brand.charAt(0).toUpperCase() + sp.sport_brand.slice(1)}`} href={buildUrl({ sport_brand: undefined })} />}
              {isSports && sp.sport_condition && <Chip label={[{value:"new",label:"Nuevo"},{value:"like_new",label:"Como nuevo"},{value:"very_good",label:"Muy bueno"},{value:"good",label:"Bueno"},{value:"fair",label:"Regular"}].find(c=>c.value===sp.sport_condition)?.label ?? sp.sport_condition} href={buildUrl({ sport_condition: undefined })} />}
              {isSports && sp.sport_province && <Chip label={sp.sport_province} href={buildUrl({ sport_province: undefined })} />}
              {isTools && sp.tool_type && <Chip label={`Tipo: ${TOOLS_TYPES.find(t => t.value === sp.tool_type)?.label ?? sp.tool_type}`} href={buildUrl({ tool_type: undefined })} />}
              {isTools && sp.tool_brand && <Chip label={`Marca: ${sp.tool_brand.charAt(0).toUpperCase() + sp.tool_brand.slice(1)}`} href={buildUrl({ tool_brand: undefined })} />}
              {isTools && sp.tool_condition && <Chip label={[{value:"new",label:"Nuevo"},{value:"like_new",label:"Como nuevo"},{value:"very_good",label:"Muy bueno"},{value:"good",label:"Bueno"},{value:"fair",label:"Regular"}].find(c=>c.value===sp.tool_condition)?.label ?? sp.tool_condition} href={buildUrl({ tool_condition: undefined })} />}
              {isTools && sp.tool_province && <Chip label={sp.tool_province} href={buildUrl({ tool_province: undefined })} />}
              {isToys && sp.toy_type && <Chip label={`Tipo: ${TOYS_TYPES.find(t => t.value === sp.toy_type)?.label ?? sp.toy_type}`} href={buildUrl({ toy_type: undefined })} />}
              {isToys && sp.toy_brand && <Chip label={`Marca: ${sp.toy_brand.charAt(0).toUpperCase() + sp.toy_brand.slice(1)}`} href={buildUrl({ toy_brand: undefined })} />}
              {isToys && sp.toy_condition && <Chip label={[{value:"new",label:"Nuevo"},{value:"like_new",label:"Como nuevo"},{value:"very_good",label:"Muy bueno"},{value:"good",label:"Bueno"},{value:"fair",label:"Regular"}].find(c=>c.value===sp.toy_condition)?.label ?? sp.toy_condition} href={buildUrl({ toy_condition: undefined })} />}
              {isToys && sp.toy_province && <Chip label={sp.toy_province} href={buildUrl({ toy_province: undefined })} />}
              {isBooks && sp.book_type && <Chip label={`Tipo: ${BOOKS_TYPES.find(t => t.value === sp.book_type)?.label ?? sp.book_type}`} href={buildUrl({ book_type: undefined })} />}
              {isBooks && sp.book_condition && <Chip label={[{value:"new",label:"Nuevo"},{value:"like_new",label:"Como nuevo"},{value:"very_good",label:"Muy bueno"},{value:"good",label:"Bueno"},{value:"fair",label:"Regular"}].find(c=>c.value===sp.book_condition)?.label ?? sp.book_condition} href={buildUrl({ book_condition: undefined })} />}
              {isBooks && sp.book_province && <Chip label={sp.book_province} href={buildUrl({ book_province: undefined })} />}
              {isPets && sp.pet_type && <Chip label={`Tipo: ${PETS_TYPES.find(t => t.value === sp.pet_type)?.label ?? sp.pet_type}`} href={buildUrl({ pet_type: undefined })} />}
              {isPets && sp.pet_province && <Chip label={sp.pet_province} href={buildUrl({ pet_province: undefined })} />}
              {isServices && sp.serv_type && <Chip label={`Rubro: ${SERVICES_TYPES.find(t => t.value === sp.serv_type)?.label ?? sp.serv_type}`} href={buildUrl({ serv_type: undefined })} />}
              {isServices && sp.serv_province && <Chip label={sp.serv_province} href={buildUrl({ serv_province: undefined })} />}
              {isOther && sp.other_type && <Chip label={OTHER_TYPES.find(t => t.value === sp.other_type)?.label ?? sp.other_type} href={buildUrl({ other_type: undefined })} />}
              {isOther && sp.other_condition && <Chip label={[{value:"new",label:"Nuevo"},{value:"like_new",label:"Como nuevo"},{value:"very_good",label:"Muy bueno"},{value:"good",label:"Bueno"},{value:"fair",label:"Regular"}].find(c=>c.value===sp.other_condition)?.label ?? sp.other_condition} href={buildUrl({ other_condition: undefined })} />}
              {isPhones && sp.phone_type && <Chip label={`Tipo: ${PHONE_TYPES.find(t => t.value === sp.phone_type)?.label ?? sp.phone_type}`} href={buildUrl({ phone_type: undefined })} />}
              {isPhones && sp.phone_brand && <Chip label={`Marca: ${sp.phone_brand.charAt(0).toUpperCase() + sp.phone_brand.slice(1)}`} href={buildUrl({ phone_brand: undefined })} />}
              {isPhones && sp.phone_storage && <Chip label={sp.phone_storage === "1tb" ? "1 TB" : sp.phone_storage.replace("gb", " GB").replace("tb", " TB")} href={buildUrl({ phone_storage: undefined })} />}
              {isPhones && sp.phone_condition && <Chip label={[{value:"new",label:"Nuevo"},{value:"like_new",label:"Como nuevo"},{value:"very_good",label:"Muy bueno"},{value:"good",label:"Bueno"},{value:"fair",label:"Regular"}].find(c=>c.value===sp.phone_condition)?.label ?? sp.phone_condition} href={buildUrl({ phone_condition: undefined })} />}
              {isPhones && sp.phone_ram && <Chip label={`RAM: ${sp.phone_ram.toUpperCase()}`} href={buildUrl({ phone_ram: undefined })} />}
              {isPhones && sp.phone_os && <Chip label={[{v:"android",l:"Android"},{v:"ios",l:"iOS"},{v:"harmonyos",l:"HarmonyOS"}].find(o=>o.v===sp.phone_os)?.l ?? sp.phone_os} href={buildUrl({ phone_os: undefined })} />}
              {isPhones && sp.phone_sim && <Chip label={[{v:"nano-sim",l:"Nano SIM"},{v:"dual-sim",l:"Dual SIM"},{v:"esim",l:"eSIM"},{v:"dual-sim-esim",l:"Dual SIM+eSIM"},{v:"micro-sim",l:"Micro SIM"}].find(s=>s.v===sp.phone_sim)?.l ?? sp.phone_sim} href={buildUrl({ phone_sim: undefined })} />}
              {isPhones && sp.phone_province && <Chip label={sp.phone_province} href={buildUrl({ phone_province: undefined })} />}
              {isPhones && sp.phone_box === "1" && <Chip label="Con caja original" href={buildUrl({ phone_box: undefined })} />}
              {isPhones && sp.phone_charger === "1" && <Chip label="Con cargador" href={buildUrl({ phone_charger: undefined })} />}
              {isPhones && sp.phone_unlocked === "1" && <Chip label="Liberado" href={buildUrl({ phone_unlocked: undefined })} />}
              {isPhones && sp.phone_trade === "1" && <Chip label="Acepta permuta" href={buildUrl({ phone_trade: undefined })} />}
              {sp.fuel && <Chip label={`Combustible: ${FUELS.find(f => f.value === sp.fuel)?.label ?? sp.fuel}`} href={buildUrl({ fuel: undefined })} />}
              {sp.transmission && <Chip label={`Transmisión: ${TRANSMISSIONS.find(t => t.value === sp.transmission)?.label ?? sp.transmission}`} href={buildUrl({ transmission: undefined })} />}
              {sp.year_from && <Chip label={`Desde ${sp.year_from}`} href={buildUrl({ year_from: undefined })} />}
              {sp.year_to && <Chip label={`Hasta ${sp.year_to}`} href={buildUrl({ year_to: undefined })} />}
              {sp.km_max && <Chip label={`Hasta ${Number(sp.km_max).toLocaleString("es-AR")} km`} href={buildUrl({ km_max: undefined })} />}
              {sp.seller_type && <Chip label={sp.seller_type === "particular" ? "Particular" : "Concesionaria"} href={buildUrl({ seller_type: undefined })} />}
              {sp.v_province && <Chip label={RE_LOCATIONS[sp.v_province]?.label ?? sp.v_province} href={buildUrl({ v_province: undefined, v_zone: undefined })} />}
              {sp.v_zone && <Chip label={RE_LOCATIONS[sp.v_province ?? ""]?.zones.find(z => z.value === sp.v_zone)?.label ?? sp.v_zone} href={buildUrl({ v_zone: undefined })} />}
              {sp.re_type && <Chip label={RE_PROPERTY_TYPES.find(t => t.value === sp.re_type)?.label ?? sp.re_type!} href={buildUrl({ re_type: undefined })} />}
              {sp.re_operation && <Chip label={RE_OPERATIONS.find(o => o.value === sp.re_operation)?.label ?? sp.re_operation!} href={buildUrl({ re_operation: undefined })} />}
              {sp.re_province && <Chip label={RE_LOCATIONS[sp.re_province]?.label ?? sp.re_province} href={buildUrl({ re_province: undefined, re_zone: undefined })} />}
              {sp.re_zone && <Chip label={ALL_RE_ZONES.find(z => z.value === sp.re_zone)?.label ?? sp.re_zone!} href={buildUrl({ re_zone: undefined })} />}
              {sp.re_bedrooms && <Chip label={`${sp.re_bedrooms === "monoambiente" ? "Monoambiente" : `${sp.re_bedrooms} dorm.`}`} href={buildUrl({ re_bedrooms: undefined })} />}
              {sp.re_bathrooms && <Chip label={`${sp.re_bathrooms} baño(s)`} href={buildUrl({ re_bathrooms: undefined })} />}
              {sp.m2_min && <Chip label={`Desde ${sp.m2_min} m²`} href={buildUrl({ m2_min: undefined })} />}
              {sp.m2_max && <Chip label={`Hasta ${sp.m2_max} m²`} href={buildUrl({ m2_max: undefined })} />}
              {sp.re_seller && <Chip label={sp.re_seller === "particular" ? "Dueño directo" : "Inmobiliaria"} href={buildUrl({ re_seller: undefined })} />}
              {RE_FEATURES.map(f => (sp as any)[f.key] === "1" ? <Chip key={f.key} label={f.label} href={buildUrl({ [f.key]: undefined } as any)} /> : null)}
              {sp.price_min && <Chip label={`Precio desde $${Number(sp.price_min).toLocaleString("es-AR")}`} href={buildUrl({ price_min: undefined })} />}
              {sp.price_max && <Chip label={`Precio hasta $${Number(sp.price_max).toLocaleString("es-AR")}`} href={buildUrl({ price_max: undefined })} />}
              {sp.q && <Chip label={`"${sp.q}"`} href={buildUrl({ q: undefined })} />}
            </div>
          )}

          {/* Subcategory pills — mobile only */}
          <SubcategoryPills
            pills={subcatPills}
            allHref={subcatAllHref}
            allCount={listings?.length ?? 0}
            isAllActive={subcatIsAllActive}
          />

          {/* Grid / List */}
          {!listings || listings.length === 0 ? (
            <div style={{
              background: "#fff", borderRadius: "10px",
              padding: "64px", textAlign: "center", color: "#999",
            }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔍</div>
              <p style={{ fontSize: "15px", marginBottom: "12px" }}>No se encontraron avisos con esos filtros.</p>
              <Link href={`/category/${slug}`} style={{ textDecoration: "none" }}>
                <span style={{ color: "#2563eb", fontSize: "14px", fontWeight: 600 }}>Ver todos →</span>
              </Link>
            </div>
          ) : sp.view === "list" ? (
            <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
              {listings.map((listing: any, i: number) => {
                const images = listing.listing_images as { url: string; position: number }[] | null;
                const cover = images?.slice().sort((a: any, b: any) => a.position - b.position)[0]?.url ?? null;
                const breadcrumbs = [
                  listing.attributes?.sub_category
                    ? { label: VEHICLE_TYPES.find((t: any) => t.value === listing.attributes.sub_category)?.label ?? listing.attributes.sub_category, variant: "primary" as const }
                    : null,
                  listing.attributes?.brand
                    ? { label: VEHICLE_BRANDS.find((b: any) => b.value === listing.attributes.brand)?.label ?? listing.attributes.brand, variant: "secondary" as const }
                    : null,
                  listing.attributes?.model
                    ? { label: listing.attributes.model, variant: "secondary" as const }
                    : null,
                ].filter(Boolean) as { label: string; variant: "primary" | "secondary" }[];
                return (
                  <ListingListCard
                    key={listing.id}
                    id={listing.id}
                    title={listing.title}
                    price={listing.price}
                    currency={listing.currency}
                    featured_level={listing.featured_level}
                    cover_image={cover}
                    condition={listing.condition ?? listing.attributes?.condition ?? null}
                    neighborhood={listing.neighborhood}
                    breadcrumbs={breadcrumbs.length > 0 ? breadcrumbs : undefined}
                    showDivider={i < listings.length - 1}
                  />
                );
              })}
            </div>
          ) : (() => {
            const featured = listings.filter((l: any) => l.featured_level);
            const regular  = listings.filter((l: any) => !l.featured_level);
            const cardGrid = (items: any[]) => (
              <div className="grid-cols-auto">
                {items.map((listing: any) => {
                  const images = listing.listing_images as { url: string; position: number }[] | null;
                  const cover = images?.slice().sort((a, b) => a.position - b.position)[0]?.url ?? null;
                  return (
                    <ListingCard
                      key={listing.id}
                      id={listing.id}
                      title={listing.title}
                      price={listing.price}
                      currency={listing.currency ?? "ARS"}
                      cover_image={cover}
                      neighborhood={listing.neighborhood}
                      featured_level={(listing as any).featured_level ?? null}
                      attributes={listing.attributes as Record<string, string | number | boolean | null> | undefined}
                      view_count={(listing as any).view_count ?? null}
                      created_at={(listing as any).created_at ?? null}
                      is_store={storeMap[(listing as any).user_id]?.is_store ?? null}
                      store_name={storeMap[(listing as any).user_id]?.store_name ?? null}
                    />
                  );
                })}
              </div>
            );
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {featured.length > 0 && cardGrid(featured)}
                {regular.length > 0 && cardGrid(regular)}
              </div>
            );
          })()}
        </div>


      </div>
    </div>
    </div>
  );
}

function Chip({ label, href }: { label: string; href: string }) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <span style={{
        display: "inline-flex", alignItems: "center", gap: "5px",
        background: "#dbeafe", color: "#1d4ed8",
        borderRadius: "20px", padding: "4px 10px",
        fontSize: "12px", fontWeight: 600, cursor: "pointer",
      }}>
        {label} <span style={{ fontSize: "11px" }}>✕</span>
      </span>
    </Link>
  );
}
