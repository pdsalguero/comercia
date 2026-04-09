"use client";

import dynamic from "next/dynamic";

const PropertyMap = dynamic(
  () => import("@/components/map/PropertyMap").then((m) => m.PropertyMap),
  {
    ssr: false,
    loading: () => (
      <div style={{ height: "280px", background: "#f1f5f9", borderRadius: "0 0 12px 12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "13px" }}>
        Cargando mapa…
      </div>
    ),
  }
);

export { PropertyMap };
