import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const BASE = "https://comerxia.com.ar";

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: "ComerxIA — Comprá y vendé autos y motos en todo el país",
    template: "%s | ComerxIA",
  },
  description:
    "Comprá y vendé autos, motos, camionetas y más en toda la Argentina. Sacá una foto y publicá en 30 segundos, gratis y sin comisiones. Para particulares y concesionarias.",
  keywords: [
    "clasificados argentina",
    "comprar auto usado argentina",
    "vender online argentina",
    "marketplace argentina",
    "avisos clasificados",
    "comprar moto argentina",
    "vender auto argentina",
    "camionetas usadas argentina",
    "clasificados san juan",
    "concesionarias argentina",
    "publicar aviso gratis",
  ],
  openGraph: {
    title: "ComerxIA — Comprá y vendé autos y motos en todo el país",
    description: "Sacá una foto y publicá tu vehículo en 30 segundos. Gratis y sin comisiones.",
    url: BASE,
    siteName: "ComerxIA",
    locale: "es_AR",
    type: "website",
    images: [{ url: `${BASE}/og-image.jpg`, width: 1200, height: 630, alt: "ComerxIA marketplace" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ComerxIA — Comprá y vendé autos y motos en todo el país",
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
        <link rel="preconnect" href="https://snrxpyolkxcficxnzaxh.supabase.co" />
        <link rel="dns-prefetch" href="https://snrxpyolkxcficxnzaxh.supabase.co" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body style={{ fontFamily: "var(--font-inter), 'Proxima Nova', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>{children}</body>
      {process.env.NODE_ENV === "production" && <GoogleAnalytics gaId="G-GQSJBS2HWF" />}
    </html>
  );
}
