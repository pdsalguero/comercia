// Tipos de vehículo que admite el sitio (los mismos que ofrece el formulario de publicar
// en TIPOS_VEHICULO). Módulo liviano, sin imports: lo usan tanto el servidor como el navegador.
export const VEHICLE_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "auto",        label: "Autos" },
  { value: "camioneta",   label: "Pickups / SUV / Utilitarios" },
  { value: "moto",        label: "Motos" },
  { value: "cuatriciclo", label: "Cuatriciclos" },
  { value: "utv",         label: "Areneros / UTV" },
  { value: "camion",      label: "Camiones" },
  { value: "nautica",     label: "Náutica" },
  { value: "otro",        label: "Otros vehículos" },
];
