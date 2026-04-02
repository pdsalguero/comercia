-- Allow authenticated users to update their own profile row
CREATE POLICY profiles_self_update ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
