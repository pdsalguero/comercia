import { redirect } from "next/navigation";

// Ruta vieja: la configuración vive en /dashboard/settings (esta copia leía columnas privadas del
// perfil desde el navegador).
export default function LegacySettingsRedirect() {
  redirect("/dashboard/settings");
}
