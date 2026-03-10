import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ListingCard } from "@/components/listings/ListingCard";
import { FeaturedCarousel } from "@/components/listings/FeaturedCarousel";
import { CategorySidebar } from "@/components/layout/CategorySidebar";
import { LocationInput } from "@/components/ui/LocationInput";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

const CATEGORIES = [
  { name: "Electrónica", slug: "electronics", icon: "📱" },
  { name: "Vehículos", slug: "vehicles", icon: "🚗" },
  { name: "Inmuebles", slug: "real-estate", icon: "🏠" },
  { name: "Ropa y Calzado", slug: "clothing", icon: "👗" },
  { name: "Hogar y Jardín", slug: "home-garden", icon: "🛋️" },
  { name: "Deportes", slug: "sports", icon: "⚽" },
  { name: "Herramientas", slug: "tools", icon: "🔧" },
  { name: "Libros", slug: "books", icon: "📚" },
  { name: "Mascotas", slug: "pets", icon: "🐾" },
  { name: "Otros", slug: "other", icon: "📦" },
];

async function getHomeData() {
  const supabase = await createClient();

  const FIELDS = "id, title, price, currency, condition, neighborhood, created_at, featured_level, attributes, listing_images(url, position)";

  const [
    { data: featuredVehicles },
    { data: featuredRealEstate },
    { data: recent },
    { count: totalListings },
    { count: totalSellers },
    { data: catCounts },
  ] = await Promise.all([
    // Featured vehicles (category_id = 2)
    supabase
      .from("listings")
      .select(FIELDS)
      .eq("status", "active")
      .eq("featured_level", "gold")
      .eq("category_id", 2)
      .order("created_at", { ascending: false })
      .limit(12),

    // Featured real estate (category_id = 3)
    supabase
      .from("listings")
      .select(FIELDS)
      .eq("status", "active")
      .eq("featured_level", "gold")
      .eq("category_id", 3)
      .order("created_at", { ascending: false })
      .limit(12),

    // Recent listings
    supabase
      .from("listings")
      .select("id, title, price, currency, condition, neighborhood, created_at, listing_images(url, position)")
      .eq("status", "active")
      .is("featured_level", null)
      .order("created_at", { ascending: false })
      .limit(8),

    // Total count
    supabase
      .from("listings")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),

    // Sellers count
    supabase.from("profiles").select("*", { count: "exact", head: true }),

    // Per-category counts
    supabase.from("listings").select("category_id").eq("status", "active"),
  ]);

  // Count per category_id
  const counts: Record<number, number> = {};
  for (const row of catCounts ?? []) {
    counts[row.category_id] = (counts[row.category_id] ?? 0) + 1;
  }

  return {
    featuredVehicles: featuredVehicles ?? [],
    featuredRealEstate: featuredRealEstate ?? [],
    recent: recent ?? [],
    totalListings: totalListings ?? 0,
    totalSellers: totalSellers ?? 0,
    categoryCounts: counts,
  };
}

function getCoverImage(listing: any): string | null {
  const imgs = listing.listing_images;
  if (!imgs?.length) return null;
  return (
    [...imgs].sort((a: any, b: any) => a.position - b.position)[0]?.url ?? null
  );
}

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { featuredVehicles, featuredRealEstate, recent, totalListings, totalSellers, categoryCounts } =
    await getHomeData();

  const categoriesWithCount = CATEGORIES
    .map((c, i) => ({ ...c, count: categoryCounts[i + 1] ?? 0 }))
    .sort((a, b) => b.count - a.count);

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9" }}>
      <Navbar user={user} />

      <div
        style={{ maxWidth: "1400px", margin: "0 auto", padding: "20px 16px" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "220px 1fr",
            gap: "20px",
            alignItems: "start",
          }}
        >
          {/* ── SIDEBAR ── */}
          <CategorySidebar categories={categoriesWithCount} />

          {/* ── MAIN CONTENT ── */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {/* Hero — split: buscar | publicar con IA */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              borderRadius: "14px",
              overflow: "hidden",
              boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
            }}>
              {/* Left: search */}
              <div style={{ background: "#fff", padding: "20px 24px 20px" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#94a3b8", marginBottom: "10px", letterSpacing: "0.3px" }}>
                  ¿QUÉ ESTÁS BUSCANDO?
                </div>
                <form action="/listings" method="GET" style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
                  <div style={{
                    flex: 2, display: "flex", alignItems: "center", gap: "8px",
                    border: "1.5px solid #e2e8f0", borderRadius: "10px",
                    padding: "0 14px", background: "#fafafa",
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input name="q" placeholder="¿Qué buscas?" style={{
                      flex: 1, border: "none", outline: "none", fontSize: "14px",
                      background: "transparent", padding: "11px 0", color: "#333",
                    }} />
                  </div>
                  <LocationInput />
                  <button type="submit" style={{
                    background: "#f97316", color: "#fff", border: "none",
                    borderRadius: "10px", padding: "0 20px",
                    fontWeight: 700, fontSize: "14px", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: "6px",
                    whiteSpace: "nowrap",
                  }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    Buscar
                  </button>
                </form>

                {/* Category shortcuts */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "6px" }}>
                  {[
                    { label: "Vehículos",   slug: "vehicles"    },
                    { label: "Inmuebles",   slug: "real-estate" },
                    { label: "Electrónica", slug: "electronics" },
                    { label: "Ropa",        slug: "clothing"    },
                    { label: "Hogar",       slug: "home-garden" },
                    { label: "Deportes",    slug: "sports"      },
                  ].map((cat) => (
                    <Link key={cat.slug} href={`/category/${cat.slug}`} style={{ textDecoration: "none" }}>
                      <div style={{
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        gap: "5px", padding: "10px 6px", borderRadius: "10px", cursor: "pointer",
                        background: "#f8fafc", border: "1px solid #f1f5f9", transition: "all 0.15s",
                      }}
                      className="hover:border-slate-200 hover:bg-white hover:shadow-sm"
                      >
                        <CategoryIcon slug={cat.slug} size={32} />
                        <span style={{ fontSize: "10px", fontWeight: 600, color: "#475569", textAlign: "center" }}>{cat.label}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Right: publish with AI */}
              <div style={{
                background: "linear-gradient(160deg, #1e1b4b 0%, #312e81 60%, #4c1d95 100%)",
                padding: "20px 24px",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                minWidth: "210px", gap: "10px",
                position: "relative", overflow: "hidden",
              }}>
                {/* decorative blur circle */}
                <div style={{
                  position: "absolute", width: "120px", height: "120px",
                  background: "rgba(249,115,22,0.25)", borderRadius: "50%",
                  top: "-30px", right: "-30px", filter: "blur(40px)",
                }} />
                <div style={{
                  position: "absolute", width: "80px", height: "80px",
                  background: "rgba(139,92,246,0.3)", borderRadius: "50%",
                  bottom: "-20px", left: "-20px", filter: "blur(30px)",
                }} />

                <div style={{ fontSize: "36px", lineHeight: 1 }}>📸</div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "15px", fontWeight: 900, color: "#fff", lineHeight: 1.2, marginBottom: "4px" }}>
                    Publicá con IA
                  </div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.65)", lineHeight: 1.4 }}>
                    Sacá una foto y la IA<br/>genera todo en 30 seg.
                  </div>
                </div>

                <Link href="/listings/new" style={{ width: "100%" }}>
                  <button style={{
                    width: "100%",
                    background: "linear-gradient(135deg, #f97316, #fb923c)",
                    color: "#fff", border: "none", borderRadius: "9px",
                    padding: "10px 0", fontWeight: 800, fontSize: "13px",
                    cursor: "pointer", boxShadow: "0 4px 14px rgba(249,115,22,0.4)",
                  }}>
                    Publicar gratis →
                  </button>
                </Link>

                <div style={{ display: "flex", gap: "10px" }}>
                  {["✓ Gratis", "✓ 30 seg.", "✓ IA"].map((t) => (
                    <span key={t} style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* ── FEATURED VEHICLES ── */}
            {featuredVehicles.length > 0 && (
              <FeaturedCarousel
                title="🚗 Vehículos Premium"
                items={featuredVehicles.map((l: any) => ({ ...l, cover_image: getCoverImage(l) }))}
                href="/category/vehicles"
              />
            )}

            {/* ── FEATURED REAL ESTATE ── */}
            {featuredRealEstate.length > 0 && (
              <FeaturedCarousel
                title="🏠 Inmuebles Premium"
                items={featuredRealEstate.map((l: any) => ({ ...l, cover_image: getCoverImage(l) }))}
                href="/category/real-estate"
              />
            )}

            {/* Upsell si no hay ningún featured */}
            {featuredVehicles.length === 0 && featuredRealEstate.length === 0 && (
              <div style={{
                background: "#fffbeb", border: "1px solid #fde68a",
                borderRadius: "10px", padding: "10px 16px",
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "16px" }}>⭐</span>
                  <div>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#92400e" }}>Sé el primero en destacarte</span>
                    <span style={{ fontSize: "12px", color: "#b45309", marginLeft: "6px" }}>· Recibí 5× más consultas</span>
                  </div>
                </div>
                <Link href="/upgrade">
                  <button style={{
                    background: "linear-gradient(135deg,#f59e0b,#fbbf24)", color: "#fff",
                    border: "none", borderRadius: "7px", padding: "6px 14px",
                    fontWeight: 800, fontSize: "12px", cursor: "pointer",
                  }}>
                    Ver planes →
                  </button>
                </Link>
              </div>
            )}

            {/* ── RECENT LISTINGS ── */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: "15px",
                    color: "#0f172a",
                  }}
                >
                  🕐 Últimos avisos
                </span>
                <Link
                  href="/listings"
                  style={{
                    fontSize: "12px",
                    color: "#6366f1",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  Ver todos →
                </Link>
              </div>

              {recent.length > 0 ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "10px",
                  }}
                >
                  {recent.map((l: any) => (
                    <ListingCard
                      key={l.id}
                      id={l.id}
                      title={l.title}
                      price={l.price}
                      cover_image={getCoverImage(l)}
                      condition={l.condition}
                      neighborhood={l.neighborhood}
                                            size="normal"
                    />
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    background: "#fff",
                    borderRadius: "14px",
                    border: "2px dashed #e2e8f0",
                    padding: "40px 24px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "36px", marginBottom: "8px" }}>
                    📭
                  </div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "15px",
                      color: "#0f172a",
                      marginBottom: "4px",
                    }}
                  >
                    Todavía no hay avisos
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#94a3b8",
                      marginBottom: "14px",
                    }}
                  >
                    ¡Sé el primero en vender en comercIA!
                  </div>
                  <Link href="/listings/new">
                    <button
                      style={{
                        background: "#6366f1",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        padding: "10px 24px",
                        fontWeight: 700,
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      Publicar el primer aviso
                    </button>
                  </Link>
                </div>
              )}
            </div>

            {/* AI Banner */}
            <div
              style={{
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                borderRadius: "10px",
                padding: "12px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "20px" }}>🤖</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: "14px", color: "#fff" }}>
                    Publicá en 30 segundos con IA
                  </div>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>
                    Sacá una foto → la IA genera título, descripción y precio
                  </div>
                </div>
              </div>
              <Link href="/listings/new" style={{ flexShrink: 0 }}>
                <button
                  style={{
                    background: "#fff",
                    color: "#6366f1",
                    border: "none",
                    borderRadius: "7px",
                    padding: "8px 18px",
                    fontWeight: 800,
                    fontSize: "13px",
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
                    whiteSpace: "nowrap",
                  }}
                >
                  📸 Probarlo gratis →
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function FeaturedSection({
  title, items, href, getCover,
}: {
  title: string;
  items: any[];
  href: string;
  getCover: (l: any) => string | null;
}) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontWeight: 800, fontSize: "15px", color: "#0f172a" }}>{title}</span>
          <span style={{
            background: "linear-gradient(135deg,#f59e0b,#fbbf24)",
            color: "#fff", borderRadius: "5px", padding: "1px 7px",
            fontSize: "9px", fontWeight: 800,
          }}>PREMIUM</span>
        </div>
        <Link href={href} style={{ fontSize: "12px", color: "#6366f1", textDecoration: "none", fontWeight: 600 }}>
          Ver todos →
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
        {items.map((l: any) => (
          <ListingCard
            key={l.id}
            id={l.id}
            title={l.title}
            price={l.price}
            currency={l.currency ?? "ARS"}
            cover_image={getCover(l)}
            condition={l.condition}
            neighborhood={l.neighborhood}
            featured_level={l.featured_level}
            attributes={l.attributes}
          />
        ))}
      </div>

      <div style={{
        marginTop: "10px",
        background: "linear-gradient(135deg,#fffbeb,#fef3c7)",
        border: "1px solid #fde68a", borderRadius: "10px",
        padding: "10px 16px", display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: "12px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>⭐</span>
          <div>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#92400e" }}>¿Querés aparecer aquí?</span>
            <span style={{ fontSize: "12px", color: "#b45309", marginLeft: "6px" }}>· Recibí 5× más consultas</span>
          </div>
        </div>
        <Link href="/upgrade">
          <button style={{
            background: "linear-gradient(135deg,#f59e0b,#fbbf24)", color: "#fff",
            border: "none", borderRadius: "7px", padding: "6px 14px",
            fontWeight: 800, fontSize: "12px", cursor: "pointer", whiteSpace: "nowrap",
          }}>
            Ver planes →
          </button>
        </Link>
      </div>
    </div>
  );
}
