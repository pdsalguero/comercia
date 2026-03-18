-- Juegos y Juguetes category
INSERT INTO categories (id, name, slug)
VALUES (25, 'Juegos y Juguetes', 'toys')
ON CONFLICT (id) DO NOTHING;
