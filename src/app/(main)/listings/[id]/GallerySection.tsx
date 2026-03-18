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

  return (
    <>
      {/* MercadoLibre-style: vertical thumbs on left + main image on right */}
      <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>

        {/* Vertical thumbnail strip */}
        {images.length > 1 && (
          <div style={{
            display: "flex", flexDirection: "column", gap: "6px",
            width: "68px", flexShrink: 0,
            maxHeight: "420px", overflowY: "auto",
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
                <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </button>
            ))}
          </div>
        )}

        {/* Main image */}
        <div
          style={{
            flex: 1, height: "420px", background: "#f8f9fa",
            borderRadius: "8px", position: "relative",
            cursor: "zoom-in", overflow: "hidden",
          }}
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

          {/* Thumbnail strip in lightbox */}
          {images.length > 1 && (
            <div style={{
              position: "absolute", bottom: "16px", left: "50%", transform: "translateX(-50%)",
              display: "flex", gap: "8px", padding: "8px 12px",
              background: "rgba(0,0,0,.4)", borderRadius: "10px",
            }}>
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setActive(i); setZoomed(false); }}
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
            position: "absolute", top: "20px", left: "50%", transform: "translateX(-50%)",
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
