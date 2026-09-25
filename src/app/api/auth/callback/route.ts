import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { requestOrigin, safeNextPath } from '@/lib/request-origin'

// Links con ?code= (PKCE) de recuperar contraseña. Solo funcionan en el mismo navegador donde se pidió
// el mail; los templates nuevos usan /api/auth/confirm con token_hash. Esto queda para links ya enviados.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  // Detrás del proxy de Railway, request.url es http://localhost:8080: el origen sale de los headers
  const origin = requestOrigin(request)
  const code = searchParams.get('code')
  const next = safeNextPath(searchParams.get('next'))

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=link_expirado`)
}
