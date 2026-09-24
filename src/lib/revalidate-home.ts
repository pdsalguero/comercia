import { revalidatePath } from "next/cache";

/**
 * Refresca la home (y el caché de datos que usa) después de cambiar avisos: publicar, editar,
 * pausar, borrar, vencer un destacado, etc. La home se sirve desde caché y solo se regenera cada
 * 5 minutos; sin esta llamada un aviso pausado o borrado seguiría apareciendo hasta ese momento.
 *
 * Solo para el servidor (route handlers y server actions). Es el mismo `revalidatePath` que ya
 * usan publicar, el admin y los pagos.
 */
export function revalidateHome() {
  revalidatePath("/", "layout");
}
