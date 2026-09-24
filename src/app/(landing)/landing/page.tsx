import type { Metadata } from "next";
import { CuyoRodadosLanding } from "@/components/ComerciaLanding";

export const metadata: Metadata = {
  title: { absolute: "CuyoRodados — Vendé tu auto o moto en 30 segundos" },
  description:
    "Sacá una foto de tu vehículo y publicá en 30 segundos: te armamos el título, la descripción y el precio sugerido. Gratis, para particulares y concesionarias de Mendoza, San Juan y San Luis.",
  keywords: ["autos usados", "motos usadas", "camionetas", "clasificados de autos", "mendoza", "san juan", "san luis", "vender auto", "comprar auto", "concesionarias", "publicar gratis"],
  openGraph: {
    title: "CuyoRodados — Vendé tu auto o moto en Cuyo",
    description: "Sacá una foto y publicá tu vehículo en 30 segundos. Gratis.",
    type: "website",
    locale: "es_AR",
    siteName: "CuyoRodados",
  },
  twitter: {
    card: "summary_large_image",
    title: "CuyoRodados — Vendé tu auto o moto en 30 segundos",
    description: "Sacá una foto y publicá tu vehículo. Gratis, para particulares y concesionarias.",
  },
};

export default function LandingPage() {
  return <CuyoRodadosLanding />;
}
