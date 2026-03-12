"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export function PublishFAB() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();

  // Show FAB after scrolling 200px (no point showing it when hero CTA is visible)
  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 200);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Hide on the new listing page (user already has the publish button there)
  if (pathname === "/listings/new") return null;

  return (
    <Link href="/listings/new" style={{ textDecoration: "none" }}>
      <div
        style={{
          position: "fixed",
          bottom: "28px",
          right: "28px",
          zIndex: 200,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: "linear-gradient(135deg, #f97316, #fb923c)",
          color: "#fff",
          borderRadius: "50px",
          padding: "13px 20px",
          boxShadow: "0 6px 24px rgba(249,115,22,0.45)",
          fontWeight: 800,
          fontSize: "14px",
          cursor: "pointer",
          transition: "opacity 0.2s, transform 0.2s",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(12px)",
          pointerEvents: visible ? "auto" : "none",
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ fontSize: "18px", lineHeight: 1 }}>📸</span>
        <div>
          <div style={{ fontSize: "13px", fontWeight: 900, lineHeight: 1.1 }}>Publicar con IA</div>
          <div style={{ fontSize: "10px", fontWeight: 600, opacity: 0.8 }}>Gratis · 30 segundos</div>
        </div>
      </div>
    </Link>
  );
}
