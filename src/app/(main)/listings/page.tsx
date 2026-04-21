import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { ListingsGrid } from "@/components/listings/ListingsGrid";
import { ListingsViewProvider } from "@/components/listings/ListingsViewContext";
import { ViewToggle } from "@/components/listings/ViewToggle";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import Link from "next/link";
import { OrderSelect } from "@/components/ui/OrderSelect";
import { FilterPanel, type FilterValues } from "@/components/listings/FilterPanel";
import { CategorySidebar } from "@/components/layout/CategorySidebar";

const PAGE_SIZE = 24;

const CAT_IDS = [1,2,3,4,5,6,7,8,9,10,21,22,23,24,25,26];

// Counts cacheados 5 min — HEAD queries, cero egress de datos. Clave incluye province.
const getCategoryCounts = unstable_cache(
  async (province?: string): Promise<Record<number, number>> => {
    const supabase = createPublicClient();
    const entries = await Promise.all(
      CAT_IDS.map(async (id) => {
        let q = supabase
          .from("listings")
          .select("*", { count: "exact", head: true })
          .eq("status", "active")
          .eq("category_id", id);
        if (province) q = q.ilike("neighborhood", `%${province}`);
        const { count } = await q;
        return [id, count ?? 0] as [number, number];
      })
    );
    return Object.fromEntries(entries);
  },
  ["listings-category-counts"],
  { revalidate: 300 }
);

type ListingsParams = {
  q?: string; categorySlug?: string; condition?: string;
  price_min?: string; price_max?: string; order?: string; location?: string;
  fuel?: string; transmission?: string; operation?: string; re_sub?: string;
  page: number;
};

async function _fetchListings(p: ListingsParams) {
  const supabase = createPublicClient();
  const PAGE_SIZE_INNER = 24;

  // Category id from slug
  let categoryId: number | null = null;
  if (p.categorySlug) {
    const { data: cat } = await supabase
      .from("categories").select("id").eq("slug", p.categorySlug).single();
    categoryId = cat?.id ?? null;
  }

  // slug→id map for sidebar
  const { data: dbCategories } = await supabase.from("categories").select("id, slug");

  // Main query
  let query = supabase
    .from("listings")
    .select(`id, title, price, currency, condition, neighborhood, created_at, attributes, featured_level, view_count, user_id, listing_images(url, position)`, { count: "exact" })
    .eq("status", "active");

  if (p.q)         query = query.ilike("title", `%${p.q}%`);
  if (p.location)  query = query.ilike("neighborhood", `%${p.location}%`);
  if (categoryId)  query = query.eq("category_id", categoryId);
  if (p.condition) query = query.eq("condition", p.condition);
  if (p.price_min) query = query.gte("price", Number(p.price_min));
  if (p.price_max) query = query.lte("price", Number(p.price_max));
  if (p.fuel)         query = (query as any).eq("attributes->>fuel", p.fuel);
  if (p.transmission) query = (query as any).eq("attributes->>transmission", p.transmission);
  if (p.operation)    query = (query as any).eq("attributes->>operation", p.operation);
  if (p.re_sub)       query = (query as any).eq("attributes->>sub_category", p.re_sub);

  if (p.order === "price_asc")  query = query.order("price", { ascending: true });
  else if (p.order === "price_desc") query = query.order("price", { ascending: false });
  else if (p.order === "views") query = query.order("view_count", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  const from = (p.page - 1) * PAGE_SIZE_INNER;
  const to   = from + PAGE_SIZE_INNER - 1;
  const { data: rawData, count: totalCount } = await query.range(from, to).returns<any[]>();

  // Store profiles
  const userIds = [...new Set((rawData ?? []).map((l: any) => l.user_id).filter(Boolean))];
  const { data: storeProfiles } = userIds.length > 0
    ? await supabase.from("profiles").select("id, is_store, store_name").in("id", userIds)
    : { data: [] };
  const storeMap: Record<string, { is_store: boolean; store_name: string | null }> = {};
  for (const p of storeProfiles ?? []) storeMap[p.id] = p;

  return {
    rawData: rawData ?? [],
    totalCount: totalCount ?? 0,
    dbCategories: dbCategories ?? [],
    storeMap,
  };
}

// Solo cachear cuando los parámetros son acotados (sin texto libre ni rangos numéricos
// arbitrarios) — evita heap unbounded en Railway por claves únicas infinitas.
function fetchListings(p: ListingsParams) {
  const hasUnboundedParam = p.q || p.location || p.price_min || p.price_max ||
    p.fuel || p.transmission || p.operation || p.re_sub;
  if (hasUnboundedParam) return _fetchListings(p);

  return unstable_cache(
    () => _fetchListings(p),
    ["listings-page", JSON.stringify(p)],
    { revalidate: 120, tags: ["listings"] }
  )();
}

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
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const { q, category, condition, price_min, price_max, order, location,
    brand, fuel, transmission, year_from, year_to, km_max,
    re_sub, operation, bedrooms, size } = params;
  const currentPage = Math.max(1, Number(params.page ?? "1"));

  // Per-category counts — cacheados 5 min por provincia
  const catCounts = await getCategoryCounts(location || undefined);

  // Listings + categories + store profiles — cacheados 2 min por combinación de filtros
  const { rawData, totalCount, dbCategories, storeMap } = await fetchListings({
    q, categorySlug: category, condition, price_min, price_max, order, location,
    fuel, transmission, operation, re_sub, page: currentPage,
  });

  const slugToId: Record<string, number> = {};
  for (const c of dbCategories) slugToId[c.slug] = c.id;
  const categoryId = category ? (slugToId[category] ?? null) : null;

  const FEAT_ORDER: Record<string, number> = { gold: 0, silver: 1, bronze: 2 };
  const sorted = rawData.slice().sort((a: any, b: any) => {
    if (order === "price_asc")  return (a.price ?? 0) - (b.price ?? 0);
    if (order === "price_desc") return (b.price ?? 0) - (a.price ?? 0);
    if (order === "views")      return (b.view_count ?? 0) - (a.view_count ?? 0);
    const fa = FEAT_ORDER[a.featured_level ?? ""] ?? 3;
    const fb = FEAT_ORDER[b.featured_level ?? ""] ?? 3;
    return fa - fb;
  });

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

  const listings = filteredData.map((l: any) => ({
    ...l,
    profiles: storeMap[l.user_id] ?? null,
  }));

  // Build URL helper preserving all params except el que se sobreescribe
  function buildUrl(overrides: Record<string, string | undefined>) {
    const merged = {
      q, category, condition, price_min, price_max, order, location,
      fuel, transmission, year_from, year_to, km_max,
      re_sub, operation, bedrooms, size,
      page: currentPage > 1 ? String(currentPage) : undefined,
      ...overrides,
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
        position: "relative",
        overflow: "hidden",
        height: "140px",
        display: "flex",
        alignItems: "center",
        marginBottom: "16px",
      }}>
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
          position: "absolute", inset: 0,
          background: "linear-gradient(160deg, rgba(10,20,60,0.60) 0%, rgba(10,30,80,0.75) 100%)",
        }} />
        <div style={{ position: "relative", zIndex: 1, padding: "0 32px" }}>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>
            {category ? `${CATEGORIES.find(c => c.slug === category)?.icon ?? ""} ${CATEGORIES.find(c => c.slug === category)?.name ?? category}` : "Todos los avisos"}
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: "13px", color: "rgba(255,255,255,0.65)" }}>
            {totalCount ?? listings.length} publicaciones disponibles en ComerxIA
          </p>
        </div>
      </div>

    <div className="listing-layout">

      {/* ── Sidebar ── */}
      <aside className="listing-sidebar">
        <CategorySidebar
          hideUpsell
          province={location || undefined}
          todosHref={location ? `/listings?location=${encodeURIComponent(location)}` : "/listings"}
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
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "13px", color: "#888" }}>
              <strong style={{ color: "#333" }}>{listings?.length ?? 0}</strong> publicaciones
              {category && ` en ${CATEGORIES.find(c => c.slug === category)?.name ?? category}`}
            </span>
            {location && (
              <Link
                href={buildUrl({ location: undefined, page: undefined })}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "4px",
                  background: "#eff6ff", color: "#2563eb",
                  border: "1px solid #bfdbfe", borderRadius: "20px",
                  padding: "2px 10px", fontSize: "12px", fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                📍 {location} ✕
              </Link>
            )}
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
          const totalPages = Math.ceil((totalCount ?? listings.length) / PAGE_SIZE);
          return (
            <>
              <ListingsGrid
                featured={featured.map(toItem)}
                regular={regular.map(toItem)}
              />

              {/* ── Paginación ── */}
              {totalPages > 1 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "24px 0 8px", flexWrap: "wrap" }}>
                  {currentPage > 1 && (
                    <Link
                      href={buildUrl({ page: String(currentPage - 1) })}
                      style={{ padding: "8px 16px", borderRadius: "8px", border: "1.5px solid #e2e8f0", background: "#fff", fontSize: "13px", fontWeight: 600, color: "#374151", textDecoration: "none" }}
                    >
                      ← Anterior
                    </Link>
                  )}

                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    // Ventana deslizante: mostrar páginas cercanas a la actual
                    let p: number;
                    if (totalPages <= 7) {
                      p = i + 1;
                    } else if (currentPage <= 4) {
                      p = i + 1;
                    } else if (currentPage >= totalPages - 3) {
                      p = totalPages - 6 + i;
                    } else {
                      p = currentPage - 3 + i;
                    }
                    return (
                      <Link
                        key={p}
                        href={buildUrl({ page: String(p) })}
                        style={{
                          width: "36px", height: "36px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center",
                          border: p === currentPage ? "none" : "1.5px solid #e2e8f0",
                          background: p === currentPage ? "#6366f1" : "#fff",
                          fontSize: "13px", fontWeight: p === currentPage ? 800 : 500,
                          color: p === currentPage ? "#fff" : "#374151",
                          textDecoration: "none",
                        }}
                      >
                        {p}
                      </Link>
                    );
                  })}

                  {currentPage < totalPages && (
                    <Link
                      href={buildUrl({ page: String(currentPage + 1) })}
                      style={{ padding: "8px 16px", borderRadius: "8px", border: "1.5px solid #e2e8f0", background: "#fff", fontSize: "13px", fontWeight: 600, color: "#374151", textDecoration: "none" }}
                    >
                      Siguiente →
                    </Link>
                  )}
                </div>
              )}
            </>
          );
        })()}
      </div>

    </div>
    </div>
    </ListingsViewProvider>
  );
}
