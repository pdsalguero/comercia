-- "Vendidos recientemente": el dueño marca su aviso como vendido (status = 'sold', que ya existía
-- en el enum) con la fecha real de venta. Se muestran en un carrusel del home y la ficha sigue
-- accesible con el cartel "Este vehículo ya se vendió". No aparecen en búsquedas ni en alertas
-- (esas consultas filtran status = 'active').

-- ── 1. Fecha de venta ──────────────────────────────────────────────────────────────────────────
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS sold_at timestamptz;

-- listings tiene permisos por columna (security_part2): la columna nueva hay que habilitarla
GRANT SELECT (sold_at) ON public.listings TO anon, authenticated;

-- sold_at coherente con el estado: al marcar vendido sin fecha (o con fecha futura) queda hoy;
-- si el aviso deja de estar vendido, se borra. El dueño puede poner una fecha pasada (la venta real).
CREATE OR REPLACE FUNCTION public.listings_sold_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'sold' THEN
    IF NEW.sold_at IS NULL OR NEW.sold_at > now() THEN
      NEW.sold_at := now();
    ELSIF NEW.sold_at < timestamptz '2000-01-01' THEN
      RAISE EXCEPTION 'Fecha de venta no válida' USING ERRCODE = '22007';
    END IF;
  ELSE
    NEW.sold_at := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS listings_sold_at ON public.listings;
CREATE TRIGGER listings_sold_at
  BEFORE INSERT OR UPDATE OF status, sold_at ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.listings_sold_at();

CREATE INDEX IF NOT EXISTS listings_sold_at_idx ON public.listings (sold_at DESC) WHERE status = 'sold';

-- ── 2. Lectura pública de los vendidos ─────────────────────────────────────────────────────────
-- Las políticas de lectura existentes (creadas desde el dashboard) no se tocan: esta se SUMA
-- (las políticas permisivas se combinan con OR). Los datos privados siguen protegidos por los
-- permisos por columna y la patente sigue en listing_private.
DROP POLICY IF EXISTS "public read sold listings" ON public.listings;
CREATE POLICY "public read sold listings" ON public.listings
  FOR SELECT TO anon, authenticated
  USING (status = 'sold');

DROP POLICY IF EXISTS "public read images of sold listings" ON public.listing_images;
CREATE POLICY "public read images of sold listings" ON public.listing_images
  FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.listings l WHERE l.id = listing_id AND l.status = 'sold'));
