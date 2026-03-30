// Tipos globales para window.gtag (inyectado por @next/third-parties/google)
interface Window {
  gtag: (
    command: "event" | "config" | "set",
    targetOrAction: string,
    params?: Record<string, string | number | boolean>
  ) => void;
}
