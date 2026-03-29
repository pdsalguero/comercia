ALTER TABLE page_views
  ADD COLUMN IF NOT EXISTS device_type  TEXT,   -- mobile | tablet | desktop
  ADD COLUMN IF NOT EXISTS browser      TEXT,   -- chrome | safari | firefox | edge | other
  ADD COLUMN IF NOT EXISTS ip_hash      TEXT,   -- sha256 of IP (anon unique visitor)
  ADD COLUMN IF NOT EXISTS country      TEXT,   -- CF-IPCountry header
  ADD COLUMN IF NOT EXISTS language     TEXT;   -- Accept-Language (first tag)
