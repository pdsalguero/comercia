-- =============================================================
-- SEED: Tiendas Virtuales de prueba
-- Ejecutar en Supabase SQL Editor
-- =============================================================

-- 0. Limpiar datos de seed previos (idempotente)
DELETE FROM listings WHERE user_id IN (
  '00000001-0000-0000-0000-000000000001',
  '00000001-0000-0000-0000-000000000002',
  '00000001-0000-0000-0000-000000000003',
  '00000001-0000-0000-0000-000000000004',
  '00000001-0000-0000-0000-000000000005',
  '00000001-0000-0000-0000-000000000006',
  '00000001-0000-0000-0000-000000000007',
  '00000001-0000-0000-0000-000000000008'
);
DELETE FROM profiles WHERE id IN (
  '00000001-0000-0000-0000-000000000001',
  '00000001-0000-0000-0000-000000000002',
  '00000001-0000-0000-0000-000000000003',
  '00000001-0000-0000-0000-000000000004',
  '00000001-0000-0000-0000-000000000005',
  '00000001-0000-0000-0000-000000000006',
  '00000001-0000-0000-0000-000000000007',
  '00000001-0000-0000-0000-000000000008'
);
-- Also clean profiles that somehow got these slugs with different IDs
DELETE FROM profiles WHERE store_slug IN (
  'argencars','inmobiliaria-norte','tecnomovil','moda-fashion',
  'deportes-sj','ra-maquinarias','hogar-deco','mascoteria-feliz'
);
DELETE FROM auth.users WHERE id IN (
  '00000001-0000-0000-0000-000000000001',
  '00000001-0000-0000-0000-000000000002',
  '00000001-0000-0000-0000-000000000003',
  '00000001-0000-0000-0000-000000000004',
  '00000001-0000-0000-0000-000000000005',
  '00000001-0000-0000-0000-000000000006',
  '00000001-0000-0000-0000-000000000007',
  '00000001-0000-0000-0000-000000000008'
);

-- 1. Crear usuarios en auth.users (necesario para FK de profiles)
INSERT INTO auth.users (id, email, created_at, updated_at, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
VALUES
  ('00000001-0000-0000-0000-000000000001', 'argencars@seed.test',        now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  ('00000001-0000-0000-0000-000000000002', 'inmobiliaria@seed.test',     now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  ('00000001-0000-0000-0000-000000000003', 'tecnomovil@seed.test',       now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  ('00000001-0000-0000-0000-000000000004', 'modafashion@seed.test',      now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  ('00000001-0000-0000-0000-000000000005', 'deportessj@seed.test',       now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  ('00000001-0000-0000-0000-000000000006', 'ramaquinarias@seed.test',    now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  ('00000001-0000-0000-0000-000000000007', 'hogarydeco@seed.test',       now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  ('00000001-0000-0000-0000-000000000008', 'mascoteriafeliz@seed.test',  now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- 2. Crear perfiles con datos de tienda
INSERT INTO profiles (id, full_name, username, is_store, store_name, store_slug, store_type, store_description, store_whatsapp, store_verified,
  store_logo_url, store_banner_url)
VALUES
  (
    '00000001-0000-0000-0000-000000000001',
    'Argencars SRL', 'argencars', TRUE,
    'Argencars', 'argencars', 'automotora',
    'Automotora de San Juan. Vehículos nuevos y usados, financiación disponible.',
    '2645000001', TRUE,
    NULL,
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80'
  ),
  (
    '00000001-0000-0000-0000-000000000002',
    'Inmobiliaria Norte', 'inmobiliarianorte', TRUE,
    'Inmobiliaria Norte', 'inmobiliaria-norte', 'inmobiliaria',
    'Especialistas en propiedades residenciales y comerciales en San Juan.',
    '2645000002', TRUE,
    NULL,
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80'
  ),
  (
    '00000001-0000-0000-0000-000000000003',
    'TecnoMóvil', 'tecnomovil', TRUE,
    'TecnoMóvil', 'tecnomovil', 'electronica',
    'Celulares, tablets y accesorios. Servicio técnico oficial. San Juan capital.',
    '2645000003', FALSE,
    NULL,
    'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&q=80'
  ),
  (
    '00000001-0000-0000-0000-000000000004',
    'Moda Fashion', 'modafashion', TRUE,
    'Moda Fashion', 'moda-fashion', 'ropa',
    'Ropa de mujer y hombre. Últimas tendencias de temporada. Envíos a todo el país.',
    '2645000004', FALSE,
    NULL,
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'
  ),
  (
    '00000001-0000-0000-0000-000000000005',
    'Deportes SJ', 'deportessj', TRUE,
    'Deportes SJ', 'deportes-sj', 'tienda',
    'Todo para tu deporte favorito. Indumentaria, calzado y equipamiento deportivo.',
    '2645000005', TRUE,
    NULL,
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80'
  ),
  (
    '00000001-0000-0000-0000-000000000006',
    'R.A Maquinarias', 'ramaquinarias', TRUE,
    'R.A Maquinarias', 'ra-maquinarias', 'agencia',
    'Maquinaria para jardín, parques y espacios verdes. Venta y servicio técnico.',
    '2645000006', FALSE,
    NULL,
    'https://images.unsplash.com/photo-1558618047-3c5fa3dec3c5?w=800&q=80'
  ),
  (
    '00000001-0000-0000-0000-000000000007',
    'Hogar y Deco', 'hogarydeco', TRUE,
    'Hogar y Deco', 'hogar-deco', 'tienda',
    'Muebles, decoración y artículos para el hogar. Diseño y funcionalidad.',
    '2645000007', FALSE,
    NULL,
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80'
  ),
  (
    '00000001-0000-0000-0000-000000000008',
    'Mascotería Feliz', 'mascoteriafeliz', TRUE,
    'Mascotería Feliz', 'mascoteria-feliz', 'tienda',
    'Alimentos, accesorios y juguetes para tus mascotas. ¡Los amamos como vos!',
    '2645000008', FALSE,
    NULL,
    'https://images.unsplash.com/photo-1601758003122-53c40e686a19?w=800&q=80'
  )
ON CONFLICT (id) DO UPDATE SET
  full_name         = EXCLUDED.full_name,
  username          = EXCLUDED.username,
  is_store          = EXCLUDED.is_store,
  store_name        = EXCLUDED.store_name,
  store_slug        = EXCLUDED.store_slug,
  store_type        = EXCLUDED.store_type,
  store_description = EXCLUDED.store_description,
  store_whatsapp    = EXCLUDED.store_whatsapp,
  store_verified    = EXCLUDED.store_verified,
  store_banner_url  = EXCLUDED.store_banner_url;

-- 3. Crear listings de prueba para cada tienda
INSERT INTO listings (id, user_id, title, description, price, currency, condition, status, featured_level, category_id, neighborhood, attributes, created_at)
VALUES
  -- Argencars (vehicles = 2)
  (gen_random_uuid(), '00000001-0000-0000-0000-000000000001', 'Toyota Corolla 2020 - Impecable', 'Toyota Corolla 2020 automático, 45.000 km, nafta. Color blanco perla. Service al día, único dueño. Financiación disponible.', 18500000, 'ARS', 'very_good', 'active', 'gold', 2, 'San Juan Capital', '{"year":2020,"mileage":45000,"fuel":"Nafta","transmission":"Automática"}', now()),
  (gen_random_uuid(), '00000001-0000-0000-0000-000000000001', 'Ford Ranger XLT 4x4 2019', 'Ford Ranger XLT 4x4 diesel manual 2019. 80.000 km. Excelente estado. Diferencial trasero. Apta para todo terreno.', 22000000, 'ARS', 'good', 'active', 'silver', 2, 'San Juan Capital', '{"year":2019,"mileage":80000,"fuel":"Diesel","transmission":"Manual"}', now()),
  (gen_random_uuid(), '00000001-0000-0000-0000-000000000001', 'Volkswagen Gol Trend 2022', 'VW Gol Trend 2022, 12.000 km, nafta. Prácticamente nuevo. Color gris. Ideal primer auto. Sin detalles.', 9800000, 'ARS', 'like_new', 'active', NULL, 2, 'San Juan Capital', '{"year":2022,"mileage":12000,"fuel":"Nafta","transmission":"Manual"}', now()),

  -- Inmobiliaria Norte (real-estate = 3)
  (gen_random_uuid(), '00000001-0000-0000-0000-000000000002', 'Casa 3 dormitorios - Rivadavia', 'Hermosa casa en Rivadavia, 150m², 3 dormitorios, 2 baños, cocina equipada, garage para 2 autos. Jardín con pileta. Excelente ubicación.', 85000, 'USD', 'good', 'active', 'gold', 3, 'Rivadavia', '{"rooms":3,"bathrooms":2,"surface":150,"sub_category":"Casa"}', now()),
  (gen_random_uuid(), '00000001-0000-0000-0000-000000000002', 'Departamento 2 ambientes - Capital', 'Departamento 2 ambientes en Capital, 65m², piso 3, luminoso, cocina americana. Edificio con ascensor. Ideal inversión o vivienda.', 55000, 'USD', 'very_good', 'active', 'silver', 3, 'Capital', '{"rooms":2,"bathrooms":1,"surface":65,"sub_category":"Departamento"}', now()),
  (gen_random_uuid(), '00000001-0000-0000-0000-000000000002', 'Terreno 500m² - Chimbas', 'Terreno en Chimbas, 500m², escritura lista, servicios en la calle (agua, luz, gas). Ideal para construir. Zona en crecimiento.', 18000, 'USD', 'new', 'active', NULL, 3, 'Chimbas', '{"surface":500,"sub_category":"Terreno"}', now()),

  -- TecnoMóvil (phones = 21)
  (gen_random_uuid(), '00000001-0000-0000-0000-000000000003', 'iPhone 14 Pro 256GB - Liberado', 'iPhone 14 Pro 256GB color negro espacial. Liberado de fábrica. Batería al 89%. Con caja original y cargador. Sin rayones.', 950000, 'ARS', 'very_good', 'active', 'gold', 21, 'Capital', '{"brand":"Apple","model":"iPhone 14 Pro","storage":"256GB"}', now()),
  (gen_random_uuid(), '00000001-0000-0000-0000-000000000003', 'Samsung Galaxy S23 - Nuevo en caja', 'Samsung Galaxy S23 128GB nuevo en caja sellada. Color Phantom Black. Garantía oficial 1 año. Incluye funda protectora de regalo.', 780000, 'ARS', 'new', 'active', 'silver', 21, 'Capital', '{"brand":"Samsung","model":"Galaxy S23","storage":"128GB"}', now()),
  (gen_random_uuid(), '00000001-0000-0000-0000-000000000003', 'Xiaomi Redmi Note 12 - 4GB/128GB', 'Xiaomi Redmi Note 12, 4GB RAM + 128GB. Nuevo en caja. Batería 5000mAh. Carga rápida 33W. Pantalla AMOLED 6.67".', 280000, 'ARS', 'new', 'active', NULL, 21, 'Capital', '{"brand":"Xiaomi","model":"Redmi Note 12","storage":"128GB"}', now()),

  -- Moda Fashion (clothing = 4)
  (gen_random_uuid(), '00000001-0000-0000-0000-000000000004', 'Vestido floral verano - Talle M', 'Vestido floral de verano, talle M. Tela liviana 100% algodón. Colores vibrantes. Ideal para la playa o salidas casuales. Envío gratis.', 25000, 'ARS', 'new', 'active', NULL, 4, 'Capital', '{"sub_category":"Vestido","size":"M","brand":"Fashion Co"}', now()),
  (gen_random_uuid(), '00000001-0000-0000-0000-000000000004', 'Jean slim fit hombre - Talle 32', 'Jean slim fit para hombre, talle 32. Denim elástico premium. Color azul oscuro clásico. Corte moderno. Stock limitado.', 18000, 'ARS', 'new', 'active', NULL, 4, 'Capital', '{"sub_category":"Pantalón","size":"32","brand":"Denim Style"}', now()),
  (gen_random_uuid(), '00000001-0000-0000-0000-000000000004', 'Campera de cuero mujer - Talle L', 'Campera de cuero ecológico para mujer, talle L. Color negro. Cierre metálico, bolsillos laterales. Estilo urbano.', 65000, 'ARS', 'new', 'active', 'silver', 4, 'Capital', '{"sub_category":"Campera","size":"L","brand":"Leather Co"}', now()),

  -- Deportes SJ (sports = 6)
  (gen_random_uuid(), '00000001-0000-0000-0000-000000000005', 'Bicicleta MTB rodado 29 - 21 vel', 'Bicicleta de montaña rodado 29, 21 velocidades Shimano. Marco de aluminio. Frenos a disco mecánicos. Ideal para senderos y ciudad.', 180000, 'ARS', 'new', 'active', 'silver', 6, 'Capital', '{"brand":"Trek","sub_category":"Bicicleta"}', now()),
  (gen_random_uuid(), '00000001-0000-0000-0000-000000000005', 'Zapatillas running Nike Air Max', 'Nike Air Max para running. Talles del 38 al 44. Amortiguación superior, suela antideslizante. Ideal para largas distancias.', 95000, 'ARS', 'new', 'active', NULL, 6, 'Capital', '{"brand":"Nike","model":"Air Max","sub_category":"Calzado"}', now()),
  (gen_random_uuid(), '00000001-0000-0000-0000-000000000005', 'Pelota fútbol profesional FIFA', 'Pelota de fútbol profesional Adidas aprobada FIFA. Talla 5. Costura reforzada. Ideal para canchas de césped natural y sintético.', 28000, 'ARS', 'new', 'active', NULL, 6, 'Capital', '{"brand":"Adidas","sub_category":"Fútbol"}', now()),

  -- R.A Maquinarias (tools = 7)
  (gen_random_uuid(), '00000001-0000-0000-0000-000000000006', 'Cortacésped a nafta 5HP - Honda', 'Cortacésped Honda GCV160, motor 5HP a nafta. Corte 46cm, bolsa recolectora 55L. Ruedas ajustables, autotracción. Ideal jardines medianos y grandes.', 320000, 'ARS', 'new', 'active', 'gold', 7, 'Capital', '{"brand":"Honda","sub_category":"Cortacésped"}', now()),
  (gen_random_uuid(), '00000001-0000-0000-0000-000000000006', 'Motosierra eléctrica 2400W', 'Motosierra eléctrica Bosch 2400W. Espada 40cm. Cadena de repuesto incluida. Sin emisiones, bajo mantenimiento. Ideal para poda y corte de leña.', 145000, 'ARS', 'new', 'active', NULL, 7, 'Capital', '{"brand":"Bosch","sub_category":"Motosierra"}', now()),
  (gen_random_uuid(), '00000001-0000-0000-0000-000000000006', 'Bordeadora a batería + cargador', 'Bordeadora Greenworks a batería 40V. Incluye batería y cargador. Sin cables, sin nafta. 30cm de corte, hilo automático. Silenciosa y ecológica.', 78000, 'ARS', 'new', 'active', NULL, 7, 'Capital', '{"brand":"Greenworks","sub_category":"Bordeadora"}', now()),

  -- Hogar y Deco (home-garden = 5)
  (gen_random_uuid(), '00000001-0000-0000-0000-000000000007', 'Sillón 3 cuerpos - Tela antimanchas', 'Sillón 3 cuerpos tapizado en tela antimanchas color gris. Estructura de madera maciza. Relleno de alta densidad. Incluye almohadones decorativos.', 285000, 'ARS', 'new', 'active', 'silver', 5, 'Capital', '{"sub_category":"Sillón","brand":"ComfortHome"}', now()),
  (gen_random_uuid(), '00000001-0000-0000-0000-000000000007', 'Juego de living completo roble', 'Juego de living en madera de roble: sillón 3 cuerpos, loveseat y sillón individual. Tela antimanchas premium. Entrega a domicilio.', 520000, 'ARS', 'new', 'active', 'gold', 5, 'Capital', '{"sub_category":"Living","brand":"DécorHome"}', now()),
  (gen_random_uuid(), '00000001-0000-0000-0000-000000000007', 'Mesa de comedor 6 sillas - Madera', 'Mesa de comedor rectangular en madera maciza, incluye 6 sillas tapizadas. Dimensiones: 180x90cm. Acabado natural barnizado. Armado incluido.', 380000, 'ARS', 'new', 'active', NULL, 5, 'Capital', '{"sub_category":"Mesa"}', now()),

  -- Mascotería Feliz (pets = 9)
  (gen_random_uuid(), '00000001-0000-0000-0000-000000000008', 'Alimento Royal Canin Medium 15kg', 'Royal Canin Medium Adult 15kg. Alimento balanceado para perros medianos de 1 a 7 años. Con antioxidantes y ácidos grasos esenciales.', 45000, 'ARS', 'new', 'active', NULL, 9, 'Capital', '{"brand":"Royal Canin","sub_category":"Alimento"}', now()),
  (gen_random_uuid(), '00000001-0000-0000-0000-000000000008', 'Cama para perro grande - Antiderrapante', 'Cama para perro talle grande. Base antiderrapante, relleno de espuma HR. Funda desmontable y lavable. Medidas: 90x70cm.', 32000, 'ARS', 'new', 'active', NULL, 9, 'Capital', '{"sub_category":"Cama","brand":"PetHome"}', now()),
  (gen_random_uuid(), '00000001-0000-0000-0000-000000000008', 'Transportín gato talla M - Rígido', 'Transportín rígido para gato talla M. Ventilación en 3 lados, puerta con cierre doble seguridad. Apto para viajes en auto y avión. Color gris.', 28000, 'ARS', 'new', 'active', NULL, 9, 'Capital', '{"sub_category":"Transporte"}', now())

ON CONFLICT DO NOTHING;
