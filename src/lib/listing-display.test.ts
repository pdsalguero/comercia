import { describe, expect, it } from "vitest";
import { favoriteStatus, formatListingPrice } from "./listing-display";

describe("formatListingPrice", () => {
  it("sin precio o precio 0 dice 'A consultar', nunca '$ 0'", () => {
    expect(formatListingPrice(null, "ARS")).toBe("A consultar");
    expect(formatListingPrice(0, "USD")).toBe("A consultar");
  });
  it("formatea pesos y dólares", () => {
    expect(formatListingPrice(9500000, "ARS")).toBe(`$ ${(9500000).toLocaleString("es-AR")}`);
    expect(formatListingPrice(47000, "USD")).toBe(`U$S ${(47000).toLocaleString("es-AR")}`);
  });
});

describe("favoriteStatus", () => {
  it("activo de vehículos: disponible", () => {
    expect(favoriteStatus({ status: "active", category_id: 2 })).toBe("available");
  });
  it("pausado: se muestra como pausado", () => {
    expect(favoriteStatus({ status: "paused", category_id: 2 })).toBe("paused");
  });
  it("vendido, vencido, eliminado o de otra categoría: no disponible", () => {
    expect(favoriteStatus({ status: "sold", category_id: 2 })).toBe("unavailable");
    expect(favoriteStatus(null)).toBe("unavailable");
    expect(favoriteStatus({ status: "active", category_id: 3 })).toBe("unavailable"); // inmuebles (casa y terreno)
  });
});
