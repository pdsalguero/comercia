import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const categories = [
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

const quickLinks = [
  { label: "📱 Electrónica", slug: "electronics" },
  { label: "🚗 Vehículos", slug: "vehicles" },
  { label: "🏠 Inmuebles", slug: "real-estate" },
  { label: "👗 Ropa", slug: "clothing" },
  { label: "⚽ Deportes", slug: "sports" },
];

const howItWorks = [
  {
    step: "01",
    icon: "📸",
    title: "Sacá una foto",
    desc: "Fotografiá lo que querés vender con tu celular o cualquier cámara.",
  },
  {
    step: "02",
    icon: "🤖",
    title: "La IA hace todo",
    desc: "Generamos título, descripción y precio sugerido usando MercadoLibre en segundos.",
  },
  {
    step: "03",
    icon: "🚀",
    title: "Publicado",
    desc: "Revisá, ajustá si querés, y llegá a miles de compradores en San Juan.",
  },
];

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section
        style={{
          background: "linear-gradient(180deg, #f0f4ff 0%, #f8fafc 100%)",
          width: "100%",
          padding: "60px 24px 48px",
          textAlign: "center",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: "20px",
              padding: "5px 14px",
              marginBottom: "20px",
            }}
          >
            <span style={{ fontSize: "13px" }}>✨</span>
            <span
              style={{ fontSize: "12px", color: "#2563eb", fontWeight: 600 }}
            >
              Inteligencia artificial integrada
            </span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontSize: "44px",
              fontWeight: 900,
              color: "#0f172a",
              lineHeight: 1.1,
              letterSpacing: "-2px",
              marginBottom: "14px",
            }}
          >
            Comprá y vendé en <span style={{ color: "#6366f1" }}>San Juan</span>
            <br />
            más fácil que nunca
          </h1>

          <p
            style={{
              fontSize: "16px",
              color: "#64748b",
              marginBottom: "32px",
              lineHeight: 1.7,
              maxWidth: "480px",
              margin: "0 auto 32px",
            }}
          >
            Publicá en 30 segundos — subí una foto y la IA genera el título,
            descripción y precio sugerido automáticamente.
          </p>

          {/* Search bar */}
          <div
            style={{
              display: "flex",
              maxWidth: "560px",
              margin: "0 auto 20px",
              boxShadow: "0 4px 24px rgba(99,102,241,0.12)",
              borderRadius: "14px",
              overflow: "hidden",
              border: "2px solid #e0e7ff",
              background: "#fff",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                paddingLeft: "18px",
              }}
            >
              <span style={{ fontSize: "18px", color: "#94a3b8" }}>🔍</span>
            </div>
            <input
              type="text"
              placeholder="iPhone, auto, departamento, ropa..."
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                padding: "16px 14px",
                fontSize: "15px",
                color: "#0f172a",
                background: "transparent",
              }}
            />
            <Link href="/listings">
              <button
                style={{
                  background: "#6366f1",
                  color: "#fff",
                  border: "none",
                  padding: "0 28px",
                  fontWeight: 700,
                  fontSize: "15px",
                  cursor: "pointer",
                  height: "100%",
                  whiteSpace: "nowrap",
                }}
              >
                Buscar
              </button>
            </Link>
          </div>

          {/* Quick category pills */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {quickLinks.map((c) => (
              <Link key={c.slug} href={`/category/${c.slug}`}>
                <span
                  style={{
                    background: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "20px",
                    padding: "6px 14px",
                    fontSize: "13px",
                    color: "#475569",
                    cursor: "pointer",
                    display: "inline-block",
                    transition: "all 0.15s",
                  }}
                >
                  {c.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────── */}
      <section
        style={{ background: "#6366f1", width: "100%", padding: "18px 24px" }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "center",
            gap: "64px",
            flexWrap: "wrap",
          }}
        >
          {[
            { value: "0", label: "Avisos activos" },
            { value: "0", label: "Vendedores" },
            { value: "30s", label: "Para publicar con IA" },
            { value: "100%", label: "Gratis para vender" },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "24px", fontWeight: 900, color: "#fff" }}>
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.75)",
                  marginTop: "2px",
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <div
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" }}
      >
        {/* Categories grid */}
        <section style={{ marginBottom: "48px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: 800,
                  color: "#0f172a",
                  marginBottom: "4px",
                }}
              >
                Explorar categorías
              </h2>
              <p style={{ fontSize: "13px", color: "#94a3b8" }}>
                Encontrá lo que buscás en San Juan
              </p>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "12px",
            }}
          >
            {categories.map((cat) => (
              <Link key={cat.slug} href={`/category/${cat.slug}`}>
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #f1f5f9",
                    borderRadius: "14px",
                    padding: "20px 12px",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  }}
                  className="hover:border-indigo-200 hover:shadow-md hover:-translate-y-0.5"
                >
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>
                    {cat.icon}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#334155",
                    }}
                  >
                    {cat.name}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* AI Feature card */}
        <section style={{ marginBottom: "48px" }}>
          <div
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              borderRadius: "20px",
              padding: "40px 48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "24px",
              flexWrap: "wrap",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decorative circles */}
            <div
              style={{
                position: "absolute",
                right: "-30px",
                top: "-30px",
                width: "180px",
                height: "180px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.06)",
              }}
            />
            <div
              style={{
                position: "absolute",
                right: "80px",
                bottom: "-50px",
                width: "140px",
                height: "140px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.04)",
              }}
            />

            <div style={{ position: "relative", zIndex: 1 }}>
              <div
                style={{
                  background: "rgba(255,255,255,0.15)",
                  display: "inline-block",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  color: "#fff",
                  marginBottom: "12px",
                }}
              >
                🤖 Potenciado con IA
              </div>
              <h3
                style={{
                  fontSize: "26px",
                  fontWeight: 900,
                  color: "#fff",
                  marginBottom: "8px",
                }}
              >
                Publicá en 30 segundos
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.8)",
                  maxWidth: "400px",
                  lineHeight: 1.6,
                }}
              >
                Sacá una foto → la IA identifica el producto, genera el título,
                descripción y consulta precios reales en MercadoLibre
                automáticamente.
              </p>
            </div>

            <Link
              href="/listings/new"
              style={{ position: "relative", zIndex: 1, flexShrink: 0 }}
            >
              <button
                style={{
                  background: "#fff",
                  color: "#6366f1",
                  border: "none",
                  borderRadius: "12px",
                  padding: "14px 28px",
                  fontWeight: 800,
                  fontSize: "15px",
                  cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                  whiteSpace: "nowrap",
                }}
              >
                📸 Probarlo gratis →
              </button>
            </Link>
          </div>
        </section>

        {/* How it works */}
        <section style={{ marginBottom: "48px" }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <h2
              style={{
                fontSize: "22px",
                fontWeight: 800,
                color: "#0f172a",
                marginBottom: "6px",
              }}
            >
              Así de fácil es publicar
            </h2>
            <p style={{ fontSize: "14px", color: "#94a3b8" }}>
              Sin complicaciones, sin formularios interminables
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "20px",
            }}
          >
            {howItWorks.map((item, i) => (
              <div
                key={item.step}
                style={{
                  background: "#fff",
                  borderRadius: "16px",
                  padding: "28px 24px",
                  textAlign: "center",
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  position: "relative",
                }}
              >
                {/* Step number */}
                <div
                  style={{
                    position: "absolute",
                    top: "20px",
                    right: "20px",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#e2e8f0",
                    letterSpacing: "1px",
                  }}
                >
                  {item.step}
                </div>
                {/* Connector line */}
                {i < howItWorks.length - 1 && (
                  <div
                    style={{
                      position: "absolute",
                      right: "-12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "24px",
                      height: "2px",
                      background: "linear-gradient(90deg, #e0e7ff, #c7d2fe)",
                      zIndex: 10,
                    }}
                  />
                )}
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    background: "linear-gradient(135deg, #eff6ff, #e0e7ff)",
                    borderRadius: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "28px",
                    margin: "0 auto 16px",
                  }}
                >
                  {item.icon}
                </div>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#0f172a",
                    marginBottom: "8px",
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#64748b",
                    lineHeight: 1.6,
                  }}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section>
          <div
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "48px",
              textAlign: "center",
              border: "1px solid #f1f5f9",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🎉</div>
            <h2
              style={{
                fontSize: "26px",
                fontWeight: 900,
                color: "#0f172a",
                marginBottom: "10px",
              }}
            >
              ¿Tenés algo para vender?
            </h2>
            <p
              style={{
                fontSize: "15px",
                color: "#64748b",
                marginBottom: "28px",
                maxWidth: "440px",
                margin: "0 auto 28px",
              }}
            >
              Publicá gratis hoy. Sin comisiones, sin costos ocultos. Llegá a
              miles de personas en San Juan.
            </p>
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Link href="/listings/new">
                <button
                  style={{
                    background: "#6366f1",
                    color: "#fff",
                    border: "none",
                    borderRadius: "12px",
                    padding: "14px 32px",
                    fontWeight: 800,
                    fontSize: "16px",
                    cursor: "pointer",
                    boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
                  }}
                >
                  Publicar aviso gratis
                </button>
              </Link>
              <Link href="/listings">
                <button
                  style={{
                    background: "#fff",
                    color: "#6366f1",
                    border: "2px solid #e0e7ff",
                    borderRadius: "12px",
                    padding: "14px 32px",
                    fontWeight: 700,
                    fontSize: "16px",
                    cursor: "pointer",
                  }}
                >
                  Ver todos los avisos
                </button>
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
