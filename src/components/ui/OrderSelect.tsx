"use client";

interface Props {
  value: string;
  action: string;
  hiddenFields: Record<string, string>;
}

export function OrderSelect({ value, action, hiddenFields }: Props) {
  return (
    <form method="GET" action={action} style={{ flexShrink: 0 }}>
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
        <option value="">Más recientes</option>
        <option value="views">Más vistas</option>
        <option value="price_asc">Menor precio</option>
        <option value="price_desc">Mayor precio</option>
      </select>
    </form>
  );
}
