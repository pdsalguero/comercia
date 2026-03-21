-- =============================================================
-- SEED: Calificaciones de ejemplo
-- Ejecutar en Supabase SQL Editor
-- =============================================================

-- 0. Limpiar seed previo (idempotente)
DELETE FROM reviews WHERE reviewer_id IN (
  '00000002-0000-0000-0000-000000000001',
  '00000002-0000-0000-0000-000000000002',
  '00000002-0000-0000-0000-000000000003',
  '00000002-0000-0000-0000-000000000004',
  '00000002-0000-0000-0000-000000000005',
  '00000002-0000-0000-0000-000000000006'
);
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

-- 1. Crear usuarios compradores (reviewers) en auth.users
INSERT INTO auth.users (id, email, created_at, updated_at, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
VALUES
  ('00000002-0000-0000-0000-000000000001', 'martin.garcia@seed.test',   now()-interval'8 months', now(), now()-interval'8 months', '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  ('00000002-0000-0000-0000-000000000002', 'laura.mendez@seed.test',    now()-interval'6 months', now(), now()-interval'6 months', '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  ('00000002-0000-0000-0000-000000000003', 'carlos.romero@seed.test',   now()-interval'5 months', now(), now()-interval'5 months', '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  ('00000002-0000-0000-0000-000000000004', 'sofia.diaz@seed.test',      now()-interval'3 months', now(), now()-interval'3 months', '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  ('00000002-0000-0000-0000-000000000005', 'diego.torres@seed.test',    now()-interval'2 months', now(), now()-interval'2 months', '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  ('00000002-0000-0000-0000-000000000006', 'valeria.lopez@seed.test',   now()-interval'1 month',  now(), now()-interval'1 month',  '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- 2. Crear perfiles de compradores
INSERT INTO profiles (id, full_name, username, is_store)
VALUES
  ('00000002-0000-0000-0000-000000000001', 'Martín García',   'martin.garcia',  FALSE),
  ('00000002-0000-0000-0000-000000000002', 'Laura Méndez',    'laura.mendez',   FALSE),
  ('00000002-0000-0000-0000-000000000003', 'Carlos Romero',   'carlos.romero',  FALSE),
  ('00000002-0000-0000-0000-000000000004', 'Sofía Díaz',      'sofia.diaz',     FALSE),
  ('00000002-0000-0000-0000-000000000005', 'Diego Torres',    'diego.torres',   FALSE),
  ('00000002-0000-0000-0000-000000000006', 'Valeria López',   'valeria.lopez',  FALSE)
ON CONFLICT (id) DO NOTHING;

-- 3. Insertar calificaciones
-- Vendedor 1: Argencars (00000001-...-001) — 5 reviews, promedio alto
INSERT INTO reviews (seller_id, reviewer_id, rating, comment, created_at) VALUES
  ('00000001-0000-0000-0000-000000000001', '00000002-0000-0000-0000-000000000001', 5,
   'Excelente atención, me asesoraron muy bien en la compra de mi auto. El trámite fue rápido y sin sorpresas. 100% recomendable.',
   now()-interval'7 months'),
  ('00000001-0000-0000-0000-000000000001', '00000002-0000-0000-0000-000000000002', 5,
   'Súper amables y honestos. Me mostraron varias opciones dentro de mi presupuesto. Muy conforme con la compra.',
   now()-interval'5 months'),
  ('00000001-0000-0000-0000-000000000001', '00000002-0000-0000-0000-000000000003', 4,
   'Buena experiencia en general. Tardaron un poco con el papeleo pero el precio fue justo.',
   now()-interval'3 months'),
  ('00000001-0000-0000-0000-000000000001', '00000002-0000-0000-0000-000000000004', 5,
   'El mejor lugar para comprar un auto en San Juan. Ya es la segunda vez que compro con ellos.',
   now()-interval'6 weeks'),
  ('00000001-0000-0000-0000-000000000001', '00000002-0000-0000-0000-000000000005', 4,
   'Buen servicio y el auto tal como lo describieron. Preguntaría antes por los gastos de transferencia.',
   now()-interval'2 weeks');

-- Vendedor 2: Inmobiliaria Norte (00000001-...-002) — 4 reviews, promedio medio-alto
INSERT INTO reviews (seller_id, reviewer_id, rating, comment, created_at) VALUES
  ('00000001-0000-0000-0000-000000000002', '00000002-0000-0000-0000-000000000001', 4,
   'Me ayudaron a encontrar el depto perfecto. La búsqueda llevó un tiempo pero al final valió la pena.',
   now()-interval'6 months'),
  ('00000001-0000-0000-0000-000000000002', '00000002-0000-0000-0000-000000000003', 5,
   'Muy profesionales. Nos guiaron en todo el proceso de compra. La documentación estuvo lista en tiempo y forma.',
   now()-interval'4 months'),
  ('00000001-0000-0000-0000-000000000002', '00000002-0000-0000-0000-000000000005', 3,
   'El trato fue correcto pero tardaron varios días en responder mensajes. La propiedad estaba bien pero esperaba más atención.',
   now()-interval'7 weeks'),
  ('00000001-0000-0000-0000-000000000002', '00000002-0000-0000-0000-000000000006', 5,
   'Alquilé con ellos y fue todo muy transparente. Explicaron cada cláusula del contrato. Muy recomendados.',
   now()-interval'3 weeks');

-- Vendedor 3: TecnoMóvil (00000001-...-003) — 6 reviews, promedio muy alto
INSERT INTO reviews (seller_id, reviewer_id, rating, comment, created_at) VALUES
  ('00000001-0000-0000-0000-000000000003', '00000002-0000-0000-0000-000000000001', 5,
   'Compré un iPhone y llegó impecable, tal como decía el aviso. Respuesta inmediata por WhatsApp. ¡10 puntos!',
   now()-interval'5 months'),
  ('00000001-0000-0000-0000-000000000003', '00000002-0000-0000-0000-000000000002', 5,
   'Excelente. El equipo funciona perfecto y el precio fue el más competitivo del mercado.',
   now()-interval'4 months'),
  ('00000001-0000-0000-0000-000000000003', '00000002-0000-0000-0000-000000000004', 4,
   'Muy buena atención. Tuvieron paciencia para explicar las diferencias entre modelos. Quedé muy conforme.',
   now()-interval'2 months'),
  ('00000001-0000-0000-0000-000000000003', '00000002-0000-0000-0000-000000000005', 5,
   'Compré la funda y el cargador también. Todo original y con garantía. Super recomendables.',
   now()-interval'6 weeks'),
  ('00000001-0000-0000-0000-000000000003', '00000002-0000-0000-0000-000000000006', 5,
   'Los mejores del rubro en San Juan. Compré dos veces y siempre fue una experiencia perfecta.',
   now()-interval'2 weeks'),
  ('00000001-0000-0000-0000-000000000003', '00000002-0000-0000-0000-000000000003', 4,
   'Buen producto y precio justo. La entrega fue en el día.',
   now()-interval'1 week');

-- Vendedor 4: Moda Fashion (00000001-...-004) — 3 reviews, promedio medio
INSERT INTO reviews (seller_id, reviewer_id, rating, comment, created_at) VALUES
  ('00000001-0000-0000-0000-000000000004', '00000002-0000-0000-0000-000000000002', 5,
   'La ropa es de muy buena calidad. Los talles son exactos y el envío llegó bien embalado.',
   now()-interval'3 months'),
  ('00000001-0000-0000-0000-000000000004', '00000002-0000-0000-0000-000000000004', 3,
   'La prenda era linda pero tardó más de lo esperado. El vendedor respondió pero sin mucha urgencia.',
   now()-interval'5 weeks'),
  ('00000001-0000-0000-0000-000000000004', '00000002-0000-0000-0000-000000000006', 4,
   'Buena variedad de ropa y precios accesibles. La atención fue amable.',
   now()-interval'10 days');

-- Vendedor 5: Deportes SJ (00000001-...-005) — 4 reviews
INSERT INTO reviews (seller_id, reviewer_id, rating, comment, created_at) VALUES
  ('00000001-0000-0000-0000-000000000005', '00000002-0000-0000-0000-000000000001', 5,
   'Compré una bicicleta y quedé encantado. Buen precio, entrega rápida y el vendedor muy amable.',
   now()-interval'4 months'),
  ('00000001-0000-0000-0000-000000000005', '00000002-0000-0000-0000-000000000003', 4,
   'Los guantes de boxeo llegaron en perfectas condiciones y originales. Muy recomendable.',
   now()-interval'2 months'),
  ('00000001-0000-0000-0000-000000000005', '00000002-0000-0000-0000-000000000005', 5,
   'Excelente servicio. Pedí asesoramiento para elegir la raqueta y me orientaron muy bien.',
   now()-interval'1 month'),
  ('00000001-0000-0000-0000-000000000005', '00000002-0000-0000-0000-000000000006', 2,
   'El producto tardó más de una semana en llegar y no avisaron. Igual estaba en buen estado.',
   now()-interval'3 weeks');
