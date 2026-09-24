-- SEGURIDAD, PARTE 2: correr DESPUÉS de desplegar el código de la Fase 5 y probar el sitio.
-- Quita a la API pública (clave anónima y sesión de usuario) la lectura de columnas privadas.
-- El código ya las lee con la clave de servicio en el servidor (lib/supabase/admin-auth.ts,
-- dashboard/settings/actions.ts) y usa public_phone en lugar de phone.
--
-- Postgres no permite quitar una columna si la tabla está concedida entera: se quita la lectura de la
-- tabla y se vuelve a conceder columna por columna. OJO: una columna nueva que se agregue a estas tablas
-- NO va a ser legible por la API hasta sumarla a estos GRANT.
--
-- Vuelta atrás, si algo se rompe:
--   GRANT SELECT ON public.profiles TO anon, authenticated;
--   GRANT SELECT ON public.listings TO anon, authenticated;

-- ── profiles ────────────────────────────────────────────────────────────────────────────────────
-- Privadas: phone (se expone public_phone), is_admin, is_blocked, blocked_at, blocked_reason,
-- free_destacado_credits.
REVOKE SELECT ON public.profiles FROM anon, authenticated;
GRANT SELECT (
  id, username, full_name, avatar_url, public_phone, show_phone, location, bio,
  rating, total_sales, total_reviews, is_verified, is_pro, created_at, updated_at,
  store_name, store_slug, store_type, store_logo_url, store_banner_url, store_description,
  store_whatsapp, is_store, store_verified, store_address,
  identity_verified, identity_verified_method, identity_verified_at
) ON public.profiles TO anon, authenticated;

-- ── listings ────────────────────────────────────────────────────────────────────────────────────
-- Privadas: fraud_score, fraud_flags, removed_by_admin, removed_reason y los campos de la IA
-- (ai_title, ai_description, ai_price_min, ai_price_max, ai_confidence).
REVOKE SELECT ON public.listings FROM anon, authenticated;
GRANT SELECT (
  id, user_id, category_id, title, description, price, accepts_offers, condition, status,
  city, neighborhood, ai_generated, is_featured, featured_until, is_urgent, bump_count,
  last_bumped_at, view_count, contact_count, favorite_count, slug, expires_at, created_at,
  updated_at, featured_level, attributes, sub_category, currency,
  destacado_activo, destacado_hasta, destacado_tipo, bumped_at
) ON public.listings TO anon, authenticated;
