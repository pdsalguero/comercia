import { anthropic } from './client'

export interface AIListingResult {
  title: string
  description: string
  category: string
  category_id: number
  condition: string
  confidence: number
  // Precio ahora viene de mercado, no de la IA
  price_suggested: number | null
  price_min: number | null
  price_max: number | null
  price_avg: number | null
  price_source: 'market' | 'none'
  price_sample_size: number
}

const CATEGORY_MAP: Record<string, number> = {
  electronics:   1,
  vehicles:      2,
  'real-estate': 3,
  clothing:      4,
  'home-garden': 5,
  sports:        6,
  tools:         7,
  books:         8,
  pets:          9,
  other:         10,
}

export async function analyzePhoto(
  base64Image: string,
  mediaType: string
): Promise<AIListingResult> {
  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/webp',
              data: base64Image,
            },
          },
          {
            type: 'text',
            text: `Analizá esta imagen para un marketplace de clasificados en San Juan, Argentina.

Respondé SOLO con un JSON válido, sin texto adicional, sin markdown, sin backticks:

{
  "title": "título atractivo y descriptivo del producto (máx 60 caracteres)",
  "description": "descripción detallada en español argentino, mencioná características, estado, marca si se ve (150-250 caracteres)",
  "category": "una de: electronics, vehicles, real-estate, clothing, home-garden, sports, tools, books, pets, other",
  "condition": "una de: new, like_new, very_good, good, fair, for_parts",
  "confidence": número entre 0 y 1 indicando qué tan seguro estás del análisis
}`,
          },
        ],
      },
    ],
  })

  const text = response.content
    .filter(b => b.type === 'text')
    .map(b => (b as { type: 'text'; text: string }).text)
    .join('')

  const cleaned = text.replace(/```json|```/g, '').trim()
  const parsed  = JSON.parse(cleaned)

  return {
    ...parsed,
    category_id:       CATEGORY_MAP[parsed.category] ?? 10,
    price_suggested:   null,
    price_min:         null,
    price_max:         null,
    price_avg:         null,
    price_source:      'none',
    price_sample_size: 0,
  }
}
