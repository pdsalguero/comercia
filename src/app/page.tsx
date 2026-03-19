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
  const [
    { data: allFeatured },
    { data: recent },
    { count: totalListings },
    { count: totalSellers },
    { data: catCounts },
  ] = await Promise.all([
    supabase.from("listings").select(FIELDS).eq("status","active").eq("featured_level","gold").order("created_at",{ascending:false}).limit(32),
    supabase.from("listings").select("id,title,price,currency,condition,neighborhood,created_at,view_count,listing_images!inner(url,position),categories(name,slug)").eq("status","active").order("created_at",{ascending:false}).limit(8),
    supabase.from("listings").select("*",{count:"exact",head:true}).eq("status","active"),
    supabase.from("profiles").select("*",{count:"exact",head:true}),
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
  return { featured, recent:recent??[], totalListings:totalListings??0, totalSellers:totalSellers??0, categoryCounts:counts, topSubcats };
}

function cover(listing: any): string | null {
  const imgs = listing.listing_images;
  if (!imgs?.length) return null;
  return [...imgs].sort((a:any,b:any)=>a.position-b.position)[0]?.url??null;
}

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { featured, recent, totalListings, totalSellers, categoryCounts, topSubcats } = await getHomeData();
  const mapped = CATEGORIES.map((c)=>({...c, count: categoryCounts[c.id]??0}));
  const pinned = mapped.slice(0, 3);
  const rest = mapped.slice(3).filter(c => c.slug !== "other").sort((a,b)=>b.count-a.count);
  const other = mapped.find(c => c.slug === "other");
  const categoriesWithCount = [...pinned, ...rest, ...(other ? [other] : [])];

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9" }}>
      <Navbar user={user} hideSearch />

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "16px 16px" }}>
        <div className="home-grid">

          {/* ── LEFT SIDEBAR ── */}
          <div className="sidebar-hide" style={{ gridArea: "sidebar" }}>
            <CategorySidebar categories={categoriesWithCount} />
          </div>

          {/* ── HERO ── */}
          <div style={{
            gridArea: "hero",
            borderRadius: "16px",
            backgroundImage: "url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&q=80')",
            backgroundSize: "cover", backgroundPosition: "center 60%",
            display: "flex", gap: "0",
            minHeight: "200px", position: "relative",
            overflow: "hidden",
          }}>
            {/* gradient overlay — darker at bottom, lighter at top for depth */}
            <div style={{ position:"absolute", inset:0, background:"linear-gradient(160deg, rgba(10,20,60,0.45) 0%, rgba(10,30,80,0.60) 100%)", pointerEvents:"none" }} />

            {/* White search card */}
            <HeroSearch topSubcats={topSubcats} />

          </div>

          {/* ── MAIN CONTENT ── */}
          <div style={{ gridArea: "main", display: "flex", flexDirection: "column", gap: "16px" }}>

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
          <div className="sidebar-hide" style={{ gridArea: "right" }}>
            <RightSidebar showPublicar={true} />
          </div>

        </div>
      </div>

      <Footer />
      <PublishFAB />
    </div>
  );
}
