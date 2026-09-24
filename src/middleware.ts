import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServiceClient } from '@/lib/supabase/service'
import { LANDING_KEYS, parseLandingPath, vehiclesHref } from '@/lib/vehicle-landing'

// Rutas que siguen accesibles en modo coming soon
const COMING_SOON_ALLOWED = ['/landing', '/api/', '/admin', '/login']

const BOT_UA_PATTERNS = ["node", "python-requests", "go-http-client", "curl/", "wget/"];

export async function middleware(request: NextRequest) {
  const ua = request.headers.get("user-agent") ?? "";
  if (BOT_UA_PATTERNS.some((p) => ua.toLowerCase().startsWith(p))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const { pathname } = request.nextUrl

  // ── Maintenance mode (sin llamadas a DB — funciona aunque Supabase esté caído) ──
  if (process.env.MAINTENANCE_MODE === 'true') {
    if (pathname !== '/mantenimiento' && !pathname.startsWith('/_next') && !pathname.startsWith('/api/')) {
      const url = request.nextUrl.clone()
      url.pathname = '/mantenimiento'
      return NextResponse.redirect(url)
    }
    if (pathname === '/mantenimiento') return NextResponse.next()
  }

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
        // is_admin es privado: con la clave de servicio (la sesión del usuario no lo puede leer)
        const { data: profile } = await createServiceClient()
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

  // /category: el tipo de vehículo es `type` (lo leen chip, breadcrumb y menú lateral). Los links viejos
  // con `sub_category` se redirigen acá y no en la página: con loading.tsx la página ya respondió 200
  // cuando llega a ejecutar redirect().
  if (pathname.startsWith('/category/')) {
    const params = new URLSearchParams(request.nextUrl.searchParams)
    const sub = params.get('sub_category')
    let changed = false
    if (sub && !params.get('type')) {
      params.set('type', sub)
      params.delete('sub_category')
      changed = true
    }
    // Listado de vehículos con tipo que tiene landing → URL limpia (/motos/benelli?…), 301 para que Google
    // pase la señal de las URLs viejas a las nuevas.
    const clean = pathname.replace(/\/+$/, '') === '/category/vehicles' ? vehiclesHref(params) : null
    if (clean && !clean.startsWith('/category/')) {
      return NextResponse.redirect(new URL(clean, request.url), 301)
    }
    if (changed) {
      const url = request.nextUrl.clone()
      url.search = params.toString()
      return NextResponse.redirect(url)
    }
  }

  // Landings limpias: se sirven con la página de categoría, sin cambiar la URL.
  const landing = parseLandingPath(pathname)
  if (landing) {
    const url = request.nextUrl.clone()
    url.pathname = '/category/vehicles'
    for (const k of LANDING_KEYS) url.searchParams.delete(k)
    url.searchParams.set('type', landing.type)
    if (landing.brand) url.searchParams.set('brand', landing.brand)
    if (landing.province) url.searchParams.set('v_province', landing.province)
    return await updateSession(request, url)
  }

  // La home es pública y se sirve desde caché: no consulta a Supabase Auth en cada visita.
  // La sesión se resuelve en el navegador (Navbar `loadUserOnClient`), que también renueva el token.
  if (pathname === '/') return NextResponse.next()

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
