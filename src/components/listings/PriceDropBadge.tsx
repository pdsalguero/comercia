import { TrendingDown } from "lucide-react";
import { PRICE_DROP_WINDOW_DAYS } from "@/lib/price-drops";

// Distintivo junto al precio de las tarjetas: el aviso bajó de precio hace poco.
export function PriceDropBadge({ pct, size = "sm" }: { pct: number; size?: "sm" | "md" }) {
  const label = `Bajó ${pct}% de precio en los últimos ${PRICE_DROP_WINDOW_DAYS} días`;
  return (
    <span
      title={label}
      aria-label={label}
      style={{
        display: "inline-flex", alignItems: "center", gap: "3px", flexShrink: 0,
        background: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0",
        borderRadius: "999px", padding: size === "md" ? "2px 8px" : "1px 6px",
        fontSize: size === "md" ? "13px" : "12px", fontWeight: 700, letterSpacing: 0, lineHeight: 1.4,
      }}
    >
      <TrendingDown size={size === "md" ? 13 : 12} strokeWidth={2.5} aria-hidden="true" />
      −{pct}%
    </span>
  );
}
