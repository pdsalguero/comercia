import { describe, expect, it } from "vitest";
import { fuelLabel, normalizeSpecValue, plural, timeAgo, transmissionLabel, conditionLabel } from "./labels";
import { canonicalModel, sameModel } from "./model-normalize";
import { sortProvinces } from "./region";
import { brandLabel } from "./brand-label";
import { dolarQuoteLabel } from "./dolar-label";

describe("etiquetas de combustible y transmisión", () => {
  it("guarda sin tildes lo que venga escrito de cualquier forma", () => {
    expect(normalizeSpecValue("fuel", "Diésel")).toBe("diesel");
    expect(normalizeSpecValue("fuel", "diésel")).toBe("diesel");
    expect(normalizeSpecValue("fuel", "Nafta + GNC")).toBe("nafta_gnc");
    expect(normalizeSpecValue("fuel", "nafta+gnc")).toBe("nafta_gnc");
    expect(normalizeSpecValue("fuel", "Eléctrico")).toBe("electrico");
    expect(normalizeSpecValue("transmission", "automática")).toBe("automatica");
    expect(normalizeSpecValue("transmission", "Automático")).toBe("automatica");
    expect(normalizeSpecValue("fuel", "")).toBe("");
  });

  it("muestra una sola etiqueta, también para valores viejos", () => {
    expect(fuelLabel("diesel")).toBe("Diésel");
    expect(fuelLabel("diésel")).toBe("Diésel");
    expect(transmissionLabel("automatica")).toBe("Automática");
    expect(conditionLabel("very_good")).toBe("Muy bueno");
    expect(fuelLabel(undefined)).toBe("");
  });
});

describe("plural", () => {
  it("usa singular solo para 1", () => {
    expect(plural(1, "publicación", "publicaciones")).toBe("1 publicación");
    expect(plural(0, "publicación", "publicaciones")).toBe("0 publicaciones");
    expect(plural(1250, "vista", "vistas")).toBe("1.250 vistas");
  });
});

describe("timeAgo", () => {
  const now = new Date("2026-09-24T12:00:00Z");
  const ago = (ms: number) => new Date(now.getTime() - ms).toISOString();
  it("tiene un solo formato", () => {
    expect(timeAgo(ago(20_000), now)).toBe("recién");
    expect(timeAgo(ago(60_000), now)).toBe("hace 1 minuto");
    expect(timeAgo(ago(3 * 3_600_000), now)).toBe("hace 3 horas");
    expect(timeAgo(ago(86_400_000), now)).toBe("hace 1 día");
    expect(timeAgo(ago(150 * 86_400_000), now)).toBe("hace 5 meses");
    expect(timeAgo(ago(800 * 86_400_000), now)).toBe("hace 2 años");
  });
});

describe("modelo", () => {
  const catalog = ["Hilux", "SW4", "Corolla Cross", "Up!"];
  it("normaliza contra el catálogo ignorando mayúsculas, espacios y guiones", () => {
    expect(canonicalModel(" hi-lux ", catalog)).toBe("Hilux");
    expect(canonicalModel("HILUX", catalog)).toBe("Hilux");
    expect(canonicalModel("corolla  cross", catalog)).toBe("Corolla Cross");
    expect(canonicalModel("sw 4", catalog)).toBe("SW4");
  });
  it("si no está en el catálogo guarda lo escrito, limpio", () => {
    expect(canonicalModel("  Hilux   GR  Sport ", catalog)).toBe("Hilux GR Sport");
    expect(canonicalModel("", catalog)).toBe("");
  });
  it("compara modelos para filtrar", () => {
    expect(sameModel("Hilux", "hi-lux")).toBe(true);
    expect(sameModel("Hilux", "Hilux SRV")).toBe(false);
    expect(sameModel("", "")).toBe(false);
  });
});

describe("provincias", () => {
  it("Cuyo primero y el resto alfabético", () => {
    const sorted = sortProvinces(["Tucumán", "San Luis", "Buenos Aires", "Mendoza", "Córdoba", "San Juan", "CABA"], (p) => p);
    expect(sorted).toEqual(["Mendoza", "San Juan", "San Luis", "Buenos Aires", "CABA", "Córdoba", "Tucumán"]);
  });
});

describe("marca", () => {
  it("usa el nombre del catálogo", () => {
    expect(brandLabel("cfmoto")).toBe("CFMoto");
    expect(brandLabel("marca_rara")).toBe("Marca Rara");
  });
});

describe("cotización del dólar", () => {
  it("dice qué dólar y de cuándo", () => {
    expect(dolarQuoteLabel(1450.5, "2026-09-24T18:00:00.000Z")).toBe("dólar oficial BNA (venta) $ 1.451 del 24/09, 15:00");
    expect(dolarQuoteLabel(1450, null)).toBe("dólar oficial BNA (venta) $ 1.450");
  });
});
