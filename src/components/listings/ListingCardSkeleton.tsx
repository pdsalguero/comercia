// Esqueleto con la misma forma que ListingCard: se muestra mientras cargan avisos (ej. al cambiar
// de provincia), en lugar de atenuar la grilla vieja.
export function ListingCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e8e8e8", overflow: "hidden", height: "100%" }}
    >
      <div className="skeleton" style={{ aspectRatio: "4 / 3" }} />
      <div style={{ padding: "12px 14px" }}>
        <div className="skeleton" style={{ height: "14px", width: "85%", borderRadius: "6px", marginBottom: "8px" }} />
        <div className="skeleton" style={{ height: "18px", width: "45%", borderRadius: "6px", marginBottom: "10px" }} />
        <div className="skeleton" style={{ height: "12px", width: "60%", borderRadius: "6px", marginBottom: "18px" }} />
        <div className="skeleton" style={{ height: "11px", width: "35%", borderRadius: "6px" }} />
      </div>
    </div>
  );
}
