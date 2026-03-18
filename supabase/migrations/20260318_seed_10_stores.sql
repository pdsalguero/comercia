-- =============================================================
-- SEED: 10 Tiendas Virtuales adicionales (seed10)
-- Ejecutar en Supabase SQL Editor
-- IDs: 00000010-0000-0000-0000-000000000001..000000000010
-- =============================================================

-- 0. Limpiar datos de seed previos (idempotente)
DELETE FROM listing_images WHERE listing_id IN (
  SELECT id FROM listings WHERE user_id IN (
    '00000010-0000-0000-0000-000000000001',
    '00000010-0000-0000-0000-000000000002',
    '00000010-0000-0000-0000-000000000003',
    '00000010-0000-0000-0000-000000000004',
    '00000010-0000-0000-0000-000000000005',
    '00000010-0000-0000-0000-000000000006',
    '00000010-0000-0000-0000-000000000007',
    '00000010-0000-0000-0000-000000000008',
    '00000010-0000-0000-0000-000000000009',
    '00000010-0000-0000-0000-000000000010'
  )
);
DELETE FROM listings WHERE user_id IN (
  '00000010-0000-0000-0000-000000000001',
  '00000010-0000-0000-0000-000000000002',
  '00000010-0000-0000-0000-000000000003',
  '00000010-0000-0000-0000-000000000004',
  '00000010-0000-0000-0000-000000000005',
  '00000010-0000-0000-0000-000000000006',
  '00000010-0000-0000-0000-000000000007',
  '00000010-0000-0000-0000-000000000008',
  '00000010-0000-0000-0000-000000000009',
  '00000010-0000-0000-0000-000000000010'
);
DELETE FROM profiles WHERE id IN (
  '00000010-0000-0000-0000-000000000001',
  '00000010-0000-0000-0000-000000000002',
  '00000010-0000-0000-0000-000000000003',
  '00000010-0000-0000-0000-000000000004',
  '00000010-0000-0000-0000-000000000005',
  '00000010-0000-0000-0000-000000000006',
  '00000010-0000-0000-0000-000000000007',
  '00000010-0000-0000-0000-000000000008',
  '00000010-0000-0000-0000-000000000009',
  '00000010-0000-0000-0000-000000000010'
);
-- Clean up any leftover slugs with different IDs
DELETE FROM profiles WHERE store_slug IN (
  'autoventa-sj','techzone','modafem','deco-hogar',
  'fitsport-sj','libromundo','petshop-sj','toolmaster',
  'beautyzone','kidsworld'
);
DELETE FROM auth.users WHERE id IN (
  '00000010-0000-0000-0000-000000000001',
  '00000010-0000-0000-0000-000000000002',
  '00000010-0000-0000-0000-000000000003',
  '00000010-0000-0000-0000-000000000004',
  '00000010-0000-0000-0000-000000000005',
  '00000010-0000-0000-0000-000000000006',
  '00000010-0000-0000-0000-000000000007',
  '00000010-0000-0000-0000-000000000008',
  '00000010-0000-0000-0000-000000000009',
  '00000010-0000-0000-0000-000000000010'
);

-- 1. Crear usuarios en auth.users
INSERT INTO auth.users (id, email, created_at, updated_at, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
VALUES
  ('00000010-0000-0000-0000-000000000001', 'autoventa@seed10.test',    now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  ('00000010-0000-0000-0000-000000000002', 'techzone@seed10.test',     now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  ('00000010-0000-0000-0000-000000000003', 'modafem@seed10.test',      now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  ('00000010-0000-0000-0000-000000000004', 'decohogar@seed10.test',    now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  ('00000010-0000-0000-0000-000000000005', 'fitsport@seed10.test',     now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  ('00000010-0000-0000-0000-000000000006', 'libromundo@seed10.test',   now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  ('00000010-0000-0000-0000-000000000007', 'petshopsj@seed10.test',    now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  ('00000010-0000-0000-0000-000000000008', 'toolmaster@seed10.test',   now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  ('00000010-0000-0000-0000-000000000009', 'beautyzone@seed10.test',   now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  ('00000010-0000-0000-0000-000000000010', 'kidsworld@seed10.test',    now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- 2. Crear perfiles con datos de tienda
INSERT INTO profiles (
  id, full_name, username, is_store,
  store_name, store_slug, store_type,
  store_description, store_whatsapp, store_verified,
  store_logo_url, store_banner_url
)
VALUES
  -- 1. AutoVenta SJ - automotora
  (
    '00000010-0000-0000-0000-000000000001',
    'AutoVenta SJ', 'autoventasj', TRUE,
    'AutoVenta SJ', 'autoventa-sj', 'automotora',
    'Concesionaria líder en San Juan con más de 200 vehículos usados y 0km disponibles. Financiación propia, permutas y gestión de patentamiento incluidos.',
    '2645110001', TRUE,
    'https://api.dicebear.com/7.x/initials/svg?seed=AutoVentaSJ',
    'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&q=80'
  ),
  -- 2. TechZone - electronica
  (
    '00000010-0000-0000-0000-000000000002',
    'TechZone', 'techzone', TRUE,
    'TechZone', 'techzone', 'electronica',
    'Tu tienda de tecnología en San Juan: celulares, laptops, accesorios y servicio técnico especializado. Garantía oficial en todas las marcas líderes.',
    '2645110002', TRUE,
    'https://api.dicebear.com/7.x/initials/svg?seed=TechZone',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80'
  ),
  -- 3. ModaFem - ropa
  (
    '00000010-0000-0000-0000-000000000003',
    'ModaFem', 'modafem', TRUE,
    'ModaFem', 'modafem', 'ropa',
    'Boutique femenina con las últimas tendencias de temporada a precios accesibles. Ropa, calzado y accesorios para mujeres que quieren lucir siempre increíbles.',
    '2645110003', TRUE,
    'https://api.dicebear.com/7.x/initials/svg?seed=ModaFem',
    'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800&q=80'
  ),
  -- 4. Deco&Hogar - tienda
  (
    '00000010-0000-0000-0000-000000000004',
    'Deco & Hogar', 'decohogar', TRUE,
    'Deco & Hogar', 'deco-hogar', 'tienda',
    'Especialistas en decoración y mobiliario para transformar tu hogar. Encontrá muebles, iluminación y artículos decorativos de diseño contemporáneo.',
    '2645110004', TRUE,
    'https://api.dicebear.com/7.x/initials/svg?seed=DecoHogar',
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80'
  ),
  -- 5. FitSport SJ - tienda (deportes)
  (
    '00000010-0000-0000-0000-000000000005',
    'FitSport SJ', 'fitsportsj', TRUE,
    'FitSport SJ', 'fitsport-sj', 'tienda',
    'Todo para tu entrenamiento: ropa deportiva, suplementos, equipos de gym y accesorios fitness. Asesoramiento personalizado por profesionales del deporte.',
    '2645110005', TRUE,
    'https://api.dicebear.com/7.x/initials/svg?seed=FitSportSJ',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80'
  ),
  -- 6. LibroMundo - servicios/libros
  (
    '00000010-0000-0000-0000-000000000006',
    'LibroMundo', 'libromundo', TRUE,
    'LibroMundo', 'libromundo', 'servicios',
    'Librería online con miles de títulos en stock: ficción, técnica, educativa e infantil. Envíos a todo el país y servicio de reserva de novedades editoriales.',
    '2645110006', FALSE,
    'https://api.dicebear.com/7.x/initials/svg?seed=LibroMundo',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80'
  ),
  -- 7. PetShop SJ - tienda (mascotas)
  (
    '00000010-0000-0000-0000-000000000007',
    'PetShop SJ', 'petshopsj', TRUE,
    'PetShop SJ', 'petshop-sj', 'tienda',
    'Tienda especializada en mascotas: alimentos premium, juguetes, accesorios y ropa para perros y gatos. Atención personalizada y asesoramiento veterinario.',
    '2645110007', FALSE,
    'https://api.dicebear.com/7.x/initials/svg?seed=PetShopSJ',
    'https://images.unsplash.com/photo-1601758003122-53c40e686a19?w=800&q=80'
  ),
  -- 8. ToolMaster - tienda (herramientas)
  (
    '00000010-0000-0000-0000-000000000008',
    'ToolMaster', 'toolmaster', TRUE,
    'ToolMaster', 'toolmaster', 'tienda',
    'Herramientas eléctricas, manuales y equipos para la construcción de las mejores marcas del mercado. Stock permanente y precios de distribuidor en San Juan.',
    '2645110008', FALSE,
    'https://api.dicebear.com/7.x/initials/svg?seed=ToolMaster',
    'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80'
  ),
  -- 9. BeautyZone - tienda (belleza y salud)
  (
    '00000010-0000-0000-0000-000000000009',
    'BeautyZone', 'beautyzone', TRUE,
    'BeautyZone', 'beautyzone', 'tienda',
    'Cosméticos, perfumería y productos de cuidado personal de marcas nacionales e internacionales. Descubrí lo mejor en skincare, maquillaje y fragancias.',
    '2645110009', FALSE,
    'https://api.dicebear.com/7.x/initials/svg?seed=BeautyZone',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80'
  ),
  -- 10. KidsWorld - tienda (bebés y juguetes)
  (
    '00000010-0000-0000-0000-000000000010',
    'KidsWorld', 'kidsworld', TRUE,
    'KidsWorld', 'kidsworld', 'tienda',
    'El mundo de los más chiquitos: ropa de bebé, juguetes educativos, cochecitos y todo lo que necesitás para criar con amor y diversión. Envío a domicilio.',
    '2645110010', FALSE,
    'https://api.dicebear.com/7.x/initials/svg?seed=KidsWorld',
    'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80'
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
  store_logo_url    = EXCLUDED.store_logo_url,
  store_banner_url  = EXCLUDED.store_banner_url;

-- 3. Crear listings por tienda
-- Usamos una tabla temporal para capturar los IDs generados y luego insertar imágenes
CREATE TEMP TABLE _seed10_listings (
  listing_id UUID,
  img_kw1    TEXT,
  img_kw2    TEXT
) ON COMMIT DROP;

WITH inserted AS (
  INSERT INTO listings (id, user_id, title, description, price, currency, condition, status, featured_level, category_id, neighborhood, attributes, created_at)
  VALUES

    -- ----------------------------------------------------------------
    -- AutoVenta SJ (category 2 = vehicles)
    -- ----------------------------------------------------------------
    (gen_random_uuid(), '00000010-0000-0000-0000-000000000001',
     'Fiat Cronos Drive 2023 - 18.000 km',
     'Fiat Cronos Drive 1.3 nafta 2023. Solo 18.000 km, único dueño. Color rojo. Caja manual 6 velocidades, pantalla táctil 7", cámara de retroceso. En perfectas condiciones.',
     14500000, 'ARS', 'like_new', 'active', 'gold', 2,
     'San Juan Capital',
     '{"year":2023,"mileage":18000,"fuel":"Nafta","transmission":"Manual","color":"Rojo"}',
     now() - interval '2 hours'),

    (gen_random_uuid(), '00000010-0000-0000-0000-000000000001',
     'Chevrolet S10 High Country 4x4 2021',
     'Chevrolet S10 High Country diesel automática 4x4, año 2021, 65.000 km. Equipamiento de tope de gama: cuero, techo solar, control de crucero adaptativo. Papeles al día.',
     28000000, 'ARS', 'very_good', 'active', 'silver', 2,
     'San Juan Capital',
     '{"year":2021,"mileage":65000,"fuel":"Diesel","transmission":"Automática","color":"Gris"}',
     now() - interval '3 days'),

    (gen_random_uuid(), '00000010-0000-0000-0000-000000000001',
     'Renault Kwid 1.0 Zen 2022 - Económico',
     'Renault Kwid 1.0 Zen nafta 2022. 30.000 km. Excelente consumo. Color azul. Ideal para la ciudad, fácil de estacionar. Financiación hasta 72 cuotas disponible.',
     8900000, 'ARS', 'very_good', 'active', NULL, 2,
     'Rawson',
     '{"year":2022,"mileage":30000,"fuel":"Nafta","transmission":"Manual","color":"Azul"}',
     now() - interval '5 days'),

    (gen_random_uuid(), '00000010-0000-0000-0000-000000000001',
     'Jeep Renegade Sport 2020 - 4x2',
     'Jeep Renegade Sport 1.8 automático 2020. 55.000 km. Color blanco. Pantalla Uconnect, cámara 360°, sensores de estacionamiento. Sin choques, service oficial.',
     19800000, 'ARS', 'good', 'active', 'silver', 2,
     'Capital',
     '{"year":2020,"mileage":55000,"fuel":"Nafta","transmission":"Automática","color":"Blanco"}',
     now() - interval '2 days'),

    -- ----------------------------------------------------------------
    -- TechZone (category 21 = phones, 1 = electronics)
    -- ----------------------------------------------------------------
    (gen_random_uuid(), '00000010-0000-0000-0000-000000000002',
     'MacBook Air M2 13" - 8GB/256GB',
     'Apple MacBook Air con chip M2, pantalla Liquid Retina 13.6", 8GB RAM unificada, 256GB SSD. Color Midnight. Batería de hasta 18 horas. Nueva en caja sellada con garantía oficial.',
     980000, 'ARS', 'new', 'active', 'gold', 1,
     'Capital',
     '{"brand":"Apple","model":"MacBook Air M2","ram":"8GB","storage":"256GB","color":"Midnight"}',
     now() - interval '30 minutes'),

    (gen_random_uuid(), '00000010-0000-0000-0000-000000000002',
     'Samsung Galaxy A54 5G - 128GB',
     'Samsung Galaxy A54 5G, 8GB RAM + 128GB almacenamiento. Pantalla Super AMOLED 6.4". Cámara triple 50MP. Batería 5000mAh. Nuevo en caja con garantía 1 año.',
     350000, 'ARS', 'new', 'active', NULL, 21,
     'Capital',
     '{"brand":"Samsung","model":"Galaxy A54 5G","storage":"128GB","ram":"8GB"}',
     now() - interval '4 days'),

    (gen_random_uuid(), '00000010-0000-0000-0000-000000000002',
     'Auriculares Sony WH-1000XM5 - Cancelación de ruido',
     'Sony WH-1000XM5 inalámbricos con cancelación de ruido líder del mercado. 30 horas de batería, carga rápida. Micrófono integrado, plegables. Negro. Nuevos con garantía.',
     245000, 'ARS', 'new', 'active', 'silver', 1,
     'Capital',
     '{"brand":"Sony","model":"WH-1000XM5","sub_category":"Auriculares","color":"Negro"}',
     now() - interval '2 days'),

    (gen_random_uuid(), '00000010-0000-0000-0000-000000000002',
     'Tablet Lenovo Tab M10 Plus 3ra Gen',
     'Lenovo Tab M10 Plus 3ra generación. Pantalla 10.6" 2K, MediaTek G80, 4GB RAM + 128GB. WiFi, Bluetooth 5.1. Ideal estudio y entretenimiento. Incluye funda original.',
     185000, 'ARS', 'new', 'active', NULL, 1,
     'Capital',
     '{"brand":"Lenovo","model":"Tab M10 Plus","storage":"128GB","ram":"4GB","sub_category":"Tablet"}',
     now() - interval '6 days'),

    -- ----------------------------------------------------------------
    -- ModaFem (category 4 = clothing)
    -- ----------------------------------------------------------------
    (gen_random_uuid(), '00000010-0000-0000-0000-000000000003',
     'Conjunto jogger + buzo oversize - Talle M',
     'Conjunto deportivo femenino: pantalón jogger y buzo oversize. Tela french terry premium 100% algodón. Disponible en colores nude, negro y verde oliva. Talle M.',
     42000, 'ARS', 'new', 'active', 'silver', 4,
     'Capital',
     '{"sub_category":"Conjunto","size":"M","brand":"SoftWear","material":"Algodón"}',
     now() - interval '4 hours'),

    (gen_random_uuid(), '00000010-0000-0000-0000-000000000003',
     'Vestido de fiesta largo - Talle S',
     'Elegante vestido largo para eventos formales. Tela satén de alta calidad, escote en V, abertura lateral sutil. Color vino. Talle S. Perfecto para bodas y galas.',
     98000, 'ARS', 'new', 'active', 'gold', 4,
     'Capital',
     '{"sub_category":"Vestido","size":"S","brand":"Eleganza","material":"Satén","color":"Vino"}',
     now() - interval '3 days'),

    (gen_random_uuid(), '00000010-0000-0000-0000-000000000003',
     'Zapatillas urbanas mujer - Talle 38',
     'Zapatillas urbanas de cuero ecológico blancas. Plataforma de 3cm, suela de goma vulcanizada antideslizante. Talle 38. Combinan con jeans, vestidos y shorts.',
     55000, 'ARS', 'new', 'active', NULL, 4,
     'Capital',
     '{"sub_category":"Calzado","size":"38","brand":"UrbanStep","color":"Blanco"}',
     now() - interval '5 days'),

    -- ----------------------------------------------------------------
    -- Deco & Hogar (category 5 = home-garden)
    -- ----------------------------------------------------------------
    (gen_random_uuid(), '00000010-0000-0000-0000-000000000004',
     'Escritorio nórdico con cajón - Blanco',
     'Escritorio estilo nórdico en MDF enchapado blanco. Cajón deslizante con guías metálicas. Medidas: 120x60cm. Ideal para home office o habitación juvenil. Armado incluido.',
     145000, 'ARS', 'new', 'active', 'silver', 5,
     'Capital',
     '{"sub_category":"Escritorio","material":"MDF","color":"Blanco","dimensions":"120x60cm"}',
     now() - interval '2 days'),

    (gen_random_uuid(), '00000010-0000-0000-0000-000000000004',
     'Lámpara de pie arco - Diseño industrial',
     'Lámpara de pie arco estilo industrial. Estructura de metal negro mate, brazo flexible 180cm, pantalla de tela gris. Bombilla E27 incluida. Ideal para sala o dormitorio.',
     68000, 'ARS', 'new', 'active', NULL, 5,
     'Capital',
     '{"sub_category":"Iluminación","brand":"LightDesign","material":"Metal","color":"Negro"}',
     now() - interval '4 days'),

    (gen_random_uuid(), '00000010-0000-0000-0000-000000000004',
     'Set 3 cuadros decorativos - Arte abstracto',
     'Set de 3 cuadros decorativos con impresión artística abstracta en colores tierra. Marco de madera natural, vidrio antirreflejo. Tamaños: 30x40, 40x50, 30x40cm. Listos para colgar.',
     48000, 'ARS', 'new', 'active', NULL, 5,
     'Rawson',
     '{"sub_category":"Cuadro","quantity":3,"style":"Abstracto"}',
     now() - interval '7 days'),

    (gen_random_uuid(), '00000010-0000-0000-0000-000000000004',
     'Cama sommier 2 plazas 140x190 - Pillow top',
     'Sommier 2 plazas con pillow top. Colchón de resortes ensacados + espuma HR, 140x190cm. Base tapizada en tela beige. Confort superior. Entrega en San Juan capital.',
     420000, 'ARS', 'new', 'active', 'gold', 5,
     'Capital',
     '{"sub_category":"Cama","size":"2 plazas","dimensions":"140x190cm","brand":"DormiBien"}',
     now() - interval '1 hour'),

    -- ----------------------------------------------------------------
    -- FitSport SJ (category 6 = sports)
    -- ----------------------------------------------------------------
    (gen_random_uuid(), '00000010-0000-0000-0000-000000000005',
     'Mancuernas hexagonales 10kg el par',
     'Par de mancuernas hexagonales recubiertas en caucho 10kg c/u. Anti-rodadura, mango antideslizante. Ideales para entrenamiento funcional y musculación en casa.',
     58000, 'ARS', 'new', 'active', NULL, 6,
     'Capital',
     '{"brand":"IronGym","sub_category":"Pesas","weight":"10kg","quantity":2}',
     now() - interval '3 days'),

    (gen_random_uuid(), '00000010-0000-0000-0000-000000000005',
     'Raqueta de tenis Wilson Clash 100 v2',
     'Raqueta Wilson Clash 100 v2, cabezal 100in², peso 295g, balance 32cm. Marco en carbono FreeFlex. Ideal para jugadores intermedios y avanzados. Nueva en funda original.',
     185000, 'ARS', 'new', 'active', 'gold', 6,
     'Capital',
     '{"brand":"Wilson","model":"Clash 100 v2","sub_category":"Tenis","weight":"295g"}',
     now() - interval '3 hours'),

    (gen_random_uuid(), '00000010-0000-0000-0000-000000000005',
     'Yerba mate con termo kit completo',
     'Kit mate premium: termo Stanley 1L acero inoxidable + mate de madera + yerbera cerámica + bombilla de acero. Ideal para deportistas. Caja regalo incluida.',
     72000, 'ARS', 'new', 'active', NULL, 6,
     'Capital',
     '{"brand":"Stanley","sub_category":"Accesorios","items":"Termo+mate+yerbera+bombilla"}',
     now() - interval '6 days'),

    -- ----------------------------------------------------------------
    -- LibroMundo (category 8 = books)
    -- ----------------------------------------------------------------
    (gen_random_uuid(), '00000010-0000-0000-0000-000000000006',
     '"El Alquimista" - Paulo Coelho - Ed. Planeta',
     'El Alquimista de Paulo Coelho, edición Planeta tapa blanda. Nueva edición revisada. El libro más vendido de la historia de la literatura brasileña. Entrega o envío.',
     9500, 'ARS', 'new', 'active', NULL, 8,
     'Capital',
     '{"author":"Paulo Coelho","publisher":"Planeta","genre":"Ficción","language":"Español"}',
     now() - interval '2 days'),

    (gen_random_uuid(), '00000010-0000-0000-0000-000000000006',
     'Pack 5 libros educativos primaria - Varios',
     'Pack de 5 libros de texto para nivel primario (1ro a 3er grado): Matemática, Lengua, Ciencias Naturales, Cs. Sociales y Arte. Editorial Kapelusz. Excelente estado.',
     35000, 'ARS', 'very_good', 'active', 'silver', 8,
     'Capital',
     '{"publisher":"Kapelusz","sub_category":"Educativo","level":"Primario","quantity":5}',
     now() - interval '4 days'),

    (gen_random_uuid(), '00000010-0000-0000-0000-000000000006',
     '"Sapiens" - Yuval Noah Harari - Tapa dura',
     'Sapiens: De animales a dioses, de Yuval Noah Harari. Edición de tapa dura en español. Estado muy bueno, sin subrayados. Un libro imprescindible para entender la humanidad.',
     22000, 'ARS', 'very_good', 'active', NULL, 8,
     'Rivadavia',
     '{"author":"Yuval Noah Harari","publisher":"Debate","genre":"Historia","language":"Español"}',
     now() - interval '8 days'),

    -- ----------------------------------------------------------------
    -- PetShop SJ (category 9 = pets)
    -- ----------------------------------------------------------------
    (gen_random_uuid(), '00000010-0000-0000-0000-000000000007',
     'Alimento Hills Science Diet Perro Adulto 7kg',
     'Hills Science Diet Adult Original 7kg. Nutrición clínicamente probada para perros adultos de razas medianas. Rico en proteínas, con antioxidantes y ácidos grasos omega.',
     38500, 'ARS', 'new', 'active', 'silver', 9,
     'Capital',
     '{"brand":"Hills","sub_category":"Alimento","weight":"7kg","breed":"Razas medianas"}',
     now() - interval '5 hours'),

    (gen_random_uuid(), '00000010-0000-0000-0000-000000000007',
     'Correa retráctil 5m para perros hasta 25kg',
     'Correa retráctil Flexi Classic 5m para perros hasta 25kg. Cinta resistente, freno ergonómico, sistema de bloqueo automático. Disponible en varios colores.',
     18900, 'ARS', 'new', 'active', NULL, 9,
     'Capital',
     '{"brand":"Flexi","sub_category":"Correa","length":"5m","max_weight":"25kg"}',
     now() - interval '5 days'),

    (gen_random_uuid(), '00000010-0000-0000-0000-000000000007',
     'Arena sanitaria para gatos Catsan 10L',
     'Arena sanitaria Catsan Natural 10L. Minerales naturales, absorción inmediata, control de olores hasta 7 días. Sin fragancia artificial. Apta para todo tipo de areneros.',
     14500, 'ARS', 'new', 'active', NULL, 9,
     'Capital',
     '{"brand":"Catsan","sub_category":"Higiene","volume":"10L","type":"Natural"}',
     now() - interval '3 days'),

    -- ----------------------------------------------------------------
    -- ToolMaster (category 7 = tools)
    -- ----------------------------------------------------------------
    (gen_random_uuid(), '00000010-0000-0000-0000-000000000008',
     'Taladro percutor Bosch GSB 650 RE 650W',
     'Taladro percutor Bosch Professional GSB 650 RE, 650W, velocidad variable, mandril 13mm, selector percusión/rotación. Maletín incluido con accesorios básicos.',
     98000, 'ARS', 'new', 'active', 'gold', 7,
     'Capital',
     '{"brand":"Bosch","model":"GSB 650 RE","sub_category":"Taladro","power":"650W"}',
     now() - interval '2 days'),

    (gen_random_uuid(), '00000010-0000-0000-0000-000000000008',
     'Amoladora angular DeWalt 115mm 900W',
     'Amoladora angular DeWalt DWE4151 115mm, motor 900W, 12.000 RPM. Disco de desbaste incluido. Protector ajustable, arranque suave. Ideal para metal y hormigón.',
     85000, 'ARS', 'new', 'active', NULL, 7,
     'Capital',
     '{"brand":"DeWalt","model":"DWE4151","sub_category":"Amoladora","power":"900W","disc":"115mm"}',
     now() - interval '4 days'),

    (gen_random_uuid(), '00000010-0000-0000-0000-000000000008',
     'Set 150 piezas herramientas manuales Stanley',
     'Set Stanley 150 piezas: llaves combinadas, destornilladores, pinzas, alicates, cúter, nivel, cinta métrica y más. Todo en maletín plástico reforzado. Uso doméstico y profesional.',
     145000, 'ARS', 'new', 'active', 'silver', 7,
     'Capital',
     '{"brand":"Stanley","sub_category":"Set herramientas","pieces":150}',
     now() - interval '45 minutes'),

    -- ----------------------------------------------------------------
    -- BeautyZone (category 24 = beauty-health)
    -- ----------------------------------------------------------------
    (gen_random_uuid(), '00000010-0000-0000-0000-000000000009',
     'Perfume Carolina Herrera Good Girl EDP 80ml',
     'Carolina Herrera Good Girl Eau de Parfum 80ml. Fragancia oriental floral con notas de jazmín, cacao y almendra. Frasco icónico stiletto. Original, nuevo con caja y bolsa.',
     185000, 'ARS', 'new', 'active', 'gold', 24,
     'Capital',
     '{"brand":"Carolina Herrera","model":"Good Girl","sub_category":"Perfume","volume":"80ml","gender":"Mujer"}',
     now() - interval '6 hours'),

    (gen_random_uuid(), '00000010-0000-0000-0000-000000000009',
     'Kit skincare hidratante - Neutrogena 4 piezas',
     'Kit hidratante Neutrogena Hydro Boost: gel de limpieza, gel-crema hidratante, contorno de ojos y sérum de vitamina C. Para piel normal a seca. Nuevo en estuche.',
     82000, 'ARS', 'new', 'active', 'silver', 24,
     'Capital',
     '{"brand":"Neutrogena","sub_category":"Skincare","pieces":4,"skin_type":"Normal/Seca"}',
     now() - interval '3 days'),

    (gen_random_uuid(), '00000010-0000-0000-0000-000000000009',
     'Plancha de pelo Remington S9500 - Titanio',
     'Plancha de pelo Remington S9500 Pro Titanio. Placas flotantes 230°C, calentamiento en 15 seg, tecnología cerámica infraroja. Protege del calor. Cable giratorio 2m.',
     68000, 'ARS', 'new', 'active', NULL, 24,
     'Capital',
     '{"brand":"Remington","model":"S9500","sub_category":"Estilismo","max_temp":"230°C"}',
     now() - interval '6 days'),

    -- ----------------------------------------------------------------
    -- KidsWorld (category 23 = babies, 25 = toys)
    -- ----------------------------------------------------------------
    (gen_random_uuid(), '00000010-0000-0000-0000-000000000010',
     'Cochecito travel system Infanti 3 en 1',
     'Cochecito Infanti 3 en 1: capazo, silla y porta bebé. Sistema travel system con base isofix. Chasis aluminio liviano, ruedas dobles con suspensión. Color gris melange.',
     380000, 'ARS', 'new', 'active', 'gold', 23,
     'Capital',
     '{"brand":"Infanti","sub_category":"Cochecito","system":"3 en 1","color":"Gris melange"}',
     now() - interval '2 hours'),

    (gen_random_uuid(), '00000010-0000-0000-0000-000000000010',
     'LEGO Classic 10698 - 790 piezas',
     'LEGO Classic Ideas Creativas 10698, 790 piezas en 33 colores distintos. Estimula la creatividad y el desarrollo motor. Para mayores de 4 años. Nuevo en caja sellada.',
     95000, 'ARS', 'new', 'active', 'silver', 25,
     'Capital',
     '{"brand":"LEGO","model":"Classic 10698","sub_category":"Construcción","pieces":790,"age":"4+"}',
     now() - interval '4 days'),

    (gen_random_uuid(), '00000010-0000-0000-0000-000000000010',
     'Ropa bebé recién nacido set 10 piezas',
     'Set 10 prendas para recién nacido (0-3 meses): 3 bodies manga corta, 2 mameluco, 2 medias, 2 gorros y 1 babero. Algodón 100% suave y hipoalergénico. Ideal regalo baby shower.',
     48000, 'ARS', 'new', 'active', NULL, 23,
     'Capital',
     '{"sub_category":"Ropa bebé","size":"0-3 meses","pieces":10,"material":"Algodón"}',
     now() - interval '7 days')

  RETURNING id
)
INSERT INTO _seed10_listings (listing_id, img_kw1, img_kw2)
SELECT id, 'placeholder', 'placeholder' FROM inserted;

-- 4. Insertar imágenes por listing (picsum.photos con seeds determinísticos)
-- AutoVenta SJ
INSERT INTO listing_images (listing_id, url, position)
SELECT id, 'https://picsum.photos/seed/av-fiat-1/400/300', 1 FROM listings WHERE title = 'Fiat Cronos Drive 2023 - 18.000 km' AND user_id = '00000010-0000-0000-0000-000000000001'
UNION ALL
SELECT id, 'https://picsum.photos/seed/av-fiat-2/400/300', 2 FROM listings WHERE title = 'Fiat Cronos Drive 2023 - 18.000 km' AND user_id = '00000010-0000-0000-0000-000000000001'
UNION ALL
SELECT id, 'https://picsum.photos/seed/av-chev-1/400/300', 1 FROM listings WHERE title = 'Chevrolet S10 High Country 4x4 2021' AND user_id = '00000010-0000-0000-0000-000000000001'
UNION ALL
SELECT id, 'https://picsum.photos/seed/av-chev-2/400/300', 2 FROM listings WHERE title = 'Chevrolet S10 High Country 4x4 2021' AND user_id = '00000010-0000-0000-0000-000000000001'
UNION ALL
SELECT id, 'https://picsum.photos/seed/av-kwid-1/400/300', 1 FROM listings WHERE title = 'Renault Kwid 1.0 Zen 2022 - Económico' AND user_id = '00000010-0000-0000-0000-000000000001'
UNION ALL
SELECT id, 'https://picsum.photos/seed/av-kwid-2/400/300', 2 FROM listings WHERE title = 'Renault Kwid 1.0 Zen 2022 - Económico' AND user_id = '00000010-0000-0000-0000-000000000001'
UNION ALL
SELECT id, 'https://picsum.photos/seed/av-jeep-1/400/300', 1 FROM listings WHERE title = 'Jeep Renegade Sport 2020 - 4x2' AND user_id = '00000010-0000-0000-0000-000000000001'
UNION ALL
SELECT id, 'https://picsum.photos/seed/av-jeep-2/400/300', 2 FROM listings WHERE title = 'Jeep Renegade Sport 2020 - 4x2' AND user_id = '00000010-0000-0000-0000-000000000001'
ON CONFLICT DO NOTHING;

-- TechZone
INSERT INTO listing_images (listing_id, url, position)
SELECT id, 'https://picsum.photos/seed/tz-mac-1/400/300', 1 FROM listings WHERE title = 'MacBook Air M2 13" - 8GB/256GB' AND user_id = '00000010-0000-0000-0000-000000000002'
UNION ALL
SELECT id, 'https://picsum.photos/seed/tz-mac-2/400/300', 2 FROM listings WHERE title = 'MacBook Air M2 13" - 8GB/256GB' AND user_id = '00000010-0000-0000-0000-000000000002'
UNION ALL
SELECT id, 'https://picsum.photos/seed/tz-sam-1/400/300', 1 FROM listings WHERE title = 'Samsung Galaxy A54 5G - 128GB' AND user_id = '00000010-0000-0000-0000-000000000002'
UNION ALL
SELECT id, 'https://picsum.photos/seed/tz-sam-2/400/300', 2 FROM listings WHERE title = 'Samsung Galaxy A54 5G - 128GB' AND user_id = '00000010-0000-0000-0000-000000000002'
UNION ALL
SELECT id, 'https://picsum.photos/seed/tz-sony-1/400/300', 1 FROM listings WHERE title = 'Auriculares Sony WH-1000XM5 - Cancelación de ruido' AND user_id = '00000010-0000-0000-0000-000000000002'
UNION ALL
SELECT id, 'https://picsum.photos/seed/tz-sony-2/400/300', 2 FROM listings WHERE title = 'Auriculares Sony WH-1000XM5 - Cancelación de ruido' AND user_id = '00000010-0000-0000-0000-000000000002'
UNION ALL
SELECT id, 'https://picsum.photos/seed/tz-tab-1/400/300', 1 FROM listings WHERE title = 'Tablet Lenovo Tab M10 Plus 3ra Gen' AND user_id = '00000010-0000-0000-0000-000000000002'
UNION ALL
SELECT id, 'https://picsum.photos/seed/tz-tab-2/400/300', 2 FROM listings WHERE title = 'Tablet Lenovo Tab M10 Plus 3ra Gen' AND user_id = '00000010-0000-0000-0000-000000000002'
ON CONFLICT DO NOTHING;

-- ModaFem
INSERT INTO listing_images (listing_id, url, position)
SELECT id, 'https://picsum.photos/seed/mf-jog-1/400/300', 1 FROM listings WHERE title = 'Conjunto jogger + buzo oversize - Talle M' AND user_id = '00000010-0000-0000-0000-000000000003'
UNION ALL
SELECT id, 'https://picsum.photos/seed/mf-jog-2/400/300', 2 FROM listings WHERE title = 'Conjunto jogger + buzo oversize - Talle M' AND user_id = '00000010-0000-0000-0000-000000000003'
UNION ALL
SELECT id, 'https://picsum.photos/seed/mf-vest-1/400/300', 1 FROM listings WHERE title = 'Vestido de fiesta largo - Talle S' AND user_id = '00000010-0000-0000-0000-000000000003'
UNION ALL
SELECT id, 'https://picsum.photos/seed/mf-vest-2/400/300', 2 FROM listings WHERE title = 'Vestido de fiesta largo - Talle S' AND user_id = '00000010-0000-0000-0000-000000000003'
UNION ALL
SELECT id, 'https://picsum.photos/seed/mf-zap-1/400/300', 1 FROM listings WHERE title = 'Zapatillas urbanas mujer - Talle 38' AND user_id = '00000010-0000-0000-0000-000000000003'
UNION ALL
SELECT id, 'https://picsum.photos/seed/mf-zap-2/400/300', 2 FROM listings WHERE title = 'Zapatillas urbanas mujer - Talle 38' AND user_id = '00000010-0000-0000-0000-000000000003'
ON CONFLICT DO NOTHING;

-- Deco & Hogar
INSERT INTO listing_images (listing_id, url, position)
SELECT id, 'https://picsum.photos/seed/dh-desk-1/400/300', 1 FROM listings WHERE title = 'Escritorio nórdico con cajón - Blanco' AND user_id = '00000010-0000-0000-0000-000000000004'
UNION ALL
SELECT id, 'https://picsum.photos/seed/dh-desk-2/400/300', 2 FROM listings WHERE title = 'Escritorio nórdico con cajón - Blanco' AND user_id = '00000010-0000-0000-0000-000000000004'
UNION ALL
SELECT id, 'https://picsum.photos/seed/dh-lamp-1/400/300', 1 FROM listings WHERE title = 'Lámpara de pie arco - Diseño industrial' AND user_id = '00000010-0000-0000-0000-000000000004'
UNION ALL
SELECT id, 'https://picsum.photos/seed/dh-lamp-2/400/300', 2 FROM listings WHERE title = 'Lámpara de pie arco - Diseño industrial' AND user_id = '00000010-0000-0000-0000-000000000004'
UNION ALL
SELECT id, 'https://picsum.photos/seed/dh-art-1/400/300', 1 FROM listings WHERE title = 'Set 3 cuadros decorativos - Arte abstracto' AND user_id = '00000010-0000-0000-0000-000000000004'
UNION ALL
SELECT id, 'https://picsum.photos/seed/dh-art-2/400/300', 2 FROM listings WHERE title = 'Set 3 cuadros decorativos - Arte abstracto' AND user_id = '00000010-0000-0000-0000-000000000004'
UNION ALL
SELECT id, 'https://picsum.photos/seed/dh-bed-1/400/300', 1 FROM listings WHERE title = 'Cama sommier 2 plazas 140x190 - Pillow top' AND user_id = '00000010-0000-0000-0000-000000000004'
UNION ALL
SELECT id, 'https://picsum.photos/seed/dh-bed-2/400/300', 2 FROM listings WHERE title = 'Cama sommier 2 plazas 140x190 - Pillow top' AND user_id = '00000010-0000-0000-0000-000000000004'
ON CONFLICT DO NOTHING;

-- FitSport SJ
INSERT INTO listing_images (listing_id, url, position)
SELECT id, 'https://picsum.photos/seed/fs-manc-1/400/300', 1 FROM listings WHERE title = 'Mancuernas hexagonales 10kg el par' AND user_id = '00000010-0000-0000-0000-000000000005'
UNION ALL
SELECT id, 'https://picsum.photos/seed/fs-manc-2/400/300', 2 FROM listings WHERE title = 'Mancuernas hexagonales 10kg el par' AND user_id = '00000010-0000-0000-0000-000000000005'
UNION ALL
SELECT id, 'https://picsum.photos/seed/fs-rac-1/400/300', 1 FROM listings WHERE title = 'Raqueta de tenis Wilson Clash 100 v2' AND user_id = '00000010-0000-0000-0000-000000000005'
UNION ALL
SELECT id, 'https://picsum.photos/seed/fs-rac-2/400/300', 2 FROM listings WHERE title = 'Raqueta de tenis Wilson Clash 100 v2' AND user_id = '00000010-0000-0000-0000-000000000005'
UNION ALL
SELECT id, 'https://picsum.photos/seed/fs-mate-1/400/300', 1 FROM listings WHERE title = 'Yerba mate con termo kit completo' AND user_id = '00000010-0000-0000-0000-000000000005'
UNION ALL
SELECT id, 'https://picsum.photos/seed/fs-mate-2/400/300', 2 FROM listings WHERE title = 'Yerba mate con termo kit completo' AND user_id = '00000010-0000-0000-0000-000000000005'
ON CONFLICT DO NOTHING;

-- LibroMundo
INSERT INTO listing_images (listing_id, url, position)
SELECT id, 'https://picsum.photos/seed/lm-alq-1/400/300', 1 FROM listings WHERE title = '"El Alquimista" - Paulo Coelho - Ed. Planeta' AND user_id = '00000010-0000-0000-0000-000000000006'
UNION ALL
SELECT id, 'https://picsum.photos/seed/lm-alq-2/400/300', 2 FROM listings WHERE title = '"El Alquimista" - Paulo Coelho - Ed. Planeta' AND user_id = '00000010-0000-0000-0000-000000000006'
UNION ALL
SELECT id, 'https://picsum.photos/seed/lm-edu-1/400/300', 1 FROM listings WHERE title = 'Pack 5 libros educativos primaria - Varios' AND user_id = '00000010-0000-0000-0000-000000000006'
UNION ALL
SELECT id, 'https://picsum.photos/seed/lm-edu-2/400/300', 2 FROM listings WHERE title = 'Pack 5 libros educativos primaria - Varios' AND user_id = '00000010-0000-0000-0000-000000000006'
UNION ALL
SELECT id, 'https://picsum.photos/seed/lm-sap-1/400/300', 1 FROM listings WHERE title = '"Sapiens" - Yuval Noah Harari - Tapa dura' AND user_id = '00000010-0000-0000-0000-000000000006'
UNION ALL
SELECT id, 'https://picsum.photos/seed/lm-sap-2/400/300', 2 FROM listings WHERE title = '"Sapiens" - Yuval Noah Harari - Tapa dura' AND user_id = '00000010-0000-0000-0000-000000000006'
ON CONFLICT DO NOTHING;

-- PetShop SJ
INSERT INTO listing_images (listing_id, url, position)
SELECT id, 'https://picsum.photos/seed/ps-hills-1/400/300', 1 FROM listings WHERE title = 'Alimento Hills Science Diet Perro Adulto 7kg' AND user_id = '00000010-0000-0000-0000-000000000007'
UNION ALL
SELECT id, 'https://picsum.photos/seed/ps-hills-2/400/300', 2 FROM listings WHERE title = 'Alimento Hills Science Diet Perro Adulto 7kg' AND user_id = '00000010-0000-0000-0000-000000000007'
UNION ALL
SELECT id, 'https://picsum.photos/seed/ps-corr-1/400/300', 1 FROM listings WHERE title = 'Correa retráctil 5m para perros hasta 25kg' AND user_id = '00000010-0000-0000-0000-000000000007'
UNION ALL
SELECT id, 'https://picsum.photos/seed/ps-corr-2/400/300', 2 FROM listings WHERE title = 'Correa retráctil 5m para perros hasta 25kg' AND user_id = '00000010-0000-0000-0000-000000000007'
UNION ALL
SELECT id, 'https://picsum.photos/seed/ps-cat-1/400/300', 1 FROM listings WHERE title = 'Arena sanitaria para gatos Catsan 10L' AND user_id = '00000010-0000-0000-0000-000000000007'
UNION ALL
SELECT id, 'https://picsum.photos/seed/ps-cat-2/400/300', 2 FROM listings WHERE title = 'Arena sanitaria para gatos Catsan 10L' AND user_id = '00000010-0000-0000-0000-000000000007'
ON CONFLICT DO NOTHING;

-- ToolMaster
INSERT INTO listing_images (listing_id, url, position)
SELECT id, 'https://picsum.photos/seed/tm-bos-1/400/300', 1 FROM listings WHERE title = 'Taladro percutor Bosch GSB 650 RE 650W' AND user_id = '00000010-0000-0000-0000-000000000008'
UNION ALL
SELECT id, 'https://picsum.photos/seed/tm-bos-2/400/300', 2 FROM listings WHERE title = 'Taladro percutor Bosch GSB 650 RE 650W' AND user_id = '00000010-0000-0000-0000-000000000008'
UNION ALL
SELECT id, 'https://picsum.photos/seed/tm-dew-1/400/300', 1 FROM listings WHERE title = 'Amoladora angular DeWalt 115mm 900W' AND user_id = '00000010-0000-0000-0000-000000000008'
UNION ALL
SELECT id, 'https://picsum.photos/seed/tm-dew-2/400/300', 2 FROM listings WHERE title = 'Amoladora angular DeWalt 115mm 900W' AND user_id = '00000010-0000-0000-0000-000000000008'
UNION ALL
SELECT id, 'https://picsum.photos/seed/tm-sta-1/400/300', 1 FROM listings WHERE title = 'Set 150 piezas herramientas manuales Stanley' AND user_id = '00000010-0000-0000-0000-000000000008'
UNION ALL
SELECT id, 'https://picsum.photos/seed/tm-sta-2/400/300', 2 FROM listings WHERE title = 'Set 150 piezas herramientas manuales Stanley' AND user_id = '00000010-0000-0000-0000-000000000008'
ON CONFLICT DO NOTHING;

-- BeautyZone
INSERT INTO listing_images (listing_id, url, position)
SELECT id, 'https://picsum.photos/seed/bz-perf-1/400/300', 1 FROM listings WHERE title = 'Perfume Carolina Herrera Good Girl EDP 80ml' AND user_id = '00000010-0000-0000-0000-000000000009'
UNION ALL
SELECT id, 'https://picsum.photos/seed/bz-perf-2/400/300', 2 FROM listings WHERE title = 'Perfume Carolina Herrera Good Girl EDP 80ml' AND user_id = '00000010-0000-0000-0000-000000000009'
UNION ALL
SELECT id, 'https://picsum.photos/seed/bz-skin-1/400/300', 1 FROM listings WHERE title = 'Kit skincare hidratante - Neutrogena 4 piezas' AND user_id = '00000010-0000-0000-0000-000000000009'
UNION ALL
SELECT id, 'https://picsum.photos/seed/bz-skin-2/400/300', 2 FROM listings WHERE title = 'Kit skincare hidratante - Neutrogena 4 piezas' AND user_id = '00000010-0000-0000-0000-000000000009'
UNION ALL
SELECT id, 'https://picsum.photos/seed/bz-plan-1/400/300', 1 FROM listings WHERE title = 'Plancha de pelo Remington S9500 - Titanio' AND user_id = '00000010-0000-0000-0000-000000000009'
UNION ALL
SELECT id, 'https://picsum.photos/seed/bz-plan-2/400/300', 2 FROM listings WHERE title = 'Plancha de pelo Remington S9500 - Titanio' AND user_id = '00000010-0000-0000-0000-000000000009'
ON CONFLICT DO NOTHING;

-- KidsWorld
INSERT INTO listing_images (listing_id, url, position)
SELECT id, 'https://picsum.photos/seed/kw-coch-1/400/300', 1 FROM listings WHERE title = 'Cochecito travel system Infanti 3 en 1' AND user_id = '00000010-0000-0000-0000-000000000010'
UNION ALL
SELECT id, 'https://picsum.photos/seed/kw-coch-2/400/300', 2 FROM listings WHERE title = 'Cochecito travel system Infanti 3 en 1' AND user_id = '00000010-0000-0000-0000-000000000010'
UNION ALL
SELECT id, 'https://picsum.photos/seed/kw-lego-1/400/300', 1 FROM listings WHERE title = 'LEGO Classic 10698 - 790 piezas' AND user_id = '00000010-0000-0000-0000-000000000010'
UNION ALL
SELECT id, 'https://picsum.photos/seed/kw-lego-2/400/300', 2 FROM listings WHERE title = 'LEGO Classic 10698 - 790 piezas' AND user_id = '00000010-0000-0000-0000-000000000010'
UNION ALL
SELECT id, 'https://picsum.photos/seed/kw-ropa-1/400/300', 1 FROM listings WHERE title = 'Ropa bebé recién nacido set 10 piezas' AND user_id = '00000010-0000-0000-0000-000000000010'
UNION ALL
SELECT id, 'https://picsum.photos/seed/kw-ropa-2/400/300', 2 FROM listings WHERE title = 'Ropa bebé recién nacido set 10 piezas' AND user_id = '00000010-0000-0000-0000-000000000010'
ON CONFLICT DO NOTHING;

-- =============================================================
-- END OF SEED
-- 10 stores seeded with IDs 00000010-0000-0000-0000-000000000001
-- through 00000010-0000-0000-0000-000000000010
-- =============================================================
