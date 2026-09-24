"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  /** Estilo del input; se le agrega lugar a la derecha para el botón. */
  style?: React.CSSProperties;
};

// Campo de contraseña con botón "Mostrar / Ocultar". El botón queda fuera del orden de envío del
// formulario (type="button") y anuncia su estado con aria-pressed.
export function PasswordInput({ style, ...props }: Props) {
  const [visible, setVisible] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input {...props} type={visible ? "text" : "password"} style={{ ...style, paddingRight: "48px" }} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        aria-pressed={visible}
        style={{
          position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)",
          width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center",
          background: "none", border: "none", cursor: "pointer", color: "#64748b", padding: 0,
        }}
      >
        {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
      </button>
    </div>
  );
}
