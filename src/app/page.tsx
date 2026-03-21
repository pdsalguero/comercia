import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ListingCard } from "@/components/listings/ListingCard";
import { FeaturedCarousel } from "@/components/listings/FeaturedCarousel";
import { CategorySidebar } from "@/components/layout/CategorySidebar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { RecentListings } from "@/components/listings/RecentListings";
import { HeroSearch } from "@/components/listings/HeroSearch";
import { StoreCards } from "@/components/listings/StoreCards";
import { PublishFAB } from "@/components/ui/PublishFAB";

const CATEGORIES = [
  { name: "Vehículos",         slug: "vehicles",      icon: "🚗", id: 2  },
  { name: "Inmuebles",         slug: "real-estate",   icon: "🏠", id: 3  },
  { name: "Celulares",         slug: "phones",        icon: "📱", id: 21 },
  { name: "Tecnología",        slug: "electronics",   icon: "💻", id: 1  },
  { name: "Electrodomésticos", slug: "appliances",    icon: "🧊", id: 22 },
  { name: "Ropa y Calzado",    slug: "clothing",      icon: "👗", id: 4  },
  { name: "Hogar y Muebles", slug: "home-garden", icon: "🛋️", id: 5 },
  { name: "Deportes",          slug: "sports",        icon: "⚽", id: 6  },
  { name: "Herramientas",      slug: "tools",         icon: "🔧", id: 7  },
  { name: "Bebés y Niños",     slug: "babies",        icon: "👶", id: 23 },
  { name: "Música, Libros y Revistas", slug: "books",         icon: "📚", id: 8  },
  { name: "Belleza y Salud",   slug: "beauty-health", icon: "💄", id: 24 },
  { name: "Juegos y Juguetes", slug: "toys",          icon: "🧸", id: 25 },
  { name: "Mascotas",          slug: "pets",          icon: "🐾", id: 9  },
  { name: "Servicios",         slug: "services",      icon: "🛠️", id: 26 },
  { name: "Otros",             slug: "other",         icon: "📦", id: 10 },
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

async function getHomeData() {
  const supabase = await createClient();
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
    supabase.from("listings").select("category_id, view_count").eq("status","active"),
  ]);

  // Fetch store info separately to avoid FK join dependency
  const userIds = [...new Set((allFeatured ?? []).map((l: any) => l.user_id).filter(Boolean))];
  const { data: storeProfiles } = userIds.length > 0
    ? await supabase.from("profiles").select("id, is_store, store_name").in("id", userIds)
    : { data: [] };
  const storeMap: Record<string, { is_store: boolean; store_name: string | null }> = {};
  for (const p of storeProfiles ?? []) storeMap[p.id] = p;

  const counts: Record<number,number> = {};
  const viewsByCategory: Record<number, number> = {};
  for (const row of catCounts ?? []) {
    counts[row.category_id] = (counts[row.category_id]??0)+1;
    viewsByCategory[row.category_id] = (viewsByCategory[row.category_id]??0) + (row.view_count??0);
  }
  const totalViews = Object.values(viewsByCategory).reduce((a,b)=>a+b,0);
  const topSubcats = CATEGORIES
    .map(c => ({ ...c, score: totalViews > 0 ? (viewsByCategory[c.id]??0) : (counts[c.id]??0) }))
    .filter(c => (counts[c.id]??0) > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(c => ({ label: c.name, href: `/category/${c.slug}`, slug: c.slug }));
  const featured = shuffle(allFeatured ?? []).slice(0, 16).map((l: any) => ({
    ...l,
    is_store: storeMap[l.user_id]?.is_store ?? null,
    store_name: storeMap[l.user_id]?.store_name ?? null,
  }));

  // Fetch store info for recent listings
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

  return { featured, recent:recentMapped, totalListings:totalListings??0, totalSellers:totalSellers??0, totalStores:totalStores??0, viewsToday:viewsToday??0, categoryCounts:counts, topSubcats };
}

function cover(listing: any): string | null {
  const imgs = listing.listing_images;
  if (!imgs?.length) return null;
  return [...imgs].sort((a:any,b:any)=>a.position-b.position)[0]?.url??null;
}

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { featured, recent, totalListings, totalSellers, totalStores, viewsToday, categoryCounts, topSubcats } = await getHomeData();
  const mapped = CATEGORIES.map((c)=>({...c, count: categoryCounts[c.id]??0}));
  const pinned = mapped.slice(0, 3);
  const rest = mapped.slice(3).filter(c => c.slug !== "other").sort((a,b)=>b.count-a.count);
  const other = mapped.find(c => c.slug === "other");
  const categoriesWithCount = [...pinned, ...rest, ...(other ? [other] : [])];

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9" }}>
      <Navbar user={user} hideSearch />

      <div className="home-wrapper">
        <div className="home-grid">

          {/* ── LEFT SIDEBAR ── */}
          <div className="sidebar-hide" style={{ gridArea: "sidebar" }}>
            <CategorySidebar categories={categoriesWithCount} />
          </div>

          {/* ── HERO ── */}
          <div className="hero-bg" style={{
            gridArea: "hero",
            borderRadius: "16px",
            backgroundImage: "url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&q=80')",
            backgroundSize: "cover", backgroundPosition: "center 60%",
            display: "flex", gap: "0",
            minHeight: "200px", position: "relative",
            overflow: "hidden",
          }}>
            {/* gradient overlay — hidden on mobile (hero-bg removes bg image) */}
            <div className="sidebar-hide" style={{ position:"absolute", inset:0, background:"linear-gradient(160deg, rgba(10,20,60,0.45) 0%, rgba(10,30,80,0.60) 100%)", pointerEvents:"none" }} />

            {/* White search card */}
            <HeroSearch topSubcats={topSubcats} />

          </div>

          {/* ── MAIN CONTENT ── */}
          <div className="home-main-content" style={{ gridArea: "main", display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* ── Stats bar ── */}
            <div style={{ display: "flex", gap: "8px", overflowX: "auto", scrollbarWidth: "none" }}>
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
                {
                  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
                  iconBg: "#ecfdf5", dot: "#059669",
                  value: `+${viewsToday.toLocaleString("es-AR")}`,
                  label: "visitas hoy",
                },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", background: "#fff", borderRadius: "8px", padding: "5px 10px 5px 6px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", flexShrink: 0 }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: s.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {s.icon}
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: 800, color: "#0f172a", whiteSpace: "nowrap" }}>{s.value}</span>
                  <span style={{ fontSize: "11px", color: "#94a3b8", whiteSpace: "nowrap" }}>{s.label}</span>
                </div>
              ))}
            </div>

            {/* Mobile-only: category icon bar */}
            <div className="mobile-cat-bar">
              {categoriesWithCount.slice(0, 12).map((cat) => (
                <Link key={cat.slug} href={`/category/${cat.slug}`} style={{ textDecoration: "none", flexShrink: 0 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "0 10px", minWidth: "60px" }}>
                    <div style={{
                      width: "46px", height: "46px", borderRadius: "50%",
                      background: "linear-gradient(135deg, #6366f1, #3b82f6)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "20px",
                    }}>
                      {cat.icon}
                    </div>
                    <span style={{ fontSize: "10px", fontWeight: 600, color: "#334155", textAlign: "center", lineHeight: 1.2, maxWidth: "60px" }}>
                      {cat.name.split(" ")[0].replace(",", "")}
                    </span>
                  </div>
                </Link>
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

          {/* ── RIGHT SIDEBAR ── */}
          <div className="sidebar-right-hide home-right-col" style={{ gridArea: "right" }}>
            <RightSidebar showPublicar={true} />
          </div>

        </div>
      </div>

      {/* ── ¿Por qué ComerxIA? ── */}
      <section style={{ background: "#fff", borderTop: "1px solid #e2e8f0", padding: "36px 24px 40px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>

          {/* Headline */}
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 900, color: "#0f172a", margin: "0 0 6px" }}>
              Vendé más fácil. Comprá con confianza.
            </h2>
            <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
              Inteligencia artificial + comunidad local para comprar y vender más rápido.
            </p>
          </div>

          {/* 3 feature cards + CTA en una sola fila */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px", alignItems: "stretch" }}>

            {/* Card 1 — IA */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "16px", background: "#f8fafc" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 0 2h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1 0-2h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
                  <circle cx="8.5" cy="13.5" r="1.5" fill="#fff" stroke="none"/><circle cx="15.5" cy="13.5" r="1.5" fill="#fff" stroke="none"/>
                </svg>
              </div>
              <span style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a" }}>Publicaciones con IA</span>
              <span style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.5 }}>Subí una foto y generamos tu publicación automáticamente.</span>
            </div>

            {/* Card 2 — Local */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "16px", background: "#f8fafc" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg,#3b82f6,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <span style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a" }}>Comprá cerca tuyo</span>
              <span style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.5 }}>Vendedores locales, entrega en mano, sin intermediarios.</span>
            </div>

            {/* Card 3 — Sin publicidad */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "16px", background: "#f8fafc" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg,#10b981,#059669)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <span style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a" }}>Sin publicidad</span>
              <span style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.5 }}>Sin anuncios que distraen. Solo avisos reales de personas.</span>
            </div>

            {/* Publish CTA card */}
            <Link href="/listings/new" style={{ textDecoration: "none", display: "flex", flexDirection: "column", justifyContent: "center", gap: "10px", borderRadius: "12px", padding: "16px", background: "linear-gradient(135deg,#1e293b,#0f172a)" }}>
              <span style={{ fontSize: "13px", fontWeight: 900, color: "#fff", lineHeight: 1.3 }}>¿Tenés algo para vender?</span>
              <span style={{ fontSize: "11px", color: "#94a3b8" }}>En menos de 30 segundos con IA.</span>
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#f59e0b", color: "#fff", borderRadius: "8px", padding: "9px 14px", fontWeight: 900, fontSize: "13px" }}>
                PUBLICAR GRATIS
              </span>
            </Link>

          </div>

        </div>
      </section>

      <Footer />
      <PublishFAB />
    </div>
  );
}
