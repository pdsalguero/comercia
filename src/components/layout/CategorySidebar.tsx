"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

interface Category {
  name: string;
  slug: string;
  icon: string;
  count: number;
}

interface CategorySidebarProps {
  categories: Category[];
}

export function CategorySidebar({ categories }: CategorySidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeSlug = searchParams.get("category") ?? "";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        position: "sticky",
        top: "76px",
      }}
    >
      {/* Categories list */}
      <div
        style={{
          background: "#fff",
          borderRadius: "14px",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid #f1f5f9",
            fontWeight: 700,
            fontSize: "13px",
            color: "#0f172a",
          }}
        >
          Categorías
        </div>

        {/* All */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <div
            style={{
              padding: "9px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid #f8fafc",
              cursor: "pointer",
              background: !activeSlug ? "#f0f4ff" : "#fff",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <CategoryIcon slug="other" size={18} />
              <span
                style={{
                  fontSize: "13px",
                  color: !activeSlug ? "#6366f1" : "#334155",
                  fontWeight: !activeSlug ? 700 : 400,
                }}
              >
                Todos
              </span>
            </div>
          </div>
        </Link>

        {categories.map((cat, i) => {
          const isActive = activeSlug === cat.slug;
          const isLast = i === categories.length - 1;
          return (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  padding: "9px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottom: isLast ? "none" : "1px solid #f8fafc",
                  cursor: "pointer",
                  background: isActive ? "#f0f4ff" : "#fff",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <CategoryIcon slug={cat.slug} size={18} />
                  <span
                    style={{
                      fontSize: "13px",
                      color: isActive ? "#6366f1" : "#334155",
                      fontWeight: isActive ? 700 : 400,
                    }}
                  >
                    {cat.name}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "10px",
                    color: isActive ? "#6366f1" : "#94a3b8",
                    background: isActive ? "#e0e7ff" : "#f1f5f9",
                    borderRadius: "4px",
                    padding: "1px 5px",
                    fontWeight: 600,
                  }}
                >
                  {cat.count}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Featured upsell */}
      <div
        style={{
          background: "linear-gradient(135deg, #fffbeb, #fef3c7)",
          border: "1px solid #fde68a",
          borderRadius: "14px",
          padding: "16px",
        }}
      >
        <div
          style={{
            fontWeight: 800,
            fontSize: "13px",
            color: "#92400e",
            marginBottom: "4px",
          }}
        >
          ⭐ Destacá tu aviso
        </div>
        <div
          style={{
            fontSize: "11px",
            color: "#b45309",
            lineHeight: 1.5,
            marginBottom: "10px",
          }}
        >
          Aparecé primero y recibí 5× más consultas que un aviso normal.
        </div>
        <Link href="/upgrade">
          <div
            style={{
              background: "linear-gradient(135deg, #f59e0b, #fbbf24)",
              color: "#fff",
              borderRadius: "7px",
              padding: "8px 0",
              fontWeight: 800,
              fontSize: "12px",
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            Ver planes
          </div>
        </Link>
      </div>
    </div>
  );
}
