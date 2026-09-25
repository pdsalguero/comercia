import { Crown } from "lucide-react";
import { FounderBannerCta } from "./FounderBannerCta";
import { FOUNDER_PROGRAM } from "@/lib/site-config";

// Programa de fundadores: da un motivo concreto para registrarse ahora. Se apoya en el trigger de
// la base de datos, que entrega los créditos a quien se registra mientras haya menos de `slots` perfiles.
export function FounderBanner({ registered }: { registered: number }) {
  const left = FOUNDER_PROGRAM.slots - registered;
  if (left <= 0) return null;

  return (
    <section className="founder-banner" aria-label="Programa de fundadores">
      <span className="founder-banner-icon" aria-hidden="true">
        <Crown size={24} strokeWidth={1.75} />
      </span>
      <div className="founder-banner-text">
        <strong>Programa fundadores</strong>
        <span className="founder-banner-long">
          Los primeros {FOUNDER_PROGRAM.slots} vendedores reciben {FOUNDER_PROGRAM.credits} avisos destacados Premium gratis.
        </span>
        {/* Versión de una línea para celular (globals.css) */}
        <span className="founder-banner-short">
          {FOUNDER_PROGRAM.credits} destacados Premium gratis · quedan {left}
        </span>
      </div>
      <span className="founder-banner-left">
        Quedan <strong>{left}</strong> {left === 1 ? "lugar" : "lugares"}
      </span>
      <FounderBannerCta />
    </section>
  );
}
