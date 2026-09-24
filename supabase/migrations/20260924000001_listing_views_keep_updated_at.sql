-- Que sumar una vista no cambie listings.updated_at.
--
-- /api/listings/view actualiza view_count y el trigger de updated_at de listings (creado desde el panel de
-- Supabase, no está en estas migraciones) lo pisa con now() en cada vista. El sitemap usa updated_at como
-- lastmod, así que para Google todos los avisos "cambiaban" a cada rato.
--
-- En vez de tocar ese trigger (no sabemos su nombre), se agrega otro BEFORE UPDATE que corre después
-- (Postgres ejecuta los triggers del mismo evento en orden alfabético; "zz_" queda último) y, si lo único
-- que cambió es view_count, restaura el updated_at anterior.

CREATE OR REPLACE FUNCTION public.keep_updated_at_on_view_only()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF (to_jsonb(NEW) - 'view_count' - 'updated_at') = (to_jsonb(OLD) - 'view_count' - 'updated_at') THEN
    NEW.updated_at := OLD.updated_at;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS zz_keep_updated_at_on_view_only ON public.listings;
CREATE TRIGGER zz_keep_updated_at_on_view_only
  BEFORE UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.keep_updated_at_on_view_only();

-- Corrección única de los valores ya pisados por vistas: updated_at pasa a ser el último cambio real
-- conocido (publicación, "subido" o cambio de precio). Con los triggers apagados solo para esta
-- transacción: si no, el de updated_at volvería a poner now() y el nuevo restauraría el valor viejo.
BEGIN;
SET LOCAL session_replication_role = replica;
UPDATE public.listings l
SET updated_at = GREATEST(
  l.created_at,
  COALESCE(l.bumped_at, l.created_at),
  COALESCE((SELECT max(h.changed_at) FROM public.listing_price_history h WHERE h.listing_id = l.id), l.created_at)
);
COMMIT;
