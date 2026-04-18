const SUPABASE_HOSTS = [
  "snrxpyolkxcficxnzaxh.supabase.co",
  "hbeswalibpblqkrdqczh.supabase.co",
];

/**
 * Convierte una URL de Supabase Storage a la URL de transformación
 * para servir imágenes redimensionadas/comprimidas desde el CDN de Supabase.
 * Para imágenes que no son de Supabase devuelve la URL sin cambios.
 */
export function storageImg(url: string | null | undefined, width: number, quality = 80): string {
  if (!url) return "";

  let host: string;
  try {
    host = new URL(url).hostname;
  } catch {
    return url;
  }

  if (!SUPABASE_HOSTS.includes(host)) return url;

  // /storage/v1/object/public/bucket/path → /storage/v1/render/image/public/bucket/path
  const transformed = url.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/");
  if (transformed === url) return url; // ya usa render/ u otro path

  return `${transformed}?width=${width}&quality=${quality}&format=webp`;
}
