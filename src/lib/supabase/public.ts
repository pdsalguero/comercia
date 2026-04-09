import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase sin cookies — apto para unstable_cache.
 * Usar SOLO para queries de datos públicos (listings activos, perfiles de tiendas, etc.)
 * que no requieren contexto de autenticación del usuario.
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
