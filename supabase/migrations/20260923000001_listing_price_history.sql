-- Historial de precios de cada aviso: se muestra en la ficha ("bajó $X hace N días").
-- Lo llena un trigger, así queda registrado cualquier cambio de precio sin importar desde dónde
-- se haga (editar aviso, edición rápida del panel, admin o API).

CREATE TABLE IF NOT EXISTS listing_price_history (
  id            bigserial   PRIMARY KEY,
  listing_id    uuid        NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  old_price     numeric,
  new_price     numeric,
  old_currency  text,
  new_currency  text,
  changed_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_listing_price_history_listing
  ON listing_price_history (listing_id, changed_at DESC);

ALTER TABLE listing_price_history ENABLE ROW LEVEL SECURITY;

-- Lectura pública: es información que se muestra en la ficha del aviso.
-- No hay políticas de escritura: solo escribe el trigger (SECURITY DEFINER).
CREATE POLICY "anyone can read price history"
  ON listing_price_history FOR SELECT
  USING (true);

CREATE OR REPLACE FUNCTION log_listing_price_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.price IS DISTINCT FROM OLD.price OR NEW.currency IS DISTINCT FROM OLD.currency THEN
    INSERT INTO listing_price_history (listing_id, old_price, new_price, old_currency, new_currency)
    VALUES (NEW.id, OLD.price, NEW.price, OLD.currency, NEW.currency);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_listing_price_history ON listings;
CREATE TRIGGER trg_listing_price_history
  AFTER UPDATE OF price, currency ON listings
  FOR EACH ROW
  EXECUTE FUNCTION log_listing_price_change();
