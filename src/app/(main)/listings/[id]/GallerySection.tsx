"use client";

import { useState } from "react";

export function GallerySection({ images, title }: { images: { url: string }[]; title: string }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  const prev = () => setActive((i) => (i - 1 + images.length) % images.length);
  const next = () => setActive((i) => (i + 1) % images.length);

  if (images.length === 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "420px", background: "#f5f5f5", borderRadius: "8px" }}>
        <span style={{ fontSize: "72px" }}>📦</span>
      </div>
    );
  }

  const thumbs = images.slice(0, 4);
  const extra = images.length - 4;

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>

        {/* Main image with arrows */}
        <div style={{ width: "100%", height: "420px", background: "#f8f9fa", position: "relative", cursor: "zoom-in" }}
          onClick={() => { setZoomed(false); setLightbox(true); }}
        >
          <img
            src={images[active].url}
            alt={title}
            style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
          />

          {/* Prev arrow */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              style={{
                position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)",
                width: "40px", height: "40px", borderRadius: "50%",
                background: "#fff", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 2px 10px rgba(0,0,0,.18)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

          {/* Next arrow */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              style={{
                position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                width: "40px", height: "40px", borderRadius: "50%",
                background: "#fff", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 2px 10px rgba(0,0,0,.18)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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

        {/* Thumbnails row */}
        {images.length > 1 && (
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(images.length, 4)}, 1fr)`, gap: "2px", marginTop: "2px" }}>
            {thumbs.map((img, i) => {
              const isLast = i === 3 && extra > 0;
              return (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  style={{
                    position: "relative", padding: 0, border: "none",
                    borderRadius: 0, overflow: "hidden", cursor: "pointer",
                    height: "110px",
                    outline: i === active ? "3px solid #3483fa" : "none",
                    outlineOffset: "-3px", background: "none",
                  }}
                >
                  <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  {isLast && (
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "rgba(0,0,0,.55)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontSize: "18px", fontWeight: 700,
                    }}>
                      +{extra}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => { if (zoomed) setZoomed(false); else setLightbox(false); }}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,.92)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {/* Close */}
          <button
            onClick={(e) => { e.stopPropagation(); setLightbox(false); setZoomed(false); }}
            style={{
              position: "absolute", top: "16px", right: "20px",
              background: "rgba(255,255,255,.15)", border: "none", color: "#fff",
              fontSize: "28px", cursor: "pointer", borderRadius: "50%",
              width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            ×
          </button>

          {/* Prev */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev(); setZoomed(false); }}
              style={{
                position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)",
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

          {/* Image */}
          <img
            src={images[active].url}
            alt={title}
            onClick={(e) => { e.stopPropagation(); setZoomed((z) => !z); }}
            style={{
              maxWidth: zoomed ? "none" : "90vw",
              maxHeight: zoomed ? "none" : "90vh",
              width: zoomed ? "auto" : undefined,
              objectFit: "contain",
              cursor: zoomed ? "zoom-out" : "zoom-in",
              transform: zoomed ? "scale(1.8)" : "scale(1)",
              transition: "transform .25s ease",
              borderRadius: "4px",
            }}
          />

          {/* Next */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next(); setZoomed(false); }}
              style={{
                position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)",
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

          {/* Counter */}
          <div style={{
            position: "absolute", bottom: "20px", left: "50%", transform: "translateX(-50%)",
            background: "rgba(255,255,255,.15)", color: "#fff",
            fontSize: "13px", fontWeight: 600, padding: "4px 14px", borderRadius: "20px",
          }}>
            {active + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
