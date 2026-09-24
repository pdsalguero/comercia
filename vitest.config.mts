import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Tests unitarios de lógica pura (src/**/*.test.ts). No tocan la base: .env.local apunta a producción.
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
