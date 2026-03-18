-- Add show_phone flag to profiles (default true = visible)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_phone boolean NOT NULL DEFAULT true;
