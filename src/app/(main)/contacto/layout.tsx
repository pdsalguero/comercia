import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site-url";

// La página es de cliente: la metadata va acá.
export const metadata: Metadata = {
  title: "Contacto",
  description: "Escribinos por consultas, sugerencias o problemas con un aviso. Respondemos en menos de 24 horas.",
  alternates: { canonical: absoluteUrl("/contacto") },
};

export default function ContactoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
