import { describe, expect, it } from "vitest";
import { buildKeywordFilters, tokenizeKeywords, wordToRegex } from "./search-query";

// Replica en JS lo que hace Postgres con `imatch` (regex case-insensitive) para probar sin base.
const matches = (re: string, text: string) => new RegExp(re, "i").test(text);

describe("tokenizeKeywords", () => {
  it("ignora acentos y mayúsculas", () => {
    expect(tokenizeKeywords("  BAÚL  Río ")).toEqual(["baul", "rio"]);
  });
  it("une marcas escritas separadas", () => {
    expect(tokenizeKeywords("CF Moto 800")).toEqual(["cfmoto", "800"]);
    expect(tokenizeKeywords("mercedes benz")).toEqual(["mercedes"]);
  });
});

describe("wordToRegex", () => {
  it("'baul' encuentra 'baúl' y 'BAUL'", () => {
    const re = wordToRegex("baul");
    expect(matches(re, "Moto con baúl")).toBe(true);
    expect(matches(re, "BAUL TRASERO")).toBe(true);
  });
  it("'sw4' encuentra 'SW 4' y 'SW-4'", () => {
    const re = wordToRegex("sw4");
    expect(matches(re, "Toyota SW4")).toBe(true);
    expect(matches(re, "Hilux SW 4")).toBe(true);
    expect(matches(re, "Hilux SW-4")).toBe(true);
  });
  it("'%' y '_' son literales, no comodines", () => {
    expect(matches(wordToRegex("%"), "Toyota Hilux")).toBe(false);
    expect(matches(wordToRegex("%"), "Descuento 10%")).toBe(true);
    expect(matches(wordToRegex("_"), "Toyota Hilux")).toBe(false);
  });
  it("descarta comillas y barras que romperían la sintaxis de PostgREST", () => {
    expect(wordToRegex('a"b\\c')).not.toMatch(/["\\]/);
  });
});

describe("buildKeywordFilters", () => {
  it("vacío no filtra", () => {
    expect(buildKeywordFilters("")).toEqual([]);
    expect(buildKeywordFilters(undefined)).toEqual([]);
  });
  it("un filtro por palabra, en título, descripción, marca, modelo y versión", () => {
    const [f] = buildKeywordFilters("hilux");
    for (const field of ["title", "description", "attributes->>brand", "attributes->>model", "attributes->>version"]) {
      expect(f).toContain(`${field}.imatch.`);
    }
    expect(buildKeywordFilters("toyota hilux")).toHaveLength(2);
  });
  it("sinónimos: vw también busca volkswagen", () => {
    const [f] = buildKeywordFilters("vw");
    const re = f.match(/title\.imatch\."([^"]+)"/)![1];
    expect(matches(re, "Volkswagen Up")).toBe(true);
    expect(matches(re, "VW Gol")).toBe(true);
  });
  it("'cf moto' encuentra la marca cfmoto", () => {
    const filters = buildKeywordFilters("cf moto");
    expect(filters).toHaveLength(1);
    const re = filters[0].match(/attributes->>brand\.imatch\."([^"]+)"/)![1];
    expect(matches(re, "cfmoto")).toBe(true);
  });
});
