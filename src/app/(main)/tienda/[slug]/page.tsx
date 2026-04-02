import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { ListingCard } from "@/components/listings/ListingCard";
import PinIcon from "@/components/ui/PinIcon";
import { StarRating } from "@/components/ui/StarRating";
import { ReviewForm } from "@/components/listings/ReviewForm";
import { OrderSelect } from "@/components/ui/OrderSelect";
import { SearchWithSuggestions } from "@/components/ui/SearchWithSuggestions";
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
    : `Visitá la tienda virtual de ${name} en ComerxIA. Comprá con confianza.`;

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

async function submitReview(
  sellerId: string,
  slug: string,
  formData: FormData
): Promise<{ error?: string }> {
  "use server";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Debés iniciar sesión para calificar" };
  if (user.id === sellerId) return { error: "No podés calificarte a vos mismo" };

  const rating = Number(formData.get("rating"));
  const comment = ((formData.get("comment") as string) ?? "").trim().slice(0, 500);
  if (!rating || rating < 1 || rating > 5) return { error: "Seleccioná una calificación válida" };

  const { error } = await supabase.from("reviews").upsert(
    { seller_id: sellerId, reviewer_id: user.id, rating, comment: comment || null, updated_at: new Date().toISOString() },
    { onConflict: "seller_id,reviewer_id" }
  );
  if (error) return { error: error.message };
  revalidatePath(`/tienda/${slug}`);
  return {};
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
    .select("id, full_name, avatar_url, created_at, store_name, store_slug, store_type, store_logo_url, store_banner_url, store_description, store_whatsapp, is_store, store_verified, identity_verified, identity_verified_method")
    .eq("store_slug", slug)
    .eq("is_store", true)
    .single();

  if (!profile) notFound();

  const userId = profile.id;
  const storeName = profile.store_name ?? profile.full_name ?? "Tienda";
  const storeTypeLabel = STORE_TYPE_LABELS[profile.store_type ?? ""] ?? "Tienda";
  const memberSince = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("es-AR", { year: "numeric", month: "long" })
    : null;

  // Current user + reviews
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  const { data: rawReviews } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at, reviewer_id")
    .eq("seller_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  const reviewerIds = [...new Set((rawReviews ?? []).map((r) => r.reviewer_id))];
  const { data: reviewerProfiles } = reviewerIds.length > 0
    ? await supabase.from("profiles").select("id, full_name, avatar_url").in("id", reviewerIds)
    : { data: [] };
  const reviewerMap: Record<string, { full_name: string | null; avatar_url: string | null }> = {};
  for (const p of reviewerProfiles ?? []) reviewerMap[p.id] = p;

  const reviews = (rawReviews ?? []).map((r) => ({ ...r, reviewer: reviewerMap[r.reviewer_id] ?? null }));
  const reviewCount = reviews.length;
  const avgRating = reviewCount > 0
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviewCount) * 10) / 10
    : 0;
  const existingReview = currentUser ? reviews.find((r) => r.reviewer_id === currentUser.id) : undefined;
  const canReview = !!currentUser && currentUser.id !== userId;
  const handleReview = submitReview.bind(null, userId, slug);

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
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px 16px" }}>
      {/* ── Store header ── */}
      <div style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", marginBottom: "20px", border: "1px solid #e8edf2", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>

        {/* Banner */}
        <div style={{
          height: "100px", position: "relative",
          background: profile.store_banner_url
            ? `url(${profile.store_banner_url}) center/cover`
            : "linear-gradient(120deg,#0f172a 0%,#1E5BA8 55%,#6366f1 100%)",
        }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.35) 100%)" }} />
        </div>

        {/* Body */}
        <div style={{ padding: "0 20px 20px" }}>

          {/* Logo */}
          <div style={{ position: "relative", display: "inline-block", marginTop: "-36px", marginBottom: "12px" }}>
            <div style={{
              width: "72px", height: "72px", borderRadius: "16px",
              border: "3px solid #fff", overflow: "hidden",
              background: "#e2e8f0", boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "30px", fontWeight: 800, color: "#1e293b",
            }}>
              {profile.store_logo_url
                ? <img src={profile.store_logo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : storeName[0]?.toUpperCase() ?? "🏪"
              }
            </div>
            {(profile.identity_verified || profile.store_verified) && (
              <div style={{
                position: "absolute", bottom: "-2px", right: "-2px",
                width: "20px", height: "20px", borderRadius: "50%",
                background: profile.identity_verified ? "#2563eb" : "#16a34a",
                border: "2.5px solid #fff",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            )}
          </div>

          {/* Name + badges */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "6px" }}>
            <h1 style={{ fontSize: "19px", fontWeight: 800, color: "#1e293b", margin: 0, lineHeight: 1.2 }}>
              {storeName}
            </h1>
            <span style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)", color: "#fff", borderRadius: "20px", padding: "1px 8px", fontSize: "10px", fontWeight: 700, letterSpacing: "0.4px" }}>
              TIENDA
            </span>
            {profile.store_verified && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "11px", fontWeight: 700, color: "#15803d", background: "#dcfce7", borderRadius: "20px", padding: "2px 8px" }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                Verificada
              </span>
            )}
            {profile.identity_verified && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "11px", fontWeight: 700, color: "#1d4ed8", background: "#dbeafe", borderRadius: "20px", padding: "2px 8px" }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                ID Verificado
              </span>
            )}
          </div>

          {/* Stats strip */}
          <div style={{ display: "flex", alignItems: "center", gap: "0", marginBottom: "10px", background: "#f8fafc", borderRadius: "10px", overflow: "hidden", border: "1px solid #f1f5f9" }}>
            <div style={{ flex: 1, textAlign: "center", padding: "8px 6px", borderRight: "1px solid #f1f5f9" }}>
              <div style={{ fontSize: "15px", fontWeight: 800, color: "#1e293b" }}>{totalListings}</div>
              <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "1px" }}>publicaciones</div>
            </div>
            <div style={{ flex: 1, textAlign: "center", padding: "8px 6px", borderRight: "1px solid #f1f5f9" }}>
              {reviewCount > 0 ? (
                <>
                  <div style={{ fontSize: "15px", fontWeight: 800, color: "#f59e0b" }}>{avgRating.toFixed(1)} ★</div>
                  <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "1px" }}>{reviewCount} reseñas</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: "15px", fontWeight: 800, color: "#cbd5e1" }}>—</div>
                  <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "1px" }}>sin reseñas</div>
                </>
              )}
            </div>
            <div style={{ flex: 1, textAlign: "center", padding: "8px 6px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#475569", lineHeight: 1.2 }}>{storeTypeLabel}</div>
              {memberSince && <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "1px" }}>desde {new Date(profile.created_at).getFullYear()}</div>}
            </div>
          </div>

          {/* Description */}
          {profile.store_description && (
            <p className="store-header-desc" style={{ fontSize: "13px", color: "#64748b", margin: "0 0 12px", lineHeight: 1.6 }}>
              {profile.store_description}
            </p>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "10px", marginTop: profile.store_description ? "0" : "4px" }}>
            {profile.store_whatsapp ? (
              <a href={`https://wa.me/${profile.store_whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", flex: 1 }}>
                <button style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
                  padding: "11px 18px", borderRadius: "10px", border: "none",
                  background: "#00a650", color: "#fff",
                  fontSize: "14px", fontWeight: 700, cursor: "pointer",
                  boxShadow: "0 2px 10px rgba(0,166,80,0.3)", fontFamily: "inherit",
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.999 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.998-1.412A9.956 9.956 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
                  Contactar
                </button>
              </a>
            ) : (
              <button disabled style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
                padding: "11px 18px", borderRadius: "10px",
                border: "1.5px solid #e2e8f0", background: "#f8fafc",
                fontSize: "14px", fontWeight: 600, color: "#cbd5e1", cursor: "not-allowed", fontFamily: "inherit",
              }}>
                Sin contacto
              </button>
            )}
            {canReview && (
              <div style={{ flex: 1 }}>
                <ReviewForm
                  sellerId={userId}
                  existingRating={existingReview?.rating}
                  existingComment={existingReview?.comment ?? undefined}
                  onSubmit={handleReview}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="listing-layout">

        {/* Sidebar */}
        <aside className="listing-sidebar" style={{ position: "sticky", top: "76px" }}>

          {/* Categories */}
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

            {/* Single row: search + Buscar + sort + grid/list */}
            <div style={{ display: "flex", gap: "6px", alignItems: "center", width: "100%" }}>
              <SearchWithSuggestions
                placeholder={`Buscar en ${storeName}...`}
                initialValue={sp.q}
                action={base}
                extraParams={Object.fromEntries(Object.entries(sp).filter(([k, v]) => v !== undefined && k !== "q") as [string, string][])}
                style={{ flex: 1, minWidth: 0 }}
              />

              <OrderSelect
                value={sp.order ?? ""}
                action={base}
                hiddenFields={Object.fromEntries(Object.entries(sp).filter(([k, v]) => v && k !== "order") as [string, string][])}
              />

              {/* Grid / List toggle */}
              <div style={{ display: "flex", border: "1.5px solid #e2e8f0", borderRadius: "8px", overflow: "hidden", flexShrink: 0 }}>
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

            {/* Active filter chips */}
            {hasFilters && (sp.cat || sp.tipo || sp.q) && (
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
            <div className="grid-cols-4">
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

      {/* ── Calificaciones ── */}
      <div style={{ paddingBottom: "48px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <h2 style={{ fontSize: "17px", fontWeight: 800, color: "#0f172a", margin: 0 }}>Calificaciones</h2>
            {reviewCount > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "26px", fontWeight: 900, color: "#f59e0b", lineHeight: 1 }}>{avgRating.toFixed(1)}</span>
                <div>
                  <StarRating rating={avgRating} size={15} />
                  <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "1px" }}>
                    {reviewCount} {reviewCount === 1 ? "calificación" : "calificaciones"}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {reviews.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #f1f5f9", padding: "12px 16px", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "18px", lineHeight: 1 }}>⭐</span>
            <span style={{ fontSize: "13px", color: "#94a3b8" }}>
              {canReview ? "Todavía no hay calificaciones · Sé el primero en calificar." : "Todavía no hay calificaciones."}
            </span>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {reviews.map((review) => (
              <div key={review.id} style={{ background: "#fff", borderRadius: "12px", border: "1px solid #f1f5f9", padding: "16px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#e0e7ff", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", fontSize: "14px" }}>
                    {review.reviewer?.avatar_url
                      ? <img src={review.reviewer.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : "👤"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b" }}>{review.reviewer?.full_name ?? "Usuario"}</span>
                      {review.reviewer_id === currentUser?.id && (
                        <span style={{ fontSize: "10px", background: "#eff6ff", color: "#2563eb", borderRadius: "4px", padding: "1px 6px", fontWeight: 700 }}>Tu calificación</span>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                      <StarRating rating={review.rating} size={12} />
                      <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                        {new Date(review.created_at).toLocaleDateString("es-AR", { year: "numeric", month: "long", day: "numeric" })}
                      </span>
                    </div>
                  </div>
                </div>
                {review.comment && <p style={{ margin: 0, fontSize: "13px", color: "#475569", lineHeight: 1.6 }}>{review.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
