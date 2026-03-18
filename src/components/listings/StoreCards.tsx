import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const CAT_LABEL: Record<string, string> = {
  "real-estate": "propiedades",
  "vehicles":    "vehículos",
  "phones":      "celulares",
  "electronics": "tecnología",
  "appliances":  "electrodomésticos",
  "clothing":    "ropa",
  "sports":      "deportes",
  "tools":       "herramientas",
  "home-garden": "hogar",
  "books":       "libros",
  "pets":        "mascotas",
  "services":    "servicios",
};

export async function StoreCards() {
  const supabase = await createClient();

  const { data: stores } = await supabase
    .from("profiles")
    .select("id, store_name, store_slug, store_logo_url, store_banner_url, store_type, store_verified, store_description")
    .eq("is_store", true)
    .limit(8);

  if (!stores?.length) return null;

  const storeIds = stores.map((s) => s.id);

  const { data: listings } = await supabase
    .from("listings")
    .select("user_id, categories(name, slug)")
    .eq("status", "active")
    .in("user_id", storeIds);

  const storeData = stores.map((store) => {
    const sl = listings?.filter((l) => l.user_id === store.id) ?? [];
    const catMap: Record<string, { name: string; slug: string; count: number }> = {};
    for (const l of sl) {
      const cat = l.categories as { name: string; slug: string } | null;
      if (cat) {
        catMap[cat.slug] = catMap[cat.slug] ?? { ...cat, count: 0 };
        catMap[cat.slug].count++;
      }
    }
    const mainCat = Object.values(catMap).sort((a, b) => b.count - a.count)[0] ?? null;
    return { ...store, listing_count: sl.length, main_cat: mainCat };
  }).filter((s) => s.store_name && s.store_slug);

  if (!storeData.length) return null;

  return (
    <div>
      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontWeight: 800, fontSize: "15px", color: "#0f172a" }}>🏪 Tiendas Virtuales</span>
          <span style={{
            background: "#dbeafe", color: "#1d4ed8",
            borderRadius: "5px", padding: "1px 7px",
            fontSize: "9px", fontWeight: 800,
          }}>NUEVO</span>
        </div>
        <Link href="/tiendas" style={{ fontSize: "12px", color: "#6366f1", textDecoration: "none", fontWeight: 600 }}>
          Ver todas →
        </Link>
      </div>

      {/* Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "12px" }}>
        {storeData.map((store) => {
          const catSlug = store.main_cat?.slug ?? "";
          const catLabel = CAT_LABEL[catSlug] ?? store.main_cat?.name ?? "artículos";
          // Use banner as main image, fallback to logo on white bg, fallback to placeholder
          const hasImage = !!(store.store_banner_url || store.store_logo_url);

          return (
            <Link key={store.id} href={`/tienda/${store.store_slug}`} style={{ textDecoration: "none", display: "block" }}>
              <div
                style={{
                  background: "#fff",
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "1px solid #e8e8e8",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  cursor: "pointer",
                }}
                className="hover:-translate-y-1 hover:shadow-md"
              >
                {/* Logo / icon area */}
                <div style={{
                  height: "110px",
                  background: "#f1f5f9",
                  overflow: "hidden",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative",
                }}>
                  {store.store_logo_url ? (
                    <img
                      src={store.store_logo_url}
                      alt={store.store_name ?? ""}
                      style={{ maxWidth: "70%", maxHeight: "70%", objectFit: "contain" }}
                    />
                  ) : (
                    <span style={{ fontSize: "48px" }}>🏪</span>
                  )}

                  {/* Verified badge overlay */}
                  {store.store_verified && (
                    <div style={{
                      position: "absolute", top: "8px", right: "8px",
                      background: "#2563eb", color: "#fff",
                      borderRadius: "20px", padding: "2px 8px",
                      fontSize: "10px", fontWeight: 700,
                      display: "flex", alignItems: "center", gap: "3px",
                    }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Verificada
                    </div>
                  )}
                </div>

                {/* Info below image */}
                <div style={{ padding: "10px 12px 12px" }}>
                  <div style={{
                    fontWeight: 800, fontSize: "13px", color: "#0f172a",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    textTransform: "uppercase", letterSpacing: "0.3px",
                    marginBottom: "3px",
                  }}>
                    {store.store_name}
                  </div>
                  <div style={{
                    fontSize: "11px", color: "#64748b",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {store.store_description
                      ? store.store_description.slice(0, 50)
                      : store.listing_count > 0
                        ? `${store.listing_count} ${catLabel}`
                        : "Tienda virtual"}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Upsell bar */}
      <div style={{
        marginTop: "10px",
        background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
        border: "1px solid #bfdbfe", borderRadius: "10px",
        padding: "10px 16px", display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: "12px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>🏪</span>
          <div>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#1e3a8a" }}>¿Tenés un negocio?</span>
            <span style={{ fontSize: "12px", color: "#1d4ed8", marginLeft: "6px" }}>· Creá tu tienda virtual gratis</span>
          </div>
        </div>
        <Link href="/dashboard/store">
          <div style={{
            background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "#fff",
            borderRadius: "7px", padding: "6px 14px",
            fontWeight: 800, fontSize: "12px", cursor: "pointer", whiteSpace: "nowrap",
          }}>
            Crear tienda →
          </div>
        </Link>
      </div>
    </div>
  );
}
