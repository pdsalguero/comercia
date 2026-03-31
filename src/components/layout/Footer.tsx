import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: "#0f172a", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px 20px 12px" }}>

        {/* Top row: logo + links en una sola línea */}
        <div className="footer-top">

          {/* Brand (compacto) */}
          <div className="footer-brand">
            <Link href="/" style={{ textDecoration: "none", display: "inline-block", marginBottom: "6px" }}>
              <Logo height={22} />
            </Link>
            <p style={{ fontSize: "11px", color: "#475569", lineHeight: 1.4, margin: "0 0 8px" }}>
              El marketplace inteligente de Argentina.
            </p>
            <a
              href="mailto:contacto@comerxia.com.ar"
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                background: "rgba(99,102,241,0.10)", border: "1px solid rgba(99,102,241,0.20)",
                borderRadius: "6px", padding: "5px 10px", textDecoration: "none",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
              <span style={{ fontSize: "11px", color: "#818cf8", fontWeight: 600 }}>contacto@comerxia.com.ar</span>
            </a>
          </div>

          {/* Links compactos en 3 grupos */}
          <div className="footer-links">
            <div>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "7px" }}>Explorar</div>
              {[
                { label: "Avisos", href: "/listings" },
                { label: "Tiendas", href: "/tiendas" },
                { label: "Categorías", href: "/" },
                { label: "Destacados", href: "/upgrade" },
              ].map(l => (
                <Link key={l.href} href={l.href} style={{ display: "block", fontSize: "12px", color: "#475569", textDecoration: "none", marginBottom: "4px" }}>
                  {l.label}
                </Link>
              ))}
            </div>

            <div>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "7px" }}>Mi cuenta</div>
              {[
                { label: "Ingresar", href: "/login" },
                { label: "Registrarse", href: "/register" },
                { label: "Mis avisos", href: "/dashboard/my-listings" },
                { label: "Favoritos", href: "/dashboard/favorites" },
              ].map(l => (
                <Link key={l.href} href={l.href} style={{ display: "block", fontSize: "12px", color: "#475569", textDecoration: "none", marginBottom: "4px" }}>
                  {l.label}
                </Link>
              ))}
            </div>

            <div>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "7px" }}>Soporte</div>
              {[
                { label: "Contáctenos", href: "/contacto" },
                { label: "Términos", href: "/terminos" },
                { label: "Privacidad", href: "/privacidad" },
              ].map(l => (
                <Link key={l.href} href={l.href} style={{ display: "block", fontSize: "12px", color: "#475569", textDecoration: "none", marginBottom: "4px" }}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          marginTop: "12px", paddingTop: "10px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: "8px",
        }}>
          <span style={{ fontSize: "11px", color: "#334155" }}>© {year} ComerxIA · Argentina 🇦🇷</span>
          <div style={{
            background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.20)",
            borderRadius: "5px", padding: "2px 8px",
            fontSize: "10px", fontWeight: 700, color: "#f97316",
          }}>
            Powered by IA
          </div>
        </div>
      </div>

      <style>{`
        .footer-top {
          display: flex;
          gap: 32px;
          align-items: flex-start;
        }
        .footer-brand {
          flex-shrink: 0;
          min-width: 160px;
        }
        .footer-links {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          flex: 1;
        }
        @media (max-width: 600px) {
          .footer-top {
            flex-direction: column;
            gap: 20px;
          }
          .footer-links {
            width: 100%;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
          }
        }
      `}</style>
    </footer>
  );
}
