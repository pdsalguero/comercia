"use client";
import { useRouter } from "next/navigation";

export interface ProvinceOption {
  value: string;
  label: string;
}

interface Props {
  /** Available province options (value = slug key, label = display name) */
  options: ProvinceOption[];
  /** Current selected province slug from URL */
  value?: string;
  /** URL param to set (e.g. "v_province") */
  paramName: string;
  /** Optional: param to clear when province changes (e.g. "v_zone") */
  clearParam?: string;
  /** Page path, e.g. "/category/vehicles" */
  basePath: string;
  /** Serialized URLSearchParams string without province/zone params */
  baseSearch: string;
}

export function ProvinceSelectNav({ options, value, paramName, clearParam, basePath, baseSearch }: Props) {
  const router = useRouter();

  function handleChange(province: string) {
    const sp = new URLSearchParams(baseSearch);
    sp.delete(paramName);
    if (clearParam) sp.delete(clearParam);
    if (province) sp.set(paramName, province);
    const qs = sp.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  const activeLabel = options.find(o => o.value === value)?.label;

  return (
    <div style={{ position: "relative", flexShrink: 0, display: "flex", alignItems: "center" }}>
      {/* Pin icon */}
      <div style={{
        position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)",
        pointerEvents: "none", zIndex: 1,
        color: value ? "#2563eb" : "#94a3b8",
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>

      <select
        value={value ?? ""}
        onChange={e => handleChange(e.target.value)}
        style={{
          appearance: "none",
          WebkitAppearance: "none",
          border: `1.5px solid ${value ? "#bfdbfe" : "#e2e8f0"}`,
          borderRadius: "8px",
          padding: "0 26px 0 30px",
          height: "38px",
          fontSize: "13px",
          fontWeight: 600,
          color: value ? "#1e40af" : "#64748b",
          background: value ? "#eff6ff" : "#fff",
          cursor: "pointer",
          outline: "none",
          fontFamily: "inherit",
          minWidth: "120px",
          maxWidth: "155px",
        }}
      >
        <option value="">Todo el país</option>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Chevron */}
      <div style={{
        position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)",
        pointerEvents: "none", color: "#94a3b8",
      }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
    </div>
  );
}
