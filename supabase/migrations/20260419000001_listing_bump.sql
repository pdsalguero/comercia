-- Bump feature: permite al usuario "subir" su aviso al tope de la lista
-- Cooldown de 3 días entre bumps por publicación

ALTER TABLE listings ADD COLUMN IF NOT EXISTS bumped_at TIMESTAMPTZ;

-- Índice funcional para el ordenamiento por defecto (GREATEST usa el mayor de los dos)
CREATE INDEX IF NOT EXISTS idx_listings_bump_order
  ON listings (category_id, GREATEST(bumped_at, created_at) DESC)
  WHERE status = 'active';
