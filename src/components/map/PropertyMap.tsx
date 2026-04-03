"use client";

/**
 * PropertyMap — single-property map with cost-aware loading strategy.
 *
 * Billing tiers (Mapbox free: 50,000 map loads/month):
 *  • Static Images API  → NOT counted as a map load  (free tier is very generous)
 *  • Interactive map    → 1 map load per new Map() call
 *
 * Strategy:
 *  1. Intersection Observer → component is invisible → nothing loads.
 *  2. Component becomes visible → renders a Mapbox Static Image (no map load).
 *  3. User clicks "Ver mapa interactivo" → mapbox-gl is imported + map is
 *     created (or the singleton is re-used) → 1 map load.
 *  4. On unmount we detach without destroying → next listing reuses the instance.
 */

import { useEffect, useRef, useState, useId } from "react";
import {
  attachToHost,
  registerMapInstance,
  detachFromHost,
  hasMapInstance,
} from "./mapSingleton";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

interface Props {
  /** Decimal degrees from your database — no geocoding performed client-side. */
  lat: number;
  lng: number;
  /** Shown below the map. */
  address?: string;
  /** Zoom level for the static preview image (0–22). Default 15. */
  zoom?: number;
}

/** Builds a Mapbox Static Images URL — NOT a map load, very cheap. */
function staticImageUrl(lat: number, lng: number, zoom: number, w = 640, h = 260): string {
  return (
    `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/` +
    `pin-s+3483fa(${lng},${lat})/` +
    `${lng},${lat},${zoom},0/` +
    `${w}x${h}@2x` +
    `?access_token=${TOKEN}`
  );
}

export function PropertyMap({ lat, lng, address, zoom = 15 }: Props) {
  const uid = useId().replace(/:/g, "");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mapHostRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // ── Step 1: Intersection Observer ──────────────────────────────────────
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { rootMargin: "200px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ── Step 2: Load interactive map when user opts in ─────────────────────
  useEffect(() => {
    if (!interactive || !mapHostRef.current) return;

    let cancelled = false;

    (async () => {
      // Dynamic import → mapbox-gl JS is only downloaded on first click
      const mapboxgl = (await import("mapbox-gl")).default;
      // Also import the CSS once (idempotent — browser caches it)
      await import("mapbox-gl/dist/mapbox-gl.css" as string);

      if (cancelled || !mapHostRef.current) return;

      mapboxgl.accessToken = TOKEN;

      // ── Singleton re-use ───────────────────────────────────────────────
      const existing = attachToHost(mapHostRef.current);

      if (existing) {
        existing.flyTo({ center: [lng, lat], zoom, speed: 1.4 });
        // Ensure marker is updated
        existing.once("idle", () => {
          if (cancelled) return;
          setMapReady(true);
        });
        if (!cancelled) setMapReady(true);
        return;
      }

      // ── First-ever load (counts as 1 map load in billing) ────────────
      const map = new mapboxgl.Map({
        container: mapHostRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [lng, lat],
        zoom,
        attributionControl: false,
        logoPosition: "bottom-left",
      });

      map.addControl(new mapboxgl.AttributionControl({ compact: true }));
      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

      new mapboxgl.Marker({ color: "#3483fa" })
        .setLngLat([lng, lat])
        .addTo(map);

      map.once("load", () => {
        if (!cancelled) setMapReady(true);
      });

      registerMapInstance(map, mapHostRef.current);
    })();

    return () => {
      cancelled = true;
      // Keep instance alive for the next listing — do NOT call map.remove()
      detachFromHost();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interactive]);

  // When coordinates change but map is already interactive, fly to new spot
  useEffect(() => {
    if (!mapReady || !hasMapInstance()) return;
    const existing = attachToHost(mapHostRef.current!);
    existing?.flyTo({ center: [lng, lat], zoom, speed: 1.4, essential: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng]);

  return (
    <div ref={wrapperRef} style={{ borderRadius: "10px", overflow: "hidden", background: "#f8fafc" }}>
      {/* ── Static image preview (free, shown until user clicks) ───────── */}
      {visible && !interactive && (
        <div style={{ position: "relative", lineHeight: 0 }}>
          <img
            src={staticImageUrl(lat, lng, zoom)}
            alt="Ubicación del inmueble"
            width={640}
            height={260}
            style={{ width: "100%", height: "260px", objectFit: "cover", display: "block" }}
            loading="lazy"
          />
          {/* Overlay blur + CTA */}
          <div
            style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(0,0,0,0.18)",
            }}
          >
            <button
              onClick={() => setInteractive(true)}
              style={{
                background: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "9px 18px",
                fontSize: "13px",
                fontWeight: 700,
                color: "#1e293b",
                cursor: "pointer",
                boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
              Ver mapa interactivo
            </button>
          </div>
        </div>
      )}

      {/* ── Interactive map container ───────────────────────────────────── */}
      {interactive && (
        <div
          ref={mapHostRef}
          id={`map-host-${uid}`}
          style={{ width: "100%", height: "260px", position: "relative" }}
        />
      )}

      {/* ── Address footer ──────────────────────────────────────────────── */}
      {address && (
        <div style={{
          padding: "10px 16px",
          fontSize: "12px",
          color: "#64748b",
          borderTop: "1px solid #f1f5f9",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          background: "#fff",
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          {address}
        </div>
      )}
    </div>
  );
}
