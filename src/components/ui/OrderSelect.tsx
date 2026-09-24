"use client";

export interface OrderOption {
  value: string;
  label: string;
}

// Set chico y seguro — lo que ya soportan los backends de seller/[userId] y tienda/[slug]
// (view_count/km/año/marca-modelo no están implementados ahí). category/[slug] (la página de
// vehículos) pasa su propio `options` más completo — ver el uso ahí.
const DEFAULT_OPTIONS: OrderOption[] = [
  { value: "", label: "Más recientes" },
  { value: "views", label: "Más vistas" },
  { value: "price_asc", label: "Menor precio" },
  { value: "price_desc", label: "Mayor precio" },
];

interface Props {
  value: string;
  action: string;
  hiddenFields: Record<string, string>;
  className?: string;
  options?: OrderOption[];
}

export function OrderSelect({ value, action, hiddenFields, className, options = DEFAULT_OPTIONS }: Props) {
  return (
    <form method="GET" action={action} className={className} style={{ flexShrink: 0 }}>
      {Object.entries(hiddenFields).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <select
        name="order"
        defaultValue={value}
        onChange={(e) => (e.target.form as HTMLFormElement).submit()}
        style={{
          border: "1.5px solid #e2e8f0", borderRadius: "8px",
          padding: "9px 10px", fontSize: "13px", color: "#334155",
          background: "#fff", cursor: "pointer", outline: "none",
          fontFamily: "inherit",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </form>
  );
}
