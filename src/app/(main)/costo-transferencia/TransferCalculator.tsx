"use client";

import { useState } from "react";
import { estimateTransferCosts, type VehicleKind } from "@/lib/transfer-cost";

const ars = (n: number) => `$ ${n.toLocaleString("es-AR")}`;

const inputStyle: React.CSSProperties = {
  height: "44px", border: "1.5px solid #e2e8f0", borderRadius: "8px", padding: "0 12px",
  fontSize: "16px", fontFamily: "inherit", color: "#0f172a", background: "#fff", outline: "none",
};

function Toggle<T extends string>({ value, options, onChange }: { value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div style={{ display: "inline-flex", border: "1.5px solid #e2e8f0", borderRadius: "8px", overflow: "hidden", height: "44px" }}>
      {options.map(([v, label]) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          style={{
            border: "none", padding: "0 14px", fontSize: "14px", fontWeight: 600, fontFamily: "inherit", cursor: "pointer",
            background: value === v ? "#1d6fb8" : "#fff", color: value === v ? "#fff" : "#475569",
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function TransferCalculator({ dolarVenta }: { dolarVenta: number | null }) {
  const [raw, setRaw] = useState("15.000.000");
  const [currency, setCurrency] = useState<"ARS" | "USD">("ARS");
  const [kind, setKind] = useState<VehicleKind>("auto");

  const amount = Number(raw.replace(/\D/g, "")) || 0;
  const usdUnavailable = currency === "USD" && !dolarVenta;
  const priceArs = currency === "USD" ? amount * (dolarVenta ?? 0) : amount;
  const rows = amount > 0 && !usdUnavailable ? estimateTransferCosts(priceArs, kind) : [];

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "flex-end" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: "4px", flex: "1 1 200px" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>Precio del vehículo</span>
          <input
            inputMode="numeric"
            value={raw}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "");
              setRaw(digits ? Number(digits).toLocaleString("es-AR") : "");
            }}
            style={inputStyle}
            aria-label="Precio del vehículo"
          />
        </label>
        <Toggle value={currency} options={[["ARS", "Pesos"], ["USD", "Dólares"]]} onChange={setCurrency} />
        <Toggle value={kind} options={[["auto", "Auto / camioneta"], ["moto", "Moto"]]} onChange={setKind} />
      </div>

      {currency === "USD" && dolarVenta && (
        <div style={{ fontSize: "12px", color: "#64748b", marginTop: "6px" }}>
          Convertido con el dólar oficial: {ars(Math.round(dolarVenta))} ({ars(Math.round(priceArs))}).
        </div>
      )}
      {usdUnavailable && (
        <div style={{ fontSize: "13px", color: "#b45309", marginTop: "8px" }}>
          No pudimos obtener la cotización del dólar. Ingresá el precio en pesos.
        </div>
      )}

      {rows.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", marginTop: "18px" }}>
          {rows.map((r) => (
            <div key={r.key} style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px 16px", background: "#fff" }}>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#1e293b" }}>{r.label}</div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", margin: "4px 0 6px" }}>{ars(r.total)}</div>
              <div style={{ fontSize: "12.5px", color: "#64748b", lineHeight: 1.5 }}>
                Registro: {ars(r.registry)}<br />
                Sellos: {ars(r.stamps)}<br />
                <span style={{ color: "#94a3b8" }}>{r.note}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
