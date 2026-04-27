-- listing_reports: usuarios autenticados pueden denunciar avisos
CREATE TABLE IF NOT EXISTS listing_reports (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id   uuid        NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  reporter_id  uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  reason       text        NOT NULL CHECK (reason IN ('scam','fake','prohibited','duplicate','inappropriate','other')),
  description  text,
  status       text        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','reviewed','dismissed')),
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE listing_reports ENABLE ROW LEVEL SECURITY;

-- Usuarios autenticados pueden insertar sus propias denuncias
CREATE POLICY "authenticated can insert own reports"
  ON listing_reports FOR INSERT TO authenticated
  WITH CHECK (reporter_id = auth.uid());

-- Usuarios pueden ver sus propias denuncias
CREATE POLICY "authenticated can see own reports"
  ON listing_reports FOR SELECT TO authenticated
  USING (reporter_id = auth.uid());

-- Índices
CREATE INDEX idx_listing_reports_listing  ON listing_reports(listing_id);
CREATE INDEX idx_listing_reports_status   ON listing_reports(status);
CREATE INDEX idx_listing_reports_created  ON listing_reports(created_at DESC);
