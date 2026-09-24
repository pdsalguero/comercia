// Verificación de administrador para rutas y páginas del servidor. El usuario sale de la sesión
// (getUser valida el token contra Supabase) y el flag is_admin se lee con la clave de servicio:
// las columnas privadas de profiles (is_admin, créditos, bloqueo) no son legibles con la sesión
// del usuario ni con la clave anónima.
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function getSessionUser(): Promise<User | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/** Columnas privadas del perfil del usuario logueado (solo servidor). */
export async function getOwnPrivateProfile<T extends string>(userId: string, columns: T) {
  const { data } = await createServiceClient().from("profiles").select(columns).eq("id", userId).maybeSingle();
  return data as Record<string, unknown> | null;
}

export async function isAdminUser(userId: string): Promise<boolean> {
  const p = await getOwnPrivateProfile(userId, "is_admin");
  return p?.is_admin === true;
}

/** El usuario logueado si es administrador; si no, null. */
export async function requireAdmin(): Promise<User | null> {
  const user = await getSessionUser();
  if (!user) return null;
  return (await isAdminUser(user.id)) ? user : null;
}
