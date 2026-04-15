"use client";

import { useEffect, useRef, useState } from "react";
import { useHomeProvince } from "@/components/listings/HomeProvinceContext";
import { CategorySidebar } from "./CategorySidebar";

interface Category {
  name: string;
  slug: string;
  icon: string;
  id: number;
  count: number;
  active?: boolean;
}

export function HomeCategorySidebar({
  initialCategories,
}: {
  initialCategories: Category[];
}) {
  const { province } = useHomeProvince();
  const allCategories = useRef(initialCategories);
  const [categories, setCategories] = useState(initialCategories);

  useEffect(() => {
    if (!province) {
      setCategories(allCategories.current);
      return;
    }

    fetch(`/api/listings/category-counts?province=${encodeURIComponent(province)}`)
      .then((r) => r.json())
      .then((counts: Record<number, number>) => {
        setCategories(
          allCategories.current.map((cat) => ({
            ...cat,
            count: counts[cat.id] ?? 0,
          }))
        );
      })
      .catch(() => {});
  }, [province]);

  return <CategorySidebar categories={categories} province={province || undefined} />;
}
