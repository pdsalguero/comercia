// URL pública canónica del sitio. Todo link absoluto de SEO o para compartir (canonical, sitemap, robots,
// botón Compartir) sale de acá y no de window.location.origin: un link copiado en un preview o en local
// apunta igual al dominio real. No usa NEXT_PUBLIC_APP_URL a propósito: esa es la URL del entorno
// (localhost en desarrollo) para callbacks de pago y mails.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://cuyorodados.com.ar").replace(/\/+$/, "");

/**
 * URL pública de la app para links que salen hacia afuera (retorno y webhook de Mercado Pago, mails).
 * Tolera errores de carga de la variable: comillas o espacios de más (pasó en Railway:
 * `"https://…` con la comilla adentro, y Mercado Pago respondía "back_urls invalid. Wrong format") o
 * falta de https://. Si apunta a localhost usa el dominio público: Mercado Pago no acepta localhost.
 */
export function publicAppUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_APP_URL ?? "").trim().replace(/^["'\\]+|["'\\]+$/g, "").trim().replace(/\/+$/, "");
  if (!raw) return SITE_URL;
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/i.test(withScheme) ? SITE_URL : withScheme;
}

/** "/motos" → "https://cuyorodados.com.ar/motos" */
export const absoluteUrl = (path: string) => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
