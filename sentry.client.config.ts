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
    // Errores de extensiones de navegador
    /^chrome-extension:/,
    /^safari-extension:/,
  ],
  enabled: process.env.NODE_ENV === "production",
});
