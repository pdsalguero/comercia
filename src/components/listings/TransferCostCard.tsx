import Link from "next/link";
import { estimateTransferCosts, TRANSFER_RATES_AS_OF, type TransferEstimate, type VehicleKind } from "@/lib/transfer-cost";
import { dolarQuoteLabel } from "@/lib/dolar-label";

interface Props {
  price: number;
  currency: string;
  kind: VehicleKind;
  /** Venta del dólar oficial; necesaria si el aviso está en USD. */
  dolarVenta?: number | null;
  /** Fecha de la cotización (dolarapi `fechaActualizacion`), para mostrarla junto al valor. */
  dolarFecha?: string | null;
  /** Provincias del aviso (claves de RE_LOCATIONS, ver provinceKeysOf). Con una de Cuyo se muestra solo
   *  esa y las otras quedan plegadas; con una de fuera de Cuyo no se muestra la tarjeta; sin datos
   *  (avisos viejos), las tres. */
  provinces?: string[];
}

const ars = (n: number) => `$ ${n.toLocaleString("es-AR")}`;

function CostRow({ r }: { r: TransferEstimate }) {
  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "10px 12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px" }}>
        <span style={{ fontWeight: 700, fontSize: "14px", color: "#1e293b" }}>{r.label}</span>
        <span style={{ fontWeight: 800, fontSize: "15px", color: "#0f172a", whiteSpace: "nowrap" }}>{ars(r.total)}</span>
      </div>
      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "3px" }}>
        Registro {ars(r.registry)} + sellos {ars(r.stamps)} · {r.note}
      </div>
    </div>
  );
}

// Costo estimado de transferir el vehículo del aviso: el de la provincia donde está publicado y, plegado,
// el de las otras de Cuyo (el vehículo se radica en el domicilio del comprador, que puede ser otra provincia).
export function TransferCostCard({ price, currency, kind, dolarVenta, dolarFecha, provinces = [] }: Props) {
  const isUsd = currency === "USD";
  if (isUsd && !dolarVenta) return null;
  const priceArs = isUsd ? price * dolarVenta! : price;
  const rows = estimateTransferCosts(priceArs, kind);
  const main = provinces.length ? rows.filter((r) => provinces.includes(r.key)) : rows;
  if (!main.length) return null; // publicado fuera de Cuyo: no tenemos esas alícuotas
  const others = rows.filter((r) => !main.includes(r));
  const where = provinces.length ? main.map((r) => r.label).join(" y ") : null;

  return (
    <div style={{ background: "#fff", borderRadius: "10px", boxShadow: "0 1px 3px rgba(0,0,0,.07)", padding: "16px 20px" }}>
      <div style={{ fontWeight: 700, fontSize: "15px", color: "#1e293b" }}>
        ¿Cuánto cuesta la transferencia{where ? ` en ${where}` : ""}?
      </div>
      <div style={{ fontSize: "12.5px", color: "#64748b", marginTop: "2px" }}>
        {where
          ? `Estimado para registrar este vehículo en ${where}, donde está publicado. Normalmente lo paga el comprador.`
          : "Estimado para este vehículo según la provincia donde lo registres. Normalmente lo paga el comprador."}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
        {main.map((r) => <CostRow key={r.key} r={r} />)}
      </div>

      {where && others.length > 0 && (
        <details style={{ marginTop: "10px" }}>
          <summary style={{ fontSize: "13px", fontWeight: 600, color: "#2563eb", cursor: "pointer" }}>
            ¿Vivís en {others.map((r) => r.label).join(" o ")}? Ver el costo ahí
          </summary>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
            {others.map((r) => <CostRow key={r.key} r={r} />)}
          </div>
        </details>
      )}

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
