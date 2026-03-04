import { createClient } from '@/lib/supabase/server'
import { analyzePhoto } from '@/lib/claude/analyze-photo'
import { searchMLPrices } from '@/lib/mercadolibre/prices'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const formData  = await request.formData()
    const file      = formData.get('photo') as File
    if (!file) return NextResponse.json({ error: 'No se recibió imagen' }, { status: 400 })

    // 1 — Analyze photo with Claude
    const bytes     = await file.arrayBuffer()
    const base64    = Buffer.from(bytes).toString('base64')
    const mediaType = file.type || 'image/jpeg'
    const aiResult  = await analyzePhoto(base64, mediaType)

    // 2 — Search MercadoLibre prices using AI-generated title
    const mlPrices = await searchMLPrices(aiResult.title)

    // 3 — Also check internal comercIA prices
    const MIN_SAMPLES = 3
    let internalPrices = null

    const { data: priceData } = await supabase
      .from('listings')
      .select('price')
      .eq('category_id', aiResult.category_id)
      .eq('status', 'active')
      .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(100)

    if (priceData && priceData.length >= MIN_SAMPLES) {
      const prices    = priceData.map(r => r.price).sort((a, b) => a - b)
      const trimStart = Math.floor(prices.length * 0.1)
      const trimEnd   = Math.ceil(prices.length * 0.9)
      const trimmed   = prices.slice(trimStart, trimEnd)
      const avg       = Math.round(trimmed.reduce((a, b) => a + b, 0) / trimmed.length)
      const median    = trimmed[Math.floor(trimmed.length / 2)]

      internalPrices = {
        price_min:         trimmed[0],
        price_max:         trimmed[trimmed.length - 1],
        price_avg:         avg,
        price_suggested:   median,
        price_sample_size: prices.length,
      }
    }

    // 4 — Build final price suggestion
    // Priority: internal comercIA data > MercadoLibre
    const priceResult = internalPrices
      ? {
          price_suggested:   internalPrices.price_suggested,
          price_min:         internalPrices.price_min,
          price_max:         internalPrices.price_max,
          price_avg:         internalPrices.price_avg,
          price_source:      'comercia' as const,
          price_sample_size: internalPrices.price_sample_size,
          ml_prices:         mlPrices,  // still send ML data as reference
        }
      : mlPrices
      ? {
          price_suggested:   mlPrices.price_suggested,
          price_min:         mlPrices.price_min,
          price_max:         mlPrices.price_max,
          price_avg:         mlPrices.price_avg,
          price_source:      'mercadolibre' as const,
          price_sample_size: mlPrices.price_sample_size,
          ml_prices:         mlPrices,
        }
      : {
          price_suggested:   null,
          price_min:         null,
          price_max:         null,
          price_avg:         null,
          price_source:      'none' as const,
          price_sample_size: 0,
          ml_prices:         null,
        }

    return NextResponse.json({ ...aiResult, ...priceResult })

  } catch (error) {
    console.error('AI analyze error:', error)
    return NextResponse.json({ error: 'Error al analizar la imagen' }, { status: 500 })
  }
}
