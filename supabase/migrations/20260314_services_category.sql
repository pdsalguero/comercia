-- Servicios category
INSERT INTO categories (id, name, slug)
VALUES (26, 'Servicios', 'services')
ON CONFLICT (id) DO NOTHING;
