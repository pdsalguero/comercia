interface LogoProps {
  height?: number;
  variant?: "full" | "icon" | "text";
  textColor?: string;
}

export function Logo({ height = 32 }: LogoProps) {
  return (
    <img
      src="/logo.png"
      alt="ComerxIA"
      style={{
        width: "auto",
        height: `${height}px`,
        flexShrink: 0,
        objectFit: "contain",
        display: "block",
        verticalAlign: "middle",
      }}
    />
  );
}
