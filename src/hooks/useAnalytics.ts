"use client";

/**
 * Hook que expone las funciones de analytics del dominio.
 * Usar en componentes cliente donde se necesite trackear interacciones.
 *
 * @example
 * const { trackListingCreated } = useAnalytics();
 * trackListingCreated("vehiculos", "moto", false);
 */

import {
  trackListingCreated,
  trackListingViewed,
  trackHighlightPurchase,
  trackCategoryView,
} from "@/lib/analytics";

export function useAnalytics() {
  return {
    trackListingCreated,
    trackListingViewed,
    trackHighlightPurchase,
    trackCategoryView,
  };
}
