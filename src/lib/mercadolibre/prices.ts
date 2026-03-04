export interface MLPriceResult {
  price_min:         number
  price_max:         number
  price_avg:         number
  price_suggested:   number
  price_source:      'mercadolibre'
  price_sample_size: number
  currency:          'ARS'
}

export async function searchMLPrices(query: string): Promise<MLPriceResult | null> {
  try {
    // MercadoLibre public API — no auth needed for search
    const url = `https://api.mercadolibre.com/sites/MLA/search?q=${encodeURIComponent(query)}&limit=20&condition=used`

    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 3600 }, // cache 1 hour
    })

    if (!res.ok) return null

    const data = await res.json()
    const results = data.results as any[]

    if (!results || results.length < 3) return null

    // Filter only ARS prices and reasonable values
    const prices = results
      .filter(r => r.currency_id === 'ARS' && r.price > 0)
      .map(r => r.price)
      .sort((a, b) => a - b)

    if (prices.length < 3) return null

    // Remove top and bottom 15% outliers
    const trimStart = Math.floor(prices.length * 0.15)
    const trimEnd   = Math.ceil(prices.length * 0.85)
    const trimmed   = prices.slice(trimStart, trimEnd)

    if (trimmed.length === 0) return null

    const avg    = Math.round(trimmed.reduce((a, b) => a + b, 0) / trimmed.length)
    const min    = trimmed[0]
    const max    = trimmed[trimmed.length - 1]
    const median = trimmed[Math.floor(trimmed.length / 2)]

    return {
      price_min:         min,
      price_max:         max,
      price_avg:         avg,
      price_suggested:   median,
      price_source:      'mercadolibre',
      price_sample_size: prices.length,
      currency:          'ARS',
    }

  } catch (error) {
    console.error('ML price search error:', error)
    return null
  }
}
