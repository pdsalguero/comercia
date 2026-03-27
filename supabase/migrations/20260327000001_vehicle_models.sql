-- Table for user-contributed vehicle models (motos, cuatriciclos, UTVs)
-- Auto-populated when a listing is published with a model not in the static list

CREATE TABLE IF NOT EXISTS vehicle_models (
  id            BIGSERIAL PRIMARY KEY,
  tipo          TEXT NOT NULL,       -- moto | cuatriciclo | utv
  brand         TEXT NOT NULL,       -- normalized brand value (e.g. "yamaha", "can_am")
  model         TEXT NOT NULL,       -- model name as typed/detected
  cilindrada    INTEGER,             -- cc, if known
  listing_count INTEGER DEFAULT 1,  -- how many times this model has been published
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tipo, brand, model)
);

-- RLS
ALTER TABLE vehicle_models ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read"          ON vehicle_models FOR SELECT USING (true);
CREATE POLICY "authenticated insert" ON vehicle_models FOR INSERT  TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated update" ON vehicle_models FOR UPDATE  TO authenticated USING (true);

-- Function: insert model or increment count if it already exists
CREATE OR REPLACE FUNCTION contribute_vehicle_model(
  p_tipo       TEXT,
  p_brand      TEXT,
  p_model      TEXT,
  p_cilindrada INTEGER DEFAULT NULL
) RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  INSERT INTO vehicle_models (tipo, brand, model, cilindrada)
  VALUES (p_tipo, p_brand, p_model, p_cilindrada)
  ON CONFLICT (tipo, brand, model) DO UPDATE
    SET listing_count = vehicle_models.listing_count + 1,
        updated_at    = NOW(),
        cilindrada    = COALESCE(vehicle_models.cilindrada, EXCLUDED.cilindrada);
$$;
