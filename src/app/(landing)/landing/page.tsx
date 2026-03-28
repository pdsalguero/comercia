import type { Metadata } from "next";
import { ComerxIALanding } from "@/components/ComerciaLanding";

export const metadata: Metadata = {
  title: "ComerxIA — Marketplace con IA para Argentina",
  description:
    "Publicá un aviso en 30 segundos. Sacá una foto y la IA redacta el título, descripción y precio. Gratis. Para Argentina.",
  keywords: ["marketplace", "clasificados", "argentina", "inteligencia artificial", "vender", "comprar", "san juan"],
  openGraph: {
    title: "ComerxIA — Vendé más rápido con IA",
    description: "Sacá una foto y la IA publica tu aviso en 30 segundos. Gratis.",
    type: "website",
    locale: "es_AR",
    siteName: "ComerxIA",
  },
  twitter: {
    card: "summary_large_image",
    title: "ComerxIA — Marketplace con IA",
    description: "Publicá un aviso en 30 segundos con inteligencia artificial.",
  },
};

export default function LandingPage() {
  return <ComerxIALanding />;
}
