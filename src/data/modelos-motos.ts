/**
 * Subtipos de moto y marcas de motos, cuatriciclos y UTV.
 * Las marcas salen del catálogo generado (src/data/catalogo/, ver tools/catalogo-vehiculos/README.md);
 * los modelos los sirve /api/vehiculos/modelos con getModelosPorMarca (src/data/modelos-vehiculos.ts).
 */
import { MARCAS_CATALOGO } from "@/data/catalogo/marcas.generated";

export const MOTO_SUBTIPOS = [
  { value: "clasicas",         label: "Clásicas" },
  { value: "chopper",          label: "Chopper" },
  { value: "crucero",          label: "Crucero" },
  { value: "custom",           label: "Custom" },
  { value: "deportivas",       label: "Deportivas" },
  { value: "doble_proposito",  label: "Doble propósito" },
  { value: "electrico",        label: "Electrico" },
  { value: "enduro_cross",     label: "Enduro/Cross" },
  { value: "mini_motos",       label: "Mini Motos" },
  { value: "motocarros",       label: "Motocarros" },
  { value: "naked",            label: "Naked" },
  { value: "on_off",           label: "On-Off" },
  { value: "scooters",         label: "Scooters" },
  { value: "calle",            label: "Calle" },
  { value: "touring",          label: "Touring" },
  { value: "triciclos",        label: "Triciclos" },
  { value: "otro",             label: "Otro" },
];

export const MOTO_BRANDS_LIST = MARCAS_CATALOGO.moto;
export const CUATRI_BRANDS_LIST = MARCAS_CATALOGO.cuatriciclo;
export const UTV_BRANDS_LIST = MARCAS_CATALOGO.utv;
