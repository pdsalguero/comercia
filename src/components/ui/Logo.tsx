interface LogoProps {
  /** Alto total del logo en píxeles. */
  height?: number;
  /** "full" = marca + nombre, "icon" = solo la marca, "text" = solo el nombre. */
  variant?: "full" | "icon" | "text";
  /** "light" pone el nombre en blanco, para fondos oscuros (ej. el pie). */
  tone?: "default" | "light";
}

// Marca (public/logo-mark.svg) + nombre en texto: liviano, nítido a cualquier tamaño y sin depender
// de un PNG. Los colores del nombre son los de la marca: azul y naranja.
export function Logo({ height = 32, variant = "full", tone = "default" }: LogoProps) {
  const iconSize = Math.round(height * 0.82);
  const fontSize = Math.round(height * 0.58 * 10) / 10;

  return (
    <span
      role="img"
      aria-label="CuyoRodados"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: `${Math.round(height * 0.2)}px`,
        height: `${height}px`,
        flexShrink: 0,
        lineHeight: 1,
      }}
    >
      {variant !== "text" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/logo-mark.svg" alt="" width={iconSize} height={iconSize} style={{ display: "block", flexShrink: 0 }} />
      )}
      {variant !== "icon" && (
        <span
          aria-hidden="true"
          style={{
            fontFamily: "var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            fontWeight: 800,
            fontSize: `${fontSize}px`,
            letterSpacing: "-0.03em",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ color: tone === "light" ? "#fff" : "#1d6fb8" }}>Cuyo</span>
          <span style={{ color: "#f28c1e" }}>Rodados</span>
        </span>
      )}
    </span>
  );
}
