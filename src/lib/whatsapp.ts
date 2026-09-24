// Arma el link de contacto por WhatsApp de un aviso — misma regla que ya usaba
// listings/[id]/page.tsx: el número puede venir del propio aviso (atributo
// "whatsapp_phone", hoy sin UI para cargarlo pero soportado), si no de la tienda
// (store_whatsapp) y si no del teléfono de perfil (phone). show_phone === false
// lo oculta todo (el vendedor pidió no mostrar su teléfono).
export function buildWhatsappUrl(opts: {
  showPhone?: boolean | null;
  storeWhatsapp?: string | null;
  phone?: string | null;
  listingWhatsappOverride?: string | null;
  listingTitle: string;
}): string | null {
  const canShow = opts.showPhone !== false;
  const raw = opts.listingWhatsappOverride || opts.storeWhatsapp || opts.phone || null;
  const phone = canShow ? raw : null;
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(`Hola, vi tu publicación "${opts.listingTitle}" en CuyoRodados y me interesa`)}`;
}
