-- Allow anyone to read profiles (needed for public store pages)
-- This is safe: profiles only contain public-facing info (name, store details)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'profiles_public_read'
  ) THEN
    CREATE POLICY profiles_public_read ON profiles FOR SELECT USING (true);
  END IF;
END $$;
