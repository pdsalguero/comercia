import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await request.json()

    const { data: listing, error } = await supabase
      .from('listings')
      .insert({
        user_id:        user.id,
        category_id:    body.category_id,
        title:          body.title,
        description:    body.description,
        price:          body.price,
        accepts_offers: body.accepts_offers ?? true,
        condition:      body.condition,
        status:         'active',
        city:           'San Juan',
        neighborhood:   body.neighborhood ?? null,
        ai_generated:   body.ai_generated ?? false,
        ai_title:       body.ai_title ?? null,
        ai_description: body.ai_description ?? null,
        ai_price_min:   body.ai_price_min ?? null,
        ai_price_max:   body.ai_price_max ?? null,
        ai_confidence:  body.ai_confidence ?? null,
      })
      .select()
      .single()

    if (error) throw error

    // Save images if provided
    if (body.images?.length) {
      const imageRows = body.images.map((url: string, i: number) => ({
        listing_id: listing.id,
        url,
        position: i,
      }))
      await supabase.from('listing_images').insert(imageRows)
    }

    return NextResponse.json(listing)

  } catch (error) {
    console.error('Create listing error:', error)
    return NextResponse.json({ error: 'Error al crear el aviso' }, { status: 500 })
  }
}
