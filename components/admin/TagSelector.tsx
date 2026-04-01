"use client";

import type { Tag } from "@/types/recipe";

interface TagSelectorProps {
  value: string[];
  onChange: (ids: string[]) => void;
  tags: Tag[];
}

const CATEGORY_LABELS: Record<string, string> = {
  meal_type: "Meal Type",
  diet_type: "Diet",
  season: "Season",
  other: "Other",
};

export function TagSelector({ value, onChange, tags }: TagSelectorProps) {
  const visibleTags = tags.filter((t) => t.category !== "ingredient");

  const grouped = visibleTags.reduce<Record<string, Tag[]>>((acc, tag) => {
    const cat = tag.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(tag);
    return acc;
  }, {});

  function toggle(id: string) {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  }

  const categoryOrder = ["meal_type", "diet_type", "season", "other"];

  return (
    <div className="flex flex-col gap-6">
      {categoryOrder
        .filter((cat) => grouped[cat] && grouped[cat].length > 0)
        .map((cat) => (
          <div key={cat}>
            <p
              className="text-xs tracking-widest uppercase font-[family-name:var(--font-display)] mb-3"
              style={{ color: "#232120", opacity: 0.5 }}
            >
              {CATEGORY_LABELS[cat] ?? cat}
            </p>
            <div className="flex flex-wrap gap-2">
              {grouped[cat].map((tag) => {
                const selected = value.includes(tag.id);
                return (
                  <label
                    key={tag.id}
                    className="flex items-center gap-2 px-3 py-2 cursor-pointer text-sm font-[family-name:var(--font-display)] transition-all"
                    style={{
                      border: selected
                        ? "1px solid #c4622d"
                        : "1px solid rgba(35,33,32,0.25)",
                      color: selected ? "#c4622d" : "#232120",
                      backgroundColor: selected
                        ? "rgba(196,98,45,0.05)"
                        : "transparent",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggle(tag.id)}
                      className="sr-only"
                    />
                    {tag.label}
                  </label>
                );
              })}
            </div>
          </div>
        ))}
    </div>
  );
}
