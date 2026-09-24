import { describe, expect, it } from "vitest";
import { normalizeUsernameInput, validateFullName, validateUsername } from "./registration";
import { parsePriceInput, MAX_PRICE } from "./price-input";
import { emptyResultsCopy } from "./empty-results";
import { defaultContactMessage, greetingName } from "./listing-display";
import { isKnownCategorySlug } from "./category-meta";

describe("registro", () => {
  it("nombre de al menos 2 caracteres (sin contar espacios)", () => {
    expect(validateFullName(" A ")).not.toBeNull();
    expect(validateFullName("Al")).toBeNull();
  });
  it("usuario de 3 a 20 caracteres", () => {
    expect(validateUsername("ab")).not.toBeNull();
    expect(validateUsername("abc")).toBeNull();
    expect(validateUsername("a".repeat(21))).not.toBeNull();
  });
  it("el usuario solo acepta minúsculas, números y guion bajo, hasta 20", () => {
    expect(normalizeUsernameInput("Juan.Pérez-99!")).toBe("juanprez99");
    expect(normalizeUsernameInput("x".repeat(30))).toHaveLength(20);
  });
});

describe("precio al publicar", () => {
  it("'1.500.000,50' se guarda como 1500000 y avisa (antes quedaba 150000050)", () => {
    expect(parsePriceInput("1.500.000,50")).toEqual({ value: "1500000", droppedDecimals: true, capped: false });
  });
  it("miles con punto sin decimales", () => {
    expect(parsePriceInput("9.500.000")).toEqual({ value: "9500000", droppedDecimals: false, capped: false });
  });
  it("tope máximo", () => {
    expect(parsePriceInput("999999999999").value).toBe(String(MAX_PRICE));
    expect(parsePriceInput("999999999999").capped).toBe(true);
  });
  it("vacío y ceros a la izquierda", () => {
    expect(parsePriceInput("").value).toBe("");
    expect(parsePriceInput("0").value).toBe("0");
    expect(parsePriceInput("007").value).toBe("7");
  });
});

describe("estado vacío de resultados", () => {
  it("hay avisos de lo buscado pero los filtros los dejan afuera", () => {
    const c = emptyResultsCopy({ wanted: "Benelli", hasFilters: true, wantedCount: 2 });
    expect(c.title).toBe("No encontramos avisos con estos filtros");
    expect(c.canRelax).toBe(true);
  });
  it("de verdad no hay avisos de lo buscado", () => {
    const c = emptyResultsCopy({ wanted: "Ferrari", hasFilters: true, wantedCount: 0, province: "Mendoza" });
    expect(c.title).toBe("Todavía no hay avisos de Ferrari en Mendoza");
    expect(c.canRelax).toBe(false);
  });
});

describe("mensaje al contactar", () => {
  it("usa el primer nombre sin espacios de más: nada de 'Morales , estoy'", () => {
    expect(greetingName("Diego Morales ")).toBe("Diego");
    expect(defaultContactMessage("Diego Morales ", "Benelli TRK 502 X")).toBe(
      'Hola Diego, estoy interesado en tu publicación "Benelli TRK 502 X". ¿Sigue disponible?',
    );
  });
  it("con usuario (@) o sin nombre", () => {
    expect(greetingName("@juanperez")).toBe("@juanperez");
    expect(defaultContactMessage("", "Up")).toMatch(/^Hola, estoy interesado/);
  });
});

describe("categorías", () => {
  it("un slug inexistente no es categoría (404)", () => {
    expect(isKnownCategorySlug("vehicles")).toBe(true);
    expect(isKnownCategorySlug("inexistente")).toBe(false);
    expect(isKnownCategorySlug("constructor")).toBe(false);
  });
});
