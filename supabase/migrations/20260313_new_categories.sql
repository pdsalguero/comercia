-- Add 4 new marketplace categories
-- Run this in the Supabase SQL Editor

INSERT INTO categories (id, name, slug) VALUES
  (11, 'Celulares', 'phones'),
  (12, 'Electrodomésticos', 'appliances'),
  (13, 'Bebés y Niños', 'babies'),
  (14, 'Belleza y Salud', 'beauty-health')
ON CONFLICT (id) DO NOTHING;
