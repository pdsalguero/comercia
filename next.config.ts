import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    unoptimized: true,
  },
  // Dominio anterior (ComerxIA): si sigue apuntando a este deploy, manda todo al dominio nuevo con
  // 301, conservando la ruta, para no perder links compartidos ni lo que Google ya tiene indexado.
  async redirects() {
    return ["comerxia.com.ar", "www.comerxia.com.ar"].map((host) => ({
      source: "/:path*",
      has: [{ type: "host" as const, value: host }],
      destination: "https://cuyorodados.com.ar/:path*",
      permanent: true,
    }));
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "ngrok-skip-browser-warning",
            value: "true",
          },
        ],
      },
      // Agresivo cache para assets estáticos de Next.js.
      // Solo en producción: ahí los archivos llevan hash de contenido. En desarrollo el nombre
      // NO cambia cuando cambia el contenido, y "immutable" dejaba al navegador con CSS/JS viejo.
      ...(isProd
        ? [
            {
              source: "/_next/static/(.*)",
              headers: [
                {
                  key: "Cache-Control",
                  value: "public, max-age=31536000, immutable",
                },
              ],
            },
          ]
        : []),
      // Imágenes propias de la portada (hero, marca del logo):los archivos de /public no llevan hash,
      // por eso la caché es de un día (con revalidación en segundo plano) y no "immutable".
      {
        source: "/:file(hero-.*\\.webp|logo-mark\\.svg)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      // Cache moderado para imágenes optimizadas
      {
        source: "/_next/image(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG ?? "comerxia",
  project: process.env.SENTRY_PROJECT ?? "javascript-nextjs",
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  widenClientFileUpload: true,
  sourcemaps: { disable: true },
  telemetry: false,
});
