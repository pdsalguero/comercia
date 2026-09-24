import Link from "next/link";
import { Car, CarFront, Motorbike, Bike, Mountain, Truck, Sailboat, Caravan, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { FacetOption } from "@/lib/hero-facets";
import { vehiclesHref } from "@/lib/vehicle-landing";

// "Tipos de vehículo" — solo los tipos con stock, para no llevar a páginas vacías.
const ICONS: Record<string, { Icon: LucideIcon; bg: string; fg: string }> = {
  auto:        { Icon: Car,       bg: "#eff6ff", fg: "#2563eb" },
  camioneta:   { Icon: CarFront,  bg: "#ecfdf5", fg: "#059669" },
  moto:        { Icon: Motorbike, bg: "#fff1f2", fg: "#e11d48" },
  cuatriciclo: { Icon: Bike,      bg: "#fff7ed", fg: "#ea580c" },
  utv:         { Icon: Mountain,  bg: "#fffbeb", fg: "#d97706" },
  camion:      { Icon: Truck,     bg: "#f1f5f9", fg: "#475569" },
  nautica:     { Icon: Sailboat,  bg: "#ecfeff", fg: "#0891b2" },
};
const FALLBACK = { Icon: Caravan, bg: "#f1f5f9", fg: "#475569" };

export function VehicleTypes({ types }: { types: FacetOption[] }) {
  if (types.length === 0) return null;

  return (
    <section className="home-section">
      <h2 className="home-section-title">Tipos de vehículo</h2>
      <div className="home-types-grid">
        {types.map((t) => {
          const { Icon, bg, fg } = ICONS[t.value] ?? FALLBACK;
          return (
            <Link
              key={t.value}
              href={vehiclesHref({ type: t.value })}
              className="home-tile"
              style={{ "--tile-bg": bg, "--tile-fg": fg } as React.CSSProperties}
            >
              <span className="home-tile-icon" aria-hidden="true">
                <Icon size={26} strokeWidth={1.75} />
              </span>
              <span className="home-tile-title">{t.label}</span>
            </Link>
          );
        })}
        <Link
          href="/category/vehicles"
          className="home-tile"
          style={{ "--tile-bg": "#eff6ff", "--tile-fg": "#2563eb" } as React.CSSProperties}
        >
          <span className="home-tile-icon" aria-hidden="true">
            <ArrowRight size={24} strokeWidth={1.75} />
          </span>
          <span className="home-tile-title">Ver todos</span>
        </Link>
      </div>
    </section>
  );
}
