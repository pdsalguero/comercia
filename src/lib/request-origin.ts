// Origen público de un request (https://cuyorodados.com.ar), para armar redirecciones en route handlers.
//
// En Railway la app corre detrás de un proxy: `request.url` trae la dirección interna del contenedor
// (http://localhost:8080), y redirigir con eso manda al usuario a una página que no existe.
// El proxy informa el host y el protocolo reales en x-forwarded-host / x-forwarded-proto.
export function requestOrigin(request: Request): string {
  const url = new URL(request.url);
  const host = request.headers.get("x-forwarded-host")?.split(",")[0].trim() || request.headers.get("host") || url.host;
  const proto = request.headers.get("x-forwarded-proto")?.split(",")[0].trim() || url.protocol.replace(":", "");
  return `${proto}://${host}`;
}

/** Solo rutas internas: "//otro-sitio.com" o "https://…" convertirían un link de mail en una redirección abierta. */
export function safeNextPath(next: string | null | undefined, fallback = "/"): string {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : fallback;
}
