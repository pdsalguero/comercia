"use client";

import { useState, useRef, useEffect } from "react";

interface Props {
  listingId: string;
  title: string;
  price?: number | null;
  currency?: string;
}

export function ShareButton({ listingId, title, price, currency }: Props) {
  const [open, setCopied_open]   = useState(false);
  const [copied, setCopied]       = useState(false);
  const ref                       = useRef<HTMLDivElement>(null);

  // alias for clarity
  const open2   = open;
  const setOpen = setCopied_open;

  const priceStr  = price ? ` — ${currency === "USD" ? "U$D" : "$"} ${Number(price).toLocaleString("es-AR")}` : "";
  const shareText = `${title}${priceStr}`;

  // Always computed at call time so window.location is guaranteed
  const getUrl  = () => `${window.location.origin}/listings/${listingId}`;
  const getLinks = () => {
    const u = getUrl();
    return {
      wa:   `https://wa.me/?text=${encodeURIComponent(u)}`,
      fb:   `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}`,
      tw:   `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(u)}`,
    };
  };

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const copyLink = async () => {
    const u = getUrl();
    try { await navigator.clipboard.writeText(u); } catch {
      const ta = document.createElement("textarea"); ta.value = u;
      document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => { setCopied(false); setOpen(false); }, 1800);
  };

  const handleTrigger = () => {
    // Always show custom popover — native share only on actual mobile
    const isMobile = typeof window !== "undefined" && /Android|iPhone|iPad/i.test(navigator.userAgent);
    if (isMobile && "share" in navigator) {
      (navigator as any).share({ title, text: shareText, url: getUrl() }).catch(() => {});
    } else {
      setOpen(v => !v);
    }
  };

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-flex" }}>
      {/* Trigger */}
      <button onClick={handleTrigger} style={{
        display: "flex", alignItems: "center", gap: "6px",
        padding: "9px 14px", background: "#f8fafc", color: "#475569",
        border: "1px solid #e2e8f0", borderRadius: "8px",
        fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
        Compartir
      </button>

      {/* Popover — row of icon buttons */}
      {open2 && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 10px)", right: 0,
          background: "#fff", borderRadius: "12px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 20px rgba(0,0,0,0.13)",
          zIndex: 300, padding: "12px 14px",
          display: "flex", flexDirection: "column", gap: "10px",
          minWidth: "max-content",
        }}>
          {/* Arrow */}
          <div style={{ position: "absolute", bottom: "-6px", right: "22px", width: "12px", height: "12px", background: "#fff", border: "1px solid #e2e8f0", transform: "rotate(45deg)", borderTop: "none", borderLeft: "none" }} />

          <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>Compartir aviso</div>

          {/* Icon row */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>

            {/* Copy link */}
            <IconBtn onClick={copyLink} label={copied ? "¡Copiado!" : "Copiar link"} bg={copied ? "#f0fdf4" : "#f1f5f9"}>
              {copied
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
                  </svg>
              }
            </IconBtn>

            {/* Instagram — copies link */}
            <IconBtn onClick={() => { copyLink(); }} label="Instagram" bg="#fce7f3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="url(#ig)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <defs>
                  <linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f97316"/>
                    <stop offset="50%" stopColor="#ec4899"/>
                    <stop offset="100%" stopColor="#8b5cf6"/>
                  </linearGradient>
                </defs>
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </IconBtn>

            {/* WhatsApp */}
            <IconBtn href={getLinks().wa} label="WhatsApp" bg="#dcfce7" onClick={() => setOpen(false)}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="#16a34a">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.125.553 4.122 1.523 5.855L0 24l6.338-1.498A11.963 11.963 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.886 0-3.645-.52-5.148-1.422L2.5 21.5l.956-4.217A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
            </IconBtn>

            {/* Facebook */}
            <IconBtn href={getLinks().fb} label="Facebook" bg="#dbeafe" onClick={() => setOpen(false)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#1d4ed8">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </IconBtn>

            {/* X / Twitter */}
            <IconBtn href={getLinks().tw} label="X (Twitter)" bg="#f1f5f9" onClick={() => setOpen(false)}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="#0f172a">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </IconBtn>

          </div>
        </div>
      )}
    </div>
  );
}

// ── Icon button helper ────────────────────────────────────────────────────────
function IconBtn({ children, label, bg, onClick, href }: {
  children: React.ReactNode;
  label: string;
  bg: string;
  onClick?: () => void;
  href?: string;
}) {
  const style: React.CSSProperties = {
    display: "flex", flexDirection: "column", alignItems: "center", gap: "5px",
    cursor: "pointer", textDecoration: "none", background: "none", border: "none",
    fontFamily: "inherit", padding: 0,
  };
  const circle: React.CSSProperties = {
    width: "44px", height: "44px", borderRadius: "50%",
    background: bg,
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "opacity 0.15s",
  };
  const lbl: React.CSSProperties = { fontSize: "10px", fontWeight: 600, color: "#64748b", whiteSpace: "nowrap" };

  const inner = (
    <>
      <div style={circle}>{children}</div>
      <span style={lbl}>{label}</span>
    </>
  );

  if (href) return (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick} style={style}>
      {inner}
    </a>
  );
  return (
    <button onClick={onClick} style={style}>
      {inner}
    </button>
  );
}
