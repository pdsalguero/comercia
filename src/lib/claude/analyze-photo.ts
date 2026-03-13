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
  "otra",
];
const VEHICLE_SUBCATS = [
  "auto",
  "camioneta",
  "moto",
  "camion",
  "nautica",
  "plan-ahorro",
  "otro",
];
const FUELS = ["nafta", "diesel", "gnc", "glp", "electrico", "hibrido", "otro"];
const TRANSMISSIONS = ["manual", "automatica", "cvt"];

const SYSTEM_PROMPT = `Eres un asistente experto en clasificados de Argentina (San Juan).
Analizás imágenes de vehículos y productos para generar avisos de venta.
Devolvés SOLO JSON válido, sin texto adicional ni markdown.

REGLA MÁS IMPORTANTE: Para vehículos, el AÑO lo determina ÚNICAMENTE la patente visible.
NO uses el año de lanzamiento del modelo en Argentina. NO supongas el año por el diseño.
Tu única responsabilidad es LEER Y TRANSCRIBIR la patente con exactitud, letra por letra.
Si la patente NO es completamente legible, OMITÍ el campo "patente" (no pongas nada).`;

const USER_PROMPT = `Analizá esta imagen y devolvé este JSON:

{
  "title": "título del aviso (máx 80 chars, NO incluyas el año aquí, lo agrega el sistema)",
  "description": "descripción de 2-3 oraciones para el aviso",
  "category_id": número según categoría,
  "condition": "new|like_new|very_good|good|fair|for_parts",
  "price_suggested": número en pesos argentinos (0 si no podés estimar),
  "attributes": { ... campos según categoría ... }
}

CATEGORÍAS: 1=Electrónica 2=Vehículos 3=Inmuebles 4=Ropa 5=Hogar 6=Deportes 7=Herramientas 8=Libros 9=Mascotas 10=Otros 21=Celulares 22=Electrodomésticos 23=Bebés/Niños 24=Belleza/Salud

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORÍA 2 — VEHÍCULOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  "sub_category": "auto|camioneta|moto|camion|nautica|otro",
  "brand": "toyota|volkswagen|ford|chevrolet|renault|peugeot|fiat|honda|hyundai|kia|nissan|citroen|bmw|mercedes-benz|audi|suzuki|jeep|dodge|chery|geely|byd|otra",
  "model": "nombre del modelo (ej: Up!, Gol, Hilux, Corolla)",
  "version": "versión si es legible (ej: Move Up, Comfortline, SR 4x4)",
  "patente": "SOLO si la patente es completamente legible letra por letra: transcribila EXACTAMENTE (ej: PDL187, AB123CD). Si hay CUALQUIER duda o no se ve con claridad, NO incluyas este campo.",
  "year": 0,
  "km": número si se puede inferir,
  "fuel": "nafta|diesel|gnc|glp|electrico|hibrido|otro",
  "transmission": "manual|automatica|cvt",
  "doors": "2|3|4|5",
  "color": "color del vehículo en español",
  "engine": "cilindrada si es visible (ej: 1.0, 1.6, 2.0 TDI)",
  "first_owner": true solo si hay indicios claros,
  "accepts_trade": false,
  "seller_type": "particular|concesionaria"
}

SOBRE EL AÑO: Siempre poné year: 0. El año real lo calcula el sistema leyendo la patente.
No pongas el año de lanzamiento del modelo. No pongas el año que creés por el diseño.

CÓMO IDENTIFICAR EL VEHÍCULO:
- Logo en capó/parrilla/portón: VW=Volkswagen, estrella=Mercedes, hélice=BMW
- Texto en carrocería: nombre del modelo, versión
- Patente: leé cada letra y número con cuidado, es el dato más importante

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORÍA 1 — ELECTRÓNICA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{ "sub_category": "celular|computadora|tablet|tv|audio|camara|consola|otro",
  "brand": "marca", "model": "modelo exacto",
  "storage": "64gb|128gb|256gb|512gb|1tb|otro",
  "ram": "4gb|6gb|8gb|16gb|otro", "color": "color",
  "includes_box": true|false, "includes_charger": true|false }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORÍA 3 — INMUEBLES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{ "sub_category": "casa|departamento|terreno|finca|local|galpon|cochera|otro",
  "operation": "venta|alquiler|alquiler-temporal",
  "bedrooms": "monoambiente|1|2|3|4|5+", "bathrooms": "1|2|3|4+",
  "m2_covered": número, "m2_total": número,
  "garage": true|false, "pool": true|false,
  "private_complex": true|false, "currency": "ARS|USD" }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OTRAS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ropa(4): sub_category, gender, size, brand, color
Hogar(5): sub_category, brand, color, material
Deportes(6): sub_category, brand, size, color
Herramientas(7): sub_category, brand, voltage
Mascotas(9): sub_category, breed, sex, vaccinated, is_adoption
Celulares(21): sub_category="smartphone|basico|tablet|smartwatch|accesorio|otro", brand, model, storage="32gb|64gb|128gb|256gb|512gb|1tb|otro", color, includes_box, includes_charger, unlocked
Electrodomésticos(22): sub_category="heladera|lavarropas|cocina|microondas|aire|aspiradora|pequeno|otro", brand, model, color="blanco|gris|negro|acero|otro"
Bebés/Niños(23): sub_category="ropa-bebe|ropa-nino|coche|cuna|juguete|lactancia|educativo|otro", age_range, brand, gender
Belleza/Salud(24): sub_category="cuidado-personal|maquillaje|perfume|capilar|equipo-medico|suplemento|optica|otro", brand, volume`;

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
      model: "claude-haiku-4-5-20251001",
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
        if (sc.includes("moto") || sc.includes("quad"))
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

  return parsed;
}
