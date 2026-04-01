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
      // Los admins logueados pueden ver todo el sitio igualmente
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
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
    }
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
