"use client";

import { useEffect, useState } from "react";

// Barra fija de abajo (precio + contactar) de la ficha en celular: aparece recién cuando los botones de
// contacto de la tarjeta principal (`targetId`) quedaron arriba, fuera de la pantalla. Antes estaba
// siempre visible y se veía duplicada con el precio y los botones de la tarjeta.
export function RevealOnScrollBar({
  targetId,
  className,
  style,
  children,
}: {
  targetId: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) { setShow(true); return; }
    const io = new IntersectionObserver(([entry]) => {
      // Solo cuando ya pasó hacia arriba; si todavía está abajo (no se llegó), no hace falta la barra
      setShow(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    io.observe(target);
    return () => io.disconnect();
  }, [targetId]);

  return (
    <div
      className={className}
      aria-hidden={!show}
      inert={!show}
      style={{
        ...style,
        transform: show ? "translateY(0)" : "translateY(110%)",
        transition: "transform 0.2s ease",
        pointerEvents: show ? "auto" : "none",
      }}
    >
      {children}
    </div>
  );
}
