import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: "#0f172a", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      {/* Main grid */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 24px 32px" }}>
        <div className="footer-grid">

          {/* ── Col 1: Brand ── */}
          <div>
            <Link href="/" style={{ textDecoration: "none", display: "inline-block", marginBottom: "14px" }}>
              <Logo height={30} />
            </Link>
            <p style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.7, maxWidth: "260px", margin: "0 0 20px" }}>
              El marketplace inteligente de Argentina. Publicá en 30 segundos con IA y llegá a miles de compradores.
            </p>
            {/* Social / contact pill */}
            <a
              href="mailto:hola@comerxia.com.ar"
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)",
                borderRadius: "8px", padding: "8px 14px", textDecoration: "none",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
              <span style={{ fontSize: "12px", color: "#818cf8", fontWeight: 600 }}>hola@comerxia.com.ar</span>
            </a>
          </div>

          {/* ── Col 2: Explorar ── */}
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "16px" }}>
              Explorar
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { label: "Todos los avisos", href: "/listings" },
                { label: "Publicar aviso", href: "/listings/new" },
                { label: "Tiendas", href: "/tiendas" },
                { label: "Categorías", href: "/" },
                { label: "Destacados", href: "/upgrade" },
              ].map(l => (
                <Link key={l.href + l.label} href={l.href}
                  style={{ fontSize: "13px", color: "#64748b", textDecoration: "none" }}
                  className="hover:text-slate-300"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* ── Col 3: Cuenta ── */}
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "16px" }}>
              Mi cuenta
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { label: "Ingresar", href: "/login" },
                { label: "Registrarse", href: "/register" },
                { label: "Mis avisos", href: "/dashboard/my-listings" },
                { label: "Mensajes", href: "/dashboard/messages" },
                { label: "Favoritos", href: "/dashboard/favorites" },
              ].map(l => (
                <Link key={l.href + l.label} href={l.href}
                  style={{ fontSize: "13px", color: "#64748b", textDecoration: "none" }}
                  className="hover:text-slate-300"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* ── Col 4: Soporte ── */}
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "16px" }}>
              Soporte
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <Link href="/contacto"
                style={{ fontSize: "13px", color: "#f97316", textDecoration: "none", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}
                className="hover:text-orange-400"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                Contáctenos
              </Link>
              {[
                { label: "Términos y condiciones", href: "/terminos" },
                { label: "Política de privacidad", href: "/privacidad" },
                { label: "Cómo publicar", href: "/listings/new" },
                { label: "Preguntas frecuentes", href: "/contacto" },
              ].map(l => (
                <Link key={l.href + l.label} href={l.href}
                  style={{ fontSize: "13px", color: "#64748b", textDecoration: "none" }}
                  className="hover:text-slate-300"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: "20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: "12px",
        }}>
          <span style={{ fontSize: "12px", color: "#334155" }}>
            © {year} ComerxIA · San Juan, Argentina 🇦🇷
          </span>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <div style={{
              background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.25)",
              borderRadius: "6px", padding: "3px 10px",
              fontSize: "11px", fontWeight: 700, color: "#f97316",
            }}>
              Powered by IA
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
