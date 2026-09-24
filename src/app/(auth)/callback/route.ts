import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { welcomeEmailTemplate } from '@/lib/emailTemplates'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) return NextResponse.redirect(`${origin}/login?error=link_expirado`)

    // Bienvenida solo al confirmar el registro: el mail se acaba de confirmar (este link es el de
    // confirmación). Antes se miraba created_at < 1 minuto y casi nunca se cumplía, porque la gente
    // tarda más que eso en abrir el mail.
    if (data?.user) {
      const confirmedAt = data.user.email_confirmed_at ? new Date(data.user.email_confirmed_at).getTime() : 0
      const justConfirmed = Date.now() - confirmedAt < 10 * 60_000

      if (justConfirmed && data.user.email) {
        const userName = data.user.user_metadata?.full_name?.split(' ')[0]
          ?? data.user.email.split('@')[0]

        const { subject, html } = welcomeEmailTemplate(userName)
        sendEmail({ to: data.user.email, subject, html }).catch(console.error)
      }
    }
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}
