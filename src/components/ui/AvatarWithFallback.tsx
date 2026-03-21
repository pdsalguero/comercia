"use client";

import { useState } from "react";

interface Props {
  src: string | null | undefined;
  name: string;
  size?: number;
  rounded?: "full" | "lg";
}

export function AvatarWithFallback({ src, name, size = 44, rounded = "full" }: Props) {
  const [failed, setFailed] = useState(false);
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  const radius = rounded === "lg" ? `${size * 0.23}px` : "50%";

  return (
    <div style={{
      width: size, height: size, borderRadius: radius, flexShrink: 0,
      background: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.34, fontWeight: 700, color: "#4f46e5",
      overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,.1)",
    }}>
      {src && !failed ? (
        <img
          src={src}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={() => setFailed(true)}
        />
      ) : (
        initials || "?"
      )}
    </div>
  );
}
