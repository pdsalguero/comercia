import Link from "next/link";
import { Camera, Car, CarFront, Motorbike, Store, Building2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// "¿Qué querés hacer hoy?" — accesos rápidos del home (patrón de portales de vehículos).
// `bg` / `fg` son el fondo y el color del ícono (variables --tile-bg / --tile-fg de globals.css).
const ACTIONS: {
  Icon: LucideIcon; bg: string; fg: string;
  title: string; sub: string; href: string; highlight?: boolean;
}[] = [
  { Icon: Camera,    bg: "#ffedd5", fg: "#ea580c", title: "Publicar mi vehículo", sub: "Gratis, en 30 segundos",    href: "/listings/new", highlight: true },
  { Icon: Car,       bg: "#eff6ff", fg: "#2563eb", title: "Ver autos",            sub: "Usados y nuevos",           href: "/autos" },
  { Icon: CarFront,  bg: "#ecfdf5", fg: "#059669", title: "Pickups y SUV",        sub: "Utilitarios y 4x4",         href: "/pickups-suv" },
  { Icon: Motorbike, bg: "#fff1f2", fg: "#e11d48", title: "Ver motos",            sub: "Calle, enduro y más",       href: "/motos" },
  // No decir "verificadas": no hay proceso de verificación de tiendas todavía.
  { Icon: Store,     bg: "#f5f3ff", fg: "#7c3aed", title: "Concesionarias",       sub: "Concesionarias de Cuyo",    href: "/tiendas" },
  { Icon: Building2, bg: "#fffbeb", fg: "#d97706", title: "Sumá tu concesionaria", sub: "Tienda propia y tu stock", href: "/dashboard/store" },
];

export function QuickActions() {
  return (
    <section className="home-section">
      <h2 className="home-section-title">¿Qué querés hacer hoy?</h2>
      <div className="home-quick-grid">
        {ACTIONS.map(({ Icon, bg, fg, title, sub, href, highlight }) => (
          <Link
            key={title}
            href={href}
            className={`home-tile${highlight ? " home-tile-highlight" : ""}`}
            style={{ "--tile-bg": bg, "--tile-fg": fg } as React.CSSProperties}
          >
            <span className="home-tile-icon" aria-hidden="true">
              <Icon size={26} strokeWidth={1.75} />
            </span>
            <span className="home-tile-title">{title}</span>
            <span className="home-tile-sub">{sub}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
