import Link from "next/link";

export function Footer() {
  return (
    <footer style={{ background: "#0f172a", marginTop: "0" }}>
      {/* Main footer content */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "56px 24px 40px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: "48px",
          }}
        >
          {/* Brand column */}
          <div>
            <div style={{ marginBottom: "16px" }}>
              <span
                style={{
                  fontSize: "24px",
                  fontWeight: 900,
                  color: "#fff",
                  letterSpacing: "-0.5px",
                }}
              >
                comerc<span style={{ color: "#818cf8" }}>IA</span>
              </span>
            </div>
            <p
              style={{
                fontSize: "14px",
                color: "#64748b",
                lineHeight: 1.7,
                marginBottom: "24px",
                maxWidth: "260px",
              }}
            >
              El marketplace inteligente de San Juan. Publicá en 30 segundos con
              inteligencia artificial.
            </p>
            {/* Social */}
            <div style={{ display: "flex", gap: "10px" }}>
              {[
                {
                  label: "IG",
                  href: "https://instagram.com/comercia.ar",
                  icon: "📸",
                },
                { label: "WA", href: "#", icon: "💬" },
                { label: "FB", href: "#", icon: "👥" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: "38px",
                    height: "38px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                    textDecoration: "none",
                    transition: "all 0.15s",
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Categorías */}
          <div>
            <h4
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#475569",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                marginBottom: "16px",
              }}
            >
              Categorías
            </h4>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {[
                "Electrónica",
                "Vehículos",
                "Inmuebles",
                "Ropa y Calzado",
                "Hogar y Jardín",
                "Deportes",
              ].map((c) => (
                <Link
                  key={c}
                  href={`/category/${c.toLowerCase().replace(/ y /g, "-").replace(/ /g, "-")}`}
                  style={{
                    fontSize: "14px",
                    color: "#94a3b8",
                    textDecoration: "none",
                    transition: "color 0.15s",
                  }}
                  className="hover:text-white"
                >
                  {c}
                </Link>
              ))}
            </div>
          </div>

          {/* Plataforma */}
          <div>
            <h4
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#475569",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                marginBottom: "16px",
              }}
            >
              Plataforma
            </h4>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {[
                { label: "Publicar aviso", href: "/listings/new" },
                { label: "Crear cuenta", href: "/register" },
                { label: "Ingresar", href: "/login" },
                { label: "Mi dashboard", href: "/dashboard" },
                { label: "Planes Pro", href: "/upgrade" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  style={{
                    fontSize: "14px",
                    color: "#94a3b8",
                    textDecoration: "none",
                  }}
                  className="hover:text-white"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contacto */}
          <div>
            <h4
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#475569",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                marginBottom: "16px",
              }}
            >
              Contacto
            </h4>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span style={{ fontSize: "14px" }}>📍</span>
                <span style={{ fontSize: "14px", color: "#94a3b8" }}>
                  San Juan, Argentina
                </span>
              </div>
              <a
                href="mailto:hola@comercia.com.ar"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  textDecoration: "none",
                }}
                className="group"
              >
                <span style={{ fontSize: "14px" }}>✉️</span>
                <span
                  style={{ fontSize: "14px", color: "#94a3b8" }}
                  className="hover:text-white"
                >
                  hola@comercia.com.ar
                </span>
              </a>
              <a
                href="https://instagram.com/comercia.ar"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  textDecoration: "none",
                }}
              >
                <span style={{ fontSize: "14px" }}>📸</span>
                <span
                  style={{ fontSize: "14px", color: "#94a3b8" }}
                  className="hover:text-white"
                >
                  @comercia.ar
                </span>
              </a>
            </div>

            {/* CTA mini */}
            <Link
              href="/listings/new"
              style={{ display: "block", marginTop: "24px" }}
            >
              <div
                style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  borderRadius: "10px",
                  padding: "12px 16px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}
                >
                  📸 Publicar con IA
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.7)",
                    marginTop: "2px",
                  }}
                >
                  Gratis · 30 segundos
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "20px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <span style={{ fontSize: "13px", color: "#334155" }}>
            © {new Date().getFullYear()} comercIA · Todos los derechos
            reservados
          </span>
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            {["Términos", "Privacidad", "Cookies"].map((l) => (
              <a
                key={l}
                href="#"
                style={{
                  fontSize: "13px",
                  color: "#334155",
                  textDecoration: "none",
                }}
                className="hover:text-slate-400"
              >
                {l}
              </a>
            ))}
            <span style={{ fontSize: "13px", color: "#1e293b" }}>
              Hecho con ❤️ en San Juan 🇦🇷
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
