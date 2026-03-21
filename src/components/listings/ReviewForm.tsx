"use client";

import { useState, useRef } from "react";
import { StarPicker } from "@/components/ui/StarRating";

const RATING_LABELS: Record<number, string> = {
  1: "Muy malo",
  2: "Malo",
  3: "Regular",
  4: "Bueno",
  5: "Excelente",
};

interface ReviewFormProps {
  sellerId: string;
  existingRating?: number;
  existingComment?: string;
  onSubmit: (formData: FormData) => Promise<{ error?: string }>;
}

export function ReviewForm({ sellerId, existingRating, existingComment, onSubmit }: ReviewFormProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(existingRating ?? 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (rating === 0) { setError("Seleccioná una cantidad de estrellas"); return; }
    setSaving(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("rating", String(rating));
    const result = await onSubmit(fd);
    setSaving(false);
    if (result?.error) { setError(result.error); return; }
    setDone(true);
    setTimeout(() => { setOpen(false); setDone(false); }, 1800);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          padding: "8px 16px", borderRadius: "8px",
          background: existingRating ? "#fffbeb" : "#f0fdf4",
          color: existingRating ? "#92400e" : "#15803d",
          border: `1.5px solid ${existingRating ? "#fde68a" : "#bbf7d0"}`,
          fontSize: "13px", fontWeight: 700, cursor: "pointer",
        }}
      >
        {existingRating ? (
          <>⭐ Editar tu calificación ({existingRating}/5)</>
        ) : (
          <>⭐ Calificar al vendedor</>
        )}
      </button>
    );
  }

  return (
    <div style={{
      background: "#fff",
      border: "1.5px solid #e2e8f0",
      borderRadius: "14px",
      padding: "20px 24px",
      maxWidth: "480px",
    }}>
      <div style={{ fontWeight: 800, fontSize: "16px", color: "#0f172a", marginBottom: "4px" }}>
        {existingRating ? "Editar calificación" : "Calificar al vendedor"}
      </div>
      <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px" }}>
        Tu opinión ayuda a otros compradores a tomar mejores decisiones.
      </p>

      {done ? (
        <div style={{ textAlign: "center", padding: "16px 0", fontSize: "15px", color: "#16a34a", fontWeight: 700 }}>
          ✅ ¡Calificación enviada!
        </div>
      ) : (
        <form ref={formRef} onSubmit={handleSubmit}>
          {/* Stars */}
          <div style={{ marginBottom: "12px" }}>
            <StarPicker value={rating} onChange={setRating} size={32} />
            {rating > 0 && (
              <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px", fontWeight: 600 }}>
                {RATING_LABELS[rating]}
              </div>
            )}
          </div>

          {/* Comment */}
          <textarea
            name="comment"
            defaultValue={existingComment}
            placeholder="Contá tu experiencia con este vendedor (opcional, máx. 500 caracteres)"
            maxLength={500}
            rows={3}
            style={{
              width: "100%", boxSizing: "border-box",
              border: "1.5px solid #e2e8f0", borderRadius: "8px",
              padding: "10px 12px", fontSize: "13px",
              resize: "vertical", outline: "none",
              fontFamily: "inherit", color: "#1e293b",
              marginBottom: "12px",
            }}
          />

          {error && (
            <div style={{ fontSize: "12px", color: "#dc2626", marginBottom: "10px" }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 1, padding: "10px",
                background: "linear-gradient(135deg,#6366f1,#3b82f6)",
                color: "#fff", border: "none", borderRadius: "8px",
                fontSize: "13px", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? "Enviando..." : existingRating ? "Actualizar" : "Publicar calificación"}
            </button>
            <button
              type="button"
              onClick={() => { setOpen(false); setError(null); }}
              style={{
                padding: "10px 16px", background: "#f1f5f9",
                color: "#64748b", border: "none", borderRadius: "8px",
                fontSize: "13px", fontWeight: 600, cursor: "pointer",
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
