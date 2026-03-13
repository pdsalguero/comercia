import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { GallerySection } from "./GallerySection";
import { DetailTabs } from "./DetailTabs";
import { getCategoryConfig } from "@/lib/category-config";
import { FavoriteButton } from "@/components/listings/FavoriteButton";
import PinIcon from "@/components/ui/PinIcon";
import { ContactButton } from "@/components/listings/ContactButton";
import { ViewTracker } from "@/components/listings/ViewTracker";

const CONDITION_LABELS: Record<string, string> = {
  new: "Nuevo / A estrenar",
  like_new: "Como nuevo / Excelente",
  very_good: "Muy bueno",
  good: "Bueno",
  fair: "Regular / A refaccionar",
  for_parts: "Para repuestos",
};

const RE_OPERATION: Record<string, string> = {
  venta: "Venta",
  alquiler: "Alquiler",
  "alquiler-temporal": "Alquiler temporal",
};

const RE_SUBCAT: Record<string, string> = {
  casa: "Casa",
  departamento: "Departamento",
  terreno: "Terreno / Lote",
  finca: "Finca / Campo",
  local: "Local / Oficina",
  galpon: "Galpón / Depósito",
  cochera: "Cochera",
  otro: "Otro",
};

const CATEGORY_NAMES: Record<number, string> = {
  1: "Tecnología", 2: "Vehículos", 3: "Inmuebles", 4: "Ropa",
  5: "Hogar", 6: "Deportes", 7: "Herramientas", 8: "Libros",
  9: "Mascotas", 10: "Otros",
  21: "Celulares", 22: "Electrodomésticos", 23: "Bebés y Niños", 24: "Belleza y Salud",
};

const CATEGORY_SLUGS: Record<number, string> = {
  1: "electronics", 2: "vehicles", 3: "real-estate", 4: "clothing",
  5: "home-garden", 6: "sports", 7: "tools", 8: "books",
  9: "pets", 10: "other",
  21: "phones", 22: "appliances", 23: "babies", 24: "beauty-health",
};

const VEHICLE_TYPE_LABELS: Record<string, string> = {
  auto: "Autos", camioneta: "Camionetas / SUV", moto: "Motos",
  camion: "Camiones", nautica: "Náutica", otro: "Otros",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `hace ${days} día${days > 1 ? "s" : ""}`;
  if (hours > 0) return `hace ${hours} hora${hours > 1 ? "s" : ""}`;
  return `hace ${mins} minuto${mins !== 1 ? "s" : ""}`;
}

function memberSince(dateStr: string) {
  return new Date(dateStr).getFullYear().toString();
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L0 24l6.335-1.512A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.8 9.8 0 01-5.003-1.367l-.36-.214-3.732.891.935-3.618-.235-.373A9.787 9.787 0 012.182 12C2.182 6.579 6.579 2.182 12 2.182c5.42 0 9.818 4.397 9.818 9.818 0 5.42-4.398 9.818-9.818 9.818z"/>
    </svg>
  );
}

async function getRelated(currentId: string, categoryId: number, brand?: string, model?: string) {
  const supabase = await createClient();
  const normalize = (s: string) => String(s ?? "").toLowerCase();

  // 1. Try brand + model across all categories
  if (brand && model) {
    const { data: byModel } = await supabase
      .from("listings")
      .select(`id, title, price, currency, neighborhood, attributes, listing_images(url, position)`)
      .eq("status", "active")
      .neq("id", currentId)
      .limit(30);
    const matched = (byModel ?? []).filter((l: any) => {
      const a = (l.attributes as Record<string, any>) ?? {};
      return normalize(a.brand) === normalize(brand) && normalize(a.model) === normalize(model);
    });
    if (matched.length > 0) return { items: matched.slice(0, 10), label: `${brand} ${model}` };
  }

  // 2. Try brand across all categories
  if (brand) {
    const { data: byBrand } = await supabase
      .from("listings")
      .select(`id, title, price, currency, neighborhood, attributes, listing_images(url, position)`)
      .eq("status", "active")
      .neq("id", currentId)
      .limit(30);
    const matched = (byBrand ?? []).filter((l: any) => {
      const a = (l.attributes as Record<string, any>) ?? {};
      return normalize(a.brand) === normalize(brand);
    });
    if (matched.length > 0) return { items: matched.slice(0, 10), label: brand };
  }

  // 3. Fallback: same category
  const { data: byCat } = await supabase
    .from("listings")
    .select(`id, title, price, currency, neighborhood, attributes, listing_images(url, position)`)
    .eq("status", "active")
    .eq("category_id", categoryId)
    .neq("id", currentId)
    .limit(10);
  return { items: byCat ?? [], label: "" };
}

async function getListing(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(`id, title, description, price, currency, condition, neighborhood, created_at, category_id, attributes, user_id, listing_images(url, position)`)
    .eq("id", id)
    .eq("status", "active")
    .single();
  if (error) { console.error("getListing error:", error.message); return null; }
  if (!data) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, created_at")
    .eq("id", data.user_id)
    .single();

  return { ...data, profile: profile ?? null };
}

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) notFound();

  const attrs0 = (listing.attributes as Record<string, any>) ?? {};
  const { items: related, label: relatedLabel } = await getRelated(
    id, listing.category_id, attrs0.brand, attrs0.model
  );

  const images: { url: string; position: number }[] = (
    (listing.listing_images as any[]) ?? []
  ).sort((a, b) => a.position - b.position);

  const attrs = (listing.attributes as Record<string, any>) ?? {};
  const currency = (listing as any).currency ?? "ARS";
  const profile = (listing as any).profile as { full_name: string | null; avatar_url: string | null; created_at: string | null } | null;
  const userId = (listing as any).user_id as string;
  const currencySymbol = currency === "USD" ? "U$D" : "$";

  const vehicleSpecs = [
    ["Marca",       attrs.brand],
    ["Modelo",      attrs.model],
    ["Versión",     attrs.version],
    ["Año",         attrs.year],
    ["Kilometraje", attrs.km ? `${Number(attrs.km).toLocaleString("es-AR")} km` : null],
    ["Combustible", attrs.fuel],
    ["Transmisión", attrs.transmission],
    ["Color",       attrs.color],
    ["Motor",       attrs.engine],
    ["Tipo",        attrs.sub_category],
    ["Vendedor",    attrs.seller_type],
  ].filter(([, v]) => v) as [string, string][];

  const boolExtras = [
    [attrs.first_owner,      "Único dueño"],
    [attrs.accepts_trade,    "Acepta permuta"],
    [attrs.has_gnc,          "Con GNC"],
    [attrs.financing,        "Financiamiento disponible"],
    [attrs.negotiable_price, "Precio negociable"],
  ].filter(([v]) => v).map(([, label]) => label as string);

  const quickSpecs = listing.category_id === 3
    ? [
        attrs.sub_category  && { icon: "🏠", label: "Tipo",          value: RE_SUBCAT[attrs.sub_category] ?? attrs.sub_category },
        attrs.re_operation  && { icon: "🔑", label: "Operación",     value: RE_OPERATION[attrs.re_operation] ?? attrs.re_operation },
        attrs.m2_covered    && { icon: "📐", label: "Sup. cubierta", value: `${attrs.m2_covered} m²` },
        attrs.bedrooms      && { icon: "🛏️", label: "Dormitorios",  value: String(attrs.bedrooms) },
      ].filter(Boolean) as { icon: string; label: string; value: string }[]
    : [
        attrs.year         && { icon: "📅", label: "Año",         value: String(attrs.year) },
        attrs.km           && { icon: "🛣️", label: "Kilometraje", value: `${Number(attrs.km).toLocaleString("es-AR")} km` },
        attrs.fuel         && { icon: "⛽", label: "Combustible", value: attrs.fuel },
        attrs.transmission && { icon: "⚙️", label: "Transmisión", value: attrs.transmission },
      ].filter(Boolean) as { icon: string; label: string; value: string }[];

  const realEstateSpecs = [
    ["Tipo",           attrs.sub_category  ? RE_SUBCAT[attrs.sub_category] ?? attrs.sub_category : null],
    ["Operación",      attrs.re_operation  ? RE_OPERATION[attrs.re_operation] ?? attrs.re_operation : null],
    ["Estado",         attrs.condition     ? CONDITION_LABELS[attrs.condition] ?? attrs.condition : null],
    ["Ambientes",      attrs.rooms],
    ["Dormitorios",    attrs.bedrooms],
    ["Baños",          attrs.bathrooms],
    ["Piso",           attrs.floor],
    ["Sup. cubierta",  attrs.m2_covered    ? `${attrs.m2_covered} m²` : null],
    ["Sup. total",     attrs.m2_total      ? `${attrs.m2_total} m²` : null],
    ["Antigüedad",     attrs.age           ? (attrs.age === "estrenar" ? "A estrenar" : `${attrs.age} años`) : null],
    ["Orientación",    attrs.orientation],
    ["Calefacción",    attrs.heating],
    ["Expensas",       attrs.expenses      ? `${currency === "USD" ? "U$D" : "$"} ${Number(attrs.expenses).toLocaleString("es-AR")}` : null],
    ["Zona",           attrs.zone],
    ["Vendedor",       attrs.seller_type   ? (attrs.seller_type === "owner" ? "Dueño directo" : "Inmobiliaria") : null],
  ].filter(([, v]) => v) as [string, string][];

  const realEstateBoolExtras = [
    [attrs.garage,          "Garage"],
    [attrs.pool,            "Pileta"],
    [attrs.elevator,        "Ascensor"],
    [attrs.private_complex, "Barrio privado / Country"],
    [attrs.credit_eligible, "Apto crédito"],
    [attrs.furnished,       "Amoblado"],
    [attrs.pets_allowed,    "Acepta mascotas"],
    [attrs.air_conditioning,"Aire acondicionado"],
    [attrs.laundry,         "Lavadero"],
    [attrs.storage,         "Baulera"],
    [attrs.grill,           "Parrilla"],
    [attrs.security,        "Seguridad 24hs"],
  ].filter(([v]) => v).map(([, label]) => label as string);

  const mapUrl = listing.category_id === 3 && attrs.lat && attrs.lng
    ? (() => {
        const delta = 0.006;
        return `https://www.openstreetmap.org/export/embed.html?bbox=${attrs.lng - delta},${attrs.lat - delta},${attrs.lng + delta},${attrs.lat + delta}&layer=mapnik&marker=${attrs.lat},${attrs.lng}`;
      })()
    : null;

  // Determine specs + boolTags for the detail tabs
  const isVehicle = listing.category_id === 2;
  const isRealEstate = listing.category_id === 3;

  // Generic specs from category-config fields
  const catConfig = !isVehicle && !isRealEstate ? getCategoryConfig(listing.category_id) : undefined;
  const genericSpecs: [string, string][] = catConfig
    ? catConfig.fields
        .filter(f => f.type !== "checkbox")
        .flatMap(f => {
          const val = attrs[f.key];
          if (val === undefined || val === null || val === "") return [];
          if (f.type === "select" && f.options) {
            const opt = f.options.find(o => o.value === String(val));
            return [[f.label, opt?.label ?? String(val)] as [string, string]];
          }
          return [[f.label, String(val)] as [string, string]];
        })
    : [];
  const genericBoolTags: string[] = catConfig
    ? catConfig.fields.filter(f => f.type === "checkbox" && attrs[f.key]).map(f => f.label)
    : [];

  const specRows = isVehicle ? vehicleSpecs : isRealEstate ? realEstateSpecs : genericSpecs;
  const boolTags = isVehicle ? boolExtras : isRealEstate ? realEstateBoolExtras : genericBoolTags;
  const tabLabel = isVehicle ? "Detalles del vehículo" : isRealEstate ? "Detalles del inmueble" : "Características";

  const whatsappPhone = attrs.whatsapp_phone as string | undefined;
  const whatsappUrl = whatsappPhone
    ? `https://wa.me/${whatsappPhone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola, vi tu publicación "${listing.title}" en ComerxIA y me interesa`)}`
    : null;

  const sellerName = profile?.full_name ?? "Usuario";
  const sellerInitial = sellerName[0]?.toUpperCase() ?? "?";

  // Feature badges for bottom of right card
  const featureBadges = [
    { show: true,                    icon: "🤝", label: "Entrega a coordinar" },
    { show: !!attrs.financing,       icon: "💳", label: "Se puede financiar" },
    { show: !!attrs.accepts_trade,   icon: "🔄", label: "Acepta permuta" },
    { show: !!attrs.negotiable_price,icon: "💬", label: "Precio negociable" },
  ].filter(b => b.show);

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh", paddingBottom: "60px" }}>
      <ViewTracker listingId={listing.id} />
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 16px" }}>

        {/* Breadcrumb */}
        {(() => {
          const catSlug = CATEGORY_SLUGS[listing.category_id];
          const catName = CATEGORY_NAMES[listing.category_id] ?? "Avisos";
          const sep = <span style={{ color: "#cbd5e1", margin: "0 4px" }}>›</span>;
          const linkStyle = { color: "#2563eb", textDecoration: "none" as const, fontWeight: 500 };
          const activeStyle = { color: "#1e293b", fontWeight: 600 as const };

          return (
            <nav style={{ fontSize: "12px", padding: "10px 0", display: "flex", alignItems: "center", flexWrap: "wrap" as const, gap: "2px" }}>
              <Link href="/" style={linkStyle}>Inicio</Link>
              {sep}
              <Link href={`/category/${catSlug}`} style={linkStyle}>{catName}</Link>

              {isVehicle && attrs.sub_category && (
                <>
                  {sep}
                  <Link href={`/category/${catSlug}?type=${encodeURIComponent(attrs.sub_category)}`} style={linkStyle}>
                    {VEHICLE_TYPE_LABELS[attrs.sub_category] ?? String(attrs.sub_category)}
                  </Link>
                </>
              )}

              {isVehicle && attrs.brand && (
                <>
                  {sep}
                  <Link
                    href={`/category/${catSlug}${attrs.sub_category ? `?type=${encodeURIComponent(attrs.sub_category)}&brand=${encodeURIComponent(attrs.brand)}` : `?brand=${encodeURIComponent(attrs.brand)}`}`}
                    style={{ ...linkStyle, textTransform: "capitalize" }}
                  >
                    {String(attrs.brand).replace(/_/g, " ")}
                  </Link>
                </>
              )}

              {isVehicle && attrs.model && (
                <>
                  {sep}
                  <Link
                    href={`/category/${catSlug}${attrs.sub_category ? `?type=${encodeURIComponent(attrs.sub_category)}` : ""}${attrs.brand ? `&brand=${encodeURIComponent(attrs.brand)}` : ""}${attrs.model ? `&model=${encodeURIComponent(attrs.model)}` : ""}`}
                    style={{ ...linkStyle, textTransform: "capitalize" }}
                  >
                    {String(attrs.model)}
                  </Link>
                </>
              )}

              {!isVehicle && !isRealEstate && catConfig && attrs.sub_category && (
                <>
                  {sep}
                  <Link href={`/category/${catSlug}?type=${encodeURIComponent(attrs.sub_category)}`} style={linkStyle}>
                    {catConfig.fields.find(f => f.key === "sub_category")?.options?.find(o => o.value === attrs.sub_category)?.label ?? String(attrs.sub_category)}
                  </Link>
                </>
              )}

              {!isVehicle && !isRealEstate && catConfig && attrs.brand && (
                <>
                  {sep}
                  <Link href={`/category/${catSlug}?brand=${encodeURIComponent(attrs.brand)}`} style={{ ...linkStyle, textTransform: "capitalize" }}>
                    {catConfig.fields.find(f => f.key === "brand")?.options?.find(o => o.value === attrs.brand)?.label ?? String(attrs.brand)}
                  </Link>
                </>
              )}

              {!isVehicle && (
                <>
                  {sep}
                  <span style={activeStyle}>
                    {listing.title.length > 55 ? listing.title.slice(0, 55) + "…" : listing.title}
                  </span>
                </>
              )}
            </nav>
          );
        })()}

        {/* ── 2-column layout ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "16px", alignItems: "start" }}>

          {/* ════ LEFT COLUMN ════ */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

            {/* Gallery */}
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,.07)" }}>
              <GallerySection images={images} title={listing.title} />
            </div>

            {/* Description + Specs tabs */}
            {(listing.description || specRows.length > 0 || boolTags.length > 0) && (
              <DetailTabs
                description={listing.description}
                specRows={specRows}
                boolTags={boolTags}
                tabLabel={tabLabel}
              />
            )}

            {/* Map */}
            {mapUrl && (
              <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,.07)" }}>
                <div style={{ padding: "16px 20px 12px", fontWeight: 700, fontSize: "15px", color: "#1e293b" }}>
                  Ubicación
                </div>
                <iframe
                  src={mapUrl}
                  width="100%"
                  height="260"
                  style={{ border: "none", display: "block" }}
                  loading="lazy"
                  title="Ubicación del inmueble"
                />
                {attrs.address_str && (
                  <div style={{ padding: "10px 20px", fontSize: "12px", color: "#64748b", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "4px" }}>
                    <PinIcon size={11} /> {attrs.address_str}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ════ RIGHT COLUMN — sticky ════ */}
          <div style={{ position: "sticky", top: "72px", display: "flex", flexDirection: "column", gap: "12px" }}>

            {/* Main card */}
            <div style={{ background: "#fff", borderRadius: "8px", padding: "20px", boxShadow: "0 1px 2px rgba(0,0,0,.08)" }}>

              {/* Time */}
              <div style={{ fontSize: "12px", color: "#999", marginBottom: "6px" }}>
                Publicado {timeAgo(listing.created_at)}
              </div>

              {/* Title */}
              <h1 style={{ fontSize: "17px", fontWeight: 600, color: "#333", lineHeight: 1.35, margin: "0 0 14px" }}>
                {listing.title}
              </h1>

              {/* Quick specs inline */}
              {quickSpecs.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "14px" }}>
                  {quickSpecs.map((spec) => (
                    <span key={spec.label} style={{
                      background: "#f1f5f9", borderRadius: "4px",
                      padding: "4px 8px", fontSize: "12px", color: "#475569",
                    }}>
                      {spec.icon} <strong style={{ textTransform: "capitalize" }}>{spec.value}</strong>
                    </span>
                  ))}
                </div>
              )}

              {/* Price */}
              <div style={{ marginBottom: "6px" }}>
                {listing.price ? (
                  <div style={{ display: "flex", alignItems: "baseline", gap: "4px", color: "#333" }}>
                    <span style={{ fontSize: "18px", fontWeight: 400 }}>{currencySymbol}</span>
                    <span style={{ fontSize: "30px", fontWeight: 600, letterSpacing: "-1px" }}>{Number(listing.price).toLocaleString("es-AR")}</span>
                  </div>
                ) : (
                  <div style={{ fontSize: "16px", color: "#999" }}>Precio a consultar</div>
                )}
              </div>

              {/* Green labels */}
              {(attrs.negotiable_price || attrs.financing) && (
                <div style={{ marginBottom: "14px" }}>
                  {attrs.negotiable_price && <div style={{ fontSize: "13px", color: "#00a650", fontWeight: 600 }}>Precio negociable</div>}
                  {attrs.financing        && <div style={{ fontSize: "13px", color: "#00a650" }}>Financiamiento disponible</div>}
                </div>
              )}

              {/* Location */}
              <div style={{ fontSize: "13px", color: "#999", marginBottom: "18px", display: "flex", alignItems: "center", gap: "5px" }}>
                <PinIcon size={12} /> {listing.neighborhood ?? "San Juan"}
              </div>

              {/* Guardar favorito */}
              <FavoriteButton listingId={listing.id} variant="detail" />
            </div>

            {/* Seller card */}
            <div style={{ background: "#fff", borderRadius: "8px", padding: "18px 20px", boxShadow: "0 1px 2px rgba(0,0,0,.08)" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "0.6px", margin: "0 0 12px" }}>
                Vendedor
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <div style={{
                  width: "42px", height: "42px", borderRadius: "50%", flexShrink: 0,
                  background: "#e0e7ff", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "18px", overflow: "hidden",
                }}>
                  {profile?.avatar_url
                    ? <img src={profile.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : "👤"}
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#1e293b" }}>
                    {sellerName}
                  </div>
                  <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
                    Vendedor particular
                    {profile?.created_at && ` · Miembro desde ${memberSince(profile.created_at)}`}
                  </div>
                </div>
              </div>

              {/* CTAs side by side */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                <ContactButton
                  listingId={listing.id}
                  listingTitle={listing.title}
                  sellerId={userId}
                  sellerName={sellerName}
                />
                {whatsappUrl ? (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flex: 1, padding: "11px 8px",
                      background: "#f0fdf4", color: "#15803d",
                      border: "1px solid #bbf7d0", borderRadius: "8px",
                      fontSize: "13px", fontWeight: 600, textDecoration: "none",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                      boxSizing: "border-box",
                    }}
                  >
                    <WhatsAppIcon />
                    WhatsApp
                  </a>
                ) : (
                  <button style={{
                    flex: 1, padding: "11px 8px",
                    background: "#f1f5f9", color: "#94a3b8",
                    border: "1px solid #e2e8f0", borderRadius: "8px",
                    fontSize: "13px", fontWeight: 600, cursor: "default",
                    fontFamily: "inherit",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                  }}>
                    <WhatsAppIcon />
                    WhatsApp
                  </button>
                )}
              </div>

              <Link
                href={`/seller/${userId}`}
                style={{
                  display: "block", width: "100%", padding: "10px",
                  background: "#f8fafc", color: "#2563eb",
                  border: "1px solid #e2e8f0", borderRadius: "8px",
                  fontSize: "13px", fontWeight: 700, textAlign: "center",
                  textDecoration: "none", boxSizing: "border-box",
                }}
              >
                Ver más avisos del vendedor
              </Link>
            </div>

            {/* Destacar card */}
            <div style={{ background: "#fff", borderRadius: "8px", padding: "18px 20px", boxShadow: "0 1px 2px rgba(0,0,0,.08)" }}>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#1e293b", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ color: "#f59e0b" }}>✦</span> Destacá tu aviso
              </div>
              <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 14px", lineHeight: 1.5 }}>
                Aparecé primero y recibí hasta <strong>5×</strong> más consultas
              </p>
              <Link
                href="/planes"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  width: "100%", padding: "12px",
                  background: "#f59e0b", color: "#fff",
                  borderRadius: "8px", fontSize: "14px", fontWeight: 700,
                  textDecoration: "none", boxSizing: "border-box",
                }}
              >
                🏷️ Ver planes
              </Link>
            </div>
          </div>

        </div>

        {/* También te puede interesar */}
        {related.length > 0 && (
          <div style={{ marginTop: "28px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#333", margin: "0 0 14px" }}>
              También te puede interesar{relatedLabel ? ` · ${relatedLabel}` : ""}
            </h2>
            <div style={{
              display: "flex", gap: "14px",
              overflowX: "auto", paddingBottom: "8px",
              scrollbarWidth: "none",
            }}>
              {related.map((r: any) => {
                const rImgs = ((r.listing_images as any[]) ?? []).sort((a: any, b: any) => a.position - b.position);
                const rAttrs = (r.attributes as Record<string, any>) ?? {};
                const rCurrency = r.currency === "USD" ? "U$D" : "$";
                const thumb = rImgs[0]?.url;
                // Show vehicle-specific OR generic meta
                const metaParts = rAttrs.year
                  ? [rAttrs.year, rAttrs.km ? `${Number(rAttrs.km).toLocaleString("es-AR")} km` : null, rAttrs.transmission].filter(Boolean)
                  : [rAttrs.storage, rAttrs.ram, rAttrs.condition].filter(Boolean);
                return (
                  <Link
                    key={r.id}
                    href={`/listings/${r.id}`}
                    style={{ textDecoration: "none", flexShrink: 0, width: "220px" }}
                  >
                    <div style={{
                      background: "#fff", borderRadius: "10px",
                      overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,.1)",
                      height: "100%",
                    }}>
                      <div style={{ height: "155px", background: "#f0f0f0", overflow: "hidden", position: "relative" }}>
                        {thumb
                          ? <img src={thumb} alt={r.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px" }}>📦</div>
                        }
                        <FavoriteButton listingId={r.id} variant="card" />
                      </div>
                      <div style={{ padding: "12px 14px 14px" }}>
                        {(rAttrs.brand || rAttrs.model) && (
                          <div style={{ fontSize: "12px", color: "#3483fa", fontWeight: 600, marginBottom: "2px", textTransform: "capitalize" }}>
                            {[rAttrs.brand, rAttrs.model].filter(Boolean).join(" · ")}
                          </div>
                        )}
                        {metaParts.length > 0 && (
                          <div style={{ fontSize: "11px", color: "#888", marginBottom: "10px", textTransform: "capitalize" }}>
                            {metaParts.join(" · ")}
                          </div>
                        )}
                        <div style={{ fontSize: "11px", color: "#666", marginBottom: "2px" }}>Precio</div>
                        {r.price ? (
                          <div style={{ fontSize: "18px", fontWeight: 700, color: "#1a1a1a", letterSpacing: "-0.5px" }}>
                            {rCurrency} {Number(r.price).toLocaleString("es-AR")}
                          </div>
                        ) : (
                          <div style={{ fontSize: "13px", color: "#999" }}>Precio a consultar</div>
                        )}
                        <div style={{ fontSize: "11px", color: "#999", marginTop: "10px", display: "flex", alignItems: "center", gap: "3px" }}>
                          <PinIcon size={10} /> {r.neighborhood ?? "San Juan"}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
