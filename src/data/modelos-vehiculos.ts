/**
 * Modelos de vehículos por marca (slug de attrs.brand) y tipo.
 * Los datos viven en el catálogo generado (src/data/catalogo/), que une las listas que tenía el sitio,
 * la tabla de valuación DNRPA y agregados manuales: ver tools/catalogo-vehiculos/README.md.
 * Este archivo solo lo usa el servidor (/api/vehiculos/modelos): el listado de modelos es pesado.
 */
import { MODELOS_CATALOGO } from "@/data/catalogo/modelos.generated";
import type { TipoCatalogo } from "@/data/catalogo/marcas.generated";

export function getModelosPorMarca(brandSlug: string, tipo: TipoCatalogo): string[] {
  return MODELOS_CATALOGO[tipo]?.[brandSlug] ?? [];
}
