-- =============================================================
-- FULL RESET + SEED: tabla reviews + calificaciones de ejemplo
-- Ejecutar completo en Supabase SQL Editor
-- =============================================================

-- 0. Eliminar tabla rota y dependencias (CASCADE elimina triggers y policies)
DROP TABLE IF EXISTS reviews CASCADE;

-- 1. Recrear tabla con todas las columnas
CREATE TABLE reviews (
  id          uuid primary key default gen_random_uuid(),
  seller_id   uuid not null references profiles(id) on delete cascade,
  reviewer_id uuid not null references profiles(id) on delete cascade,
  listing_id  uuid references listings(id) on delete set null,
  rating      smallint not null check (rating between 1 and 5),
  comment     text check (char_length(comment) <= 500),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique (seller_id, reviewer_id)
);

-- 2. RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_public_read" ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_own_insert"  ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "reviews_own_update"  ON reviews FOR UPDATE USING (auth.uid() = reviewer_id);
CREATE POLICY "reviews_own_delete"  ON reviews FOR DELETE USING (auth.uid() = reviewer_id);

-- 3. Trigger updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN new.updated_at = now(); RETURN new; END;
$$;

CREATE TRIGGER reviews_set_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 4. Asegurar que existan los sellers (tiendas) referenciados
INSERT INTO auth.users (id, email, created_at, updated_at, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
VALUES
  ('00000001-0000-0000-0000-000000000001', 'argencars@seed.test',       now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  ('00000001-0000-0000-0000-000000000002', 'inmobiliaria@seed.test',    now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  ('00000001-0000-0000-0000-000000000003', 'tecnomovil@seed.test',      now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  ('00000001-0000-0000-0000-000000000004', 'modafashion@seed.test',     now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  ('00000001-0000-0000-0000-000000000005', 'deportessj@seed.test',      now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, full_name, username, is_store, store_name, store_slug, store_type, store_verified)
VALUES
  ('00000001-0000-0000-0000-000000000001', 'Argencars SRL',      'argencars',         true, 'Argencars',          'argencars',          'automotora',   true),
  ('00000001-0000-0000-0000-000000000002', 'Inmobiliaria Norte', 'inmobiliarianorte', true, 'Inmobiliaria Norte', 'inmobiliaria-norte', 'inmobiliaria', true),
  ('00000001-0000-0000-0000-000000000003', 'TecnoMóvil',         'tecnomovil',        true, 'TecnoMóvil',         'tecnomovil',         'electronica',  false),
  ('00000001-0000-0000-0000-000000000004', 'Moda Fashion',       'modafashion',       true, 'Moda Fashion',       'moda-fashion',       'ropa',         false),
  ('00000001-0000-0000-0000-000000000005', 'Deportes SJ',        'deportessj',        true, 'Deportes SJ',        'deportes-sj',        'tienda',       false)
ON CONFLICT (id) DO NOTHING;

-- 6. Limpiar seed previo de reviewers (idempotente)
DELETE FROM profiles WHERE id IN (
  '00000002-0000-0000-0000-000000000001',
  '00000002-0000-0000-0000-000000000002',
  '00000002-0000-0000-0000-000000000003',
  '00000002-0000-0000-0000-000000000004',
  '00000002-0000-0000-0000-000000000005',
  '00000002-0000-0000-0000-000000000006'
);
DELETE FROM auth.users WHERE id IN (
  '00000002-0000-0000-0000-000000000001',
  '00000002-0000-0000-0000-000000000002',
  '00000002-0000-0000-0000-000000000003',
  '00000002-0000-0000-0000-000000000004',
  '00000002-0000-0000-0000-000000000005',
  '00000002-0000-0000-0000-000000000006'
);

-- 7. Crear usuarios compradores en auth.users
INSERT INTO auth.users (id, email, created_at, updated_at, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
VALUES
  ('00000002-0000-0000-0000-000000000001', 'martin.garcia@seed.test',  now()-interval'8 months', now(), now()-interval'8 months', '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  ('00000002-0000-0000-0000-000000000002', 'laura.mendez@seed.test',   now()-interval'6 months', now(), now()-interval'6 months', '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  ('00000002-0000-0000-0000-000000000003', 'carlos.romero@seed.test',  now()-interval'5 months', now(), now()-interval'5 months', '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  ('00000002-0000-0000-0000-000000000004', 'sofia.diaz@seed.test',     now()-interval'3 months', now(), now()-interval'3 months', '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  ('00000002-0000-0000-0000-000000000005', 'diego.torres@seed.test',   now()-interval'2 months', now(), now()-interval'2 months', '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  ('00000002-0000-0000-0000-000000000006', 'valeria.lopez@seed.test',  now()-interval'1 month',  now(), now()-interval'1 month',  '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- 8. Crear perfiles de compradores
INSERT INTO profiles (id, full_name, username, is_store)
VALUES
  ('00000002-0000-0000-0000-000000000001', 'Martín García',  'martin.garcia',  false),
  ('00000002-0000-0000-0000-000000000002', 'Laura Méndez',   'laura.mendez',   false),
  ('00000002-0000-0000-0000-000000000003', 'Carlos Romero',  'carlos.romero',  false),
  ('00000002-0000-0000-0000-000000000004', 'Sofía Díaz',     'sofia.diaz',     false),
  ('00000002-0000-0000-0000-000000000005', 'Diego Torres',   'diego.torres',   false),
  ('00000002-0000-0000-0000-000000000006', 'Valeria López',  'valeria.lopez',  false)
ON CONFLICT (id) DO NOTHING;

-- 9. Insertar calificaciones

-- Argencars — 5 reviews, promedio 4.6
INSERT INTO reviews (seller_id, reviewer_id, rating, comment, created_at) VALUES
  ('00000001-0000-0000-0000-000000000001', '00000002-0000-0000-0000-000000000001', 5, 'Excelente atención, me asesoraron muy bien en la compra de mi auto. El trámite fue rápido y sin sorpresas. 100% recomendable.', now()-interval'7 months'),
  ('00000001-0000-0000-0000-000000000001', '00000002-0000-0000-0000-000000000002', 5, 'Súper amables y honestos. Me mostraron varias opciones dentro de mi presupuesto. Muy conforme con la compra.',               now()-interval'5 months'),
  ('00000001-0000-0000-0000-000000000001', '00000002-0000-0000-0000-000000000003', 4, 'Buena experiencia en general. Tardaron un poco con el papeleo pero el precio fue justo.',                                       now()-interval'3 months'),
  ('00000001-0000-0000-0000-000000000001', '00000002-0000-0000-0000-000000000004', 5, 'El mejor lugar para comprar un auto en San Juan. Ya es la segunda vez que compro con ellos.',                                   now()-interval'6 weeks'),
  ('00000001-0000-0000-0000-000000000001', '00000002-0000-0000-0000-000000000005', 4, 'Buen servicio y el auto tal como lo describieron. Preguntaría antes por los gastos de transferencia.',                          now()-interval'2 weeks');

-- Inmobiliaria Norte — 4 reviews, promedio 4.25
INSERT INTO reviews (seller_id, reviewer_id, rating, comment, created_at) VALUES
  ('00000001-0000-0000-0000-000000000002', '00000002-0000-0000-0000-000000000001', 4, 'Me ayudaron a encontrar el depto perfecto. La búsqueda llevó un tiempo pero al final valió la pena.',                           now()-interval'6 months'),
  ('00000001-0000-0000-0000-000000000002', '00000002-0000-0000-0000-000000000003', 5, 'Muy profesionales. Nos guiaron en todo el proceso de compra. La documentación estuvo lista en tiempo y forma.',                 now()-interval'4 months'),
  ('00000001-0000-0000-0000-000000000002', '00000002-0000-0000-0000-000000000005', 3, 'El trato fue correcto pero tardaron varios días en responder. La propiedad estaba bien pero esperaba más atención.',             now()-interval'7 weeks'),
  ('00000001-0000-0000-0000-000000000002', '00000002-0000-0000-0000-000000000006', 5, 'Alquilé con ellos y fue todo muy transparente. Explicaron cada cláusula del contrato. Muy recomendados.',                       now()-interval'3 weeks');

-- TecnoMóvil — 6 reviews, promedio 4.7
INSERT INTO reviews (seller_id, reviewer_id, rating, comment, created_at) VALUES
  ('00000001-0000-0000-0000-000000000003', '00000002-0000-0000-0000-000000000001', 5, 'Compré un iPhone y llegó impecable, tal como decía el aviso. Respuesta inmediata por WhatsApp. ¡10 puntos!',                    now()-interval'5 months'),
  ('00000001-0000-0000-0000-000000000003', '00000002-0000-0000-0000-000000000002', 5, 'Excelente. El equipo funciona perfecto y el precio fue el más competitivo del mercado.',                                         now()-interval'4 months'),
  ('00000001-0000-0000-0000-000000000003', '00000002-0000-0000-0000-000000000003', 4, 'Buen producto y precio justo. La entrega fue en el día.',                                                                         now()-interval'1 week'),
  ('00000001-0000-0000-0000-000000000003', '00000002-0000-0000-0000-000000000004', 4, 'Muy buena atención. Tuvieron paciencia para explicar las diferencias entre modelos. Quedé muy conforme.',                        now()-interval'2 months'),
  ('00000001-0000-0000-0000-000000000003', '00000002-0000-0000-0000-000000000005', 5, 'Compré la funda y el cargador también. Todo original y con garantía. Super recomendables.',                                      now()-interval'6 weeks'),
  ('00000001-0000-0000-0000-000000000003', '00000002-0000-0000-0000-000000000006', 5, 'Los mejores del rubro en San Juan. Compré dos veces y siempre fue una experiencia perfecta.',                                    now()-interval'2 weeks');

-- Moda Fashion — 3 reviews, promedio 4.0
INSERT INTO reviews (seller_id, reviewer_id, rating, comment, created_at) VALUES
  ('00000001-0000-0000-0000-000000000004', '00000002-0000-0000-0000-000000000002', 5, 'La ropa es de muy buena calidad. Los talles son exactos y el envío llegó bien embalado.',                                        now()-interval'3 months'),
  ('00000001-0000-0000-0000-000000000004', '00000002-0000-0000-0000-000000000004', 3, 'La prenda era linda pero tardó más de lo esperado. El vendedor respondió pero sin mucha urgencia.',                              now()-interval'5 weeks'),
  ('00000001-0000-0000-0000-000000000004', '00000002-0000-0000-0000-000000000006', 4, 'Buena variedad de ropa y precios accesibles. La atención fue amable.',                                                           now()-interval'10 days');

-- Deportes SJ — 4 reviews, promedio 4.0
INSERT INTO reviews (seller_id, reviewer_id, rating, comment, created_at) VALUES
  ('00000001-0000-0000-0000-000000000005', '00000002-0000-0000-0000-000000000001', 5, 'Compré una bicicleta y quedé encantado. Buen precio, entrega rápida y el vendedor muy amable.',                                  now()-interval'4 months'),
  ('00000001-0000-0000-0000-000000000005', '00000002-0000-0000-0000-000000000003', 4, 'Los guantes de boxeo llegaron en perfectas condiciones y originales. Muy recomendable.',                                         now()-interval'2 months'),
  ('00000001-0000-0000-0000-000000000005', '00000002-0000-0000-0000-000000000005', 5, 'Excelente servicio. Pedí asesoramiento para elegir la raqueta y me orientaron muy bien.',                                        now()-interval'1 month'),
  ('00000001-0000-0000-0000-000000000005', '00000002-0000-0000-0000-000000000006', 2, 'El producto tardó más de una semana en llegar y no avisaron. Igual estaba en buen estado.',                                      now()-interval'3 weeks');
