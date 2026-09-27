import { FileSearch, Receipt, TriangleAlert, ShieldCheck, Wrench, HandCoins } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// "Antes de comprar": controles con links oficiales, según la provincia del aviso. Es la versión gratis
// de los informes por patente de otros portales (Autofact en Chileautos, V6). El libre deuda de patente
// lo saca el titular con su clave fiscal en las tres provincias, así que se le pide al vendedor.

const DNRPA_INFORMES = "https://www2.jus.gov.ar/dnrpa-site/#!/informesWeb";
const MULTAS = "https://consultainfracciones.seguridadvial.gob.ar/";

const TAX_OFFICES: Record<string, { label: string; org: string; href: string }> = {
  mendoza: { label: "Mendoza", org: "ATM", href: "https://atm.mendoza.gov.ar/noticias/como-obtener-el-libre-deuda-del-impuesto-automotor-en-linea-4/" },
  "san-juan": { label: "San Juan", org: "Rentas de San Juan", href: "https://rentas.dgrsj.gob.ar/DatosContribuyente/Deudas" },
  "san-luis": { label: "San Luis", org: "la DPIP de San Luis", href: "https://dpip.sanluis.gov.ar/rentas_sanluis/?p=11304" },
};

const linkStyle = { color: "#2563eb", fontWeight: 600 } as const;
const ext = { target: "_blank", rel: "noopener noreferrer" } as const;

function Item({ Icon, title, children }: { Icon: LucideIcon; title: string; children: React.ReactNode }) {
  return (
    <li style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
      <span aria-hidden="true" style={{ flexShrink: 0, marginTop: "1px", color: "#1d6fb8" }}>
        <Icon size={18} strokeWidth={1.9} />
      </span>
      <div style={{ fontSize: "13px", color: "#475569", lineHeight: 1.5 }}>
        <strong style={{ color: "#1e293b" }}>{title}.</strong> {children}
      </div>
    </li>
  );
}

/** `provinces`: claves de provinceKeysOf. Con una de Cuyo se muestra solo su organismo; si no, los tres. */
export function BuyerChecklist({ provinces = [] }: { provinces?: string[] }) {
  const offices = provinces.map((p) => TAX_OFFICES[p]).filter(Boolean);
  const shown = offices.length === 1 ? offices : Object.values(TAX_OFFICES);

  return (
    <div style={{ background: "#fff", borderRadius: "10px", boxShadow: "0 1px 3px rgba(0,0,0,.07)", padding: "16px 20px" }}>
      <div style={{ fontWeight: 700, fontSize: "15px", color: "#1e293b" }}>Antes de comprar</div>
      <div style={{ fontSize: "12.5px", color: "#64748b", marginTop: "2px" }}>
        Controles gratis o de bajo costo para comprar tranquilo. Pedile la patente al vendedor.
      </div>

      <ul style={{ listStyle: "none", margin: "12px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
        <Item Icon={FileSearch} title="Informe de dominio">
          Muestra el titular y si el vehículo tiene prenda, embargo o inhibición. Que el titular coincida con el DNI de quien
          vende. Se pide con la patente en la{" "}
          <a href={DNRPA_INFORMES} {...ext} style={linkStyle}>DNRPA ↗</a>.
        </Item>
        <Item Icon={Receipt} title="Libre deuda de patente">
          Pedíselo al vendedor: lo saca el titular en{" "}
          {shown.map((o, i) => (
            <span key={o.org}>
              {i > 0 && (i === shown.length - 1 ? " o " : ", ")}
              <a href={o.href} {...ext} style={linkStyle}>{o.org} ↗</a>
              {shown.length > 1 && ` (${o.label})`}
            </span>
          ))}
          .
        </Item>
        <Item Icon={TriangleAlert} title="Multas">
          Consultalas con la patente en la{" "}
          <a href={MULTAS} {...ext} style={linkStyle}>consulta nacional de infracciones ↗</a>.
        </Item>
        <Item Icon={ShieldCheck} title="Verificación policial">
          Para transferir, el Registro suele pedir la verificación del vehículo (formulario 12). Hacela antes de pagar: confirma
          que el motor y el chasis coinciden con los papeles.
        </Item>
        <Item Icon={Wrench} title="Revisión técnica y mecánica">
          Mirá que tenga la RTO vigente y, si podés, llevalo a un mecánico de confianza.
        </Item>
        <Item Icon={HandCoins} title="Pago">
          No señes ni transfieras plata sin haber visto el vehículo y los papeles en persona.
        </Item>
      </ul>
    </div>
  );
}
