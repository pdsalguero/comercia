-- Corrección de pagos: después de la parte 1, la clave anónima seguía leyendo los 7 pagos (verificado el
-- 2026-09-24). O la política abierta tiene otro nombre en producción (no está en el repo como quedó) o la
-- tabla tiene RLS apagado. Esto no depende del nombre: borra todas las políticas de pagos y deja solo
-- "cada usuario ve sus pagos". El servidor usa la clave de servicio, que no pasa por RLS.

-- Para ver qué había antes (opcional, correr primero y guardar el resultado):
--   SELECT policyname, cmd, roles, qual, with_check FROM pg_policies WHERE schemaname = 'public' AND tablename = 'pagos';
--   SELECT relrowsecurity FROM pg_class WHERE oid = 'public.pagos'::regclass;

ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'pagos' LOOP
    EXECUTE format('DROP POLICY %I ON public.pagos', r.policyname);
  END LOOP;
END $$;

CREATE POLICY users_own_pagos ON public.pagos
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Nadie escribe pagos por la API: los crea y actualiza el servidor (checkout, webhook y callback de
-- Mercado Pago, crédito gratis) con la clave de servicio.
REVOKE INSERT, UPDATE, DELETE ON public.pagos FROM anon, authenticated;
