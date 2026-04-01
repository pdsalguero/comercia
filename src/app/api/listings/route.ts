import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { listingPublishedTemplate } from '@/lib/emailTemplates'

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
        currency:       body.currency ?? 'ARS',
        accepts_offers: body.accepts_offers ?? true,
        condition:      body.condition,
        status:         'active',
        city:           'San Juan',
        neighborhood:   body.neighborhood ?? null,
        attributes:     body.attributes ?? null,
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
    const imageList: string[] = body.images ?? body.image_urls ?? [];
    if (imageList.length) {
      const imageRows = imageList.map((url: string, i: number) => ({
        listing_id: listing.id,
        url,
        position: i,
      }))
      await supabase.from('listing_images').insert(imageRows);
    }

    // ── Contribute new moto/cuatriciclo/utv model to DB ──────────
    const attrs = body.attributes ?? {};
    if (
      body.category_id === 2 &&
      ["moto", "cuatriciclo", "utv"].includes(attrs.sub_category) &&
      attrs.brand &&
      typeof attrs.model === "string" &&
      attrs.model.trim().length >= 2 &&
      attrs.model.trim().length <= 80 &&
      /^[\w\s\-\.\/]+$/i.test(attrs.model.trim())
    ) {
      const cc = Number(attrs.cilindrada) || null;
      supabase.rpc("contribute_vehicle_model", {
        p_tipo:       attrs.sub_category,
        p_brand:      attrs.brand,
        p_model:      attrs.model.trim(),
        p_cilindrada: cc && cc > 0 ? cc : null,
      }).then(({ error: e }) => {
        if (e) console.warn("[vehicle_models]", e.message);
      });
    }

    // Enviar email de publicación en vivo (fire-and-forget)
    if (user.email) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      const userName = profile?.full_name?.split(' ')[0] ?? user.email.split('@')[0]
      const BASE = (process.env.NEXT_PUBLIC_APP_URL ?? '').replace(/\/$/, '')
      const { subject, html } = listingPublishedTemplate({
        userName,
        listingTitle: listing.title,
        listingUrl: `${BASE}/listings/${listing.id}`,
      })
      sendEmail({ to: user.email, subject, html }).catch(console.error)
    }

    return NextResponse.json(listing)

  } catch (error) {
    console.error('Create listing error:', error)
    return NextResponse.json({ error: 'Error al crear el aviso' }, { status: 500 })
  }
}
