"use client";

import { useListingsView } from "./ListingsViewContext";

function GridIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? "#0f172a" : "#94a3b8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  );
}

function ListIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? "#0f172a" : "#94a3b8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  );
}

export function ViewToggle() {
  const { view, setView } = useListingsView();

  const btnStyle = (active: boolean): React.CSSProperties => ({
    display: "flex", alignItems: "center", justifyContent: "center",
    width: "32px", height: "32px", borderRadius: "6px", border: "none",
    background: active ? "#f1f5f9" : "transparent",
    cursor: "pointer", padding: 0, flexShrink: 0,
  });

  return (
    <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
      <button style={btnStyle(view === "grid")} onClick={() => setView("grid")} title="Vista grilla">
        <GridIcon active={view === "grid"} />
      </button>
      <button style={btnStyle(view === "list")} onClick={() => setView("list")} title="Vista lista">
        <ListIcon active={view === "list"} />
      </button>
    </div>
  );
}
