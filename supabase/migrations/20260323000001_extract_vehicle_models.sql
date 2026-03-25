-- Extract model from vehicle listing titles where attributes->model is missing
-- Applies only to category_id = 2 (Vehículos) with active status

-- Helper: run per model keyword to avoid touching listings that already have a model
DO $$
DECLARE
  v_models TEXT[][] := ARRAY[
    -- Toyota
    ARRAY['hilux',      'Hilux'],
    ARRAY['corolla',    'Corolla'],
    ARRAY['etios',      'Etios'],
    ARRAY['yaris',      'Yaris'],
    ARRAY['rav4',       'RAV4'],
    ARRAY['sw4',        'SW4'],
    ARRAY['fortuner',   'Fortuner'],
    ARRAY['prado',      'Prado'],
    -- Volkswagen
    ARRAY['gol ',       'Gol'],
    ARRAY['polo',       'Polo'],
    ARRAY['golf',       'Golf'],
    ARRAY['vento',      'Vento'],
    ARRAY['amarok',     'Amarok'],
    ARRAY['tiguan',     'Tiguan'],
    ARRAY['t-cross',    'T-Cross'],
    ARRAY['taos',       'Taos'],
    ARRAY['nivus',      'Nivus'],
    ARRAY['virtus',     'Virtus'],
    ARRAY['up!',        'Up!'],
    ARRAY[' up ',       'Up!'],
    -- Ford
    ARRAY['ranger',     'Ranger'],
    ARRAY['ecosport',   'EcoSport'],
    ARRAY['focus',      'Focus'],
    ARRAY['fiesta',     'Fiesta'],
    ARRAY['ka ',        'Ka'],
    ARRAY['maverick',   'Maverick'],
    ARRAY['territory',  'Territory'],
    ARRAY['bronco',     'Bronco'],
    -- Chevrolet
    ARRAY['onix',       'Onix'],
    ARRAY['cruze',      'Cruze'],
    ARRAY['tracker',    'Tracker'],
    ARRAY['s10',        'S10'],
    ARRAY['spin',       'Spin'],
    ARRAY['cobalt',     'Cobalt'],
    ARRAY['montana',    'Montana'],
    ARRAY['captiva',    'Captiva'],
    -- Renault
    ARRAY['sandero',    'Sandero'],
    ARRAY['logan',      'Logan'],
    ARRAY['duster',     'Duster'],
    ARRAY['kangoo',     'Kangoo'],
    ARRAY['kwid',       'Kwid'],
    ARRAY['captur',     'Captur'],
    ARRAY['oroch',      'Oroch'],
    ARRAY['stepway',    'Stepway'],
    -- Peugeot
    ARRAY[' 208 ',      '208'],
    ARRAY[' 308 ',      '308'],
    ARRAY[' 408 ',      '408'],
    ARRAY[' 3008 ',     '3008'],
    ARRAY[' 2008 ',     '2008'],
    ARRAY['partner',    'Partner'],
    -- Fiat
    ARRAY['cronos',     'Cronos'],
    ARRAY['argo',       'Argo'],
    ARRAY['mobi',       'Mobi'],
    ARRAY['toro',       'Toro'],
    ARRAY['strada',     'Strada'],
    ARRAY['palio',      'Palio'],
    ARRAY['siena',      'Siena'],
    ARRAY['uno ',       'Uno'],
    -- Honda
    ARRAY['civic',      'Civic'],
    ARRAY['city',       'City'],
    ARRAY['hr-v',       'HR-V'],
    ARRAY['cr-v',       'CR-V'],
    ARRAY['fit ',       'Fit'],
    -- Hyundai
    ARRAY['tucson',     'Tucson'],
    ARRAY['creta',      'Creta'],
    ARRAY['accent',     'Accent'],
    ARRAY['elantra',    'Elantra'],
    ARRAY['i30',        'i30'],
    -- Nissan
    ARRAY['frontier',   'Frontier'],
    ARRAY['kicks',      'Kicks'],
    ARRAY['versa',      'Versa'],
    ARRAY['march',      'March'],
    ARRAY['x-trail',    'X-Trail'],
    ARRAY['sentra',     'Sentra'],
    -- Jeep
    ARRAY['renegade',   'Renegade'],
    ARRAY['compass',    'Compass'],
    ARRAY['wrangler',   'Wrangler'],
    ARRAY['cherokee',   'Cherokee'],
    -- Motos comunes
    ARRAY['cg 150',     'CG 150'],
    ARRAY['cg150',      'CG 150'],
    ARRAY['fz 25',      'FZ 25'],
    ARRAY['fz25',       'FZ 25'],
    ARRAY['fz 16',      'FZ 16'],
    ARRAY['fz16',       'FZ 16'],
    ARRAY['mt-03',      'MT-03'],
    ARRAY['xtz 125',    'XTZ 125'],
    ARRAY['xtz125',     'XTZ 125'],
    ARRAY['xtz 150',    'XTZ 150'],
    ARRAY['pulsar 200', 'Pulsar 200 NS'],
    ARRAY['pulsar 180', 'Pulsar 180'],
    ARRAY['pulsar 160', 'Pulsar 160 NS'],
    ARRAY['pulsar 150', 'Pulsar 150'],
    ARRAY['ninja 400',  'Ninja 400'],
    ARRAY['ninja 300',  'Ninja 300'],
    ARRAY['z400',       'Z400'],
    ARRAY['duke 390',   'Duke 390'],
    ARRAY['duke 200',   'Duke 200'],
    ARRAY['ybr 125',    'YBR 125'],
    ARRAY['ybr125',     'YBR 125'],
    ARRAY['xre 300',    'XRE 300'],
    ARRAY['xre300',     'XRE 300']
  ];
  v_pair TEXT[];
BEGIN
  FOREACH v_pair SLICE 1 IN ARRAY v_models LOOP
    UPDATE listings
    SET attributes = attributes || jsonb_build_object('model', v_pair[2])
    WHERE category_id = 2
      AND lower(title) LIKE '%' || v_pair[1] || '%'
      AND (attributes IS NULL OR NOT attributes ? 'model');
  END LOOP;
END $$;
