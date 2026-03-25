"use client";

import PinIcon from "@/components/ui/PinIcon";

export interface ListingListCardProps {
  id: string;
  title: string;
  price: number | null;
  currency: string | null;
  featured_level: string | null;
  cover_image: string | null;
  condition: string | null;
  neighborhood: string | null;
  /** Optional attribute chips shown below the title (e.g. sub-category, brand, model) */
  breadcrumbs?: Array<{ label: string; variant?: "primary" | "secondary" }>;
  showDivider?: boolean;
}

const CONDITION_LABELS: Record<string, string> = {
  new: "Nuevo",
  like_new: "Como nuevo",
  very_good: "Muy bueno",
  good: "Bueno",
  fair: "Regular",
  used: "Usado",
};

export function ListingListCard({
  id,
  title,
  price,
  currency,
  featured_level,
  cover_image,
  condition,
  neighborhood,
  breadcrumbs,
  showDivider = true,
}: ListingListCardProps) {
  const isFeatured = !!featured_level;
  const priceStr =
    price && price > 0
      ? `${currency === "USD" ? "U$S" : "$"} ${price.toLocaleString("es-AR")}`
      : null;

  return (
    <a href={`/listings/${id}`} style={{ textDecoration: "none", display: "block" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          padding: "12px 16px",
          borderBottom: showDivider ? "1px solid #f1f5f9" : "none",
          background: "#ffffff",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
      >
        {/* Image */}
        <div style={{
          width: "140px",
          height: "110px",
          borderRadius: "8px",
          overflow: "hidden",
          flexShrink: 0,
          background: "#f0f4ff",
        }}>
          {cover_image
            ? <img src={cover_image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>📦</div>
          }
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title + Premium badge */}
          <div style={{
            fontSize: "14px", fontWeight: 600, color: "#1e293b",
            marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {isFeatured && (
              <span style={{
                fontSize: "10px", background: "#f59e0b", color: "#fff",
                borderRadius: "4px", padding: "1px 5px", fontWeight: 700, marginRight: "6px",
              }}>
                PREMIUM
              </span>
            )}
            {title}
          </div>

          {/* Breadcrumb chips */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div style={{ display: "flex", gap: "4px", alignItems: "center", flexWrap: "wrap", marginBottom: "4px" }}>
              {breadcrumbs.map((chip, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    borderRadius: "4px",
                    padding: "1px 6px",
                    ...(chip.variant === "primary"
                      ? { color: "#6366f1", background: "#eef2ff" }
                      : { color: "#475569", background: "#f1f5f9" }),
                  }}
                >
                  {chip.label}
                </span>
              ))}
            </div>
          )}

          {/* Condition + Location */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            {condition && CONDITION_LABELS[condition] && (
              <span style={{ fontSize: "11px", color: "#22c55e", fontWeight: 600 }}>
                {CONDITION_LABELS[condition]}
              </span>
            )}
            {neighborhood && (
              <span style={{ fontSize: "11px", color: "#94a3b8", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                <PinIcon size={10} /> {neighborhood}
              </span>
            )}
          </div>
        </div>

        {/* Price */}
        <div style={{ flexShrink: 0, textAlign: "right" }}>
          {priceStr
            ? <span style={{ fontSize: "16px", fontWeight: 800, color: "#f97316" }}>{priceStr}</span>
            : <span style={{ fontSize: "14px", fontWeight: 600, color: "#6366f1" }}>A consultar</span>
          }
        </div>
      </div>
    </a>
  );
}
