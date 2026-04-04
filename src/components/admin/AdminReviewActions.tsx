"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminReviewActions({ reviewId }: { reviewId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleted, setDeleted] = useState(false);

  async function handleDelete() {
    if (!confirm("¿Eliminar esta reseña? Esta acción no se puede deshacer.")) return;
    setLoading(true);
    await fetch(`/api/admin/reviews/${reviewId}`, { method: "DELETE" });
    setLoading(false);
    setDeleted(true);
    router.refresh();
  }

  if (deleted) return <span style={{ fontSize: "11px", color: "#94a3b8" }}>Eliminada</span>;

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      style={{
        padding: "4px 10px", borderRadius: "6px", border: "none",
        fontSize: "11px", fontWeight: 600, cursor: loading ? "wait" : "pointer",
        background: "#fef2f2", color: "#ef4444",
      }}
    >
      {loading ? "..." : "Eliminar"}
    </button>
  );
}
