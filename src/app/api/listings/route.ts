import { createClient } from '@/lib/supabase/server'
import { publicAppUrl } from '@/lib/site-url';
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { sendEmail } from '@/lib/email'
import { listingPublishedTemplate } from '@/lib/emailTemplates'
import { isCategoryEnabled } from '@/lib/site-config'
import { normalizeVehicleAttributes, savePrivatePatente, splitPrivateAttributes } from '@/lib/vehicle-attributes'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await request.json()
    // Combustible/transmisión sin tildes y modelo con el nombre del catálogo: así los filtros los encuentran.
    body.attributes = normalizeVehicleAttributes(body.attributes)
    // La patente va a listing_private salvo que el vendedor elija mostrarla (ver lib/vehicle-attributes)
    const { publicAttrs, patente } = splitPrivateAttributes(body.attributes ?? {})
    body.attributes = publicAttrs

    if (!isCategoryEnabled(Number(body.category_id))) {
      return NextResponse.json(
        { error: 'Por ahora solo se pueden publicar vehículos.' },
        { status: 400 }
      )
    }

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
        city:           body.city ?? null,
        neighborhood:   body.neighborhood ?? null,
        attributes:     body.attributes ?? null,
        ai_generated:   body.ai_generated ?? false,
        ai_title:       body.ai_title ?? null,
        ai_description: body.ai_description ?? null,
        ai_price_min:   body.ai_price_min ?? null,
        ai_price_max:   body.ai_price_max ?? null,
        ai_confidence:  body.ai_confidence ?? null,
      })
      // Columnas explícitas: con la sesión del usuario no todas son legibles (fraud_*, removed_*, ai_*)
      .select('id, title')
      .single()

    if (error) throw error
    if (patente) await savePrivatePatente(listing.id, patente)

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
      const BASE = publicAppUrl()
      const { subject, html } = listingPublishedTemplate({
        userName,
        listingTitle: listing.title,
        listingUrl: `${BASE}/listings/${listing.id}`,
      })
      sendEmail({ to: user.email, subject, html }).catch(console.error)
    }

    // Invalidar caché de home y listings para que el nuevo aviso aparezca de inmediato
    revalidatePath('/', 'layout')
    revalidatePath('/listings', 'page')

    return NextResponse.json(listing)

  } catch (error) {
    console.error('Create listing error:', error)
    return NextResponse.json({ error: 'Error al crear el aviso' }, { status: 500 })
  }
}
