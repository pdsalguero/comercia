/**
 * Seed completo — borra todo y recrea avisos para TODAS las categorías
 * Ejecutar: npx tsx scripts/seed-users.ts
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://hbeswalibpblqkrdqczh.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiZXN3YWxpYnBibHFrcmRxY3poIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjYzNzgzOSwiZXhwIjoyMDg4MjEzODM5fQ.N7NFhS6hSfOpReke3Sg4DNnf2w2ni286JvVjReI0qiA";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const USERS = [
  { id: "1eac7832-afec-4784-b442-8780c5aa62e8", name: "Carlos Méndez" },
  { id: "4aef0326-7e04-4a31-8af5-c1c7f2b5118d", name: "Laura García" },
  { id: "1fd1b73e-443c-427f-a282-d7cdcf9adeb1", name: "Martín López" },
];

// ── Imágenes Unsplash por categoría ────────────────────────────────────────
const IMGS: Record<string, string[]> = {
  electronics: [
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
    "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80",
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80",
    "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80",
    "https://images.unsplash.com/photo-1585770536735-27993a593c90?w=800&q=80",
  ],
  vehicles: [
    "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80",
    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80",
    "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80",
    "https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800&q=80",
    "https://images.unsplash.com/photo-1568844293986-8d0400bd4745?w=800&q=80",
  ],
  "real-estate": [
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80",
    "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&q=80",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
  ],
  clothing: [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80",
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80",
    "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80",
    "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800&q=80",
  ],
  "home-garden": [
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
    "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80",
    "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80",
  ],
  sports: [
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80",
    "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80",
    "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&q=80",
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80",
    "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=800&q=80",
  ],
  tools: [
    "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80",
    "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80",
    "https://images.unsplash.com/photo-1581092787765-e3feb951d987?w=800&q=80",
    "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80",
    "https://images.unsplash.com/photo-1590664863685-a99ef05e9f61?w=800&q=80",
  ],
  books: [
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80",
    "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80",
    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80",
    "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80",
    "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&q=80",
  ],
  pets: [
    "https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&q=80",
    "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80",
    "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80",
    "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=800&q=80",
    "https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?w=800&q=80",
  ],
  other: [
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
    "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80",
    "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&q=80",
  ],
  phones: [
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80",
    "https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?w=800&q=80",
    "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80",
    "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&q=80",
    "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80",
  ],
  appliances: [
    "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&q=80",
    "https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?w=800&q=80",
    "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=800&q=80",
    "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  ],
  babies: [
    "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&q=80",
    "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&q=80",
    "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80",
    "https://images.unsplash.com/photo-1478369402113-1fd53f17e8b4?w=800&q=80",
    "https://images.unsplash.com/photo-1611843467160-25afb8df1074?w=800&q=80",
  ],
  "beauty-health": [
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80",
    "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800&q=80",
    "https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=800&q=80",
    "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&q=80",
    "https://images.unsplash.com/photo-1607008829749-c0f284a49fc4?w=800&q=80",
  ],
  toys: [
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&q=80",
    "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=800&q=80",
    "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80",
    "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&q=80",
  ],
  services: [
    "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=800&q=80",
    "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&q=80",
    "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&q=80",
    "https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?w=800&q=80",
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80",
  ],
};

const NEIGHBORHOODS = [
  "Capital, San Juan",
  "Rivadavia, San Juan",
  "Rawson, San Juan",
  "Santa Lucía, San Juan",
  "Chimbas, San Juan",
  "Pocito, San Juan",
  "Caucete, San Juan",
  "Albardón, San Juan",
  "Zonda, San Juan",
  "Ullum, San Juan",
];

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const mkSlug = (title: string, id: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50) + "-" + id.slice(0, 6);

type FL = "gold" | "silver" | null;
interface L {
  title: string;
  description: string;
  price: number;
  currency: "ARS" | "USD";
  condition: "new" | "like_new" | "very_good" | "good" | "fair";
  category_slug: string;
  featured_level: FL;
  attributes: Record<string, unknown>;
  user: 0 | 1 | 2; // index into USERS
}

// ─────────────────────────────────────────────────────────────────────────────
// TODOS LOS AVISOS
// ─────────────────────────────────────────────────────────────────────────────
const ALL_LISTINGS: L[] = [

  // ── ELECTRÓNICA ───────────────────────────────────────────────────────────
  {
    user: 0, category_slug: "electronics", featured_level: "gold",
    title: "MacBook Air M3 15\" 16GB 512GB – Como nueva",
    description: "Comprada en noviembre 2024. Impecable, sin rayones. Batería con 28 ciclos. Viene con caja original, cargador MagSafe y funda de neoprene. Ideal para trabajo, diseño o estudio.",
    price: 2_200_000, currency: "ARS", condition: "like_new",
    attributes: { sub_category: "computadora", brand: "Apple", model: "MacBook Air M3 15\"", storage: "512gb", ram: "16gb", color: "Midnight" },
  },
  {
    user: 2, category_slug: "electronics", featured_level: "gold",
    title: "Sony PlayStation 5 Slim + 2 mandos + 4 juegos",
    description: "PS5 Slim con lector de discos. Incluye 2 mandos DualSense, FIFA 25, Spider-Man 2, Gran Turismo 7 y EA Sports FC 24. Todo en perfecto estado.",
    price: 1_050_000, currency: "ARS", condition: "like_new",
    attributes: { sub_category: "consola", brand: "Sony", model: "PlayStation 5 Slim", color: "Blanco", includes_box: true },
  },
  {
    user: 0, category_slug: "electronics", featured_level: "silver",
    title: "Smart TV Samsung 65\" QLED 4K – Perfecto estado",
    description: "Televisor QLED 65\" con panel Quantum Dot, HDR10+, sistema Tizen. Control de voz incluido. 2 años de uso, imagen espectacular. Con soporte de pared.",
    price: 680_000, currency: "ARS", condition: "very_good",
    attributes: { sub_category: "tv", brand: "Samsung", model: "QN65Q70C", color: "Negro" },
  },
  {
    user: 2, category_slug: "electronics", featured_level: null,
    title: "Tablet iPad 10ma Gen 64GB WiFi – Con Smart Folio",
    description: "iPad 10ma generación en perfecto estado. Con Smart Folio azul y Apple Pencil de 1era gen incluidos. Batería al 97%.",
    price: 590_000, currency: "ARS", condition: "like_new",
    attributes: { sub_category: "tablet", brand: "Apple", model: "iPad 10ma Gen 64GB", storage: "64gb", color: "Azul", includes_box: true },
  },

  // ── VEHÍCULOS ─────────────────────────────────────────────────────────────
  {
    user: 0, category_slug: "vehicles", featured_level: "gold",
    title: "Toyota Corolla Cross XEI 2023 – Única dueña, 18.000 km",
    description: "SUV compacto híbrido en estado impecable. Full equipo: cuero, techo solar, pantalla 9\", asientos ventilados. Garantía vigente. Acepta permuta.",
    price: 38_000_000, currency: "ARS", condition: "like_new",
    attributes: { sub_category: "camioneta", brand: "toyota", model: "Corolla Cross XEI Híbrido", year: 2023, km: 18000, fuel: "hibrido", transmission: "automatica", doors: "5", color: "Blanco Perlado", first_owner: true, accepts_trade: true, seller_type: "particular" },
  },
  {
    user: 2, category_slug: "vehicles", featured_level: "gold",
    title: "Yamaha MT-09 SP 2023 – 8.000 km perfecta",
    description: "Naked 890cc con suspensión KYB semi-activa, quickshifter y cruise control. Siempre en taller Yamaha. Con escapes Arrow titanio. Un accesorio más.",
    price: 12_500_000, currency: "ARS", condition: "like_new",
    attributes: { sub_category: "moto", brand: "honda", model: "Yamaha MT-09 SP", year: 2023, km: 8000, fuel: "nafta", color: "Gris / Negro", seller_type: "particular" },
  },
  {
    user: 0, category_slug: "vehicles", featured_level: "silver",
    title: "VW Amarok V6 Highline 2020 – 4x4 AT, full",
    description: "Pickup full con motor V6 TDI 258CV. Cuero, dif trasero, cámara 360°, Climatronic. Servicio en concesionaria. Estado como nueva.",
    price: 55_000_000, currency: "ARS", condition: "very_good",
    attributes: { sub_category: "camioneta", brand: "volkswagen", model: "Amarok V6 Highline", year: 2020, km: 62000, fuel: "diesel", transmission: "automatica", doors: "4", color: "Plata", first_owner: true, seller_type: "particular" },
  },
  {
    user: 2, category_slug: "vehicles", featured_level: null,
    title: "Fiat Cronos Drive 2022 – GNC, nafta. 1 sola dueña",
    description: "Sedán en excelente estado. GNC 5ta generación carga completa. Servicio al día en concesionaria Fiat. Papeles y VTV al día.",
    price: 16_500_000, currency: "ARS", condition: "very_good",
    attributes: { sub_category: "auto", brand: "fiat", model: "Cronos Drive", year: 2022, km: 34000, fuel: "gnc", transmission: "manual", doors: "4", color: "Blanco", first_owner: true, seller_type: "particular" },
  },
  {
    user: 1, category_slug: "vehicles", featured_level: null,
    title: "Honda Wave 110 2021 – Movilidad económica, papeles OK",
    description: "Moto urbana económica, 5.500 km. Frenos de disco, sistema de arranque eléctrico y patada. Muy buen estado. VTV al día.",
    price: 1_850_000, currency: "ARS", condition: "good",
    attributes: { sub_category: "moto", brand: "honda", model: "Wave 110", year: 2021, km: 5500, fuel: "nafta", color: "Rojo / Negro", seller_type: "particular" },
  },

  // ── INMUEBLES ─────────────────────────────────────────────────────────────
  {
    user: 1, category_slug: "real-estate", featured_level: "gold",
    title: "Depto 2 amb amoblado – Alquiler Capital, luminoso",
    description: "Moderno departamento en piso 4 con balcón y orientación norte. Cocina integrada, A/A, WiFi incluido, lavarropas. Listo para entrar. Ideal profesional o pareja.",
    price: 480_000, currency: "ARS", condition: "new",
    attributes: { sub_category: "departamento", operation: "alquiler", zone: "capital", bedrooms: "1", bathrooms: "1", m2_covered: 48, rooms: "2", furnished: true, air_conditioning: true, elevator: true, pets_allowed: true, seller_type: "particular" },
  },
  {
    user: 1, category_slug: "real-estate", featured_level: "gold",
    title: "Casa 3 dorm con pileta – Rivadavia, a estrenar",
    description: "Hermosa casa de 190m² cubiertos. Cocina open space con isla, 3 dormitorios, 2 baños completos. Jardín delantero y trasero con pileta. Barrio tranquilo.",
    price: 115_000, currency: "USD", condition: "new",
    attributes: { sub_category: "casa", operation: "venta", zone: "rivadavia", bedrooms: "3", bathrooms: "2", m2_covered: 190, m2_total: 500, age: "estrenar", garage: true, pool: true, grill: true, seller_type: "particular" },
  },
  {
    user: 0, category_slug: "real-estate", featured_level: "silver",
    title: "Departamento 3 ambientes – Rawson, 70m², vista al parque",
    description: "Piso 2 con balcón corrido y vista al parque Rawson. Dos dormitorios, living amplio, baño y toilette. Edificio con vigilancia.",
    price: 72_000, currency: "USD", condition: "very_good",
    attributes: { sub_category: "departamento", operation: "venta", zone: "rawson", bedrooms: "2", bathrooms: "2", m2_covered: 70, rooms: "3", floor: "2", elevator: true, security: true, seller_type: "inmobiliaria" },
  },
  {
    user: 0, category_slug: "real-estate", featured_level: null,
    title: "Terreno 600m² en Pocito – Escritura, servicios completos",
    description: "Lote en barrio residencial tranquilo. Agua, luz, gas y asfalto en puerta. Escritura en mano. Apto crédito hipotecario.",
    price: 28_000, currency: "USD", condition: "new",
    attributes: { sub_category: "terreno", operation: "venta", zone: "pocito", m2_total: 600, credit_eligible: true, seller_type: "particular" },
  },
  {
    user: 2, category_slug: "real-estate", featured_level: null,
    title: "Alquiler local comercial 60m² – Av. Libertador, Capital",
    description: "Local sobre avenida principal con gran vidriera y acceso independiente. 60m² distribuidos en salón + deposito + baño. Apto cualquier rubro.",
    price: 350_000, currency: "ARS", condition: "good",
    attributes: { sub_category: "local", operation: "alquiler", zone: "capital", m2_covered: 60, seller_type: "inmobiliaria" },
  },

  // ── ROPA Y CALZADO ────────────────────────────────────────────────────────
  {
    user: 2, category_slug: "clothing", featured_level: "silver",
    title: "Campera Patagonia Down Sweater – Talle L, azul marino",
    description: "Campera de pluma premium, usada 2 inviernos. Calidad excepcional, sin deformaciones. Relleno distribuido uniformemente. Talle L generoso.",
    price: 95_000, currency: "ARS", condition: "very_good",
    attributes: { sub_category: "campera", gender: "hombre", size: "L", brand: "Patagonia", color: "Azul marino", material: "Plumón / Nylon" },
  },
  {
    user: 1, category_slug: "clothing", featured_level: null,
    title: "Vestido de lino verano – Talle S, off white",
    description: "Vestido midi de lino 100%, cintura fruncida con lazo, tirantes anchos. Usado una vez. Fresco y elegante para el día a día.",
    price: 28_000, currency: "ARS", condition: "like_new",
    attributes: { sub_category: "vestido", gender: "mujer", size: "S", color: "Off white", material: "Lino" },
  },
  {
    user: 1, category_slug: "clothing", featured_level: null,
    title: "Zapatillas Adidas NMD R1 – Talle 38, blancas",
    description: "Zapatillas de colección, muy poco uso. Suela Boost en perfecto estado. Con caja y extra cordones. Talle 38.",
    price: 75_000, currency: "ARS", condition: "like_new",
    attributes: { sub_category: "calzado", gender: "mujer", size: "38", brand: "Adidas", color: "Blanco / Gris" },
  },
  {
    user: 0, category_slug: "clothing", featured_level: null,
    title: "Conjunto deportivo Nike Dri-FIT – Talle M",
    description: "Remera + short de entrenamiento Nike Dri-FIT. Poco uso, sin deformaciones ni decoloración. Ideal para gym o running.",
    price: 32_000, currency: "ARS", condition: "very_good",
    attributes: { sub_category: "deportivo", gender: "hombre", size: "M", brand: "Nike", color: "Negro / Naranja" },
  },
  {
    user: 2, category_slug: "clothing", featured_level: null,
    title: "Mocasines de cuero Gucci – Talle 43, marrón",
    description: "Mocasines originales con herraje doble G. Cuero genuino, suela de goma. Comprados en Europa. Con caja y bolsa de tela original.",
    price: 420_000, currency: "ARS", condition: "very_good",
    attributes: { sub_category: "calzado", gender: "hombre", size: "43", brand: "Gucci", color: "Marrón", material: "Cuero" },
  },

  // ── HOGAR Y MUEBLES ───────────────────────────────────────────────────────
  {
    user: 1, category_slug: "home-garden", featured_level: "silver",
    title: "Sofá 3 cuerpos Chesterfield – Terciopelo verde botella",
    description: "Sofá Chesterfield de terciopelo verde botella con botones capitoné. Estructura de madera maciza. 2 años de uso, excelente estado. Retiro en Capital.",
    price: 380_000, currency: "ARS", condition: "very_good",
    attributes: { sub_category: "muebles", color: "Verde botella", material: "Terciopelo / Madera" },
  },
  {
    user: 0, category_slug: "home-garden", featured_level: null,
    title: "Escritorio en L madera melamina – 160x120cm",
    description: "Escritorio en L con cajonera rodante de 3 cajones. Color roble oscuro. Muy buen estado, fácil desmontaje para traslado.",
    price: 95_000, currency: "ARS", condition: "good",
    attributes: { sub_category: "muebles", color: "Roble oscuro", material: "Melamina", dimensions: "160x120 cm" },
  },
  {
    user: 1, category_slug: "home-garden", featured_level: null,
    title: "Set de jardín 4 sillas + mesa ratona ratán sintético",
    description: "Juego de jardín ratán sintético color arena. Mesa de vidrio templado + 4 sillas con cojines impermeables azules. Como nuevo.",
    price: 185_000, currency: "ARS", condition: "like_new",
    attributes: { sub_category: "jardin-exterior", color: "Arena / Azul", material: "Ratán sintético" },
  },
  {
    user: 2, category_slug: "home-garden", featured_level: null,
    title: "Iluminación LED colgante para cocina – 3 piezas",
    description: "Set de 3 lámparas colgantes estilo industrial con pantalla de vidrio ámbar. Cable trenzado ajustable. Casquillo E27. Sin uso.",
    price: 42_000, currency: "ARS", condition: "new",
    attributes: { sub_category: "iluminacion", color: "Negro / Ámbar", material: "Hierro / Vidrio" },
  },

  // ── DEPORTES ──────────────────────────────────────────────────────────────
  {
    user: 2, category_slug: "sports", featured_level: "gold",
    title: "Bicicleta MTB Trek Marlin 7 29\" – Talle L, 1 temporada",
    description: "Mountain bike aluminio con frenos hidráulicos Shimano, suspensión 100mm, 12 velocidades. Muy poco uso. Con portabidón y bolso bajo sillín.",
    price: 580_000, currency: "ARS", condition: "very_good",
    attributes: { sub_category: "bicicleta", brand: "Trek", size: '29" / Talle L', color: "Rojo / Negro" },
  },
  {
    user: 0, category_slug: "sports", featured_level: "silver",
    title: "Pelota de fútbol adidas FIFA Quality Pro – Nueva",
    description: "Pelota oficial adidas con cámara butyl y costura a mano. Aprobación FIFA Quality Pro. Sin uso, en caja original.",
    price: 38_000, currency: "ARS", condition: "new",
    attributes: { sub_category: "futbol", brand: "Adidas", color: "Blanco / Negro" },
  },
  {
    user: 2, category_slug: "sports", featured_level: null,
    title: "Raqueta de pádel Bullpadel Vertex 03 – Grip 3",
    description: "Raqueta de competición en carbono 18K. Nivel avanzado/profesional. Usada 4 meses. Incluye funda y 2 overgrips nuevos.",
    price: 165_000, currency: "ARS", condition: "very_good",
    attributes: { sub_category: "padel", brand: "Bullpadel", size: "Grip 3", color: "Azul / Negro" },
  },
  {
    user: 1, category_slug: "sports", featured_level: null,
    title: "Colchoneta yoga antideslizante 6mm – Manduka PRO",
    description: "Colchoneta Manduka PRO de 6mm, la mejor del mercado. Color morado lavanda. Poco uso, sin rasgaduras. Con bolsa de transporte.",
    price: 55_000, currency: "ARS", condition: "like_new",
    attributes: { sub_category: "fitness", brand: "Manduka", color: "Lavanda" },
  },

  // ── HERRAMIENTAS ──────────────────────────────────────────────────────────
  {
    user: 0, category_slug: "tools", featured_level: "silver",
    title: "Soldadora inverter Lincoln Electric 200A – Poco uso",
    description: "Soldadora TIG/MMA 200A con display digital y función Hot Start. Con pinzas, careta automática oscurecimiento y electrodos variados. Poco uso.",
    price: 280_000, currency: "ARS", condition: "very_good",
    attributes: { sub_category: "soldadura", brand: "Lincoln Electric", voltage: "220v" },
  },
  {
    user: 0, category_slug: "tools", featured_level: null,
    title: "Router fresadora Bosch GOF 1250 CE – Profesional",
    description: "Fresadora 1250W con control electrónico de velocidad y microrregulación de profundidad. Incluye accesorios y maletín original. En perfecto estado.",
    price: 155_000, currency: "ARS", condition: "very_good",
    attributes: { sub_category: "manual", brand: "Bosch", voltage: "220v" },
  },
  {
    user: 2, category_slug: "tools", featured_level: null,
    title: "Kit Stanley 94 piezas – Maleta completa",
    description: "Juego de herramientas Stanley con destornilladores, llaves, alicates, martillo, cinta métrica y más. Nunca usado. Ideal regalo.",
    price: 72_000, currency: "ARS", condition: "new",
    attributes: { sub_category: "manual", brand: "Stanley", voltage: "n/a" },
  },
  {
    user: 1, category_slug: "tools", featured_level: null,
    title: "Taladro inalámbrico Makita 18V con 2 baterías",
    description: "Taladro/atornillador Makita DDF483 18V. Incluye 2 baterías BL1830, cargador DC18RC y maletín. 25 posiciones de torque. Poco uso.",
    price: 195_000, currency: "ARS", condition: "like_new",
    attributes: { sub_category: "electrica", brand: "Makita", voltage: "18v batería" },
  },

  // ── MÚSICA, LIBROS Y REVISTAS ─────────────────────────────────────────────
  {
    user: 2, category_slug: "books", featured_level: "silver",
    title: "Vinilo Pink Floyd – The Wall (doble LP) Edición 2016",
    description: "Vinilo remasterizado doble LP 180g. En excelente estado, sin rayaduras. Incluye funda interior antiestática. Para coleccionistas.",
    price: 65_000, currency: "ARS", condition: "very_good",
    attributes: { sub_category: "musica", author: "Pink Floyd / Parlophone", language: "otro" },
  },
  {
    user: 1, category_slug: "books", featured_level: null,
    title: "Colección Cortázar – Obras completas 5 tomos tapa dura",
    description: "Edición especial Alfaguara con los 5 tomos de obras completas de Julio Cortázar. Estado impecable. Solo lectura.",
    price: 35_000, currency: "ARS", condition: "very_good",
    attributes: { sub_category: "libros", author: "Julio Cortázar / Alfaguara", language: "espanol" },
  },
  {
    user: 2, category_slug: "books", featured_level: null,
    title: "CD jazz clásico – Lote 25 discos, Miles Davis, Coltrane",
    description: "Colección de 25 CDs de jazz clásico: Miles Davis, John Coltrane, Thelonious Monk, Bill Evans. Todos en perfecto estado con sus estuches.",
    price: 28_000, currency: "ARS", condition: "very_good",
    attributes: { sub_category: "musica", author: "Varios artistas", language: "otro" },
  },
  {
    user: 0, category_slug: "books", featured_level: null,
    title: "Manga Dragon Ball Z – Tomos 1 al 26 completo",
    description: "Colección completa Dragon Ball Z edición argentina. Todos los tomos en muy buen estado. Algunos con marcas mínimas de uso.",
    price: 85_000, currency: "ARS", condition: "good",
    attributes: { sub_category: "comic-manga", author: "Akira Toriyama / Ivrea", language: "espanol" },
  },

  // ── MASCOTAS ──────────────────────────────────────────────────────────────
  {
    user: 1, category_slug: "pets", featured_level: "gold",
    title: "Cachorros Labrador Retriever – Con pedigree FCA, vacunados",
    description: "Hermosa camada de 7 cachorros Labrador amarillos y negros, 50 días de vida. Padres con pedigree FCA. Vacunados, desparasitados, con cartilla sanitaria. Garantía de salud.",
    price: 280_000, currency: "ARS", condition: "new",
    attributes: { sub_category: "perros", breed: "Labrador Retriever", age: "50 días", vaccinated: true, pedigree: true, is_adoption: false },
  },
  {
    user: 0, category_slug: "pets", featured_level: null,
    title: "Collar y correa cuero premium para perro grande",
    description: "Collar ancho 3cm y correa 1.80m de cuero genuino marrón. Hebilla inoxidable reforzada. Para razas grandes. Nuevo, sin uso.",
    price: 18_500, currency: "ARS", condition: "new",
    attributes: { sub_category: "collar-correa", brand: "ArteMadera" },
  },
  {
    user: 1, category_slug: "pets", featured_level: null,
    title: "Adopción – Gato tricolor, 3 años, castrado y vacunado",
    description: "Mochi es un gato tricolor sociable y cariñoso. Castrado, al día con vacunas y antiparasitario. Busca hogar responsable. Se entregan antiparasitarios.",
    price: 0, currency: "ARS", condition: "new",
    attributes: { sub_category: "gatos", breed: "Tricolor doméstico", age: "3 años", sex: "macho", vaccinated: true, pedigree: false, is_adoption: true },
  },
  {
    user: 2, category_slug: "pets", featured_level: null,
    title: "Alimento premium Royal Canin Maxi Adult 15kg",
    description: "Bolsa cerrada de 15kg Royal Canin Maxi Adult para perros medianos y grandes. Fecha de vencimiento: 12/2026. No la usé porque cambié de perro.",
    price: 42_000, currency: "ARS", condition: "new",
    attributes: { sub_category: "alimentacion", brand: "Royal Canin" },
  },

  // ── OTROS ─────────────────────────────────────────────────────────────────
  {
    user: 2, category_slug: "other", featured_level: "silver",
    title: "Telescopio Celestron NexStar 5SE – Motor goto automático",
    description: "Telescopio Schmidt-Cassegrain 125mm con montura motorizada NexStar. Localiza objetos automáticamente. Incluye trípode, 2 oculares y bolso de transporte.",
    price: 680_000, currency: "ARS", condition: "very_good",
    attributes: { sub_category: "Telescopio / Astronomía", brand: "Celestron" },
  },
  {
    user: 0, category_slug: "other", featured_level: null,
    title: "Máquina de coser Singer Tradition 2282 – Con mesa",
    description: "Máquina de coser Singer mecánica con 23 puntadas. Incluye mesa/mueble de madera. Funcionando perfectamente. Ideal para quien empieza o uso doméstico.",
    price: 95_000, currency: "ARS", condition: "good",
    attributes: { sub_category: "Costura / Textil", brand: "Singer" },
  },
  {
    user: 1, category_slug: "other", featured_level: null,
    title: "Cámara analógica Contax T2 – Titanio, 38mm f/2.8",
    description: "Icónica cámara compacta de 35mm. Obturador funcionando. Probada con rollo Kodak Portra 400. Sin raspaduras. La joya de cualquier colección.",
    price: 950_000, currency: "ARS", condition: "very_good",
    attributes: { sub_category: "Cámara / Fotografía", brand: "Contax" },
  },

  // ── CELULARES ─────────────────────────────────────────────────────────────
  {
    user: 0, category_slug: "phones", featured_level: "gold",
    title: "Samsung Galaxy S24 Ultra 256GB Titanium Black",
    description: "El mejor Samsung del mercado. Con S Pen integrado, cámara 200MP, AI generativa. Comprado hace 3 meses. Batería al 99%. Con caja, cargador 45W y 2 fundas.",
    price: 1_450_000, currency: "ARS", condition: "like_new",
    attributes: { sub_category: "smartphone", brand: "samsung", model: "Galaxy S24 Ultra", storage: "256gb", color: "Titanium Black", includes_box: true, includes_charger: true },
  },
  {
    user: 1, category_slug: "phones", featured_level: "gold",
    title: "iPhone 15 Pro 128GB – Natural Titanium",
    description: "iPhone 15 Pro con cámara 48MP, chip A17 Pro, Dynamic Island. Batería al 96%. Con magsafe, caja original y funda transparente. Sin arañazos.",
    price: 1_280_000, currency: "ARS", condition: "like_new",
    attributes: { sub_category: "smartphone", brand: "apple", model: "iPhone 15 Pro 128GB", storage: "128gb", color: "Natural Titanium", includes_box: true, includes_charger: false },
  },
  {
    user: 2, category_slug: "phones", featured_level: null,
    title: "Motorola Edge 40 Neo 256GB – Azul, como nuevo",
    description: "Celular con pantalla pOLED 144Hz, cámara 50MP, carga 68W. 6 meses de uso, siempre con protector y funda. Batería al 95%.",
    price: 420_000, currency: "ARS", condition: "like_new",
    attributes: { sub_category: "smartphone", brand: "motorola", model: "Edge 40 Neo 256GB", storage: "256gb", color: "Azul Ícono", includes_box: true, includes_charger: true },
  },
  {
    user: 0, category_slug: "phones", featured_level: null,
    title: "Xiaomi Redmi Note 13 Pro+ 512GB – Nuevo sellado",
    description: "Celular nuevo en caja sellada, comprado en el exterior. Pantalla AMOLED 120Hz, cámara 200MP, carga 120W. Garantía internacional.",
    price: 580_000, currency: "ARS", condition: "new",
    attributes: { sub_category: "smartphone", brand: "xiaomi", model: "Redmi Note 13 Pro+ 512GB", storage: "512gb", color: "Midnight Black", includes_box: true, includes_charger: true },
  },

  // ── ELECTRODOMÉSTICOS ─────────────────────────────────────────────────────
  {
    user: 1, category_slug: "appliances", featured_level: "silver",
    title: "Heladera Inverter LG No Frost 440L – Poco uso",
    description: "Heladera inox con dispensador de agua, Door Cooling y compresor inverter. 18 meses de uso. Ahorra energía. Con manual y garantía vigente.",
    price: 450_000, currency: "ARS", condition: "like_new",
    attributes: { sub_category: "heladera", brand: "LG", color: "Inox / Plateado" },
  },
  {
    user: 2, category_slug: "appliances", featured_level: null,
    title: "Lavarropas Whirlpool 9kg Carga Superior Inverter",
    description: "Lavarropas carga superior 9kg con motor inverter y 12 programas de lavado. 2 años de uso. Funcionando perfecto. Sin ruidos ni filtraciones.",
    price: 260_000, currency: "ARS", condition: "very_good",
    attributes: { sub_category: "lavarropas", brand: "Whirlpool", color: "Blanco" },
  },
  {
    user: 0, category_slug: "appliances", featured_level: null,
    title: "Aire acondicionado Inverter Midea 4500 frigorías",
    description: "Split frío/calor inverter 4500 frigorías. Bajo consumo A+++. 3 años de uso, service realizado. Se incluye soporte pero no la instalación.",
    price: 380_000, currency: "ARS", condition: "good",
    attributes: { sub_category: "aire", brand: "Midea", color: "Blanco" },
  },
  {
    user: 1, category_slug: "appliances", featured_level: null,
    title: "Horno eléctrico convector Peabody 45L – Acero inox",
    description: "Horno eléctrico convector de 45 litros con plancha y parrilla. Timer, termóstato y luz interior. 1 año de uso. Ideal para cocina pequeña.",
    price: 75_000, currency: "ARS", condition: "very_good",
    attributes: { sub_category: "horno", brand: "Peabody", color: "Acero Inoxidable" },
  },

  // ── BEBÉS Y NIÑOS ─────────────────────────────────────────────────────────
  {
    user: 1, category_slug: "babies", featured_level: "gold",
    title: "Travel System Cybex Balios S Lux + Cocoon S – Completo",
    description: "Sistema modular Cybex premium: silla Balios S Lux + cocoon para recién nacido + adaptadores. Color Lava Grey. Usado 8 meses. Estado impecable.",
    price: 480_000, currency: "ARS", condition: "like_new",
    attributes: { sub_category: "paseo", brand: "Cybex", color: "Lava Grey" },
  },
  {
    user: 1, category_slug: "babies", featured_level: "silver",
    title: "Silla de auto Chicco Seat3Fit – Grupos 0/1/2",
    description: "Silla Chicco con ISOFIX, protección lateral SideProtect+ y cinturón 5 puntos para bebés hasta 18kg. 6 meses de uso. Sin golpes ni deterioro.",
    price: 210_000, currency: "ARS", condition: "like_new",
    attributes: { sub_category: "seguridad", brand: "Chicco", color: "Graphite" },
  },
  {
    user: 1, category_slug: "babies", featured_level: null,
    title: "Corralito plegable Fisher-Price con cambiador y moisés",
    description: "Pack & Play de Fisher-Price con cambiador desmontable, moisés y colchoneta acolchada. Plegable y fácil transporte. 1 año de uso.",
    price: 95_000, currency: "ARS", condition: "very_good",
    attributes: { sub_category: "corralito", brand: "Fisher-Price", color: "Gris / Verde" },
  },
  {
    user: 0, category_slug: "babies", featured_level: null,
    title: "Ropa bebé talle 3-6 meses – Lote 25 prendas",
    description: "Lote de 25 prendas para bebé: bodies manga larga/corta, mamelucos, pijamas, medias. Marcas Mimo, Cheeky, Carter's. Buen estado.",
    price: 28_000, currency: "ARS", condition: "very_good",
    attributes: { sub_category: "ropa", brand: "Mimo / Cheeky / Carter's", color: "Varios" },
  },

  // ── BELLEZA Y SALUD ───────────────────────────────────────────────────────
  {
    user: 1, category_slug: "beauty-health", featured_level: "silver",
    title: "Set de maquillaje MAC + Shu Uemura – 25 productos",
    description: "Colección de 25 productos de alta gama: sombras MAC Matte, bases, correctores, labiales. Todo con poco uso. Valuados en más de $600.000.",
    price: 185_000, currency: "ARS", condition: "very_good",
    attributes: { sub_category: "maquillaje", brand: "MAC / Shu Uemura", color: "Varios" },
  },
  {
    user: 1, category_slug: "beauty-health", featured_level: null,
    title: "Secador profesional Remington Pro 2400W – Iónico",
    description: "Secador iónico profesional con difusor y boquilla concentradora. Temperatura regulable, motor AC de larga duración. 1 año de uso.",
    price: 55_000, currency: "ARS", condition: "very_good",
    attributes: { sub_category: "cabello", brand: "Remington", color: "Negro / Dorado" },
  },
  {
    user: 2, category_slug: "beauty-health", featured_level: null,
    title: "Afeitadora Braun Series 9 Pro – Con limpiadora automática",
    description: "La mejor afeitadora rotativa del mercado. Con estación de limpieza y recarga inteligente. 6 meses de uso. Piezas de repuesto incluidas.",
    price: 195_000, currency: "ARS", condition: "like_new",
    attributes: { sub_category: "afeitado", brand: "Braun", color: "Negro / Plata" },
  },
  {
    user: 0, category_slug: "beauty-health", featured_level: null,
    title: "Plancha alisadora GHD Platinum+ – Oro rosa",
    description: "La plancha más inteligente del mercado. Tecnología predictiva, alisado profesional. Temperatura óptima 185°C. Con funda de cuero y caja original.",
    price: 145_000, currency: "ARS", condition: "like_new",
    attributes: { sub_category: "cabello", brand: "GHD", color: "Oro rosa" },
  },

  // ── JUEGOS Y JUGUETES ─────────────────────────────────────────────────────
  {
    user: 0, category_slug: "toys", featured_level: "silver",
    title: "LEGO Star Wars Millennium Falcon #75257 – Completo",
    description: "Set LEGO Star Wars 1351 piezas completo con todos los mini-figuras. Armado y desarmado con cuidado. Sin piezas faltantes. Con instrucciones.",
    price: 95_000, currency: "ARS", condition: "very_good",
    attributes: { sub_category: "construccion", brand: "LEGO", age_range: "9-12" },
  },
  {
    user: 1, category_slug: "toys", featured_level: null,
    title: "Muñeca Barbie Fashionista – Lote 12 muñecas + accesorios",
    description: "12 Barbies de diversas ediciones (Fashionista, Profesiones, Dreamhouse) + casita, auto y 50+ accesorios. Buen estado general.",
    price: 65_000, currency: "ARS", condition: "good",
    attributes: { sub_category: "peluches", brand: "Mattel", age_range: "3-5" },
  },
  {
    user: 2, category_slug: "toys", featured_level: null,
    title: "Juego de mesa Catán – Edición 5ta en español",
    description: "Catán edición estándar 5ta edición. Todas las piezas completas, cartas sin doblar. En perfecto estado. Excelente para jugar en familia.",
    price: 22_000, currency: "ARS", condition: "very_good",
    attributes: { sub_category: "juegos-mesa", brand: "Catan Studio", age_range: "12+" },
  },
  {
    user: 0, category_slug: "toys", featured_level: null,
    title: "Pista Hot Wheels T-Rex Devorador – Con 2 autos",
    description: "Pista épica con el T-Rex que traga los autos. Incluye 2 autos Hot Wheels exclusivos. En buen estado, todos los piezas presentes.",
    price: 35_000, currency: "ARS", condition: "good",
    attributes: { sub_category: "vehiculos-juguete", brand: "Hot Wheels / Mattel", age_range: "6-8" },
  },
  {
    user: 2, category_slug: "toys", featured_level: null,
    title: "Puzzle 1000 piezas Ravensburger – Paisaje Patagónico",
    description: "Puzzle Ravensburger 1000 piezas de la Patagonia argentina. Armado una vez. Todas las piezas completas. Sin rayones ni manchas.",
    price: 18_000, currency: "ARS", condition: "like_new",
    attributes: { sub_category: "puzzles", brand: "Ravensburger", age_range: "12+" },
  },

  // ── SERVICIOS ─────────────────────────────────────────────────────────────
  {
    user: 0, category_slug: "services", featured_level: "gold",
    title: "Plomería y gasfitería – Urgencias y trabajos en general",
    description: "Plomero matriculado con 15 años de experiencia. Destapes, pérdidas, instalaciones de gas, termotanques, calefones. Presupuesto sin cargo. Zona San Juan Capital y alrededores.",
    price: 15_000, currency: "ARS", condition: "new",
    attributes: { sub_category: "construccion", modality: "presencial", brand: "Plomería Méndez" },
  },
  {
    user: 1, category_slug: "services", featured_level: "silver",
    title: "Diseño gráfico y branding – Logos, flyers y redes sociales",
    description: "Diseñadora gráfica con 8 años de experiencia en branding y comunicación visual. Creación de logo, paleta de colores, manual de marca, diseño para Instagram y publicidad digital.",
    price: 45_000, currency: "ARS", condition: "new",
    attributes: { sub_category: "diseno", modality: "ambas", brand: "Estudio GraficArt" },
  },
  {
    user: 2, category_slug: "services", featured_level: "silver",
    title: "Clases de inglés – Todos los niveles, presencial y online",
    description: "Profesor de inglés certificado TESOL/IELTS. Clases individuales o grupales para adultos y niños. Conversación, gramática, preparación para exámenes internacionales (IELTS, TOEFL).",
    price: 8_000, currency: "ARS", condition: "new",
    attributes: { sub_category: "cursos", modality: "ambas", brand: "English with Martín" },
  },
  {
    user: 0, category_slug: "services", featured_level: null,
    title: "Fotografía de eventos – Casamientos, cumpleaños y corporativos",
    description: "Fotógrafo profesional con equipo Canon full frame. Cobertura completa de tu evento, edición profesional y entrega en galería online. Más de 200 eventos realizados en San Juan.",
    price: 120_000, currency: "ARS", condition: "new",
    attributes: { sub_category: "fotografia", modality: "presencial", brand: "Fotoméndez Estudio" },
  },
  {
    user: 1, category_slug: "services", featured_level: null,
    title: "Peluquería y estética – Domicilio o local, Capital",
    description: "Estilista profesional con 10 años de trayectoria. Cortes dama/caballero, coloraciones, mechas, alisados, tratamientos. También atención a domicilio.",
    price: 12_000, currency: "ARS", condition: "new",
    attributes: { sub_category: "belleza-serv", modality: "ambas", brand: "Beauty by Laura" },
  },
  {
    user: 2, category_slug: "services", featured_level: null,
    title: "Servicio de mudanzas – Flete y embalaje profesional",
    description: "Empresa de mudanzas con 12 años en el rubro. Camioneta propia, embalaje de muebles y objetos frágiles incluido. Presupuesto gratis. San Juan y provincias limítrofes.",
    price: 35_000, currency: "ARS", condition: "new",
    attributes: { sub_category: "transporte", modality: "presencial", brand: "Mudanzas López" },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🌱  Seed completo — comercIA\n");

  // ── 1. Borrar todos los avisos existentes ───────────────────────────────
  console.log("🗑️   Borrando avisos existentes...");
  const { error: delErr } = await supabase.from("listings").delete().gte("created_at", "2000-01-01");
  if (delErr) {
    console.error("❌  Error al borrar:", delErr.message);
    process.exit(1);
  }
  console.log("   ✓  Avisos borrados\n");

  // ── 2. Obtener IDs de categorías desde la DB ────────────────────────────
  console.log("📂  Cargando categorías...");
  const { data: cats, error: catErr } = await supabase.from("categories").select("id, slug");
  if (catErr || !cats?.length) {
    console.error("❌  No se pudieron cargar categorías:", catErr?.message);
    process.exit(1);
  }
  const catMap: Record<string, number> = Object.fromEntries(cats.map((c) => [c.slug, c.id]));
  console.log("   Categorías disponibles:", Object.keys(catMap).join(", "));

  // Verificar categorías requeridas
  const required = ["electronics","vehicles","real-estate","clothing","home-garden","sports","tools","books","pets","other","phones","appliances","babies","beauty-health","toys","services"];
  const missing = required.filter((s) => !catMap[s]);
  if (missing.length) {
    console.warn(`\n⚠️   CATEGORÍAS FALTANTES EN DB: ${missing.join(", ")}`);
    console.warn("   Ejecutá las migraciones SQL en Supabase y volvé a correr el seed.\n");
  }
  console.log();

  // ── 3. Insertar avisos ──────────────────────────────────────────────────
  let inserted = 0;
  let failed = 0;

  for (const def of ALL_LISTINGS) {
    const categoryId = catMap[def.category_slug];
    if (!categoryId) {
      console.warn(`  ⚠️  Categoría "${def.category_slug}" no encontrada, saltando...`);
      failed++;
      continue;
    }

    const user = USERS[def.user];
    const { data: listing, error: lErr } = await supabase
      .from("listings")
      .insert({
        title: def.title,
        description: def.description,
        price: def.price,
        currency: def.currency,
        condition: def.condition,
        category_id: categoryId,
        user_id: user.id,
        status: "active",
        featured_level: def.featured_level,
        neighborhood: pick(NEIGHBORHOODS),
        attributes: def.attributes,
        view_count: 0,
        contact_count: 0,
        favorite_count: 0,
      })
      .select("id")
      .single();

    if (lErr || !listing) {
      console.error(`  ❌  "${def.title}": ${lErr?.message}`);
      failed++;
      continue;
    }

    // Slug
    await supabase
      .from("listings")
      .update({ slug: mkSlug(def.title, listing.id) })
      .eq("id", listing.id);

    // Imágenes
    const imgs = IMGS[def.category_slug] ?? IMGS.other;
    const numImgs = Math.min(3, imgs.length);
    const shuffled = [...imgs].sort(() => Math.random() - 0.5).slice(0, numImgs);
    const { error: iErr } = await supabase.from("listing_images").insert(
      shuffled.map((url, pos) => ({ listing_id: listing.id, url, position: pos }))
    );
    if (iErr) console.warn(`  ⚠️  Imágenes: ${iErr.message}`);

    const badge = def.featured_level === "gold" ? "⭐" : def.featured_level === "silver" ? "🥈" : "  ";
    const userName = user.name.split(" ")[0];
    console.log(`  ${badge}  [${def.category_slug.padEnd(14)}] [${userName.padEnd(7)}] ${def.title}`);
    inserted++;
  }

  console.log(`\n✅  Listo: ${inserted} avisos creados, ${failed} fallidos.`);
  console.log(`📊  Distribución:`);
  const dist: Record<string, number> = {};
  ALL_LISTINGS.forEach((l) => {
    const name = USERS[l.user].name.split(" ")[0];
    dist[name] = (dist[name] ?? 0) + 1;
  });
  Object.entries(dist).forEach(([name, n]) => console.log(`     ${name}: ${n} avisos`));
}

main().catch(console.error);
