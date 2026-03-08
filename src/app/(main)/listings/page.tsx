import { createClient } from "@/lib/supabase/server";
import { ListingCard } from "@/components/listings/ListingCard";
import Link from "next/link";

const CATEGORIES = [
  { name: "Vehículos",      slug: "vehicles",    icon: "🚗" },
  { name: "Inmuebles",      slug: "real-estate", icon: "🏠" },
  { name: "Electrónica",    slug: "electronics", icon: "📱" },
  { name: "Ropa y Calzado", slug: "clothing",    icon: "👗" },
  { name: "Hogar y Jardín", slug: "home-garden", icon: "🛋️" },
  { name: "Deportes",       slug: "sports",      icon: "⚽" },
  { name: "Herramientas",   slug: "tools",       icon: "🔧" },
  { name: "Libros",         slug: "books",       icon: "📚" },
  { name: "Mascotas",       slug: "pets",        icon: "🐾" },
  { name: "Otros",          slug: "other",       icon: "📦" },
];

const CONDITIONS = [
  { value: "new",       label: "Nuevo" },
  { value: "like_new",  label: "Como nuevo" },
  { value: "very_good", label: "Muy bueno" },
  { value: "good",      label: "Bueno" },
  { value: "fair",      label: "Regular" },
];

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string; category?: string; condition?: string;
    price_min?: string; price_max?: string; order?: string; location?: string;
  }>;
}) {
  const params = await searchParams;
  const { q, category, condition, price_min, price_max, order, location } = params;

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

  // Per-category counts
  const { data: catCountRows } = await supabase
    .from("listings")
    .select("category_id")
    .eq("status", "active");

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

  // Build main query
  let query = supabase
    .from("listings")
    .select(`
      id, title, price, currency, condition, neighborhood, created_at, attributes, featured_level,
      listing_images(url, position)
    `)
    .eq("status", "active");

  if (q) query = query.ilike("title", `%${q}%`);
  if (location) query = query.ilike("neighborhood", `%${location}%`);
  if (categoryId) query = query.eq("category_id", categoryId);
  if (condition) query = query.eq("condition", condition);
  if (price_min) query = query.gte("price", Number(price_min));
  if (price_max) query = query.lte("price", Number(price_max));

  // featured_level sorted in JS after fetch (gold > silver > bronze > null)
  if (order === "price_asc") query = query.order("price", { ascending: true });
  else if (order === "price_desc") query = query.order("price", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  const FEAT_ORDER: Record<string, number> = { gold: 0, silver: 1, bronze: 2 };
  const { data: rawData } = await query.limit(60);
  const listings = rawData?.slice().sort((a, b) => {
    const fa = FEAT_ORDER[(a as any).featured_level ?? ""] ?? 3;
    const fb = FEAT_ORDER[(b as any).featured_level ?? ""] ?? 3;
    return fa - fb;
  }) ?? [];

  // Build URL helper preserving all params except the one changed
  function buildUrl(overrides: Record<string, string | undefined>) {
    const merged = { q, category, condition, price_min, price_max, order, ...overrides };
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) {
      if (v) sp.set(k, v);
    }
    const str = sp.toString();
    return `/listings${str ? `?${str}` : ""}`;
  }

  return (
    <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: "220px", flexShrink: 0,
        display: "flex", flexDirection: "column", gap: "12px",
      }}>

        {/* Categories */}
        <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
          <div style={{
            padding: "12px 16px", borderBottom: "1px solid #f0f0f0",
            fontSize: "13px", fontWeight: 700, color: "#333",
          }}>
            Categorías
          </div>
          <div>
            <Link href={buildUrl({ category: undefined })} style={{ textDecoration: "none" }}>
              <div style={{
                padding: "9px 16px", fontSize: "13px", cursor: "pointer",
                background: !category ? "#eff6ff" : "transparent",
                color: !category ? "#2563eb" : "#444",
                fontWeight: !category ? 700 : 400,
                borderLeft: !category ? "3px solid #2563eb" : "3px solid transparent",
              }}>
                Todas las categorías
              </div>
            </Link>
            {CATEGORIES.map((cat) => {
              const id = slugToId[cat.slug];
              const count = id ? (catCounts[id] ?? 0) : 0;
              const active = category === cat.slug;
              return (
                <Link key={cat.slug} href={buildUrl({ category: cat.slug })} style={{ textDecoration: "none" }}>
                  <div style={{
                    padding: "9px 16px", fontSize: "13px", cursor: "pointer",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    background: active ? "#eff6ff" : "transparent",
                    color: active ? "#2563eb" : "#444",
                    fontWeight: active ? 700 : 400,
                    borderLeft: active ? "3px solid #2563eb" : "3px solid transparent",
                  }}>
                    <span>{cat.icon} {cat.name}</span>
                    {count > 0 && (
                      <span style={{
                        background: active ? "#dbeafe" : "#f1f5f9",
                        color: active ? "#2563eb" : "#888",
                        fontSize: "11px", fontWeight: 600,
                        padding: "1px 6px", borderRadius: "20px",
                      }}>{count}</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Price range */}
        <form method="GET" action="/listings" style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
          {/* preserve other params */}
          {q && <input type="hidden" name="q" value={q} />}
          {category && <input type="hidden" name="category" value={category} />}
          {condition && <input type="hidden" name="condition" value={condition} />}
          {order && <input type="hidden" name="order" value={order} />}

          <div style={{ padding: "12px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "13px", fontWeight: 700, color: "#333" }}>
            Precio
          </div>
          <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <input
              name="price_min"
              type="number"
              defaultValue={price_min}
              placeholder="Mínimo"
              style={{
                border: "1.5px solid #e2e8f0", borderRadius: "6px",
                padding: "7px 10px", fontSize: "13px", outline: "none", width: "100%",
                boxSizing: "border-box",
              }}
            />
            <input
              name="price_max"
              type="number"
              defaultValue={price_max}
              placeholder="Máximo"
              style={{
                border: "1.5px solid #e2e8f0", borderRadius: "6px",
                padding: "7px 10px", fontSize: "13px", outline: "none", width: "100%",
                boxSizing: "border-box",
              }}
            />
            <button type="submit" style={{
              background: "#2563eb", color: "#fff", border: "none",
              borderRadius: "6px", padding: "8px", fontSize: "13px",
              fontWeight: 700, cursor: "pointer", width: "100%",
            }}>
              Aplicar
            </button>
          </div>
        </form>

        {/* Condition */}
        <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "13px", fontWeight: 700, color: "#333" }}>
            Condición
          </div>
          <div>
            <Link href={buildUrl({ condition: undefined })} style={{ textDecoration: "none" }}>
              <div style={{
                padding: "9px 16px", fontSize: "13px", cursor: "pointer",
                color: !condition ? "#2563eb" : "#444",
                fontWeight: !condition ? 700 : 400,
                borderLeft: !condition ? "3px solid #2563eb" : "3px solid transparent",
              }}>
                Todas
              </div>
            </Link>
            {CONDITIONS.map((c) => {
              const active = condition === c.value;
              return (
                <Link key={c.value} href={buildUrl({ condition: c.value })} style={{ textDecoration: "none" }}>
                  <div style={{
                    padding: "9px 16px", fontSize: "13px", cursor: "pointer",
                    background: active ? "#eff6ff" : "transparent",
                    color: active ? "#2563eb" : "#444",
                    fontWeight: active ? 700 : 400,
                    borderLeft: active ? "3px solid #2563eb" : "3px solid transparent",
                  }}>
                    {c.label}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Clear filters */}
        {(q || category || condition || price_min || price_max) && (
          <Link href="/listings" style={{ textDecoration: "none" }}>
            <div style={{
              background: "#fff", borderRadius: "10px", padding: "10px 16px",
              fontSize: "13px", color: "#dc2626", fontWeight: 600, cursor: "pointer",
              textAlign: "center", border: "1px solid #fee2e2",
            }}>
              ✕ Limpiar filtros
            </div>
          </Link>
        )}
      </aside>

      {/* ── Main content ── */}
      <div style={{ flex: 1, minWidth: 0 }}>

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

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <form method="GET" action="/listings" style={{ display: "flex", gap: "6px" }}>
              {category && <input type="hidden" name="category" value={category} />}
              {condition && <input type="hidden" name="condition" value={condition} />}
              {price_min && <input type="hidden" name="price_min" value={price_min} />}
              {price_max && <input type="hidden" name="price_max" value={price_max} />}
              {order && <input type="hidden" name="order" value={order} />}
              <input
                name="q"
                defaultValue={q}
                placeholder="Buscar..."
                style={{
                  border: "1.5px solid #e2e8f0", borderRadius: "8px",
                  padding: "7px 12px", fontSize: "13px", outline: "none", width: "180px",
                }}
              />
              <button type="submit" style={{
                background: "#2563eb", color: "#fff", border: "none",
                borderRadius: "8px", padding: "7px 14px",
                fontSize: "13px", fontWeight: 700, cursor: "pointer",
              }}>
                Buscar
              </button>
            </form>

            <div style={{ display: "flex", gap: "4px" }}>
              {[
                { value: "", label: "Recientes" },
                { value: "price_asc", label: "Menor precio" },
                { value: "price_desc", label: "Mayor precio" },
              ].map((opt) => (
                <Link key={opt.value} href={buildUrl({ order: opt.value || undefined })} style={{ textDecoration: "none" }}>
                  <span style={{
                    display: "inline-block", padding: "6px 11px", borderRadius: "6px",
                    fontSize: "12px", fontWeight: 600, cursor: "pointer",
                    background: (order ?? "") === opt.value ? "#2563eb" : "#f1f5f9",
                    color: (order ?? "") === opt.value ? "#fff" : "#555",
                  }}>
                    {opt.label}
                  </span>
                </Link>
              ))}
            </div>
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
          const cardGrid = (items: typeof listings) => (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "14px" }}>
              {items.map((listing) => {
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
    </div>
  );
}
