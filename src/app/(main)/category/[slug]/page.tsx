import { createClient } from "@/lib/supabase/server";
import { ListingCard } from "@/components/listings/ListingCard";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { notFound } from "next/navigation";
import Link from "next/link";
import PinIcon from "@/components/ui/PinIcon";
import { RE_LOCATIONS, ALL_RE_ZONES } from "@/lib/re-locations";

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
  { value: "camioneta", label: "Camionetas / SUV" },
  { value: "moto", label: "Motos" },
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
  "home-garden":   { name: "Hogar y Jardín",     icon: "🛋️" },
  sports:          { name: "Deportes",           icon: "⚽" },
  tools:           { name: "Herramientas",       icon: "🔧" },
  babies:          { name: "Bebés y Niños",      icon: "👶" },
  books:           { name: "Libros",             icon: "📚" },
  "beauty-health": { name: "Belleza y Salud",    icon: "💄" },
  pets:            { name: "Mascotas",           icon: "🐾" },
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

const BABY_TYPES = [
  { value: "coche-bebe", label: "Coches de bebé" },
  { value: "ropa-bebe", label: "Ropa de bebé" },
  { value: "juguete", label: "Juguetes" },
  { value: "cuna", label: "Cunas y moisés" },
  { value: "silla-auto", label: "Sillas para auto" },
  { value: "acc-bebe", label: "Accesorios" },
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
  type?: string; brand?: string; model?: string;
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
  tech_type?: string; tech_brand?: string;
  // phones
  phone_type?: string; phone_brand?: string; phone_storage?: string;
  // appliances
  appliance_type?: string;
  // babies
  baby_type?: string;
  // beauty
  beauty_type?: string;
  // price
  price_min?: string; price_max?: string;
  // view
  view?: string;
};

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
  const isBabies = slug === "babies";
  const isBeauty = slug === "beauty-health";

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
    .select(`id, title, price, currency, condition, neighborhood, created_at, attributes, featured_level, listing_images(url, position)`)
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

  // Vehicle-specific JSON filters
  if (isVehicles) {
    if (sp.type) query = query.eq("attributes->>sub_category" as any, sp.type);
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
    if (sp.phone_storage) query = query.eq("attributes->>storage" as any, sp.phone_storage);
  }

  // Electronics-specific JSON filters
  if (isElectronics) {
    if (sp.tech_type) query = query.eq("attributes->>sub_category" as any, sp.tech_type);
    if (sp.tech_brand) query = query.eq("attributes->>brand" as any, sp.tech_brand);
  }

  // Appliances-specific JSON filters
  if (isAppliances) {
    if (sp.appliance_type) query = query.eq("attributes->>sub_category" as any, sp.appliance_type);
  }

  // Babies-specific JSON filters
  if (isBabies) {
    if (sp.baby_type) query = query.eq("attributes->>sub_category" as any, sp.baby_type);
  }

  // Beauty-specific JSON filters
  if (isBeauty) {
    if (sp.beauty_type) query = query.eq("attributes->>sub_category" as any, sp.beauty_type);
  }

  // Real-estate-specific JSON filters
  if (isRealEstate) {
    if (sp.re_type) query = query.eq("attributes->>sub_category" as any, sp.re_type);
    if (sp.re_operation) query = query.eq("attributes->>operation" as any, sp.re_operation);
    if (sp.re_zone) {
      query = query.eq("attributes->>zone" as any, sp.re_zone);
    } else if (sp.re_province && RE_LOCATIONS[sp.re_province]) {
      const provinceZones = RE_LOCATIONS[sp.re_province].zones.map(z => z.value);
      query = query.in("attributes->>zone" as any, provinceZones);
    }
    if (sp.re_bedrooms) query = query.eq("attributes->>bedrooms" as any, sp.re_bedrooms);
    if (sp.re_bathrooms) query = query.eq("attributes->>bathrooms" as any, sp.re_bathrooms);
    if (sp.re_seller) query = query.eq("attributes->>seller_type" as any, sp.re_seller);
  }

  // featured_level sorted in JS after fetch (gold > silver > bronze > null)
  if (sp.order === "price_asc") query = query.order("price", { ascending: true });
  else if (sp.order === "price_desc") query = query.order("price", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  const FEAT_ORDER: Record<string, number> = { gold: 0, silver: 1, bronze: 2 };
  const { data: rawListings } = await (query as any).limit(200);

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
    return true;
  });
  const listings = filtered?.slice().sort((a: any, b: any) => {
    // When price sort is active, sort only by price
    if (sp.order === "price_asc") return (a.price ?? 0) - (b.price ?? 0);
    if (sp.order === "price_desc") return (b.price ?? 0) - (a.price ?? 0);
    // Default: featured first (gold > silver > bronze > null)
    const fa = FEAT_ORDER[a.featured_level ?? ""] ?? 3;
    const fb = FEAT_ORDER[b.featured_level ?? ""] ?? 3;
    return fa - fb;
  }) ?? [];

  // Count per brand/type for vehicles; per property type for real estate; per type/brand for electronics
  let brandCounts: Record<string, number> = {};
  let typeCounts: Record<string, number> = {};
  let reTypeCounts: Record<string, number> = {};
  let techTypeCounts: Record<string, number> = {};
  let techBrandCounts: Record<string, number> = {};
  let phoneBrandCounts: Record<string, number> = {};
  let phoneTypeCounts: Record<string, number> = {};
  let applianceTypeCounts: Record<string, number> = {};
  let babyTypeCounts: Record<string, number> = {};
  let beautyTypeCounts: Record<string, number> = {};
  let vProvinceCounts: Record<string, number> = {};
  let vZoneCounts: Record<string, number> = {};
  if (isVehicles || isRealEstate || isElectronics || isPhones || isAppliances || isBabies || isBeauty) {
    const { data: all } = await supabase
      .from("listings")
      .select("attributes")
      .eq("status", "active")
      .eq("category_id", cat.id);
    for (const row of all ?? []) {
      const t = (row.attributes as any)?.sub_category;
      if (isVehicles) {
        const b = (row.attributes as any)?.brand;
        const zone = (row.attributes as any)?.zone as string | undefined;
        if (t) typeCounts[t] = (typeCounts[t] ?? 0) + 1;
        // Filter brands by selected type
        if (b && (!sp.type || t === sp.type)) brandCounts[b] = (brandCounts[b] ?? 0) + 1;
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
        if (t) techTypeCounts[t] = (techTypeCounts[t] ?? 0) + 1;
        if (b) techBrandCounts[b] = (techBrandCounts[b] ?? 0) + 1;
      }
      if (isPhones) {
        const b = (row.attributes as any)?.brand;
        if (t) phoneTypeCounts[t] = (phoneTypeCounts[t] ?? 0) + 1;
        if (b) phoneBrandCounts[b] = (phoneBrandCounts[b] ?? 0) + 1;
      }
      if (isAppliances && t) applianceTypeCounts[t] = (applianceTypeCounts[t] ?? 0) + 1;
      if (isBabies && t) babyTypeCounts[t] = (babyTypeCounts[t] ?? 0) + 1;
      if (isBeauty && t) beautyTypeCounts[t] = (beautyTypeCounts[t] ?? 0) + 1;
    }
  }

  function buildUrl(overrides: Partial<SP & { order: string }>) {
    const merged: Record<string, string | undefined> = {
      q: sp.q, order: sp.order,
      // vehicle
      type: sp.type, brand: sp.brand, model: sp.model,
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
      tech_type: sp.tech_type, tech_brand: sp.tech_brand,
      // phones
      phone_type: sp.phone_type, phone_brand: sp.phone_brand, phone_storage: sp.phone_storage,
      // appliances
      appliance_type: sp.appliance_type,
      // babies
      baby_type: sp.baby_type,
      // beauty
      beauty_type: sp.beauty_type,
      // price
      price_min: sp.price_min, price_max: sp.price_max,
      // view
      view: sp.view,
      ...overrides as Record<string, string | undefined>,
    };
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    const s = p.toString();
    return `/category/${slug}${s ? `?${s}` : ""}`;
  }

  const hasFilters = Object.values(sp).some(Boolean);

  // ── Filter chip helper
  function FilterSection({ title }: { title: string; children: React.ReactNode }) {
    return null; // just for type reference
  }

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 16px" }}>
    <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>

      {/* Breadcrumb — fuera del flex principal */}
      <div style={{ fontSize: "12px", color: "#aaa", padding: "8px 4px 10px" }}>
        <Link href="/" style={{ color: "#aaa", textDecoration: "none" }}>Inicio</Link>
        {" › "}
        <Link href={`/category/${slug}`} style={{ color: "#555", textDecoration: "none" }}>{meta.name}</Link>
      </div>

      <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>

        {/* ── Sidebar ── */}
        <aside style={{ width: "230px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "10px" }}>

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

          {/* Tipo de producto */}
          {isElectronics && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Tipo de producto
              </div>
              {[
                { group: "Celulares y Teléfonos", items: [
                  { value: "celular", label: "Celulares y Smartphones" },
                  { value: "acc-celular", label: "Accesorios para Celulares" },
                  { value: "repuesto-celular", label: "Repuestos de Celulares" },
                ]},
                { group: "Computación", items: [
                  { value: "notebook", label: "Notebook / Laptop" },
                  { value: "pc", label: "PC / Escritorio" },
                  { value: "tablet", label: "Tablets" },
                  { value: "monitor", label: "Monitores" },
                  { value: "componentes-pc", label: "Componentes de PC" },
                  { value: "impresion", label: "Impresión" },
                  { value: "conectividad", label: "Conectividad y Redes" },
                ]},
                { group: "Cámaras y Accesorios", items: [
                  { value: "camara", label: "Cámaras Digitales" },
                  { value: "acc-camara", label: "Accesorios para Cámaras" },
                  { value: "filmadora", label: "Filmadoras" },
                ]},
                { group: "Consolas y Videojuegos", items: [
                  { value: "videojuego", label: "Videojuegos" },
                  { value: "consola-ps", label: "Para PlayStation" },
                  { value: "consola-nintendo", label: "Para Nintendo" },
                  { value: "consola", label: "Otras consolas" },
                ]},
                { group: "Electrónica, Audio y Video", items: [
                  { value: "audio", label: "Audio / Parlantes" },
                  { value: "acc-audio-video", label: "Electrónica / Audio y Video" },
                  { value: "drone", label: "Drones" },
                  { value: "audio-vehiculo", label: "Audio para Vehículos" },
                ]},
                { group: "Televisores", items: [
                  { value: "tv", label: "Televisores" },
                ]},
              ].map(({ group, items }) => {
                const visible = items.filter(i => (techTypeCounts[i.value] ?? 0) > 0);
                if (visible.length === 0) return null;
                return (
                  <div key={group}>
                    <div style={{ padding: "6px 16px 3px", fontSize: "10px", fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px", background: "#fafafa" }}>
                      {group}
                    </div>
                    {visible.map((t) => {
                      const active = sp.tech_type === t.value;
                      return (
                        <Link key={t.value} href={buildUrl({ tech_type: active ? undefined : t.value })} style={{ textDecoration: "none" }}>
                          <div style={{
                            padding: "7px 16px", fontSize: "13px", cursor: "pointer",
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
                {PHONE_BRANDS.filter(b => (phoneBrandCounts[b.value] ?? 0) > 0).map((b) => {
                  const active = sp.phone_brand === b.value;
                  return (
                    <Link key={b.value} href={buildUrl({ phone_brand: active ? undefined : b.value })} style={{ textDecoration: "none" }}>
                      <div style={{
                        padding: "8px 16px", fontSize: "13px", cursor: "pointer",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        background: active ? "#eff6ff" : "transparent",
                        color: active ? "#2563eb" : "#444",
                        fontWeight: active ? 700 : 400,
                        borderLeft: active ? "3px solid #2563eb" : "3px solid transparent",
                      }}>
                        <span>{b.label}</span>
                        <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px", background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#2563eb" : "#888" }}>
                          {phoneBrandCounts[b.value]}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Almacenamiento (phones) */}
          {isPhones && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Almacenamiento
              </div>
              <div style={{ padding: "10px 16px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {["32GB", "64GB", "128GB", "256GB", "512GB", "1TB"].map(s => {
                  const active = sp.phone_storage === s;
                  return (
                    <Link key={s} href={buildUrl({ phone_storage: active ? undefined : s })} style={{ textDecoration: "none" }}>
                      <span style={{ display: "inline-block", padding: "5px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer", background: active ? "#2563eb" : "#f1f5f9", color: active ? "#fff" : "#555" }}>
                        {s}
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
                {sp.re_province && RE_LOCATIONS[sp.re_province] && (
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
                      {RE_LOCATIONS[sp.re_province].zones.map(z => (
                        <option key={z.value} value={z.value}>{z.label}</option>
                      ))}
                    </select>
                  </div>
                )}
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
              <span style={{ color: "#94a3b8", fontSize: "12px", marginLeft: "4px" }}>({listings?.length ?? 0})</span>
            </div>

            {/* Controls */}
            <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap", width: "100%" }}>
              <form method="GET" action={`/category/${slug}`} style={{ display: "flex", gap: "6px", flex: 1, minWidth: 0 }}>
                {Object.entries(sp).map(([k, v]) =>
                  v && k !== "q" ? <input key={k} type="hidden" name={k} value={v} /> : null
                )}
                <input name="q" defaultValue={sp.q} placeholder="Buscar en esta categoría..."
                  style={{
                    border: "1.5px solid #e2e8f0", borderRadius: "8px",
                    padding: "7px 12px", fontSize: "13px", outline: "none", flex: 1, minWidth: 0,
                  }} />
                <button type="submit" style={{
                  background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px",
                  padding: "7px 14px", fontSize: "13px", fontWeight: 700, cursor: "pointer",
                }}>Buscar</button>
              </form>

              <div style={{ display: "flex", gap: "4px" }}>
                {[
                  { value: "", label: "Recientes" },
                  { value: "price_asc", label: "Menor precio" },
                  { value: "price_desc", label: "Mayor precio" },
                ].map(opt => (
                  <Link key={opt.value} href={buildUrl({ order: opt.value || undefined })} style={{ textDecoration: "none" }}>
                    <span style={{
                      display: "inline-block", padding: "6px 11px", borderRadius: "6px",
                      fontSize: "12px", fontWeight: 600, cursor: "pointer",
                      background: (sp.order ?? "") === opt.value ? "#2563eb" : "#f1f5f9",
                      color: (sp.order ?? "") === opt.value ? "#fff" : "#555",
                    }}>{opt.label}</span>
                  </Link>
                ))}
              </div>

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
            </div>
          </div>

          {/* Active filter chips */}
          {hasFilters && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
              {sp.type && <Chip label={`Tipo: ${VEHICLE_TYPES.find(t => t.value === sp.type)?.label ?? sp.type}`} href={buildUrl({ type: undefined })} />}
              {sp.brand && <Chip label={`Marca: ${VEHICLE_BRANDS.find(b => b.value === sp.brand)?.label ?? sp.brand}`} href={buildUrl({ brand: undefined })} />}
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
                const isFeatured = !!listing.featured_level;
                return (
                  <Link key={listing.id} href={`/listings/${listing.id}`} style={{ textDecoration: "none" }}>
                    <div style={{
                      display: "flex", alignItems: "center", gap: "14px",
                      padding: "12px 16px",
                      borderBottom: i < listings.length - 1 ? "1px solid #f1f5f9" : "none",
                      background: isFeatured ? "#fffbeb" : "transparent",
                    }}
                    className="hover:bg-slate-50"
                    >
                      <div style={{ width: "72px", height: "72px", borderRadius: "8px", overflow: "hidden", flexShrink: 0, background: "#f0f4ff" }}>
                        {cover
                          ? <img src={cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>📦</div>
                        }
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "14px", fontWeight: 600, color: "#1e293b", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {isFeatured && <span style={{ fontSize: "10px", background: "#f59e0b", color: "#fff", borderRadius: "4px", padding: "1px 5px", fontWeight: 700, marginRight: "6px" }}>PREMIUM</span>}
                          {listing.title}
                        </div>
                        <div style={{ display: "flex", gap: "4px", alignItems: "center", flexWrap: "wrap", marginBottom: "4px" }}>
                          {listing.attributes?.sub_category && (
                            <span style={{ fontSize: "11px", color: "#6366f1", fontWeight: 600, background: "#eef2ff", borderRadius: "4px", padding: "1px 6px" }}>
                              {VEHICLE_TYPES.find(t => t.value === listing.attributes.sub_category)?.label ?? listing.attributes.sub_category}
                            </span>
                          )}
                          {listing.attributes?.brand && (
                            <span style={{ fontSize: "11px", color: "#475569", fontWeight: 600, background: "#f1f5f9", borderRadius: "4px", padding: "1px 6px", textTransform: "capitalize" }}>
                              {VEHICLE_BRANDS.find(b => b.value === listing.attributes.brand)?.label ?? listing.attributes.brand}
                            </span>
                          )}
                          {listing.attributes?.model && (
                            <span style={{ fontSize: "11px", color: "#475569", background: "#f1f5f9", borderRadius: "4px", padding: "1px 6px" }}>{listing.attributes.model}</span>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                          {listing.condition && (
                            <span style={{ fontSize: "11px", color: "#22c55e", fontWeight: 600 }}>
                              {listing.condition === "new" ? "Nuevo" : listing.condition === "like_new" ? "Como nuevo" : "Usado"}
                            </span>
                          )}
                          {listing.neighborhood && <span style={{ fontSize: "11px", color: "#94a3b8", display: "inline-flex", alignItems: "center", gap: "3px" }}><PinIcon size={10} /> {listing.neighborhood}</span>}
                        </div>
                      </div>
                      <div style={{ fontSize: "16px", fontWeight: 800, color: "#f97316", flexShrink: 0 }}>
                        {listing.currency === "USD" ? "U$S" : "$"}{listing.price?.toLocaleString("es-AR")}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (() => {
            const featured = listings.filter((l: any) => l.featured_level);
            const regular  = listings.filter((l: any) => !l.featured_level);
            const cardGrid = (items: any[]) => (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "14px" }}>
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

        {/* ── RIGHT SIDEBAR ── */}
        <RightSidebar />

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
