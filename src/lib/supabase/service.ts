import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client — bypasses RLS. Only use in trusted server contexts.
 *
 * Singleton: cada instancia de SupabaseClient mantiene estado interno (auth,
 * realtime, storage, postgres) y conexiones HTTP keep-alive. Crear uno por
 * request causa acumulación de memoria. Como no depende de cookies/sesión,
 * un único cliente compartido es seguro.
 */
let _instance: SupabaseClient | null = null;

export function createServiceClient(): SupabaseClient {
  if (!_instance) {
    _instance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: { persistSession: false, autoRefreshToken: false },
      }
    );
  }
  return _instance;
}
