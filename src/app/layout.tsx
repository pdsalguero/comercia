import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const BASE = "https://cuyorodados.com.ar";

const SUPABASE_ORIGIN = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").origin;
  } catch {
    return null;
  }
})();

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: "CuyoRodados — Autos y motos en Mendoza, San Juan y San Luis",
    template: "%s | CuyoRodados",
  },
  description:
    "Comprá y vendé autos, motos, camionetas y más en Mendoza, San Juan y San Luis. Sacá una foto y publicá en 30 segundos, gratis y sin comisiones. Para particulares y concesionarias.",
  keywords: [
    "autos usados mendoza",
    "autos usados san juan",
    "autos usados san luis",
    "vender auto mendoza",
    "vender auto san juan",
    "comprar moto mendoza",
    "camionetas usadas cuyo",
    "clasificados de autos cuyo",
    "concesionarias mendoza",
    "concesionarias san juan",
    "publicar aviso gratis",
  ],
  openGraph: {
    title: "CuyoRodados — Autos y motos en Mendoza, San Juan y San Luis",
    description: "Sacá una foto y publicá tu vehículo en 30 segundos. Gratis y sin comisiones.",
    url: BASE,
    siteName: "CuyoRodados",
    locale: "es_AR",
    type: "website",
    images: [{ url: `${BASE}/og-image.jpg`, width: 1200, height: 630, alt: "CuyoRodados marketplace" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CuyoRodados — Autos y motos en Mendoza, San Juan y San Luis",
    description: "Sacá una foto y publicá tu vehículo en 30 segundos. Gratis y sin comisiones.",
    images: [`${BASE}/og-image.jpg`],
  },
  alternates: { canonical: BASE },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.variable}>
      <head>
        {/* Preconnect a dominios externos críticos para reducir latencia */}
        {/* Host de Supabase (fotos de avisos): se toma de la configuración para no quedar desactualizado */}
        {SUPABASE_ORIGIN && <link rel="preconnect" href={SUPABASE_ORIGIN} />}
        {SUPABASE_ORIGIN && <link rel="dns-prefetch" href={SUPABASE_ORIGIN} />}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body style={{ fontFamily: "var(--font-inter), 'Proxima Nova', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>{children}</body>
      {process.env.NODE_ENV === "production" && <GoogleAnalytics gaId="G-GQSJBS2HWF" />}
    </html>
  );
}
