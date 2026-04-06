"use client";

import { useState, useRef, useEffect } from "react";

export function GallerySection({ images, title }: { images: { url: string }[]; title: string }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  // Refs for touch tracking (avoid stale closures)
  const scaleRef = useRef(1);
  const translateRef = useRef({ x: 0, y: 0 });
  const touchRef = useRef({
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    initialDistance: 0,
    initialScale: 1,
    initialTranslate: { x: 0, y: 0 },
    isPinching: false,
    startTime: 0,
    lastTapTime: 0,
  });
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ isDragging: false, startX: 0, startY: 0, initialTranslate: { x: 0, y: 0 } });

  const resetTransform = () => {
    scaleRef.current = 1;
    translateRef.current = { x: 0, y: 0 };
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  };

  const prev = () => {
    setActive((i) => (i - 1 + images.length) % images.length);
    resetTransform();
  };
  const next = () => {
    setActive((i) => (i + 1) % images.length);
    resetTransform();
  };
  const closeLightbox = () => {
    setLightbox(false);
    resetTransform();
  };

  const getDistance = (t1: Touch, t2: Touch) => {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Attach touch handlers with passive:false so we can preventDefault
  useEffect(() => {
    const el = imageWrapperRef.current;
    if (!el || !lightbox) return;

    const onTouchStart = (e: TouchEvent) => {
      const t = touchRef.current;
      t.startTime = Date.now();

      if (e.touches.length === 2) {
        t.isPinching = true;
        t.initialDistance = getDistance(e.touches[0], e.touches[1]);
        t.initialScale = scaleRef.current;
        t.initialTranslate = { ...translateRef.current };
        t.startX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        t.startY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      } else {
        t.isPinching = false;
        t.startX = e.touches[0].clientX;
        t.startY = e.touches[0].clientY;
        t.lastX = e.touches[0].clientX;
        t.lastY = e.touches[0].clientY;
        t.initialTranslate = { ...translateRef.current };
        t.initialScale = scaleRef.current;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault(); // prevent page scroll while panning/pinching
      const t = touchRef.current;

      if (e.touches.length === 2 && t.isPinching) {
        const currentDistance = getDistance(e.touches[0], e.touches[1]);
        const newScale = Math.max(1, Math.min(6, t.initialScale * (currentDistance / t.initialDistance)));
        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        const newTranslate = {
          x: t.initialTranslate.x + (midX - t.startX),
          y: t.initialTranslate.y + (midY - t.startY),
        };
        scaleRef.current = newScale;
        translateRef.current = newTranslate;
        setScale(newScale);
        setTranslate({ ...newTranslate });
      } else if (e.touches.length === 1 && !t.isPinching) {
        t.lastX = e.touches[0].clientX;
        t.lastY = e.touches[0].clientY;
        if (scaleRef.current > 1) {
          const newTranslate = {
            x: t.initialTranslate.x + (e.touches[0].clientX - t.startX),
            y: t.initialTranslate.y + (e.touches[0].clientY - t.startY),
          };
          translateRef.current = newTranslate;
          setTranslate({ ...newTranslate });
        }
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      const t = touchRef.current;
      const now = Date.now();

      if (t.isPinching) {
        t.isPinching = false;
        if (scaleRef.current < 1.15) resetTransform();
        return;
      }

      // Double tap → toggle zoom
      if (now - t.lastTapTime < 300) {
        t.lastTapTime = 0;
        if (scaleRef.current > 1) {
          resetTransform();
        } else {
          scaleRef.current = 2.5;
          translateRef.current = { x: 0, y: 0 };
          setScale(2.5);
          setTranslate({ x: 0, y: 0 });
        }
        return;
      }
      t.lastTapTime = now;

      // Swipe to navigate (only when not zoomed)
      if (scaleRef.current <= 1) {
        const dx = t.lastX - t.startX;
        const dy = Math.abs(t.lastY - t.startY);
        const duration = now - t.startTime;
        if (Math.abs(dx) > 50 && dy < 100 && duration < 500) {
          if (dx < 0) next();
          else prev();
        }
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightbox, images.length]);

  if (images.length === 0) {
    return (
      <div className="gallery-main" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "420px", background: "#f5f5f5", borderRadius: "8px" }}>
        <span style={{ fontSize: "72px" }}>📦</span>
      </div>
    );
  }

  return (
    <>
      {/* MercadoLibre-style: vertical thumbs on left + main image on right */}
      <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", width: "100%", maxWidth: "100%", boxSizing: "border-box", overflow: "hidden" }}>

        {/* Vertical thumbnail strip — siempre visible */}
        <div className="gallery-thumbs" style={{
            display: "flex", flexDirection: "column", gap: "6px",
            width: "84px", flexShrink: 0,
            maxHeight: "420px", overflowY: "auto", overflowX: "hidden",
          }}>
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                style={{
                  width: "68px", height: "68px", flexShrink: 0,
                  padding: 0, border: "2px solid",
                  borderColor: i === active ? "#3483fa" : "#e2e8f0",
                  borderRadius: "6px", overflow: "hidden",
                  cursor: "pointer", background: "#f8f9fa",
                  transition: "border-color 0.15s",
                }}
              >
                <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </button>
            ))}
          </div>

        {/* Main image */}
        <div
          className="gallery-main"
          style={{
            width: "100%", minWidth: 0, height: "420px",
            borderRadius: "8px", position: "relative",
            cursor: "zoom-in", overflow: "hidden",
          }}
          onClick={() => { setLightbox(true); }}
        >
          {/* Fondo borroso con la misma imagen */}
          <img
            src={images[active].url}
            aria-hidden
            style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover", filter: "blur(18px) brightness(0.7)",
              transform: "scale(1.08)",
            }}
          />
          {/* Imagen principal centrada encima */}
          <img
            src={images[active].url}
            alt={title}
            style={{
              position: "relative", width: "100%", height: "100%",
              objectFit: "contain", display: "block",
            }}
          />

          {/* Prev arrow */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              style={{
                position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)",
                width: "36px", height: "36px", borderRadius: "50%",
                background: "#fff", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,.18)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

          {/* Next arrow */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              style={{
                position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)",
                width: "36px", height: "36px", borderRadius: "50%",
                background: "#fff", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,.18)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}

          {/* Counter */}
          {images.length > 1 && (
            <div style={{
              position: "absolute", bottom: "10px", right: "12px",
              background: "rgba(0,0,0,.5)", color: "#fff",
              fontSize: "11px", fontWeight: 600, padding: "3px 8px", borderRadius: "20px",
            }}>
              {active + 1} / {images.length}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,.92)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {/* Close */}
          <button
            onClick={closeLightbox}
            style={{
              position: "absolute", top: "16px", right: "20px", zIndex: 10,
              background: "rgba(255,255,255,.15)", border: "none", color: "#fff",
              fontSize: "28px", cursor: "pointer", borderRadius: "50%",
              width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            ×
          </button>

          {/* Prev — only show when not zoomed */}
          {images.length > 1 && scale <= 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              style={{
                position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", zIndex: 10,
                background: "#fff", border: "none", cursor: "pointer", borderRadius: "50%",
                width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 2px 10px rgba(0,0,0,.3)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

          {/* Touch/image area — full screen, handles all gestures */}
          <div
            ref={imageWrapperRef}
            style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              overflow: "hidden",
              touchAction: "none", // let our handlers manage all touch
              cursor: scale > 1 ? (mouseRef.current.isDragging ? "grabbing" : "grab") : "zoom-in",
            }}
            onWheel={(e) => {
              e.preventDefault();
              const delta = e.deltaY > 0 ? -0.2 : 0.2;
              const newScale = Math.max(1, Math.min(6, scaleRef.current + delta));
              scaleRef.current = newScale;
              if (newScale === 1) translateRef.current = { x: 0, y: 0 };
              setScale(newScale);
              if (newScale === 1) setTranslate({ x: 0, y: 0 });
            }}
            onMouseDown={(e) => {
              if (scaleRef.current <= 1) return;
              e.preventDefault();
              mouseRef.current = { isDragging: true, startX: e.clientX, startY: e.clientY, initialTranslate: { ...translateRef.current } };
            }}
            onMouseMove={(e) => {
              if (!mouseRef.current.isDragging) return;
              const newTranslate = {
                x: mouseRef.current.initialTranslate.x + (e.clientX - mouseRef.current.startX),
                y: mouseRef.current.initialTranslate.y + (e.clientY - mouseRef.current.startY),
              };
              translateRef.current = newTranslate;
              setTranslate({ ...newTranslate });
            }}
            onMouseUp={() => { mouseRef.current.isDragging = false; }}
            onMouseLeave={() => { mouseRef.current.isDragging = false; }}
            onDoubleClick={() => {
              if (scaleRef.current > 1) {
                resetTransform();
              } else {
                scaleRef.current = 2.5;
                translateRef.current = { x: 0, y: 0 };
                setScale(2.5);
                setTranslate({ x: 0, y: 0 });
              }
            }}
            onClick={(e) => {
              if (mouseRef.current.isDragging) return;
              if (scale <= 1 && e.target === e.currentTarget) closeLightbox();
            }}
          >
            <img
              src={images[active].url}
              alt={title}
              draggable={false}
              style={{
                maxWidth: "90vw",
                maxHeight: "90vh",
                objectFit: "contain",
                borderRadius: "4px",
                userSelect: "none",
                transformOrigin: "center center",
                transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`,
                transition: scale === 1 ? "transform .2s ease" : "none",
                willChange: "transform",
              }}
            />
          </div>

          {/* Next — only show when not zoomed */}
          {images.length > 1 && scale <= 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              style={{
                position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", zIndex: 10,
                background: "#fff", border: "none", cursor: "pointer", borderRadius: "50%",
                width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 2px 10px rgba(0,0,0,.3)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}

          {/* Thumbnail strip in lightbox — only when not zoomed */}
          {images.length > 1 && scale <= 1 && (
            <div style={{
              position: "absolute", bottom: "16px", left: "50%", transform: "translateX(-50%)", zIndex: 10,
              display: "flex", gap: "8px", padding: "8px 12px",
              background: "rgba(0,0,0,.4)", borderRadius: "10px",
            }}>
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setActive(i); resetTransform(); }}
                  style={{
                    width: "44px", height: "44px", padding: 0,
                    border: "2px solid", borderColor: i === active ? "#fff" : "transparent",
                    borderRadius: "4px", overflow: "hidden", cursor: "pointer", background: "none",
                  }}
                >
                  <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </button>
              ))}
            </div>
          )}

          {/* Counter */}
          <div style={{
            position: "absolute", top: "20px", left: "50%", transform: "translateX(-50%)", zIndex: 10,
            background: "rgba(255,255,255,.15)", color: "#fff",
            fontSize: "13px", fontWeight: 600, padding: "4px 14px", borderRadius: "20px",
            pointerEvents: "none",
          }}>
            {active + 1} / {images.length}
          </div>

          {/* Zoom hint — only when not zoomed */}
          {scale <= 1 && (
            <div style={{
              position: "absolute", bottom: images.length > 1 ? "80px" : "16px",
              left: "50%", transform: "translateX(-50%)", zIndex: 10,
              color: "rgba(255,255,255,.5)", fontSize: "11px",
              pointerEvents: "none", whiteSpace: "nowrap",
            }}>
              <span className="hidden md:inline">Rueda del mouse para hacer zoom</span>
              <span className="md:hidden">Pellizca para hacer zoom · Doble toque para acercar</span>
            </div>
          )}
        </div>
      )}
    </>
  );
}
