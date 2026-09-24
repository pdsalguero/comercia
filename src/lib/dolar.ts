export interface DolarQuote {
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

// Dólar oficial (BNA) desde dolarapi.com. Devuelve null si el servicio no responde: quien lo use
// tiene que poder mostrarse sin el dato.
export async function getDolarOficial(): Promise<DolarQuote | null> {
  try {
    const res = await fetch("https://dolarapi.com/v1/dolares/oficial", {
      next: { revalidate: 1800 }, // refresca cada 30 min
    });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data?.venta === "number" ? data : null;
  } catch {
    return null;
  }
}
