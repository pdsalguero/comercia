import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { GallerySection } from "./GallerySection";

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
  1: "Electrónica", 2: "Vehículos", 3: "Inmuebles", 4: "Ropa",
  5: "Hogar", 6: "Deportes", 7: "Herramientas", 8: "Libros",
  9: "Mascotas", 10: "Otros",
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

async function getRelated(currentId: string, categoryId: number, brand?: string, model?: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select(`id, title, price, currency, attributes, listing_images(url, position)`)
    .eq("status", "active")
    .eq("category_id", categoryId)
    .neq("id", currentId)
    .limit(30);
  if (!data || data.length === 0) return { items: [], label: "" };

  const normalize = (s: string) => String(s ?? "").toLowerCase();

  if (brand && model) {
    const byModel = data.filter((l: any) => {
      const a = (l.attributes as Record<string, any>) ?? {};
      return normalize(a.brand) === normalize(brand) && normalize(a.model) === normalize(model);
    });
    if (byModel.length > 0) return { items: byModel.slice(0, 10), label: `${brand} ${model}` };
  }

  if (brand) {
    const byBrand = data.filter((l: any) => {
      const a = (l.attributes as Record<string, any>) ?? {};
      return normalize(a.brand) === normalize(brand);
    });
    if (byBrand.length > 0) return { items: byBrand.slice(0, 10), label: brand };
  }

  return { items: data.slice(0, 10), label: "" };
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
    .select("full_name, avatar_url")
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
  const profile = (listing as any).profile as { full_name: string | null; avatar_url: string | null } | null;
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
  ].filter(([v]) => v) as [boolean, string][];

  const quickSpecs = listing.category_id === 3
    ? [
        attrs.sub_category  && { icon: "🏠", label: "Tipo",        value: RE_SUBCAT[attrs.sub_category] ?? attrs.sub_category },
        attrs.re_operation  && { icon: "🔑", label: "Operación",   value: RE_OPERATION[attrs.re_operation] ?? attrs.re_operation },
        attrs.m2_covered    && { icon: "📐", label: "Sup. cubierta", value: `${attrs.m2_covered} m²` },
        attrs.bedrooms      && { icon: "🛏️", label: "Dormitorios", value: String(attrs.bedrooms) },
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
  ].filter(([v]) => v) as [boolean, string][];

  const mapUrl = listing.category_id === 3 && attrs.lat && attrs.lng
    ? (() => {
        const delta = 0.006;
        return `https://www.openstreetmap.org/export/embed.html?bbox=${attrs.lng - delta},${attrs.lat - delta},${attrs.lng + delta},${attrs.lat + delta}&layer=mapnik&marker=${attrs.lat},${attrs.lng}`;
      })()
    : null;

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh", paddingBottom: "60px" }}>
      <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "0 16px" }}>

        {/* Breadcrumb */}
        <nav style={{ fontSize: "12px", color: "#666", padding: "8px 0" }}>
          <Link href="/" style={{ color: "#3483fa", textDecoration: "none" }}>Inicio</Link>
          {" › "}
          <Link href="/" style={{ color: "#3483fa", textDecoration: "none" }}>
            {CATEGORY_NAMES[listing.category_id] ?? "Avisos"}
          </Link>
          {attrs.brand && (
            <>
              {" › "}
              <Link href={`/?brand=${encodeURIComponent(attrs.brand)}`} style={{ color: "#3483fa", textDecoration: "none", textTransform: "capitalize" }}>
                {String(attrs.brand).replace(/_/g, " ")}
              </Link>
            </>
          )}
          {attrs.model && (
            <>
              {" › "}
              <Link href={`/?brand=${encodeURIComponent(attrs.brand)}&model=${encodeURIComponent(attrs.model)}`} style={{ color: "#3483fa", textDecoration: "none", textTransform: "capitalize" }}>
                {String(attrs.model).replace(/_/g, " ")}
              </Link>
            </>
          )}
          {!attrs.brand && !attrs.model && (
            <>
              {" › "}
              <span style={{ color: "#333" }}>
                {listing.title.length > 55 ? listing.title.slice(0, 55) + "…" : listing.title}
              </span>
            </>
          )}
        </nav>

        {/* ── 2-column layout: left scrolls, right sticks ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "16px", alignItems: "start" }}>

          {/* ════ LEFT COLUMN ════ */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

            {/* Gallery card */}
            <div style={{ background: "#fff", borderRadius: "8px", padding: "0", overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,.08)" }}>
              <GallerySection images={images} title={listing.title} />
            </div>

            {/* Description card */}
            {listing.description && (
              <div style={{ background: "#fff", borderRadius: "8px", padding: "16px 20px", boxShadow: "0 1px 2px rgba(0,0,0,.08)" }}>
                <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#333", margin: "0 0 10px" }}>
                  Descripción
                </h2>
                <p style={{ fontSize: "13px", color: "#555", lineHeight: 1.7, margin: 0, whiteSpace: "pre-line" }}>
                  {listing.description}
                </p>
              </div>
            )}

            {/* Real estate specs card */}
            {listing.category_id === 3 && (
              <div style={{ background: "#fff", borderRadius: "8px", overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,.08)" }}>

                {/* Detail grid */}
                {realEstateSpecs.length > 0 && (
                  <div style={{ padding: "16px 20px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0" }}>
                      {realEstateSpecs.map(([label, value], i) => (
                        <div key={label} style={{
                          padding: "12px 14px",
                          borderBottom: "1px solid #f8fafc",
                          borderRight: (i + 1) % 3 !== 0 ? "1px solid #f8fafc" : "none",
                        }}>
                          <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                            {label}
                          </div>
                          <div style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", textTransform: "capitalize" }}>
                            {String(value)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Boolean features */}
                {realEstateBoolExtras.length > 0 && (
                  <div style={{ padding: "0 20px 16px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {realEstateBoolExtras.map(([, label]) => (
                      <span key={label} style={{
                        background: "#f0fdf4", color: "#16a34a",
                        border: "1px solid #bbf7d0", borderRadius: "20px",
                        padding: "5px 13px", fontSize: "12px", fontWeight: 600,
                      }}>
                        ✓ {label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Map card */}
            {mapUrl && (
              <div style={{ background: "#fff", borderRadius: "8px", overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,.08)" }}>
                <div style={{ padding: "14px 20px 10px", fontWeight: 600, fontSize: "15px", color: "#333" }}>
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
                  <div style={{ padding: "10px 20px", fontSize: "12px", color: "#64748b", borderTop: "1px solid #f1f5f9" }}>
                    📍 {attrs.address_str}
                  </div>
                )}
              </div>
            )}

            {/* Vehicle specs card */}
            {listing.category_id === 2 && (vehicleSpecs.length > 0 || boolExtras.length > 0) && (
              <div style={{ background: "#fff", borderRadius: "8px", overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,.08)" }}>

                {vehicleSpecs.length > 0 && (
                  <div style={{ padding: "16px 20px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0" }}>
                      {vehicleSpecs.map(([label, value], i) => (
                        <div key={label} style={{
                          padding: "12px 14px",
                          borderBottom: "1px solid #f8fafc",
                          borderRight: (i + 1) % 3 !== 0 ? "1px solid #f8fafc" : "none",
                        }}>
                          <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                            {label}
                          </div>
                          <div style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", textTransform: "capitalize" }}>
                            {String(value).replace(/_/g, " ")}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {boolExtras.length > 0 && (
                  <div style={{ padding: "0 20px 16px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {boolExtras.map(([, label]) => (
                      <span key={label} style={{
                        background: "#f0fdf4", color: "#16a34a",
                        border: "1px solid #bbf7d0", borderRadius: "20px",
                        padding: "5px 13px", fontSize: "12px", fontWeight: 600,
                      }}>
                        ✓ {label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ════ RIGHT COLUMN — sticky ════ */}
          <div style={{ position: "sticky", top: "72px", display: "flex", flexDirection: "column", gap: "12px" }}>

            {/* Purchase card */}
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
              <div style={{ fontSize: "13px", color: "#999", marginBottom: "18px" }}>
                📍 {listing.neighborhood ?? "San Juan"}
              </div>

              {/* Guardar favorito */}
              <button style={{
                width: "100%", padding: "10px", background: "#fff", color: "#64748b",
                border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "13px",
                fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              }}>
                🤍 Guardar favorito
              </button>
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
                    {profile?.full_name ?? "Usuario"}
                  </div>
                  <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
                    Vendedor particular
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                <button style={{
                  flex: 1, padding: "11px 8px", background: "#f1f5f9", color: "#334155",
                  border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "13px",
                  fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  Contactar
                </button>
                <button style={{
                  flex: 1, padding: "11px 8px", background: "#f0fdf4", color: "#15803d",
                  border: "1px solid #bbf7d0", borderRadius: "8px", fontSize: "13px",
                  fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L0 24l6.335-1.512A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.8 9.8 0 01-5.003-1.367l-.36-.214-3.732.891.935-3.618-.235-.373A9.787 9.787 0 012.182 12C2.182 6.579 6.579 2.182 12 2.182c5.42 0 9.818 4.397 9.818 9.818 0 5.42-4.398 9.818-9.818 9.818z"/></svg>
                  WhatsApp
                </button>
              </div>

              <Link
                href={`/?seller=${userId}`}
                style={{
                  display: "block", width: "100%", padding: "9px",
                  background: "#f8fafc", color: "#3483fa",
                  border: "1px solid #e2e8f0", borderRadius: "6px",
                  fontSize: "13px", fontWeight: 600, textAlign: "center",
                  textDecoration: "none", boxSizing: "border-box",
                }}
              >
                Ver más avisos del vendedor
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
                const metaParts = [
                  rAttrs.year,
                  rAttrs.km ? `${Number(rAttrs.km).toLocaleString("es-AR")} km` : null,
                  rAttrs.transmission,
                ].filter(Boolean);
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
                      {/* Image */}
                      <div style={{ height: "155px", background: "#f0f0f0", overflow: "hidden", position: "relative" }}>
                        {thumb
                          ? <img src={thumb} alt={r.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px" }}>📦</div>
                        }
                        <div style={{
                          position: "absolute", top: "8px", right: "8px",
                          width: "28px", height: "28px", borderRadius: "50%",
                          background: "rgba(255,255,255,.85)", display: "flex",
                          alignItems: "center", justifyContent: "center", fontSize: "14px",
                        }}>🤍</div>
                      </div>

                      {/* Body */}
                      <div style={{ padding: "12px 14px 14px" }}>
                        {/* Brand · Model */}
                        {(rAttrs.brand || rAttrs.model) && (
                          <div style={{ fontSize: "12px", color: "#3483fa", fontWeight: 600, marginBottom: "2px", textTransform: "capitalize" }}>
                            {[rAttrs.brand, rAttrs.model].filter(Boolean).join(" · ")}
                          </div>
                        )}

                        {/* Meta: year · km · transmission */}
                        {metaParts.length > 0 && (
                          <div style={{ fontSize: "11px", color: "#888", marginBottom: "10px", textTransform: "capitalize" }}>
                            {metaParts.join(" · ")}
                          </div>
                        )}

                        {/* Price label */}
                        <div style={{ fontSize: "11px", color: "#666", marginBottom: "2px" }}>Precio</div>

                        {/* Price */}
                        {r.price ? (
                          <div style={{ fontSize: "18px", fontWeight: 700, color: "#1a1a1a", letterSpacing: "-0.5px" }}>
                            {rCurrency} {Number(r.price).toLocaleString("es-AR")}
                          </div>
                        ) : (
                          <div style={{ fontSize: "13px", color: "#999" }}>Precio a consultar</div>
                        )}

                        {/* Location */}
                        <div style={{ fontSize: "11px", color: "#999", marginTop: "10px" }}>
                          📍 {r.neighborhood ?? "San Juan"}
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
