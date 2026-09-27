import { describe, expect, it } from "vitest";
import { dnrpaValuation } from "./dnrpa-valuation";

const data = {
  vigencia: "04/09/2026",
  valores: {
    "volkswagen|UP": { "2015": [9262000, 13536700] as [number, number] },
    "cfmoto|800MTSPORT": { "2025": [15843200, 15843200] as [number, number] },
    "cfmoto|800MTEXPLOREEDITION": { "2025": [19208000, 19208000] as [number, number] },
    "benelli|TNT300": { "2017": [4862000, 4862000] as [number, number] },
    "benelli|TNT135": { "2017": [2000000, 2000000] as [number, number] },
  },
};

describe("valuación DNRPA", () => {
  it("modelo exacto, sin importar mayúsculas ni signos", () => {
    expect(dnrpaValuation("volkswagen", "Up!", 2015, data)).toEqual([9262000, 13536700]);
  });

  it("modelo de moto sin versión: rango entre las versiones que empiezan igual", () => {
    expect(dnrpaValuation("cfmoto", "800MT", "2025", data)).toEqual([15843200, 19208000]);
  });

  it("un prefijo corto o sin número no junta modelos distintos", () => {
    expect(dnrpaValuation("benelli", "TNT", 2017, data)).toBeNull();
  });

  it("sin dato para ese año o marca: null", () => {
    expect(dnrpaValuation("volkswagen", "Up", 2030, data)).toBeNull();
    expect(dnrpaValuation("fiat", "Up", 2015, data)).toBeNull();
  });
});
