import { createClient } from "@/lib/supabase/server";
import { listingUrl } from "@/lib/listing-url";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { ListingCard } from "@/components/listings/ListingCard";
import { RightSidebar } from "@/components/layout/RightSidebar";
import PinIcon from "@/components/ui/PinIcon";
import { OrderSelect } from "@/components/ui/OrderSelect";
import { SearchWithSuggestions } from "@/components/ui/SearchWithSuggestions";
import { StarRating } from "@/components/ui/StarRating";
import { ReviewForm } from "@/components/listings/ReviewForm";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { CATEGORY_CONFIGS } from "@/lib/category-config";

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
  tipo?: string;
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

async function submitReview(
  sellerId: string,
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
    {
      seller_id: sellerId,
      reviewer_id: user.id,
      rating,
      comment: comment || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "seller_id,reviewer_id" }
  );

  if (error) return { error: error.message };
  revalidatePath(`/seller/${sellerId}`);
  return {};
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

  // Current user (for review eligibility)
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  // Fetch seller profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, created_at, is_store, store_name, store_slug, store_logo_url, store_banner_url, store_type, store_verified, store_whatsapp, store_description, phone, identity_verified, identity_verified_method")
    .eq("id", userId)
    .single();

  if (!profile) notFound();

  // Fetch reviews + reviewer names
  const { data: rawReviews } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at, reviewer_id")
    .eq("seller_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  // Fetch reviewer profiles separately to avoid FK ambiguity
  const reviewerIds = [...new Set((rawReviews ?? []).map((r) => r.reviewer_id))];
  const { data: reviewerProfiles } = reviewerIds.length > 0
    ? await supabase.from("profiles").select("id, full_name, avatar_url").in("id", reviewerIds)
    : { data: [] };
  const reviewerMap: Record<string, { full_name: string | null; avatar_url: string | null }> = {};
  for (const p of reviewerProfiles ?? []) reviewerMap[p.id] = p;

  const reviews = (rawReviews ?? []).map((r) => ({
    ...r,
    reviewer: reviewerMap[r.reviewer_id] ?? null,
  }));

  const reviewCount = reviews.length;
  const avgRating = reviewCount > 0
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviewCount) * 10) / 10
    : 0;

  const existingReview = currentUser
    ? reviews.find((r) => r.reviewer_id === currentUser.id)
    : undefined;
  const canReview = !!currentUser && currentUser.id !== userId;

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

  // Tipo filter
  if (sp.tipo) query = query.filter("attributes->>sub_category", "eq", sp.tipo);

  // Price filter
  if (sp.price_min) query = query.gte("price", Number(sp.price_min));
  if (sp.price_max) query = query.lte("price", Number(sp.price_max));

  // Sort
  if (sp.order === "price_asc") query = query.order("price", { ascending: true });
  else if (sp.order === "price_desc") query = query.order("price", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  const FEAT_ORDER: Record<string, number> = { gold: 0, silver: 1, bronze: 2 };
  const { data: rawListings } = await query.limit(48);

  const listings = ((rawListings as any[]) ?? []).slice().sort((a: any, b: any) => {
    if (sp.order === "price_asc") return (a.price ?? 0) - (b.price ?? 0);
    if (sp.order === "price_desc") return (b.price ?? 0) - (a.price ?? 0);
    const fa = FEAT_ORDER[a.featured_level ?? ""] ?? 3;
    const fb = FEAT_ORDER[b.featured_level ?? ""] ?? 3;
    return fa - fb;
  });

  // Build category counts + tipo counts from unfiltered seller listings for sidebar
  const { data: allSellerListings } = await supabase
    .from("listings")
    .select("category_id, attributes, categories(id, name, slug)")
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

  // Subcategory (tipo) counts for the active category
  const tipoMap: Record<string, number> = {};
  if (sp.cat) {
    for (const l of (allSellerListings as any[]) ?? []) {
      if (String(l.category_id) !== sp.cat) continue;
      const tipo = (l.attributes as any)?.sub_category;
      if (tipo) tipoMap[tipo] = (tipoMap[tipo] ?? 0) + 1;
    }
  }
  const tipos = Object.entries(tipoMap).sort((a, b) => b[1] - a[1]);

  const isGrid = (sp.view ?? "grid") === "grid";
  const hasFilters = !!(sp.q || sp.cat || sp.tipo || sp.price_min || sp.price_max);

  // Same label maps as the listing detail page
  const RE_SUBCAT: Record<string, string> = {
    casa: "Casa", departamento: "Departamento", terreno: "Terreno / Lote",
    finca: "Finca / Campo", local: "Local / Oficina", galpon: "Galpón / Depósito",
    cochera: "Cochera", otro: "Otro",
  };
  const VEHICLE_TYPE_LABELS: Record<string, string> = {
    auto: "Autos", camioneta: "Pickups / SUV / Utilitarios", moto: "Motos",
    cuatriciclo: "Cuatriciclos", utv: "Areneros/UTV",
    camion: "Camiones", nautica: "Náutica", otro: "Otros",
  };

  // Build subcatLabelMap using the same source as the listing detail page
  const subcatLabelMap: Record<string, string> = {};
  if (sp.cat === "3") {
    Object.assign(subcatLabelMap, RE_SUBCAT);
  } else if (sp.cat === "2") {
    Object.assign(subcatLabelMap, VEHICLE_TYPE_LABELS);
  } else {
    const activeCatConfig = CATEGORY_CONFIGS.find(c => String(c.id) === sp.cat);
    if (activeCatConfig?.subcats) {
      for (const s of activeCatConfig.subcats) subcatLabelMap[s.value] = s.label;
    }
    if (activeCatConfig?.fields) {
      const f = activeCatConfig.fields.find(f => f.key === "sub_category");
      if (f?.options) for (const o of f.options) subcatLabelMap[o.value] = o.label;
    }
  }
  const handleReview = submitReview.bind(null, userId);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px 16px" }}>

      {/* ── Seller header — ML style ── */}
      <div style={{ background: "#fff", borderRadius: "14px", overflow: "hidden", marginBottom: "20px", border: "1px solid #e8edf2", boxShadow: "0 1px 8px rgba(0,0,0,0.07)" }}>

        {/* Thin banner */}
        <div style={{
          height: "56px",
          background: profile.store_banner_url
            ? `url(${profile.store_banner_url}) center/cover`
            : "linear-gradient(120deg,#1e3a5f 0%,#3b82f6 55%,#6366f1 100%)",
        }} />

        {/* Main content row */}
        <div style={{ padding: "0 20px 16px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>

          {/* Left: avatar + info */}
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>

            {/* Avatar — overlapping banner */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{
                width: "68px", height: "68px",
                borderRadius: profile.is_store ? "12px" : "50%",
                border: "3px solid #fff",
                overflow: "hidden", background: "#e2e8f0",
                marginTop: "-28px",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
              }}>
                {avatarUrl
                  ? <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                }
              </div>
              {/* Verified dot */}
              {(profile.identity_verified || profile.store_verified) && (
                <div style={{
                  position: "absolute", bottom: "0", right: "0",
                  width: "18px", height: "18px", borderRadius: "50%",
                  background: profile.identity_verified ? "#2563eb" : "#16a34a", border: "2px solid #fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              )}
            </div>

            {/* Text info */}
            <div style={{ paddingTop: "10px" }}>
              {/* Line 1: name + type badge */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <h1 style={{ fontSize: "18px", fontWeight: 800, color: "#1e293b", margin: 0, lineHeight: 1.2 }}>
                  {displayName ?? "Vendedor"}
                </h1>
                {profile.is_store && (
                  <span style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)", color: "#fff", borderRadius: "20px", padding: "1px 8px", fontSize: "10px", fontWeight: 700, letterSpacing: "0.3px" }}>
                    TIENDA
                  </span>
                )}
              </div>

              {/* Line 2: verified badges + member since */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "3px", flexWrap: "wrap" }}>
                {profile.identity_verified && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: 700, color: "#1d4ed8", background: "#dbeafe", borderRadius: "20px", padding: "2px 8px" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Vendedor Identificado
                  </span>
                )}
                {profile.store_verified && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: 700, color: "#15803d", background: "#dcfce7", borderRadius: "20px", padding: "2px 8px" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    {profile.is_store ? "Tienda verificada" : "Verificado"}
                  </span>
                )}
                {memberSince && (
                  <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                    Miembro desde {memberSince}
                  </span>
                )}
              </div>

              {/* Line 3: rating + publications */}
              <div style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "8px", flexWrap: "wrap" }}>
                {reviewCount > 0 ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <StarRating rating={avgRating} size={14} />
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#f59e0b" }}>{avgRating.toFixed(1)}</span>
                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>({reviewCount} {reviewCount === 1 ? "calificación" : "calificaciones"})</span>
                  </div>
                ) : (
                  <span style={{ fontSize: "12px", color: "#94a3b8" }}>Sin calificaciones aún</span>
                )}
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#64748b" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                  {(allSellerListings as any[])?.length ?? 0} publicaciones
                </span>
                {storeTypeLabel && (
                  <span style={{ fontSize: "12px", color: "#94a3b8" }}>{storeTypeLabel}</span>
                )}
              </div>

              {profile.store_description && (
                <p style={{ fontSize: "13px", color: "#64748b", margin: "8px 0 0", lineHeight: 1.5, maxWidth: "500px" }}>
                  {profile.store_description}
                </p>
              )}
            </div>
          </div>

          {/* Right: action buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "stretch", flexShrink: 0, paddingTop: "12px", minWidth: "168px" }}>
            {whatsappNumber ? (
              <a href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                <button style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
                  padding: "10px 18px", borderRadius: "8px", border: "none",
                  background: "#00a650", color: "#fff",
                  fontSize: "14px", fontWeight: 700, cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0,166,80,0.3)",
                  fontFamily: "inherit",
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.999 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.998-1.412A9.956 9.956 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
                  Contactar
                </button>
              </a>
            ) : (
              <button disabled style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
                padding: "10px 18px", borderRadius: "8px",
                border: "1.5px solid #e2e8f0", background: "#f8fafc",
                fontSize: "14px", fontWeight: 600, color: "#cbd5e1", cursor: "not-allowed",
                fontFamily: "inherit",
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.25 }}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.999 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.998-1.412A9.956 9.956 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
                Contactar
              </button>
            )}
            {canReview && (
              <ReviewForm
                sellerId={userId}
                existingRating={existingReview?.rating}
                existingComment={existingReview?.comment ?? undefined}
                onSubmit={handleReview}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="listing-layout">

      {/* ── Left sidebar ── */}
      <aside className="listing-sidebar" style={{ position: "sticky", top: "76px" }}>

        {/* Categories */}
        {categories.length > 0 && (
          <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9", fontWeight: 700, fontSize: "13px", color: "#0f172a" }}>
              Categorías
            </div>
            <Link href={buildUrl(base, sp, { cat: undefined })} style={{ textDecoration: "none" }}>
              <div style={{ padding: "9px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f8fafc", cursor: "pointer", background: !sp.cat ? "#f0f4ff" : "#fff" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <CategoryIcon slug="other" size={18} />
                  <span style={{ fontSize: "13px", color: !sp.cat ? "#6366f1" : "#334155", fontWeight: !sp.cat ? 700 : 400 }}>Todas</span>
                </div>
              </div>
            </Link>
            {categories.map((cat, i) => {
              const active = sp.cat === String(cat.id);
              const isLast = i === categories.length - 1 && (!active || tipos.length === 0);
              return (
                <div key={cat.id}>
                  <Link href={buildUrl(base, sp, { cat: active ? undefined : String(cat.id), tipo: undefined })} style={{ textDecoration: "none" }}>
                    <div style={{ padding: "9px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: isLast ? "none" : "1px solid #f8fafc", cursor: "pointer", background: active ? "#f0f4ff" : "#fff" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <CategoryIcon slug={cat.slug} size={18} />
                        <span style={{ fontSize: "13px", color: active ? "#6366f1" : "#334155", fontWeight: active ? 700 : 400 }}>
                          {CATEGORY_NAMES[cat.slug] ?? cat.name}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        {active && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>}
                        <span style={{ fontSize: "10px", color: active ? "#6366f1" : "#94a3b8", background: active ? "#e0e7ff" : "#f1f5f9", borderRadius: "4px", padding: "1px 5px", fontWeight: 600 }}>
                          {cat.count}
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Subcategories tree — only for active category */}
                  {active && tipos.length > 0 && (
                    <div style={{ borderBottom: i === categories.length - 1 ? "none" : "1px solid #f8fafc" }}>
                      <Link href={buildUrl(base, sp, { tipo: undefined })} style={{ textDecoration: "none" }}>
                        <div style={{ padding: "7px 16px 7px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", background: !sp.tipo ? "#f5f3ff" : "#fafafa" }}>
                          <span style={{ fontSize: "12px", color: !sp.tipo ? "#6366f1" : "#64748b", fontWeight: !sp.tipo ? 700 : 400 }}>Todos</span>
                        </div>
                      </Link>
                      {tipos.map(([tipo, count], ti) => {
                        const tipoActive = sp.tipo === tipo;
                        const label = subcatLabelMap[tipo] ?? (tipo.charAt(0).toUpperCase() + tipo.slice(1).replace(/-/g, " "));
                        return (
                          <Link key={tipo} href={buildUrl(base, sp, { tipo: tipoActive ? undefined : tipo })} style={{ textDecoration: "none" }}>
                            <div style={{
                              padding: "7px 16px 7px 40px",
                              display: "flex", alignItems: "center", justifyContent: "space-between",
                              cursor: "pointer",
                              background: tipoActive ? "#f0f4ff" : "#fafafa",
                              borderTop: "1px solid #f1f5f9",
                            }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: tipoActive ? "#6366f1" : "#cbd5e1", flexShrink: 0 }} />
                                <span style={{ fontSize: "12px", color: tipoActive ? "#6366f1" : "#475569", fontWeight: tipoActive ? 700 : 400 }}>{label}</span>
                              </div>
                              <span style={{ fontSize: "10px", color: tipoActive ? "#6366f1" : "#94a3b8", background: tipoActive ? "#e0e7ff" : "#f1f5f9", borderRadius: "4px", padding: "1px 5px", fontWeight: 600 }}>
                                {count}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
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
                <span style={{ color: "#1e293b", fontWeight: 600 }}>{(() => { const c = categories.find(c => String(c.id) === sp.cat); return c ? (CATEGORY_NAMES[c.slug] ?? c.name) : ""; })()}</span>
              </>
            )}
            <span style={{ color: "#94a3b8", fontSize: "12px", marginLeft: "4px" }}>({listings.length})</span>
          </div>

          {/* Row 1: Search + sort + grid toggle */}
          <div style={{ display: "flex", gap: "6px", alignItems: "center", width: "100%" }}>
            <SearchWithSuggestions
              placeholder={`Buscar productos de ${profile.full_name ?? "este vendedor"}...`}
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
                    {(() => { const c = categories.find(c => String(c.id) === sp.cat); return c ? (CATEGORY_NAMES[c.slug] ?? c.name) : ""; })()} ×
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
                <Link key={l.id} href={listingUrl(l.id, l.title)} style={{ textDecoration: "none" }}>
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
        <div className="sidebar-hide" style={{ width: "220px", flexShrink: 0 }}>
          <RightSidebar />
        </div>
      </div>{/* end content flex */}

      {/* ── Reviews section ── */}
      <div style={{ marginTop: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <h2 style={{ fontSize: "17px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              Calificaciones
            </h2>
            {reviewCount > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "26px", fontWeight: 900, color: "#f59e0b", lineHeight: 1 }}>
                  {avgRating.toFixed(1)}
                </span>
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
          <div style={{
            background: "#fff", borderRadius: "10px",
            border: "1px solid #f1f5f9", padding: "12px 16px",
            display: "flex", alignItems: "center", gap: "10px", color: "#94a3b8",
          }}>
            <span style={{ fontSize: "18px", lineHeight: 1 }}>⭐</span>
            <span style={{ fontSize: "13px", color: "#94a3b8" }}>
              {canReview
                ? "Todavía no hay calificaciones · Sé el primero en calificar."
                : "Todavía no hay calificaciones."}
            </span>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {reviews.map((review) => (
              <div key={review.id} style={{
                background: "#fff", borderRadius: "12px",
                border: "1px solid #f1f5f9",
                padding: "16px 20px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  {/* Avatar */}
                  <div style={{
                    width: "34px", height: "34px", borderRadius: "50%",
                    background: "#e0e7ff", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    overflow: "hidden", fontSize: "14px",
                  }}>
                    {review.reviewer?.avatar_url
                      ? <img src={review.reviewer.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : "👤"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b" }}>
                        {review.reviewer?.full_name ?? "Usuario"}
                      </span>
                      {review.reviewer_id === currentUser?.id && (
                        <span style={{ fontSize: "10px", background: "#eff6ff", color: "#2563eb", borderRadius: "4px", padding: "1px 6px", fontWeight: 700 }}>
                          Tu calificación
                        </span>
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
                {review.comment && (
                  <p style={{ margin: 0, fontSize: "13px", color: "#475569", lineHeight: 1.6 }}>
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
