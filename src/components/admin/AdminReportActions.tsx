"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  reportId: string;
  currentStatus: string;
}

export function AdminReportActions({ reportId, currentStatus }: Props) {
  const router  = useRouter();
  const [status, setStatus]   = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const update = async (newStatus: string) => {
    setLoading(true);
    await fetch(`/api/admin/reports/${reportId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setStatus(newStatus);
    setLoading(false);
    router.refresh();
  };

  if (loading) return <span style={{ fontSize: "11px", color: "#94a3b8" }}>...</span>;

  if (status === "reviewed") {
    return (
      <div style={{ display: "flex", gap: "6px" }}>
        <span style={{ fontSize: "11px", fontWeight: 700, color: "#10b981", background: "#ecfdf5", padding: "3px 8px", borderRadius: "6px" }}>Revisado</span>
        <button onClick={() => update("dismissed")} style={{ padding: "3px 8px", border: "none", borderRadius: "6px", fontSize: "11px", fontWeight: 600, cursor: "pointer", background: "#f1f5f9", color: "#64748b" }}>
          Desestimar
        </button>
      </div>
    );
  }

  if (status === "dismissed") {
    return (
      <div style={{ display: "flex", gap: "6px" }}>
        <span style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", background: "#f1f5f9", padding: "3px 8px", borderRadius: "6px" }}>Desestimado</span>
        <button onClick={() => update("pending")} style={{ padding: "3px 8px", border: "none", borderRadius: "6px", fontSize: "11px", fontWeight: 600, cursor: "pointer", background: "#f1f5f9", color: "#64748b" }}>
          Reabrir
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: "6px" }}>
      <button
        onClick={() => update("reviewed")}
        style={{ padding: "4px 10px", border: "none", borderRadius: "6px", fontSize: "11px", fontWeight: 600, cursor: "pointer", background: "#dcfce7", color: "#15803d" }}
      >
        Marcar revisado
      </button>
      <button
        onClick={() => update("dismissed")}
        style={{ padding: "4px 10px", border: "none", borderRadius: "6px", fontSize: "11px", fontWeight: 600, cursor: "pointer", background: "#f1f5f9", color: "#64748b" }}
      >
        Desestimar
      </button>
    </div>
  );
}
