"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export function PublishFAB() {
  const [show, setShow] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Reset on every mount so hot-reload doesn't preserve stale "true" state
    setShow(false);

    const isMobile = window.innerWidth <= 768;

    // Mobile: always visible (centered pill is expected UX on mobile)
    if (isMobile) { setShow(true); return; }

    // Desktop: show after 15s OR when user has scrolled 50% of the page
    let fired = false;
    const fire = () => { if (!fired) { fired = true; setShow(true); } };

    const timer = setTimeout(fire, 15000);
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0 && window.scrollY / total >= 0.5) fire();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { clearTimeout(timer); window.removeEventListener("scroll", onScroll); };
  }, [pathname]); // re-run on route change to reset

  if (pathname === "/listings/new") return null;

  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;

  if (isMobile) {
    return show ? (
      <Link href="/listings/new" style={{ textDecoration: "none" }}>
        <div style={{
          position: "fixed", bottom: "16px", left: "50%", transform: "translateX(-50%)",
          zIndex: 200, display: "flex", alignItems: "center", gap: "8px",
          background: "linear-gradient(135deg, #f97316, #fb923c)", color: "#fff",
          borderRadius: "50px", padding: "12px 24px", boxShadow: "0 6px 20px rgba(249,115,22,0.5)",
          fontWeight: 800, fontSize: "14px", cursor: "pointer", whiteSpace: "nowrap",
        }}>
          <span style={{ fontSize: "16px" }}>📸</span>
          Publicar aviso — Gratis
        </div>
      </Link>
    ) : null;
  }

  return (
    <Link href="/listings/new" style={{ textDecoration: "none" }}>
      <div style={{
        position: "fixed", bottom: "28px", right: "28px", zIndex: 200,
        display: "flex", alignItems: "center", gap: "10px",
        background: "linear-gradient(135deg, #f97316, #fb923c)", color: "#fff",
        borderRadius: "50px", padding: "13px 20px",
        boxShadow: "0 6px 24px rgba(249,115,22,0.45)",
        fontWeight: 800, fontSize: "14px", cursor: "pointer",
        transition: "opacity 0.3s, transform 0.3s",
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(16px)",
        pointerEvents: show ? "auto" : "none",
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
