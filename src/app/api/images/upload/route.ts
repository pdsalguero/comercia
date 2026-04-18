import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import sharp from 'sharp'

const MAX_WIDTH = 1200
const MAX_HEIGHT = 1200
const WEBP_QUALITY = 82

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('file') as File
    const listingId = formData.get('listingId') as string

    if (!file) return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())

    // Comprimir a WebP: máx 1200×1200, calidad 82 — reduce ~90% el tamaño de fotos de celular
    const compressed = await sharp(buffer)
      .rotate()                          // preserva orientación EXIF
      .resize(MAX_WIDTH, MAX_HEIGHT, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer()

    const fileName = `${user.id}/${listingId ?? 'temp'}/${Date.now()}.webp`

    const { data, error } = await supabase.storage
      .from('listing-images')
      .upload(fileName, compressed, {
        contentType: 'image/webp',
        upsert: false,
        cacheControl: '604800',          // 1 semana — reduce re-fetches desde CDN
      })

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('listing-images')
      .getPublicUrl(data.path)

    return NextResponse.json({ url: publicUrl, path: data.path })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Error al subir imagen' }, { status: 500 })
  }
}
