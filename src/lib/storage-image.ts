// Miniaturas de Supabase Storage: convierte una URL pública de un bucket al endpoint de
// transformación (/render/image), que devuelve la foto redimensionada y comprimida.
// Las fotos originales pesan 130-200 KB; una miniatura de tarjeta, 15-40 KB.
//
// Solo se transforman tamaños de miniatura: las imágenes grandes (galería) se sirven tal cual, ya
// que se suben comprimidas a 1200 px. Cada foto transformada cuenta como "imagen de origen" en la
// cuota de Image Transformations del plan de Supabase.
const MAX_THUMB_WIDTH = 640;

// Con `height`, la foto se ajusta a width×height: "contain" la deja entera dentro de esa caja (fotos
// verticales incluidas) y "cover" la recorta para llenarla, según el `object-fit` con que se muestre.
//
// ⚠️ SIEMPRE pasar `height`. Sin él, Supabase NO escala el alto proporcionalmente — devuelve el
// `width` pedido pero con el alto ORIGINAL de la foto sin tocar (verificado: una foto de celular de
// 900×1200 pedida con width=120 solo vuelve 120×1200, no ~90×120). Con object-fit "contain" o "cover"
// eso arruina cualquier foto vertical: se ve como un fideo de 5px en vez de una miniatura (bug real,
// visto en el home — ver [[project-thumbnail-aspect-ratio-bug]]).
export function storageImg(
  url: string | null | undefined,
  width?: number,
  quality = 75,
  height?: number,
  fit: "contain" | "cover" = "contain"
): string {
  if (!url) return "";
  if (!width || width > MAX_THUMB_WIDTH) return url;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }
  if (!parsed.hostname.endsWith(".supabase.co")) return url;

  const transformed = url.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/");
  if (transformed === url) return url; // no es un objeto público de Storage (o ya es una transformación)

  const size = height ? `width=${width}&height=${height}&resize=${fit}` : `width=${width}`;
  return `${transformed}${transformed.includes("?") ? "&" : "?"}${size}&quality=${quality}`;
}

/**
 * Para el `onError` de un <img> con miniatura: si la transformación falla (cuota agotada,
 * servicio caído), vuelve una sola vez a la foto original en lugar de dejar la imagen rota.
 */
export function fallbackToOriginal(original: string) {
  return (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.dataset.fallback || !original) return;
    img.dataset.fallback = "1";
    img.src = original;
  };
}
