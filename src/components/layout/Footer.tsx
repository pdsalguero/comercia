import Link from "next/link";

export function Footer() {
  return (
    <footer style={{ background: "#0f172a", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{
        maxWidth: "1200px", margin: "0 auto",
        padding: "16px 24px",
        display: "flex", alignItems: "center",
        justifyContent: "space-between", flexWrap: "wrap", gap: "12px",
      }}>
        {/* Logo + tagline */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{ fontSize: "16px", fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>
              Comerx<span style={{ color: "#818cf8" }}>IA</span>
            </span>
          </Link>
          <span style={{ fontSize: "12px", color: "#334155" }}>·</span>
          <span style={{ fontSize: "12px", color: "#475569" }}>El marketplace inteligente de Argentina</span>
        </div>

        {/* Links */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
          {[
            { label: "Avisos", href: "/listings" },
            { label: "Publicar", href: "/listings/new" },
            { label: "Ingresar", href: "/login" },
            { label: "Registrarse", href: "/register" },
            { label: "hola@comerxia.com.ar", href: "mailto:hola@comerxia.com.ar" },
          ].map((l) => (
            <a key={l.href} href={l.href}
              style={{ fontSize: "12px", color: "#475569", textDecoration: "none" }}
              className="hover:text-slate-300"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Copyright */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {["Términos", "Privacidad"].map((l) => (
            <a key={l} href="#"
              style={{ fontSize: "12px", color: "#334155", textDecoration: "none" }}
              className="hover:text-slate-400"
            >
              {l}
            </a>
          ))}
          <span style={{ fontSize: "12px", color: "#1e293b" }}>
            © {new Date().getFullYear()} ComerxIA · San Juan 🇦🇷
          </span>
        </div>
      </div>
    </footer>
  );
}
