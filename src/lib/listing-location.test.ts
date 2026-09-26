import { describe, expect, it } from "vitest";
import { listingLocationFull, listingProvince } from "./listing-location";
import { RE_LOCATIONS } from "./re-locations";

// Los formatos que hay hoy en la base (ver comentario de listing-location.ts)
describe("ubicación del aviso", () => {
  it("provincia en city y localidad en neighborhood", () => {
    const l = { city: "San Juan", neighborhood: "Capital" };
    expect(listingProvince(l)).toBe("San Juan");
    expect(listingLocationFull(l)).toBe("Capital, San Juan");
  });

  it("\"Localidad, Provincia\" en neighborhood, con o sin city", () => {
    expect(listingProvince({ city: null, neighborhood: "Santa Lucía, San Juan" })).toBe("San Juan");
    expect(listingLocationFull({ city: "San Juan", neighborhood: "Albardón, San Juan" })).toBe("Albardón, San Juan");
  });

  it("solo el código de zona en attributes", () => {
    const zone = RE_LOCATIONS["san-juan"].zones[0];
    const l = { city: null, neighborhood: null, attributes: { zone: zone.value } };
    expect(listingProvince(l)).toBe("San Juan");
    expect(listingLocationFull(l)).toBe(`${zone.label}, San Juan`);
  });

  it("solo provincia, o nada", () => {
    expect(listingLocationFull({ city: "San Juan", neighborhood: null })).toBe("San Juan");
    expect(listingProvince({ city: null, neighborhood: null })).toBe("");
  });
});
