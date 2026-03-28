-- Admin fields on profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_admin   BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS blocked_reason TEXT;

-- Listings: add removed_reason for admin removals
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS removed_by_admin BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS removed_reason   TEXT;

-- Set the site owner as admin (update with your actual user id if needed)
-- Run manually: UPDATE profiles SET is_admin = TRUE WHERE id = '<your-user-uuid>';
