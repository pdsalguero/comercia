// Configuración de campos específicos por categoría
// Basado en los campos de compraensanjuan.com + mejoras

export type FieldType = "select" | "number" | "text" | "checkbox" | "radio";

export interface CategoryField {
  key: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  unit?: string; // km, m², etc.
  hint?: string;
}

export interface CategoryConfig {
  id: number;
  name: string;
  slug: string;
  icon: string;
  fields: CategoryField[];
  subcats?: { value: string; label: string }[];
}

const ZONAS_SJ = [
  { value: "capital", label: "Capital" },
  { value: "rivadavia", label: "Rivadavia" },
  { value: "rawson", label: "Rawson" },
  { value: "santa-lucia", label: "Santa Lucía" },
  { value: "chimbas", label: "Chimbas" },
  { value: "pocito", label: "Pocito" },
  { value: "caucete", label: "Caucete" },
  { value: "25-de-mayo", label: "25 de Mayo" },
  { value: "ullum", label: "Ullum" },
  { value: "zonda", label: "Zonda" },
  { value: "sarmiento", label: "Sarmiento" },
  { value: "angaco", label: "Angaco" },
  { value: "albardon", label: "Albardón" },
  { value: "jachal", label: "Jáchal" },
  { value: "iglesia", label: "Iglesia" },
  { value: "calingasta", label: "Calingasta" },
  { value: "san-martin", label: "San Martín" },
  { value: "valle-fertil", label: "Valle Fértil" },
  { value: "otro", label: "Otro" },
];

export const CATEGORY_CONFIGS: CategoryConfig[] = [
  // ── 1. ELECTRÓNICA ────────────────────────────────────────────
  {
    id: 1,
    name: "Electrónica",
    slug: "electronics",
    icon: "📱",
    subcats: [
      { value: "celular", label: "Celular / Smartphone" },
      { value: "computadora", label: "Computadora / Notebook" },
      { value: "tablet", label: "Tablet" },
      { value: "tv", label: "Smart TV / Monitor" },
      { value: "audio", label: "Audio / Parlantes" },
      { value: "camara", label: "Cámara fotográfica" },
      { value: "consola", label: "Consola / Videojuegos" },
      { value: "componentes", label: "Componentes PC" },
      { value: "accesorios", label: "Accesorios" },
      { value: "otro", label: "Otro" },
    ],
    fields: [
      {
        key: "sub_category",
        label: "Tipo de producto",
        type: "select",
        required: true,
        options: [
          { value: "celular", label: "Celular / Smartphone" },
          { value: "computadora", label: "Computadora / Notebook" },
          { value: "tablet", label: "Tablet" },
          { value: "tv", label: "Smart TV / Monitor" },
          { value: "audio", label: "Audio / Parlantes" },
          { value: "camara", label: "Cámara fotográfica" },
          { value: "consola", label: "Consola / Videojuegos" },
          { value: "otro", label: "Otro" },
        ],
      },
      {
        key: "brand",
        label: "Marca",
        type: "text",
        placeholder: "Apple, Samsung, LG...",
      },
      {
        key: "model",
        label: "Modelo",
        type: "text",
        placeholder: "iPhone 14 Pro, Galaxy S23...",
      },
      {
        key: "storage",
        label: "Almacenamiento",
        type: "select",
        options: [
          { value: "16gb", label: "16 GB" },
          { value: "32gb", label: "32 GB" },
          { value: "64gb", label: "64 GB" },
          { value: "128gb", label: "128 GB" },
          { value: "256gb", label: "256 GB" },
          { value: "512gb", label: "512 GB" },
          { value: "1tb", label: "1 TB" },
          { value: "otro", label: "Otro" },
        ],
      },
      {
        key: "ram",
        label: "RAM",
        type: "select",
        options: [
          { value: "2gb", label: "2 GB" },
          { value: "4gb", label: "4 GB" },
          { value: "6gb", label: "6 GB" },
          { value: "8gb", label: "8 GB" },
          { value: "12gb", label: "12 GB" },
          { value: "16gb", label: "16 GB" },
          { value: "32gb", label: "32 GB" },
          { value: "otro", label: "Otro" },
        ],
      },
      {
        key: "color",
        label: "Color",
        type: "text",
        placeholder: "Negro, Blanco, Grafito...",
      },
      { key: "includes_box", label: "Incluye caja original", type: "checkbox" },
      { key: "includes_charger", label: "Incluye cargador", type: "checkbox" },
    ],
  },

  // ── 2. VEHÍCULOS ──────────────────────────────────────────────
  {
    id: 2,
    name: "Vehículos",
    slug: "vehicles",
    icon: "🚗",
    subcats: [
      { value: "auto", label: "Auto" },
      { value: "camioneta", label: "Camioneta / SUV / Utilitario" },
      { value: "moto", label: "Moto / Cuatriciclo" },
      { value: "camion", label: "Camión" },
      { value: "nautica", label: "Náutica" },
      { value: "plan-ahorro", label: "Plan de Ahorro" },
      { value: "otro", label: "Otro" },
    ],
    fields: [
      {
        key: "sub_category",
        label: "Tipo de vehículo",
        type: "select",
        required: true,
        options: [
          { value: "auto", label: "Auto" },
          { value: "camioneta", label: "Camioneta / SUV" },
          { value: "moto", label: "Moto / Cuatriciclo" },
          { value: "camion", label: "Camión" },
          { value: "nautica", label: "Náutica" },
          { value: "plan-ahorro", label: "Plan de Ahorro" },
          { value: "otro", label: "Otro" },
        ],
      },
      {
        key: "brand",
        label: "Marca",
        type: "select",
        required: true,
        options: [
          { value: "toyota", label: "Toyota" },
          { value: "volkswagen", label: "Volkswagen" },
          { value: "ford", label: "Ford" },
          { value: "chevrolet", label: "Chevrolet" },
          { value: "renault", label: "Renault" },
          { value: "peugeot", label: "Peugeot" },
          { value: "fiat", label: "Fiat" },
          { value: "honda", label: "Honda" },
          { value: "hyundai", label: "Hyundai" },
          { value: "kia", label: "Kia" },
          { value: "nissan", label: "Nissan" },
          { value: "citroen", label: "Citroën" },
          { value: "bmw", label: "BMW" },
          { value: "mercedes-benz", label: "Mercedes-Benz" },
          { value: "audi", label: "Audi" },
          { value: "suzuki", label: "Suzuki" },
          { value: "jeep", label: "Jeep" },
          { value: "dodge", label: "Dodge" },
          { value: "chery", label: "Chery" },
          { value: "geely", label: "Geely" },
          { value: "byd", label: "BYD" },
          { value: "otra", label: "Otra marca" },
        ],
      },
      {
        key: "model",
        label: "Modelo",
        type: "text",
        placeholder: "Hilux, Gol, Corolla...",
        required: true,
      },
      {
        key: "year",
        label: "Año",
        type: "number",
        placeholder: "2020",
        required: true,
      },
      {
        key: "km",
        label: "Kilómetros",
        type: "number",
        placeholder: "50000",
        unit: "km",
        required: true,
      },
      {
        key: "fuel",
        label: "Combustible",
        type: "select",
        required: true,
        options: [
          { value: "nafta", label: "Nafta" },
          { value: "diesel", label: "Diesel" },
          { value: "gnc", label: "GNC" },
          { value: "glp", label: "GLP" },
          { value: "electrico", label: "Eléctrico" },
          { value: "hibrido", label: "Híbrido" },
          { value: "otro", label: "Otro" },
        ],
      },
      {
        key: "transmission",
        label: "Transmisión",
        type: "select",
        options: [
          { value: "manual", label: "Manual" },
          { value: "automatica", label: "Automática" },
          { value: "cvt", label: "CVT" },
        ],
      },
      {
        key: "doors",
        label: "Puertas",
        type: "select",
        options: [
          { value: "2", label: "2 puertas" },
          { value: "3", label: "3 puertas" },
          { value: "4", label: "4 puertas" },
          { value: "5", label: "5 puertas" },
        ],
      },
      {
        key: "color",
        label: "Color",
        type: "text",
        placeholder: "Blanco, Negro, Rojo...",
      },
      {
        key: "first_owner",
        label: "Primera mano (único dueño)",
        type: "checkbox",
      },
      { key: "accepts_trade", label: "Acepta permuta", type: "checkbox" },
      {
        key: "seller_type",
        label: "Vendedor",
        type: "radio",
        options: [
          { value: "particular", label: "Particular" },
          { value: "concesionaria", label: "Concesionaria" },
        ],
      },
    ],
  },

  // ── 3. INMUEBLES ──────────────────────────────────────────────
  {
    id: 3,
    name: "Inmuebles",
    slug: "real-estate",
    icon: "🏠",
    subcats: [
      { value: "casa", label: "Casa" },
      { value: "departamento", label: "Departamento" },
      { value: "terreno", label: "Terreno / Lote" },
      { value: "finca", label: "Finca / Campo / Quinta" },
      { value: "local", label: "Local / Oficina / Consultorios" },
      { value: "galpon", label: "Galpón / Depósito" },
      { value: "cochera", label: "Cochera" },
      { value: "otro", label: "Otro" },
    ],
    fields: [
      {
        key: "sub_category",
        label: "Tipo de propiedad",
        type: "select",
        required: true,
        options: [
          { value: "casa", label: "Casa" },
          { value: "departamento", label: "Departamento" },
          { value: "terreno", label: "Terreno / Lote" },
          { value: "finca", label: "Finca / Campo / Quinta" },
          { value: "local", label: "Local / Oficina / Consultorios" },
          { value: "galpon", label: "Galpón / Depósito" },
          { value: "cochera", label: "Cochera" },
          { value: "otro", label: "Otro" },
        ],
      },
      {
        key: "operation",
        label: "Operación",
        type: "radio",
        required: true,
        options: [
          { value: "venta", label: "Venta" },
          { value: "alquiler", label: "Alquiler" },
          { value: "alquiler-temporal", label: "Alquiler temporal" },
        ],
      },
      {
        key: "zone",
        label: "Departamento / Zona",
        type: "select",
        required: true,
        options: ZONAS_SJ,
      },
      {
        key: "bedrooms",
        label: "Dormitorios",
        type: "select",
        options: [
          { value: "monoambiente", label: "Monoambiente" },
          { value: "1", label: "1 dormitorio" },
          { value: "2", label: "2 dormitorios" },
          { value: "3", label: "3 dormitorios" },
          { value: "4", label: "4 dormitorios" },
          { value: "5+", label: "5 o más" },
        ],
      },
      {
        key: "bathrooms",
        label: "Baños",
        type: "select",
        options: [
          { value: "1", label: "1 baño" },
          { value: "2", label: "2 baños" },
          { value: "3", label: "3 baños" },
          { value: "4+", label: "4 o más" },
        ],
      },
      {
        key: "m2_covered",
        label: "Superficie cubierta",
        type: "number",
        placeholder: "80",
        unit: "m²",
      },
      {
        key: "m2_total",
        label: "Superficie total",
        type: "number",
        placeholder: "200",
        unit: "m²",
      },
      {
        key: "age",
        label: "Antigüedad",
        type: "select",
        options: [
          { value: "estrenar", label: "A estrenar" },
          { value: "0-5", label: "Menos de 5 años" },
          { value: "5-10", label: "5 a 10 años" },
          { value: "10-20", label: "10 a 20 años" },
          { value: "20-30", label: "20 a 30 años" },
          { value: "30+", label: "Más de 30 años" },
        ],
      },
      {
        key: "rooms",
        label: "Ambientes",
        type: "select",
        options: [
          { value: "1", label: "1 ambiente" },
          { value: "2", label: "2 ambientes" },
          { value: "3", label: "3 ambientes" },
          { value: "4", label: "4 ambientes" },
          { value: "5+", label: "5 o más" },
        ],
      },
      {
        key: "floor",
        label: "Piso (dpto)",
        type: "select",
        options: [
          { value: "pb", label: "Planta baja" },
          ...[1,2,3,4,5,6,7,8,9,10].map(f => ({ value: String(f), label: `${f}° piso` })),
          { value: "11+", label: "11° o superior" },
        ],
      },
      {
        key: "orientation",
        label: "Orientación",
        type: "select",
        options: [
          { value: "norte", label: "Norte" },
          { value: "sur", label: "Sur" },
          { value: "este", label: "Este" },
          { value: "oeste", label: "Oeste" },
          { value: "noreste", label: "Noreste" },
          { value: "noroeste", label: "Noroeste" },
          { value: "sureste", label: "Sureste" },
          { value: "suroeste", label: "Suroeste" },
        ],
      },
      {
        key: "heating",
        label: "Calefacción",
        type: "select",
        options: [
          { value: "central", label: "Central" },
          { value: "radiadores", label: "Radiadores" },
          { value: "split", label: "Split / A/A" },
          { value: "losa", label: "Losa radiante" },
          { value: "estufa", label: "Estufa" },
          { value: "ninguna", label: "Sin calefacción" },
        ],
      },
      { key: "garage", label: "Cochera incluida", type: "checkbox" },
      { key: "pool", label: "Pileta", type: "checkbox" },
      { key: "elevator", label: "Ascensor", type: "checkbox" },
      { key: "furnished", label: "Amoblado", type: "checkbox" },
      { key: "pets_allowed", label: "Mascotas permitidas", type: "checkbox" },
      { key: "air_conditioning", label: "Aire acondicionado", type: "checkbox" },
      { key: "laundry", label: "Lavadero", type: "checkbox" },
      { key: "storage", label: "Baulera", type: "checkbox" },
      { key: "grill", label: "Parrilla", type: "checkbox" },
      { key: "security", label: "Seguridad 24hs", type: "checkbox" },
      {
        key: "private_complex",
        label: "Barrio privado / Consorcio",
        type: "checkbox",
      },
      {
        key: "credit_eligible",
        label: "Apto crédito hipotecario",
        type: "checkbox",
      },
      {
        key: "seller_type",
        label: "Publicado por",
        type: "radio",
        options: [
          { value: "particular", label: "Dueño directo" },
          { value: "inmobiliaria", label: "Inmobiliaria" },
        ],
      },
      {
        key: "currency",
        label: "Moneda del precio",
        type: "radio",
        options: [
          { value: "ARS", label: "Pesos ($)" },
          { value: "USD", label: "Dólares (U$S)" },
        ],
      },
    ],
  },

  // ── 4. ROPA Y CALZADO ─────────────────────────────────────────
  {
    id: 4,
    name: "Ropa y Calzado",
    slug: "clothing",
    icon: "👗",
    fields: [
      {
        key: "sub_category",
        label: "Tipo",
        type: "select",
        required: true,
        options: [
          { value: "ropa", label: "Ropa" },
          { value: "calzado", label: "Calzado" },
          { value: "accesorio", label: "Accesorio" },
          { value: "bolso", label: "Bolso / Cartera" },
        ],
      },
      {
        key: "gender",
        label: "Género",
        type: "select",
        required: true,
        options: [
          { value: "mujer", label: "Mujer" },
          { value: "hombre", label: "Hombre" },
          { value: "unisex", label: "Unisex" },
          { value: "nino", label: "Niño/a" },
          { value: "bebe", label: "Bebé" },
        ],
      },
      {
        key: "size",
        label: "Talle",
        type: "text",
        placeholder: "S, M, L, XL, 42, 38...",
      },
      {
        key: "brand",
        label: "Marca",
        type: "text",
        placeholder: "Nike, Adidas, Zara...",
      },
      {
        key: "color",
        label: "Color",
        type: "text",
        placeholder: "Negro, Azul...",
      },
      {
        key: "material",
        label: "Material",
        type: "text",
        placeholder: "Algodón, Jean, Cuero...",
      },
    ],
  },

  // ── 5. HOGAR Y JARDÍN ─────────────────────────────────────────
  {
    id: 5,
    name: "Hogar y Jardín",
    slug: "home-garden",
    icon: "🛋️",
    fields: [
      {
        key: "sub_category",
        label: "Tipo",
        type: "select",
        required: true,
        options: [
          { value: "mueble", label: "Mueble" },
          { value: "electrodomestico", label: "Electrodoméstico" },
          { value: "decoracion", label: "Decoración" },
          { value: "cocina", label: "Cocina / Vajilla" },
          { value: "textil", label: "Textil / Ropa de cama" },
          { value: "herramienta-hogar", label: "Herramienta hogar" },
          { value: "jardin", label: "Jardín" },
          { value: "otro", label: "Otro" },
        ],
      },
      {
        key: "brand",
        label: "Marca",
        type: "text",
        placeholder: "Samsung, Whirlpool...",
      },
      {
        key: "color",
        label: "Color",
        type: "text",
        placeholder: "Blanco, Madera...",
      },
      {
        key: "material",
        label: "Material",
        type: "text",
        placeholder: "Madera, Metal, Tela...",
      },
      {
        key: "dimensions",
        label: "Medidas",
        type: "text",
        placeholder: "Alto x Ancho x Profundo",
      },
    ],
  },

  // ── 6. DEPORTES ───────────────────────────────────────────────
  {
    id: 6,
    name: "Deportes",
    slug: "sports",
    icon: "⚽",
    fields: [
      {
        key: "sub_category",
        label: "Tipo",
        type: "select",
        required: true,
        options: [
          { value: "bicicleta", label: "Bicicleta" },
          { value: "fitness", label: "Fitness / Gym" },
          { value: "pelota", label: "Pelotas / Equipos" },
          { value: "raqueta", label: "Raqueta / Pala" },
          { value: "natacion", label: "Natación" },
          { value: "camping", label: "Camping / Outdoor" },
          { value: "ropa-dep", label: "Ropa deportiva" },
          { value: "otro", label: "Otro" },
        ],
      },
      {
        key: "brand",
        label: "Marca",
        type: "text",
        placeholder: "Nike, Adidas, Trek...",
      },
      {
        key: "size",
        label: "Talle / Rodado",
        type: "text",
        placeholder: 'M, 29", 42...',
      },
      {
        key: "color",
        label: "Color",
        type: "text",
        placeholder: "Negro, Rojo...",
      },
    ],
  },

  // ── 7. HERRAMIENTAS ───────────────────────────────────────────
  {
    id: 7,
    name: "Herramientas",
    slug: "tools",
    icon: "🔧",
    fields: [
      {
        key: "sub_category",
        label: "Tipo",
        type: "select",
        required: true,
        options: [
          { value: "electrica", label: "Herramienta eléctrica" },
          { value: "manual", label: "Herramienta manual" },
          { value: "medicion", label: "Medición / Nivel" },
          { value: "jardineria", label: "Jardinería" },
          { value: "soldadura", label: "Soldadura" },
          { value: "otro", label: "Otro" },
        ],
      },
      {
        key: "brand",
        label: "Marca",
        type: "text",
        placeholder: "Bosch, DeWalt, Makita...",
      },
      {
        key: "voltage",
        label: "Voltaje",
        type: "select",
        options: [
          { value: "12v", label: "12V" },
          { value: "18v", label: "18V" },
          { value: "110v", label: "110V" },
          { value: "220v", label: "220V" },
          { value: "n/a", label: "N/A" },
        ],
      },
    ],
  },

  // ── 8. LIBROS ─────────────────────────────────────────────────
  {
    id: 8,
    name: "Libros",
    slug: "books",
    icon: "📚",
    fields: [
      {
        key: "sub_category",
        label: "Tipo",
        type: "select",
        options: [
          { value: "libro", label: "Libro" },
          { value: "revista", label: "Revista" },
          { value: "manual", label: "Manual / Técnico" },
          { value: "comic", label: "Cómic / Manga" },
          { value: "pelicula", label: "Película / Serie" },
          { value: "musica", label: "Música / CD" },
          { value: "otro", label: "Otro" },
        ],
      },
      {
        key: "author",
        label: "Autor / Editorial",
        type: "text",
        placeholder: "Stephen King, Planeta...",
      },
      {
        key: "language",
        label: "Idioma",
        type: "select",
        options: [
          { value: "espanol", label: "Español" },
          { value: "ingles", label: "Inglés" },
          { value: "otro", label: "Otro" },
        ],
      },
    ],
  },

  // ── 9. MASCOTAS ───────────────────────────────────────────────
  {
    id: 9,
    name: "Mascotas",
    slug: "pets",
    icon: "🐾",
    fields: [
      {
        key: "sub_category",
        label: "Tipo",
        type: "select",
        required: true,
        options: [
          { value: "perro", label: "Perro" },
          { value: "gato", label: "Gato" },
          { value: "ave", label: "Ave / Pájaro" },
          { value: "pez", label: "Pez / Acuario" },
          { value: "roedor", label: "Roedor / Conejo" },
          { value: "accesorio", label: "Accesorio / Comida" },
          { value: "otro", label: "Otro" },
        ],
      },
      {
        key: "breed",
        label: "Raza",
        type: "text",
        placeholder: "Labrador, Persa, Criolla...",
      },
      {
        key: "age",
        label: "Edad",
        type: "text",
        placeholder: "2 años, 3 meses...",
      },
      {
        key: "sex",
        label: "Sexo",
        type: "radio",
        options: [
          { value: "macho", label: "Macho" },
          { value: "hembra", label: "Hembra" },
        ],
      },
      { key: "vaccinated", label: "Vacunado", type: "checkbox" },
      { key: "pedigree", label: "Con pedigree", type: "checkbox" },
      {
        key: "is_adoption",
        label: "Es adopción (gratis)",
        type: "checkbox",
        hint: "Marcá si el animal se da en adopción gratuitamente",
      },
    ],
  },

  // ── 10. OTROS ─────────────────────────────────────────────────
  {
    id: 10,
    name: "Otros",
    slug: "other",
    icon: "📦",
    fields: [
      {
        key: "sub_category",
        label: "Tipo",
        type: "text",
        placeholder: "Describí el tipo de producto",
      },
      { key: "brand", label: "Marca", type: "text", placeholder: "Opcional" },
    ],
  },
];

// Helper: get config by category_id
export function getCategoryConfig(
  categoryId: number,
): CategoryConfig | undefined {
  return CATEGORY_CONFIGS.find((c) => c.id === categoryId);
}

// Helper: get config by slug
export function getCategoryBySlug(slug: string): CategoryConfig | undefined {
  return CATEGORY_CONFIGS.find((c) => c.slug === slug);
}
