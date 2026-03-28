-- ── Tabla pagos ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pagos (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id        UUID        REFERENCES listings(id) ON DELETE SET NULL,
  user_id           UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  plan_key          TEXT        NOT NULL,                  -- ej: silver_30
  plan_name         TEXT        NOT NULL,                  -- ej: Destacado 30 días
  amount            NUMERIC     NOT NULL,
  days              INTEGER     NOT NULL,
  featured_level    TEXT        NOT NULL,                  -- bronze | silver | gold
  mp_preference_id  TEXT,
  mp_payment_id     TEXT,
  mp_status         TEXT        NOT NULL DEFAULT 'pending', -- pending | approved | rejected | cancelled
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices útiles
CREATE INDEX IF NOT EXISTS pagos_listing_id_idx ON pagos(listing_id);
CREATE INDEX IF NOT EXISTS pagos_user_id_idx    ON pagos(user_id);
CREATE INDEX IF NOT EXISTS pagos_mp_payment_idx ON pagos(mp_payment_id);

-- RLS
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_pagos"   ON pagos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "service_all_pagos" ON pagos FOR ALL  USING (true) WITH CHECK (true);

-- ── Campos destacado en listings ──────────────────────────────
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS destacado_activo BOOLEAN     NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS destacado_hasta  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS destacado_tipo   TEXT;        -- bronze | silver | gold
