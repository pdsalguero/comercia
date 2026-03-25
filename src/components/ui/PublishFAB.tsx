"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export function PublishFAB() {
  const [show, setShow] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setShow(false); // always start hidden (prevents hot-reload stale state)

    let fired = false;
    const fire = () => { if (!fired) { fired = true; setShow(true); } };

    // Show after 15s OR after 50% scroll — same rule for mobile and desktop
    const timer = setTimeout(fire, 15000);
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0 && window.scrollY / total >= 0.5) fire();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { clearTimeout(timer); window.removeEventListener("scroll", onScroll); };
  }, [pathname]);

  if (pathname === "/listings/new") return null;
  if (!show) return null;

  // Only show on mobile — desktop has the CTA in the navbar
  return (
    <Link href="/listings/new" className="lg:hidden" style={{ textDecoration: "none" }}>
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
  );
}
