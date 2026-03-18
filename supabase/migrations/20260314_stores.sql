-- Virtual stores: add store fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS store_name        TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS store_slug        TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS store_type        TEXT DEFAULT 'particular';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS store_logo_url    TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS store_banner_url  TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS store_description TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS store_whatsapp    TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS store_address     TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_store          BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS store_verified    BOOLEAN DEFAULT FALSE;

-- Index for fast slug lookup
CREATE UNIQUE INDEX IF NOT EXISTS profiles_store_slug_idx ON profiles (store_slug) WHERE store_slug IS NOT NULL;

-- FK from listings.user_id → profiles.id so PostgREST can join them directly
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'listings_user_id_profiles_fkey'
      AND table_name = 'listings'
  ) THEN
    ALTER TABLE listings
      ADD CONSTRAINT listings_user_id_profiles_fkey
      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;
