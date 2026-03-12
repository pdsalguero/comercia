-- Ejecutar en: https://supabase.com/dashboard → SQL Editor
-- Proyecto: hbeswalibpblqkrdqczh

CREATE TABLE IF NOT EXISTS public.listing_favorites (
  user_id    uuid NOT NULL REFERENCES auth.users(id)       ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES public.listings(id)  ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, listing_id)
);

ALTER TABLE public.listing_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own" ON public.listing_favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "insert_own" ON public.listing_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own" ON public.listing_favorites
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_fav_user    ON public.listing_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_fav_listing ON public.listing_favorites(listing_id);
