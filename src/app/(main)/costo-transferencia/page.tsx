import type { Metadata } from "next";
import Link from "next/link";
import { getDolarOficial } from "@/lib/dolar";
import { TRANSFER_RATES_AS_OF } from "@/lib/transfer-cost";
import { TransferCalculator } from "./TransferCalculator";

export const metadata: Metadata = {
  title: "Cuánto cuesta transferir un auto en Mendoza, San Juan y San Luis",
  description:
    "Calculá gratis el costo de transferencia de un auto o moto usado en Mendoza, San Juan y San Luis: arancel del Registro Automotor e impuesto de sellos de cada provincia, actualizado.",
  alternates: { canonical: "https://cuyorodados.com.ar/costo-transferencia" },
  openGraph: {
    title: "Cuánto cuesta transferir un auto en Cuyo",
    description: "Calculadora gratuita: arancel del Registro y sellos de Mendoza, San Juan y San Luis.",
    url: "https://cuyorodados.com.ar/costo-transferencia",
    type: "website",
  },
};

export const revalidate = 1800;

const S = {
  card: { background: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.04)", padding: "24px" } as React.CSSProperties,
  h2: { fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: "0 0 10px" } as React.CSSProperties,
  p: { fontSize: "14.5px", color: "#475569", lineHeight: 1.65, margin: "0 0 10px" } as React.CSSProperties,
  li: { fontSize: "14.5px", color: "#475569", lineHeight: 1.65 } as React.CSSProperties,
};

export default async function CostoTransferenciaPage() {
  const dolar = await getDolarOficial();

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", padding: "28px 16px 80px", display: "flex", flexDirection: "column", gap: "18px" }}>
      <div style={{ fontSize: "12px", color: "#94a3b8" }}>
        <Link href="/" style={{ color: "#94a3b8", textDecoration: "none" }}>Inicio</Link>
        {" › "}
        <span style={{ color: "#475569" }}>Costo de transferencia</span>
      </div>

      <div>
        <h1 style={{ fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 800, color: "#0f172a", margin: "0 0 8px", letterSpacing: "-0.5px" }}>
          ¿Cuánto cuesta transferir un auto en Cuyo?
        </h1>
        <p style={{ ...S.p, fontSize: "15.5px" }}>
          Ingresá el precio y te mostramos el costo estimado de la transferencia en Mendoza, San Juan y San Luis.
          La diferencia entre provincias es grande: los sellos de Mendoza duplican a los de San Juan y San Luis.
        </p>
      </div>

      <div style={S.card}>
        <TransferCalculator dolarVenta={dolar?.venta ?? null} dolarFecha={dolar?.fechaActualizacion ?? null} />
        <p style={{ fontSize: "12px", color: "#94a3b8", margin: "14px 0 0", lineHeight: 1.5 }}>
          Es un estimado. Alícuotas vigentes a {TRANSFER_RATES_AS_OF}.
        </p>
      </div>

      <div style={S.card}>
        <h2 style={S.h2}>Qué incluye el cálculo</h2>
        <ul style={{ margin: 0, paddingLeft: "20px", listStyle: "disc", display: "flex", flexDirection: "column", gap: "6px" }}>
          <li style={S.li}>
            <strong>Arancel del Registro Automotor (DNRPA):</strong> 1% del valor del vehículo, igual en todo el país, con un
            mínimo fijo para autos y motos baratos.
          </li>
          <li style={S.li}>
            <strong>Impuesto de sellos provincial:</strong> Mendoza 1% (0,5% si comprás a una concesionaria con factura),
            San Juan 0,40% más un 20% de adicional para acción social, y San Luis 0,5% con un mínimo fijo.
          </li>
        </ul>
        <p style={{ ...S.p, marginTop: "10px" }}>
          Ambos se calculan sobre el <strong>mayor</strong> entre el precio declarado y la valuación oficial del vehículo (la{" "}
          <a href="https://www.dnrpa.gov.ar/valuacion/cons_valuacion.php" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb" }}>
            tabla de valuación de la DNRPA
          </a>
          ). Si la valuación es mayor que el precio que pagás, vas a pagar un poco más de lo que muestra la calculadora.
        </p>
      </div>

      <div style={S.card}>
        <h2 style={S.h2}>Qué no incluye y quién paga</h2>
        <p style={S.p}>
          No incluye formularios, la verificación policial, el grabado de autopartes ni una gestoría si la usás. Lo más común es que el
          comprador pague el arancel y los sellos, y el vendedor se ocupe de tener al día la VTV, la verificación y el libre deuda de patente.
        </p>
        <p style={{ ...S.p, margin: 0 }}>
          Antes de pagar, pedile al vendedor el libre deuda de patente de su provincia y consultá las multas del vehículo en la{" "}
          <a href="https://consultainfracciones.seguridadvial.gob.ar/" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb" }}>
            consulta nacional de infracciones
          </a>{" "}
          (gratis, con la patente).
        </p>
      </div>

      <div style={{ ...S.card, background: "#f8fafc", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
        <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>¿Buscás un auto o una moto en Cuyo?</div>
        <Link
          href="/category/vehicles"
          style={{ background: "#f97316", color: "#fff", fontWeight: 700, fontSize: "14px", padding: "10px 18px", borderRadius: "8px", textDecoration: "none" }}
        >
          Ver vehículos publicados
        </Link>
      </div>
    </div>
  );
}
