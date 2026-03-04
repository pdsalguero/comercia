import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('file') as File
    const listingId = formData.get('listingId') as string

    if (!file) return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 })

    const ext = file.name.split('.').pop() ?? 'jpg'
    const fileName = `${user.id}/${listingId ?? 'temp'}/${Date.now()}.${ext}`

    const { data, error } = await supabase.storage
      .from('listing-images')
      .upload(fileName, file, { contentType: file.type, upsert: false })

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
