"use client";

export interface SubcatPill {
  name: string;
  href: string;
  count: number;
  active: boolean;
}

interface Props {
  pills: SubcatPill[];
  allHref: string;
  allCount: number;
  isAllActive: boolean;
}

export function SubcategoryPills({ pills, allHref, allCount, isAllActive }: Props) {
  if (pills.length === 0) return null;

  const pillStyle = (active: boolean): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    padding: "6px 12px",
    borderRadius: "20px",
    border: `1.5px solid ${active ? "#0f1b2d" : "#e2e8f0"}`,
    background: active ? "#0f1b2d" : "#fff",
    color: active ? "#fff" : "#475569",
    fontSize: "12px",
    fontWeight: 500,
    whiteSpace: "nowrap" as const,
    flexShrink: 0,
    cursor: "pointer",
    textDecoration: "none",
  });

  return (
    <div
      className="subcat-pills-bar"
      style={{
        display: "flex",
        gap: "7px",
        overflowX: "auto",
        scrollbarWidth: "none",
        msOverflowStyle: "none" as any,
        padding: "10px 12px 10px",
        background: "#fff",
        borderBottom: "1px solid #f0f0f0",
        borderRadius: "10px",
        marginBottom: "8px",
      }}
    >
      <a href={allHref} style={pillStyle(isAllActive)}>
        Todos
        <span style={{ opacity: 0.6, fontSize: "10px" }}>{allCount}</span>
      </a>

      {pills.map((pill) => (
        <a key={pill.href} href={pill.href} style={pillStyle(pill.active)}>
          {pill.name}
          <span style={{ opacity: 0.6, fontSize: "10px" }}>{pill.count}</span>
        </a>
      ))}
    </div>
  );
}
