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
      const url = request.nextUrl.clone()
      url.pathname = '/landing'
      return NextResponse.redirect(url)
    }
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
