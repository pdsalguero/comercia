import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ListingsGrid } from "@/components/listings/ListingsGrid";
import { ListingsViewProvider } from "@/components/listings/ListingsViewContext";
import { ViewToggle } from "@/components/listings/ViewToggle";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import Link from "next/link";
import { OrderSelect } from "@/components/ui/OrderSelect";
import { FilterPanel, type FilterValues } from "@/components/listings/FilterPanel";
import { CategorySidebar } from "@/components/layout/CategorySidebar";

const CATEGORIES = [
  { name: "Vehículos",                 slug: "vehicles",      icon: "🚗",  active: true  },
  { name: "Inmuebles",                 slug: "real-estate",   icon: "🏠",  active: true  },
  { name: "Celulares",                 slug: "phones",        icon: "📱",  active: false },
  { name: "Tecnología",                slug: "electronics",   icon: "💻",  active: false },
  { name: "Electrodomésticos",         slug: "appliances",    icon: "🧊",  active: false },
  { name: "Ropa y Calzado",            slug: "clothing",      icon: "👗",  active: false },
  { name: "Hogar y Muebles",           slug: "home-garden",   icon: "🛋️", active: false },
  { name: "Deportes",                  slug: "sports",        icon: "⚽",  active: false },
  { name: "Herramientas",              slug: "tools",         icon: "🔧",  active: false },
  { name: "Bebés y Niños",             slug: "babies",        icon: "👶",  active: false },
  { name: "Música, Libros y Revistas", slug: "books",         icon: "📚",  active: false },
  { name: "Belleza y Salud",           slug: "beauty-health", icon: "💄",  active: false },
  { name: "Juegos y Juguetes",         slug: "toys",          icon: "🧸",  active: false },
  { name: "Mascotas",                  slug: "pets",          icon: "🐾",  active: false },
  { name: "Servicios",                 slug: "services",      icon: "🛠️", active: false },
  { name: "Otros",                     slug: "other",         icon: "📦",  active: false },
];


export const metadata: Metadata = {
  title: "Todos los avisos — Comprar y vender en Argentina",
  description: "Encontrá los mejores avisos clasificados de Argentina. Autos, motos, inmuebles, electrónica, ropa y mucho más. Comprá y vendé con ComerxIA.",
  keywords: ["avisos clasificados argentina", "comprar usado", "vender online", "clasificados gratis argentina"],
  alternates: { canonical: "https://comerxia.com.ar/listings" },
  openGraph: {
    title: "Todos los avisos — ComerxIA",
    description: "Encontrá los mejores avisos clasificados de Argentina.",
    url: "https://comerxia.com.ar/listings",
    type: "website",
  },
  twitter: { card: "summary", title: "Todos los avisos — ComerxIA", description: "Clasificados de Argentina." },
};

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string; category?: string; condition?: string;
    price_min?: string; price_max?: string; order?: string; location?: string;
    brand?: string; fuel?: string; transmission?: string;
    year_from?: string; year_to?: string; km_max?: string;
    re_sub?: string; operation?: string; bedrooms?: string; size?: string;
  }>;
}) {
  const params = await searchParams;
  const { q, category, condition, price_min, price_max, order, location,
    brand, fuel, transmission, year_from, year_to, km_max,
    re_sub, operation, bedrooms, size } = params;

  const supabase = await createClient();

  // Fetch category id from slug
  let categoryId: number | null = null;
  if (category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", category)
      .single();
    categoryId = cat?.id ?? null;
  }

  // Per-category counts (respects location filter)
  let countQuery = supabase.from("listings").select("category_id").eq("status", "active");
  if (location) countQuery = countQuery.ilike("neighborhood", `%${location}%`);
  const { data: catCountRows } = await countQuery;

  const catCounts: Record<number, number> = {};
  for (const row of catCountRows ?? []) {
    catCounts[row.category_id] = (catCounts[row.category_id] ?? 0) + 1;
  }

  // Fetch categories with ids
  const { data: dbCategories } = await supabase
    .from("categories")
    .select("id, slug");

  const slugToId: Record<string, number> = {};
  for (const c of dbCategories ?? []) slugToId[c.slug] = c.id;

  // Build main query (profiles fetched separately to avoid FK join issues)
  let query = supabase
    .from("listings")
    .select(`
      id, title, price, currency, condition, neighborhood, created_at, attributes, featured_level, view_count, user_id,
      listing_images(url, position)
    `)
    .eq("status", "active");

  if (q) query = query.ilike("title", `%${q}%`);
  if (location) query = query.ilike("neighborhood", `%${location}%`);
  if (categoryId) query = query.eq("category_id", categoryId);
  if (condition) query = query.eq("condition", condition);
  if (price_min) query = query.gte("price", Number(price_min));
  if (price_max) query = query.lte("price", Number(price_max));

  // JSONB attribute filters (string equality — works reliably in PostgREST)
  if (fuel) query = (query as any).eq("attributes->>fuel", fuel);
  if (transmission) query = (query as any).eq("attributes->>transmission", transmission);
  if (operation) query = (query as any).eq("attributes->>operation", operation);
  if (re_sub) query = (query as any).eq("attributes->>sub_category", re_sub);

  // featured_level sorted in JS after fetch (gold > silver > bronze > null)
  if (order === "price_asc") query = query.order("price", { ascending: true });
  else if (order === "price_desc") query = query.order("price", { ascending: false });
  else if (order === "views") query = query.order("view_count", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  const FEAT_ORDER: Record<string, number> = { gold: 0, silver: 1, bronze: 2 };
  const { data: rawData } = await query.limit(60);
  const sorted = rawData?.slice().sort((a, b) => {
    if (order === "price_asc") return ((a as any).price ?? 0) - ((b as any).price ?? 0);
    if (order === "price_desc") return ((b as any).price ?? 0) - ((a as any).price ?? 0);
    if (order === "views") return ((b as any).view_count ?? 0) - ((a as any).view_count ?? 0);
    const fa = FEAT_ORDER[(a as any).featured_level ?? ""] ?? 3;
    const fb = FEAT_ORDER[(b as any).featured_level ?? ""] ?? 3;
    return fa - fb;
  }) ?? [];

  // Numeric JSONB filters (done in JS — PostgREST can't reliably cast JSONB text to numeric)
  const filteredData = sorted.filter((l: any) => {
    const a = (l.attributes as any) ?? {};
    if (year_from && Number(a.year) < Number(year_from)) return false;
    if (year_to   && Number(a.year) > Number(year_to))   return false;
    if (km_max    && Number(a.km)   > Number(km_max))    return false;
    if (bedrooms  && a.bedrooms !== bedrooms)             return false;
    if (size      && a.size !== size)                     return false;
    return true;
  });

  // Fetch store profiles separately
  const userIds = [...new Set(filteredData.map((l: any) => l.user_id).filter(Boolean))];
  const { data: storeProfiles } = userIds.length > 0
    ? await supabase.from("profiles").select("id, is_store, store_name").in("id", userIds)
    : { data: [] };
  const storeMap: Record<string, { is_store: boolean; store_name: string | null }> = {};
  for (const p of storeProfiles ?? []) storeMap[p.id] = p;

  const listings = filteredData.map((l: any) => ({
    ...l,
    profiles: storeMap[l.user_id] ?? null,
  }));

  // Build URL helper preserving all params except the one changed
  function buildUrl(overrides: Record<string, string | undefined>) {
    const merged = {
      q, category, condition, price_min, price_max, order, location,
      fuel, transmission, year_from, year_to, km_max,
      re_sub, operation, bedrooms, size,
      ...overrides
    };
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) {
      if (v) sp.set(k, v);
    }
    const str = sp.toString();
    return `/listings${str ? `?${str}` : ""}`;
  }

  return (
    <ListingsViewProvider>
    <div className="listings-page-wrapper" style={{ maxWidth: "1400px", margin: "0 auto", padding: "16px", boxSizing: "border-box", width: "100%" }}>

      {/* ── Hero banner ── */}
      <div style={{
        borderRadius: "16px",
        backgroundColor: "#0f1b2d",
        backgroundImage: "url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center 60%",
        position: "relative",
        overflow: "hidden",
        height: "140px",
        display: "flex",
        alignItems: "center",
        marginBottom: "16px",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(160deg, rgba(10,20,60,0.60) 0%, rgba(10,30,80,0.75) 100%)",
        }} />
        <div style={{ position: "relative", zIndex: 1, padding: "0 32px" }}>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>
            {category ? `${CATEGORIES.find(c => c.slug === category)?.icon ?? ""} ${CATEGORIES.find(c => c.slug === category)?.name ?? category}` : "Todos los avisos"}
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: "13px", color: "rgba(255,255,255,0.65)" }}>
            {listings.length} publicaciones disponibles en ComerxIA
          </p>
        </div>
      </div>

    <div className="listing-layout">

      {/* ── Sidebar ── */}
      <aside className="listing-sidebar">
        <CategorySidebar
          hideUpsell
          categories={CATEGORIES.map(cat => ({
            ...cat,
            count: catCounts[slugToId[cat.slug] ?? -1] ?? 0,
          }))}
        />

        {/* Filters panel */}
        <FilterPanel
          mode="desktop"
          category={category}
          categoryId={categoryId}
          currentFilters={{ q, category, condition, price_min, price_max, order, location, fuel, transmission, year_from, year_to, km_max, re_sub, operation, bedrooms, size }}
          totalCount={filteredData?.length ?? 0}
        />

        {/* Upsell card — below filters */}
        <div style={{
          background: "linear-gradient(135deg, #fffbeb, #fef3c7)",
          border: "1px solid #fde68a",
          borderRadius: "14px",
          padding: "16px",
        }}>
          <div style={{ fontWeight: 800, fontSize: "13px", color: "#92400e", marginBottom: "4px" }}>
            ⭐ Destacá tu aviso
          </div>
          <div style={{ fontSize: "11px", color: "#b45309", lineHeight: 1.5, marginBottom: "10px" }}>
            Aparecé primero y recibí 5× más consultas que un aviso normal.
          </div>
          <a href="/upgrade" style={{ textDecoration: "none" }}>
            <div style={{
              background: "linear-gradient(135deg, #f59e0b, #fbbf24)",
              color: "#fff", borderRadius: "7px", padding: "8px 0",
              fontWeight: 800, fontSize: "12px", textAlign: "center", cursor: "pointer",
            }}>
              Ver planes
            </div>
          </a>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div style={{ flex: 1, minWidth: 0, width: "100%", boxSizing: "border-box", overflowX: "hidden", padding: "0 8px" }}>

        {/* Top bar */}
        <div style={{
          background: "#fff", borderRadius: "10px", padding: "12px 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: "12px", marginBottom: "16px", flexWrap: "wrap",
        }}>
          <div style={{ fontSize: "13px", color: "#888" }}>
            <strong style={{ color: "#333" }}>{listings?.length ?? 0}</strong> publicaciones
            {category && ` en ${CATEGORIES.find(c => c.slug === category)?.name ?? category}`}
          </div>

          <div className="listings-search-bar" style={{ display: "flex", gap: "8px", alignItems: "center", width: "100%", flexWrap: "wrap" }}>
            <form method="GET" action="/listings" style={{ display: "flex", gap: "6px", flex: 1, minWidth: 0 }}>
              {category && <input type="hidden" name="category" value={category} />}
              {condition && <input type="hidden" name="condition" value={condition} />}
              {price_min && <input type="hidden" name="price_min" value={price_min} />}
              {price_max && <input type="hidden" name="price_max" value={price_max} />}
              <input
                name="q"
                defaultValue={q}
                placeholder="Buscar en todos los avisos..."
                style={{
                  border: "1.5px solid #e2e8f0", borderRadius: "8px",
                  padding: "9px 14px", fontSize: "14px", outline: "none", flex: 1, minWidth: 0,
                }}
              />
              <button type="submit" style={{
                background: "#2563eb", color: "#fff", border: "none",
                borderRadius: "8px", padding: "9px 18px",
                fontSize: "14px", fontWeight: 700, cursor: "pointer", flexShrink: 0,
              }}>
                Buscar
              </button>
            </form>

            <div className="listings-sort-select">
              <OrderSelect
                value={order ?? ""}
                action="/listings"
                hiddenFields={Object.fromEntries([
                  ...(q ? [["q", q]] : []),
                  ...(category ? [["category", category]] : []),
                  ...(condition ? [["condition", condition]] : []),
                  ...(price_min ? [["price_min", price_min]] : []),
                  ...(price_max ? [["price_max", price_max]] : []),
                ])}
              />
            </div>
            <ViewToggle />
            <FilterPanel
              mode="mobile"
              category={category}
              categoryId={categoryId}
              currentFilters={{ q, category, condition, price_min, price_max, order, location, fuel, transmission, year_from, year_to, km_max, re_sub, operation, bedrooms, size }}
              totalCount={filteredData?.length ?? 0}
            />
          </div>
        </div>

        {/* Grid */}
        {!listings || listings.length === 0 ? (
          <div style={{
            background: "#fff", borderRadius: "10px",
            padding: "64px", textAlign: "center", color: "#999",
          }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔍</div>
            <p style={{ fontSize: "15px" }}>No se encontraron avisos.</p>
            <Link href="/listings" style={{ textDecoration: "none" }}>
              <span style={{ color: "#2563eb", fontSize: "14px", fontWeight: 600 }}>Ver todos →</span>
            </Link>
          </div>
        ) : (() => {
          const featured = listings.filter((l) => (l as any).featured_level);
          const regular  = listings.filter((l) => !(l as any).featured_level);
          const toItem = (listing: typeof listings[0]) => {
            const images = listing.listing_images as { url: string; position: number }[] | null;
            const cover = images?.slice().sort((a, b) => a.position - b.position)[0]?.url ?? null;
            return {
              id: listing.id,
              title: listing.title,
              price: listing.price,
              currency: listing.currency ?? "ARS",
              cover_image: cover,
              neighborhood: listing.neighborhood ?? null,
              featured_level: (listing as any).featured_level ?? null,
              attributes: listing.attributes as Record<string, string | number | boolean | null> | undefined,
              view_count: (listing as any).view_count ?? null,
              created_at: (listing as any).created_at ?? null,
              is_store: (listing as any).profiles?.is_store ?? null,
              store_name: (listing as any).profiles?.store_name ?? null,
            };
          };
          return (
            <ListingsGrid
              featured={featured.map(toItem)}
              regular={regular.map(toItem)}
            />
          );
        })()}
      </div>

    </div>
    </div>
    </ListingsViewProvider>
  );
}
