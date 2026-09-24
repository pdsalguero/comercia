// Cálculos sobre los precios de los planes de destacado (/upgrade). Los montos viven en PlanCards.tsx.

/** Precio por día redondeado, igual que lo muestra la tarjeta. */
export function pricePerDay(price: number, days: number): number {
  return Math.round(price / days);
}

/**
 * Duración (en días) con el menor precio por día. Es la que lleva el badge "MEJOR PRECIO".
 * Si hay empate, gana la más larga. Antes el badge estaba fijo en 30 días aunque, por ejemplo en
 * Premium, 15 días ($220/día) sale más barato por día que 30 ($233/día).
 */
export function bestValueDays(prices: Record<number, number>): number | null {
  let best: number | null = null;
  let bestPpd = Infinity;
  for (const [d, p] of Object.entries(prices)) {
    const days = Number(d);
    const ppd = p / days;
    if (ppd < bestPpd || (ppd === bestPpd && best != null && days > best)) {
      best = days;
      bestPpd = ppd;
    }
  }
  return best;
}
