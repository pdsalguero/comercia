import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { requestOrigin } from '@/lib/request-origin'
import { sendWelcomeIfJustConfirmed } from '@/lib/welcome-email'

// Links viejos de confirmación con ?code= (PKCE). Los mails nuevos usan /api/auth/confirm con token_hash,
// que funciona aunque el link se abra en otro navegador; esto queda para los links ya enviados.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  // Detrás del proxy de Railway, request.url es http://localhost:8080: el origen sale de los headers
  const origin = requestOrigin(request)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) return NextResponse.redirect(`${origin}/login?error=link_expirado`)
    sendWelcomeIfJustConfirmed(data?.user)
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}
