import Link from "next/link";

export async function RightSidebar({ showPublicar = true }: { showPublicar?: boolean }) {
  if (!showPublicar) return null;

  return (
    <aside style={{ display: "flex", flexDirection: "column", gap: "14px", width: "240px", flexShrink: 0 }}>

      {/* Publicar con IA */}
      <div style={{
        background: "linear-gradient(160deg, #1e1b4b 0%, #312e81 60%, #4c1d95 100%)",
        borderRadius: "14px", padding: "20px 16px",
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: "10px", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", width: "100px", height: "100px", background: "rgba(249,115,22,0.2)", borderRadius: "50%", top: "-30px", right: "-20px", filter: "blur(35px)" }} />
        <div style={{ fontSize: "36px", lineHeight: 1 }}>📸</div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "15px", fontWeight: 900, color: "#fff", marginBottom: "4px" }}>Publicá con IA</div>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>
            Sacá una foto de tu producto<br />y generamos todo el aviso<br />automáticamente
          </div>
        </div>
        <Link href="/listings/new" style={{ width: "100%" }}>
          <button style={{
            width: "100%", background: "linear-gradient(135deg,#f97316,#fb923c)",
            color: "#fff", border: "none", borderRadius: "9px",
            padding: "11px 0", fontWeight: 800, fontSize: "13px",
            cursor: "pointer", boxShadow: "0 4px 14px rgba(249,115,22,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
          }}>
            📸 Subir foto
          </button>
        </Link>
        <div style={{ display: "flex", gap: "10px" }}>
          {["✓ Gratis", "✓ 30 seg."].map(t => (
            <span key={t} style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>{t}</span>
          ))}
        </div>
      </div>

    </aside>
  );
}
