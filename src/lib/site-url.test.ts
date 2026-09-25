import { afterEach, describe, expect, it, vi } from "vitest";

// publicAppUrl lee la variable en cada llamada; SITE_URL se calcula al importar (sin NEXT_PUBLIC_SITE_URL
// en los tests queda el dominio por defecto).
const load = async () => (await import("./site-url")).publicAppUrl;

describe("publicAppUrl", () => {
  afterEach(() => { vi.unstubAllEnvs(); });

  it("tolera comillas, espacios y barras de más (el caso de Railway)", async () => {
    const publicAppUrl = await load();
    vi.stubEnv("NEXT_PUBLIC_APP_URL", '"https://cuyorodados.com.ar');
    expect(publicAppUrl()).toBe("https://cuyorodados.com.ar");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", ' "https://cuyorodados.com.ar/" ');
    expect(publicAppUrl()).toBe("https://cuyorodados.com.ar");
  });

  it("agrega https:// si falta", async () => {
    const publicAppUrl = await load();
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "cuyorodados.com.ar");
    expect(publicAppUrl()).toBe("https://cuyorodados.com.ar");
  });

  it("localhost o vacío → dominio público (Mercado Pago no acepta localhost)", async () => {
    const publicAppUrl = await load();
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    expect(publicAppUrl()).toBe("https://cuyorodados.com.ar");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    expect(publicAppUrl()).toBe("https://cuyorodados.com.ar");
  });
});
