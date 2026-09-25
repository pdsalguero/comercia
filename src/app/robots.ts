import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

// Los listados con filtros ya no se bloquean acá: llevan `noindex, follow` en la metadata (Google tiene
// que poder entrar para verlo) y las landings limpias (/motos, /autos/toyota…) son indexables.
// Login y registro también van con `noindex` en vez de bloqueo.
// /_next/ no se bloquea: ahí están el CSS y el JS, y Google los necesita para renderizar la página
// (bloqueados, la ve rota o "no apta para móviles").
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/admin", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
