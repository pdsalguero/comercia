import { ArrowLeftRight, CreditCard } from "lucide-react";

// Sellos de condiciones de venta en las tarjetas: el vendedor marcó "Acepta permuta" y/o
// "Financiamiento" al publicar (attributes.accepts_trade / attributes.financing).
// Mismo dato que filtran ?permuta=1 y ?financia=1 en /category/vehicles.
export function SaleTermsBadges({ attributes }: { attributes?: Record<string, unknown> | null }) {
  const trade = !!attributes?.accepts_trade;
  const financing = !!attributes?.financing;
  if (!trade && !financing) return null;

  const pill: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: "3px",
    borderRadius: "999px", padding: "1px 7px",
    fontSize: "12px", fontWeight: 600, lineHeight: 1.5, whiteSpace: "nowrap",
  };
  return (
    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
      {trade && (
        <span style={{ ...pill, background: "#f5f3ff", color: "#6d28d9" }}>
          <ArrowLeftRight size={11} strokeWidth={2.4} aria-hidden="true" />
          Permuta
        </span>
      )}
      {financing && (
        <span style={{ ...pill, background: "#ecfeff", color: "#0e7490" }}>
          <CreditCard size={11} strokeWidth={2.4} aria-hidden="true" />
          Financia
        </span>
      )}
    </div>
  );
}
