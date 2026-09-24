import { describe, expect, it } from "vitest";
import { comparePrice, parseNonNegativeInt, priceForSort, sanitizeRangeParams } from "./listing-filters";

describe("parseNonNegativeInt", () => {
  it("acepta enteros no negativos", () => {
    expect(parseNonNegativeInt("0")).toBe(0);
    expect(parseNonNegativeInt(" 5000 ")).toBe(5000);
  });
  it("rechaza negativos, decimales, notación científica y texto", () => {
    for (const bad of ["-5000", "1e3", "1.5", "Infinity", "abc", "", "0x10"]) {
      expect(parseNonNegativeInt(bad)).toBeUndefined();
    }
  });
});

describe("sanitizeRangeParams", () => {
  it("descarta precios inválidos: el chip nunca puede decir $-5.000", () => {
    const sp = sanitizeRangeParams({ price_min: "-5000", price_max: "1e3", q: "hilux" });
    expect(sp.price_min).toBeUndefined();
    expect(sp.price_max).toBeUndefined();
    expect(sp.q).toBe("hilux");
  });
  it("invierte mínimo y máximo si vienen al revés", () => {
    const sp = sanitizeRangeParams({ price_min: "900", price_max: "100", year_from: "2020", year_to: "2010" });
    expect([sp.price_min, sp.price_max]).toEqual(["100", "900"]);
    expect([sp.year_from, sp.year_to]).toEqual(["2010", "2020"]);
  });
  it("descarta años fuera de rango", () => {
    const sp = sanitizeRangeParams({ year_from: "1200", year_to: "99999" });
    expect(sp.year_from).toBeUndefined();
    expect(sp.year_to).toBeUndefined();
  });
});

describe("orden por precio", () => {
  const items = [{ price: 500 }, { price: null }, { price: 100 }, { price: 0 }, { price: 300 }];
  it("0 y null son 'A consultar'", () => {
    expect(priceForSort(0)).toBeNull();
    expect(priceForSort(null)).toBeNull();
    expect(priceForSort("2500")).toBe(2500);
  });
  it("ascendente: A consultar al final", () => {
    expect([...items].sort((a, b) => comparePrice(a, b, false)).map((i) => i.price)).toEqual([100, 300, 500, null, 0]);
  });
  it("descendente: A consultar también al final", () => {
    expect([...items].sort((a, b) => comparePrice(a, b, true)).map((i) => i.price)).toEqual([500, 300, 100, null, 0]);
  });
});
