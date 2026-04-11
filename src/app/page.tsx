import type { Metadata } from "next";
import PageTracker from "@/components/PageTracker";
import Link from "next/link";
import { unstable_cache } from "next/cache";

export const metadata: Metadata = {
  title: "ComerxIA — El marketplace inteligente. Todo con el poder de la IA.",
  description: "Comprá y vendé en Argentina con inteligencia artificial. Publicá tu aviso de autos, motos, inmuebles y más en 30 segundos. Gratis.",
  keywords: ["marketplace argentina", "clasificados argentina", "comprar auto argentina", "vender moto argentina", "inmuebles argentina", "avisos gratis argentina"],
  alternates: { canonical: "https://comerxia.com.ar" },
  openGraph: {
    title: "ComerxIA — El marketplace inteligente. Todo con el poder de la IA.",
    description: "Publicá tu aviso en 30 segundos con IA. Autos, motos, inmuebles y más.",
    url: "https://comerxia.com.ar",
    type: "website",
    images: [{ url: "https://comerxia.com.ar/og-image.jpg", width: 1200, height: 630, alt: "ComerxIA marketplace" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ComerxIA — El marketplace inteligente. Todo con el poder de la IA.",
    description: "Publicá tu aviso en 30 segundos con IA. Gratis.",
    images: ["https://comerxia.com.ar/og-image.jpg"],
  },
};
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FeaturedCarousel } from "@/components/listings/FeaturedCarousel";
import { CategorySidebar } from "@/components/layout/CategorySidebar";
import { RecentListings } from "@/components/listings/RecentListings";
import { HeroSearch } from "@/components/listings/HeroSearch";
import { StoreCards } from "@/components/listings/StoreCards";
import { PublishFAB } from "@/components/ui/PublishFAB";

// Revalida la home cada 5 minutos para mantener view_count relativamente fresco
export const revalidate = 300;

const CATEGORIES = [
  { name: "Vehículos",         slug: "vehicles",      icon: "🚗", id: 2,  active: true  },
  { name: "Inmuebles",         slug: "real-estate",   icon: "🏠", id: 3,  active: true  },
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
  { name: "Servicios",         slug: "services",      icon: "🛠️", id: 26, active: false },
  { name: "Otros",             slug: "other",         icon: "📦", id: 10, active: false },
];

const CAT_NAMES: Record<string, string> = Object.fromEntries(CATEGORIES.map(c => [c.slug, c.name]));



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
  const FIELDS = "id, title, price, currency, condition, neighborhood, created_at, featured_level, attributes, view_count, user_id, listing_images(url, position)";
  const todayStart = new Date(); todayStart.setHours(0,0,0,0);

  const [
    { data: allFeatured },
    { data: recent },
    { count: totalListings },
    { count: totalSellers },
    { count: totalStores },
    { count: viewsToday },
    { data: catCounts },
  ] = await Promise.all([
    supabase.from("listings").select(FIELDS).eq("status","active").eq("featured_level","gold").order("created_at",{ascending:false}).limit(32),
    supabase.from("listings").select("id,title,price,currency,condition,neighborhood,created_at,view_count,user_id,listing_images!inner(url,position),categories(name,slug)").eq("status","active").order("created_at",{ascending:false}).limit(8),
    supabase.from("listings").select("*",{count:"exact",head:true}).eq("status","active"),
    supabase.from("profiles").select("*",{count:"exact",head:true}),
    supabase.from("profiles").select("*",{count:"exact",head:true}).eq("is_store",true),
    supabase.from("listing_views_log").select("*",{count:"exact",head:true}).gte("created_at", todayStart.toISOString()),
    supabase.from("listings").select("category_id").eq("status","active"),
  ]);

  const userIds = [...new Set((allFeatured ?? []).map((l: any) => l.user_id).filter(Boolean))];
  const { data: storeProfiles } = userIds.length > 0
    ? await supabase.from("profiles").select("id, is_store, store_name").in("id", userIds)
    : { data: [] };
  const storeMap: Record<string, { is_store: boolean; store_name: string | null }> = {};
  for (const p of storeProfiles ?? []) storeMap[p.id] = p;

  const counts: Record<number,number> = {};
  for (const row of catCounts ?? []) {
    counts[row.category_id] = (counts[row.category_id]??0)+1;
  }
  const featured = shuffle(allFeatured ?? []).slice(0, 16).map((l: any) => ({
    ...l,
    is_store: storeMap[l.user_id]?.is_store ?? null,
    store_name: storeMap[l.user_id]?.store_name ?? null,
  }));

  const recentUserIds = [...new Set((recent ?? []).map((l: any) => l.user_id).filter(Boolean))];
  const { data: recentStoreProfiles } = recentUserIds.length > 0
    ? await supabase.from("profiles").select("id, is_store, store_name").in("id", recentUserIds)
    : { data: [] };
  const recentStoreMap: Record<string, { is_store: boolean; store_name: string | null }> = {};
  for (const p of recentStoreProfiles ?? []) recentStoreMap[p.id] = p;
  const recentMapped = (recent ?? []).map((l: any) => ({
    ...l,
    is_store: recentStoreMap[l.user_id]?.is_store ?? null,
    store_name: recentStoreMap[l.user_id]?.store_name ?? null,
  }));

  return { featured, recent:recentMapped, totalListings:totalListings??0, totalSellers:totalSellers??0, totalStores:totalStores??0, viewsToday:viewsToday??0, categoryCounts:counts };
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

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { featured, recent, totalListings, totalSellers, totalStores, viewsToday, categoryCounts } = await getHomeData();
  const mapped = CATEGORIES.map((c)=>({...c, count: categoryCounts[c.id]??0}));
  const pinned = mapped.slice(0, 3);
  const rest = mapped.slice(3).filter(c => c.slug !== "other").sort((a,b)=>b.count-a.count);
  const other = mapped.find(c => c.slug === "other");
  const categoriesWithCount = [...pinned, ...rest, ...(other ? [other] : [])];

  const CAT_COLORS: Record<string, string> = {
    vehicles: "#3b82f6", "real-estate": "#10b981", services: "#8b5cf6",
    electronics: "#6366f1", "home-garden": "#f97316", phones: "#22c55e",
    appliances: "#06b6d4", clothing: "#ec4899", sports: "#f59e0b",
    tools: "#64748b", babies: "#a855f7", "beauty-health": "#f43f5e",
    toys: "#facc15", pets: "#84cc16", books: "#94a3b8", other: "#cbd5e1",
  };

  return (<>
      <PageTracker page="landing" />
    <div style={{ minHeight: "100vh", background: "#f1f5f9" }}>
      <Navbar user={user} hideSearch />

      <div className="home-wrapper">
        <div className="home-grid">

          {/* ── LEFT SIDEBAR ── */}
          <div className="sidebar-hide" style={{ gridArea: "sidebar" }}>
            <CategorySidebar categories={categoriesWithCount} />
          </div>

          {/* ── HERO ── */}
          <div
            className="hero-bg"
            style={{
              gridArea: "hero",
              borderRadius: "16px",
              backgroundColor: "#0f1b2d",
              position: "relative",
              overflow: "hidden",
              height: "210px",
              display: "flex",
              alignItems: "stretch",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&q=80"
              alt=""
              fetchPriority="high"
              loading="eager"
              decoding="sync"
              aria-hidden="true"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 60%" }}
            />
            <div style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(160deg, rgba(10,20,60,0.55) 0%, rgba(10,30,80,0.70) 100%)",
              pointerEvents: "none",
              zIndex: 1,
            }} />
            <div style={{
              position: "relative",
              zIndex: 2,
              width: "100%",
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <HeroSearch topSubcats={[]} />
            </div>
          </div>

          {/* ── MAIN CONTENT ── */}
          <div className="home-main-content" style={{ gridArea: "main", display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* ── Category pills bar — Wallapop style ── */}
            <div className="cat-pills-wrapper">
            <div className="cat-pills-bar" style={{ display: "none" }}>
              <a href="/listings" className="cat-pill cat-pill-all">
                <span className="cat-pill-dot" style={{ background: "#fff", opacity: 0.5 }} />
                Todos
                <span className="cat-pill-count">{totalListings}</span>
              </a>
              {categoriesWithCount
                .filter(c => c.count > 0)
                .sort((a, b) => b.count - a.count)
                .map(cat => (
                  <a key={cat.slug} href={`/category/${cat.slug}`} className="cat-pill">
                    <span className="cat-pill-dot" style={{ background: CAT_COLORS[cat.slug] ?? "#94a3b8" }} />
                    {cat.name}
                    <span className="cat-pill-count">{cat.count}</span>
                  </a>
                ))}
            </div>
            </div>

            {/* ── Stats bar ── */}
            <div style={{ display: "flex", gap: "8px", overflowX: "auto", scrollbarWidth: "none", alignItems: "center" }}>
              {[
                {
                  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
                  iconBg: "#eef2ff", dot: "#6366f1",
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
                  label: "tiendas activas",
                },
              ].map((s, i) => (
                <div key={i} className={i >= 2 ? "stat-hide-mobile" : ""} style={{ display: "flex", alignItems: "center", gap: "6px", background: "#fff", borderRadius: "8px", padding: "5px 10px 5px 6px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", flexShrink: 0 }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: s.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {s.icon}
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: 800, color: "#0f172a", whiteSpace: "nowrap" }}>{s.value}</span>
                  <span style={{ fontSize: "11px", color: "#94a3b8", whiteSpace: "nowrap" }}>{s.label}</span>
                </div>
              ))}
            </div>

            {/* All-category Premium carousel — shuffled on every load */}
            {featured.length > 0 ? (
              <FeaturedCarousel
                title="👑 Destacados"
                items={featured.map((l:any)=>({...l, cover_image: cover(l)}))}
                href="/listings"
              />
            ) : (
              <div style={{ background:"#fffbeb", border:"1px solid #fde68a", borderRadius:"10px", padding:"10px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"12px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                  <span style={{ fontSize:"16px" }}>⭐</span>
                  <div>
                    <span style={{ fontSize:"13px", fontWeight:700, color:"#92400e" }}>Sé el primero en destacarte</span>
                    <span style={{ fontSize:"12px", color:"#b45309", marginLeft:"6px" }}>· Recibí 5× más consultas</span>
                  </div>
                </div>
                <Link href="/upgrade">
                  <button style={{ background:"linear-gradient(135deg,#f59e0b,#fbbf24)", color:"#fff", border:"none", borderRadius:"7px", padding:"6px 14px", fontWeight:800, fontSize:"12px", cursor:"pointer" }}>
                    Ver planes →
                  </button>
                </Link>
              </div>
            )}

            {/* Tiendas Virtuales */}
            <StoreCards />

            {/* Últimos avisos — grid/list toggle */}
            <RecentListings items={recent.map((l:any) => ({
              ...l,
              categories: l.categories ? { ...l.categories, name: CAT_NAMES[l.categories.slug] ?? l.categories.name } : null,
            }))} />
          </div>


        </div>
      </div>

      {/* ── ¿Por qué ComerxIA? ── */}
      <section style={{ background: "#fff", borderTop: "1px solid #e2e8f0", padding: "36px 24px 40px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>

          {/* Headline */}
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 900, color: "#0f172a", margin: "0 0 6px" }}>
              Vendé con inteligencia. Comprá sin vueltas.
            </h2>
            <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
              El primer marketplace argentino donde la IA redacta tus avisos por vos.
            </p>
          </div>

          {/* 3 feature cards */}
          <div className="feature-cards-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", alignItems: "stretch" }}>

            {/* Card 1 — IA */}
            <div style={{ display: "flex", flexDirection: "column", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden", background: "#fff" }}>
              <div style={{ background: "linear-gradient(135deg,#eef2ff,#ede9fe)", padding: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", position: "relative" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", background: "#fff", borderRadius: "8px", padding: "8px", boxShadow: "0 2px 8px rgba(99,102,241,.15)", width: "48px" }}>
                  <div style={{ fontSize: "22px", lineHeight: 1 }}>📸</div>
                  <div style={{ width: "28px", height: "3px", background: "#c7d2fe", borderRadius: "2px" }} />
                  <div style={{ width: "20px", height: "2px", background: "#e0e7ff", borderRadius: "2px" }} />
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
                <div style={{ display: "flex", flexDirection: "column", gap: "3px", background: "#fff", borderRadius: "8px", padding: "8px 10px", boxShadow: "0 2px 8px rgba(99,102,241,.15)" }}>
                  <div style={{ width: "40px", height: "3px", background: "#6366f1", borderRadius: "2px" }} />
                  <div style={{ width: "30px", height: "2px", background: "#c7d2fe", borderRadius: "2px" }} />
                  <div style={{ width: "36px", height: "2px", background: "#c7d2fe", borderRadius: "2px" }} />
                  <div style={{ width: "24px", height: "2px", background: "#e0e7ff", borderRadius: "2px" }} />
                </div>
                <div style={{ position: "absolute", top: "8px", right: "10px", fontSize: "14px" }}>✨</div>
              </div>
              <div style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a" }}>Publicaciones con IA</span>
                <span style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.5 }}>Subí una foto y generamos tu publicación automáticamente.</span>
              </div>
            </div>

            {/* Card 2 — Argentina */}
            <div style={{ display: "flex", flexDirection: "column", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden", background: "#fff" }}>
              <div style={{ background: "linear-gradient(135deg,#eff6ff,#ecfeff)", padding: "16px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", minHeight: "92px" }}>
                <svg width="70" height="84" viewBox="0 0 70 84" fill="none">
                  {/* Sombra del pin */}
                  <ellipse cx="35" cy="81" rx="10" ry="3" fill="rgba(0,0,0,0.15)"/>
                  {/* Cuerpo del pin */}
                  <path d="M 35,78 C 35,78 8,50 8,30 C 8,15 20,4 35,4 C 50,4 62,15 62,30 C 62,50 35,78 35,78 Z" fill="#1e293b"/>
                  {/* Círculo interno blanco (borde) */}
                  <circle cx="35" cy="30" r="22" fill="white"/>
                  {/* Bandera Argentina — franja celeste superior */}
                  <clipPath id="flagClip">
                    <circle cx="35" cy="30" r="20"/>
                  </clipPath>
                  <g clipPath="url(#flagClip)">
                    <rect x="15" y="10" width="40" height="40" fill="#74b9e0"/>
                    {/* Franja blanca del medio */}
                    <rect x="15" y="23" width="40" height="14" fill="#ffffff"/>
                    {/* Sol de Mayo */}
                    <circle cx="35" cy="30" r="4.5" fill="#F6B40E"/>
                    {/* Rayos del sol — alternando rectos y ondulados */}
                    {Array.from({ length: 16 }).map((_, i) => {
                      const angle = (i * 360) / 16
                      const rad = (angle * Math.PI) / 180
                      const isWavy = i % 2 === 1
                      const r1 = 5.5, r2 = isWavy ? 8.5 : 9.5
                      const x1 = 35 + r1 * Math.cos(rad)
                      const y1 = 30 + r1 * Math.sin(rad)
                      const x2 = 35 + r2 * Math.cos(rad)
                      const y2 = 30 + r2 * Math.sin(rad)
                      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#F6B40E" strokeWidth={isWavy ? "1" : "1.5"} strokeLinecap="round"/>
                    })}
                    {/* Cara del sol */}
                    <circle cx="35" cy="30" r="3.8" fill="#F6B40E"/>
                    <circle cx="33.8" cy="29.2" r="0.5" fill="#c8860a"/>
                    <circle cx="36.2" cy="29.2" r="0.5" fill="#c8860a"/>
                    <path d="M 33.8,31 Q 35,32.2 36.2,31" stroke="#c8860a" strokeWidth="0.5" fill="none" strokeLinecap="round"/>
                  </g>
                  {/* Brillo del círculo */}
                  <circle cx="35" cy="30" r="20" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
                  <ellipse cx="29" cy="20" rx="6" ry="4" fill="rgba(255,255,255,0.18)" transform="rotate(-20 29 20)"/>
                </svg>
              </div>
              <div style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a" }}>Encontrá lo que buscás, estés donde estés.</span>
                <span style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.5 }}>Conectamos vendedores y compradores de toda la Argentina de forma directa.</span>
              </div>
            </div>

            {/* Card 3 — Sin publicidad */}
            <div style={{ display: "flex", flexDirection: "column", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden", background: "#fff" }}>
              <div style={{ background: "linear-gradient(135deg,#f0fdf4,#ecfdf5)", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "5px" }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", background: "#fff", borderRadius: "6px", padding: "5px 8px", boxShadow: "0 1px 3px rgba(0,0,0,.06)" }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "4px", background: i === 1 ? "#d1fae5" : i === 2 ? "#dbeafe" : "#fef3c7", flexShrink: 0 }} />
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "3px" }}>
                      <div style={{ width: `${50 + i * 12}px`, height: "3px", background: "#e2e8f0", borderRadius: "2px" }} />
                      <div style={{ width: "32px", height: "2px", background: "#f59e0b", borderRadius: "2px", opacity: 0.8 }} />
                    </div>
                    <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="8" height="8" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#059669" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a" }}>Sin publicidad invasiva</span>
                <span style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.5 }}>Experiencia limpia. Sin ruidos, sin anuncios, sin distracciones.</span>
              </div>
            </div>

          </div>


        </div>
      </section>

      <Footer />
      <PublishFAB />
    </div>
  </>);
}
