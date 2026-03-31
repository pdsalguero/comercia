import type React from "react";

const SPEC_ICONS: Record<string, React.ReactNode> = {
  "Marca": (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M12 8l4 4-4 4-4-4 4-4z"/>
    </svg>
  ),
  "Modelo": (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  ),
  "Versión": (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  "Año": (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  "Kilometraje": (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="12" x2="15" y2="15"/>
    </svg>
  ),
  "Combustible": (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="22" x2="15" y2="22"/><line x1="4" y1="9" x2="14" y2="9"/><path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"/><path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2 2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"/>
    </svg>
  ),
  "Transmisión": (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="12" cy="5" r="2"/><path d="M5 14v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2"/><line x1="12" y1="7" x2="12" y2="10"/>
    </svg>
  ),
  "Color": (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
    </svg>
  ),
  "Motor": (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  ),
};

const DEFAULT_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r=".5" fill="currentColor"/>
  </svg>
);

interface Props {
  description: string | null;
  specRows: [string, string][];
  boolTags: string[];
  tabLabel: string;
}

export function DetailTabs({ description, specRows, boolTags, tabLabel }: Props) {
  return (
    <div style={{ background: "#fff", borderRadius: "10px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,.07)" }}>

      {/* Description */}
      {description && (
        <div style={{ padding: "14px 16px", borderBottom: (specRows.length > 0 || boolTags.length > 0) ? "1px solid #f1f5f9" : "none" }}>
          <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#1e293b", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.4px" }}>
            Descripción
          </h2>
          <p style={{ fontSize: "14px", color: "#374151", lineHeight: 1.75, margin: 0, whiteSpace: "pre-line" }}>
            {description}
          </p>
        </div>
      )}

      {/* Specs grid */}
      {specRows.length > 0 && (
        <>
          <div style={{ padding: "12px 16px 8px", fontSize: "13px", fontWeight: 700, color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.4px" }}>
            {tabLabel}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
            {specRows.map(([label, value], i) => (
              <div key={label} style={{
                padding: "10px 16px",
                borderBottom: "1px solid #f1f5f9",
                borderRight: (i + 1) % 3 !== 0 ? "1px solid #f1f5f9" : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "3px", color: "#94a3b8" }}>
                  {SPEC_ICONS[label] ?? DEFAULT_ICON}
                  <span style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 700, color: "#94a3b8" }}>
                    {label}
                  </span>
                </div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", textTransform: "capitalize" }}>
                  {String(value).replace(/_/g, " ")}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Bool tags */}
      {boolTags.length > 0 && (
        <div style={{ padding: "10px 14px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {boolTags.map(label => (
            <span key={label} style={{
              background: "#f0fdf4", color: "#16a34a",
              border: "1px solid #bbf7d0", borderRadius: "20px",
              padding: "5px 14px", fontSize: "13px", fontWeight: 600,
            }}>
              ✓ {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
