"use client";

import { useMemo } from "react";
import {
  CAR_BRANDS,
  MOTO_BRANDS,
} from "@/lib/vehicle-data";
import { CUATRI_BRANDS_LIST, UTV_BRANDS_LIST, getModelosMotoByTipo } from "@/data/modelos-motos";
import { getModelosPorMarca } from "@/data/modelos-vehiculos";

// ─── Shared styles (mirror page.tsx) ─────────────────────────
const inp: React.CSSProperties = {
  width: "100%",
  border: "1.5px solid #e2e8f0",
  borderRadius: "8px",
  padding: "9px 12px",
  fontSize: "14px",
  outline: "none",
  background: "#fff",
  color: "#0f172a",
  boxSizing: "border-box",
  fontFamily: "inherit",
  transition: "border-color 0.15s",
};
const lbl: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 700,
  color: "#64748b",
  display: "block",
  marginBottom: "5px",
  textTransform: "uppercase",
  letterSpacing: "0.4px",
};
const sel: React.CSSProperties = {
  ...inp,
  appearance: "none",
  paddingRight: "32px",
  cursor: "pointer",
};

function Sel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: "relative" }}>
      {children}
      <span
        style={{
          position: "absolute",
          right: "10px",
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
          color: "#94a3b8",
          fontSize: "11px",
        }}
      >
        ▾
      </span>
    </div>
  );
}

function F({
  label,
  required,
  children,
  span2,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  span2?: boolean;
}) {
  return (
    <div style={{ gridColumn: span2 ? "span 2" : "span 1" }}>
      <label style={lbl}>
        {label}
        {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function Checkbox({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
      <div
        onClick={() => onChange(!value)}
        style={{
          width: "18px",
          height: "18px",
          flexShrink: 0,
          borderRadius: "4px",
          border: `2px solid ${value ? "#6366f1" : "#d1d5db"}`,
          background: value ? "#6366f1" : "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        {value && (
          <span style={{ color: "#fff", fontSize: "11px", fontWeight: 900 }}>✓</span>
        )}
      </div>
      <span style={{ fontSize: "13px", color: "#374151" }}>{label}</span>
    </label>
  );
}

function RadioGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ gridColumn: "span 2" }}>
      <div style={lbl}>{label}</div>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {options.map((o) => (
          <label
            key={o.value}
            onClick={() => onChange(o.value)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              padding: "7px 12px",
              borderRadius: "7px",
              border: `1.5px solid ${value === o.value ? "#6366f1" : "#e2e8f0"}`,
              background: value === o.value ? "#f0f4ff" : "#fff",
              fontSize: "13px",
              fontWeight: value === o.value ? 700 : 400,
              color: value === o.value ? "#6366f1" : "#374151",
            }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                border: `2px solid ${value === o.value ? "#6366f1" : "#d1d5db"}`,
                background: value === o.value ? "#6366f1" : "#fff",
                flexShrink: 0,
              }}
            />
            {o.label}
          </label>
        ))}
      </div>
    </div>
  );
}

// ─── Year options ─────────────────────────────────────────────
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1949 }, (_, i) =>
  String(CURRENT_YEAR - i),
);

// ─── Sub-category options ─────────────────────────────────────
const SUB_CATS = [
  { value: "auto", label: "Auto" },
  { value: "camioneta", label: "Pickup / SUV / Utilitario" },
  { value: "moto",        label: "Moto" },
  { value: "cuatriciclo", label: "Cuatriciclo" },
  { value: "utv",         label: "Areneros" },
  { value: "camion", label: "Camión" },
  { value: "nautica", label: "Náutica" },
  { value: "plan-ahorro", label: "Plan de Ahorro" },
  { value: "otro", label: "Otro" },
];

const FUEL_OPTS = [
  { value: "nafta", label: "Nafta" },
  { value: "diesel", label: "Diesel" },
  { value: "gnc", label: "GNC" },
  { value: "glp", label: "GLP" },
  { value: "electrico", label: "Eléctrico" },
  { value: "hibrido", label: "Híbrido" },
];

const TRANSMISSION_OPTS = [
  { value: "manual", label: "Manual" },
  { value: "automatica", label: "Automática" },
  { value: "cvt", label: "CVT" },
];

const DOORS_OPTS = [
  { value: "2", label: "2 puertas" },
  { value: "3", label: "3 puertas" },
  { value: "4", label: "4 puertas" },
  { value: "5", label: "5 puertas" },
];

// ─── Main component ───────────────────────────────────────────
interface VehicleFieldsProps {
  subCategory: string;
  attributes: Record<string, string | boolean | undefined>;
  onChange: (key: string, value: string | boolean) => void;
}

export function VehicleFields({ subCategory, attributes, onChange }: VehicleFieldsProps) {
  const isMoto = subCategory === "moto";
  const isCuatri = subCategory === "cuatriciclo";
  const isUTV = subCategory === "utv";
  const isMotoType = isMoto || isCuatri || isUTV;

  const brandList = isMoto ? MOTO_BRANDS : isCuatri ? CUATRI_BRANDS_LIST : isUTV ? UTV_BRANDS_LIST : CAR_BRANDS;

  const models = useMemo(() => {
    const brand = attributes.brand as string | undefined;
    if (!brand) return [];
    if (isMotoType) return getModelosMotoByTipo(brand, subCategory as "moto" | "cuatriciclo" | "utv");
    const tipo = subCategory === "camioneta" ? "camioneta" : "auto";
    return getModelosPorMarca(brand, tipo);
  }, [attributes.brand, isMotoType, subCategory]);

  const showDoors = !isMotoType && subCategory !== "camion" && subCategory !== "nautica";
  const showFuel = subCategory !== "nautica" && subCategory !== "plan-ahorro";
  const showKm = subCategory !== "plan-ahorro";

  return (
    <>
      {/* Tipo de vehículo */}
      <F label="Tipo de vehículo" required>
        <Sel>
          <select
            value={subCategory}
            onChange={(e) => onChange("sub_category", e.target.value)}
            style={sel}
          >
            {SUB_CATS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Sel>
      </F>

      {/* Marca */}
      <F label="Marca" required>
        <Sel>
          <select
            value={(attributes.brand as string) ?? ""}
            onChange={(e) => {
              onChange("brand", e.target.value);
              onChange("model", ""); // reset model on brand change
            }}
            style={sel}
          >
            <option value="">Seleccionar marca...</option>
            {brandList.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </Sel>
      </F>

      {/* Modelo */}
      <F label="Modelo" required>
        {models.length > 0 ? (
          <Sel>
            <select
              value={(attributes.model as string) ?? ""}
              onChange={(e) => onChange("model", e.target.value)}
              style={sel}
            >
              <option value="">Seleccionar modelo...</option>
              {models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
              <option value="otro">Otro</option>
            </select>
          </Sel>
        ) : (
          <input
            type="text"
            value={(attributes.model as string) ?? ""}
            onChange={(e) => onChange("model", e.target.value)}
            placeholder="Ej: Hilux, Gol, Corolla..."
            style={inp}
          />
        )}
      </F>

      {/* Año */}
      <F label="Año" required>
        <Sel>
          <select
            value={(attributes.year as string) ?? ""}
            onChange={(e) => onChange("year", e.target.value)}
            style={sel}
          >
            <option value="">Seleccionar año...</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </Sel>
      </F>

      {/* Kilómetros */}
      {showKm && (
        <F label="Kilómetros" required>
          <div style={{ position: "relative" }}>
            <input
              type="number"
              value={(attributes.km as string) ?? ""}
              onChange={(e) => onChange("km", e.target.value)}
              placeholder="Ej: 50000"
              style={{ ...inp, paddingRight: "44px" }}
              min={0}
            />
            <span
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "11px",
                color: "#94a3b8",
                fontWeight: 700,
              }}
            >
              km
            </span>
          </div>
        </F>
      )}

      {/* Combustible */}
      {showFuel && (
        <F label="Combustible" required>
          <Sel>
            <select
              value={(attributes.fuel as string) ?? ""}
              onChange={(e) => onChange("fuel", e.target.value)}
              style={sel}
            >
              <option value="">Seleccionar...</option>
              {FUEL_OPTS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Sel>
        </F>
      )}

      {/* Transmisión */}
      {!isMotoType && (
        <F label="Transmisión">
          <Sel>
            <select
              value={(attributes.transmission as string) ?? ""}
              onChange={(e) => onChange("transmission", e.target.value)}
              style={sel}
            >
              <option value="">Seleccionar...</option>
              {TRANSMISSION_OPTS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Sel>
        </F>
      )}

      {/* Puertas */}
      {showDoors && (
        <F label="Puertas">
          <Sel>
            <select
              value={(attributes.doors as string) ?? ""}
              onChange={(e) => onChange("doors", e.target.value)}
              style={sel}
            >
              <option value="">Seleccionar...</option>
              {DOORS_OPTS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Sel>
        </F>
      )}

      {/* Color */}
      <F label="Color">
        <input
          type="text"
          value={(attributes.color as string) ?? ""}
          onChange={(e) => onChange("color", e.target.value)}
          placeholder="Blanco, Negro, Rojo..."
          style={inp}
        />
      </F>

      {/* Checkboxes */}
      <div
        style={{
          gridColumn: "span 2",
          borderTop: "1px solid #f1f5f9",
          paddingTop: "12px",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: "#94a3b8",
            marginBottom: "10px",
            textTransform: "uppercase",
            letterSpacing: "0.4px",
          }}
        >
          Características
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          <Checkbox
            label="Primera mano (único dueño)"
            value={!!attributes.first_owner}
            onChange={(v) => onChange("first_owner", v)}
          />
          <Checkbox
            label="Acepta permuta"
            value={!!attributes.accepts_trade}
            onChange={(v) => onChange("accepts_trade", v)}
          />
        </div>
      </div>

      {/* Vendedor */}
      <RadioGroup
        label="Vendedor"
        options={[
          { value: "particular", label: "Particular" },
          { value: "concesionaria", label: "Concesionaria" },
        ]}
        value={(attributes.seller_type as string) ?? "particular"}
        onChange={(v) => onChange("seller_type", v)}
      />
    </>
  );
}
