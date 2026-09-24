"use client";

import { useEffect, useRef } from "react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  /** id del título del modal (aria-labelledby). */
  labelledBy: string;
  children: React.ReactNode;
  /** Ancho máximo del panel. */
  maxWidth?: string;
  /** Alineación vertical del panel dentro de la pantalla. */
  align?: "center" | "top";
}

// Modal accesible sobre el <dialog> nativo con showModal(), sin dependencias:
// - el navegador lo pone en la capa superior (nada lo tapa, ni la barra fija) y vuelve inerte el resto
//   de la página, así que el foco queda atrapado adentro y aria-modal va implícito;
// - Escape dispara "cancel" → onClose;
// - al abrir, el foco va al primer elemento con data-autofocus (o al primero enfocable);
// - al cerrar, el foco vuelve al elemento que lo abrió.
// El contenido se renderiza solo con el modal abierto, así cada apertura arranca limpia.
export function Dialog({ open, onClose, labelledBy, children, maxWidth = "440px", align = "center" }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      opener.current = document.activeElement as HTMLElement | null;
      d.showModal();
      const target = d.querySelector<HTMLElement>("[data-autofocus]");
      target?.focus();
    } else if (!open && d.open) {
      d.close();
    }
  }, [open]);

  // Al cerrarse (por cualquier vía) el foco vuelve al botón que lo abrió
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onClosed = () => { opener.current?.focus?.(); opener.current = null; };
    d.addEventListener("close", onClosed);
    return () => d.removeEventListener("close", onClosed);
  }, []);

  return (
    <dialog
      ref={ref}
      className="app-dialog"
      aria-labelledby={labelledBy}
      aria-modal="true"
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      // Click en el fondo (fuera del panel): el target es el propio <dialog>
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
      style={{
        padding: 0, border: "none", background: "transparent",
        width: `min(${maxWidth}, calc(100vw - 32px))`, maxWidth: "none",
        maxHeight: "calc(100dvh - 32px)", overflow: "visible",
        margin: align === "top" ? "max(16px, 5dvh) auto auto" : "auto",
      }}
    >
      {open && children}
    </dialog>
  );
}
