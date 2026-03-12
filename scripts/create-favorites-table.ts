/**
 * Crea tabla listing_favorites
 * npx tsx scripts/create-favorites-table.ts
 */
import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  "https://hbeswalibpblqkrdqczh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiZXN3YWxpYnBibHFrcmRxY3poIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjYzNzgzOSwiZXhwIjoyMDg4MjEzODM5fQ.N7NFhS6hSfOpReke3Sg4DNnf2w2ni286JvVjReI0qiA",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Test if table already exists
const { data, error } = await sb.from("listing_favorites").select("user_id").limit(1);

if (!error) {
  console.log("✅ La tabla listing_favorites ya existe.");
  process.exit(0);
}

console.log("ℹ️  Tabla no existe, creándola via SQL editor de Supabase...");
console.log("\nEjecutá este SQL en el SQL Editor de Supabase:\n");
console.log(`
CREATE TABLE IF NOT EXISTS public.listing_favorites (
  user_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, listing_id)
);

ALTER TABLE public.listing_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see own favorites"
  ON public.listing_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON public.listing_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON public.listing_favorites FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.listing_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_listing ON public.listing_favorites(listing_id);
`);
