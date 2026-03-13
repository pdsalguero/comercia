import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ListingCard } from "@/components/listings/ListingCard";
import { RightSidebar } from "@/components/layout/RightSidebar";
import PinIcon from "@/components/ui/PinIcon";

type SP = {
  q?: string;
  cat?: string;
  order?: string;
  price_min?: string;
  price_max?: string;
  view?: string;
};

function buildUrl(base: string, sp: SP, override: Partial<SP>) {
  const merged = { ...sp, ...override };
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (v !== undefined && v !== "") params.set(k, v);
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export default async function SellerPage({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string }>;
  searchParams: Promise<SP>;
}) {
  const { userId } = await params;
  const sp = await searchParams;
  const base = `/seller/${userId}`;

  const supabase = await createClient();

  // Fetch seller profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", userId)
    .single();

  if (!profile) notFound();

  // Fetch all active listings from this seller (with category info)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = supabase
    .from("listings")
    .select(`id, title, price, currency, condition, neighborhood, created_at, attributes, featured_level, category_id, categories(id, name, slug), listing_images(url, position)`)
    .eq("status", "active")
    .eq("user_id", userId) as any;

  // Search
  if (sp.q) {
    const rawTokens = sp.q.trim().split(/\s+/).filter(Boolean);
    const buildFuzzyPattern = (token: string) =>
      "%" + token.replace(/([a-zA-Z])(\d)/g, "$1%$2").replace(/(\d)([a-zA-Z])/g, "$1%$2") + "%";
    for (const token of rawTokens) {
      query = query.ilike("title", buildFuzzyPattern(token));
    }
  }

  // Category filter
  if (sp.cat) query = query.eq("category_id", Number(sp.cat));

  // Price filter
  if (sp.price_min) query = query.gte("price", Number(sp.price_min));
  if (sp.price_max) query = query.lte("price", Number(sp.price_max));

  // Sort
  if (sp.order === "price_asc") query = query.order("price", { ascending: true });
  else if (sp.order === "price_desc") query = query.order("price", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  const FEAT_ORDER: Record<string, number> = { gold: 0, silver: 1, bronze: 2 };
  const { data: rawListings } = await query.limit(200);

  const listings = ((rawListings as any[]) ?? []).slice().sort((a: any, b: any) => {
    if (sp.order === "price_asc") return (a.price ?? 0) - (b.price ?? 0);
    if (sp.order === "price_desc") return (b.price ?? 0) - (a.price ?? 0);
    const fa = FEAT_ORDER[a.featured_level ?? ""] ?? 3;
    const fb = FEAT_ORDER[b.featured_level ?? ""] ?? 3;
    return fa - fb;
  });

  // Build category counts from unfiltered seller listings for sidebar
  const { data: allSellerListings } = await supabase
    .from("listings")
    .select("category_id, categories(id, name, slug)")
    .eq("status", "active")
    .eq("user_id", userId) as any;

  const catMap: Record<string, { id: number; name: string; slug: string; count: number }> = {};
  for (const l of (allSellerListings as any[]) ?? []) {
    const c = l.categories;
    if (!c) continue;
    const key = String(c.id);
    if (!catMap[key]) catMap[key] = { id: c.id, name: c.name, slug: c.slug, count: 0 };
    catMap[key].count++;
  }
  const categories = Object.values(catMap).sort((a, b) => b.count - a.count);

  const isGrid = (sp.view ?? "grid") === "grid";
  const hasFilters = !!(sp.q || sp.cat || sp.price_min || sp.price_max);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px 16px", display: "flex", gap: "16px", alignItems: "flex-start" }}>

      {/* ── Left sidebar ── */}
      <aside style={{ width: "220px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "10px", position: "sticky", top: "76px" }}>

        {/* Seller card */}
        <div style={{ background: "#fff", borderRadius: "10px", padding: "14px 16px", border: "1px solid #f0f0f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", overflow: "hidden", background: "#e2e8f0", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {profile.avatar_url
                ? <img src={profile.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
              }
            </div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b" }}>{profile.full_name ?? "Vendedor"}</div>
              <div style={{ fontSize: "11px", color: "#94a3b8" }}>{(allSellerListings as any[])?.length ?? 0} publicaciones</div>
            </div>
          </div>
        </div>

        {/* Categories */}
        {categories.length > 1 && (
          <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
            <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Categoría
            </div>
            <Link href={buildUrl(base, sp, { cat: undefined })} style={{ textDecoration: "none" }}>
              <div style={{ padding: "8px 16px", fontSize: "13px", cursor: "pointer", background: !sp.cat ? "#eff6ff" : "transparent", color: !sp.cat ? "#2563eb" : "#444", fontWeight: !sp.cat ? 700 : 400, borderLeft: !sp.cat ? "3px solid #2563eb" : "3px solid transparent" }}>
                Todas
              </div>
            </Link>
            {categories.map(cat => {
              const active = sp.cat === String(cat.id);
              return (
                <Link key={cat.id} href={buildUrl(base, sp, { cat: active ? undefined : String(cat.id) })} style={{ textDecoration: "none" }}>
                  <div style={{ padding: "8px 16px", fontSize: "13px", cursor: "pointer", background: active ? "#eff6ff" : "transparent", color: active ? "#2563eb" : "#444", fontWeight: active ? 700 : 400, borderLeft: active ? "3px solid #2563eb" : "3px solid transparent", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>{cat.name}</span>
                    <span style={{ fontSize: "11px", color: active ? "#93c5fd" : "#94a3b8" }}>{cat.count}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Price */}
        <form method="GET" action={base} style={{ background: "#fff", borderRadius: "10px", overflow: "hidden" }}>
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
            <button type="submit" style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", padding: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
              Aplicar
            </button>
          </div>
        </form>

        {/* Clear filters */}
        {hasFilters && (
          <Link href={base} style={{ textDecoration: "none" }}>
            <div style={{ background: "#fff", borderRadius: "10px", padding: "10px 16px", fontSize: "13px", color: "#dc2626", fontWeight: 600, textAlign: "center", border: "1px solid #fee2e2", cursor: "pointer" }}>
              ✕ Limpiar filtros
            </div>
          </Link>
        )}
      </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* Top bar */}
        <div style={{ background: "#fff", borderRadius: "10px", padding: "10px 16px", display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", color: "#64748b", flexWrap: "wrap" }}>
            <Link href="/" style={{ color: "#64748b", textDecoration: "none" }}>Inicio</Link>
            <span style={{ color: "#cbd5e1" }}>›</span>
            <span style={{ color: "#1e293b", fontWeight: 600 }}>{profile.full_name ?? "Vendedor"}</span>
            {sp.cat && categories.find(c => String(c.id) === sp.cat) && (
              <>
                <span style={{ color: "#cbd5e1" }}>›</span>
                <span style={{ color: "#1e293b", fontWeight: 600 }}>{categories.find(c => String(c.id) === sp.cat)?.name}</span>
              </>
            )}
            <span style={{ color: "#94a3b8", fontSize: "12px", marginLeft: "4px" }}>({listings.length})</span>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap", width: "100%" }}>
            <form method="GET" action={base} style={{ display: "flex", gap: "6px", flex: 1, minWidth: 0 }}>
              {Object.entries(sp).map(([k, v]) =>
                v && k !== "q" ? <input key={k} type="hidden" name={k} value={v} /> : null
              )}
              <input name="q" defaultValue={sp.q} placeholder={`Buscar en avisos de ${profile.full_name ?? "este vendedor"}...`}
                style={{ border: "1.5px solid #e2e8f0", borderRadius: "8px", padding: "7px 12px", fontSize: "13px", outline: "none", flex: 1, minWidth: 0 }} />
              <button type="submit" style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", padding: "7px 14px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
                Buscar
              </button>
            </form>

            <div style={{ display: "flex", gap: "4px" }}>
              {[
                { value: "", label: "Recientes" },
                { value: "price_asc", label: "Menor precio" },
                { value: "price_desc", label: "Mayor precio" },
              ].map(opt => (
                <Link key={opt.value} href={buildUrl(base, sp, { order: opt.value || undefined })} style={{ textDecoration: "none" }}>
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
              <Link href={buildUrl(base, sp, { view: undefined })} style={{ textDecoration: "none" }}>
                <div title="Ver en grilla" style={{ padding: "5px 8px", cursor: "pointer", display: "flex", alignItems: "center", background: isGrid ? "#6366f1" : "#fff", color: isGrid ? "#fff" : "#94a3b8" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                  </svg>
                </div>
              </Link>
              <Link href={buildUrl(base, sp, { view: "list" })} style={{ textDecoration: "none" }}>
                <div title="Ver en lista" style={{ padding: "5px 8px", cursor: "pointer", display: "flex", alignItems: "center", background: !isGrid ? "#6366f1" : "#fff", color: !isGrid ? "#fff" : "#94a3b8" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="3" y="5" width="18" height="2" rx="1"/><rect x="3" y="11" width="18" height="2" rx="1"/><rect x="3" y="17" width="18" height="2" rx="1"/>
                  </svg>
                </div>
              </Link>
            </div>
          </div>

          {/* Active filters chips */}
          {hasFilters && (
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {sp.cat && categories.find(c => String(c.id) === sp.cat) && (
                <Link href={buildUrl(base, sp, { cat: undefined })} style={{ textDecoration: "none" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 10px", borderRadius: "20px", background: "#eff6ff", color: "#2563eb", fontSize: "12px", fontWeight: 600 }}>
                    {categories.find(c => String(c.id) === sp.cat)?.name} ×
                  </span>
                </Link>
              )}
              {sp.q && (
                <Link href={buildUrl(base, sp, { q: undefined })} style={{ textDecoration: "none" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 10px", borderRadius: "20px", background: "#eff6ff", color: "#2563eb", fontSize: "12px", fontWeight: 600 }}>
                    &ldquo;{sp.q}&rdquo; ×
                  </span>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Listings */}
        {listings.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: "10px", padding: "40px", textAlign: "center", color: "#94a3b8", fontSize: "14px" }}>
            No se encontraron publicaciones
          </div>
        ) : isGrid ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
            {listings.map((l: any) => {
              const cover = l.listing_images?.sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))[0]?.url ?? null;
              return (
              <ListingCard
                key={l.id}
                id={l.id}
                title={l.title}
                price={l.price}
                currency={l.currency}
                condition={l.condition}
                neighborhood={l.neighborhood}
                cover_image={cover}
                attributes={l.attributes}
                featured_level={l.featured_level}
              />
              );
            })}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {listings.map((l: any) => {
              const cover = l.listing_images?.sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))[0]?.url;
              const attrs = (l.attributes as any) ?? {};
              const subPills: string[] = [attrs.sub_category, attrs.brand, attrs.model].filter(Boolean);
              return (
                <Link key={l.id} href={`/listings/${l.id}`} style={{ textDecoration: "none" }}>
                  <div style={{ background: "#fff", borderRadius: "10px", display: "flex", gap: "14px", padding: "12px", alignItems: "center", border: "1px solid #f0f0f0" }}
                    className="hover:shadow-sm transition-shadow">
                    <div style={{ width: "80px", height: "70px", borderRadius: "8px", overflow: "hidden", flexShrink: 0, background: "#f0f4ff" }}>
                      {cover
                        ? <img src={cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>📦</div>
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#1e293b", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {l.title}
                      </div>
                      {subPills.length > 0 && (
                        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "4px" }}>
                          {subPills.map((p, i) => (
                            <span key={i} style={{ fontSize: "11px", color: "#6366f1", background: "#eef2ff", borderRadius: "4px", padding: "1px 6px", fontWeight: 600, textTransform: "capitalize" }}>{p}</span>
                          ))}
                        </div>
                      )}
                      <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                        {l.condition && (
                          <span style={{ fontSize: "11px", color: "#22c55e", fontWeight: 600 }}>
                            {l.condition === "new" ? "Nuevo" : l.condition === "like_new" ? "Como nuevo" : "Usado"}
                          </span>
                        )}
                        {l.neighborhood && (
                          <span style={{ fontSize: "11px", color: "#94a3b8", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                            <PinIcon size={10} /> {l.neighborhood}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ fontSize: "16px", fontWeight: 800, color: "#f97316", flexShrink: 0 }}>
                      {l.currency === "USD" ? "U$S" : "$"} {l.price?.toLocaleString("es-AR")}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Right sidebar */}
      <div style={{ width: "220px", flexShrink: 0 }}>
        <RightSidebar />
      </div>
    </div>
  );
}
