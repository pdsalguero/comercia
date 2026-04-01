import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { welcomeEmailTemplate } from '@/lib/emailTemplates'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data } = await supabase.auth.exchangeCodeForSession(code)

    // Solo enviar bienvenida en el primer login (registro)
    if (data?.user) {
      const createdAt = new Date(data.user.created_at).getTime()
      const isNewUser = Date.now() - createdAt < 60_000 // menos de 1 minuto

      if (isNewUser && data.user.email) {
        const userName = data.user.user_metadata?.full_name?.split(' ')[0]
          ?? data.user.email.split('@')[0]

        const { subject, html } = welcomeEmailTemplate(userName)
        sendEmail({ to: data.user.email, subject, html }).catch(console.error)
      }
    }
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}
