// src/lib/claude/analyze-photo.ts

import { getYearFromPatente } from "@/lib/utils/patente-year";

const VEHICLE_BRANDS = [
  "toyota",
  "volkswagen",
  "ford",
  "chevrolet",
  "renault",
  "peugeot",
  "fiat",
  "honda",
  "hyundai",
  "kia",
  "nissan",
  "citroen",
  "bmw",
  "mercedes-benz",
  "audi",
  "suzuki",
  "jeep",
  "dodge",
  "chery",
  "geely",
  "byd",
  "cfmoto",
  "royal_enfield",
  "bajaj",
  "ktm",
  "husqvarna",
  "benelli",
  "ducati",
  "harley_davidson",
  "triumph",
  "kawasaki",
  "yamaha",
  "beta",
  "corven",
  "motomel",
  "zanella",
  "gilera",
  "guerrero",
  "can_am",
  "polaris",
  "otra",
];
const VEHICLE_SUBCATS = [
  "auto",
  "camioneta",
  "moto",
  "cuatriciclo",
  "utv",
  "camion",
  "nautica",
  "plan-ahorro",
  "otro",
];
const MOTO_SUBTIPOS = [
  "clasicas", "chopper", "crucero", "custom", "deportivas",
  "doble_proposito", "electrico", "enduro_cross", "mini_motos",
  "motocarros", "naked", "on_off", "scooters", "calle", "touring",
  "triciclos", "otro",
];
const FUELS = ["nafta", "diesel", "gnc", "glp", "electrico", "hibrido", "otro"];
const TRANSMISSIONS = ["manual", "automatica", "cvt"];

const SYSTEM_PROMPT = `Eres un experto tasador y perito en vehículos de Argentina, especializado en el mercado de San Juan.
Tu rol es analizar fotos de vehículos con la precisión de un mecánico que conoce cada modelo de memoria.
Devolvés SOLO JSON válido. Cero texto adicional, cero markdown, cero explicaciones fuera del JSON.

══════════════════════════════════════════════
REGLAS DE ORO — NUNCA LAS ROMPAS
══════════════════════════════════════════════
① IDENTIFICACIÓN: Leé PRIMERO todo el texto visible en el vehículo (tanque, carenado, tapa lateral, maletero, parrilla). Ese texto ES la verdad absoluta. Un "CFMOTO" en el carenado significa cfmoto, NO bmw ni ninguna otra marca. Un "TÉNÉRÉ" en el tanque vale más que cualquier inferencia visual. NUNCA inferís la marca por la silueta si hay texto legible.
② AÑO: Siempre year=0. El año lo calcula el sistema desde la patente. NUNCA pongas el año del modelo.
③ PATENTE: Transcribí letra por letra con certeza absoluta. Ante CUALQUIER duda → no incluyas el campo.
④ CONFIANZA: Si no podés identificar la marca/modelo con certeza, dejá el campo vacío. No inventes.`;

const USER_PROMPT = `Analizá la imagen y devolvé exactamente este JSON (sin campos extra, sin texto fuera del JSON):

{
  "title": "título del aviso — máx 80 chars, NO incluyas el año",
  "description": "descripción vendedora de 2-3 oraciones",
  "category_id": número,
  "condition": "new|like_new|very_good|good|fair|for_parts",
  "price_suggested": 0,
  "attributes": { ...campos según categoría... }
}

CATEGORÍAS: 1=Electrónica 2=Vehículos 3=Inmuebles 4=Ropa 5=Hogar 6=Deportes 7=Herramientas 8=Libros 9=Mascotas 10=Otros 21=Celulares 22=Electrodomésticos 23=Bebés/Niños 24=Belleza/Salud 26=Servicios

══════════════════════════════════════════════════════════════
CATEGORÍA 2 — VEHÍCULOS  (el más importante, leé todo)
══════════════════════════════════════════════════════════════
{
  "sub_category": "auto|camioneta|moto|cuatriciclo|utv|camion|nautica|otro",
  "brand": "marca en minúsculas con guión_bajo (ej: yamaha, harley_davidson, can_am)",
  "model": "modelo EXACTO como aparece en la DB (ver tabla abajo)",
  "moto_subtipo": "SOLO motos (no cuatriciclos/utv): clasicas|chopper|crucero|custom|deportivas|doble_proposito|electrico|enduro_cross|mini_motos|motocarros|naked|on_off|scooters|calle|touring|triciclos|otro",
  "cc": "SOLO motos/cuatriciclos/utv: cilindrada como número entero (ej: 150, 390, 1200). Inferila del modelo si no está visible.",
  "version": "versión si es legible",
  "patente": "solo si legible al 100% — EXACTA letra por letra",
  "year": 0,
  "km": número estimado o null,
  "fuel": "nafta|diesel|gnc|glp|electrico|hibrido|otro",
  "transmission": "manual|automatica|cvt",
  "color": "color en español",
  "engine": "solo autos/camiones: ej: 1.6, 2.0 TDI",
  "first_owner": true|false,
  "seller_type": "particular|concesionaria"
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PASO 1: CLASIFICAR EL VEHÍCULO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• 2 ruedas → moto
• 4 ruedas + estructura tubular/jaula + volante → utv (Arenero)
• 4 ruedas + manubrio + sin cabina → cuatriciclo
• Cabina cerrada + 4 ruedas convencional → auto o camioneta
• Carrocería alta tipo pick-up o SUV → camioneta

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PASO 2: IDENTIFICAR MARCA — por texto e n el vehículo, luego logo
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TEXTO EN EL VEHÍCULO (máxima confianza):
  "YAMAHA" → yamaha | "KAWASAKI" → kawasaki | "HONDA" → honda
  "SUZUKI" → suzuki | "DUCATI" → ducati | "BMW" → bmw
  "KTM" → ktm | "TRIUMPH" → triumph | "HARLEY-DAVIDSON"/"HARLEY" → harley_davidson
  "ROYAL ENFIELD" → royal_enfield | "BAJAJ" → bajaj | "BETA" → beta
  "HUSQVARNA" → husqvarna | "BENELLI" → benelli | "APRILIA" → aprilia
  "CORVEN" → corven | "MOTOMEL" → motomel | "ZANELLA" → zanella
  "GILERA" → gilera | "GUERRERO" → guerrero | "KYMCO" → kymco
  "KEEWAY" → keeway | "HAOJUE" → haojue | "TVS" → tvs
  "CAN-AM"/"CAN AM" → can_am | "POLARIS" → polaris | "CFMOTO" → cfmoto
  "TOYOTA" → toyota | "VOLKSWAGEN"/"VW" → volkswagen | "FORD" → ford
  "CHEVROLET"/"CHEVY" → chevrolet | "RENAULT" → renault | "PEUGEOT" → peugeot
  "FIAT" → fiat | "HYUNDAI" → hyundai | "KIA" → kia | "NISSAN" → nissan
  "CITROEN"/"CITROËN" → citroen | "MERCEDES-BENZ"/"MERCEDES" → mercedes-benz
  "AUDI" → audi | "JEEP" → jeep | "DODGE" → dodge | "BYD" → byd
  "CHERY" → chery | "GEELY" → geely

LOGOS (cuando no hay texto legible):
  Diapasón/tuning fork = yamaha
  K estilizada con alas = kawasaki
  Ala estilizada (Honda) = honda
  Hélice azul y blanca = bmw
  Escudo naranja con "KTM" = ktm
  Águila + barra naranja = harley_davidson
  Escudo rojo con "D" gótica = ducati
  Corona roja = royal_enfield
  Hexágono dorado = triumph
  Letras itálicas "Aprilia" = aprilia
  Escudo con "B" = benelli

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PASO 3: IDENTIFICAR MODELO — texto en el vehículo es la VERDAD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▸ YAMAHA MOTOS
  "TÉNÉRÉ"/"TENERE" grande → SUPER TENERE 1200
  "T7"/"TÉNÉRÉ 700" → TENERE 700
  "MT-09"/"MT09" → MT 09
  "MT-07"/"MT07" → MT 07
  "MT-03"/"MT03" → MT 03
  "MT-15"/"MT15" → MT 15
  "MT-25"/"MT25" → MT 25
  "R1"/"YZF-R1" → R1
  "R3"/"YZF-R3" → R3
  "R6"/"YZF-R6" → R6
  "FZ 25"/"FZ25" → FZ 25
  "FZ 16"/"FZ16" → FZ 16
  "XTZ 125" → XTZ 125
  "XTZ 250" → XT 250
  "T-MAX"/"TMAX" → T-MAX 560
  "N-MAX"/"NMAX" → N-MAX 150
  "BWS"/"BW'S" → BWS 125
  "CRYPTON" → CRYPTON 110
  "TRACER" → MT 09 TRACER
  "XSR 700" → XSR 700 | "XSR 900" → XSR 900
  "VMAX" → VMAX 1700
  "RAPTOR" (moto) → RAPTOR 700

▸ KAWASAKI MOTOS
  "NINJA 400" → Ninja 400 | "NINJA 300" → Ninja 300 | "NINJA 650" → Ninja 650
  "NINJA ZX-10R" → Ninja ZX-10R | "NINJA ZX-6R" → Ninja ZX-6R | "NINJA 1000" → Ninja 1000
  "Z400" → Z 400 | "Z650" → Z 650 | "Z900" → Z 900 | "Z1000" → Z 1000
  "VERSYS 650" → Versys 650 | "VERSYS 1000" → Versys 1000
  "VULCAN" → Vulcan S | "W800" → W 800
  "KLR 650" → KLR 650

▸ HONDA MOTOS
  "AFRICA TWIN"/"AFRICATWIN" → CRF 1000 L AFRICA TWIN
  "CBR 1000"/"CBR1000" → CBR 1000 RR | "CBR 600" → CBR 600 RR
  "CBR 500"/"CBR500" → CBR 500 R | "CBR 300" → CBR 300 R
  "CB 500 F"/"CB500F" → CB 500 F | "CB 500 X"/"CB500X" → CB 500 X
  "CB 650 R"/"CB650R" → CB 650 R | "CB 1000" → CB1000R
  "HORNET" → CB 600 HORNET
  "CB TWISTER"/"TWISTER 250" → CB TWISTER 250
  "CB 300 TWISTER" → CB 300 TWISTER
  "CG 150" → CG 150 | "CG 160" → CG 160
  "PCX 150" → PCX 150 | "PCX 160" → PCX 160
  "XRE 300" → XRE 300 | "XRE 190" → XRE 190
  "NXR BROS"/"BROS" → NXR 150 BROS
  "CRF 300" → CRF 300 L | "CRF 250" → CRF 250 L
  "INVICTA 150" → INVICTA 150

▸ CFMOTO MOTOS — ⚠️ NO CONFUNDIR CON BMW. Si dice "CFMOTO" en cualquier parte → brand=cfmoto, NO bmw.
  "800 MT"/"800MT" → 800 MT  (touring adventure, 800cc)
  "700 CL-X"/"CLX700" → 700 CL-X
  "650 MT"/"650MT" → 650 MT
  "650 NK"/"650NK" → 650 NK
  "450 MT"/"450MT" → 450 MT
  "450 NK"/"450NK" → 450 NK
  "300 NK"/"300NK" → 300 NK
  "250 NK"/"250NK" → 250 NK
  "250 SR"/"250SR" → 250 SR
  CILINDRADA: 800 MT→800 | 700 CL-X→700 | 650 MT/650 NK→650 | 450 MT/450 NK→450 | 300 NK→300 | 250→250

▸ BMW MOTOS
  "R 1250 GS"/"R1250GS" → R 1250 GS
  "R 1200 GS"/"R1200GS" → R1200GS
  "R 1200 GS ADVENTURE"/"R1200GS ADVENTURE" → R1200GS ADVENTURE
  "R NINE T"/"RNINET" → R NINE T
  "S1000RR"/"S 1000 RR" → S1000RR
  "S1000R"/"S 1000 R" → S1000R
  "F 800 GS"/"F800GS" → F 800 GS
  "F 850 GS"/"F850GS" → F 850 GS
  "G 310 R"/"G310R" → G310R
  "K 1600"/"K1600" → K1600GT
  "C 400"/"C400" → C400 X

▸ KTM MOTOS
  "DUKE 390" → Duke 390 | "DUKE 250" → Duke 250 | "DUKE 200" → Duke 200
  "DUKE 790" → 790 Duke | "DUKE 890" → 890 Duke | "DUKE 1290" → 1290 Super Duke R
  "ADVENTURE 390" → 390 Adventure | "ADVENTURE 790" → 790 Adventure
  "ADVENTURE 1290" → 1290 Super Adventure
  "EXC 250" → EXC 250 | "EXC 300" → EXC 300 | "EXC 450" → EXC 450
  "RC 390" → RC 390

▸ DUCATI MOTOS
  "MONSTER" + número → Monster [número]
  "PANIGALE" + número → Panigale [número]
  "MULTISTRADA" → Multistrada [número]
  "SCRAMBLER" → Scrambler [número]
  "STREETFIGHTER" → Streetfighter [número]

▸ HARLEY-DAVIDSON
  "SPORTSTER" → Sportster [número]
  "FAT BOY"/"FATBOY" → Fat Boy
  "ROAD KING" → Road King
  "STREET GLIDE" → Street Glide
  "IRON 883" → Iron 883
  "FORTY EIGHT"/"48" → Sportster XL 1200X
  "SOFTAIL" → Softail

▸ TRIUMPH
  "TIGER 800" → Tiger 800 | "TIGER 900" → Tiger 900 | "TIGER 1200" → Tiger 1200
  "BONNEVILLE" → Bonneville T120 | "SCRAMBLER" → Scrambler [número]
  "STREET TRIPLE" → Street Triple [número]
  "SPEED TRIPLE" → Speed Triple [número]
  "ROCKET 3" → Rocket 3 R | "THRUXTON" → Thruxton 1200

▸ BAJAJ MOTOS
  "PULSAR 150" → Pulsar 150 | "PULSAR 200 NS" → Pulsar 200 NS
  "PULSAR 200 RS" → Pulsar 200 RS | "PULSAR 220" → Pulsar 220
  "PULSAR 250" → Pulsar 250 | "PULSAR 400" → Pulsar 400
  "DOMINAR 400" → Dominar 400 | "AVENGER" → Avenger [número]
  "ROUSER" = Pulsar en Argentina

▸ BETA MOTOS
  "ZONKER" → Zonker | "RR" + número → RR [número]
  "MOTARD" → Motard | "TEMPO" → Tempo

▸ MOTOS NACIONALES (Argentina)
  CORVEN: "TRIAX" → Triax | "HUNTER" → Hunter [número] | "ENERGY" → Energy [número]
  MOTOMEL: "SKUA" → Skua [número] | "BLITZ" → Blitz [número] | "SIRIUS" → Sirius [número]
  ZANELLA: "PATAGONIAN EAGLE" → Patagonian Eagle | "ZB" → ZB [número] | "HOT ROD" → Hot Rod
  GILERA: "SMASH" → Smash 110 | "VC 200" → VC 200 | "SAHARA" → Sahara 250
  GUERRERO: "TRIP" → Trip [número] | "AXIS" → Axis [número]

▸ CILINDRADA por modelo (usar cuando cc no es visible):
  YAMAHA:  FZ 16→160 | FZ 25/MT 25/R3/XTZ250→250 | XTZ 125/BWS 125/N-MAX 150/CRYPTON 110→125/150/150/110
           MT 03/R3→321 | MT 07→689 | MT 09/XSR 900→890 | MT 15→155
           TENERE 700/XSR 700/RAPTOR 700→700 | SUPER TENERE 1200/VMAX 1700→1200/1700
           T-MAX 560→560 | R1→998 | R6→600
  HONDA:   CG 150→150 | CG 160→160 | CB TWISTER 250/CB 300 TWISTER→250/300
           PCX 150→150 | PCX 160→160 | XRE 190→190 | XRE 300→300
           NXR 150 BROS→150 | INVICTA 150→150 | CRF 250 L→250 | CRF 300 L→300
           CB 500 F/CB 500 X→500 | CB 600 HORNET→600 | CB 650 R→650 | CB1000R/CBR 1000 RR→1000
           CBR 300 R→300 | CBR 500 R→500 | CBR 600 RR→600 | Africa Twin→1000
  KAWASAKI: Ninja 300→300 | Ninja 400→400 | Ninja 650→650 | Ninja 1000/ZX-10R→1000 | ZX-6R→636
            Z 400→400 | Z 650→650 | Z 900→900 | Z 1000→1000 | KLR 650→650
            Versys 650→650 | Versys 1000→1000 | W 800→800 | Vulcan S→650
  KTM:     Duke 200→200 | Duke 250→250 | Duke 390→390 | 790 Duke→790 | 890 Duke→890
           1290 Super Duke→1290 | 390 Adventure→390 | 790 Adventure→790
           EXC 250→250 | EXC 300→300 | EXC 450→450 | RC 390→390
  BMW:     G310R→313 | F 800 GS→800 | F 850 GS→850 | R1200GS/R1200GS ADVENTURE→1200
           R 1250 GS→1250 | R NINE T→1170 | S1000RR/S1000R→1000 | K1600GT→1600 | C400 X→400
  BAJAJ:   Pulsar 150→150 | Pulsar 200→200 | Pulsar 220→220 | Pulsar 250→250
           Pulsar 400→400 | Dominar 400→400
  TRIUMPH: Tiger 800→800 | Tiger 900→900 | Tiger 1200→1200 | Street Triple 765→765
           Speed Triple 1200→1200 | Bonneville T120→1200 | Thruxton 1200→1200 | Rocket 3→2458
  GILERA:  Smash 110→110 | VC 200→200 | Sahara 250→250
  REGLA: Si el nombre del modelo termina en un número (Pulsar 150, Duke 390, CG 160) ese número ES la cilindrada exacta.

▸ TIPO DE MOTO por silueta (usar solo si no hay texto):
  Carenado completo + posición agresiva + escape lateral → deportivas
  Sin carenado + posición erguida + manubrio ancho → naked
  Parabrisas alto + maletas laterales + sillin doble → touring
  Frame step-through + sin engranajes visibles → scooters
  Ruedas de enduro grandes + suspensión larga → enduro_cross
  Posición baja + manubrio muy alto/hacia atrás → chopper/crucero
  Chasis alto + guardabarros largo + doble propósito → on_off/doble_proposito

▸ AUTOS — identificar por texto en carrocería, plaquetas, insignias
  TOYOTA: HILUX, COROLLA, YARIS, SW4, RAV4, CAMRY, ETIOS, RUSH, LAND CRUISER, GR86
  VW: GOL, POLO, VENTO, AMAROK, TIGUAN, UP!, VOYAGE, SURAN, GOLF, T-CROSS, TAOS, PASSAT
  FORD: RANGER, FOCUS, FIESTA, ECOSPORT, ESCAPE, EXPLORER, TERRITORY, F-150, BRONCO, MONDEO
  CHEVROLET: CRUZE, ONIX, TRACKER, S10, SPIN, EQUINOX, CAPTIVA, TRAILBLAZER, BLAZER, MONTANA
  RENAULT: KWID, SANDERO, LOGAN, DUSTER, KOLEOS, KANGOO, CAPTUR, OROCH, STEPWAY, FLUENCE
  PEUGEOT: 208, 308, 408, 2008, 3008, 5008, PARTNER, BOXER
  FIAT: CRONOS, PULSE, FASTBACK, ARGO, MOBI, STRADA, TORO, PUNTO, PALIO, 500, DOBLÒ
  HONDA: CIVIC, FIT, HR-V, CR-V, WR-V, CITY, ACCORD
  HYUNDAI: TUCSON, CRETA, i30, ACCENT, ELANTRA, SANTA FE, KONA
  KIA: PICANTO, RIO, CERATO, SPORTAGE, SORENTO, SELTOS, STONIC

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PASO 4: PATENTE Y AÑO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Buscá la patente en toda la imagen (frente, atrás, lateral)
• Formato AR: 3 letras + 3 números (vieja) o 2 letras + 3 números + 2 letras (nueva)
• Transcribí EXACTAMENTE lo que ves. Si hay duda en UNA sola letra → no incluyas "patente"
• year siempre = 0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OTRAS CATEGORÍAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Electrónica(1): sub_category="celular|computadora|tablet|tv|audio|camara|consola|otro", brand, model, storage, ram, color, includes_box, includes_charger
Celulares(21): sub_category="smartphone|basico|tablet|smartwatch|accesorio|otro", brand, model, storage="32gb|64gb|128gb|256gb|512gb|1tb|otro", color, includes_box, includes_charger, unlocked
Electrodomésticos(22): sub_category="heladera|lavarropas|cocina|microondas|aire|aspiradora|pequeno|otro", brand, model, color
Inmuebles(3): sub_category="casa|departamento|terreno|finca|local|galpon|cochera|otro", operation="venta|alquiler", bedrooms, bathrooms, m2_covered, garage, pool, currency="ARS|USD"
Bebés/Niños(23): sub_category="ropa-bebe|ropa-nino|coche|cuna|juguete|lactancia|educativo|otro", age_range, brand, gender
Ropa(4): sub_category, gender, size, brand, color
Hogar(5): sub_category, brand, color, material
Deportes(6): sub_category, brand, size, color
Herramientas(7): sub_category, brand, voltage
Mascotas(9): sub_category, breed, sex, vaccinated, is_adoption
Belleza/Salud(24): sub_category="cuidado-personal|maquillaje|perfume|capilar|equipo-medico|suplemento|optica|otro", brand, volume
Servicios(26): sub_category (ver tabla), sub_type (ver tabla), modality="online|domicilio|local|mixto", brand="nombre empresa o profesional si es visible"
  sub_category → sub_type válidos (USÁ EXACTAMENTE estos valores):
  capacitacion      → apoyo-escolar | idiomas | computacion-curso | musica-danza | deportes-clase | fotografia-cine | cocina-curso | manejo | belleza-curso | otras-clases
  cuidado-personal  → peluqueria-barberia | estetica-spa | masajes | depilacion | podologia | gimnasios-fitness | yoga-bienestar
  eventos-fiestas   → foto-video-evento | musica-dj | catering | animacion-inflables | salones-quintas | reposteria-dulce | decoracion-floral | cotillon-souvenirs | organizacion
  gastronomia       → viandas-delivery | comida-casera | reposteria-pastel | artesanal
  automotriz        → mecanica-general | chapa-pintura | gomeria | lubricentro | lavado-detailing | auxilio-grua | reparacion-motos
  hogar-obras       → plomeria | electricidad | albanileria | pintura-empapelado | carpinteria-muebles | limpieza | jardineria-paisaj | climatizacion | cerrajeria | gas-calefaccion | herreria-rejas | pisos-ceramicos | seguridad-alarmas | impermeabilizacion
  profesionales     → legal-notarial | contabilidad | arquitectura-ing | diseno-creativo | dev-web-sistemas | salud-medicina | consultoria | tramites-gestiones | marketing-publicidad | otros-profesional
  tecnico           → computacion-redes | celulares-tablets | electrodomesticos | electronica | aire-acondicionado | audio-video-tv | equipos-fitness | otros-tecnicos
  transporte        → fletes-mudanzas | mensajeria-envios | alquiler-vehiculos | remis-traslados
  otros-servicios   → cuidado-personas | paseo-mascotas | servicio-domestico | otro`;


export async function analyzePhotoWithClaude(
  images: Array<{ base64: string; mimeType: string }>,
) {
  const imageBlocks = images.map((img) => ({
    type: "image",
    source: {
      type: "base64",
      media_type: img.mimeType,
      data: img.base64,
    },
  }));

  const userPrompt = images.length > 1
    ? `Se te envían ${images.length} fotos del mismo artículo (pueden ser hasta 5). Analizalas todas — cada foto puede revelar datos distintos: patente, versión, estado, accesorios, etc.\n\n${USER_PROMPT}`
    : USER_PROMPT;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            ...imageBlocks,
            { type: "text", text: userPrompt },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(
      `Claude API error: ${err.error?.message ?? response.statusText}`,
    );
  }

  const data = await response.json();
  const raw = data.content?.[0]?.text ?? "";
  const clean = raw
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  let parsed: any;
  try {
    parsed = JSON.parse(clean);
  } catch {
    throw new Error(`No se pudo parsear respuesta de IA: ${raw.slice(0, 200)}`);
  }

  // ── Post-process vehicle attributes ──────────────────────────
  if (parsed.category_id === 2 && parsed.attributes) {
    const attrs = parsed.attributes;

    // 1. Normalize brand
    if (attrs.brand) {
      const b = attrs.brand
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
      const match = VEHICLE_BRANDS.find(
        (vb) => b.includes(vb) || vb.includes(b),
      );
      attrs.brand = match ?? b;
    }

    // 2. Normalize sub_category
    if (attrs.sub_category) {
      const sc = attrs.sub_category.toLowerCase();
      if (!VEHICLE_SUBCATS.includes(sc)) {
        if (sc.includes("cuatri") || sc.includes("quad") || sc.includes("atv"))
          attrs.sub_category = "cuatriciclo";
        else if (sc.includes("utv") || sc.includes("buggy") || sc.includes("arenero"))
          attrs.sub_category = "utv";
        else if (sc.includes("moto"))
          attrs.sub_category = "moto";
        else if (sc.includes("camion") || sc.includes("truck"))
          attrs.sub_category = "camion";
        else if (
          sc.includes("suv") ||
          sc.includes("camioneta") ||
          sc.includes("pickup")
        )
          attrs.sub_category = "camioneta";
        else attrs.sub_category = "auto";
      }
    }

    // 3. Normalize fuel
    if (attrs.fuel) {
      const f = attrs.fuel.toLowerCase();
      if (!FUELS.includes(f)) {
        if (f.includes("gnc") || f.includes("gas nat")) attrs.fuel = "gnc";
        else if (f.includes("elect")) attrs.fuel = "electrico";
        else if (f.includes("hibr") || f.includes("hybrid"))
          attrs.fuel = "hibrido";
        else if (f.includes("dies") || f.includes("gasoil"))
          attrs.fuel = "diesel";
        else attrs.fuel = "nafta";
      }
    }

    // 4a. Normalize moto_subtipo
    if (attrs.moto_subtipo) {
      const st = attrs.moto_subtipo.toLowerCase().replace(/[\s-]/g, "_");
      if (MOTO_SUBTIPOS.includes(st)) {
        attrs.moto_subtipo = st;
      } else {
        // fuzzy fallback
        const match = MOTO_SUBTIPOS.find((s) => st.includes(s) || s.includes(st));
        attrs.moto_subtipo = match ?? "otro";
      }
    }

    // 4b. CC → cilindrada (solo motos/cuatriciclos/utv)
    if (["moto", "cuatriciclo", "utv"].includes(attrs.sub_category)) {
      let cc: number | null = null;

      // Fuente 1: campo cc devuelto por el AI
      if (attrs.cc) {
        const n = parseInt(String(attrs.cc).replace(/\D/g, ""), 10);
        if (n > 0) cc = n;
      }

      // Fuente 2: extraer número de attrs.engine ("1200cc", "390 cc")
      if (!cc && attrs.engine) {
        const m = String(attrs.engine).match(/(\d+)\s*cc/i);
        if (m) cc = parseInt(m[1], 10);
      }

      // Fuente 3: inferir del nombre del modelo (último número significativo)
      if (!cc && attrs.model) {
        const modelNums = String(attrs.model).match(/\d+/g);
        if (modelNums) {
          // Tomar el número más grande que sea plausible como cc (50–2500)
          const candidates = modelNums
            .map(Number)
            .filter((n) => n >= 50 && n <= 2500);
          if (candidates.length) cc = Math.max(...candidates);
        }
      }

      if (cc) attrs.cilindrada = cc;
      delete attrs.cc; // limpiar campo temporal
    }

    // 4. Normalize transmission
    if (attrs.transmission) {
      const t = attrs.transmission.toLowerCase();
      if (!TRANSMISSIONS.includes(t)) {
        if (t.includes("auto") || t.includes("aut"))
          attrs.transmission = "automatica";
        else if (t.includes("cvt")) attrs.transmission = "cvt";
        else attrs.transmission = "manual";
      }
    }

    // 5. ★ PATENTE → AÑO — siempre sobrescribe el año de la IA ★
    if (
      attrs.patente &&
      typeof attrs.patente === "string" &&
      attrs.patente.trim().length >= 5
    ) {
      const patenteInfo = getYearFromPatente(attrs.patente.trim());

      if (patenteInfo.year && patenteInfo.confidence !== "low") {
        // La patente siempre gana sobre la estimación de la IA
        attrs.year = patenteInfo.year;
        attrs._patente_info = {
          patente: attrs.patente,
          format: patenteInfo.format,
          period: patenteInfo.period,
          yearRange: patenteInfo.yearTo
            ? `${patenteInfo.year}-${patenteInfo.yearTo}`
            : String(patenteInfo.year),
          confidence: patenteInfo.confidence,
        };
        if (patenteInfo.yearTo) {
          attrs._year_range = {
            from: patenteInfo.year,
            to: patenteInfo.yearTo,
          };
        }
      } else {
        // Patente leída pero no reconocida → limpiar año de la IA
        attrs.year = null;
        attrs._patente_info = {
          patente: attrs.patente,
          confidence: "low",
          note: "Patente no reconocida",
        };
      }
    } else {
      // Sin patente → no hay forma de conocer el año con certeza, limpiar ambos
      attrs.year = null;
      attrs.patente = null;
    }

    // 6. Asegurar tipos correctos
    if (attrs.year && typeof attrs.year === "string") {
      attrs.year = parseInt(attrs.year, 10) || null;
    }
    if (attrs.km && typeof attrs.km === "string") {
      attrs.km = parseInt(String(attrs.km).replace(/\D/g, ""), 10) || null;
    }

    // 7. Corregir año en el título si lo tenemos
    if (attrs.year && parsed.title) {
      parsed.title = parsed.title.replace(
        /\b(19|20)\d{2}\b/,
        String(attrs.year),
      );
    }

    parsed.attributes = attrs;
  }

  // ── Post-process services attributes ─────────────────────────
  if (parsed.category_id === 26 && parsed.attributes) {
    const attrs = parsed.attributes;
    const VALID_SERVICE_CATS = [
      "capacitacion", "cuidado-personal", "eventos-fiestas", "gastronomia",
      "automotriz", "hogar-obras", "profesionales", "tecnico", "transporte", "otros-servicios",
    ];
    const SERVICE_SUBTYPE_MAP: Record<string, string[]> = {
      capacitacion:       ["apoyo-escolar","idiomas","computacion-curso","musica-danza","deportes-clase","fotografia-cine","cocina-curso","manejo","belleza-curso","otras-clases"],
      "cuidado-personal": ["peluqueria-barberia","estetica-spa","masajes","depilacion","podologia","gimnasios-fitness","yoga-bienestar"],
      "eventos-fiestas":  ["foto-video-evento","musica-dj","catering","animacion-inflables","salones-quintas","reposteria-dulce","decoracion-floral","cotillon-souvenirs","organizacion"],
      gastronomia:        ["viandas-delivery","comida-casera","reposteria-pastel","artesanal"],
      automotriz:         ["mecanica-general","chapa-pintura","gomeria","lubricentro","lavado-detailing","auxilio-grua","reparacion-motos"],
      "hogar-obras":      ["plomeria","electricidad","albanileria","pintura-empapelado","carpinteria-muebles","limpieza","jardineria-paisaj","climatizacion","cerrajeria","gas-calefaccion","herreria-rejas","pisos-ceramicos","seguridad-alarmas","impermeabilizacion"],
      profesionales:      ["legal-notarial","contabilidad","arquitectura-ing","diseno-creativo","dev-web-sistemas","salud-medicina","consultoria","tramites-gestiones","marketing-publicidad","otros-profesional"],
      tecnico:            ["computacion-redes","celulares-tablets","electrodomesticos","electronica","aire-acondicionado","audio-video-tv","equipos-fitness","otros-tecnicos"],
      transporte:         ["fletes-mudanzas","mensajeria-envios","alquiler-vehiculos","remis-traslados"],
      "otros-servicios":  ["cuidado-personas","paseo-mascotas","servicio-domestico","otro"],
    };
    const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
    if (attrs.sub_category) {
      const sc = normalize(attrs.sub_category);
      const match = VALID_SERVICE_CATS.find((v) => sc === v || sc === normalize(v) || sc.includes(v.replace("-","")) || v.replace("-","").includes(sc));
      attrs.sub_category = match ?? "otros-servicios";
    }
    if (attrs.sub_type && attrs.sub_category) {
      const validSubTypes = SERVICE_SUBTYPE_MAP[attrs.sub_category] ?? [];
      const st = normalize(attrs.sub_type);
      const match = validSubTypes.find((v) => st === v || st === normalize(v) || st.includes(v.replace("-","")) || v.replace("-","").includes(st));
      attrs.sub_type = match ?? null;
    }
    if (attrs.modality) {
      const m = attrs.modality.toLowerCase();
      const validModalities = ["online", "domicilio", "local", "mixto"];
      if (!validModalities.includes(m)) attrs.modality = "local";
    }
    parsed.attributes = attrs;
  }

  return parsed;
}
