import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const CAT_LABEL: Record<string, string> = {
  "real-estate": "Inmuebles",
  "vehicles":    "Vehículos",
  "phones":      "Celulares",
  "electronics": "Tecnología",
  "appliances":  "Electrodomésticos",
  "clothing":    "Ropa y Calzado",
  "sports":      "Deportes",
  "tools":       "Herramientas",
  "home-garden": "Hogar y Muebles",
  "books":       "Libros y Música",
  "pets":        "Mascotas",
  "services":    "Servicios",
  "babies":      "Bebés y Niños",
  "beauty-health": "Belleza y Salud",
  "toys":        "Juguetes",
  "other":       "Otros",
};

const CAT_COLOR: Record<string, string> = {
  "real-estate":   "#3b82f6",
  "vehicles":      "#f97316",
  "phones":        "#8b5cf6",
  "electronics":   "#6366f1",
  "appliances":    "#0ea5e9",
  "clothing":      "#ec4899",
  "sports":        "#22c55e",
  "tools":         "#f59e0b",
  "home-garden":   "#14b8a6",
  "books":         "#a855f7",
  "pets":          "#84cc16",
  "services":      "#06b6d4",
  "babies":        "#fb923c",
  "beauty-health": "#d946ef",
  "toys":          "#facc15",
  "other":         "#94a3b8",
};

const CAT_VERB: Record<string, string> = {
  "real-estate": "Ver inmuebles",
  "vehicles":    "Ver vehículos",
  "phones":      "Ver celulares",
  "electronics": "Ver tecnología",
  "appliances":  "Ver electrodomésticos",
  "clothing":    "Ver ropa",
  "sports":      "Ver deportes",
  "tools":       "Ver herramientas",
  "home-garden": "Ver hogar",
  "books":       "Ver libros",
  "pets":        "Ver mascotas",
  "services":    "Ver servicios",
  "babies":      "Ver bebés",
  "beauty-health": "Ver belleza",
  "toys":        "Ver juguetes",
  "other":       "Ver artículos",
};

const CAT_UNIT: Record<string, string> = {
  "real-estate": "propiedades",
  "vehicles":    "vehículos",
  "phones":      "celulares",
  "electronics": "productos",
  "appliances":  "electrodomésticos",
  "clothing":    "prendas",
  "sports":      "artículos",
  "tools":       "herramientas",
  "home-garden": "artículos",
  "books":       "libros",
  "pets":        "publicaciones",
  "services":    "servicios",
  "babies":      "artículos",
  "beauty-health": "productos",
  "toys":        "juguetes",
  "other":       "artículos",
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

export default async function TiendasPage() {
  const supabase = await createClient();

  const { data: stores } = await supabase
    .from("profiles")
    .select("id, store_name, store_slug, store_logo_url, store_banner_url, store_type, store_verified, store_description")
    .eq("is_store", true)
    .order("store_name", { ascending: true });

  if (!stores?.length) {
    return (
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 16px", textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🏪</div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>
          Todavía no hay tiendas virtuales
        </h1>
        <p style={{ color: "#64748b", marginBottom: "24px" }}>Sé el primero en crear la tuya.</p>
        <Link href="/dashboard/store">
          <div style={{
            display: "inline-block",
            background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "#fff",
            borderRadius: "8px", padding: "10px 24px",
            fontWeight: 700, fontSize: "14px", cursor: "pointer",
          }}>
            Crear mi tienda gratis →
          </div>
        </Link>
      </div>
    );
  }

  const storeIds = stores.map((s) => s.id);

  // Static map from DB category id → slug (avoids extra query + RLS issues)
  const CAT_ID_SLUG: Record<number, string> = {
    1: "electronics", 2: "vehicles", 3: "real-estate", 4: "clothing",
    5: "home-garden", 6: "sports", 7: "tools", 8: "books",
    9: "pets", 10: "other",
    11: "phones", 12: "electronics", 13: "electronics", 14: "electronics",
    15: "electronics", 16: "electronics",
    17: "vehicles", 18: "vehicles", 19: "vehicles", 20: "vehicles",
    21: "phones", 22: "appliances", 23: "babies", 24: "beauty-health",
    25: "toys", 26: "services",
  };

  const { data: listings } = await supabase
    .from("listings")
    .select("user_id, category_id, listing_images(url, position)")
    .eq("status", "active")
    .in("user_id", storeIds);

  // Build store data with main category and a sample image
  const storeData = stores.map((store) => {
    const sl = listings?.filter((l) => l.user_id === store.id) ?? [];
    const catMap: Record<string, { name: string; slug: string; count: number }> = {};
    for (const l of sl) {
      const slug = l.category_id ? CAT_ID_SLUG[l.category_id] : null;
      const cat = slug ? { name: CAT_LABEL[slug] ?? slug, slug } : null;
      if (cat) {
        catMap[cat.slug] = catMap[cat.slug] ?? { ...cat, count: 0 };
        catMap[cat.slug].count++;
      }
    }
    const mainCat = Object.values(catMap).sort((a, b) => b.count - a.count)[0] ?? null;
    // Pick a sample image: banner > logo > first listing image
    const sampleImg = store.store_banner_url
      || (sl.find((l) => (l as any).listing_images?.length)?.listing_images as { url: string }[] | null)?.[0]?.url
      || null;
    return { ...store, listing_count: sl.length, main_cat: mainCat, sample_image: sampleImg };
  });

  // Group by main category slug
  const grouped: Record<string, typeof storeData> = {};
  const NO_CAT = "__sin_categoria__";
  for (const store of storeData) {
    const key = store.main_cat?.slug ?? NO_CAT;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(store);
  }

  const sortedGroups = Object.entries(grouped).sort(([a, aStores], [b, bStores]) => {
    if (a === NO_CAT) return 1;
    if (b === NO_CAT) return -1;
    return bStores.length - aStores.length;
  });

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px 16px 48px" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <span style={{ fontSize: "28px" }}>🏪</span>
          <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#0f172a", margin: 0 }}>
            Tiendas Virtuales
          </h1>
        </div>
        <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
          {stores.length} tiendas registradas en Comercia
        </p>
      </div>

      {/* Groups */}
      <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
        {sortedGroups.map(([catSlug, catStores]) => {
          const catLabel = catSlug === NO_CAT ? "Sin categoría" : (CAT_LABEL[catSlug] ?? catSlug);
          const color = catSlug !== NO_CAT ? (CAT_COLOR[catSlug] ?? "#6366f1") : "#6366f1";

          return (
            <section key={catSlug}>
              {/* Category header */}
              <div style={{
                display: "flex", alignItems: "center", gap: "10px",
                marginBottom: "16px", paddingBottom: "10px",
                borderBottom: `3px solid ${color}22`,
                flexWrap: "wrap",
              }}>
                <div style={{ width: "4px", height: "20px", borderRadius: "2px", background: color, flexShrink: 0 }} />
                <span style={{ fontSize: "17px", fontWeight: 800, color: "#0f172a" }}>
                  {catLabel}
                </span>
                <span style={{
                  background: `${color}18`, color: color,
                  borderRadius: "20px", padding: "2px 10px",
                  fontSize: "12px", fontWeight: 700,
                }}>
                  {catStores.length} {catStores.length === 1 ? "tienda" : "tiendas"}
                </span>
                {catSlug !== NO_CAT && (
                  <Link
                    href={`/category/${catSlug}`}
                    style={{ marginLeft: "auto", fontSize: "12px", color, textDecoration: "none", fontWeight: 600, whiteSpace: "nowrap" }}
                  >
                    Ver artículos →
                  </Link>
                )}
              </div>

              {/* Store cards */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "16px",
              }}>
                {catStores.map((store) => {
                  const btnColor = store.main_cat ? (CAT_COLOR[store.main_cat.slug] ?? "#6366f1") : "#6366f1";
                  const btnLabel = store.main_cat ? (CAT_VERB[store.main_cat.slug] ?? "Ver artículos") : "Ver tienda";
                  const unit = store.main_cat ? (CAT_UNIT[store.main_cat.slug] ?? "artículos") : "artículos";
                  const typeLabel = STORE_TYPE_LABELS[store.store_type ?? ""] ?? "Tienda virtual";

                  return (
                    <Link
                      key={store.id}
                      href={`/tienda/${store.store_slug}`}
                      style={{ textDecoration: "none", display: "block" }}
                    >
                      <div style={{
                        borderRadius: "14px", overflow: "hidden",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
                        border: "1px solid #e8e8e8",
                        background: "#fff",
                        cursor: "pointer",
                        transition: "transform 0.15s, box-shadow 0.15s",
                      }}
                        className="hover:-translate-y-1 hover:shadow-lg"
                      >
                        {/* Background image area */}
                        <div style={{
                          position: "relative",
                          height: "150px",
                          background: store.sample_image
                            ? `url(${store.sample_image}) center/cover no-repeat`
                            : `linear-gradient(135deg, ${btnColor}22, ${btnColor}44)`,
                          overflow: "hidden",
                        }}>
                          {/* Dark overlay for readability */}
                          <div style={{
                            position: "absolute", inset: 0,
                            background: store.sample_image
                              ? "linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.45) 100%)"
                              : "none",
                          }} />

                          {/* Verified badge */}
                          {store.store_verified && (
                            <div style={{
                              position: "absolute", top: "8px", right: "8px",
                              background: "#2563eb", color: "#fff",
                              borderRadius: "20px", padding: "2px 8px",
                              fontSize: "10px", fontWeight: 700,
                              display: "flex", alignItems: "center", gap: "3px",
                              zIndex: 2,
                            }}>
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                              Verificada
                            </div>
                          )}

                          {/* Logo + store name at bottom-left */}
                          <div style={{
                            position: "absolute", bottom: "10px", left: "12px", right: "12px",
                            display: "flex", alignItems: "center", gap: "10px", zIndex: 2,
                          }}>
                            {/* Logo circle */}
                            <div style={{
                              width: "44px", height: "44px", borderRadius: "50%",
                              border: "2.5px solid #fff",
                              background: "#fff",
                              overflow: "hidden", flexShrink: 0,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
                            }}>
                              {store.store_logo_url ? (
                                <img
                                  src={store.store_logo_url}
                                  alt={store.store_name ?? ""}
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                              ) : (
                                <span style={{ fontSize: "20px" }}>🏪</span>
                              )}
                            </div>
                            <div>
                              <div style={{
                                fontWeight: 800, fontSize: "13px",
                                color: store.sample_image ? "#fff" : "#0f172a",
                                textShadow: store.sample_image ? "0 1px 4px rgba(0,0,0,0.6)" : "none",
                                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                maxWidth: "140px",
                              }}>
                                {store.store_name}
                              </div>
                              {store.listing_count > 0 && (
                                <div style={{
                                  fontSize: "11px",
                                  color: store.sample_image ? "rgba(255,255,255,0.85)" : "#64748b",
                                  textShadow: store.sample_image ? "0 1px 3px rgba(0,0,0,0.5)" : "none",
                                }}>
                                  {store.listing_count} {unit}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* CTA button */}
                        <div style={{
                          padding: "10px 12px",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          borderBottom: "1px solid #f1f5f9",
                        }}>
                          <div style={{
                            background: `linear-gradient(135deg, ${btnColor}, ${btnColor}cc)`,
                            color: "#fff",
                            borderRadius: "20px",
                            padding: "5px 18px",
                            fontSize: "12px", fontWeight: 700,
                            letterSpacing: "0.2px",
                            boxShadow: `0 2px 8px ${btnColor}55`,
                          }}>
                            {btnLabel}
                          </div>
                        </div>

                        {/* Footer */}
                        <div style={{
                          padding: "8px 12px",
                          display: "flex", alignItems: "center", gap: "6px",
                        }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                          </svg>
                          <span style={{
                            fontSize: "11px", color: "#94a3b8",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>
                            {store.store_description
                              ? store.store_description.slice(0, 45)
                              : typeLabel}
                          </span>
                          <span style={{
                            marginLeft: "auto", fontSize: "11px",
                            color: "#cbd5e1", fontWeight: 600,
                          }}>
                            {">"}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* Upsell */}
      <div style={{
        marginTop: "48px",
        background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
        border: "1px solid #bfdbfe", borderRadius: "14px",
        padding: "20px 24px", display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: "16px", flexWrap: "wrap",
      }}>
        <div>
          <div style={{ fontSize: "16px", fontWeight: 800, color: "#1e3a8a", marginBottom: "4px" }}>
            🏪 ¿Tenés un negocio?
          </div>
          <div style={{ fontSize: "13px", color: "#1d4ed8" }}>
            Creá tu tienda virtual gratis y llegá a más compradores.
          </div>
        </div>
        <Link href="/dashboard/store">
          <div style={{
            background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "#fff",
            borderRadius: "8px", padding: "10px 20px",
            fontWeight: 800, fontSize: "13px", cursor: "pointer", whiteSpace: "nowrap",
          }}>
            Crear mi tienda →
          </div>
        </Link>
      </div>
    </div>
  );
}
