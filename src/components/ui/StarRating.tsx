"use client";

interface StarRatingProps {
  rating: number;       // 0–5, supports decimals for display
  count?: number;
  size?: number;
  showEmpty?: boolean;  // show grey stars when rating is 0
}

export function StarRating({ rating, count, size = 14, showEmpty = false }: StarRatingProps) {
  if (!showEmpty && (!rating || rating === 0)) return null;

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = rating >= i;
        const partial = !filled && rating > i - 1;
        const pct = partial ? Math.round((rating - (i - 1)) * 100) : 0;
        const gradId = `star-grad-${i}-${Math.random().toString(36).slice(2, 6)}`;

        return (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={filled ? "#f59e0b" : partial ? `url(#${gradId})` : "#e2e8f0"}
            stroke={filled || partial ? "#f59e0b" : "#cbd5e1"}
            strokeWidth="1.2"
          >
            {partial && (
              <defs>
                <linearGradient id={gradId}>
                  <stop offset={`${pct}%`} stopColor="#f59e0b" />
                  <stop offset={`${pct}%`} stopColor="#e2e8f0" />
                </linearGradient>
              </defs>
            )}
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
      })}
      {count !== undefined && (
        <span style={{ fontSize: size - 2, color: "#64748b", marginLeft: "4px" }}>
          {count > 0 ? `${rating.toFixed(1)} (${count})` : "Sin calificaciones"}
        </span>
      )}
    </div>
  );
}

/** Interactive star picker used inside the review form */
interface StarPickerProps {
  value: number;
  onChange: (v: number) => void;
  size?: number;
}

export function StarPicker({ value, onChange, size = 28 }: StarPickerProps) {
  return (
    <div style={{ display: "inline-flex", gap: "4px" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          style={{
            background: "none",
            border: "none",
            padding: "2px",
            cursor: "pointer",
            lineHeight: 1,
          }}
          title={`${i} estrella${i > 1 ? "s" : ""}`}
        >
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={value >= i ? "#f59e0b" : "#e2e8f0"}
            stroke={value >= i ? "#f59e0b" : "#cbd5e1"}
            strokeWidth="1.2"
            style={{ transition: "fill 0.1s, transform 0.1s", transform: value >= i ? "scale(1.1)" : "scale(1)" }}
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
    </div>
  );
}
