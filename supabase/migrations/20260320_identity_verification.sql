-- Add identity verification fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS identity_verified       BOOLEAN       DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS identity_verified_method TEXT,        -- 'email' | 'phone'
  ADD COLUMN IF NOT EXISTS identity_verified_at    TIMESTAMPTZ;
