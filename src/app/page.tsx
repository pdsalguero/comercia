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

const CATEGORIES = [
  { name: "Vehículos",         slug: "vehicles",      icon: "🚗" },
  { name: "Inmuebles",         slug: "real-estate",   icon: "🏠" },
  { name: "Celulares",         slug: "phones",        icon: "📱" },
  { name: "Electrónica",       slug: "electronics",   icon: "💻" },
  { name: "Electrodomésticos", slug: "appliances",    icon: "🧊" },
  { name: "Ropa y Calzado",    slug: "clothing",      icon: "👗" },
  { name: "Muebles y Hogar",   slug: "home-garden",   icon: "🛋️" },
  { name: "Deportes",          slug: "sports",        icon: "⚽" },
  { name: "Herramientas",      slug: "tools",         icon: "🔧" },
  { name: "Bebés y Niños",     slug: "babies",        icon: "👶" },
  { name: "Libros y Juegos",   slug: "books",         icon: "📚" },
  { name: "Belleza y Salud",   slug: "beauty-health", icon: "💄" },
  { name: "Mascotas",          slug: "pets",          icon: "🐾" },
  { name: "Otros",             slug: "other",         icon: "📦" },
];

const CAT_NAMES: Record<string, string> = Object.fromEntries(CATEGORIES.map(c => [c.slug, c.name]));

// Subcategory slug → display metadata
const SUBCAT_META: Record<string, { label: string; href: string; icon: string }> = {
  // vehicles
  auto:         { label: "Autos",          href: "/category/vehicles?type=auto",              icon: "🚗" },
  camioneta:    { label: "Camionetas",     href: "/category/vehicles?type=camioneta",          icon: "🚙" },
  moto:         { label: "Motos",          href: "/category/vehicles?type=moto",              icon: "🏍️" },
  // phones
  smartphone:   { label: "Smartphones",   href: "/category/phones",                           icon: "📱" },
  // electronics
  notebook:     { label: "Notebooks",     href: "/category/electronics",                      icon: "💻" },
  tv:           { label: "Televisores",   href: "/category/electronics",                      icon: "📺" },
  consola:      { label: "Consolas",      href: "/category/electronics",                      icon: "🎮" },
  // appliances
  heladera:     { label: "Heladeras",     href: "/category/appliances",                       icon: "🧊" },
  lavarropas:   { label: "Lavarropas",    href: "/category/appliances",                       icon: "🌀" },
  aire:         { label: "Aire acond.",   href: "/category/appliances",                       icon: "❄️" },
  // real estate
  departamento: { label: "Departamentos", href: "/category/real-estate?re_type=departamento", icon: "🏢" },
  casa:         { label: "Casas",         href: "/category/real-estate?re_type=casa",          icon: "🏠" },
  terreno:      { label: "Terrenos",      href: "/category/real-estate?re_type=terreno",       icon: "🌿" },
  // babies
  juguete:      { label: "Juguetes",      href: "/category/babies",                           icon: "🧸" },
  coche:        { label: "Coches bebé",   href: "/category/babies",                           icon: "🍼" },
};


async function getHomeData() {
  const supabase = await createClient();
  const FIELDS = "id, title, price, currency, condition, neighborhood, created_at, featured_level, attributes, listing_images(url, position)";
  const [
    { data: featuredVehicles },
    { data: featuredRealEstate },
    { data: recent },
    { count: totalListings },
    { count: totalSellers },
    { data: catCounts },
  ] = await Promise.all([
    supabase.from("listings").select(FIELDS).eq("status","active").eq("featured_level","gold").eq("category_id",2).order("created_at",{ascending:false}).limit(12),
    supabase.from("listings").select(FIELDS).eq("status","active").eq("featured_level","gold").eq("category_id",3).order("created_at",{ascending:false}).limit(12),
    supabase.from("listings").select("id,title,price,currency,condition,neighborhood,created_at,listing_images(url,position),categories(name,slug)").eq("status","active").is("featured_level",null).order("created_at",{ascending:false}).limit(10),
    supabase.from("listings").select("*",{count:"exact",head:true}).eq("status","active"),
    supabase.from("profiles").select("*",{count:"exact",head:true}),
    supabase.from("listings").select("category_id, attributes").eq("status","active"),
  ]);
  const counts: Record<number,number> = {};
  const subcatCounts: Record<string, number> = {};
  for (const row of catCounts ?? []) {
    counts[row.category_id] = (counts[row.category_id]??0)+1;
    const sc = (row.attributes as any)?.sub_category as string | undefined;
    if (sc && SUBCAT_META[sc]) subcatCounts[sc] = (subcatCounts[sc] ?? 0) + 1;
  }
  const topSubcats = Object.entries(subcatCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([sc]) => SUBCAT_META[sc]);
  return { featuredVehicles:featuredVehicles??[], featuredRealEstate:featuredRealEstate??[], recent:recent??[], totalListings:totalListings??0, totalSellers:totalSellers??0, categoryCounts:counts, topSubcats };
}

function cover(listing: any): string | null {
  const imgs = listing.listing_images;
  if (!imgs?.length) return null;
  return [...imgs].sort((a:any,b:any)=>a.position-b.position)[0]?.url??null;
}

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { featuredVehicles, featuredRealEstate, recent, totalListings, totalSellers, categoryCounts, topSubcats } = await getHomeData();
  const mapped = CATEGORIES.map((c,i)=>({...c, count: categoryCounts[i+1]??0}));
  const pinned = mapped.slice(0, 3);
  const rest = mapped.slice(3).sort((a,b)=>b.count-a.count);
  const categoriesWithCount = [...pinned, ...rest];

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9" }}>
      <Navbar user={user} hideSearch />

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "16px 16px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "220px 1fr 240px",
          gridTemplateAreas: `"sidebar hero right" "sidebar main right"`,
          gap: "16px",
          alignItems: "start",
        }}>

          {/* ── LEFT SIDEBAR ── */}
          <div style={{ gridArea: "sidebar" }}>
            <CategorySidebar categories={categoriesWithCount} />
          </div>

          {/* ── HERO ── */}
          <div style={{
            gridArea: "hero",
            borderRadius: "16px",
            backgroundImage: "url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&q=80')",
            backgroundSize: "cover", backgroundPosition: "center",
            display: "flex", gap: "0",
            minHeight: "210px", position: "relative",
          }}>
            {/* dark overlay for readability */}
            <div style={{ position:"absolute", inset:0, background:"rgba(10,30,60,0.35)", pointerEvents:"none" }} />

            {/* White search card */}
            <HeroSearch topSubcats={topSubcats.length > 0 ? topSubcats : Object.values(SUBCAT_META).slice(0, 5)} />

          </div>

          {/* ── MAIN CONTENT ── */}
          <div style={{ gridArea: "main", display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Featured Vehicles */}
            {featuredVehicles.length > 0 && (
              <FeaturedCarousel
                title="🚗 Vehículos Premium"
                items={featuredVehicles.map((l:any)=>({...l, cover_image: cover(l)}))}
                href="/category/vehicles"
              />
            )}

            {/* Featured Real Estate */}
            {featuredRealEstate.length > 0 && (
              <FeaturedCarousel
                title="🏠 Inmuebles Premium"
                items={featuredRealEstate.map((l:any)=>({...l, cover_image: cover(l)}))}
                href="/category/real-estate"
              />
            )}

            {featuredVehicles.length === 0 && featuredRealEstate.length === 0 && (
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

            {/* Últimos avisos — grid/list toggle */}
            <RecentListings items={recent.map((l:any) => ({
              ...l,
              categories: l.categories ? { ...l.categories, name: CAT_NAMES[l.categories.slug] ?? l.categories.name } : null,
            }))} />
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div style={{ gridArea: "right" }}>
            <RightSidebar showPublicar={true} />
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
