import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { GallerySection } from "./GallerySection";
import { DetailTabs } from "./DetailTabs";
import { getCategoryConfig } from "@/lib/category-config";
import { FavoriteButton } from "@/components/listings/FavoriteButton";
import { RelatedCarousel } from "@/components/listings/RelatedCarousel";
import { ShareButton } from "@/components/listings/ShareButton";
import PinIcon from "@/components/ui/PinIcon";
import type { Metadata } from "next";
import { ContactButton } from "@/components/listings/ContactButton";
import { AvatarWithFallback } from "@/components/ui/AvatarWithFallback";
import { ViewTracker } from "@/components/listings/ViewTracker";
import { StarRating } from "@/components/ui/StarRating";

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
  5: "Hogar", 6: "Deportes", 7: "Herramientas", 8: "Música",
  9: "Mascotas", 10: "Otros",
  21: "Celulares", 22: "Electrodomésticos", 23: "Bebés y Niños", 24: "Belleza y Salud",
  25: "Juguetes", 26: "Servicios",
};

const CATEGORY_SLUGS: Record<number, string> = {
  1: "electronics", 2: "vehicles", 3: "real-estate", 4: "clothing",
  5: "home-garden", 6: "sports", 7: "tools", 8: "books",
  9: "pets", 10: "other",
  21: "phones", 22: "appliances", 23: "babies", 24: "beauty-health",
  25: "toys", 26: "services",
};

const VEHICLE_TYPE_LABELS: Record<string, string> = {
  auto: "Autos", camioneta: "Pickups / SUV / Utilitarios", moto: "Motos",
  cuatriciclo: "Cuatriciclos", utv: "Areneros/UTV",
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
    .select(`id, title, description, price, currency, condition, neighborhood, created_at, category_id, attributes, user_id, view_count, featured_level, listing_images(url, position)`)
    .eq("id", id)
    .eq("status", "active")
    .single();
  if (error) { console.error("getListing error:", error.message); return null; }
  if (!data) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, created_at, is_store, store_name, store_slug, store_type, store_logo_url, store_verified, store_whatsapp, phone")
    .eq("id", data.user_id)
    .single();

  const { data: reviewStats } = await supabase
    .from("reviews")
    .select("rating")
    .eq("seller_id", data.user_id);

  const reviewCount = reviewStats?.length ?? 0;
  const avgRating = reviewCount > 0
    ? Math.round((reviewStats!.reduce((s, r) => s + r.rating, 0) / reviewCount) * 10) / 10
    : 0;

  return { ...data, profile: profile ?? null, reviewCount, avgRating };
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) return { title: "Aviso no encontrado" };

  const images = ((listing.listing_images as any[]) ?? [])
    .sort((a, b) => a.position - b.position);
  const firstImage = images[0]?.url ?? null;
  const currency = (listing as any).currency === "USD" ? "U$D" : "$";
  const priceStr = listing.price
    ? `${currency} ${listing.price.toLocaleString("es-AR")}`
    : "Consultar precio";
  const desc = listing.description
    ? listing.description.slice(0, 155).replace(/\n/g, " ")
    : `${listing.title} — ${priceStr}. ${listing.neighborhood ?? "San Juan"}.`;

  return {
    title: `${listing.title} — ${priceStr}`,
    description: desc,
    openGraph: {
      title: `${listing.title} — ${priceStr}`,
      description: desc,
      url: `https://comerxia.com.ar/listings/${id}`,
      ...(firstImage ? { images: [{ url: firstImage, width: 800, height: 600, alt: listing.title }] } : {}),
      type: "website",
    },
    twitter: {
      card: firstImage ? "summary_large_image" : "summary",
      title: `${listing.title} — ${priceStr}`,
      description: desc,
      ...(firstImage ? { images: [firstImage] } : {}),
    },
    alternates: { canonical: `https://comerxia.com.ar/listings/${id}` },
  };
}

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) notFound();

  const supabase = await createClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  const isOwner = currentUser?.id === (listing as any).user_id;

  const attrs0 = (listing.attributes as Record<string, any>) ?? {};
  const { items: related, label: relatedLabel } = await getRelated(
    id, listing.category_id, attrs0.brand, attrs0.model
  );

  const images: { url: string; position: number }[] = (
    (listing.listing_images as any[]) ?? []
  ).sort((a, b) => a.position - b.position);

  const attrs = (listing.attributes as Record<string, any>) ?? {};
  const currency = (listing as any).currency ?? "ARS";
  const profile = (listing as any).profile as { full_name: string | null; avatar_url: string | null; created_at: string | null; is_store?: boolean; store_name?: string | null; store_slug?: string | null; store_type?: string | null; store_logo_url?: string | null; store_verified?: boolean } | null;
  const userId = (listing as any).user_id as string;
  const reviewCount = (listing as any).reviewCount as number;
  const avgRating = (listing as any).avgRating as number;
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

  const canShowPhone = (profile as any)?.show_phone !== false; // default true until migration runs
  const rawPhone = (attrs.whatsapp_phone as string | undefined)
    || (profile as any)?.store_whatsapp
    || (profile as any)?.phone
    || null;
  const whatsappPhone = canShowPhone ? rawPhone : null;
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    description: listing.description ?? listing.title,
    image: images.map((i) => i.url),
    url: `https://comerxia.com.ar/listings/${listing.id}`,
    ...(listing.price ? {
      offers: {
        "@type": "Offer",
        price: listing.price,
        priceCurrency: (listing as any).currency ?? "ARS",
        availability: "https://schema.org/InStock",
        itemCondition: (listing as any).condition === "new"
          ? "https://schema.org/NewCondition"
          : "https://schema.org/UsedCondition",
        seller: {
          "@type": profile?.is_store ? "Organization" : "Person",
          name: profile?.store_name ?? profile?.full_name ?? "Vendedor",
        },
      },
    } : {}),
  };

  return (
    <div className="listing-detail" style={{ background: "#f5f5f5", minHeight: "100vh", paddingBottom: "60px" }}>
      {/* Mobile sticky WhatsApp */}
      <div className="mobile-wa-bar" style={{
        display: "none", position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 300,
        padding: "8px 16px", paddingBottom: "calc(8px + env(safe-area-inset-bottom))",
        background: "rgba(255,255,255,0.97)", backdropFilter: "blur(10px)",
        borderTop: "1px solid #e2e8f0", boxShadow: "0 -4px 16px rgba(0,0,0,.1)",
        flexDirection: "column", gap: "8px",
      }}>
        {/* Precio */}
        <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
          <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Precio</span>
          <span style={{ fontSize: "16px", fontWeight: 700, color: listing.price ? "#1a1a1a" : "#64748b", marginLeft: "6px" }}>
            {listing.price ? `${currencySymbol} ${Number(listing.price).toLocaleString("es-AR")}` : "A consultar"}
          </span>
        </div>
        {/* Botones */}
        <div style={{ display: "flex", gap: "8px" }}>
          {whatsappUrl && (
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              padding: "10px 16px", background: "#25d366", color: "#fff",
              borderRadius: "8px", fontSize: "14px", fontWeight: 700,
              textDecoration: "none", boxShadow: "0 4px 12px rgba(37,211,102,.4)",
            }}>
              <WhatsAppIcon /> WhatsApp
            </a>
          )}
          {listing.price ? (
            <ContactButton
              listingId={listing.id}
              listingTitle={listing.title}
              sellerId={userId}
              sellerName={sellerName}
            />
          ) : (
            <ContactButton
              listingId={listing.id}
              listingTitle={listing.title}
              sellerId={userId}
              sellerName={sellerName}
              triggerStyle="link"
              triggerLabel="Consultar precio"
              defaultMessage={`Hola ${sellerName}, vi tu publicación "${listing.title}" y me interesa. ¿Me podés indicar el precio?`}
            />
          )}
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ViewTracker listingId={listing.id} />
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 8px", boxSizing: "border-box", width: "100%" }}>

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

              {isRealEstate && attrs.sub_category && (
                <>
                  {sep}
                  <Link href={`/category/${catSlug}?type=${encodeURIComponent(attrs.sub_category)}`} style={linkStyle}>
                    {RE_SUBCAT[attrs.sub_category] ?? String(attrs.sub_category)}
                  </Link>
                </>
              )}

              {!isVehicle && !isRealEstate && catConfig && attrs.sub_category && (() => {
                const TYPE_PARAM: Record<number, string> = {
                  4: "clothing_type", 5: "hg_type", 6: "sport_type", 7: "tool_type",
                  22: "appliance_type", 21: "phone_type", 1: "tech_type",
                  23: "baby_type", 24: "beauty_type", 25: "toy_type",
                  8: "book_type", 9: "pet_type", 26: "serv_type",
                };
                const typeParam = TYPE_PARAM[listing.category_id] ?? "type";
                const label = catConfig.fields.find(f => f.key === "sub_category")?.options?.find(o => o.value === attrs.sub_category)?.label ?? String(attrs.sub_category);
                return (
                  <>
                    {sep}
                    <Link href={`/category/${catSlug}?${typeParam}=${encodeURIComponent(attrs.sub_category)}`} style={linkStyle}>
                      {label}
                    </Link>
                  </>
                );
              })()}

              {!isVehicle && !isRealEstate && catConfig && attrs.brand && (() => {
                const BRAND_PARAM: Record<number, string> = {
                  4: "clothing_brand", 5: "hg_brand", 6: "sport_brand", 7: "tool_brand",
                  22: "appliance_brand", 21: "phone_brand", 1: "tech_brand",
                  23: "baby_brand", 24: "beauty_brand", 25: "toy_brand",
                  26: "serv_brand",
                };
                const brandParam = BRAND_PARAM[listing.category_id] ?? "brand";
                const label = catConfig.fields.find(f => f.key === "brand")?.options?.find(o => o.value === attrs.brand)?.label ?? String(attrs.brand);
                return (
                  <>
                    {sep}
                    <Link href={`/category/${catSlug}?${brandParam}=${encodeURIComponent(attrs.brand)}`} style={{ ...linkStyle, textTransform: "capitalize" }}>
                      {label}
                    </Link>
                  </>
                );
              })()}

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
        <div className="detail-grid">

          {/* ════ GALLERY — direct child for mobile reordering ════ */}
          <div className="detail-gallery" style={{ background: "#fff", borderRadius: "10px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,.07)" }}>
            <GallerySection images={images} title={listing.title} />
          </div>

          {/* ════ LEFT COLUMN — description + specs + map ════ */}
          <div className="detail-left-col">

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
          <div className="detail-sticky detail-right-col" style={{ position: "sticky", top: "72px", display: "flex", flexDirection: "column", gap: "12px" }}>

            {/* ── Main info card ── */}
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,.08)" }}>

              {/* Header: time + views + title + specs */}
              <div style={{ padding: "18px 20px 0" }}>
                <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span>Publicado {timeAgo(listing.created_at)}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                    {(listing.view_count ?? 0).toLocaleString("es-AR")} visitas
                  </span>
                </div>
                {(() => {
                  const fl = (listing as any).featured_level as string | null;
                  if (!fl) return null;
                  const badge = fl === "gold"
                    ? { label: "👑 Premium", bg: "linear-gradient(135deg,#f59e0b,#fbbf24)", color: "#fff", shadow: "0 2px 8px rgba(245,158,11,.4)" }
                    : fl === "silver"
                    ? { label: "⭐ Destacado", bg: "linear-gradient(135deg,#64748b,#94a3b8)", color: "#fff", shadow: "0 2px 8px rgba(100,116,139,.3)" }
                    : { label: "✦ Destacado", bg: "linear-gradient(135deg,#cd7c2f,#e09b58)", color: "#fff", shadow: "0 2px 8px rgba(205,124,47,.35)" };
                  return (
                    <div style={{ marginBottom: "8px" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: "4px",
                        background: badge.bg, color: badge.color,
                        fontSize: "11px", fontWeight: 800, letterSpacing: "0.3px",
                        padding: "4px 10px", borderRadius: "20px",
                        boxShadow: badge.shadow,
                      }}>
                        {badge.label}
                      </span>
                    </div>
                  );
                })()}
                <h1 style={{ fontSize: "18px", fontWeight: 700, color: "#1e293b", lineHeight: 1.3, margin: "0 0 12px" }}>
                  {listing.title}
                </h1>
                {quickSpecs.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "0" }}>
                    {quickSpecs.map((spec) => (
                      <span key={spec.label} style={{ background: "#f1f5f9", borderRadius: "4px", padding: "4px 8px", fontSize: "12px", color: "#475569" }}>
                        {spec.icon} <strong style={{ textTransform: "capitalize" }}>{spec.value}</strong>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Price block — fondo gris suave, elemento dominante */}
              <div style={{ background: "#f8fafc", borderTop: "1px solid #f1f5f9", borderBottom: "1px solid #f1f5f9", padding: "16px 20px", marginTop: "14px" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.7px", textTransform: "uppercase", marginBottom: "4px" }}>
                  Precio
                </div>
                {listing.price ? (
                  <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                    <span style={{ fontSize: "20px", fontWeight: 500, color: "#475569" }}>{currencySymbol}</span>
                    <span style={{ fontSize: "34px", fontWeight: 700, color: "#1a1a1a", letterSpacing: "-1.5px", lineHeight: 1 }}>
                      {Number(listing.price).toLocaleString("es-AR")}
                    </span>
                  </div>
                ) : (
                  <ContactButton
                    listingId={listing.id}
                    listingTitle={listing.title}
                    sellerId={userId}
                    sellerName={sellerName}
                    triggerStyle="link"
                    triggerLabel="Consultar precio"
                    defaultMessage={`Hola ${sellerName}, vi tu publicación "${listing.title}" y me interesa. ¿Me podés indicar el precio?`}
                  />
                )}
                {/* Negotiable / financing pills */}
                {(attrs.negotiable_price || attrs.financing) && (
                  <div style={{ display: "flex", gap: "6px", marginTop: "10px", flexWrap: "wrap" }}>
                    {attrs.negotiable_price && (
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "#15803d", background: "#dcfce7", border: "1px solid #bbf7d0", borderRadius: "20px", padding: "3px 10px" }}>
                        Precio negociable
                      </span>
                    )}
                    {attrs.financing && (
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "#1d4ed8", background: "#dbeafe", border: "1px solid #bfdbfe", borderRadius: "20px", padding: "3px 10px" }}>
                        Financiamiento
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Location + actions */}
              <div style={{ padding: "14px 20px" }}>
                <div style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "14px", display: "flex", alignItems: "center", gap: "5px" }}>
                  <PinIcon size={12} /> {listing.neighborhood ?? "San Juan"}
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <FavoriteButton listingId={listing.id} variant="detail" />
                  <ShareButton listingId={listing.id} title={listing.title} price={listing.price} currency={listing.currency} />
                </div>
              </div>
            </div>

            {/* ── Seller + CTAs card ── */}
            <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,.08)" }}>
              <div style={{ padding: "16px 20px" }}>

                {/* Seller info — compact */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                  <AvatarWithFallback
                    src={profile?.is_store ? profile.store_logo_url : profile?.avatar_url}
                    name={profile?.is_store ? (profile.store_name ?? sellerName) : sellerName}
                    size={44}
                    rounded={profile?.is_store ? "lg" : "full"}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {profile?.is_store ? (profile.store_name ?? sellerName) : sellerName}
                      </span>
                      {profile?.is_store && profile.store_verified && (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="#2563eb" style={{ flexShrink: 0 }}>
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      )}
                    </div>
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                      {profile?.is_store
                        ? (profile.store_type === "inmobiliaria" ? "Inmobiliaria"
                          : profile.store_type === "automotora" ? "Automotora"
                          : profile.store_type === "electronica" ? "Tienda de tecnología"
                          : profile.store_type === "ropa" ? "Tienda de ropa"
                          : profile.store_type === "agencia" ? "Agencia"
                          : profile.store_type === "servicios" ? "Empresa de servicios"
                          : "Tienda")
                        : `Vendedor particular${profile?.created_at ? ` · desde ${memberSince(profile.created_at)}` : ""}`}
                    </div>
                    {reviewCount > 0 && <div style={{ marginTop: "2px" }}><StarRating rating={avgRating} count={reviewCount} size={11} /></div>}
                  </div>
                  <Link
                    href={profile?.is_store && profile.store_slug ? `/tienda/${profile.store_slug}` : `/seller/${userId}`}
                    style={{ fontSize: "12px", color: "#2563eb", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}
                  >
                    Ver {profile?.is_store ? "tienda" : "perfil"} →
                  </Link>
                </div>

                {/* CTAs — lado a lado */}
                <div style={{ display: "flex", gap: "8px" }}>
                  {whatsappUrl ? (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                        padding: "11px 10px",
                        background: "#25d366", color: "#fff",
                        borderRadius: "8px", fontSize: "13px", fontWeight: 700,
                        textDecoration: "none", boxSizing: "border-box",
                        boxShadow: "0 2px 8px rgba(37,211,102,.3)",
                      }}
                    >
                      <WhatsAppIcon /> WhatsApp
                    </a>
                  ) : (
                    <div style={{
                      flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                      padding: "11px 10px", background: "#f1f5f9", color: "#94a3b8",
                      borderRadius: "8px", fontSize: "13px", fontWeight: 700, boxSizing: "border-box",
                    }}>
                      <WhatsAppIcon /> WhatsApp
                    </div>
                  )}
                  <ContactButton
                    listingId={listing.id}
                    listingTitle={listing.title}
                    sellerId={userId}
                    sellerName={sellerName}
                  />
                </div>

                {/* Ver más productos del vendedor */}
                <Link
                  href={profile?.is_store && profile.store_slug ? `/tienda/${profile.store_slug}` : `/seller/${userId}`}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                    marginTop: "8px", padding: "9px", width: "100%", boxSizing: "border-box",
                    border: "1.5px solid #e2e8f0", borderRadius: "8px",
                    fontSize: "13px", fontWeight: 600, color: "#475569",
                    textDecoration: "none", background: "#f8fafc",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                  </svg>
                  Ver más publicaciones de {profile?.is_store ? (profile.store_name ?? sellerName) : sellerName}
                </Link>

              </div>

              {/* Destacar — amber footer, solo al dueño */}
              {isOwner && (
                <div style={{ background: "#fffbeb", borderTop: "1px solid #fde68a", padding: "14px 20px", display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#92400e", marginBottom: "1px" }}>
                      ✦ Destacá tu aviso
                    </div>
                    <div style={{ fontSize: "11px", color: "#a16207" }}>Hasta 5× más consultas</div>
                  </div>
                  <Link
                    href={`/upgrade?listing_id=${listing.id}`}
                    style={{
                      padding: "8px 16px", background: "#f59e0b", color: "#fff",
                      borderRadius: "8px", fontSize: "13px", fontWeight: 700,
                      textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0,
                    }}
                  >
                    Ver planes
                  </Link>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* También te puede interesar */}
        {related.length >= 3 && (
          <RelatedCarousel title={`También te puede interesar${relatedLabel ? ` · ${relatedLabel}` : ""}`}>
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
                    className="related-card"
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
                          <PinIcon size={10} /> {r.neighborhood ?? ""}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
          </RelatedCarousel>
        )}

      </div>
    </div>
  );
}
