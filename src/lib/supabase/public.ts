import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase sin cookies — apto para unstable_cache y queries públicas.
 * Usar SOLO para datos públicos (listings activos, perfiles de tiendas, etc.)
 * que no requieren contexto de autenticación del usuario.
 *
 * Singleton: ver service.ts para racional. Crear cliente nuevo por request
 * acumula memoria por las conexiones HTTP keep-alive y estado interno.
 */
let _instance: SupabaseClient | null = null;

export function createPublicClient(): SupabaseClient {
  if (!_instance) {
    _instance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: { persistSession: false, autoRefreshToken: false },
      }
    );
  }
  return _instance;
}
