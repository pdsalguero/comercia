import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  // En producción bajamos el sample rate para no saturar la cuota
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
  // Replays solo en producción, muestra de 10% de sesiones / 100% de sesiones con error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [Sentry.replayIntegration()],
  ignoreErrors: [
    "canvas.contentDocument",
    "top.GLOBALS",
    "originalCreateNotification",
    "canvas.getContext",
    // Errores de extensiones de navegador (URL en stack)
    /^chrome-extension:/,
    /^safari-extension:/,
    /^moz-extension:/,
    // Chrome runtime: extensiones intentando comunicarse con su SW muerto
    "Could not establish connection. Receiving end does not exist",
    "The message port closed before a response was received",
    // ResizeObserver: falso positivo muy común en browsers con extensiones
    "ResizeObserver loop limit exceeded",
    "ResizeObserver loop completed with undelivered notifications",
  ],
  beforeSend(event) {
    // Descartar eventos cuyo stack trace provenga exclusivamente de extensiones
    const frames = event.exception?.values?.[0]?.stacktrace?.frames ?? [];
    if (
      frames.length > 0 &&
      frames.every(
        (f) =>
          f.filename?.startsWith("chrome-extension://") ||
          f.filename?.startsWith("moz-extension://") ||
          f.filename?.startsWith("safari-extension://") ||
          f.filename === "<anonymous>"
      )
    ) {
      return null;
    }
    return event;
  },
  enabled: process.env.NODE_ENV === "production",
});
