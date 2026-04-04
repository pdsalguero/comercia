-- Créditos gratuitos de destacado Gold para los primeros 100 usuarios

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS free_destacado_credits INT NOT NULL DEFAULT 0;

-- Trigger: los primeros 100 usuarios en registrarse reciben 10 créditos Gold
CREATE OR REPLACE FUNCTION assign_early_adopter_credits()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.profiles) < 100 THEN
    NEW.free_destacado_credits := 10;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_early_adopter_credits ON profiles;
CREATE TRIGGER trg_early_adopter_credits
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION assign_early_adopter_credits();

-- RPC: decrementa 1 crédito si el usuario tiene > 0, retorna TRUE si tuvo éxito
CREATE OR REPLACE FUNCTION decrement_free_credit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  updated_rows INT;
BEGIN
  UPDATE profiles
  SET free_destacado_credits = free_destacado_credits - 1
  WHERE id = p_user_id
    AND free_destacado_credits > 0;

  GET DIAGNOSTICS updated_rows = ROW_COUNT;
  RETURN updated_rows > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
