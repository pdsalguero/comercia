import type { Metadata } from "next";

// La página es de cliente: el título va acá.
export const metadata: Metadata = { title: "Configuración", description: "Tu perfil, contacto y verificación de identidad." };

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
