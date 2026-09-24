import Link from "next/link";
import { estimateTransferCosts, TRANSFER_RATES_AS_OF, type VehicleKind } from "@/lib/transfer-cost";
import { dolarQuoteLabel } from "@/lib/dolar-label";

interface Props {
  price: number;
  currency: string;
  kind: VehicleKind;
  /** Venta del dólar oficial; necesaria si el aviso está en USD. */
  dolarVenta?: number | null;
  /** Fecha de la cotización (dolarapi `fechaActualizacion`), para mostrarla junto al valor. */
  dolarFecha?: string | null;
  /** Texto de ubicación del aviso: si nombra una provincia de Cuyo, esa fila se resalta. */
  location?: string | null;
}

const ars = (n: number) => `$ ${n.toLocaleString("es-AR")}`;

// Costo estimado de transferir el vehículo del aviso en cada provincia de Cuyo.
export function TransferCostCard({ price, currency, kind, dolarVenta, dolarFecha, location }: Props) {
  const isUsd = currency === "USD";
  if (isUsd && !dolarVenta) return null;
  const priceArs = isUsd ? price * dolarVenta! : price;
  const rows = estimateTransferCosts(priceArs, kind);
  const loc = (location ?? "").toLowerCase();

  return (
    <div style={{ background: "#fff", borderRadius: "10px", boxShadow: "0 1px 3px rgba(0,0,0,.07)", padding: "16px 20px" }}>
      <div style={{ fontWeight: 700, fontSize: "15px", color: "#1e293b" }}>¿Cuánto cuesta la transferencia?</div>
      <div style={{ fontSize: "12.5px", color: "#64748b", marginTop: "2px" }}>
        Estimado para este vehículo según la provincia donde lo registres. Normalmente lo paga el comprador.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
        {rows.map((r) => {
          const here = loc.includes(r.label.toLowerCase());
          return (
            <div
              key={r.key}
              style={{
                border: `1px solid ${here ? "#bfdbfe" : "#e2e8f0"}`,
                background: here ? "#eff6ff" : "#fff",
                borderRadius: "8px",
                padding: "10px 12px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px" }}>
                <span style={{ fontWeight: 700, fontSize: "14px", color: "#1e293b" }}>
                  {r.label}
                  {here && <span style={{ fontSize: "12px", fontWeight: 600, color: "#2563eb", marginLeft: "6px" }}>donde está el vehículo</span>}
                </span>
                <span style={{ fontWeight: 800, fontSize: "15px", color: "#0f172a", whiteSpace: "nowrap" }}>{ars(r.total)}</span>
              </div>
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "3px" }}>
                Registro {ars(r.registry)} + sellos {ars(r.stamps)} · {r.note}
              </div>
            </div>
          );
        })}
      </div>

      <p style={{ fontSize: "12px", color: "#94a3b8", margin: "10px 0 0", lineHeight: 1.5 }}>
        Calculado sobre el precio publicado{isUsd ? `, pasado a pesos con el ${dolarQuoteLabel(dolarVenta!, dolarFecha)}` : ""}. El Registro y la provincia cobran
        sobre el mayor entre ese precio y la{" "}
        <a href="https://www.dnrpa.gov.ar/valuacion/cons_valuacion.php" target="_blank" rel="noopener noreferrer" style={{ color: "#64748b" }}>
          valuación oficial
        </a>
        , así que puede ser algo más. No incluye formularios, verificación policial ni gestoría. Alícuotas vigentes a {TRANSFER_RATES_AS_OF}.{" "}
        <Link href="/costo-transferencia" style={{ color: "#2563eb" }}>Más detalles</Link>
      </p>
    </div>
  );
}
