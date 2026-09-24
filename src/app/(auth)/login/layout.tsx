import type { Metadata } from "next";

// La página es de cliente: el título va acá. El noindex viene del layout de (auth).
export const metadata: Metadata = {
  title: "Ingresar",
  description: "Ingresá a CuyoRodados para publicar tu vehículo, responder consultas y ver tus favoritos.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
