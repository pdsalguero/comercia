-- Log de visitas con timestamp para poder filtrar por día
CREATE TABLE IF NOT EXISTS public.listing_views_log (
  id         BIGSERIAL PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS listing_views_log_created_at_idx ON public.listing_views_log (created_at);
CREATE INDEX IF NOT EXISTS listing_views_log_listing_id_idx ON public.listing_views_log (listing_id);

-- RLS: solo lectura pública, inserción libre (anónima para contar visitas)
ALTER TABLE public.listing_views_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert view" ON public.listing_views_log FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read views" ON public.listing_views_log FOR SELECT USING (true);
