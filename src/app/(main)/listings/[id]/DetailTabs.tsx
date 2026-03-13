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
        <div style={{ padding: "20px 24px", borderBottom: (specRows.length > 0 || boolTags.length > 0) ? "1px solid #f1f5f9" : "none" }}>
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
          <div style={{ padding: "16px 24px 8px", fontSize: "14px", fontWeight: 700, color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.4px" }}>
            {tabLabel}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
            {specRows.map(([label, value], i) => (
              <div key={label} style={{
                padding: "14px 18px",
                borderBottom: "1px solid #f1f5f9",
                borderRight: (i + 1) % 3 !== 0 ? "1px solid #f1f5f9" : "none",
              }}>
                <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>
                  {label}
                </div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#1e293b", textTransform: "capitalize" }}>
                  {String(value).replace(/_/g, " ")}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Bool tags */}
      {boolTags.length > 0 && (
        <div style={{ padding: "16px 18px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
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
