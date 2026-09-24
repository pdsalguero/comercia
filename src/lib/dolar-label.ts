// Texto de la cotización usada para pasar de dólares a pesos: "dólar oficial BNA (venta) $ 1.450 del 24/09, 15:00".
// La fecha se arma a mano (y no con toLocaleString) para que servidor y navegador den el mismo texto.
export function dolarQuoteLabel(venta: number, fechaActualizacion?: string | null): string {
  const amount = `$ ${Math.round(venta).toLocaleString("es-AR")}`;
  const d = fechaActualizacion ? new Date(fechaActualizacion) : null;
  if (!d || Number.isNaN(d.getTime())) return `dólar oficial BNA (venta) ${amount}`;
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
      timeZone: "America/Argentina/Buenos_Aires",
    }).formatToParts(d).map((p) => [p.type, p.value])
  );
  return `dólar oficial BNA (venta) ${amount} del ${parts.day}/${parts.month}, ${parts.hour}:${parts.minute}`;
}
