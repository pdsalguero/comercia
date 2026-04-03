/**
 * Module-level singleton for the Mapbox GL map instance.
 *
 * A single `new mapboxgl.Map()` call = 1 "map load" in billing.
 * By keeping one instance alive across client-side navigations we avoid
 * charging a new load every time the user visits a listing page.
 *
 * The map is tied to a DOM container div. When the user navigates to a
 * different listing we:
 *   1. Move the existing <canvas> container to the new host element.
 *   2. Call flyTo() to animate to the new coordinates.
 *
 * Only call destroySingleton() on full page unload or when you genuinely
 * want to free the WebGL context (e.g. the user leaves the app entirely).
 */

import type mapboxgl from "mapbox-gl";

interface SingletonState {
  map: mapboxgl.Map;
  hostEl: HTMLElement;
}

let state: SingletonState | null = null;

/** Returns true if a live map instance already exists. */
export function hasMapInstance(): boolean {
  return state !== null;
}

/**
 * Attach the singleton map to a new host element.
 * If no instance exists yet, one must be created via createMapInstance().
 * If one exists, the internal container is re-parented to `newHost`.
 */
export function attachToHost(newHost: HTMLElement): mapboxgl.Map | null {
  if (!state) return null;
  if (state.hostEl !== newHost) {
    // Move the mapbox canvas wrapper to the new host
    const container = state.map.getContainer();
    newHost.appendChild(container);
    state.hostEl = newHost;
    state.map.resize();
  }
  return state.map;
}

/** Store a freshly created map instance in the singleton. */
export function registerMapInstance(map: mapboxgl.Map, hostEl: HTMLElement): void {
  state = { map, hostEl };
}

/**
 * Detach from a host without destroying the instance.
 * Call this in useEffect cleanup so the map survives navigation.
 */
export function detachFromHost(): void {
  // Intentionally a no-op — we keep the map alive.
  // The GC will not collect it because `state` holds the reference.
}

/** Permanently destroy the map and free the WebGL context. */
export function destroySingleton(): void {
  if (state) {
    state.map.remove();
    state = null;
  }
}
