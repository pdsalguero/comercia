import { describe, expect, it } from "vitest";
import { splitPrivateAttributes } from "./vehicle-attributes";

describe("patente privada", () => {
  it("sin 'Mostrar patente' no queda en los atributos públicos", () => {
    const { publicAttrs, patente } = splitPrivateAttributes({ brand: "toyota", patente: " ab123cd ", show_patente: false });
    expect(publicAttrs).toEqual({ brand: "toyota", show_patente: false });
    expect(patente).toBe("AB123CD");
  });

  it("con 'Mostrar patente' queda pública, y también se guarda privada", () => {
    const { publicAttrs, patente } = splitPrivateAttributes({ patente: "PDL187", show_patente: true });
    expect(publicAttrs).toEqual({ patente: "PDL187", show_patente: true });
    expect(patente).toBe("PDL187");
  });

  it("nunca guarda la copia interna de la IA", () => {
    const { publicAttrs } = splitPrivateAttributes({ patente: "PDL187", show_patente: "true", _patente_info: { patente: "PDL187" } });
    expect(publicAttrs).not.toHaveProperty("_patente_info");
  });

  it("sin patente no hay nada que guardar", () => {
    expect(splitPrivateAttributes({ brand: "fiat", patente: "  " }).patente).toBeNull();
  });
});
