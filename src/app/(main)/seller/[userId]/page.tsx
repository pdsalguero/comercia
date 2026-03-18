import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ListingCard } from "@/components/listings/ListingCard";
import { RightSidebar } from "@/components/layout/RightSidebar";
import PinIcon from "@/components/ui/PinIcon";
import { OrderSelect } from "@/components/ui/OrderSelect";

const CATEGORY_NAMES: Record<string, string> = {
  vehicles:        "Vehículos",
  "real-estate":   "Inmuebles",
  phones:          "Celulares",
  electronics:     "Tecnología",
  appliances:      "Electrodomésticos",
  clothing:        "Ropa y Calzado",
  "home-garden":   "Hogar y Muebles",
  sports:          "Deportes",
  tools:           "Herramientas",
  babies:          "Bebés y Niños",
  books:           "Música, Libros y Revistas",
  "beauty-health": "Belleza y Salud",
  toys:            "Juegos y Juguetes",
  pets:            "Mascotas",
  services:        "Servicios",
  other:           "Otros",
};

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
    .select("full_name, avatar_url, created_at, is_store, store_name, store_slug, store_logo_url, store_banner_url, store_type, store_verified, store_whatsapp, store_description, phone")
    .eq("id", userId)
    .single();

  if (!profile) notFound();

  const canShowPhone = (profile as any).show_phone !== false; // default true until migration runs
  const whatsappNumber = canShowPhone
    ? (profile.store_whatsapp ?? (profile as any).phone ?? null)
    : null;
  const displayName = profile.is_store ? (profile.store_name ?? profile.full_name) : profile.full_name;
  const avatarUrl = profile.is_store ? (profile.store_logo_url ?? profile.avatar_url) : profile.avatar_url;
  const memberSince = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("es-AR", { year: "numeric", month: "long" })
    : null;

  const STORE_TYPE_LABELS: Record<string, string> = {
    particular: "Vendedor particular", inmobiliaria: "Inmobiliaria",
    automotora: "Automotora / Concesionaria", tienda: "Tienda general",
    electronica: "Tienda de tecnología", ropa: "Tienda de ropa",
    agencia: "Agencia", servicios: "Empresa de servicios",
  };
  const storeTypeLabel = profile.store_type ? (STORE_TYPE_LABELS[profile.store_type] ?? profile.store_type) : "Vendedor particular";

  // Fetch all active listings from this seller (with category info)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = supabase
    .from("listings")
    .select(`id, title, price, currency, condition, neighborhood, created_at, view_count, attributes, featured_level, category_id, categories(id, name, slug), listing_images(url, position)`)
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
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px 16px" }}>

      {/* ── Seller hero banner ── */}
      <div style={{ background: "#fff", borderRadius: "14px", overflow: "hidden", marginBottom: "20px", border: "1px solid #f0f0f0", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        {/* Banner bg */}
        <div style={{
          height: "72px",
          background: profile.store_banner_url
            ? `url(${profile.store_banner_url}) center/cover`
            : "linear-gradient(135deg, #1e3a5f 0%, #3b82f6 50%, #6366f1 100%)",
          position: "relative",
        }}>
          {profile.is_store && profile.store_verified && (
            <div style={{ position: "absolute", top: "10px", right: "14px", background: "rgba(255,255,255,0.9)", borderRadius: "20px", padding: "4px 10px", fontSize: "11px", fontWeight: 700, color: "#16a34a", display: "flex", alignItems: "center", gap: "4px" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Tienda verificada
            </div>
          )}
        </div>

        {/* Profile info row */}
        <div style={{ padding: "0 20px 16px", display: "flex", alignItems: "flex-end", gap: "14px", flexWrap: "wrap" }}>
          {/* Avatar */}
          <div style={{
            width: "60px", height: "60px", borderRadius: "50%",
            border: "3px solid #fff", overflow: "hidden",
            background: "#e2e8f0", flexShrink: 0,
            marginTop: "-30px", display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}>
            {avatarUrl
              ? <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
            }
          </div>

          {/* Name + meta */}
          <div style={{ flex: 1, paddingTop: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <h1 style={{ fontSize: "20px", fontWeight: 900, color: "#0f172a", margin: 0 }}>
                {displayName ?? "Vendedor"}
              </h1>
              {profile.is_store && (
                <span style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)", color: "#fff", borderRadius: "20px", padding: "2px 10px", fontSize: "11px", fontWeight: 700 }}>
                  Tienda oficial
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginTop: "4px" }}>
              <span style={{ fontSize: "12px", color: "#64748b" }}>{storeTypeLabel}</span>
              {memberSince && (
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>Miembro desde {memberSince}</span>
              )}
              <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
                {(allSellerListings as any[])?.length ?? 0} publicaciones
              </span>
            </div>
            {profile.store_description && (
              <p style={{ fontSize: "13px", color: "#475569", margin: "6px 0 0", lineHeight: 1.5 }}>
                {profile.store_description}
              </p>
            )}
          </div>

          {/* WhatsApp button — always visible, disabled if hidden or no number */}
          {whatsappNumber ? (
            <a href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", flexShrink: 0, marginTop: "10px" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "7px 14px", borderRadius: "8px",
                background: "linear-gradient(135deg,#16a34a,#22c55e)",
                boxShadow: "0 3px 10px rgba(34,197,94,0.35)",
                fontSize: "13px", fontWeight: 700, color: "#fff", cursor: "pointer",
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M11.999 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.998-1.412A9.956 9.956 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
                </svg>
                Contactar por WhatsApp
              </div>
            </a>
          ) : (
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "11px 24px", borderRadius: "10px",
              background: "#f1f5f9", fontSize: "13px", fontWeight: 700,
              color: "#94a3b8", cursor: "not-allowed", flexShrink: 0, marginTop: "10px",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.35 }}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.999 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.998-1.412A9.956 9.956 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
              {!canShowPhone ? "Teléfono oculto" : "Sin WhatsApp"}
            </div>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>

      {/* ── Left sidebar ── */}
      <aside style={{ width: "220px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "10px", position: "sticky", top: "76px" }}>

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
                    <span>{CATEGORY_NAMES[cat.slug] ?? cat.name}</span>
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
            <span style={{ color: "#1e293b", fontWeight: 600 }}>{displayName ?? "Vendedor"}</span>
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

            <OrderSelect
              value={sp.order ?? ""}
              action={base}
              hiddenFields={Object.fromEntries(Object.entries(sp).filter(([k, v]) => v && k !== "order") as [string, string][])}
            />

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
                view_count={l.view_count ?? null}
                created_at={l.created_at ?? null}
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
      </div>{/* end content flex */}
    </div>
  );
}
