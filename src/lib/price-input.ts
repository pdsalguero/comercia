// Campo de precio de Publicar: se escribe con separador de miles y sin centavos.

/** Precio máximo aceptado (9.999.999.999): evita errores de tipeo con ceros de más. */
export const MAX_PRICE = 9_999_999_999;

export type ParsedPrice = {
  /** Solo dígitos, listo para guardar ("" si está vacío). */
  value: string;
  /** Se escribieron centavos y se descartaron (para avisarle al vendedor). */
  droppedDecimals: boolean;
  /** Superaba el máximo y se recortó. */
  capped: boolean;
};

/**
 * Interpreta lo que se escribe en el precio al estilo argentino: "." separa miles y "," los
 * decimales. Antes se borraban todos los símbolos y "1.500.000,50" quedaba en 150.000.050;
 * ahora se toma la parte entera (1.500.000) y se avisa que los centavos no se guardan.
 */
export function parsePriceInput(raw: string): ParsedPrice {
  const [intPart, ...rest] = raw.split(",");
  const droppedDecimals = rest.join("").replace(/\D/g, "").length > 0;
  let digits = intPart.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  let capped = false;
  if (digits && Number(digits) > MAX_PRICE) {
    digits = String(MAX_PRICE);
    capped = true;
  }
  return { value: digits, droppedDecimals, capped };
}
