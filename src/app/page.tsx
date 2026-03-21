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
  const PREFERRED_PILL_SLUGS = ["vehicles", "real-estate", "services", "electronics", "home-garden"];
  const topSubcats = PREFERRED_PILL_SLUGS
    .map(slug => CATEGORIES.find(c => c.slug === slug))
    .filter((c): c is typeof CATEGORIES[0] => !!c)
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
            <div style={{ display: "flex", flexDirection: "column", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden", background: "#fff" }}>
              {/* Illustration */}
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

            {/* Card 2 — Local */}
            <div style={{ display: "flex", flexDirection: "column", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden", background: "#fff" }}>
              {/* Illustration */}
              <div style={{ background: "linear-gradient(135deg,#eff6ff,#ecfeff)", padding: "16px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                <svg width="80" height="60" viewBox="0 0 80 60" fill="none">
                  {/* Map background roads */}
                  <rect x="0" y="0" width="80" height="60" rx="4" fill="#e0f2fe" />
                  <rect x="0" y="26" width="80" height="8" fill="#bae6fd" opacity="0.7"/>
                  <rect x="34" y="0" width="8" height="60" fill="#bae6fd" opacity="0.7"/>
                  {/* Blocks */}
                  <rect x="6" y="6" width="22" height="16" rx="2" fill="#fff" opacity="0.8"/>
                  <rect x="50" y="6" width="24" height="16" rx="2" fill="#fff" opacity="0.8"/>
                  <rect x="6" y="38" width="22" height="16" rx="2" fill="#fff" opacity="0.8"/>
                  <rect x="50" y="38" width="24" height="16" rx="2" fill="#fff" opacity="0.8"/>
                  {/* Main pin */}
                  <ellipse cx="38" cy="24" rx="6" ry="3" fill="rgba(37,99,235,0.2)"/>
                  <path d="M38 8 C34 8 31 11 31 15 C31 20 38 26 38 26 C38 26 45 20 45 15 C45 11 42 8 38 8 Z" fill="#2563eb"/>
                  <circle cx="38" cy="15" r="3" fill="#fff"/>
                  {/* Distance rings */}
                  <circle cx="38" cy="24" r="14" stroke="#3b82f6" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.4"/>
                </svg>
              </div>
              <div style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a" }}>Comprá cerca tuyo</span>
                <span style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.5 }}>Vendedores locales, entrega en mano, sin intermediarios.</span>
              </div>
            </div>

            {/* Card 3 — Sin publicidad */}
            <div style={{ display: "flex", flexDirection: "column", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden", background: "#fff" }}>
              {/* Illustration — clean listing cards, no ads */}
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
                <span style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a" }}>Sin publicidad</span>
                <span style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.5 }}>Sin anuncios que distraen. Solo avisos reales de personas.</span>
              </div>
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
