"use client";

/**
 * PropertyMapCluster — multi-property map with supercluster.
 *
 * Used on search/category pages to display up to N listings at once.
 * Supercluster groups nearby markers so the map stays fast regardless
 * of how many listings are on screen.
 *
 * Billing: 1 map load when the user clicks "Ver mapa". Static image
 * shows first (like PropertyMap). Supercluster runs entirely client-side.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import type { MapMouseEvent } from "mapbox-gl";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

export interface MapListing {
  id: string | number;
  lat: number;
  lng: number;
  title: string;
  price?: string;
  slug?: string;
}

interface Props {
  listings: MapListing[];
  /** Initial map center. Defaults to centroid of all listings. */
  center?: [number, number];
  zoom?: number;
  height?: number;
}

interface ClusterFeature {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: {
    cluster?: boolean;
    cluster_id?: number;
    point_count?: number;
    listingId?: string | number;
    title?: string;
    price?: string;
    slug?: string;
  };
}

function centroid(listings: MapListing[]): [number, number] {
  if (listings.length === 0) return [-64.1888, -31.4201]; // Córdoba, AR
  const sumLng = listings.reduce((s, l) => s + l.lng, 0);
  const sumLat = listings.reduce((s, l) => s + l.lat, 0);
  return [sumLng / listings.length, sumLat / listings.length];
}

/** Static image for the initial preview — does NOT count as a map load. */
function staticPreviewUrl(center: [number, number], zoom: number, w = 640, h = 400): string {
  const [lng, lat] = center;
  return (
    `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/` +
    `${lng},${lat},${zoom},0/${w}x${h}@2x` +
    `?access_token=${TOKEN}`
  );
}

export function PropertyMapCluster({ listings, center, zoom = 11, height = 420 }: Props) {
  const mapRef = useRef<import("mapbox-gl").Map | null>(null);
  const markersRef = useRef<import("mapbox-gl").Marker[]>([]);
  const popupRef = useRef<import("mapbox-gl").Popup | null>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [visible, setVisible] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const mapCenter = center ?? centroid(listings);

  // ── Intersection Observer ────────────────────────────────────────────────
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { rootMargin: "300px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ── Render clusters with supercluster ────────────────────────────────────
  const renderClusters = useCallback(async (map: import("mapbox-gl").Map) => {
    const mapboxgl = (await import("mapbox-gl")).default;
    const Supercluster = (await import("supercluster")).default;

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const index = new Supercluster<{ listingId: string | number; title: string; price?: string; slug?: string }>({
      radius: 60,
      maxZoom: 16,
    });

    index.load(
      listings.map((l) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [l.lng, l.lat] },
        properties: { listingId: l.id, title: l.title, price: l.price, slug: l.slug },
      }))
    );

    const updateMarkers = () => {
      const bounds = map.getBounds();
      if (!bounds) return;
      const bbox: [number, number, number, number] = [
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth(),
      ];
      const currentZoom = Math.floor(map.getZoom());
      const features = index.getClusters(bbox, currentZoom) as ClusterFeature[];

      // Remove old markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      features.forEach((feature) => {
        const [lng, lat] = feature.geometry.coordinates;
        const el = document.createElement("div");

        if (feature.properties.cluster) {
          // ── Cluster bubble ──────────────────────────────────────────────
          const count = feature.properties.point_count ?? 0;
          const size = count < 10 ? 36 : count < 50 ? 44 : 54;
          el.style.cssText = `
            width:${size}px;height:${size}px;border-radius:50%;
            background:#3483fa;color:#fff;font-weight:700;
            font-size:${size < 44 ? 12 : 14}px;
            display:flex;align-items:center;justify-content:center;
            border:2px solid #fff;
            box-shadow:0 2px 8px rgba(52,131,250,.45);
            cursor:pointer;
          `;
          el.textContent = String(count);
          el.addEventListener("click", () => {
            const expansionZoom = Math.min(
              index.getClusterExpansionZoom(feature.properties.cluster_id!),
              20
            );
            map.flyTo({ center: [lng, lat], zoom: expansionZoom, speed: 1.4 });
          });
        } else {
          // ── Individual marker ───────────────────────────────────────────
          el.style.cssText = `
            width:28px;height:28px;border-radius:50% 50% 50% 0;
            background:#3483fa;border:2px solid #fff;
            box-shadow:0 2px 6px rgba(0,0,0,.25);
            transform:rotate(-45deg);cursor:pointer;
          `;
          el.addEventListener("click", () => {
            popupRef.current?.remove();
            const { title, price, slug } = feature.properties;
            const popup = new mapboxgl.Popup({ offset: 20, closeButton: true, maxWidth: "220px" })
              .setLngLat([lng, lat])
              .setHTML(`
                <div style="font-family:sans-serif;padding:2px">
                  <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#1e293b;line-height:1.3">${title}</p>
                  ${price ? `<p style="margin:0 0 6px;font-size:14px;font-weight:800;color:#3483fa">${price}</p>` : ""}
                  ${slug ? `<a href="/listings/${slug}" style="font-size:12px;color:#3483fa;font-weight:600;text-decoration:none">Ver publicación →</a>` : ""}
                </div>
              `)
              .addTo(map);
            popupRef.current = popup;
          });
        }

        const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
          .setLngLat([lng, lat])
          .addTo(map);
        markersRef.current.push(marker);
      });
    };

    updateMarkers();
    map.on("moveend", updateMarkers);
    map.on("zoomend", updateMarkers);
  }, [listings]);

  // ── Initialize interactive map ───────────────────────────────────────────
  useEffect(() => {
    if (!interactive || !hostRef.current) return;
    let cancelled = false;

    (async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      await import("mapbox-gl/dist/mapbox-gl.css" as string);
      if (cancelled || !hostRef.current) return;

      mapboxgl.accessToken = TOKEN;

      const map = new mapboxgl.Map({
        container: hostRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: mapCenter,
        zoom,
        attributionControl: false,
        logoPosition: "bottom-left",
      });

      map.addControl(new mapboxgl.AttributionControl({ compact: true }));
      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

      map.once("load", () => {
        if (cancelled) return;
        mapRef.current = map;
        setMapReady(true);
        renderClusters(map);
      });
    })();

    return () => {
      cancelled = true;
      // Remove popup and markers but keep map instance
      popupRef.current?.remove();
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      // Destroy cluster map (it's page-scoped, not shared)
      mapRef.current?.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interactive]);

  // Re-render clusters when listings change while map is alive
  useEffect(() => {
    if (mapReady && mapRef.current) renderClusters(mapRef.current);
  }, [listings, mapReady, renderClusters]);

  return (
    <div ref={wrapperRef} style={{ borderRadius: "10px", overflow: "hidden", background: "#f8fafc" }}>
      {/* Static preview */}
      {visible && !interactive && (
        <div style={{ position: "relative", lineHeight: 0 }}>
          <img
            src={staticPreviewUrl(mapCenter, zoom, 640, height)}
            alt="Mapa de resultados"
            width={640}
            height={height}
            style={{ width: "100%", height: `${height}px`, objectFit: "cover", display: "block" }}
            loading="lazy"
          />
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.20)", gap: "8px",
          }}>
            <span style={{ color: "#fff", fontSize: "13px", fontWeight: 600, textShadow: "0 1px 3px rgba(0,0,0,.5)" }}>
              {listings.length} propiedades en el área
            </span>
            <button
              onClick={() => setInteractive(true)}
              style={{
                background: "#fff", border: "none", borderRadius: "8px",
                padding: "9px 18px", fontSize: "13px", fontWeight: 700,
                color: "#1e293b", cursor: "pointer",
                boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
                display: "flex", alignItems: "center", gap: "6px",
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

      {/* Interactive map */}
      {interactive && (
        <div ref={hostRef} style={{ width: "100%", height: `${height}px`, position: "relative" }} />
      )}
    </div>
  );
}
