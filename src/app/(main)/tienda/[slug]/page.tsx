import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ListingCard } from "@/components/listings/ListingCard";
import PinIcon from "@/components/ui/PinIcon";
import type { Metadata } from "next";

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

const STORE_TYPE_LABELS: Record<string, string> = {
  particular:   "Vendedor particular",
  inmobiliaria: "Inmobiliaria",
  automotora:   "Automotora / Concesionaria",
  tienda:       "Tienda general",
  electronica:  "Tienda de tecnología",
  ropa:         "Tienda de ropa",
  agencia:      "Agencia",
  servicios:    "Empresa de servicios",
};

type SP = {
  q?: string;
  cat?: string;
  tipo?: string;
  order?: string;
  price_min?: string;
  price_max?: string;
  condition?: string;
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

function timeAgo(dateStr: string) {
  const d = new Date(dateStr);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return "hace un momento";
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
  const days = Math.floor(diff / 86400);
  if (days < 30) return `hace ${days} días`;
  const months = Math.floor(days / 30);
  if (months < 12) return `hace ${months} meses`;
  return `hace ${Math.floor(months / 12)} años`;
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: p } = await supabase
    .from("profiles")
    .select("store_name, store_description, store_logo_url, store_type")
    .eq("store_slug", slug)
    .eq("is_store", true)
    .single();
  if (!p) return { title: "Tienda no encontrada" };

  const name = p.store_name ?? slug;
  const desc = p.store_description
    ? p.store_description.slice(0, 155)
    : `Visitá la tienda virtual de ${name} en ComerxIA. Comprá con confianza en San Juan.`;

  return {
    title: `${name} — Tienda Virtual`,
    description: desc,
    alternates: { canonical: `/tienda/${slug}` },
    openGraph: {
      title: `${name} | ComerxIA`,
      description: desc,
      ...(p.store_logo_url ? { images: [{ url: p.store_logo_url }] } : {}),
      type: "website",
    },
  };
}

export default async function TiendaPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SP>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const base = `/tienda/${slug}`;

  const supabase = await createClient();
  // Resolve store by slug
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, created_at, store_name, store_slug, store_type, store_logo_url, store_banner_url, store_description, store_whatsapp, is_store, store_verified")
    .eq("store_slug", slug)
    .eq("is_store", true)
    .single();

  if (!profile) notFound();

  const userId = profile.id;
  const storeName = profile.store_name ?? profile.full_name ?? "Tienda";
  const storeTypeLabel = STORE_TYPE_LABELS[profile.store_type ?? ""] ?? "Tienda";

  // Fetch listings
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = supabase
    .from("listings")
    .select(`id, title, price, currency, condition, neighborhood, created_at, attributes, featured_level, view_count, category_id, categories(id, name, slug), listing_images(url, position)`)
    .eq("status", "active")
    .eq("user_id", userId) as any;

  if (sp.q) {
    const tokens = sp.q.trim().split(/\s+/).filter(Boolean);
    for (const t of tokens) {
      query = query.ilike("title", `%${t}%`);
    }
  }
  if (sp.cat) query = query.eq("category_id", Number(sp.cat));
  if (sp.tipo) query = query.filter("attributes->>sub_category", "eq", sp.tipo);
  if (sp.condition) query = query.eq("condition", sp.condition);
  if (sp.price_min) query = query.gte("price", Number(sp.price_min));
  if (sp.price_max) query = query.lte("price", Number(sp.price_max));
  if (sp.order === "price_asc") query = query.order("price", { ascending: true });
  else if (sp.order === "price_desc") query = query.order("price", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  const FEAT_ORDER: Record<string, number> = { gold: 0, silver: 1, bronze: 2 };
  const { data: rawListings } = await query.limit(200);
  const listings = ((rawListings as any[]) ?? []).slice().sort((a: any, b: any) => {
    if (sp.order === "price_asc") return (a.price ?? 0) - (b.price ?? 0);
    if (sp.order === "price_desc") return (b.price ?? 0) - (a.price ?? 0);
    return (FEAT_ORDER[a.featured_level ?? ""] ?? 3) - (FEAT_ORDER[b.featured_level ?? ""] ?? 3);
  });

  // Category sidebar
  const { data: allListings } = await supabase
    .from("listings")
    .select("category_id, attributes, categories(id, name, slug)")
    .eq("status", "active")
    .eq("user_id", userId) as any;

  const catMap: Record<string, { id: number; name: string; slug: string; count: number }> = {};
  for (const l of (allListings as any[]) ?? []) {
    const c = l.categories;
    if (!c) continue;
    const key = String(c.id);
    if (!catMap[key]) catMap[key] = { id: c.id, name: c.name, slug: c.slug, count: 0 };
    catMap[key].count++;
  }
  const categories = Object.values(catMap).sort((a, b) => b.count - a.count);
  const totalListings = (allListings as any[])?.length ?? 0;

  // Tipo counts (sub_category) — filtered by selected category
  const tipoMap: Record<string, number> = {};
  for (const l of (allListings as any[]) ?? []) {
    if (sp.cat && String(l.category_id) !== sp.cat) continue;
    const tipo = (l.attributes as any)?.sub_category;
    if (tipo) tipoMap[tipo] = (tipoMap[tipo] ?? 0) + 1;
  }
  const tipos = Object.entries(tipoMap).sort((a, b) => b[1] - a[1]);

  const isGrid = (sp.view ?? "grid") === "grid";
  const hasFilters = !!(sp.q || sp.cat || sp.tipo || sp.price_min || sp.price_max || sp.condition);

  return (
    <div>
      {/* Store header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", marginBottom: "20px" }}>
        {/* Banner */}
        <div style={{
          height: "120px",
          background: profile.store_banner_url
            ? `url(${profile.store_banner_url}) center/cover no-repeat`
            : "linear-gradient(135deg, #1e3a5f 0%, #3b5998 50%, #6366f1 100%)",
          position: "relative",
        }} />

        {/* Profile row */}
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 20px 20px", position: "relative" }}>
          {/* Logo */}
          <div style={{
            width: "80px", height: "80px", borderRadius: "12px",
            background: "#fff", border: "3px solid #fff",
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            position: "absolute", top: "-40px",
            overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "32px",
          }}>
            {profile.store_logo_url
              ? <img src={profile.store_logo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : storeName[0]?.toUpperCase() ?? "🏪"
            }
          </div>

          {/* Info */}
          <div style={{ paddingTop: "48px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <h1 style={{ fontSize: "22px", fontWeight: 900, color: "#0f172a", margin: 0 }}>
                  {storeName}
                </h1>
                {profile.store_verified && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "#eff6ff", color: "#2563eb", borderRadius: "20px", padding: "3px 10px", fontSize: "12px", fontWeight: 700 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#2563eb"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    Verificada
                  </span>
                )}
                <span style={{ background: "#f1f5f9", color: "#475569", borderRadius: "20px", padding: "3px 10px", fontSize: "12px", fontWeight: 600 }}>
                  {storeTypeLabel}
                </span>
              </div>

              {profile.store_description && (
                <p style={{ fontSize: "14px", color: "#64748b", margin: "6px 0 0", maxWidth: "600px" }}>
                  {profile.store_description}
                </p>
              )}

              <div style={{ display: "flex", gap: "14px", marginTop: "8px", fontSize: "13px", color: "#94a3b8", flexWrap: "wrap", alignItems: "center" }}>
                <span>{totalListings} publicaciones</span>
                {(profile as any).store_address && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    {(profile as any).store_address}
                  </span>
                )}
                {profile.store_whatsapp && (
                  <a
                    href={`https://wa.me/${profile.store_whatsapp.replace(/\D/g, "")}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ textDecoration: "none" }}
                  >
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: "6px",
                      padding: "7px 14px", borderRadius: "8px",
                      background: "linear-gradient(135deg,#16a34a,#22c55e)",
                      boxShadow: "0 3px 10px rgba(34,197,94,0.35)",
                      fontSize: "13px", fontWeight: 700, color: "#fff",
                      cursor: "pointer",
                    }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                        <path d="M11.999 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.998-1.412A9.956 9.956 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
                      </svg>
                      Contactar por WhatsApp
                    </div>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 16px 40px" }} className="listing-layout">

        {/* Sidebar */}
        <aside className="listing-sidebar" style={{ position: "sticky", top: "76px" }}>

          {categories.length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden", border: "1px solid #f0f0f0" }}>
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

          {/* Tipo filter */}
          {tipos.length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden", border: "1px solid #f0f0f0" }}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Tipo
              </div>
              <Link href={buildUrl(base, sp, { tipo: undefined })} style={{ textDecoration: "none" }}>
                <div style={{ padding: "8px 16px", fontSize: "13px", cursor: "pointer", background: !sp.tipo ? "#eff6ff" : "transparent", color: !sp.tipo ? "#2563eb" : "#444", fontWeight: !sp.tipo ? 700 : 400, borderLeft: !sp.tipo ? "3px solid #2563eb" : "3px solid transparent" }}>
                  Todos
                </div>
              </Link>
              {tipos.map(([tipo, count]) => {
                const active = sp.tipo === tipo;
                const label = tipo.charAt(0).toUpperCase() + tipo.slice(1).replace(/-/g, " ");
                return (
                  <Link key={tipo} href={buildUrl(base, sp, { tipo: active ? undefined : tipo })} style={{ textDecoration: "none" }}>
                    <div style={{ padding: "8px 16px", fontSize: "13px", cursor: "pointer", background: active ? "#eff6ff" : "transparent", color: active ? "#2563eb" : "#444", fontWeight: active ? 700 : 400, borderLeft: active ? "3px solid #2563eb" : "3px solid transparent", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>{label}</span>
                      <span style={{ fontSize: "11px", color: active ? "#93c5fd" : "#94a3b8" }}>{count}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Condition filter */}
          <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden", border: "1px solid #f0f0f0" }}>
            <div style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Condición
            </div>
            {[
              { value: "", label: "Todos" },
              { value: "new", label: "Nuevo" },
              { value: "like_new", label: "Como nuevo" },
              { value: "used", label: "Usado" },
            ].map(opt => {
              const active = (sp.condition ?? "") === opt.value;
              return (
                <Link key={opt.value} href={buildUrl(base, sp, { condition: opt.value || undefined })} style={{ textDecoration: "none" }}>
                  <div style={{ padding: "8px 16px", fontSize: "13px", cursor: "pointer", background: active ? "#eff6ff" : "transparent", color: active ? "#2563eb" : "#444", fontWeight: active ? 700 : 400, borderLeft: active ? "3px solid #2563eb" : "3px solid transparent" }}>
                    {opt.label}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Price filter */}
          <form method="GET" action={base} style={{ background: "#fff", borderRadius: "10px", overflow: "hidden", border: "1px solid #f0f0f0" }}>
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

          {hasFilters && (
            <Link href={base} style={{ textDecoration: "none" }}>
              <div style={{ background: "#fff", borderRadius: "10px", padding: "10px 16px", fontSize: "13px", color: "#dc2626", fontWeight: 600, textAlign: "center", border: "1px solid #fee2e2", cursor: "pointer" }}>
                ✕ Limpiar filtros
              </div>
            </Link>
          )}
        </aside>

        {/* Main */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Controls bar */}
          <div style={{ background: "#fff", borderRadius: "10px", padding: "10px 16px", display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px", border: "1px solid #f0f0f0" }}>
            <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
              <form method="GET" action={base} style={{ display: "flex", gap: "6px", flex: 1, minWidth: 0 }}>
                {Object.entries(sp).map(([k, v]) =>
                  v && k !== "q" ? <input key={k} type="hidden" name={k} value={v} /> : null
                )}
                <input name="q" defaultValue={sp.q} placeholder={`Buscar en ${storeName}...`}
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

              <div style={{ display: "flex", border: "1.5px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
                <Link href={buildUrl(base, sp, { view: undefined })} style={{ textDecoration: "none" }}>
                  <div title="Grilla" style={{ padding: "5px 8px", cursor: "pointer", display: "flex", alignItems: "center", background: isGrid ? "#6366f1" : "#fff", color: isGrid ? "#fff" : "#94a3b8" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                    </svg>
                  </div>
                </Link>
                <Link href={buildUrl(base, sp, { view: "list" })} style={{ textDecoration: "none" }}>
                  <div title="Lista" style={{ padding: "5px 8px", cursor: "pointer", display: "flex", alignItems: "center", background: !isGrid ? "#6366f1" : "#fff", color: !isGrid ? "#fff" : "#94a3b8" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="3" y="5" width="18" height="2" rx="1"/><rect x="3" y="11" width="18" height="2" rx="1"/><rect x="3" y="17" width="18" height="2" rx="1"/>
                    </svg>
                  </div>
                </Link>
              </div>
            </div>

            {hasFilters && (
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {sp.cat && categories.find(c => String(c.id) === sp.cat) && (
                  <Link href={buildUrl(base, sp, { cat: undefined })} style={{ textDecoration: "none" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 10px", borderRadius: "20px", background: "#eff6ff", color: "#2563eb", fontSize: "12px", fontWeight: 600 }}>
                      {(() => { const c = categories.find(c => String(c.id) === sp.cat); return c ? (CATEGORY_NAMES[c.slug] ?? c.name) : ""; })()} ×
                    </span>
                  </Link>
                )}
                {sp.tipo && (
                  <Link href={buildUrl(base, sp, { tipo: undefined })} style={{ textDecoration: "none" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 10px", borderRadius: "20px", background: "#eff6ff", color: "#2563eb", fontSize: "12px", fontWeight: 600 }}>
                      {sp.tipo.charAt(0).toUpperCase() + sp.tipo.slice(1).replace(/-/g, " ")} ×
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

          {listings.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: "10px", padding: "40px", textAlign: "center", color: "#94a3b8", fontSize: "14px" }}>
              No se encontraron publicaciones
            </div>
          ) : isGrid ? (
            <div className="grid-cols-auto">
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
                          <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
                            {subPills.map((p, i) => (
                              <span key={i} style={{ fontSize: "11px", color: "#6366f1", background: "#eef2ff", borderRadius: "4px", padding: "1px 6px", fontWeight: 600, textTransform: "capitalize" }}>{p}</span>
                            ))}
                          </div>
                        )}
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
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
      </div>

    </div>
  );
}
