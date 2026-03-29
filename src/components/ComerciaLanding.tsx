"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Zap,
  TrendingUp,
  ShoppingBag,
  Search,
  ArrowRight,
  CheckCircle2,
  Star,
  ChevronDown,
} from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";

// ─── Types ────────────────────────────────────────────────────────────────────
interface FeatureCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight: string;
}

interface Stat {
  value: string;
  label: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const FEATURES: FeatureCard[] = [
  {
    icon: <Sparkles size={28} />,
    title: "Descripciones con IA",
    description:
      "Sacá una foto y nuestra IA genera el título, descripción y precio sugerido en segundos. Sin escribir una sola palabra.",
    highlight: "30 segundos por publicación",
  },
  {
    icon: <Zap size={28} />,
    title: "Publicación Express",
    description:
      "De la foto a publicado en menos de un minuto. Sin formularios interminables, sin burocracia. Solo tu producto y listo.",
    highlight: "3 pasos para publicar",
  },
  {
    icon: <TrendingUp size={28} />,
    title: "Máxima Visibilidad",
    description:
      "Planes de destacado que ponen tu aviso frente a miles de compradores. Más visitas, más consultas, más ventas.",
    highlight: "Destacado desde $699",
  },
];

const SELLER_BENEFITS = [
  "La IA redacta el aviso por vos",
  "Precio sugerido basado en el mercado real",
  "Estadísticas de visitas en tiempo real",
  "Planes de destacado accesibles",
  "Sin comisiones por venta",
];

const BUYER_BENEFITS = [
  "Búsqueda inteligente con IA",
  "Avisos verificados y actualizados",
  "Filtros avanzados por zona, precio y características",
  "Contacto directo con el vendedor",
  "Sin intermediarios",
];

const STATS: Stat[] = [
  { value: "< 1 min", label: "para publicar" },
  { value: "IA", label: "que trabaja por vos" },
  { value: "100%", label: "gratis para empezar" },
  { value: "Argentina", label: "en todo el país" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export function ComerxIALanding() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Track landing page visit (fire-and-forget)
  useEffect(() => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: "landing" }),
    }).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) { setError("Ingresá un email válido"); return; }
    setLoading(true);
    setError(null);
    try {
      // TODO: connect to backend — e.g. POST /api/waitlist { email }
      await new Promise((r) => setTimeout(r, 800)); // placeholder
      setSubmitted(true);
    } catch {
      setError("Error al registrarse. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ fontFamily: "inherit", overflowX: "hidden" }}>

      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? "rgba(255,255,255,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(0,0,0,0.08)" : "none",
        transition: "all 0.3s ease",
        padding: "14px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        maxWidth: "100%",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <img src="/logo.png" alt="ComerxIA" style={{ height: "36px", width: "auto" }} />
        </div>
        <div style={{
          background: "rgba(255,140,0,0.15)", border: "1px solid rgba(255,140,0,0.4)",
          borderRadius: "999px", padding: "9px 20px",
          fontSize: "14px", fontWeight: 700, color: "#FF8C00",
        }}>
          Próximamente
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section style={{
        minHeight: "100vh",
        background: "linear-gradient(145deg,#0f172a 0%,#1E5BA8 45%,#1e3a5f 100%)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "100px 20px 60px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Decorative blobs */}
        <div style={{
          position: "absolute", top: "15%", left: "8%",
          width: "320px", height: "320px", borderRadius: "50%",
          background: "radial-gradient(circle,rgba(255,140,0,0.18),transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "10%", right: "5%",
          width: "400px", height: "400px", borderRadius: "50%",
          background: "radial-gradient(circle,rgba(99,102,241,0.2),transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          background: "rgba(255,140,0,0.15)", border: "1px solid rgba(255,140,0,0.4)",
          borderRadius: "999px", padding: "6px 16px",
          fontSize: "12px", fontWeight: 700, color: "#fbbf24",
          marginBottom: "28px", letterSpacing: "0.5px",
        }}>
          <Sparkles size={13} />
          MARKETPLACE IMPULSADO POR IA · ARGENTINA
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: "clamp(36px,6vw,72px)", fontWeight: 900,
          color: "#fff", lineHeight: 1.1, marginBottom: "20px",
          maxWidth: "820px",
        }}>
          Vendé más rápido con{" "}
          <span style={{
            background: "linear-gradient(90deg,#FF8C00,#fbbf24)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            inteligencia artificial
          </span>
        </h1>

        {/* Subheadline */}
        <p style={{
          fontSize: "clamp(16px,2.2vw,22px)", color: "rgba(255,255,255,0.75)",
          maxWidth: "600px", lineHeight: 1.6, marginBottom: "40px",
        }}>
          Sacá una foto, la IA redacta tu aviso y lo publicás en{" "}
          <strong style={{ color: "#fff" }}>30 segundos</strong>.
          Gratis. Sin complicaciones.
        </p>

        {/* Email form */}
        {!submitted ? (
          <form onSubmit={handleSubmit} style={{
            display: "flex", gap: "10px", flexWrap: "wrap",
            justifyContent: "center", marginBottom: "16px", width: "100%", maxWidth: "480px",
          }}>
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                flex: 1, minWidth: "220px",
                padding: "14px 18px", borderRadius: "10px",
                border: "1.5px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(8px)",
                color: "#fff", fontSize: "15px", outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "14px 24px", borderRadius: "10px", border: "none",
                background: "linear-gradient(135deg,#FF8C00,#f97316)",
                color: "#fff", fontSize: "15px", fontWeight: 700,
                cursor: loading ? "wait" : "pointer",
                boxShadow: "0 4px 20px rgba(255,140,0,0.45)",
                whiteSpace: "nowrap", opacity: loading ? 0.8 : 1,
                transition: "transform 0.15s",
              }}
            >
              {loading ? "Registrando..." : "Quiero acceso anticipado →"}
            </button>
            {error && (
              <p style={{ width: "100%", textAlign: "center", color: "#fca5a5", fontSize: "13px" }}>
                {error}
              </p>
            )}
          </form>
        ) : (
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.4)",
            borderRadius: "12px", padding: "14px 24px", marginBottom: "16px",
          }}>
            <CheckCircle2 size={20} style={{ color: "#4ade80", flexShrink: 0 }} />
            <span style={{ color: "#fff", fontSize: "15px", fontWeight: 600 }}>
              ¡Listo! Te avisamos cuando lancemos. 🚀
            </span>
          </div>
        )}

        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", marginBottom: "60px" }}>
          Sin spam. Cancelás cuando quieras.
        </p>

        {/* Stats row */}
        <div style={{
          display: "flex", gap: "clamp(16px,4vw,48px)", flexWrap: "wrap",
          justifyContent: "center",
        }}>
          {STATS.map((s, i) => (
            <div key={s.label} style={{
              textAlign: "center",
              opacity: 0,
              animation: `fadeSlideUp 0.6s ease forwards`,
              animationDelay: `${0.8 + i * 0.1}s`,
            }}>
              <div style={{ fontSize: "clamp(20px,3vw,30px)", fontWeight: 900, color: "#FF8C00" }}>
                {s.value}
              </div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginTop: "2px" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Scroll hint */}
        <div style={{
          position: "absolute", bottom: "28px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
          color: "rgba(255,255,255,0.3)", fontSize: "11px",
          animation: "bounce 2s infinite",
        }}>
          <span>Conocé más</span>
          <ChevronDown size={16} />
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────────── */}
      <section style={{
        background: "#fff", padding: "48px 20px",
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <AnimatedSection style={{ textAlign: "center", marginBottom: "52px" }}>
            <div style={{
              display: "inline-block", background: "#fff7ed",
              border: "1px solid #fed7aa", borderRadius: "999px",
              padding: "4px 14px", fontSize: "12px", fontWeight: 700,
              color: "#ea580c", marginBottom: "14px",
            }}>
              POR QUÉ COMERXIA
            </div>
            <h2 style={{ fontSize: "clamp(26px,4vw,42px)", fontWeight: 900, color: "#0f172a", lineHeight: 1.2 }}>
              Publicar nunca fue tan fácil
            </h2>
            <p style={{ fontSize: "16px", color: "#64748b", marginTop: "12px", maxWidth: "500px", margin: "12px auto 0" }}>
              La IA hace el trabajo duro. Vos solo publicás y esperás las consultas.
            </p>
          </AnimatedSection>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
            gap: "24px",
          }}>
            {FEATURES.map((f, i) => (
              <AnimatedSection key={i} delay={i * 120}>
              <div style={{
                background: "#f8fafc",
                borderRadius: "20px",
                padding: "32px 28px",
                border: "1.5px solid #e2e8f0",
                transition: "transform 0.2s, box-shadow 0.2s",
                cursor: "default", height: "100%",
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{
                  width: "56px", height: "56px", borderRadius: "14px",
                  background: "linear-gradient(135deg,#FF8C00,#f97316)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", marginBottom: "20px",
                  boxShadow: "0 4px 16px rgba(255,140,0,0.3)",
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginBottom: "10px" }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.6, marginBottom: "16px" }}>
                  {f.description}
                </p>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: "5px",
                  background: "#fff7ed", border: "1px solid #fed7aa",
                  borderRadius: "6px", padding: "4px 10px",
                  fontSize: "11px", fontWeight: 700, color: "#ea580c",
                }}>
                  <Star size={10} />
                  {f.highlight}
                </div>
              </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Vendedores / Compradores ─────────────────────────────────────────── */}
      <section style={{ background: "#f8fafc", padding: "48px 20px" }}>
        <div style={{
          maxWidth: "1100px", margin: "0 auto",
          display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
          gap: "32px", alignItems: "stretch",
        }}>
          {/* Vendedores */}
          <AnimatedSection delay={0} style={{ display: "flex" }}>
          <div style={{
            background: "linear-gradient(135deg,#1E5BA8,#1e3a5f)",
            borderRadius: "24px", padding: "40px 36px", color: "#fff", flex: 1,
          }}>
            <div style={{
              width: "52px", height: "52px", borderRadius: "14px",
              background: "rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: "20px",
            }}>
              <ShoppingBag size={26} />
            </div>
            <h3 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "8px" }}>
              Para vendedores
            </h3>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", lineHeight: 1.6, marginBottom: "24px" }}>
              Publicá más rápido y llegá a más compradores. La IA trabaja por vos.
            </p>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
              {SELLER_BENEFITS.map((b) => (
                <li key={b} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px" }}>
                  <CheckCircle2 size={16} style={{ color: "#fbbf24", flexShrink: 0 }} />
                  {b}
                </li>
              ))}
            </ul>
          </div>
          </AnimatedSection>

          {/* Compradores */}
          <AnimatedSection delay={150} style={{ display: "flex" }}>
          <div style={{
            background: "linear-gradient(135deg,#FF8C00,#f97316)",
            borderRadius: "24px", padding: "40px 36px", color: "#fff", flex: 1,
          }}>
            <div style={{
              width: "52px", height: "52px", borderRadius: "14px",
              background: "rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: "20px",
            }}>
              <Search size={26} />
            </div>
            <h3 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "8px" }}>
              Para compradores
            </h3>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.85)", lineHeight: 1.6, marginBottom: "24px" }}>
              Encontrá lo que buscás más rápido. Avisos claros, actualizados y verificados.
            </p>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
              {BUYER_BENEFITS.map((b) => (
                <li key={b} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px" }}>
                  <CheckCircle2 size={16} style={{ color: "rgba(255,255,255,0.9)", flexShrink: 0 }} />
                  {b}
                </li>
              ))}
            </ul>
          </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── CTA Final ───────────────────────────────────────────────────────── */}
      <section style={{
        background: "linear-gradient(135deg,#0f172a,#1E5BA8)",
        padding: "48px 20px", textAlign: "center",
      }}>
        <AnimatedSection style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(28px,4vw,46px)", fontWeight: 900, color: "#fff", marginBottom: "16px" }}>
            ¿Listo para vender más?
          </h2>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.7)", marginBottom: "36px", lineHeight: 1.6 }}>
            Unite a los primeros vendedores de ComerxIA.
          </p>
          <form onSubmit={handleSubmit} style={{
            display: "flex", gap: "10px", flexWrap: "wrap",
            justifyContent: "center", width: "100%", maxWidth: "480px", margin: "0 auto",
          }}>
            {!submitted ? (
              <>
                <input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    flex: 1, minWidth: "200px",
                    padding: "14px 18px", borderRadius: "10px",
                    border: "1.5px solid rgba(255,255,255,0.2)",
                    background: "rgba(255,255,255,0.1)",
                    backdropFilter: "blur(8px)",
                    color: "#fff", fontSize: "15px", outline: "none",
                  }}
                />
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: "14px 24px", borderRadius: "10px", border: "none",
                    background: "linear-gradient(135deg,#FF8C00,#f97316)",
                    color: "#fff", fontSize: "15px", fontWeight: 700,
                    cursor: loading ? "wait" : "pointer",
                    boxShadow: "0 4px 20px rgba(255,140,0,0.45)",
                    display: "inline-flex", alignItems: "center", gap: "8px",
                    opacity: loading ? 0.8 : 1,
                  }}
                >
                  {loading ? "Registrando..." : <><span>Quiero acceso anticipado</span><ArrowRight size={16} /></>}
                </button>
              </>
            ) : (
              <div style={{
                display: "flex", alignItems: "center", gap: "10px",
                background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.4)",
                borderRadius: "12px", padding: "14px 24px",
              }}>
                <CheckCircle2 size={20} style={{ color: "#4ade80", flexShrink: 0 }} />
                <span style={{ color: "#fff", fontSize: "15px", fontWeight: 600 }}>
                  ¡Listo! Te avisamos cuando lancemos. 🚀
                </span>
              </div>
            )}
          </form>
        </AnimatedSection>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer style={{
        background: "#0f172a", padding: "28px 20px",
        textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: "13px",
      }}>
        © {new Date().getFullYear()} ComerxIA · Marketplace con IA · Argentina
      </footer>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(6px); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}
