export interface PriceChange {
  old_price: number | null;
  new_price: number | null;
  old_currency: string | null;
  new_currency: string | null;
  changed_at: string;
}

const symbol = (c: string | null) => (c === "USD" ? "U$D" : "$");

function daysAgo(dateStr: string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
  if (days <= 0) return "hoy";
  if (days === 1) return "ayer";
  return `hace ${days} días`;
}

function describe(ch: PriceChange) {
  const sameCurrency = ch.old_currency === ch.new_currency;
  if (!sameCurrency || ch.old_price == null || ch.new_price == null || ch.old_price === 0) {
    return { tone: "neutral" as const, text: "Cambió el precio" };
  }
  const diff = Number(ch.new_price) - Number(ch.old_price);
  const pct = Math.round((Math.abs(diff) / Number(ch.old_price)) * 100);
  const amount = `${symbol(ch.new_currency)} ${Math.abs(diff).toLocaleString("es-AR")}`;
  return diff < 0
    ? { tone: "down" as const, text: `Bajó ${amount}${pct > 0 ? ` (−${pct}%)` : ""}` }
    : { tone: "up" as const, text: `Subió ${amount}${pct > 0 ? ` (+${pct}%)` : ""}` };
}

const TONE_COLOR = { down: "#15803d", up: "#64748b", neutral: "#64748b" } as const;

// Último cambio de precio del aviso, con el historial completo desplegable si hubo varios.
// Le sirve al comprador para negociar: un aviso que ya bajó dos veces tiene otro margen.
export function PriceHistory({ changes }: { changes: PriceChange[] }) {
  if (changes.length === 0) return null;
  const last = describe(changes[0]);

  return (
    <div style={{ marginTop: "8px", fontSize: "12.5px" }}>
      <div style={{ color: TONE_COLOR[last.tone], fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
        {last.tone === "down" && <span aria-hidden="true">↓</span>}
        {last.tone === "up" && <span aria-hidden="true">↑</span>}
        {last.text} · {daysAgo(changes[0].changed_at)}
      </div>
      {changes.length > 1 && (
        <details style={{ marginTop: "4px", color: "#64748b" }}>
          <summary style={{ cursor: "pointer", fontSize: "12px" }}>
            Ver historial ({changes.length} cambios)
          </summary>
          <ul style={{ margin: "6px 0 0", paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "3px" }}>
            {changes.map((ch) => (
              <li key={ch.changed_at}>
                {new Date(ch.changed_at).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}:{" "}
                {ch.old_price != null ? `${symbol(ch.old_currency)} ${Number(ch.old_price).toLocaleString("es-AR")}` : "a consultar"}
                {" → "}
                {ch.new_price != null ? `${symbol(ch.new_currency)} ${Number(ch.new_price).toLocaleString("es-AR")}` : "a consultar"}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
