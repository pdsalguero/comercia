-- =============================================================
-- RESET TOTAL + SEED v4 — Vendedores particulares
-- Ejecutar en Supabase SQL Editor
-- Borra TODO: mensajes, imágenes, listings, perfiles y usuarios
-- =============================================================

-- ── 1. LIMPIAR TODO ──────────────────────────────────────────

DELETE FROM messages;
DELETE FROM listing_images;
DELETE FROM listings;
DELETE FROM profiles;
DELETE FROM auth.users;


-- ── 2. USUARIOS PARTICULARES ─────────────────────────────────

INSERT INTO auth.users (id, email, created_at, updated_at, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, aud, role)
VALUES
  ('00000003-0000-0000-0000-000000000001','juan.rodriguez@seed.test',  now(),now(),now(),'{"provider":"email","providers":["email"]}','{}','authenticated','authenticated'),
  ('00000003-0000-0000-0000-000000000002','maria.gonzalez@seed.test',  now(),now(),now(),'{"provider":"email","providers":["email"]}','{}','authenticated','authenticated'),
  ('00000003-0000-0000-0000-000000000003','lucas.perez@seed.test',     now(),now(),now(),'{"provider":"email","providers":["email"]}','{}','authenticated','authenticated'),
  ('00000003-0000-0000-0000-000000000004','ana.fernandez@seed.test',   now(),now(),now(),'{"provider":"email","providers":["email"]}','{}','authenticated','authenticated'),
  ('00000003-0000-0000-0000-000000000005','diego.martinez@seed.test',  now(),now(),now(),'{"provider":"email","providers":["email"]}','{}','authenticated','authenticated'),
  ('00000003-0000-0000-0000-000000000006','carla.lopez@seed.test',     now(),now(),now(),'{"provider":"email","providers":["email"]}','{}','authenticated','authenticated'),
  ('00000003-0000-0000-0000-000000000007','roberto.sanchez@seed.test', now(),now(),now(),'{"provider":"email","providers":["email"]}','{}','authenticated','authenticated'),
  ('00000003-0000-0000-0000-000000000008','sofia.torres@seed.test',    now(),now(),now(),'{"provider":"email","providers":["email"]}','{}','authenticated','authenticated')
ON CONFLICT (id) DO NOTHING;


-- ── 3. PERFILES (particulares, sin tienda) ───────────────────

INSERT INTO profiles (id, full_name, username, is_store)
VALUES
  ('00000003-0000-0000-0000-000000000001', 'Juan Rodríguez',  'juan.rodriguez',  FALSE),
  ('00000003-0000-0000-0000-000000000002', 'María González',  'maria.gonzalez',  FALSE),
  ('00000003-0000-0000-0000-000000000003', 'Lucas Pérez',     'lucas.perez',     FALSE),
  ('00000003-0000-0000-0000-000000000004', 'Ana Fernández',   'ana.fernandez',   FALSE),
  ('00000003-0000-0000-0000-000000000005', 'Diego Martínez',  'diego.martinez',  FALSE),
  ('00000003-0000-0000-0000-000000000006', 'Carla López',     'carla.lopez',     FALSE),
  ('00000003-0000-0000-0000-000000000007', 'Roberto Sánchez', 'roberto.sanchez', FALSE),
  ('00000003-0000-0000-0000-000000000008', 'Sofía Torres',    'sofia.torres',    FALSE)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  username  = EXCLUDED.username,
  is_store  = EXCLUDED.is_store;


-- ── 4. LISTINGS ───────────────────────────────────────────────

INSERT INTO listings (id, user_id, title, description, price, currency, condition,
  status, featured_level, category_id, neighborhood, attributes, created_at)
VALUES

  -- ── JUAN RODRÍGUEZ — Vehículos ───────────────────────────
  (
    '00000004-0000-0000-0000-000000000001',
    '00000003-0000-0000-0000-000000000001',
    'Toyota Hilux 2017 4x4 Diesel - 95.000 km',
    'Vendo Toyota Hilux SRV 4x4 diesel manual 2017. 95.000 km reales, siempre en taller oficial. Full equipo: cuero, pantalla, sensores. Única dueña, no tiene detalles. Precio conversable.',
    28500000, 'ARS', 'very_good', 'active', 'gold', 2,
    'Capital, San Juan',
    '{"sub_category":"camioneta","brand":"toyota","year":2017,"km":95000,"fuel":"diesel","transmission":"manual","seller_type":"particular","zone":"capital"}',
    now() - interval '1 day'
  ),
  (
    '00000004-0000-0000-0000-000000000002',
    '00000003-0000-0000-0000-000000000001',
    'Yamaha FZ25 2020 - 22.000 km, impecable',
    'Vendo Yamaha FZ25 2020 nafta, 22.000 km. Patente y seguro al día. Nunca caída. Mantenimiento en taller Yamaha. Con baúl trasero de regalo. Me quedo con otra moto.',
    3400000, 'ARS', 'very_good', 'active', 'silver', 2,
    'Capital, San Juan',
    '{"sub_category":"moto","brand":"yamaha","year":2020,"km":22000,"fuel":"nafta","transmission":"manual","seller_type":"particular","zone":"capital"}',
    now() - interval '3 days'
  ),

  -- ── MARÍA GONZÁLEZ — Ropa + Hogar ────────────────────────
  (
    '00000004-0000-0000-0000-000000000003',
    '00000003-0000-0000-0000-000000000002',
    'Vestido de fiesta largo - Talle M, usado 1 vez',
    'Vestido largo de fiesta, talle M. Color bordo oscuro, escote corazón. Usado una sola vez para un casamiento. Está impecable, con funda. Precio por debajo del mercado.',
    38000, 'ARS', 'like_new', 'active', NULL, 4,
    'Rivadavia, San Juan',
    '{"sub_category":"ropa","gender":"mujer","size":"M"}',
    now() - interval '2 days'
  ),
  (
    '00000004-0000-0000-0000-000000000004',
    '00000003-0000-0000-0000-000000000002',
    'Campera North Face mujer talle L - Original',
    'Campera North Face original talle L. Relleno de pluma, impermeable. Color negro. Comprada en exterior. Sin detalles, como nueva. Tengo factura de compra.',
    95000, 'ARS', 'very_good', 'active', 'silver', 4,
    'Rivadavia, San Juan',
    '{"sub_category":"ropa","gender":"mujer","brand":"North Face","size":"L"}',
    now() - interval '5 days'
  ),
  (
    '00000004-0000-0000-0000-000000000005',
    '00000003-0000-0000-0000-000000000002',
    'Mesa ratona vidrio templado 90x60 cm',
    'Mesa ratona con tapa de vidrio templado 8mm y patas de hierro negro. 90x60 cm. Está en muy buen estado, pequeño rayón en una esquina del vidrio que no se ve. Me mudo y no entra.',
    42000, 'ARS', 'good', 'active', NULL, 5,
    'Rivadavia, San Juan',
    '{"sub_category":"muebles"}',
    now() - interval '7 days'
  ),

  -- ── LUCAS PÉREZ — Tecnología + Celulares ─────────────────
  (
    '00000004-0000-0000-0000-000000000006',
    '00000003-0000-0000-0000-000000000003',
    'iPhone 13 128GB Blanco - Liberado, batería 87%',
    'Vendo iPhone 13 128GB color blanco. Liberado de fábrica. Batería al 87%, funciona perfecto. Con caja original y cargador. Tiene funda desde el primer día. Sin rayones en pantalla.',
    870000, 'ARS', 'very_good', 'active', 'gold', 21,
    'Capital, San Juan',
    '{"sub_category":"smartphone","brand":"apple","model":"iPhone 13","storage":"128gb","os":"ios"}',
    now() - interval '1 day'
  ),
  (
    '00000004-0000-0000-0000-000000000007',
    '00000003-0000-0000-0000-000000000003',
    'Notebook HP Pavilion i5 8GB RAM 512GB SSD',
    'Notebook HP Pavilion 15, Intel Core i5 11va gen, 8GB RAM, 512GB SSD. Windows 11 activado. Pantalla Full HD 15.6". Funciona perfecta. La vendo porque compré una más potente para trabajo.',
    490000, 'ARS', 'good', 'active', 'gold', 1,
    'Capital, San Juan',
    '{"sub_category":"notebook","brand":"hp"}',
    now() - interval '4 days'
  ),
  (
    '00000004-0000-0000-0000-000000000008',
    '00000003-0000-0000-0000-000000000003',
    'Monitor LG 24" Full HD IPS - Sin uso',
    'Monitor LG 24MK430H 24" Full HD IPS. Sin uso, en caja. Lo compré y no lo llegué a usar porque me consiguieron uno en el trabajo. Ideal para PC de escritorio o home office.',
    175000, 'ARS', 'new', 'active', NULL, 1,
    'Capital, San Juan',
    '{"sub_category":"monitor","brand":"lg"}',
    now() - interval '6 days'
  ),

  -- ── ANA FERNÁNDEZ — Inmuebles ─────────────────────────────
  (
    '00000004-0000-0000-0000-000000000009',
    '00000003-0000-0000-0000-000000000004',
    'Departamento 2 ambientes en venta - Capital',
    'Vendo departamento propio, 2 ambientes. 58m², piso 2, balcón al frente. Cocina equipada, baño renovado. Edificio con ascensor. A 3 cuadras del centro. Escritura en orden, vendo directo sin inmobiliaria.',
    62000, 'USD', 'good', 'active', 'gold', 3,
    'Capital, San Juan',
    '{"sub_category":"departamento","operation":"venta","bedrooms":"2","bathrooms":1,"m2_covered":58,"zone":"capital","elevator":true}',
    now() - interval '2 days'
  ),
  (
    '00000004-0000-0000-0000-000000000010',
    '00000003-0000-0000-0000-000000000004',
    'Terreno propio 450m² - Chimbas con luz y agua',
    'Vendo terreno 450m² en Chimbas, zona residencial. Luz y agua en la calle, posibilidad de gas. Bien ubicado, a dos cuadras de avenida principal. Escritura lista, dueño vende directo.',
    19500, 'USD', 'new', 'active', 'silver', 3,
    'Chimbas, San Juan',
    '{"sub_category":"terreno","operation":"venta","m2_covered":450,"zone":"chimbas"}',
    now() - interval '8 days'
  ),

  -- ── DIEGO MARTÍNEZ — Deportes ─────────────────────────────
  (
    '00000004-0000-0000-0000-000000000011',
    '00000003-0000-0000-0000-000000000005',
    'Bicicleta ruta Trek Domane AL2 rodado 700',
    'Bicicleta de ruta Trek Domane AL2, rodado 700, talle 54. Shimano Claris 2x8 vel. 3 años de uso, siempre guardada bajo techo. Cubiertas nuevas, frenos ajustados. Ideal para salidas largas.',
    380000, 'ARS', 'very_good', 'active', 'gold', 6,
    'Capital, San Juan',
    '{"sub_category":"bicicleta","brand":"trek"}',
    now() - interval '3 days'
  ),
  (
    '00000004-0000-0000-0000-000000000012',
    '00000003-0000-0000-0000-000000000005',
    'Set mancuernas ajustables 2 a 24 kg + soporte',
    'Set de mancuernas ajustables de 2 a 24 kg cada una. Incluye soporte de piso. Poco uso, están como nuevas. Me armo un gym completo en casa y necesito el espacio. Precio por el juego completo.',
    92000, 'ARS', 'like_new', 'active', NULL, 6,
    'Capital, San Juan',
    '{"sub_category":"fitness","brand":"bowflex"}',
    now() - interval '5 days'
  ),
  (
    '00000004-0000-0000-0000-000000000013',
    '00000003-0000-0000-0000-000000000005',
    'Raqueta tenis Wilson Ultra 100 v3 - con funda',
    'Raqueta Wilson Ultra 100 v3 con encordado original y funda Wilson. La usé una temporada. Peso 300g, cabeza 100in². En buen estado, sin grietas. Vendo porque cambié de marca.',
    28000, 'ARS', 'good', 'active', NULL, 6,
    'Capital, San Juan',
    '{"sub_category":"raqueta","brand":"wilson"}',
    now() - interval '9 days'
  ),

  -- ── CARLA LÓPEZ — Bebés + Ropa ────────────────────────────
  (
    '00000004-0000-0000-0000-000000000014',
    '00000003-0000-0000-0000-000000000006',
    'Cochecito Infanti Compass 3 ruedas - gris',
    'Vendo cochecito Infanti Compass 3 ruedas, color gris. Capota extensible, canasto de compras, manija regulable. Mi hijo ya creció. En muy buen estado, sin roturas. Incluye cobertor y cubre lluvia.',
    115000, 'ARS', 'good', 'active', NULL, 23,
    'Rawson, San Juan',
    '{"sub_category":"paseo","brand":"infanti"}',
    now() - interval '2 days'
  ),
  (
    '00000004-0000-0000-0000-000000000015',
    '00000003-0000-0000-0000-000000000006',
    'Lote ropa bebé nena 0-6 meses - 25 prendas',
    'Vendo lote de ropa de bebé nena, talle 0 a 6 meses. 25 prendas: bodies, enteritos, mamelucos, buzos. Todas en excelente estado, lavadas y guardadas. Marcas: Mimo, Cheeky, Baby Cottons.',
    28000, 'ARS', 'very_good', 'active', NULL, 23,
    'Rawson, San Juan',
    '{"sub_category":"ropa"}',
    now() - interval '4 days'
  ),
  (
    '00000004-0000-0000-0000-000000000016',
    '00000003-0000-0000-0000-000000000006',
    'Silla de auto bebé Chicco KeyFit 0-13 kg',
    'Silla de auto Chicco KeyFit para bebé de 0 a 13 kg. Color gris. Usada hasta los 8 meses, en excelente estado. Con base ISOFIX. Nunca estuvo en accidente. Incluye parasol y funda lavable.',
    58000, 'ARS', 'very_good', 'active', NULL, 23,
    'Rawson, San Juan',
    '{"sub_category":"seguridad","brand":"chicco"}',
    now() - interval '6 days'
  ),

  -- ── ROBERTO SÁNCHEZ — Herramientas + Vehículo ────────────
  (
    '00000004-0000-0000-0000-000000000017',
    '00000003-0000-0000-0000-000000000007',
    'Taladro percutor Bosch GSB 13 RE - con accesorios',
    'Taladro percutor Bosch GSB 13 RE, 600W. Con maletín original, juego de brocas, destornilladores y topes. Poco uso, funciona perfecto. Lo cambio por uno a batería.',
    62000, 'ARS', 'very_good', 'active', NULL, 7,
    'Capital, San Juan',
    '{"sub_category":"electrica","brand":"bosch"}',
    now() - interval '3 days'
  ),
  (
    '00000004-0000-0000-0000-000000000018',
    '00000003-0000-0000-0000-000000000007',
    'Set herramientas Stanley 130 piezas - completo',
    'Set de herramientas Stanley de 130 piezas en maletín resistente. Incluye llaves combinadas, dados, destornilladores, alicates, cutter y más. Completo, no falta nada. Comprado y poco usado.',
    98000, 'ARS', 'like_new', 'active', NULL, 7,
    'Capital, San Juan',
    '{"sub_category":"manual","brand":"stanley"}',
    now() - interval '5 days'
  ),
  (
    '00000004-0000-0000-0000-000000000019',
    '00000003-0000-0000-0000-000000000007',
    'Ford Fiesta Kinetic 2014 - GNC y nafta',
    'Vendo Ford Fiesta Kinetic Design 2014, GNC y nafta, 120.000 km. 4 puertas, color rojo. Aire acondicionado, dirección asistida. GNC con equipo 5ta gen recién revisado. Apto transferencia.',
    7800000, 'ARS', 'good', 'active', 'gold', 2,
    'Capital, San Juan',
    '{"sub_category":"auto","brand":"ford","year":2014,"km":120000,"fuel":"gnc","transmission":"manual","seller_type":"particular","zone":"capital"}',
    now() - interval '7 days'
  ),

  -- ── SOFÍA TORRES — Electrodomésticos + Mascotas ──────────
  (
    '00000004-0000-0000-0000-000000000020',
    '00000003-0000-0000-0000-000000000008',
    'Heladera No Frost Whirlpool 380L - excelente estado',
    'Heladera no frost Whirlpool WRB38 380 litros, acero inoxidable. 4 años de uso, funciona perfecta. La vendo porque nos mudamos a un depto más chico. Tiene que ir a buscarla, no hago envíos.',
    275000, 'ARS', 'very_good', 'active', 'gold', 22,
    'Capital, San Juan',
    '{"sub_category":"heladera","brand":"whirlpool"}',
    now() - interval '2 days'
  ),
  (
    '00000004-0000-0000-0000-000000000021',
    '00000003-0000-0000-0000-000000000008',
    'Sillón 2 cuerpos chenille gris - buen estado',
    'Sillón de 2 cuerpos tapizado en chenille color gris. Tiene algunos años pero está en buen estado, sin roturas ni manchas. Largo 165cm. Se retira por Capital. Lo cambié por un juego nuevo.',
    125000, 'ARS', 'good', 'active', NULL, 5,
    'Capital, San Juan',
    '{"sub_category":"muebles"}',
    now() - interval '4 days'
  ),
  (
    '00000004-0000-0000-0000-000000000022',
    '00000003-0000-0000-0000-000000000008',
    'Doy en adopción gato persa blanco - castrado',
    'Doy en adopción gato persa blanco, macho, 2 años, castrado y vacunado al día. Muy cariñoso y tranquilo. Me mudo a un lugar que no admite mascotas. Requiero hogar responsable con referencias.',
    0, 'ARS', 'new', 'active', NULL, 9,
    'Capital, San Juan',
    '{"sub_category":"gatos","pet_type":"gatos"}',
    now() - interval '1 day'
  )

ON CONFLICT DO NOTHING;


-- ── 5. IMÁGENES ───────────────────────────────────────────────

INSERT INTO listing_images (listing_id, url, position) VALUES

  -- Toyota Hilux
  ('00000004-0000-0000-0000-000000000001','https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80', 0),
  ('00000004-0000-0000-0000-000000000001','https://images.unsplash.com/photo-1558618047-3c5fa3dec3c5?w=800&q=80', 1),
  ('00000004-0000-0000-0000-000000000001','https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80', 2),

  -- Yamaha FZ25
  ('00000004-0000-0000-0000-000000000002','https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&q=80', 0),
  ('00000004-0000-0000-0000-000000000002','https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80', 1),

  -- Vestido fiesta
  ('00000004-0000-0000-0000-000000000003','https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=800&q=80', 0),
  ('00000004-0000-0000-0000-000000000003','https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=800&q=80', 1),

  -- Campera North Face
  ('00000004-0000-0000-0000-000000000004','https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80', 0),
  ('00000004-0000-0000-0000-000000000004','https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80', 1),

  -- Mesa ratona
  ('00000004-0000-0000-0000-000000000005','https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80', 0),
  ('00000004-0000-0000-0000-000000000005','https://images.unsplash.com/photo-1549187774-b4e9b0445b41?w=800&q=80', 1),

  -- iPhone 13
  ('00000004-0000-0000-0000-000000000006','https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&q=80', 0),
  ('00000004-0000-0000-0000-000000000006','https://images.unsplash.com/photo-1574755393849-623942496936?w=800&q=80', 1),

  -- Notebook HP
  ('00000004-0000-0000-0000-000000000007','https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80', 0),
  ('00000004-0000-0000-0000-000000000007','https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80', 1),

  -- Monitor LG
  ('00000004-0000-0000-0000-000000000008','https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80', 0),
  ('00000004-0000-0000-0000-000000000008','https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=800&q=80', 1),

  -- Departamento Capital
  ('00000004-0000-0000-0000-000000000009','https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80', 0),
  ('00000004-0000-0000-0000-000000000009','https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80', 1),
  ('00000004-0000-0000-0000-000000000009','https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80', 2),

  -- Terreno Chimbas
  ('00000004-0000-0000-0000-000000000010','https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80', 0),
  ('00000004-0000-0000-0000-000000000010','https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80', 1),

  -- Bicicleta Trek ruta
  ('00000004-0000-0000-0000-000000000011','https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80', 0),
  ('00000004-0000-0000-0000-000000000011','https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800&q=80', 1),

  -- Mancuernas
  ('00000004-0000-0000-0000-000000000012','https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80', 0),
  ('00000004-0000-0000-0000-000000000012','https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&q=80', 1),

  -- Raqueta Wilson
  ('00000004-0000-0000-0000-000000000013','https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80', 0),
  ('00000004-0000-0000-0000-000000000013','https://images.unsplash.com/photo-1603988536861-d996b633e374?w=800&q=80', 1),

  -- Cochecito Infanti
  ('00000004-0000-0000-0000-000000000014','https://images.unsplash.com/photo-1519689373023-dd07c7988603?w=800&q=80', 0),
  ('00000004-0000-0000-0000-000000000014','https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&q=80', 1),

  -- Ropa bebé
  ('00000004-0000-0000-0000-000000000015','https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80', 0),
  ('00000004-0000-0000-0000-000000000015','https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', 1),

  -- Silla auto bebé
  ('00000004-0000-0000-0000-000000000016','https://images.unsplash.com/photo-1586861203927-800a5acdcc4d?w=800&q=80', 0),

  -- Taladro Bosch
  ('00000004-0000-0000-0000-000000000017','https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80', 0),
  ('00000004-0000-0000-0000-000000000017','https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=800&q=80', 1),

  -- Set herramientas Stanley
  ('00000004-0000-0000-0000-000000000018','https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80', 0),
  ('00000004-0000-0000-0000-000000000018','https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80', 1),

  -- Ford Fiesta
  ('00000004-0000-0000-0000-000000000019','https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80', 0),
  ('00000004-0000-0000-0000-000000000019','https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80', 1),

  -- Heladera Whirlpool
  ('00000004-0000-0000-0000-000000000020','https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&q=80', 0),
  ('00000004-0000-0000-0000-000000000020','https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&q=80', 1),

  -- Sillón 2 cuerpos
  ('00000004-0000-0000-0000-000000000021','https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80', 0),
  ('00000004-0000-0000-0000-000000000021','https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80', 1),

  -- Gato persa
  ('00000004-0000-0000-0000-000000000022','https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80', 0),
  ('00000004-0000-0000-0000-000000000022','https://images.unsplash.com/photo-1472491235688-bdc81a63246e?w=800&q=80', 1);


-- =============================================================
-- BLOQUE ADICIONAL — 100+ listings todas las categorías
-- =============================================================

-- ── USUARIOS ADICIONALES ─────────────────────────────────────

INSERT INTO auth.users (id, email, created_at, updated_at, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, aud, role)
VALUES
  ('00000003-0000-0000-0000-000000000009','martin.lopez@seed.test',     now(),now(),now(),'{"provider":"email","providers":["email"]}','{}','authenticated','authenticated'),
  ('00000003-0000-0000-0000-000000000010','valentina.ruiz@seed.test',   now(),now(),now(),'{"provider":"email","providers":["email"]}','{}','authenticated','authenticated'),
  ('00000003-0000-0000-0000-000000000011','fernando.garcia@seed.test',  now(),now(),now(),'{"provider":"email","providers":["email"]}','{}','authenticated','authenticated'),
  ('00000003-0000-0000-0000-000000000012','patricia.sosa@seed.test',    now(),now(),now(),'{"provider":"email","providers":["email"]}','{}','authenticated','authenticated'),
  ('00000003-0000-0000-0000-000000000013','nicolas.castro@seed.test',   now(),now(),now(),'{"provider":"email","providers":["email"]}','{}','authenticated','authenticated'),
  ('00000003-0000-0000-0000-000000000014','alejandra.mora@seed.test',   now(),now(),now(),'{"provider":"email","providers":["email"]}','{}','authenticated','authenticated'),
  ('00000003-0000-0000-0000-000000000015','pablo.mendez@seed.test',     now(),now(),now(),'{"provider":"email","providers":["email"]}','{}','authenticated','authenticated'),
  ('00000003-0000-0000-0000-000000000016','luciana.romero@seed.test',   now(),now(),now(),'{"provider":"email","providers":["email"]}','{}','authenticated','authenticated')
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, full_name, username, is_store)
VALUES
  ('00000003-0000-0000-0000-000000000009', 'Martín López',    'martin.lopez',    FALSE),
  ('00000003-0000-0000-0000-000000000010', 'Valentina Ruiz',  'valentina.ruiz',  FALSE),
  ('00000003-0000-0000-0000-000000000011', 'Fernando García', 'fernando.garcia', FALSE),
  ('00000003-0000-0000-0000-000000000012', 'Patricia Sosa',   'patricia.sosa',   FALSE),
  ('00000003-0000-0000-0000-000000000013', 'Nicolás Castro',  'nicolas.castro',  FALSE),
  ('00000003-0000-0000-0000-000000000014', 'Alejandra Mora',  'alejandra.mora',  FALSE),
  ('00000003-0000-0000-0000-000000000015', 'Pablo Méndez',    'pablo.mendez',    FALSE),
  ('00000003-0000-0000-0000-000000000016', 'Luciana Romero',  'luciana.romero',  FALSE)
ON CONFLICT (id) DO UPDATE SET full_name=EXCLUDED.full_name, username=EXCLUDED.username, is_store=EXCLUDED.is_store;


-- ── LISTINGS ADICIONALES ─────────────────────────────────────

INSERT INTO listings (id, user_id, title, description, price, currency, condition,
  status, featured_level, category_id, neighborhood, attributes, created_at)
VALUES

  -- ── VEHÍCULOS extra ──────────────────────────────────────
  ('00000004-0000-0000-0000-000000000023','00000003-0000-0000-0000-000000000009','Honda Civic 2018 - Full, 68.000 km','Honda Civic EX 2018, 68.000 km, nafta. Full equipo: pantalla, cámara reversa, asientos cuero, techo solar. Único dueño, en taller Honda siempre.',16900000,'ARS','very_good','active','gold',2,'Capital, San Juan','{"sub_category":"auto","brand":"honda","year":2018,"km":68000,"fuel":"nafta","transmission":"automatica","seller_type":"particular","zone":"capital"}',now()-interval '2 days'),

  ('00000004-0000-0000-0000-000000000024','00000003-0000-0000-0000-000000000011','Chevrolet Cruze LTZ 2016 - GNC','Chevrolet Cruze LTZ 2016 con GNC 5ta generación, 130.000 km. Cuero, pantalla, sensores. Muy buen estado. Transfer incluida.',9200000,'ARS','good','active','silver',2,'Capital, San Juan','{"sub_category":"auto","brand":"chevrolet","year":2016,"km":130000,"fuel":"gnc","transmission":"manual","seller_type":"particular","zone":"capital"}',now()-interval '4 days'),

  ('00000004-0000-0000-0000-000000000025','00000003-0000-0000-0000-000000000015','Renault Duster 4x4 2018 - Diesel','Renault Duster Privilege 4x4 diesel 2018, 95.000 km. Techo solar, cuero. Ideal para campo y ciudad. Muy buen estado general. Precio fijo.',13500000,'ARS','very_good','active','gold',2,'Rawson, San Juan','{"sub_category":"camioneta","brand":"renault","year":2018,"km":95000,"fuel":"diesel","transmission":"manual","seller_type":"particular","zone":"rawson"}',now()-interval '3 days'),

  ('00000004-0000-0000-0000-000000000026','00000003-0000-0000-0000-000000000009','Peugeot 208 Active 2020 - Nafta','Peugeot 208 Active 2020 nafta, 42.000 km. Color blanco. Bluetooth, control crucero. Primer dueño, service oficial al día.',10800000,'ARS','like_new','active',NULL,2,'Capital, San Juan','{"sub_category":"auto","brand":"peugeot","year":2020,"km":42000,"fuel":"nafta","transmission":"manual","seller_type":"particular","zone":"capital"}',now()-interval '5 days'),

  ('00000004-0000-0000-0000-000000000027','00000003-0000-0000-0000-000000000011','Moto Honda CG 150 Titan 2022','Honda CG 150 Titan 2022, 8.000 km. Nafta. Roja. Sin caídas, con funda y candado. Ideal movilidad urbana. Documentación al día.',2100000,'ARS','like_new','active','silver',2,'Capital, San Juan','{"sub_category":"moto","brand":"honda","year":2022,"km":8000,"fuel":"nafta","transmission":"manual","seller_type":"particular","zone":"capital"}',now()-interval '6 days'),

  ('00000004-0000-0000-0000-000000000028','00000003-0000-0000-0000-000000000013','Volkswagen Gol Power 2015 GNC','VW Gol Power 2015, GNC y nafta, 148.000 km. 3 puertas, color negro. A/C, cierre central. Muy mantenido, ideal para trabajo o primer auto.',5800000,'ARS','good','active',NULL,2,'Capital, San Juan','{"sub_category":"auto","brand":"volkswagen","year":2015,"km":148000,"fuel":"gnc","transmission":"manual","seller_type":"particular","zone":"capital"}',now()-interval '8 days'),

  ('00000004-0000-0000-0000-000000000029','00000003-0000-0000-0000-000000000015','Moto Yamaha XTZ 125 2021 enduro','Yamaha XTZ 125 2021, 15.000 km. Azul. Ideal campo y ciudad. Con parabarro elevado y protector de motor. Sin caídas importantes.',1850000,'ARS','very_good','active',NULL,2,'Capital, San Juan','{"sub_category":"moto","brand":"yamaha","year":2021,"km":15000,"fuel":"nafta","transmission":"manual","seller_type":"particular","zone":"capital"}',now()-interval '9 days'),

  -- ── INMUEBLES extra ───────────────────────────────────────
  ('00000004-0000-0000-0000-000000000030','00000003-0000-0000-0000-000000000015','Casa 4 dormitorios - Pocito, San Juan','Casa amplia en Pocito, 4 dormitorios, 3 baños, living-comedor, cocina separada. 220m² cubiertos. Quincho, patio grande, cochera 2 autos. Excelente estado. Dueño vende directo.',110000,'USD','very_good','active','gold',3,'Pocito, San Juan','{"sub_category":"casa","operation":"venta","bedrooms":"4","bathrooms":3,"m2_covered":220,"zone":"pocito","garage":true,"grill":true}',now()-interval '1 day'),

  ('00000004-0000-0000-0000-000000000031','00000003-0000-0000-0000-000000000012','Dpto 3 ambientes alquiler - Capital','Alquilo departamento 3 ambientes, Capital. 80m², piso 4 con vista. 2 dormitorios, baño y toilette, living amplio, cocina-comedor. Edificio con seguridad.',350000,'ARS','good','active','silver',3,'Capital, San Juan','{"sub_category":"departamento","operation":"alquiler","bedrooms":"2","bathrooms":2,"m2_covered":80,"zone":"capital","elevator":true}',now()-interval '2 days'),

  ('00000004-0000-0000-0000-000000000032','00000003-0000-0000-0000-000000000016','Local comercial 60m² - Avenida principal','Local comercial en avenida principal Capital. 60m², vidrieras, baño, depósito. Ideal local gastronómico o comercio. Alquiler con opción a compra.',280000,'ARS','good','active',NULL,3,'Capital, San Juan','{"sub_category":"local","operation":"alquiler","m2_covered":60,"zone":"capital"}',now()-interval '4 days'),

  ('00000004-0000-0000-0000-000000000033','00000003-0000-0000-0000-000000000015','Terreno 800m² escriturado - Rivadavia','Terreno en Rivadavia, 800m². Todos los servicios. Escritura lista. A 5 min de la Ruta 40. Zona residencial tranquila. Dueño vende.',28000,'USD','new','active',NULL,3,'Rivadavia, San Juan','{"sub_category":"terreno","operation":"venta","m2_covered":800,"zone":"rivadavia"}',now()-interval '10 days'),

  ('00000004-0000-0000-0000-000000000034','00000003-0000-0000-0000-000000000014','Casa 2 dorm alquiler temporario - Rawson','Casa temporaria en Rawson. 2 dormitorios, 1 baño, cocina equipada, WiFi. Ideal para trabajo o vacaciones. Por quincena o mes. Consultar disponibilidad.',180000,'ARS','very_good','active',NULL,3,'Rawson, San Juan','{"sub_category":"casa","operation":"alquiler-temporal","bedrooms":"2","bathrooms":1,"m2_covered":70,"zone":"rawson"}',now()-interval '3 days'),

  -- ── CELULARES extra ───────────────────────────────────────
  ('00000004-0000-0000-0000-000000000035','00000003-0000-0000-0000-000000000009','Samsung Galaxy A54 5G - 128GB nuevo','Samsung A54 5G 128GB nuevo en caja. Color negro. Cámara 50MP, pantalla Super AMOLED 6.4". Garantía oficial. Con vidrio templado de regalo.',380000,'ARS','new','active','silver',21,'Capital, San Juan','{"sub_category":"smartphone","brand":"samsung","model":"Galaxy A54","storage":"128gb","os":"android"}',now()-interval '2 days'),

  ('00000004-0000-0000-0000-000000000036','00000003-0000-0000-0000-000000000010','iPhone 12 64GB - Negro, batería 82%','iPhone 12 64GB negro. Liberado. Batería 82%, funciona perfecto. Con funda y vidrio templado desde el primer día. Precio muy accesible.',620000,'ARS','very_good','active',NULL,21,'Rivadavia, San Juan','{"sub_category":"smartphone","brand":"apple","model":"iPhone 12","storage":"64gb","os":"ios"}',now()-interval '3 days'),

  ('00000004-0000-0000-0000-000000000037','00000003-0000-0000-0000-000000000016','Motorola Moto G84 256GB - Azul','Motorola G84 256GB + 12GB RAM. Pantalla pOLED 6.55" 120Hz. Carga 33W. Nuevo en caja, importado oficial. Color azul medianoche.',290000,'ARS','new','active',NULL,21,'Capital, San Juan','{"sub_category":"smartphone","brand":"motorola","model":"Moto G84","storage":"256gb","os":"android"}',now()-interval '4 days'),

  ('00000004-0000-0000-0000-000000000038','00000003-0000-0000-0000-000000000013','Xiaomi Poco X5 Pro 5G - 256GB','Xiaomi Poco X5 Pro 5G 256GB 8GB RAM. Pantalla AMOLED 120Hz, cámara 108MP. Usado 6 meses, impecable. Con caja y accesorios.',310000,'ARS','very_good','active',NULL,21,'Capital, San Juan','{"sub_category":"smartphone","brand":"xiaomi","model":"Poco X5 Pro","storage":"256gb","os":"android"}',now()-interval '6 days'),

  ('00000004-0000-0000-0000-000000000039','00000003-0000-0000-0000-000000000014','Samsung Galaxy S22 128GB - Excelente','Samsung S22 128GB negro. Usado 1 año, impecable. Siempre con funda y vidrio templado. Batería al 91%. Con caja y cargador original.',720000,'ARS','very_good','active','silver',21,'Capital, San Juan','{"sub_category":"smartphone","brand":"samsung","model":"Galaxy S22","storage":"128gb","os":"android"}',now()-interval '5 days'),

  -- ── TECNOLOGÍA extra ──────────────────────────────────────
  ('00000004-0000-0000-0000-000000000040','00000003-0000-0000-0000-000000000013','PlayStation 5 + 2 joysticks + 3 juegos','PS5 edición estándar con lector. Incluye 2 joysticks DualSense y 3 juegos: FIFA, God of War y Spider-Man 2. En perfecto estado, poco uso.',850000,'ARS','very_good','active','gold',1,'Capital, San Juan','{"sub_category":"consola-ps","brand":"sony","model":"PlayStation 5"}',now()-interval '1 day'),

  ('00000004-0000-0000-0000-000000000041','00000003-0000-0000-0000-000000000009','Nintendo Switch OLED + 4 juegos','Nintendo Switch OLED blanca. Con 4 juegos: Zelda BotW, Mario Kart 8, Animal Crossing y Pokémon. Funda y protector pantalla incluidos.',580000,'ARS','very_good','active','silver',1,'Capital, San Juan','{"sub_category":"consola-nintendo","brand":"nintendo","model":"Switch OLED"}',now()-interval '3 days'),

  ('00000004-0000-0000-0000-000000000042','00000003-0000-0000-0000-000000000011','MacBook Air M1 8GB 256GB - Space Gray','MacBook Air M1 2020, 8GB RAM, 256GB SSD. Space Gray. Batería al 88%, funciona perfecto. Con cargador original. La cambio por M2.',980000,'ARS','very_good','active','gold',1,'Capital, San Juan','{"sub_category":"notebook","brand":"apple","model":"MacBook Air M1"}',now()-interval '2 days'),

  ('00000004-0000-0000-0000-000000000043','00000003-0000-0000-0000-000000000016','Smart TV Samsung 55" 4K UHD - QLED','Samsung QLED 55" 4K 2022. Smart TV con Tizen, Netflix, Disney+. Sin uso, en caja. Lo compré para otro ambiente y no lo usé.',680000,'ARS','new','active',NULL,1,'Capital, San Juan','{"sub_category":"tv","brand":"samsung","model":"Q60B 55 QLED"}',now()-interval '4 days'),

  ('00000004-0000-0000-0000-000000000044','00000003-0000-0000-0000-000000000012','iPad Air 5ta gen 64GB WiFi - Azul','iPad Air 5ta generación, chip M1, 64GB WiFi. Color azul. Con funda Smart Folio de Apple. Poco uso, en excelente estado.',620000,'ARS','very_good','active',NULL,1,'Capital, San Juan','{"sub_category":"tablet","brand":"apple","model":"iPad Air 5"}',now()-interval '5 days'),

  ('00000004-0000-0000-0000-000000000045','00000003-0000-0000-0000-000000000013','PC gamer Ryzen 5 - RTX 3060 - 16GB','PC gamer armada: Ryzen 5 5600X, RTX 3060 12GB, 16GB RAM DDR4, SSD 500GB + HDD 1TB. Gabinete con iluminación RGB. Sin uso en los últimos meses.',980000,'ARS','very_good','active','gold',1,'Capital, San Juan','{"sub_category":"pc","brand":"custom"}',now()-interval '3 days'),

  -- ── ELECTRODOMÉSTICOS extra ───────────────────────────────
  ('00000004-0000-0000-0000-000000000046','00000003-0000-0000-0000-000000000012','Lavarropas LG 9kg Inverter - Excelente','LG 9kg carga frontal Inverter Direct Drive. 2 años de uso, funciona perfecto. Programas variados, bajo consumo. Se retira por Capital.',220000,'ARS','very_good','active','silver',22,'Capital, San Juan','{"sub_category":"lavarropas","brand":"lg"}',now()-interval '2 days'),

  ('00000004-0000-0000-0000-000000000047','00000003-0000-0000-0000-000000000010','Aire acondicionado Inverter 3000 frig - Split','Split Inverter 3000 frigorías frío/calor. Marca Carrier, 2 años de uso. Funciona perfecto, instalación ya hecha. Vendo porque me mudo.',350000,'ARS','very_good','active',NULL,22,'Rivadavia, San Juan','{"sub_category":"aire","brand":"carrier"}',now()-interval '4 days'),

  ('00000004-0000-0000-0000-000000000048','00000003-0000-0000-0000-000000000014','Cocina 5 hornallas Longvie con horno','Cocina 5 hornallas Longvie con horno. 3 años de uso, buen estado. Gas natural. Parrilla desmontable. Se va por necesitar espacio.',85000,'ARS','good','active',NULL,22,'Rawson, San Juan','{"sub_category":"cocina","brand":"longvie"}',now()-interval '6 days'),

  ('00000004-0000-0000-0000-000000000049','00000003-0000-0000-0000-000000000016','Microondas Whirlpool 25L - Digital','Microondas Whirlpool 25 litros, panel digital, grill incluido. 2 años de uso. Funciona perfecto. Me regalan uno nuevo y vendo este.',48000,'ARS','very_good','active',NULL,22,'Capital, San Juan','{"sub_category":"microondas","brand":"whirlpool"}',now()-interval '7 days'),

  ('00000004-0000-0000-0000-000000000050','00000003-0000-0000-0000-000000000011','Secarropas a gas Briket 7kg','Secarropas a gas Briket 7kg. Muy buen estado, 4 años de uso. Funciona perfecto. Se retira por Capital, no hago envíos.',95000,'ARS','good','active',NULL,22,'Capital, San Juan','{"sub_category":"secarropas","brand":"briket"}',now()-interval '5 days'),

  -- ── ROPA Y CALZADO extra ──────────────────────────────────
  ('00000004-0000-0000-0000-000000000051','00000003-0000-0000-0000-000000000010','Remera Nike Dri-FIT pack x3 - Talle L','Pack de 3 remeras Nike Dri-FIT originales talle L. Colores: negro, blanco y azul. Sin uso, en bolsa original. Compradas en outlet.',42000,'ARS','new','active',NULL,4,'Rivadavia, San Juan','{"sub_category":"ropa","gender":"hombre","brand":"Nike","size":"L"}',now()-interval '2 days'),

  ('00000004-0000-0000-0000-000000000052','00000003-0000-0000-0000-000000000010','Zapatillas Adidas Ultraboost 22 - Talle 42','Adidas Ultraboost 22 talle 42. Color negro. Usadas 3 veces, prácticamente nuevas. Compradas en el exterior. Con caja y bolsa.',185000,'ARS','like_new','active','silver',4,'Rivadavia, San Juan','{"sub_category":"calzado","gender":"hombre","brand":"Adidas","size":"42","model":"Ultraboost 22"}',now()-interval '3 days'),

  ('00000004-0000-0000-0000-000000000053','00000003-0000-0000-0000-000000000014','Traje de hombre slim fit - Talle 50','Traje de hombre slim fit color azul marino. Talle 50. Incluye saco y pantalón. Usado 2 veces para eventos. Marca Guido.',75000,'ARS','like_new','active',NULL,4,'Rawson, San Juan','{"sub_category":"ropa","gender":"hombre","size":"50"}',now()-interval '5 days'),

  ('00000004-0000-0000-0000-000000000054','00000003-0000-0000-0000-000000000010','Vestido de noche talle S - Plateado','Vestido de noche plateado, talle S. Largo hasta la rodilla, escote halter. Usado una vez, impecable. Ideal para fiesta o evento formal.',32000,'ARS','like_new','active',NULL,4,'Rivadavia, San Juan','{"sub_category":"ropa","gender":"mujer","size":"S"}',now()-interval '4 days'),

  ('00000004-0000-0000-0000-000000000055','00000003-0000-0000-0000-000000000016','Campera de ski hombre talle XL impermeable','Campera de ski Burton talle XL, impermeable y transpirable. Color naranja. Usada 2 temporadas. Con capucha desmontable y ventilaciones.',120000,'ARS','very_good','active',NULL,4,'Capital, San Juan','{"sub_category":"ropa","gender":"hombre","brand":"Burton","size":"XL"}',now()-interval '6 days'),

  -- ── HOGAR Y MUEBLES extra ─────────────────────────────────
  ('00000004-0000-0000-0000-000000000056','00000003-0000-0000-0000-000000000012','Cama 2 plazas + sommier + colchón','Cama 2 plazas con sommier y colchón memory foam Piero. Estructura de madera maciza. 3 años de uso. Excelente estado. Se retira desmontada.',320000,'ARS','very_good','active','gold',5,'Capital, San Juan','{"sub_category":"dormitorio"}',now()-interval '1 day'),

  ('00000004-0000-0000-0000-000000000057','00000003-0000-0000-0000-000000000016','Placard 3 puertas corredizas con espejo','Placard 3 puertas corredizas, una con espejo cuerpo entero. 2,10m alto x 1,80m ancho. Interior con estantes y colgador. Buen estado.',185000,'ARS','good','active',NULL,5,'Capital, San Juan','{"sub_category":"muebles"}',now()-interval '3 days'),

  ('00000004-0000-0000-0000-000000000058','00000003-0000-0000-0000-000000000009','Escritorio L con cajonera - Home office','Escritorio en forma de L con cajonera pedestal 3 cajones. Melamina color wengue. 160x120cm. Ideal home office. Buen estado, sin roturas.',98000,'ARS','good','active',NULL,5,'Capital, San Juan','{"sub_category":"muebles"}',now()-interval '4 days'),

  ('00000004-0000-0000-0000-000000000059','00000003-0000-0000-0000-000000000012','Silla gamer ergonómica - Roja/Negra','Silla gamer ergonómica reclinable, apoyabrazos regulables, soporte lumbar y cervical. Color rojo/negro. 1 año de uso, excelente estado.',95000,'ARS','very_good','active',NULL,5,'Capital, San Juan','{"sub_category":"muebles"}',now()-interval '5 days'),

  ('00000004-0000-0000-0000-000000000060','00000003-0000-0000-0000-000000000014','Juego dormitorio 2 plazas: cama+mesa de luz','Juego dormitorio madera: cama 2 plazas con respaldo tapizado + 2 mesas de luz. Color blanco. 2 años de uso. Buen estado general.',280000,'ARS','good','active','silver',5,'Rawson, San Juan','{"sub_category":"dormitorio"}',now()-interval '2 days'),

  ('00000004-0000-0000-0000-000000000061','00000003-0000-0000-0000-000000000016','Biblioteca estantería 5 estantes - Roble','Biblioteca con 5 estantes en melamina roble. 1,80m alto x 0,80m ancho. Muy buen estado, sin ralladuras. Me redecoro y no entra.',55000,'ARS','very_good','active',NULL,5,'Capital, San Juan','{"sub_category":"muebles"}',now()-interval '7 days'),

  -- ── DEPORTES extra ────────────────────────────────────────
  ('00000004-0000-0000-0000-000000000062','00000003-0000-0000-0000-000000000013','Caminadora eléctrica NordicTrack T6.5S','Caminadora NordicTrack T6.5S, velocidad 0-16km/h, inclinación 10%. Pantalla LCD, altavoces. 2 años de uso, funciona perfecta. Con iFit incluido.',520000,'ARS','very_good','active','gold',6,'Capital, San Juan','{"sub_category":"fitness","brand":"NordicTrack","model":"T6.5S"}',now()-interval '2 days'),

  ('00000004-0000-0000-0000-000000000063','00000003-0000-0000-0000-000000000015','Kayak individual + remo + chaleco - Nuevo','Kayak individual 3m, incluye remo de aluminio y chaleco salvavidas. Sin uso, comprado y no lo pude usar. Ideal ríos y lagos.',380000,'ARS','new','active',NULL,6,'Capital, San Juan','{"sub_category":"camping"}',now()-interval '5 days'),

  ('00000004-0000-0000-0000-000000000064','00000003-0000-0000-0000-000000000013','Guantes boxeo Everlast 16oz + vendas','Guantes de boxeo Everlast Pro Style 16oz + vendas elásticas x2. Poco uso. Para sparring o entrenamiento. En buen estado.',28000,'ARS','good','active',NULL,6,'Capital, San Juan','{"sub_category":"fitness","brand":"everlast"}',now()-interval '6 days'),

  ('00000004-0000-0000-0000-000000000065','00000003-0000-0000-0000-000000000011','Patines en línea Rollerblade talle 42','Patines en línea Rollerblade Macroblade 84 talle 42. Rodamientos ABEC-7. Usados 4 veces, como nuevos. Con bolsa y protectores.',98000,'ARS','like_new','active',NULL,6,'Capital, San Juan','{"sub_category":"otro"}',now()-interval '4 days'),

  ('00000004-0000-0000-0000-000000000066','00000003-0000-0000-0000-000000000015','Pelota básquet Spalding NBA - N° 7','Pelota de básquet Spalding NBA Official Game Ball N°7. Cuero genuino. Usada en canchas techadas. Buen estado. Presión perfecta.',32000,'ARS','good','active',NULL,6,'Capital, San Juan','{"sub_category":"pelota","brand":"spalding"}',now()-interval '8 days'),

  -- ── HERRAMIENTAS extra ────────────────────────────────────
  ('00000004-0000-0000-0000-000000000067','00000003-0000-0000-0000-000000000011','Hidrolavadora Karcher K5 - 2800 PSI','Karcher K5 Premium 2800 PSI, motor de inducción. Con lanza Vario y Dirtblaster. 2 años de uso, funciona perfecta. Ideal exteriores.',320000,'ARS','very_good','active','gold',7,'Capital, San Juan','{"sub_category":"electrica","brand":"karcher","model":"K5"}',now()-interval '1 day'),

  ('00000004-0000-0000-0000-000000000068','00000003-0000-0000-0000-000000000011','Soldadora inverter 200A - Electrodos','Soldadora inverter 200A marca Lincoln. Porta-electrodo y masa incluidos. Poco uso. Ideal herrería o reparaciones. Funciona perfecta.',145000,'ARS','very_good','active',NULL,7,'Capital, San Juan','{"sub_category":"soldadura","brand":"lincoln"}',now()-interval '3 days'),

  ('00000004-0000-0000-0000-000000000069','00000003-0000-0000-0000-000000000015','Sierra circular Bosch 7.1/4" 1400W','Sierra circular Bosch GKS 190 7.1/4" 1400W. Con disco original y guía paralela. Poco uso. Vendo por cambio de oficio.',98000,'ARS','very_good','active',NULL,7,'Capital, San Juan','{"sub_category":"electrica","brand":"bosch"}',now()-interval '5 days'),

  ('00000004-0000-0000-0000-000000000070','00000003-0000-0000-0000-000000000013','Lijadora orbital Makita 300W + lijas','Lijadora orbital Makita 300W con 20 discos de lija surtidos. Poco uso. Con bolsa recolectora de polvo. Ideal carpintería y pintura.',55000,'ARS','like_new','active',NULL,7,'Capital, San Juan','{"sub_category":"electrica","brand":"makita"}',now()-interval '4 days'),

  ('00000004-0000-0000-0000-000000000071','00000003-0000-0000-0000-000000000011','Nivel láser autonivelante + trípode','Nivel láser autonivelante Bosch GLL 3-80. 3 líneas, alcance 30m. Con trípode y maletín. Usado en obra, buen estado.',185000,'ARS','good','active',NULL,7,'Capital, San Juan','{"sub_category":"medicion","brand":"bosch"}',now()-interval '6 days'),

  -- ── BEBÉS Y NIÑOS extra ───────────────────────────────────
  ('00000004-0000-0000-0000-000000000072','00000003-0000-0000-0000-000000000014','Cuna corral Infanti + colchón + accesorios','Cuna corral Infanti con colchón, sábanas y mosquitero. Se convierte en corralito. Mi bebé ya creció. Excelente estado.',155000,'ARS','very_good','active','silver',23,'Rawson, San Juan','{"sub_category":"corralito","brand":"infanti"}',now()-interval '2 days'),

  ('00000004-0000-0000-0000-000000000073','00000003-0000-0000-0000-000000000006','Hamaca mecedora para bebé Fisher Price','Hamaca mecedora automática Fisher Price Snugabunny. Música, vibración y movimiento. 4 velocidades. Poco uso. Con adaptador.',62000,'ARS','very_good','active',NULL,23,'Rawson, San Juan','{"sub_category":"cuarto","brand":"fisher price"}',now()-interval '4 days'),

  ('00000004-0000-0000-0000-000000000074','00000003-0000-0000-0000-000000000014','Monitor de bebé Motorola video + audio','Monitor de bebé Motorola MBP36S con pantalla 3.5" a color, visión nocturna, zoom. Funciona perfecto. Con base y batería.',78000,'ARS','very_good','active',NULL,23,'Rawson, San Juan','{"sub_category":"salud","brand":"motorola"}',now()-interval '5 days'),

  ('00000004-0000-0000-0000-000000000075','00000003-0000-0000-0000-000000000006','Bañera bebé + cambiador plegable','Bañera de bebé + cambiador plegable con almohadilla. Excelente estado, usados 8 meses. Incluye termómetro de agua de regalo.',35000,'ARS','very_good','active',NULL,23,'Rawson, San Juan','{"sub_category":"bano"}',now()-interval '6 days'),

  -- ── MÚSICA, LIBROS Y REVISTAS ─────────────────────────────
  ('00000004-0000-0000-0000-000000000076','00000003-0000-0000-0000-000000000013','Guitarra eléctrica Fender Stratocaster MX','Fender Stratocaster Player Mexico sunburst. 3 años de uso. Pastillas V-Mod, clavijero bloqueado. Excelente sonido. Con funda rígida.',580000,'ARS','very_good','active','gold',8,'Capital, San Juan','{"sub_category":"otro","brand":"fender","model":"Stratocaster Player"}',now()-interval '2 days'),

  ('00000004-0000-0000-0000-000000000077','00000003-0000-0000-0000-000000000016','Piano digital Yamaha P-45 + soporte + pedal','Yamaha P-45 88 teclas pesadas. Con soporte L-85 y pedal sustain. 2 años de uso. Sonido de cola de concierto. Ideal principiantes y avanzados.',420000,'ARS','very_good','active','silver',8,'Capital, San Juan','{"sub_category":"otro","brand":"yamaha","model":"P-45"}',now()-interval '3 days'),

  ('00000004-0000-0000-0000-000000000078','00000003-0000-0000-0000-000000000013','Lote 40 libros ficción - García Márquez Borges','Lote de 40 libros de literatura: García Márquez, Borges, Cortázar, Vargas Llosa, entre otros. Todos en muy buen estado. Precio por el lote.',25000,'ARS','very_good','active',NULL,8,'Capital, San Juan','{"sub_category":"libros"}',now()-interval '5 days'),

  ('00000004-0000-0000-0000-000000000079','00000003-0000-0000-0000-000000000009','Bajo eléctrico Squier + amplificador','Bajo eléctrico Squier Affinity Jazz Bass + amplificador Fender Rumble 25W. Ideal para aprender. Excelente estado. Vendo por cambio de instrumento.',320000,'ARS','very_good','active',NULL,8,'Capital, San Juan','{"sub_category":"otro","brand":"squier"}',now()-interval '4 days'),

  -- ── BELLEZA Y SALUD ───────────────────────────────────────
  ('00000004-0000-0000-0000-000000000080','00000003-0000-0000-0000-000000000010','Perfume Chanel N°5 EDP 100ml - Original','Chanel N°5 Eau de Parfum 100ml original. Sellado, nunca abierto. Traído del exterior. Certificado de autenticidad. Perfecto para regalo.',280000,'ARS','new','active','silver',24,'Rivadavia, San Juan','{"sub_category":"perfume","brand":"Chanel"}',now()-interval '1 day'),

  ('00000004-0000-0000-0000-000000000081','00000003-0000-0000-0000-000000000010','Set maquillaje MAC 15 piezas - Original','Set de maquillaje MAC completo: bases, sombras, labiales, brochas. Todo original, sin uso. Traído de exterior. Ideal regalo.',185000,'ARS','new','active',NULL,24,'Rivadavia, San Juan','{"sub_category":"maquillaje","brand":"MAC"}',now()-interval '3 days'),

  ('00000004-0000-0000-0000-000000000082','00000003-0000-0000-0000-000000000016','Secador pelo profesional Dyson Supersonic','Dyson Supersonic rojo/negro. Poco uso, excelente estado. Con todos los accesorios y estuche original. Precio muy por debajo del retail.',480000,'ARS','very_good','active','gold',24,'Capital, San Juan','{"sub_category":"herramientas-belleza","brand":"dyson","model":"Supersonic"}',now()-interval '2 days'),

  ('00000004-0000-0000-0000-000000000083','00000003-0000-0000-0000-000000000014','Bicicleta fija spinning indoor - Regulable','Bicicleta fija spinning con resistencia regulable, manillar y asiento ajustables. 2 años de uso. Funciona perfecta. Ideal cardio en casa.',185000,'ARS','very_good','active',NULL,24,'Rawson, San Juan','{"sub_category":"bienestar"}',now()-interval '4 days'),

  -- ── JUEGOS Y JUGUETES ─────────────────────────────────────
  ('00000004-0000-0000-0000-000000000084','00000003-0000-0000-0000-000000000014','LEGO Technic Bugatti Chiron 42083 - Completo','LEGO Technic 42083 Bugatti Chiron, 3.599 piezas. Completo con instrucciones. Armado una vez con cuidado. En excelente estado. Valor coleccionable.',620000,'ARS','very_good','active','gold',25,'Rawson, San Juan','{"sub_category":"construccion","brand":"LEGO","model":"42083 Technic Bugatti"}',now()-interval '1 day'),

  ('00000004-0000-0000-0000-000000000085','00000003-0000-0000-0000-000000000006','Juego de mesa Catán + expansiones x3','El Catán edición estándar + 3 expansiones: Marineros, Ciudades&Caballeros y Exploradores. Completos, en buen estado. Horas de diversión.',95000,'ARS','good','active',NULL,25,'Rawson, San Juan','{"sub_category":"juegos-mesa","brand":"Devir"}',now()-interval '3 days'),

  ('00000004-0000-0000-0000-000000000086','00000003-0000-0000-0000-000000000006','Auto control remoto profesional 4x4 1:10','Auto control remoto 4x4 escala 1:10 marca Traxxas. Velocidad hasta 60km/h. Con batería LiPo y cargador. Poco uso, excelente estado.',280000,'ARS','very_good','active',NULL,25,'Rawson, San Juan','{"sub_category":"vehiculos-juguete","brand":"Traxxas"}',now()-interval '5 days'),

  -- ── MASCOTAS extra ────────────────────────────────────────
  ('00000004-0000-0000-0000-000000000087','00000003-0000-0000-0000-000000000016','Acuario completo 200L + peces + filtro','Acuario 200 litros con filtro canister, iluminación LED, calefactor, sustrato y decoración. Incluye peces. Todo en funcionamiento. Vendo completo.',320000,'ARS','very_good','active','silver',9,'Capital, San Juan','{"sub_category":"peces","pet_type":"peces"}',now()-interval '2 days'),

  ('00000004-0000-0000-0000-000000000088','00000003-0000-0000-0000-000000000009','Jaula loro grande 1,5m con juguetes','Jaula para loro grande, 1,5m de alto, acero inoxidable. Incluye perchas, juguetes y comederos. Poco uso. Se retira desmontada por Capital.',145000,'ARS','very_good','active',NULL,9,'Capital, San Juan','{"sub_category":"aves","pet_type":"aves"}',now()-interval '4 days'),

  ('00000004-0000-0000-0000-000000000089','00000003-0000-0000-0000-000000000008','Alimento gato Royal Canin Adult 10kg','Royal Canin Indoor Adult 10kg para gatos adultos de interior. Sellado, fecha de vencimiento 2025. Compré de más.',42000,'ARS','new','active',NULL,9,'Capital, San Juan','{"sub_category":"alimentacion","brand":"royal canin","pet_type":"gatos"}',now()-interval '5 days'),

  -- ── SERVICIOS ─────────────────────────────────────────────
  ('00000004-0000-0000-0000-000000000090','00000003-0000-0000-0000-000000000015','Plomería - Instalaciones y reparaciones','Plomero matriculado. Instalaciones, reparaciones, destapes, termotanques. Trabajo garantizado. Disponibilidad lunes a sábado. Presupuesto sin cargo. San Juan capital y alrededores.',0,'ARS','new','active',NULL,26,'Capital, San Juan','{"sub_category":"construccion","seller_type":"particular"}',now()-interval '2 days'),

  ('00000004-0000-0000-0000-000000000091','00000003-0000-0000-0000-000000000011','Pintura interior/exterior - Presupuesto gratis','Pintor profesional. Pintura interior y exterior, texturados, enduídos, barnices. Trabajos prolijos y garantizados. Experiencia 15 años. Consultas por WhatsApp.',0,'ARS','new','active',NULL,26,'Capital, San Juan','{"sub_category":"construccion","seller_type":"particular"}',now()-interval '3 days'),

  ('00000004-0000-0000-0000-000000000092','00000003-0000-0000-0000-000000000016','Clases de inglés particulares - Todos los niveles','Profesora de inglés con título universitario. Clases individuales o grupales, presenciales u online. Todos los niveles: básico, intermedio, avanzado. Preparación para exámenes.',0,'ARS','new','active',NULL,26,'Capital, San Juan','{"sub_category":"cursos","seller_type":"particular"}',now()-interval '4 days'),

  ('00000004-0000-0000-0000-000000000093','00000003-0000-0000-0000-000000000013','Diseño gráfico - Logos, flyers, redes sociales','Diseñador gráfico freelance. Logos, identidad visual, flyers, contenido para redes sociales. Entregas en 48h. Portfolio disponible. Trabajo por proyecto o mensual.',0,'ARS','new','active',NULL,26,'Capital, San Juan','{"sub_category":"diseno","seller_type":"particular"}',now()-interval '5 days'),

  -- ── OTROS ─────────────────────────────────────────────────
  ('00000004-0000-0000-0000-000000000094','00000003-0000-0000-0000-000000000013','Cámara Sony Alpha A6400 + lente 18-135mm','Sony Alpha A6400, 24MP, video 4K. Con lente 18-135mm kit. 2 años de uso, excelente estado. Con batería extra, cargador y bolso. Ideal foto y video.',950000,'ARS','very_good','active','gold',10,'Capital, San Juan','{"sub_category":"camara","brand":"sony","model":"A6400"}',now()-interval '2 days'),

  ('00000004-0000-0000-0000-000000000095','00000003-0000-0000-0000-000000000009','Colección monedas antiguas Argentina 80 piezas','Colección de 80 monedas antiguas argentinas: desde 1880 a 1990. Con catálogo y álbum clasificador. Algunas en excelente estado numismático.',85000,'ARS','very_good','active',NULL,10,'Capital, San Juan','{"sub_category":"coleccionismo"}',now()-interval '5 days'),

  ('00000004-0000-0000-0000-000000000096','00000003-0000-0000-0000-000000000012','Drone DJI Mini 3 + 2 baterías + ND filters','DJI Mini 3 con 2 baterías, filtros ND (4,8,16,64) y bolso de transporte. 5 horas de vuelo total. Perfecto estado, sin golpes.',580000,'ARS','very_good','active','gold',10,'Capital, San Juan','{"sub_category":"drone","brand":"dji","model":"Mini 3"}',now()-interval '1 day'),

  ('00000004-0000-0000-0000-000000000097','00000003-0000-0000-0000-000000000016','Telescopio Celestron 70mm + trípode','Telescopio refractor Celestron PowerSeeker 70AZ, 70mm. Con trípode, dos oculares y Barlow 3X. Poco uso. Ideal astronomía amateur.',98000,'ARS','very_good','active',NULL,10,'Capital, San Juan','{"sub_category":"otro","brand":"celestron"}',now()-interval '6 days')

ON CONFLICT DO NOTHING;


-- ── IMÁGENES ADICIONALES ─────────────────────────────────────

INSERT INTO listing_images (listing_id, url, position) VALUES

  -- Honda Civic
  ('00000004-0000-0000-0000-000000000023','https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80',0),
  ('00000004-0000-0000-0000-000000000023','https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80',1),
  -- Chevrolet Cruze
  ('00000004-0000-0000-0000-000000000024','https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80',0),
  ('00000004-0000-0000-0000-000000000024','https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',1),
  -- Renault Duster
  ('00000004-0000-0000-0000-000000000025','https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80',0),
  ('00000004-0000-0000-0000-000000000025','https://images.unsplash.com/photo-1558618047-3c5fa3dec3c5?w=800&q=80',1),
  -- Peugeot 208
  ('00000004-0000-0000-0000-000000000026','https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80',0),
  -- Honda CG 150
  ('00000004-0000-0000-0000-000000000027','https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&q=80',0),
  ('00000004-0000-0000-0000-000000000027','https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80',1),
  -- Gol Power
  ('00000004-0000-0000-0000-000000000028','https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=800&q=80',0),
  -- Yamaha XTZ
  ('00000004-0000-0000-0000-000000000029','https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&q=80',0),

  -- Casa Pocito
  ('00000004-0000-0000-0000-000000000030','https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80',0),
  ('00000004-0000-0000-0000-000000000030','https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',1),
  ('00000004-0000-0000-0000-000000000030','https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800&q=80',2),
  -- Dpto alquiler
  ('00000004-0000-0000-0000-000000000031','https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',0),
  ('00000004-0000-0000-0000-000000000031','https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80',1),
  -- Local comercial
  ('00000004-0000-0000-0000-000000000032','https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',0),
  -- Terreno Rivadavia
  ('00000004-0000-0000-0000-000000000033','https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',0),
  ('00000004-0000-0000-0000-000000000033','https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80',1),
  -- Casa temporaria
  ('00000004-0000-0000-0000-000000000034','https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800&q=80',0),
  ('00000004-0000-0000-0000-000000000034','https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',1),

  -- Samsung A54
  ('00000004-0000-0000-0000-000000000035','https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80',0),
  ('00000004-0000-0000-0000-000000000035','https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800&q=80',1),
  -- iPhone 12
  ('00000004-0000-0000-0000-000000000036','https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&q=80',0),
  ('00000004-0000-0000-0000-000000000036','https://images.unsplash.com/photo-1574755393849-623942496936?w=800&q=80',1),
  -- Motorola G84
  ('00000004-0000-0000-0000-000000000037','https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80',0),
  -- Xiaomi Poco
  ('00000004-0000-0000-0000-000000000038','https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?w=800&q=80',0),
  -- Samsung S22
  ('00000004-0000-0000-0000-000000000039','https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=800&q=80',0),
  ('00000004-0000-0000-0000-000000000039','https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80',1),

  -- PS5
  ('00000004-0000-0000-0000-000000000040','https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&q=80',0),
  ('00000004-0000-0000-0000-000000000040','https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800&q=80',1),
  -- Nintendo Switch
  ('00000004-0000-0000-0000-000000000041','https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800&q=80',0),
  ('00000004-0000-0000-0000-000000000041','https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800&q=80',1),
  -- MacBook Air M1
  ('00000004-0000-0000-0000-000000000042','https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',0),
  ('00000004-0000-0000-0000-000000000042','https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',1),
  -- Smart TV Samsung
  ('00000004-0000-0000-0000-000000000043','https://images.unsplash.com/photo-1593359677879-a4bb92f4834c?w=800&q=80',0),
  ('00000004-0000-0000-0000-000000000043','https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80',1),
  -- iPad Air
  ('00000004-0000-0000-0000-000000000044','https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80',0),
  -- PC gamer
  ('00000004-0000-0000-0000-000000000045','https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&q=80',0),
  ('00000004-0000-0000-0000-000000000045','https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80',1),

  -- Lavarropas LG
  ('00000004-0000-0000-0000-000000000046','https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800&q=80',0),
  ('00000004-0000-0000-0000-000000000046','https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',1),
  -- Aire acondicionado
  ('00000004-0000-0000-0000-000000000047','https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80',0),
  -- Cocina Longvie
  ('00000004-0000-0000-0000-000000000048','https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',0),
  ('00000004-0000-0000-0000-000000000048','https://images.unsplash.com/photo-1565183928294-7063f23ce0f8?w=800&q=80',1),
  -- Microondas
  ('00000004-0000-0000-0000-000000000049','https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800&q=80',0),
  -- Secarropas
  ('00000004-0000-0000-0000-000000000050','https://images.unsplash.com/photo-1591088398332-8596b432edc4?w=800&q=80',0),

  -- Remeras Nike
  ('00000004-0000-0000-0000-000000000051','https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&q=80',0),
  -- Zapatillas Adidas
  ('00000004-0000-0000-0000-000000000052','https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',0),
  ('00000004-0000-0000-0000-000000000052','https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&q=80',1),
  -- Traje hombre
  ('00000004-0000-0000-0000-000000000053','https://images.unsplash.com/photo-1594938298603-c8148c4b4357?w=800&q=80',0),
  -- Vestido noche
  ('00000004-0000-0000-0000-000000000054','https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=800&q=80',0),
  -- Campera ski
  ('00000004-0000-0000-0000-000000000055','https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',0),

  -- Cama 2 plazas
  ('00000004-0000-0000-0000-000000000056','https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&q=80',0),
  ('00000004-0000-0000-0000-000000000056','https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80',1),
  -- Placard
  ('00000004-0000-0000-0000-000000000057','https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=80',0),
  -- Escritorio L
  ('00000004-0000-0000-0000-000000000058','https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80',0),
  ('00000004-0000-0000-0000-000000000058','https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80',1),
  -- Silla gamer
  ('00000004-0000-0000-0000-000000000059','https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=800&q=80',0),
  -- Juego dormitorio
  ('00000004-0000-0000-0000-000000000060','https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80',0),
  ('00000004-0000-0000-0000-000000000060','https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&q=80',1),
  -- Biblioteca
  ('00000004-0000-0000-0000-000000000061','https://images.unsplash.com/photo-1568667256549-094345857637?w=800&q=80',0),

  -- Caminadora
  ('00000004-0000-0000-0000-000000000062','https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',0),
  ('00000004-0000-0000-0000-000000000062','https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800&q=80',1),
  -- Kayak
  ('00000004-0000-0000-0000-000000000063','https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',0),
  -- Guantes boxeo
  ('00000004-0000-0000-0000-000000000064','https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&q=80',0),
  -- Patines
  ('00000004-0000-0000-0000-000000000065','https://images.unsplash.com/photo-1566024287286-457247b70310?w=800&q=80',0),
  -- Pelota básquet
  ('00000004-0000-0000-0000-000000000066','https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80',0),

  -- Hidrolavadora Karcher
  ('00000004-0000-0000-0000-000000000067','https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',0),
  ('00000004-0000-0000-0000-000000000067','https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80',1),
  -- Soldadora
  ('00000004-0000-0000-0000-000000000068','https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=800&q=80',0),
  -- Sierra circular
  ('00000004-0000-0000-0000-000000000069','https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80',0),
  -- Lijadora
  ('00000004-0000-0000-0000-000000000070','https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80',0),
  -- Nivel laser
  ('00000004-0000-0000-0000-000000000071','https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80',0),

  -- Cuna corral
  ('00000004-0000-0000-0000-000000000072','https://images.unsplash.com/photo-1519689373023-dd07c7988603?w=800&q=80',0),
  ('00000004-0000-0000-0000-000000000072','https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&q=80',1),
  -- Hamaca Fisher Price
  ('00000004-0000-0000-0000-000000000073','https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&q=80',0),
  -- Monitor bebé
  ('00000004-0000-0000-0000-000000000074','https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80',0),
  -- Bañera bebé
  ('00000004-0000-0000-0000-000000000075','https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',0),

  -- Guitarra Fender
  ('00000004-0000-0000-0000-000000000076','https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&q=80',0),
  ('00000004-0000-0000-0000-000000000076','https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=800&q=80',1),
  -- Piano Yamaha
  ('00000004-0000-0000-0000-000000000077','https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800&q=80',0),
  ('00000004-0000-0000-0000-000000000077','https://images.unsplash.com/photo-1552422535-c45813c61732?w=800&q=80',1),
  -- Lote libros
  ('00000004-0000-0000-0000-000000000078','https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80',0),
  ('00000004-0000-0000-0000-000000000078','https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80',1),
  -- Bajo eléctrico
  ('00000004-0000-0000-0000-000000000079','https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&q=80',0),

  -- Chanel N°5
  ('00000004-0000-0000-0000-000000000080','https://images.unsplash.com/photo-1541643600914-78b084683702?w=800&q=80',0),
  ('00000004-0000-0000-0000-000000000080','https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80',1),
  -- Set MAC
  ('00000004-0000-0000-0000-000000000081','https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80',0),
  -- Dyson Supersonic
  ('00000004-0000-0000-0000-000000000082','https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80',0),
  ('00000004-0000-0000-0000-000000000082','https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80',1),
  -- Bici spinning
  ('00000004-0000-0000-0000-000000000083','https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?w=800&q=80',0),

  -- LEGO Bugatti
  ('00000004-0000-0000-0000-000000000084','https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&q=80',0),
  ('00000004-0000-0000-0000-000000000084','https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=800&q=80',1),
  -- Catán
  ('00000004-0000-0000-0000-000000000085','https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=800&q=80',0),
  -- Auto RC
  ('00000004-0000-0000-0000-000000000086','https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',0),

  -- Acuario
  ('00000004-0000-0000-0000-000000000087','https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=800&q=80',0),
  ('00000004-0000-0000-0000-000000000087','https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=800&q=80',1),
  -- Jaula loro
  ('00000004-0000-0000-0000-000000000088','https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&q=80',0),
  -- Comida gato
  ('00000004-0000-0000-0000-000000000089','https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80',0),

  -- Plomería (servicio - sin imagen real)
  ('00000004-0000-0000-0000-000000000090','https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',0),
  -- Pintura
  ('00000004-0000-0000-0000-000000000091','https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&q=80',0),
  -- Clases inglés
  ('00000004-0000-0000-0000-000000000092','https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',0),
  -- Diseño gráfico
  ('00000004-0000-0000-0000-000000000093','https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',0),

  -- Cámara Sony
  ('00000004-0000-0000-0000-000000000094','https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80',0),
  ('00000004-0000-0000-0000-000000000094','https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80',1),
  -- Monedas
  ('00000004-0000-0000-0000-000000000095','https://images.unsplash.com/photo-1566041510639-8d95a2490bfb?w=800&q=80',0),
  -- Drone DJI
  ('00000004-0000-0000-0000-000000000096','https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=800&q=80',0),
  ('00000004-0000-0000-0000-000000000096','https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',1),
  -- Telescopio
  ('00000004-0000-0000-0000-000000000097','https://images.unsplash.com/photo-1614642264762-d0a3b8bf3700?w=800&q=80',0);
