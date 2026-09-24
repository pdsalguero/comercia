-- SEGURIDAD, PARTE 1: correr ANTES de desplegar el código de la Fase 5.
-- Cierra los agujeros críticos y agrega lo que el código nuevo necesita (public_phone, listing_private).
-- No quita lecturas que el código actual use: eso va en la parte 2, después del deploy.
--
-- "Usuario final" = pedido que llega por la API con la clave anónima o con la sesión de un usuario
-- (rol anon/authenticated en el JWT). La clave de servicio (servidor, cron, webhooks de Mercado Pago)
-- y el editor SQL no cuentan como usuario final y pueden seguir escribiendo todo.

CREATE OR REPLACE FUNCTION public.request_is_end_user()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role', '')
         IN ('anon', 'authenticated')
$$;

-- ── 1. pagos ─────────────────────────────────────────────────────────────────────────────────────
-- "service_all_pagos" era FOR ALL USING (true) sin "TO service_role": aplicaba a cualquiera, así que
-- con la clave anónima se podían leer (verificado) y probablemente modificar todos los pagos.
-- La clave de servicio no pasa por RLS, así que no hace falta ninguna política para el servidor.
-- Queda "users_own_pagos": cada usuario ve solo sus pagos.
DROP POLICY IF EXISTS "service_all_pagos" ON public.pagos;

-- ── 2. profiles: columnas que el usuario no puede cambiarse a sí mismo ─────────────────────────────
-- profiles_self_update deja actualizar la fila propia sin límite de columnas: cualquiera podía ponerse
-- is_admin = true, créditos de destacado o el sello de verificado. Esas columnas ahora solo las cambia
-- el servidor (clave de servicio). La verificación por email pasó a una acción de servidor.
CREATE OR REPLACE FUNCTION public.protect_profile_columns()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF public.request_is_end_user() AND (
       NEW.is_admin                 IS DISTINCT FROM OLD.is_admin
    OR NEW.is_blocked               IS DISTINCT FROM OLD.is_blocked
    OR NEW.blocked_at               IS DISTINCT FROM OLD.blocked_at
    OR NEW.blocked_reason           IS DISTINCT FROM OLD.blocked_reason
    OR NEW.free_destacado_credits   IS DISTINCT FROM OLD.free_destacado_credits
    OR NEW.identity_verified        IS DISTINCT FROM OLD.identity_verified
    OR NEW.identity_verified_method IS DISTINCT FROM OLD.identity_verified_method
    OR NEW.identity_verified_at     IS DISTINCT FROM OLD.identity_verified_at
    OR NEW.is_verified              IS DISTINCT FROM OLD.is_verified
    OR NEW.store_verified           IS DISTINCT FROM OLD.store_verified
    OR NEW.is_pro                   IS DISTINCT FROM OLD.is_pro
  ) THEN
    RAISE EXCEPTION 'No se pueden modificar esos datos del perfil' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_columns ON public.profiles;
CREATE TRIGGER protect_profile_columns
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_columns();

-- ── 3. listings: destacado, vistas y baja por admin solo desde el servidor ─────────────────────────
-- El dueño podía ponerse featured_level = 'gold' sin pagar (había incluso una ruta de la API que lo
-- hacía), inflar view_count o reactivar un aviso dado de baja por un admin.
CREATE OR REPLACE FUNCTION public.protect_listing_columns()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT public.request_is_end_user() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.featured_level   := NULL;
    NEW.is_featured      := false;
    NEW.featured_until   := NULL;
    NEW.destacado_activo := false;
    NEW.destacado_hasta  := NULL;
    NEW.destacado_tipo   := NULL;
    NEW.view_count       := 0;
    NEW.removed_by_admin := false;
    NEW.removed_reason   := NULL;
    IF NEW.status = 'removed' THEN
      RAISE EXCEPTION 'Estado no permitido' USING ERRCODE = '42501';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.featured_level   IS DISTINCT FROM OLD.featured_level
  OR NEW.is_featured      IS DISTINCT FROM OLD.is_featured
  OR NEW.featured_until   IS DISTINCT FROM OLD.featured_until
  OR NEW.destacado_activo IS DISTINCT FROM OLD.destacado_activo
  OR NEW.destacado_hasta  IS DISTINCT FROM OLD.destacado_hasta
  OR NEW.destacado_tipo   IS DISTINCT FROM OLD.destacado_tipo
  OR NEW.view_count       IS DISTINCT FROM OLD.view_count
  OR NEW.removed_by_admin IS DISTINCT FROM OLD.removed_by_admin
  OR NEW.removed_reason   IS DISTINCT FROM OLD.removed_reason
  OR NEW.fraud_score      IS DISTINCT FROM OLD.fraud_score
  OR NEW.fraud_flags      IS DISTINCT FROM OLD.fraud_flags
  OR (OLD.status = 'removed' AND NEW.status IS DISTINCT FROM OLD.status)
  OR (NEW.status = 'removed' AND OLD.status IS DISTINCT FROM 'removed')
  THEN
    RAISE EXCEPTION 'No se pueden modificar esos datos del aviso' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_listing_columns ON public.listings;
CREATE TRIGGER protect_listing_columns
  BEFORE INSERT OR UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_listing_columns();

-- ── 4. Teléfono público ─────────────────────────────────────────────────────────────────────────
-- La lectura pública de profiles devolvía `phone` aunque el vendedor tuviera "mostrar teléfono"
-- apagado. public_phone es el teléfono solo si se puede mostrar (show_phone nulo cuenta como sí, igual
-- que en el código). El código nuevo lee public_phone; la parte 2 le quita a la API la lectura de phone.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS public_phone text
  GENERATED ALWAYS AS (CASE WHEN show_phone IS DISTINCT FROM false THEN phone END) STORED;

-- ── 5. Patente privada ──────────────────────────────────────────────────────────────────────────
-- La patente vivía en listings.attributes, legible por cualquiera aunque el vendedor no tildara
-- "Mostrar patente". Ahora va acá (solo la ve el dueño) y en attributes queda solo si se muestra.
CREATE TABLE IF NOT EXISTS public.listing_private (
  listing_id uuid PRIMARY KEY REFERENCES public.listings(id) ON DELETE CASCADE,
  patente    text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.listing_private ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner reads private listing data" ON public.listing_private;
CREATE POLICY "owner reads private listing data" ON public.listing_private
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.listings l WHERE l.id = listing_id AND l.user_id = auth.uid()));
-- Sin políticas de escritura: escribe solo el servidor (clave de servicio).

-- Mover las patentes que hoy no se muestran y sacar _patente_info (copia interna de la IA) de todos
-- los avisos. Con los triggers apagados solo en esta transacción, para no tocar updated_at.
BEGIN;
SET LOCAL session_replication_role = replica;

INSERT INTO public.listing_private (listing_id, patente)
SELECT id, upper(trim(attributes ->> 'patente'))
FROM public.listings
WHERE coalesce(attributes ->> 'patente', '') <> ''
  AND coalesce(attributes ->> 'show_patente', 'false') <> 'true'
ON CONFLICT (listing_id) DO UPDATE SET patente = EXCLUDED.patente, updated_at = now();

UPDATE public.listings
SET attributes = CASE
      WHEN coalesce(attributes ->> 'show_patente', 'false') = 'true' THEN attributes - '_patente_info'
      ELSE attributes - 'patente' - '_patente_info'
    END
WHERE attributes ? 'patente' OR attributes ? '_patente_info';

COMMIT;

-- ── 6. Registro de vistas ───────────────────────────────────────────────────────────────────────
-- Era de lectura pública (todas las vistas de todos los avisos) y de inserción libre (se podían inflar
-- vistas por la API). Lo escribe solo el servidor (/api/listings/view, con clave de servicio) y cada
-- dueño lee las de sus avisos (panel). El total del home se cuenta en el servidor.
DROP POLICY IF EXISTS "Anyone can read views" ON public.listing_views_log;
DROP POLICY IF EXISTS "Anyone can insert view" ON public.listing_views_log;
DROP POLICY IF EXISTS "owners read views of own listings" ON public.listing_views_log;
CREATE POLICY "owners read views of own listings" ON public.listing_views_log
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.listings l WHERE l.id = listing_id AND l.user_id = auth.uid()));
