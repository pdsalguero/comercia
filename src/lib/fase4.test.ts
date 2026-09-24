import { describe, expect, it } from "vitest";
import { closestLandingPath, isIndexableLanding, landingPath, parseLandingPath, vehiclesHref } from "./vehicle-landing";

describe("landings limpias del listado", () => {
  it("arma el path desde tipo, marca y provincia", () => {
    expect(landingPath({ type: "moto" })).toBe("/motos");
    expect(landingPath({ type: "camioneta" })).toBe("/pickups-suv");
    expect(landingPath({ type: "moto", brand: "benelli" })).toBe("/motos/benelli");
    expect(landingPath({ type: "auto", province: "san-juan" })).toBe("/autos/san-juan");
    expect(landingPath({ type: "auto", brand: "mercedes_benz", province: "mendoza" })).toBe("/autos/mercedes-benz/mendoza");
  });

  it("no inventa landings para combinaciones sin página", () => {
    expect(landingPath({ type: "nautica" })).toBeNull();
    expect(landingPath({ brand: "toyota" })).toBeNull();
    expect(landingPath({ type: "auto", brand: "marca-inexistente" })).toBeNull();
    expect(landingPath({ type: "auto", province: "narnia" })).toBeNull();
  });

  it("lee el path de vuelta", () => {
    expect(parseLandingPath("/motos")).toEqual({ type: "moto" });
    expect(parseLandingPath("/motos/benelli")).toEqual({ type: "moto", brand: "benelli" });
    expect(parseLandingPath("/autos/san-juan")).toEqual({ type: "auto", province: "san-juan" });
    expect(parseLandingPath("/autos/mercedes-benz/mendoza")).toEqual({ type: "auto", brand: "mercedes_benz", province: "mendoza" });
    expect(parseLandingPath("/autos/")).toEqual({ type: "auto" });
  });

  it("ignora rutas que no son landings", () => {
    for (const p of ["/", "/listings/123", "/category/vehicles", "/motos/no-existe", "/autos/toyota/narnia", "/autos/toyota/mendoza/extra", "/tiendas"]) {
      expect(parseLandingPath(p)).toBeNull();
    }
  });

  it("los links internos usan la URL limpia y dejan el resto como query", () => {
    expect(vehiclesHref({ type: "moto", brand: "benelli" })).toBe("/motos/benelli");
    expect(vehiclesHref({ type: "moto", brand: "benelli", price_max: "5000000" })).toBe("/motos/benelli?price_max=5000000");
    expect(vehiclesHref(new URLSearchParams("type=auto&v_province=san-juan&page=2"))).toBe("/autos/san-juan?page=2");
    expect(vehiclesHref({ type: "nautica" })).toBe("/category/vehicles?type=nautica");
    expect(vehiclesHref({ q: "hilux" })).toBe("/category/vehicles?q=hilux");
    expect(vehiclesHref({})).toBe("/category/vehicles");
  });

  it("solo la landing sola (o paginada) es indexable", () => {
    expect(isIndexableLanding({ type: "moto" })).toBe(true);
    expect(isIndexableLanding({ type: "moto", brand: "benelli", page: "2" })).toBe(true);
    expect(isIndexableLanding({ type: "moto", price_max: "100" })).toBe(false);
    expect(isIndexableLanding({ type: "moto", order: "price_asc" })).toBe(false);
    expect(isIndexableLanding({ type: "nautica" })).toBe(false);
    expect(isIndexableLanding({ q: "hilux" })).toBe(false);
  });

  it("el canonical de un listado filtrado apunta a la landing más cercana", () => {
    expect(closestLandingPath({ type: "moto", brand: "benelli", price_max: "100" })).toBe("/motos/benelli");
    expect(closestLandingPath({ type: "auto", brand: "toyota", v_province: "san-juan", fuel: "diesel" })).toBe("/autos/toyota/san-juan");
    expect(closestLandingPath({ type: "auto", brand: "marca-rara" })).toBe("/autos");
    expect(closestLandingPath({ q: "hilux" })).toBeNull();
  });
});
