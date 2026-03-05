export interface MLPriceResult {
  price_min: number;
  price_max: number;
  price_avg: number;
  price_suggested: number;
  price_source: "mercadolibre";
  price_sample_size: number;
  currency: "ARS";
}

export async function searchMLPrices(
  query: string,
): Promise<MLPriceResult | null> {
  try {
    // ✅ Sin condition=used que a veces causa 403
    // ✅ Headers que imitan un browser real
    const url = `https://api.mercadolibre.com/sites/MLA/search?q=${encodeURIComponent(query)}&limit=20`;

    console.log("🛒 Buscando en ML:", query);

    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "Accept-Language": "es-AR,es;q=0.9",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://www.mercadolibre.com.ar/",
        Origin: "https://www.mercadolibre.com.ar",
      },
      cache: "no-store",
    });

    console.log("🛒 ML status:", res.status);

    if (!res.ok) {
      console.error("ML API error:", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    const results = data.results as any[];

    console.log("🛒 ML resultados:", results?.length ?? 0);

    if (!results || results.length < 3) return null;

    // Filter ARS prices only, remove zeros
    const prices = results
      .filter((r) => r.currency_id === "ARS" && r.price > 0)
      .map((r) => r.price as number)
      .sort((a, b) => a - b);

    console.log("🛒 ML precios válidos:", prices.length, prices);

    if (prices.length < 3) return null;

    // Remove top and bottom 15% outliers
    const trimStart = Math.floor(prices.length * 0.15);
    const trimEnd = Math.ceil(prices.length * 0.85);
    const trimmed = prices.slice(trimStart, trimEnd);

    if (trimmed.length === 0) return null;

    const avg = Math.round(trimmed.reduce((a, b) => a + b, 0) / trimmed.length);
    const min = trimmed[0];
    const max = trimmed[trimmed.length - 1];
    const median = trimmed[Math.floor(trimmed.length / 2)];

    console.log("🛒 ML resultado final:", { min, max, avg, median });

    return {
      price_min: min,
      price_max: max,
      price_avg: avg,
      price_suggested: median,
      price_source: "mercadolibre",
      price_sample_size: prices.length,
      currency: "ARS",
    };
  } catch (error) {
    console.error("🛒 ML error:", error);
    return null;
  }
}
