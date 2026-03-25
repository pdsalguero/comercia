-- Normalize "mileage" → "km" in vehicle listings (old seeds used "mileage")
UPDATE listings
SET attributes = (attributes - 'mileage') || jsonb_build_object('km', (attributes->>'mileage')::int)
WHERE attributes ? 'mileage' AND NOT attributes ? 'km';

-- Normalize sub_category values to lowercase
UPDATE listings
SET attributes = attributes || jsonb_build_object('sub_category', lower(attributes->>'sub_category'))
WHERE attributes ? 'sub_category'
  AND attributes->>'sub_category' <> lower(attributes->>'sub_category');
