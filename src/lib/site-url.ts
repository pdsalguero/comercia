// URL pública canónica del sitio. Todo link absoluto de SEO o para compartir (canonical, sitemap, robots,
// botón Compartir) sale de acá y no de window.location.origin: un link copiado en un preview o en local
// apunta igual al dominio real. No usa NEXT_PUBLIC_APP_URL a propósito: esa es la URL del entorno
// (localhost en desarrollo) para callbacks de pago y mails.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://cuyorodados.com.ar").replace(/\/+$/, "");

/** "/motos" → "https://cuyorodados.com.ar/motos" */
export const absoluteUrl = (path: string) => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
