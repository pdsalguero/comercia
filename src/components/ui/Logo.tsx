interface LogoProps {
  height?: number;
  /** "full" = icon + text, "icon" = icon only, "text" = text only */
  variant?: "full" | "icon" | "text";
  /** Force dark/light text color (only affects text variant color override) */
  textColor?: string;
}

export function Logo({ height = 32, variant = "full", textColor }: LogoProps) {
  const iconSize = height;
  const fontSize = height * 0.72;

  if (variant === "icon") {
    return <LogoIcon size={iconSize} />;
  }

  if (variant === "text") {
    return (
      <span style={{
        fontFamily: "inherit",
        fontWeight: 900,
        fontSize: `${fontSize}px`,
        letterSpacing: "-0.5px",
        lineHeight: 1,
        color: textColor ?? "#f97316",
      }}>
        Comerx<span style={{ color: "#3b82f6" }}>IA</span>
      </span>
    );
  }

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: `${height * 0.28}px` }}>
      <LogoIcon size={iconSize} />
      <span style={{
        fontFamily: "inherit",
        fontWeight: 900,
        fontSize: `${fontSize}px`,
        letterSpacing: "-0.5px",
        lineHeight: 1,
        color: textColor ?? "#f97316",
      }}>
        Comerx<span style={{ color: "#3b82f6" }}>IA</span>
      </span>
    </span>
  );
}

function LogoIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Open arc circle (gap at top-right) */}
      <path
        d="M 72 18 A 38 38 0 1 1 18 72"
        stroke="#f97316"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
      {/* Checkmark */}
      <polyline
        points="24,52 40,68 70,36"
        stroke="#f97316"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
