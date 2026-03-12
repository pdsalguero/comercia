/**
 * Seed script — datos de prueba para comercIA
 * Ejecutar: npx tsx scripts/seed.ts
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://hbeswalibpblqkrdqczh.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiZXN3YWxpYnBibHFrcmRxY3poIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjYzNzgzOSwiZXhwIjoyMDg4MjEzODM5fQ.N7NFhS6hSfOpReke3Sg4DNnf2w2ni286JvVjReI0qiA";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Imágenes Unsplash por categoría ────────────────────────────────────────
const IMGS = {
  electronics: [
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80",
    "https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?w=800&q=80",
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
    "https://images.unsplash.com/photo-1585770536735-27993a593c90?w=800&q=80",
    "https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=800&q=80",
    "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80",
  ],
  vehicles: [
    "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80",
    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80",
    "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80",
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80",
    "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&q=80",
    "https://images.unsplash.com/photo-1568844293986-8d0400bd4745?w=800&q=80",
  ],
  "real-estate": [
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
  ],
  clothing: [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80",
    "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800&q=80",
    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80",
  ],
  "home-garden": [
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
    "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80",
    "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80",
    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
  ],
  sports: [
    "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80",
    "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&q=80",
    "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&q=80",
    "https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=800&q=80",
  ],
  tools: [
    "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80",
    "https://images.unsplash.com/photo-1581092787765-e3feb951d987?w=800&q=80",
    "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80",
  ],
  books: [
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80",
    "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80",
    "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&q=80",
  ],
  pets: [
    "https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&q=80",
    "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80",
    "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80",
  ],
  other: [
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
    "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80",
  ],
};

const NEIGHBORHOODS = [
  "Capital", "Rivadavia", "Rawson", "Santa Lucía", "Chimbas",
  "Pocito", "Caucete", "Albardón", "Zonda", "Ullum",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function slug(title: string, id: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50) + "-" + id.slice(0, 6);
}

// ── Definición de avisos ────────────────────────────────────────────────────
type FeaturedLevel = "gold" | "silver" | null;
interface ListingDef {
  title: string;
  description: string;
  price: number;
  currency: "ARS" | "USD";
  condition: "new" | "like_new" | "very_good" | "good" | "fair";
  category_id: number;
  category_slug: string;
  featured_level: FeaturedLevel;
  attributes: Record<string, unknown>;
}

const LISTINGS: ListingDef[] = [
  // ── ELECTRÓNICA (cat 1) ─────────────────────────────────────────────────
  {
    title: "iPhone 14 Pro 256GB Space Black – Como nuevo",
    description: "Comprado en diciembre 2023. Impecable, sin rayones. Con caja original, cargador y funda. Face ID perfecto, batería al 94%.",
    price: 950_000, currency: "ARS", condition: "like_new",
    category_id: 1, category_slug: "electronics", featured_level: "gold",
    attributes: { sub_category: "celular", brand: "Apple", model: "iPhone 14 Pro", storage: "256gb", color: "Space Black", includes_box: true, includes_charger: true },
  },
  {
    title: "Samsung Galaxy S23 Ultra 512GB – 1 año de uso",
    description: "Usado con cuidado, siempre con protector y funda. Pantalla sin rayones. Se entrega con caja, cargador original y 2 fundas.",
    price: 780_000, currency: "ARS", condition: "like_new",
    category_id: 1, category_slug: "electronics", featured_level: "gold",
    attributes: { sub_category: "celular", brand: "Samsung", model: "Galaxy S23 Ultra", storage: "512gb", color: "Phantom Black", includes_box: true, includes_charger: true },
  },
  {
    title: "MacBook Pro M2 14\" – 16GB RAM 512GB",
    description: "Excelente estado, comprada en 2023. Nunca tuvo caídas ni golpes. Batería con 42 ciclos. Ideal para trabajo y diseño.",
    price: 1_900_000, currency: "ARS", condition: "like_new",
    category_id: 1, category_slug: "electronics", featured_level: "gold",
    attributes: { sub_category: "computadora", brand: "Apple", model: "MacBook Pro M2 14\"", storage: "512gb", ram: "16gb", color: "Space Gray" },
  },
  {
    title: "Smart TV 55\" LG 4K OLED – Impecable",
    description: "Televisor OLED 55\" con HDR Dolby Vision. Incluye control y soporte de pared. Perfecto estado, imagen increíble.",
    price: 520_000, currency: "ARS", condition: "very_good",
    category_id: 1, category_slug: "electronics", featured_level: null,
    attributes: { sub_category: "tv", brand: "LG", model: "OLED55C1", color: "Negro" },
  },
  {
    title: "Sony WH-1000XM5 – Auriculares Noise Cancelling",
    description: "Los mejores auriculares del mercado. Poco uso, sonido extraordinario. Cancelación de ruido activa. Con estuche y cables originales.",
    price: 280_000, currency: "ARS", condition: "like_new",
    category_id: 1, category_slug: "electronics", featured_level: "silver",
    attributes: { sub_category: "audio", brand: "Sony", model: "WH-1000XM5", color: "Negro", includes_box: true },
  },
  {
    title: "iPad Air 5ta Generación 64GB WiFi",
    description: "iPad Air M1 en perfecto estado. Con funda Smart Folio azul y Apple Pencil 2da generación incluidos.",
    price: 680_000, currency: "ARS", condition: "like_new",
    category_id: 1, category_slug: "electronics", featured_level: null,
    attributes: { sub_category: "tablet", brand: "Apple", model: "iPad Air 5", storage: "64gb", color: "Starlight", includes_box: true },
  },

  // ── VEHÍCULOS (cat 2) ────────────────────────────────────────────────────
  {
    title: "Toyota Hilux 2.8 TDI 4x4 AT 2021 – Única dueña",
    description: "Camioneta en estado impecable. Full equipo, cuero, diferencial trasero, cámara de retroceso. Servicio al día en concesionaria Toyota. Acepta financiación.",
    price: 32_000_000, currency: "ARS", condition: "like_new",
    category_id: 2, category_slug: "vehicles", featured_level: "gold",
    attributes: { sub_category: "camioneta", brand: "toyota", model: "Hilux 4x4 AT", year: 2021, km: 38000, fuel: "diesel", transmission: "automatica", doors: "4", color: "Blanco", first_owner: true, accepts_trade: true, seller_type: "particular" },
  },
  {
    title: "VW Gol Trend 5p 2019 – GNC 5ta generación",
    description: "Auto en excelente estado. GNC con carga completa, equipo de audio con pantalla, elevavidrios eléctricos. Papeles al día. 1 sola dueña.",
    price: 11_500_000, currency: "ARS", condition: "very_good",
    category_id: 2, category_slug: "vehicles", featured_level: "gold",
    attributes: { sub_category: "auto", brand: "volkswagen", model: "Gol Trend", year: 2019, km: 68000, fuel: "gnc", transmission: "manual", doors: "5", color: "Rojo", first_owner: true, seller_type: "particular" },
  },
  {
    title: "Ford Ranger XLT 2022 – 4x4 Diesel AT 0km entregado",
    description: "Ranger XLT con apenas 8.000 km. Garantía de fábrica vigente. Equipada con control de estabilidad, airbags, tela premium.",
    price: 41_000_000, currency: "ARS", condition: "new",
    category_id: 2, category_slug: "vehicles", featured_level: "gold",
    attributes: { sub_category: "camioneta", brand: "ford", model: "Ranger XLT 4x4", year: 2022, km: 8000, fuel: "diesel", transmission: "automatica", doors: "4", color: "Azul Profundo", first_owner: true, accepts_trade: false, seller_type: "concesionaria" },
  },
  {
    title: "Honda CB 500F 2020 – Moto urbana impecable",
    description: "Moto con 22.000 km, siempre en taller oficial Honda. Cubiertas nuevas, frenos revisados. Ideal para ciudad y ruta.",
    price: 4_800_000, currency: "ARS", condition: "very_good",
    category_id: 2, category_slug: "vehicles", featured_level: "silver",
    attributes: { sub_category: "moto", brand: "honda", model: "CB 500F", year: 2020, km: 22000, fuel: "nafta", color: "Negro", seller_type: "particular" },
  },
  {
    title: "Renault Sandero Stepway 2018 – Permuta",
    description: "Sandero Stepway edición especial. GNC de 5ta, equipo de música, asientos tela. Funciona perfecto, papeles y VTV al día.",
    price: 9_200_000, currency: "ARS", condition: "good",
    category_id: 2, category_slug: "vehicles", featured_level: null,
    attributes: { sub_category: "auto", brand: "renault", model: "Sandero Stepway", year: 2018, km: 95000, fuel: "gnc", transmission: "manual", doors: "5", color: "Gris", accepts_trade: true, seller_type: "particular" },
  },
  {
    title: "Chevrolet Cruze LTZ 2020 – Full equipo",
    description: "Sedán full, techo solar, cuero, pantalla táctil 8\", cámara 360°. Un auto a estrenar prácticamente.",
    price: 19_500_000, currency: "ARS", condition: "like_new",
    category_id: 2, category_slug: "vehicles", featured_level: null,
    attributes: { sub_category: "auto", brand: "chevrolet", model: "Cruze LTZ", year: 2020, km: 31000, fuel: "nafta", transmission: "automatica", doors: "4", color: "Blanco", first_owner: true, seller_type: "particular" },
  },

  // ── INMUEBLES (cat 3) ────────────────────────────────────────────────────
  {
    title: "Casa 3 dormitorios – Barrio Privado Capital, SJ",
    description: "Hermosa casa de 180m² cubiertos en barrio privado con seguridad 24hs. Cocina equipada, jardín, parrilla, pileta. A estrenar.",
    price: 120_000, currency: "USD", condition: "new",
    category_id: 3, category_slug: "real-estate", featured_level: "gold",
    attributes: { sub_category: "casa", operation: "venta", zone: "capital", bedrooms: "3", bathrooms: "2", m2_covered: 180, m2_total: 600, age: "estrenar", garage: true, pool: true, security: true, private_complex: true, seller_type: "particular" },
  },
  {
    title: "Departamento 2 ambientes – Rivadavia, luminoso",
    description: "Dpto en piso 3 con balcón, orientación norte. Cocina integrada, baño completo, dormitorio amplio. Edificio con ascensor y lavandería.",
    price: 62_000, currency: "USD", condition: "very_good",
    category_id: 3, category_slug: "real-estate", featured_level: "gold",
    attributes: { sub_category: "departamento", operation: "venta", zone: "rivadavia", bedrooms: "1", bathrooms: "1", m2_covered: 52, rooms: "2", floor: "3", elevator: true, laundry: true, orientation: "norte", seller_type: "inmobiliaria" },
  },
  {
    title: "Alquiler – Departamento 3 ambientes amoblado, Rawson",
    description: "Dpto amoblado con cocina completa, heladera, lavarropas y A/A. Ideal para profesionales o pareja. Cerca de todo.",
    price: 450_000, currency: "ARS", condition: "very_good",
    category_id: 3, category_slug: "real-estate", featured_level: "silver",
    attributes: { sub_category: "departamento", operation: "alquiler", zone: "rawson", bedrooms: "2", bathrooms: "1", m2_covered: 70, rooms: "3", furnished: true, air_conditioning: true, pets_allowed: false, seller_type: "particular" },
  },
  {
    title: "Terreno 500m² con planos aprobados – Pocito",
    description: "Lote en barrio residencial tranquilo. Con planos de vivienda aprobados por municipalidad. Excelente ubicación, apto crédito hipotecario.",
    price: 22_000, currency: "USD", condition: "new",
    category_id: 3, category_slug: "real-estate", featured_level: null,
    attributes: { sub_category: "terreno", operation: "venta", zone: "pocito", m2_total: 500, credit_eligible: true, seller_type: "particular" },
  },
  {
    title: "Local comercial en esquina – Capital",
    description: "Local de 80m² en esquina céntrica con gran vidriera. Apto para cualquier rubro. Actualmente funcionando como ferretería.",
    price: 95_000, currency: "USD", condition: "good",
    category_id: 3, category_slug: "real-estate", featured_level: null,
    attributes: { sub_category: "local", operation: "venta", zone: "capital", m2_covered: 80, seller_type: "inmobiliaria" },
  },

  // ── ROPA Y CALZADO (cat 4) ───────────────────────────────────────────────
  {
    title: "Campera North Face Summit – Talle L, negra",
    description: "Campera impermeable con relleno de pluma. Usada una temporada, excelente estado. Ideal para frío intenso.",
    price: 78_000, currency: "ARS", condition: "very_good",
    category_id: 4, category_slug: "clothing", featured_level: "silver",
    attributes: { sub_category: "ropa", gender: "unisex", size: "L", brand: "North Face", color: "Negro", material: "Nylon / Pluma" },
  },
  {
    title: "Zapatillas Nike Air Max 90 – Talle 42, sin uso",
    description: "Zapatillas nuevas sin estrenar, talle 42. Se las regalaron y no son de mi talle. Con caja original.",
    price: 68_000, currency: "ARS", condition: "new",
    category_id: 4, category_slug: "clothing", featured_level: null,
    attributes: { sub_category: "calzado", gender: "hombre", size: "42", brand: "Nike", color: "Blanco / Negro" },
  },
  {
    title: "Vestido de fiesta largo – Talle M, dorado",
    description: "Vestido elegante usado una sola vez en casamiento. Tela satinada, escote en V, largo al piso. En perfecto estado.",
    price: 35_000, currency: "ARS", condition: "like_new",
    category_id: 4, category_slug: "clothing", featured_level: null,
    attributes: { sub_category: "ropa", gender: "mujer", size: "M", color: "Dorado", material: "Satén" },
  },
  {
    title: "Cartera Louis Vuitton Speedy 30 – Original",
    description: "Cartera original con ticket de compra de Paris. Impecable estado. Incluye candado y llaves originales.",
    price: 350_000, currency: "ARS", condition: "like_new",
    category_id: 4, category_slug: "clothing", featured_level: "gold",
    attributes: { sub_category: "bolso", gender: "mujer", brand: "Louis Vuitton", color: "Monogram" },
  },

  // ── HOGAR Y JARDÍN (cat 5) ───────────────────────────────────────────────
  {
    title: "Heladera Samsung Inverter No Frost 400L",
    description: "Heladera en perfecto estado, 2 años de uso. Eficiencia energética A++. Con dispensador de agua. Medidas: 70x65x170.",
    price: 320_000, currency: "ARS", condition: "very_good",
    category_id: 5, category_slug: "home-garden", featured_level: "silver",
    attributes: { sub_category: "electrodomestico", brand: "Samsung", color: "Plateado", dimensions: "70x65x170" },
  },
  {
    title: "Lavarropas Automático Drean 8kg – Poco uso",
    description: "Lavarropas carga frontal 8kg, display digital, centrifugado 1200rpm. Casi sin uso (1 año). Funciona perfecto.",
    price: 195_000, currency: "ARS", condition: "like_new",
    category_id: 5, category_slug: "home-garden", featured_level: null,
    attributes: { sub_category: "electrodomestico", brand: "Drean", color: "Blanco" },
  },
  {
    title: "Juego de living 3+2+1 tapizado en gris",
    description: "Sillones tapizados en tela gris antideslizante. Incluye sofá de 3 cuerpos, loveseat y sillón individual. Buen estado.",
    price: 420_000, currency: "ARS", condition: "good",
    category_id: 5, category_slug: "home-garden", featured_level: null,
    attributes: { sub_category: "mueble", color: "Gris", material: "Tela" },
  },
  {
    title: "Cocina Longvie 6 hornallas acero inox",
    description: "Cocina de acero inoxidable con horno y grilla. Encendido automático, reloj timer. 2 años de uso. Excelente estado.",
    price: 185_000, currency: "ARS", condition: "very_good",
    category_id: 5, category_slug: "home-garden", featured_level: null,
    attributes: { sub_category: "electrodomestico", brand: "Longvie", color: "Acero Inoxidable" },
  },

  // ── DEPORTES (cat 6) ─────────────────────────────────────────────────────
  {
    title: "Bicicleta MTB Specialized Rockhopper 29\" – Talle M",
    description: "Mountain bike en excelente estado. Frenos hidráulicos Shimano, 24 velocidades, horquilla con suspensión 100mm. Con portabidón.",
    price: 380_000, currency: "ARS", condition: "very_good",
    category_id: 6, category_slug: "sports", featured_level: "gold",
    attributes: { sub_category: "bicicleta", brand: "Specialized", size: '29"', color: "Negro / Verde" },
  },
  {
    title: "Cinta de correr eléctrica – Hasta 20 km/h",
    description: "Cinta plegable con pantalla LED. Inclinación manual 3 niveles, velocidad hasta 20 km/h. Poco uso, como nueva.",
    price: 220_000, currency: "ARS", condition: "like_new",
    category_id: 6, category_slug: "sports", featured_level: null,
    attributes: { sub_category: "fitness", brand: "Olmo", color: "Negro" },
  },
  {
    title: "Set de pesas ajustables 30kg – BioForce",
    description: "Mancuernas ajustables con sistema de clip de 5 a 30kg cada una. Reemplazan más de 15 pares de pesas. Con soporte.",
    price: 165_000, currency: "ARS", condition: "very_good",
    category_id: 6, category_slug: "sports", featured_level: null,
    attributes: { sub_category: "fitness", brand: "BioForce", color: "Negro" },
  },

  // ── HERRAMIENTAS (cat 7) ─────────────────────────────────────────────────
  {
    title: "Taladro percutor Bosch GSB 20-2 – Profesional",
    description: "Taladro percutor 650W en perfecto estado. Con maletín original, set de 20 brocas, 2 mechas para mampostería. Muy poco uso.",
    price: 95_000, currency: "ARS", condition: "very_good",
    category_id: 7, category_slug: "tools", featured_level: "silver",
    attributes: { sub_category: "electrica", brand: "Bosch", voltage: "220v" },
  },
  {
    title: "Sierra circular DeWalt 7.1/4\" 1800W",
    description: "Sierra circular profesional con guía paralela y hoja nueva. Incluye maletín. Ideal carpintería y obra.",
    price: 130_000, currency: "ARS", condition: "good",
    category_id: 7, category_slug: "tools", featured_level: null,
    attributes: { sub_category: "electrica", brand: "DeWalt", voltage: "220v" },
  },
  {
    title: "Amoladora angular Makita 9\" – 2200W",
    description: "Amoladora grande para corte y desbaste. Con disco de corte y disco de desbaste incluidos. Buen estado de uso.",
    price: 72_000, currency: "ARS", condition: "good",
    category_id: 7, category_slug: "tools", featured_level: null,
    attributes: { sub_category: "electrica", brand: "Makita", voltage: "220v" },
  },

  // ── LIBROS (cat 8) ──────────────────────────────────────────────────────
  {
    title: "Colección completa Harry Potter – 7 tomos en español",
    description: "Los 7 libros de Harry Potter en edición tapa dura. Estado como nuevo, leídos con cuidado. Perfectos para coleccionistas.",
    price: 28_000, currency: "ARS", condition: "very_good",
    category_id: 8, category_slug: "books", featured_level: null,
    attributes: { sub_category: "libro", author: "J.K. Rowling / Salamandra", language: "espanol" },
  },
  {
    title: "Libro: Clean Code – Robert C. Martin (en inglés)",
    description: "Edición original en inglés. Imprescindible para programadores. Algunas marcas a lápiz, estado muy bueno.",
    price: 9_500, currency: "ARS", condition: "good",
    category_id: 8, category_slug: "books", featured_level: null,
    attributes: { sub_category: "manual", author: "Robert C. Martin", language: "ingles" },
  },
  {
    title: "Manga: Attack on Titan – Tomos 1 al 15",
    description: "Colección de manga en perfecto estado. Edición en español. Se venden todos juntos.",
    price: 45_000, currency: "ARS", condition: "like_new",
    category_id: 8, category_slug: "books", featured_level: null,
    attributes: { sub_category: "comic", author: "Hajime Isayama / Ivrea", language: "espanol" },
  },

  // ── MASCOTAS (cat 9) ─────────────────────────────────────────────────────
  {
    title: "Cachorros Golden Retriever – Con pedigree, vacunados",
    description: "Camada de 6 cachorros, 50 días de vida. Padres con pedigree FCA. Vacunados, desparasitados, con cartilla sanitaria. Excelente genética.",
    price: 250_000, currency: "ARS", condition: "new",
    category_id: 9, category_slug: "pets", featured_level: "gold",
    attributes: { sub_category: "perro", breed: "Golden Retriever", age: "50 días", vaccinated: true, pedigree: true, is_adoption: false },
  },
  {
    title: "Gatitos Siameses – 2 meses, vacunados",
    description: "Gatitos siameses de raza, ojos azules. Vacunados y desparasitados. Con carnet sanitario. Buscamos hogar responsable.",
    price: 95_000, currency: "ARS", condition: "new",
    category_id: 9, category_slug: "pets", featured_level: null,
    attributes: { sub_category: "gato", breed: "Siamés", age: "2 meses", vaccinated: true, pedigree: false, is_adoption: false },
  },
  {
    title: "Adopción – Perrita mestiza 2 años, castrada y vacunada",
    description: "Luna es una perrita tranquila, sociable con personas y niños. Castrada, al día con vacunas y desparasitación. Buscamos familia con espacio.",
    price: 0, currency: "ARS", condition: "new",
    category_id: 9, category_slug: "pets", featured_level: null,
    attributes: { sub_category: "perro", breed: "Mestiza", age: "2 años", sex: "hembra", vaccinated: true, pedigree: false, is_adoption: true },
  },

  // ── OTROS (cat 10) ──────────────────────────────────────────────────────
  {
    title: "Cámara Polaroid Now+ – Fotos instantáneas",
    description: "Cámara instantánea con Bluetooth para efectos desde el celular. Con 2 cartuchos de películas. Impecable.",
    price: 65_000, currency: "ARS", condition: "like_new",
    category_id: 10, category_slug: "other", featured_level: null,
    attributes: { sub_category: "Cámara / Fotografía", brand: "Polaroid" },
  },
  {
    title: "Drone DJI Mini 3 Pro – Combo Fly More",
    description: "Drone con cámara 4K y obstacle sensing. Combo Fly More con 3 baterías, hub de carga y bolso. Muy pocas horas de vuelo.",
    price: 750_000, currency: "ARS", condition: "like_new",
    category_id: 10, category_slug: "other", featured_level: "silver",
    attributes: { sub_category: "Drone / Fotografía", brand: "DJI" },
  },
];

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🌱  Iniciando seed...\n");

  // 1. Obtener primer perfil de usuario
  const { data: profiles, error: pErr } = await supabase
    .from("profiles")
    .select("id")
    .limit(1);

  if (pErr || !profiles?.length) {
    console.error("❌  No hay usuarios en la base. Registrate primero en la app y volvé a ejecutar el script.");
    process.exit(1);
  }
  const userId = profiles[0].id;
  console.log(`👤  Usando usuario: ${userId}\n`);

  let inserted = 0;
  let failed = 0;

  for (const def of LISTINGS) {
    const { data: listing, error: lErr } = await supabase
      .from("listings")
      .insert({
        title: def.title,
        description: def.description,
        price: def.price,
        currency: def.currency,
        condition: def.condition,
        category_id: def.category_id,
        user_id: userId,
        status: "active",
        featured_level: def.featured_level,
        neighborhood: pick(NEIGHBORHOODS),
        attributes: def.attributes,
        view_count: Math.floor(Math.random() * 300),
        contact_count: Math.floor(Math.random() * 30),
        favorite_count: Math.floor(Math.random() * 20),
      })
      .select("id")
      .single();

    if (lErr || !listing) {
      console.error(`  ❌  "${def.title}": ${lErr?.message}`);
      failed++;
      continue;
    }

    // Generar slug
    await supabase
      .from("listings")
      .update({ slug: slug(def.title, listing.id) })
      .eq("id", listing.id);

    // Insertar imágenes
    const imgs = IMGS[def.category_slug as keyof typeof IMGS] ?? IMGS.other;
    const numImgs = Math.min(3, imgs.length);
    const shuffled = [...imgs].sort(() => Math.random() - 0.5).slice(0, numImgs);

    const imageRows = shuffled.map((url, pos) => ({
      listing_id: listing.id,
      url,
      position: pos,
    }));

    const { error: iErr } = await supabase.from("listing_images").insert(imageRows);
    if (iErr) console.warn(`  ⚠️  Imágenes para "${def.title}": ${iErr.message}`);

    const badge = def.featured_level === "gold" ? "⭐" : def.featured_level === "silver" ? "🥈" : "  ";
    console.log(`  ${badge} ✓  ${def.title} ($${def.price.toLocaleString("es-AR")} ${def.currency})`);
    inserted++;
  }

  console.log(`\n✅  Seed completo: ${inserted} avisos creados, ${failed} fallidos.`);
}

main().catch(console.error);
