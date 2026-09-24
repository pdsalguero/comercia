import Link from "next/link";
import { Camera, ClipboardCheck, MessageCircle, BadgeCheck, Users, MapPin } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const STEPS: { Icon: LucideIcon; title: string; text: string }[] = [
  { Icon: Camera,         title: "Sacá una foto",        text: "Con tu celular, en el lugar donde está el vehículo. Sumá las que quieras." },
  { Icon: ClipboardCheck, title: "Publicá en 30 segundos", text: "Te ayudamos a completar los datos a partir de la foto. Revisás y listo." },
  { Icon: MessageCircle,  title: "Recibí consultas",     text: "Los interesados te escriben directo. Sin comisiones ni intermediarios." },
];

const TRUST: { Icon: LucideIcon; label: string }[] = [
  { Icon: BadgeCheck, label: "Gratis y sin comisiones" },
  { Icon: Users,      label: "Particulares y concesionarias" },
  { Icon: MapPin,     label: "Toda la región de Cuyo" },
];

// "Cómo funciona": explica el proceso de venta en tres pasos y cierra con la invitación a publicar.
export function HowItWorks() {
  return (
    <section className="how-section">
      <div className="how-inner">
        <h2 className="how-title">Vendé tu vehículo en 3 pasos</h2>
        <p className="how-sub">Autos y motos para particulares y concesionarias de Mendoza, San Juan y San Luis.</p>

        <ol className="how-steps">
          {STEPS.map(({ Icon, title, text }, i) => (
            <li key={title} className="how-step">
              <span className="how-step-num" aria-hidden="true">{i + 1}</span>
              <span className="how-step-icon" aria-hidden="true"><Icon size={26} strokeWidth={1.75} /></span>
              <h3 className="how-step-title">{title}</h3>
              <p className="how-step-text">{text}</p>
            </li>
          ))}
        </ol>

        <div className="how-cta-row">
          <Link href="/listings/new" className="how-cta">Publicar mi vehículo</Link>
          <ul className="how-trust">
            {TRUST.map(({ Icon, label }) => (
              <li key={label}><Icon size={16} strokeWidth={1.9} /> {label}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
