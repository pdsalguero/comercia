import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Rutas que siguen accesibles en modo coming soon
const COMING_SOON_ALLOWED = ['/landing', '/api/', '/admin', '/login']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Coming soon mode ──────────────────────────────────────────────────────
  if (process.env.COMING_SOON === 'true') {
    const isAllowed = COMING_SOON_ALLOWED.some((p) => pathname.startsWith(p))
    if (!isAllowed) {
      // Crear cliente con manejo correcto de cookies para que el token se refresque
      let response = NextResponse.next({ request })
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll: () => request.cookies.getAll(),
            setAll: (cookiesToSet) => {
              cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
              response = NextResponse.next({ request })
              cookiesToSet.forEach(({ name, value, options }) =>
                response.cookies.set(name, value, options)
              )
            },
          },
        }
      )

      const { data: { user } } = await supabase.auth.getUser()
      let isAdmin = false
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single()
        isAdmin = profile?.is_admin === true
      }

      if (!isAdmin) {
        const url = request.nextUrl.clone()
        url.pathname = '/landing'
        return NextResponse.redirect(url)
      }

      // Admin verificado — continuar con sesión actualizada
      return response
    }
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
