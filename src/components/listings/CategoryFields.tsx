"use client";

import { getCategoryConfig, CategoryField } from "@/lib/category-config";

interface CategoryFieldsProps {
  categoryId: number;
  attributes: Record<string, any>;
  onChange: (key: string, value: any) => void;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid #ddd",
  borderRadius: "6px",
  padding: "9px 12px",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
  background: "#fff",
  color: "#0f172a",
};

const labelStyle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 700,
  color: "#374151",
  display: "block",
  marginBottom: "5px",
};

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: CategoryField;
  value: any;
  onChange: (val: any) => void;
}) {
  switch (field.type) {
    case "select": {
      const hasGroups = field.options?.some((o) => o.group);
      const grouped: { group: string; options: typeof field.options }[] = [];
      if (hasGroups && field.options) {
        for (const o of field.options) {
          const g = o.group ?? "";
          const last = grouped[grouped.length - 1];
          if (last && last.group === g) last.options!.push(o);
          else grouped.push({ group: g, options: [o] });
        }
      }
      return (
        <div style={{ position: "relative" }}>
          <select
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            style={{ ...inputStyle, appearance: "none", paddingRight: "32px" }}
          >
            <option value="">Seleccionar...</option>
            {hasGroups
              ? grouped.map((g) =>
                  g.group ? (
                    <optgroup key={g.group} label={g.group}>
                      {g.options?.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </optgroup>
                  ) : (
                    g.options?.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))
                  )
                )
              : field.options?.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))
            }
          </select>
          <span
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8",
              pointerEvents: "none",
            }}
          >
            ▾
          </span>
        </div>
      );
    }

    case "number":
      return (
        <div style={{ position: "relative" }}>
          <input
            type="number"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            style={{
              ...inputStyle,
              paddingRight: field.unit ? "48px" : "12px",
            }}
          />
          {field.unit && (
            <span
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "12px",
                color: "#94a3b8",
                fontWeight: 600,
              }}
            >
              {field.unit}
            </span>
          )}
        </div>
      );

    case "text":
      return (
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          style={inputStyle}
        />
      );

    case "checkbox":
      return (
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            cursor: "pointer",
            padding: "2px 0",
          }}
        >
          <div
            style={{
              width: "20px",
              height: "20px",
              flexShrink: 0,
              border: `2px solid ${value ? "#6366f1" : "#d1d5db"}`,
              borderRadius: "5px",
              background: value ? "#6366f1" : "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onClick={() => onChange(!value)}
          >
            {value && (
              <span
                style={{ color: "#fff", fontSize: "12px", fontWeight: 900 }}
              >
                ✓
              </span>
            )}
          </div>
          <span style={{ fontSize: "14px", color: "#374151" }}>
            {field.label}
          </span>
          {field.hint && (
            <span style={{ fontSize: "11px", color: "#94a3b8" }}>
              ({field.hint})
            </span>
          )}
        </label>
      );

    case "radio":
      return (
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {field.options?.map((o) => (
            <label
              key={o.value}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                padding: "7px 14px",
                border: `2px solid ${value === o.value ? "#6366f1" : "#e2e8f0"}`,
                borderRadius: "8px",
                background: value === o.value ? "#f0f4ff" : "#fff",
                fontSize: "13px",
                fontWeight: value === o.value ? 700 : 400,
                color: value === o.value ? "#6366f1" : "#374151",
                transition: "all 0.15s",
              }}
              onClick={() => onChange(o.value)}
            >
              <div
                style={{
                  width: "14px",
                  height: "14px",
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
      );

    default:
      return null;
  }
}

export function CategoryFields({
  categoryId,
  attributes,
  onChange,
}: CategoryFieldsProps) {
  const config = getCategoryConfig(categoryId);
  if (!config || config.fields.length === 0) return null;

  // Separate checkbox fields from the rest for layout purposes
  const checkboxFields = config.fields.filter((f) => f.type === "checkbox");
  const otherFields = config.fields.filter((f) => f.type !== "checkbox");

  return (
    <div style={{ background: "#fff", borderRadius: "10px", padding: "20px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "16px",
          paddingBottom: "12px",
          borderBottom: "1px solid #f1f5f9",
        }}
      >
        <span style={{ fontSize: "18px" }}>{config.icon}</span>
        <div>
          <div style={{ fontWeight: 800, fontSize: "14px", color: "#0f172a" }}>
            Datos de {config.name}
          </div>
          <div style={{ fontSize: "12px", color: "#94a3b8" }}>
            Completá los detalles para que más personas encuentren tu aviso
          </div>
        </div>
      </div>

      {/* Main fields — 2 columns */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "14px",
          marginBottom: checkboxFields.length ? "16px" : "0",
        }}
      >
        {otherFields.map((field) => (
          <div
            key={field.key}
            style={{
              gridColumn: field.type === "radio" ? "span 2" : "span 1",
            }}
          >
            {field.type !== "checkbox" && (
              <label style={labelStyle}>
                {field.label}
                {field.required && (
                  <span style={{ color: "#ef4444", marginLeft: "2px" }}>*</span>
                )}
              </label>
            )}
            <FieldInput
              field={field}
              value={attributes[field.key]}
              onChange={(val) => onChange(field.key, val)}
            />
          </div>
        ))}
      </div>

      {/* Checkbox fields — 2 columns */}
      {checkboxFields.length > 0 && (
        <div>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#94a3b8",
              marginBottom: "10px",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
            }}
          >
            Características adicionales
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
            }}
          >
            {checkboxFields.map((field) => (
              <FieldInput
                key={field.key}
                field={field}
                value={attributes[field.key]}
                onChange={(val) => onChange(field.key, val)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
