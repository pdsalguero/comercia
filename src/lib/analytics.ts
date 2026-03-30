/**
 * Wrapper sobre window.gtag para trackear eventos en GA4.
 * Funciona en SSR (no rompe si gtag no está disponible).
 */

const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";

/** Verifica que gtag esté disponible (solo en cliente y en producción). */
function isAvailable(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.gtag === "function" &&
    GA_ID !== ""
  );
}

/**
 * Envía un evento custom a GA4.
 * @param eventName - Nombre del evento (snake_case recomendado por GA4)
 * @param params    - Parámetros adicionales del evento
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
): void {
  if (!isAvailable()) {
    // En desarrollo, logueamos para facilitar el debug
    if (process.env.NODE_ENV === "development") {
      console.log("[GA4 dev]", eventName, params);
    }
    return;
  }
  window.gtag("event", eventName, params);
}

// ---------------------------------------------------------------------------
// Eventos específicos del dominio
// ---------------------------------------------------------------------------

/** Se llama cuando un vendedor publica un nuevo aviso. */
export function trackListingCreated(
  category: string,
  tipo: string,
  isPaid: boolean
): void {
  trackEvent("listing_created", { category, tipo, is_paid: isPaid });
}

/** Se llama cuando un usuario abre la página de detalle de un aviso. */
export function trackListingViewed(category: string): void {
  trackEvent("listing_viewed", { category });
}

/** Se llama cuando se completa la compra de un destacado. */
export function trackHighlightPurchase(planType: string, price: number): void {
  trackEvent("highlight_purchase", {
    plan_type: planType,
    value: price,
    currency: "ARS",
  });
}

/** Se llama cuando el usuario navega a una categoría. */
export function trackCategoryView(category: string): void {
  trackEvent("category_view", { category });
}
