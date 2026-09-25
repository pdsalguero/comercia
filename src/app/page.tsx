import type { Metadata } from "next";
import PageTracker from "@/components/PageTracker";
import { unstable_cache } from "next/cache";
import { ENABLED_CATEGORY_IDS, isCategoryEnabled } from "@/lib/site-config";
import { buildVehicleFacets, EMPTY_VEHICLE_FACETS } from "@/lib/hero-facets";
import { buildWhatsappUrl } from "@/lib/whatsapp";
import { getRecentPriceDrops } from "@/lib/price-drops";

export const metadata: Metadata = {
  title: "CuyoRodados — Autos y motos en Mendoza, San Juan y San Luis",
  description: "Comprá y vendé autos, motos, camionetas y más en Mendoza, San Juan y San Luis. Publicá en 30 segundos, gratis y sin comisiones. Para particulares y concesionarias.",
  keywords: ["autos usados mendoza", "autos usados san juan", "autos usados san luis", "clasificados de autos cuyo", "vender moto mendoza", "camionetas usadas cuyo", "concesionarias mendoza", "avisos gratis cuyo"],
  alternates: { canonical: "https://cuyorodados.com.ar" },
  openGraph: {
    title: "CuyoRodados — Autos y motos en Mendoza, San Juan y San Luis",
    description: "Sacá una foto y publicá tu vehículo en 30 segundos. Gratis y sin comisiones.",
    url: "https://cuyorodados.com.ar",
    type: "website",
    images: [{ url: "https://cuyorodados.com.ar/og-image.jpg", width: 1200, height: 630, alt: "CuyoRodados marketplace" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CuyoRodados — Autos y motos en Mendoza, San Juan y San Luis",
    description: "Sacá una foto y publicá tu vehículo en 30 segundos. Gratis.",
    images: ["https://cuyorodados.com.ar/og-image.jpg"],
  },
};
import { createPublicClient } from "@/lib/supabase/public";
import { createServiceClient } from "@/lib/supabase/service";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HomeFeaturedCarousel } from "@/components/listings/HomeFeaturedCarousel";
import { RecentlySold } from "@/components/listings/RecentlySold";
import { HeroSearch } from "@/components/listings/HeroSearch";
import { QuickActions, DealerLinkMobile } from "@/components/home/QuickActions";
import { FounderBanner } from "@/components/home/FounderBanner";
import { HowItWorks } from "@/components/home/HowItWorks";
import { StoreCards } from "@/components/listings/StoreCards";
import { HomeProvinceProvider } from "@/components/listings/HomeProvinceContext";
import { HomeRecentListings } from "@/components/listings/HomeRecentListings";

// La home no lee cookies (la sesión se resuelve en el navegador, ver Navbar `loadUserOnClient`),
// así que se sirve como página estática y se regenera cada 5 minutos.
export const revalidate = 300;

const CATEGORIES = [
  { name: "Vehículos",         slug: "vehicles",      icon: "🚗", id: 2,  active: true  },
  { name: "Inmuebles",         slug: "real-estate",   icon: "🏠", id: 3,  active: false },
  { name: "Servicios",         slug: "services",      icon: "🛠️", id: 26, active: false },
  { name: "Celulares",         slug: "phones",        icon: "📱", id: 21, active: false },
  { name: "Tecnología",        slug: "electronics",   icon: "💻", id: 1,  active: false },
  { name: "Electrodomésticos", slug: "appliances",    icon: "🧊", id: 22, active: false },
  { name: "Ropa y Calzado",    slug: "clothing",      icon: "👗", id: 4,  active: false },
  { name: "Hogar y Muebles",   slug: "home-garden",   icon: "🛋️", id: 5,  active: false },
  { name: "Deportes",          slug: "sports",        icon: "⚽", id: 6,  active: false },
  { name: "Herramientas",      slug: "tools",         icon: "🔧", id: 7,  active: false },
  { name: "Bebés y Niños",     slug: "babies",        icon: "👶", id: 23, active: false },
  { name: "Música, Libros y Revistas", slug: "books", icon: "📚", id: 8,  active: false },
  { name: "Belleza y Salud",   slug: "beauty-health", icon: "💄", id: 24, active: false },
  { name: "Juegos y Juguetes", slug: "toys",          icon: "🧸", id: 25, active: false },
  { name: "Mascotas",          slug: "pets",          icon: "🐾", id: 9,  active: false },
  { name: "Otros",             slug: "other",         icon: "📦", id: 10, active: false },
].map((c) => ({ ...c, active: isCategoryEnabled(c.id) }));

const CAT_NAMES: Record<string, string> = Object.fromEntries(CATEGORIES.map(c => [c.slug, c.name]));

// Debajo de este valor no se muestran los contadores (una cifra chica resta más de lo que suma).
const MIN_STAT_TO_SHOW = 50;

// Mínimos para mostrar el carrusel de destacados aparte (ver `showFeaturedRow`)
const MIN_FEATURED_ROW = 3;
const MIN_OTHER_LISTINGS = 4;



function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Función interna pura — no usa cookies(), apta para unstable_cache
async function _fetchHomeData() {
  const supabase = createPublicClient();
  const FIELDS = "id, title, price, currency, condition, neighborhood, created_at, bumped_at, featured_level, attributes, view_count, user_id, listing_images(url, position)";
  const todayStart = new Date(); todayStart.setHours(0,0,0,0);

  const CAT_IDS = ENABLED_CATEGORY_IDS;

  const [
    { data: allFeatured },
    { data: recent },
    { count: totalListings },
    { count: totalSellers },
    { count: totalStores },
    { count: viewsToday },
    catCountEntries,
    { data: facetRows },
    { data: sold },
  ] = await Promise.all([
    supabase.from("listings").select(FIELDS).eq("status","active").in("category_id",ENABLED_CATEGORY_IDS).eq("featured_level","gold").order("created_at",{ascending:false}).limit(16),
    supabase.from("listings").select("id,title,description,price,currency,condition,neighborhood,created_at,bumped_at,view_count,user_id,featured_level,attributes,listing_images!inner(url,position),categories(name,slug)").eq("status","active").in("category_id",ENABLED_CATEGORY_IDS).order("created_at",{ascending:false}).limit(8),
    supabase.from("listings").select("id",{count:"exact",head:true}).eq("status","active").in("category_id",ENABLED_CATEGORY_IDS),
    // "id" y no "*": con la clave anónima las columnas privadas no son legibles y "*" daría error
    supabase.from("profiles").select("id",{count:"exact",head:true}),
    supabase.from("profiles").select("id",{count:"exact",head:true}).eq("is_store",true),
    // El registro de vistas ya no es público: el total del día se cuenta con la clave de servicio
    createServiceClient().from("listing_views_log").select("listing_id",{count:"exact",head:true}).gte("created_at", todayStart.toISOString()),
    // 16 HEAD queries paralelas — cero egress de datos, solo count en headers
    Promise.all(CAT_IDS.map(async (id) => {
      const { count } = await supabase.from("listings").select("id",{count:"exact",head:true}).eq("status","active").eq("category_id",id);
      return [id, count ?? 0] as [number, number];
    })),
    // Opciones del buscador del hero (tipos/marcas/modelos con stock)
    supabase.from("listings").select("attributes").eq("status","active").in("category_id",ENABLED_CATEGORY_IDS).limit(1000),
    // "Vendidos recientemente": los vendidos de los últimos 6 meses, con su último precio publicado
    supabase.from("listings").select("id,title,price,currency,neighborhood,attributes,sold_at,listing_images(url,position)")
      .eq("status","sold").in("category_id",ENABLED_CATEGORY_IDS)
      .gte("sold_at", new Date(Date.now() - 183 * 24 * 3600 * 1000).toISOString())
      .order("sold_at",{ascending:false}).limit(12),
  ]);

  const userIds = [...new Set((allFeatured ?? []).map((l: any) => l.user_id).filter(Boolean))];
  const listingIds = [...new Set([...(allFeatured ?? []), ...(recent ?? [])].map((l: any) => l.id))];
  const [{ data: storeProfiles }, priceDrops] = await Promise.all([
    userIds.length > 0
      ? supabase.from("profiles").select("id, is_store, store_name").in("id", userIds)
      : Promise.resolve({ data: [] as any[] }),
    getRecentPriceDrops(supabase, listingIds),
  ]);
  const storeMap: Record<string, { is_store: boolean; store_name: string | null }> = {};
  for (const p of storeProfiles ?? []) storeMap[p.id] = p;

  const counts: Record<number,number> = Object.fromEntries(catCountEntries);
  const featured = shuffle(allFeatured ?? []).map((l: any) => ({
    ...l,
    is_store: storeMap[l.user_id]?.is_store ?? null,
    store_name: storeMap[l.user_id]?.store_name ?? null,
    price_drop_pct: priceDrops[l.id] ?? null,
  }));

  const recentUserIds = [...new Set((recent ?? []).map((l: any) => l.user_id).filter(Boolean))];
  const { data: recentStoreProfiles } = recentUserIds.length > 0
    ? await supabase.from("profiles").select("id, is_store, store_name, store_whatsapp, public_phone, show_phone").in("id", recentUserIds)
    : { data: [] };
  const recentStoreMap: Record<string, { is_store: boolean; store_name: string | null; store_whatsapp: string | null; public_phone: string | null; show_phone: boolean | null }> = {};
  for (const p of recentStoreProfiles ?? []) recentStoreMap[p.id] = p as any;
  const recentMapped = (recent ?? []).map((l: any) => {
    const seller = recentStoreMap[l.user_id];
    return {
      ...l,
      is_store: seller?.is_store ?? null,
      store_name: seller?.store_name ?? null,
      price_drop_pct: priceDrops[l.id] ?? null,
      whatsapp_url: buildWhatsappUrl({
        showPhone: seller?.show_phone,
        storeWhatsapp: seller?.store_whatsapp,
        phone: seller?.public_phone,
        listingWhatsappOverride: l.attributes?.whatsapp_phone,
        listingTitle: l.title,
      }),
    };
  });

  return { featured, recent:recentMapped, sold: sold ?? [], totalListings:totalListings??0, totalSellers:totalSellers??0, totalStores:totalStores??0, viewsToday:viewsToday??0, categoryCounts:counts, vehicleFacets: buildVehicleFacets(facetRows ?? []) };
}

// Cache con TTL de 1 hora — evita 7 queries paralelas en cada request
const getHomeData = unstable_cache(
  _fetchHomeData,
  ["home-data"],
  { revalidate: 300, tags: ["home-data"] }
);

function cover(listing: any): string | null {
  const imgs = listing.listing_images;
  if (!imgs?.length) return null;
  return [...imgs].sort((a:any,b:any)=>a.position-b.position)[0]?.url??null;
}

function photos(listing: any): string[] {
  const imgs = listing.listing_images;
  if (!imgs?.length) return [];
  return [...imgs].sort((a:any,b:any)=>a.position-b.position).map((img:any)=>img.url);
}

export default async function HomePage() {
  const { featured, recent, sold, totalListings, totalSellers, totalStores, viewsToday, vehicleFacets } = await getHomeData();
  const facets = vehicleFacets ?? EMPTY_VEHICLE_FACETS;

  // Con pocos avisos, "Destacados" y "Últimos avisos" mostrarían lo mismo dos veces. El carrusel de
  // destacados aparece recién cuando hay varios destacados y, además, otros avisos que mostrar abajo.
  const featuredIds = new Set(featured.map((l: any) => l.id));
  const recentOnly = recent.filter((l: any) => !featuredIds.has(l.id));
  const showFeaturedRow = featured.length >= MIN_FEATURED_ROW && recentOnly.length >= MIN_OTHER_LISTINGS;
  const listingsForGrid = showFeaturedRow ? recentOnly : [...featured, ...recentOnly].slice(0, 8);

  return (<>
      <PageTracker page="landing" />
    <HomeProvinceProvider>
    <div style={{ minHeight: "100vh", background: "#f1f5f9" }}>
      <Navbar loadUserOnClient hideSearch />

      <div className="home-wrapper">
        <div className="home-grid">

          {/* ── HERO ── */}
          <div style={{ gridArea: "hero", minWidth: 0 }}>
            <div className="hero-banner">
              {/* Ford Ranger (Unsplash). Celular y escritorio usan tamaños distintos. */}
              <picture>
                <source media="(max-width: 768px)" srcSet="/hero-rangers-800.webp" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="hero-banner-img"
                  src="/hero-rangers-1600.webp"
                  alt=""
                  fetchPriority="high"
                  loading="eager"
                  decoding="sync"
                  aria-hidden="true"
                />
              </picture>
              <div className="hero-banner-shade" />
              <div className="hero-banner-content">
                <h1 className="hero-banner-title">
                  Encontrá tu próximo
                  <span>auto o moto hoy.</span>
                </h1>
              </div>
            </div>
            <div className="hero-panel-wrap">
              <HeroSearch facets={facets} totalCount={totalListings} />
            </div>
          </div>

          {/* ── MAIN CONTENT ── */}
          <div className="home-main-content" style={{ gridArea: "main", display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* ── Programa fundadores (se oculta al completarse los cupos) ── */}
            <FounderBanner registered={totalSellers} />

            {/* ── ¿Qué querés hacer hoy? ── */}
            <QuickActions />

            {/* ── Stats bar — solo se muestra cuando los números son significativos ── */}
            {[totalListings, totalSellers, totalStores].some((n) => n >= MIN_STAT_TO_SHOW) && (
            <div style={{ display: "flex", gap: "8px", overflowX: "auto", scrollbarWidth: "none", alignItems: "center" }}>
              {[
                {
                  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1d6fb8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
                  iconBg: "#e8f1fa", dot: "#1d6fb8",
                  value: `+${totalListings.toLocaleString("es-AR")}`,
                  label: "publicaciones activas",
                },
                {
                  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0891b2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
                  iconBg: "#ecfeff", dot: "#0891b2",
                  value: `+${totalSellers.toLocaleString("es-AR")}`,
                  label: "vendedores registrados",
                },
                {
                  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
                  iconBg: "#fef3c7", dot: "#d97706",
                  value: `+${totalStores.toLocaleString("es-AR")}`,
                  label: "concesionarias activas",
                },
              ].map((s, i) => (
                <div key={i} className={i >= 2 ? "stat-hide-mobile" : ""} style={{ display: "flex", alignItems: "center", gap: "6px", background: "#fff", borderRadius: "8px", padding: "5px 10px 5px 6px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", flexShrink: 0 }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: s.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {s.icon}
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: 800, color: "#0f172a", whiteSpace: "nowrap" }}>{s.value}</span>
                  <span style={{ fontSize: "12px", color: "#94a3b8", whiteSpace: "nowrap" }}>{s.label}</span>
                </div>
              ))}
            </div>
            )}

            {/* Carrusel de destacados: solo cuando hay suficientes destacados Y otros avisos para no repetir
                el mismo contenido dos veces. Filtrable por provincia. */}
            {showFeaturedRow && (
              <HomeFeaturedCarousel
                initialItems={featured.map((l:any)=>({...l, cover_image: cover(l), photo_count: l.listing_images?.length ?? null, photos: photos(l)}))}
                href="/listings"
              />
            )}

            {/* Concesionarias */}
            <StoreCards />

            {/* Avisos — grid/list toggle, filtrables por provincia. Con poco stock es una sola grilla
                (destacados primero); con más, "Últimos avisos" sin los que ya salen arriba. */}
            <HomeRecentListings
              title={showFeaturedRow ? "Últimos avisos" : "Avisos publicados"}
              initialItems={listingsForGrid.map((l:any) => ({
                ...l,
                categories: l.categories ? { ...l.categories, name: CAT_NAMES[l.categories.slug] ?? l.categories.name } : null,
              }))}
            />

            <DealerLinkMobile />

            {/* Vendidos recientemente: referencia de precios con avisos reales ya vendidos */}
            <RecentlySold items={(sold ?? []).map((l) => ({ ...l, cover_image: cover(l) }))} />
          </div>


        </div>
      </div>

      {/* ── Cómo funciona ── */}
      <HowItWorks />

      <Footer />
    </div>
    </HomeProvinceProvider>
  </>);
}
