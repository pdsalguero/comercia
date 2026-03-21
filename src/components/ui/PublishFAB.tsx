"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export function PublishFAB() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const mobile = window.innerWidth <= 768;
    setIsMobile(mobile);
    if (!mobile) {
      function onScroll() { setScrolled(window.scrollY > 200); }
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }
  }, []);

  if (pathname === "/listings/new") return null;

  const visible = isMobile || scrolled;

  if (isMobile) {
    return (
      <Link href="/listings/new" style={{ textDecoration: "none" }}>
        <div style={{
          position: "fixed",
          bottom: "16px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 200,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "linear-gradient(135deg, #f97316, #fb923c)",
          color: "#fff",
          borderRadius: "50px",
          padding: "12px 24px",
          boxShadow: "0 6px 20px rgba(249,115,22,0.5)",
          fontWeight: 800,
          fontSize: "14px",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}>
          <span style={{ fontSize: "16px" }}>📸</span>
          Publicar aviso — Gratis
        </div>
      </Link>
    );
  }

  return (
    <Link href="/listings/new" style={{ textDecoration: "none" }}>
      <div style={{
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
      }}>
        <span style={{ fontSize: "18px", lineHeight: 1 }}>📸</span>
        <div>
          <div style={{ fontSize: "13px", fontWeight: 900, lineHeight: 1.1 }}>Publicar con IA</div>
          <div style={{ fontSize: "10px", fontWeight: 600, opacity: 0.8 }}>Gratis · 30 segundos</div>
        </div>
      </div>
    </Link>
  );
}
