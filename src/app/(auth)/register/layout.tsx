import type { Metadata } from "next";

// La página es de cliente: el título va acá. El noindex viene del layout de (auth).
export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Creá tu cuenta gratis en CuyoRodados y publicá tu auto o moto en Mendoza, San Juan y San Luis.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
