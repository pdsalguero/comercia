/**
 * Seed — 10 avisos por cada usuario demo
 * npx tsx scripts/seed-users.ts
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
  { id: "4aef0326-7e04-4a31-8af5-c1c7f2b5118d", name: "Laura García"  },
  { id: "1fd1b73e-443c-427f-a282-d7cdcf9adeb1", name: "Martín López"  },
];

const IMGS = {
  electronics: [
    "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&q=80",
    "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80",
    "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80",
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80",
  ],
  vehicles: [
    "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80",
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80",
    "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&q=80",
    "https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800&q=80",
  ],
  "real-estate": [
    "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80",
    "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&q=80",
    "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800&q=80",
  ],
  clothing: [
    "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80",
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80",
    "https://images.unsplash.com/photo-1560243563-062bfc001d68?w=800&q=80",
  ],
  "home-garden": [
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
    "https://images.unsplash.com/photo-1565183997392-2f6f122e5912?w=800&q=80",
  ],
  sports: [
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80",
    "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=800&q=80",
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80",
  ],
  tools: [
    "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80",
    "https://images.unsplash.com/photo-1590664863685-a99ef05e9f61?w=800&q=80",
  ],
  books: [
    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80",
    "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80",
  ],
  pets: [
    "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80",
    "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=800&q=80",
    "https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?w=800&q=80",
  ],
  other: [
    "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&q=80",
    "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=80",
  ],
};

const NEIGHBORHOODS = ["Capital","Rivadavia","Rawson","Santa Lucía","Chimbas","Pocito","Caucete","Albardón","Zonda","Ullum"];
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const slug = (title: string, id: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50) + "-" + id.slice(0, 6);

type FL = "gold" | "silver" | null;
interface L {
  title: string; description: string; price: number; currency: "ARS"|"USD";
  condition: "new"|"like_new"|"very_good"|"good"|"fair";
  category_id: number; category_slug: string; featured_level: FL;
  attributes: Record<string, unknown>;
}

// ── 10 avisos para Carlos Méndez (automotor + electrónica + herramientas) ──
const CARLOS: L[] = [
  {
    title: "Peugeot 208 Allure 2022 – Nafta, 15.000 km",
    description: "Auto como nuevo, único dueño. Full equipo: pantalla táctil, cámara de retroceso, asientos tapizados. Garantía vigente.",
    price: 18_500_000, currency: "ARS", condition: "like_new",
    category_id: 2, category_slug: "vehicles", featured_level: "gold",
    attributes: { sub_category: "auto", brand: "peugeot", model: "208 Allure", year: 2022, km: 15000, fuel: "nafta", transmission: "manual", doors: "5", color: "Gris", first_owner: true, seller_type: "particular" },
  },
  {
    title: "Fiat Cronos Drive 2021 – GNC, impecable",
    description: "Sedán familiar con GNC de 5ta gen. Servicio en concesionaria. Cubiertas nuevas. Acepta permuta menor.",
    price: 13_800_000, currency: "ARS", condition: "very_good",
    category_id: 2, category_slug: "vehicles", featured_level: "silver",
    attributes: { sub_category: "auto", brand: "fiat", model: "Cronos Drive", year: 2021, km: 42000, fuel: "gnc", transmission: "manual", doors: "4", color: "Blanco", accepts_trade: true, seller_type: "particular" },
  },
  {
    title: "Xiaomi Redmi Note 12 Pro 256GB – Nuevo en caja",
    description: "Celular nuevo sin abrir, comprado en el exterior. Pantalla AMOLED 120Hz, cámara 200MP, carga rápida 67W.",
    price: 320_000, currency: "ARS", condition: "new",
    category_id: 1, category_slug: "electronics", featured_level: null,
    attributes: { sub_category: "celular", brand: "Xiaomi", model: "Redmi Note 12 Pro", storage: "256gb", color: "Midnight Black", includes_box: true, includes_charger: true },
  },
  {
    title: "PlayStation 5 + 3 juegos – Poco uso",
    description: "PS5 edición estándar con lector de discos. Incluye: FIFA 24, Spider-Man 2, Mortal Kombat 1. Todo en perfecto estado.",
    price: 780_000, currency: "ARS", condition: "like_new",
    category_id: 1, category_slug: "electronics", featured_level: "gold",
    attributes: { sub_category: "consola", brand: "Sony", model: "PlayStation 5", color: "Blanco", includes_box: true },
  },
  {
    title: "Monitor LG UltraWide 34\" Curvo 144Hz",
    description: "Monitor gaming curvo 34\" 2560x1080, 144Hz, 1ms. HDR 400, FreeSync Premium. Impecable, con todos sus cables.",
    price: 480_000, currency: "ARS", condition: "very_good",
    category_id: 1, category_slug: "electronics", featured_level: null,
    attributes: { sub_category: "tv", brand: "LG", model: "34WP65C-B", color: "Negro" },
  },
  {
    title: "Compresor de aire 50L – 2HP Schulz",
    description: "Compresor Schulz 50 litros, 2HP, 116 PSI. Funcionando perfecto. Ideal para taller o pintura. Con manguera y pistola.",
    price: 165_000, currency: "ARS", condition: "good",
    category_id: 7, category_slug: "tools", featured_level: null,
    attributes: { sub_category: "electrica", brand: "Schulz", voltage: "220v" },
  },
  {
    title: "Set llaves combinadas Bahco 8 a 24mm – 12 piezas",
    description: "Juego de llaves cromadas en estuche original. Sin uso, regalo de empresa. Calidad profesional garantizada.",
    price: 48_000, currency: "ARS", condition: "new",
    category_id: 7, category_slug: "tools", featured_level: null,
    attributes: { sub_category: "manual", brand: "Bahco", voltage: "n/a" },
  },
  {
    title: "Bicicleta de ruta Trek Domane AL 3 – Talle 54",
    description: "Bici de ruta de aluminio, 21 velocidades Shimano, frenos hidráulicos. 2 temporadas de uso. Con portabidon y pedales clipless.",
    price: 290_000, currency: "ARS", condition: "very_good",
    category_id: 6, category_slug: "sports", featured_level: "silver",
    attributes: { sub_category: "bicicleta", brand: "Trek", size: "54cm", color: "Azul" },
  },
  {
    title: "Kayak individual – Rígido Pirca 1 persona",
    description: "Kayak de 2.80m para río o lago. Con remo y chaleco salvavidas incluidos. Poco uso, sin roturas ni fisuras.",
    price: 195_000, currency: "ARS", condition: "good",
    category_id: 6, category_slug: "sports", featured_level: null,
    attributes: { sub_category: "otro", brand: "Pirca", color: "Amarillo" },
  },
  {
    title: "Terreno 300m² en Chimbas – Servicios completos",
    description: "Lote residencial con escritura, agua, luz y gas en puerta. Barrio tranquilo, a 5 minutos del centro. Apto crédito.",
    price: 14_500, currency: "USD", condition: "new",
    category_id: 3, category_slug: "real-estate", featured_level: null,
    attributes: { sub_category: "terreno", operation: "venta", zone: "chimbas", m2_total: 300, credit_eligible: true, seller_type: "particular" },
  },
];

// ── 10 avisos para Laura García (hogar + ropa + mascotas + inmuebles) ──────
const LAURA: L[] = [
  {
    title: "Departamento 1 dormitorio – Alquiler Capital, amoblado",
    description: "Moderno departamento en planta baja con jardín privado. Cocina equipada, A/A, WiFi incluido. Ideal profesional o pareja.",
    price: 380_000, currency: "ARS", condition: "new",
    category_id: 3, category_slug: "real-estate", featured_level: "gold",
    attributes: { sub_category: "departamento", operation: "alquiler", zone: "capital", bedrooms: "1", bathrooms: "1", m2_covered: 45, furnished: true, air_conditioning: true, pets_allowed: true, seller_type: "particular" },
  },
  {
    title: "Casa 4 ambientes con pileta – Rawson",
    description: "Casa amplia en barrio residencial. Living comedor, 3 dormitorios, 2 baños, cocina-comedor, patio con pileta y parrilla.",
    price: 85_000, currency: "USD", condition: "very_good",
    category_id: 3, category_slug: "real-estate", featured_level: "silver",
    attributes: { sub_category: "casa", operation: "venta", zone: "rawson", bedrooms: "3", bathrooms: "2", m2_covered: 140, m2_total: 400, garage: true, pool: true, grill: true, seller_type: "particular" },
  },
  {
    title: "Cochecito Britax con huevito – Como nuevo",
    description: "Sistema modular Britax B-Ready con huevito incluido. En perfecto estado, usado 6 meses. Color gris marengo.",
    price: 185_000, currency: "ARS", condition: "like_new",
    category_id: 5, category_slug: "home-garden", featured_level: null,
    attributes: { sub_category: "otro", brand: "Britax", color: "Gris" },
  },
  {
    title: "Aire acondicionado Inverter 3000 frigorías – Toshiba",
    description: "Split frío/calor inverter. Muy bajo consumo. Instalado en 2022, funcionando perfecto. Se incluye soporte pero no instalación.",
    price: 320_000, currency: "ARS", condition: "very_good",
    category_id: 5, category_slug: "home-garden", featured_level: "silver",
    attributes: { sub_category: "electrodomestico", brand: "Toshiba", color: "Blanco" },
  },
  {
    title: "Mesa de comedor madera maciza 6 personas + sillas",
    description: "Mesa de roble macizo 160x90cm con 6 sillas tapizadas en cuerina beige. Muy buen estado. Retiro en Capital.",
    price: 280_000, currency: "ARS", condition: "good",
    category_id: 5, category_slug: "home-garden", featured_level: null,
    attributes: { sub_category: "mueble", color: "Madera natural / Beige", material: "Roble macizo", dimensions: "160x90 cm" },
  },
  {
    title: "Ropa de bebé talle 0-3 meses – Lote 30 prendas",
    description: "Lote de 30 prendas para bebé (bodies, mamelucos, pijamas). Marcas: Mimo, Cheeky, Zara Kids. Muy buen estado.",
    price: 22_000, currency: "ARS", condition: "very_good",
    category_id: 4, category_slug: "clothing", featured_level: null,
    attributes: { sub_category: "ropa", gender: "bebe", size: "0-3 meses", brand: "Mimo / Cheeky / Zara" },
  },
  {
    title: "Tapado de lana merino – Talle M, color camel",
    description: "Tapado largo de lana merino 100%. Usado una temporada. Calidad premium, muy abrigado. Sin deformaciones.",
    price: 55_000, currency: "ARS", condition: "very_good",
    category_id: 4, category_slug: "clothing", featured_level: null,
    attributes: { sub_category: "ropa", gender: "mujer", size: "M", color: "Camel", material: "Lana merino" },
  },
  {
    title: "Perros Beagle – Cachorros con vacunas y pedigree FCA",
    description: "Camada de 5 cachorros Beagle tricolor, 45 días. Padres con pedigree. Vacunados, desparasitados. Precio con garantía de salud.",
    price: 180_000, currency: "ARS", condition: "new",
    category_id: 9, category_slug: "pets", featured_level: "gold",
    attributes: { sub_category: "perro", breed: "Beagle", age: "45 días", vaccinated: true, pedigree: true, is_adoption: false },
  },
  {
    title: "Acuario completo 100L – Con peces y filtro",
    description: "Acuario rectangular con tapa LED, filtro externo Eheim, calentador y sustrato. Incluye 15 peces tropicales.",
    price: 85_000, currency: "ARS", condition: "good",
    category_id: 9, category_slug: "pets", featured_level: null,
    attributes: { sub_category: "pez", age: "2 años", breed: "Tropical variado", is_adoption: false },
  },
  {
    title: "Zapatillas Adidas Ultraboost 22 – Talle 38, mujer",
    description: "Zapatillas running originales, usadas en 3 maratones. Suela en perfecto estado. Con caja y medias Adidas de regalo.",
    price: 72_000, currency: "ARS", condition: "very_good",
    category_id: 4, category_slug: "clothing", featured_level: null,
    attributes: { sub_category: "calzado", gender: "mujer", size: "38", brand: "Adidas", color: "Blanco / Coral" },
  },
];

// ── 10 avisos para Martín López (vehículos + electrónica + deportes + libros)
const MARTIN: L[] = [
  {
    title: "Jeep Grand Cherokee 3.6 V6 2019 – Full equipo",
    description: "SUV premium con todos los extras: cuero, techo solar panorámico, Uconnect 8.4\", cámara 360°, asientos ventilados. Impecable.",
    price: 48_000_000, currency: "ARS", condition: "like_new",
    category_id: 2, category_slug: "vehicles", featured_level: "gold",
    attributes: { sub_category: "camioneta", brand: "jeep", model: "Grand Cherokee 3.6 V6", year: 2019, km: 52000, fuel: "nafta", transmission: "automatica", doors: "5", color: "Negro", first_owner: true, accepts_trade: false, seller_type: "particular" },
  },
  {
    title: "Moto Yamaha MT-07 2022 – 11.000 km",
    description: "Naked 689cc en perfecto estado. Siempre en taller oficial Yamaha. Con escapes Akrapovic, manubrio superbike y protecciones.",
    price: 8_500_000, currency: "ARS", condition: "like_new",
    category_id: 2, category_slug: "vehicles", featured_level: "gold",
    attributes: { sub_category: "moto", brand: "honda", model: "Yamaha MT-07", year: 2022, km: 11000, fuel: "nafta", color: "Gris oscuro", seller_type: "particular" },
  },
  {
    title: "Notebook Lenovo ThinkPad X1 Carbon – i7 16GB 512GB",
    description: "Laptop empresarial ultraliviana (1.1kg). i7 12th gen, 16GB RAM, SSD NVMe 512GB. Pantalla 14\" IPS. En perfecto estado.",
    price: 1_450_000, currency: "ARS", condition: "very_good",
    category_id: 1, category_slug: "electronics", featured_level: "silver",
    attributes: { sub_category: "computadora", brand: "Lenovo", model: "ThinkPad X1 Carbon Gen 10", storage: "512gb", ram: "16gb", color: "Negro" },
  },
  {
    title: "GoPro Hero 11 Black – Kit completo",
    description: "GoPro Hero 11 con 3 baterías, cargador doble, memoria 128GB, arnés pecho y casco, flotador y estuche. Todo nuevo casi.",
    price: 380_000, currency: "ARS", condition: "like_new",
    category_id: 1, category_slug: "electronics", featured_level: null,
    attributes: { sub_category: "camara", brand: "GoPro", model: "Hero 11 Black", color: "Negro", includes_box: true },
  },
  {
    title: "Apple Watch Series 8 45mm GPS – Midnight",
    description: "Reloj en excelente estado, batería al 100%. Con 3 correas (silicon, milanesa, sport loop). Caja y documentación originales.",
    price: 280_000, currency: "ARS", condition: "like_new",
    category_id: 1, category_slug: "electronics", featured_level: null,
    attributes: { sub_category: "accesorios", brand: "Apple", model: "Watch Series 8 45mm", color: "Midnight", includes_box: true },
  },
  {
    title: "Tabla de snowboard Burton Custom 158W + botas",
    description: "Snowboard ancho para pie grande. Botas Burton Ion talle 43 incluidas. Temporada de uso. Lista para la nieve.",
    price: 520_000, currency: "ARS", condition: "good",
    category_id: 6, category_slug: "sports", featured_level: null,
    attributes: { sub_category: "otro", brand: "Burton", size: '158W"', color: "Negro / Azul" },
  },
  {
    title: "Raqueta de tenis Wilson Blade 98 v8 – Grip 2",
    description: "Raqueta de competición, encordada con Luxilon ALU Power. Pocas horas de uso. Incluye funda Wilson original.",
    price: 145_000, currency: "ARS", condition: "very_good",
    category_id: 6, category_slug: "sports", featured_level: null,
    attributes: { sub_category: "raqueta", brand: "Wilson", size: "Grip 2", color: "Verde / Negro" },
  },
  {
    title: "Lote 20 libros de programación – Python, JS, DevOps",
    description: "Libros técnicos: Clean Architecture, Python Crash Course, JavaScript: The Good Parts, Docker Deep Dive, entre otros. Todos en buen estado.",
    price: 38_000, currency: "ARS", condition: "good",
    category_id: 8, category_slug: "books", featured_level: null,
    attributes: { sub_category: "manual", author: "Varios", language: "ingles" },
  },
  {
    title: "Colección Crónicas de Narnia – 7 libros tapa dura",
    description: "Edición especial ilustrada en tapa dura. Estado impecable, como nuevos. Perfecta para regalo o colección.",
    price: 24_000, currency: "ARS", condition: "like_new",
    category_id: 8, category_slug: "books", featured_level: null,
    attributes: { sub_category: "libro", author: "C.S. Lewis / Planeta", language: "espanol" },
  },
  {
    title: "Dron FPV Geprc Mark5 HD – Racing drone",
    description: "Drone FPV de competición con cámara HD DJI. Incluye gafas DJI Goggles 2, controladora RadioMaster, 4 baterías y cargador.",
    price: 950_000, currency: "ARS", condition: "very_good",
    category_id: 10, category_slug: "other", featured_level: "silver",
    attributes: { sub_category: "Drone / FPV", brand: "Geprc" },
  },
];

async function seedUser(userId: string, name: string, listings: L[]) {
  console.log(`\n👤  ${name} (${userId})`);
  let ok = 0;

  for (const def of listings) {
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
        view_count: Math.floor(Math.random() * 400),
        contact_count: Math.floor(Math.random() * 40),
        favorite_count: Math.floor(Math.random() * 25),
      })
      .select("id")
      .single();

    if (lErr || !listing) {
      console.error(`  ❌  "${def.title}": ${lErr?.message}`);
      continue;
    }

    await supabase
      .from("listings")
      .update({ slug: slug(def.title, listing.id) })
      .eq("id", listing.id);

    const imgs = IMGS[def.category_slug as keyof typeof IMGS] ?? IMGS.other;
    const numImgs = Math.min(3, imgs.length);
    const shuffled = [...imgs].sort(() => Math.random() - 0.5).slice(0, numImgs);
    await supabase.from("listing_images").insert(
      shuffled.map((url, pos) => ({ listing_id: listing.id, url, position: pos }))
    );

    const badge = def.featured_level === "gold" ? "⭐" : def.featured_level === "silver" ? "🥈" : "  ";
    console.log(`  ${badge} ✓  ${def.title}`);
    ok++;
  }
  console.log(`  → ${ok}/10 avisos creados`);
}

async function main() {
  console.log("🌱  Seed de usuarios demo\n");
  await seedUser(USERS[0].id, USERS[0].name, CARLOS);
  await seedUser(USERS[1].id, USERS[1].name, LAURA);
  await seedUser(USERS[2].id, USERS[2].name, MARTIN);
  console.log("\n✅  Listo.");
}

main().catch(console.error);
