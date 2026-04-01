"use client";

import { useState, useMemo, useCallback } from "react";
import { RecipeCard } from "./RecipeCard";
import { RecipeDetailPanel } from "./RecipeDetailPanel";
import type { RecipeWithTags } from "@/types/recipe";

interface RecipeBrowserProps {
  recipes: RecipeWithTags[];
}

type SortKey = "most_viewed" | "most_recent";

const MEAL_TYPE_SLUGS = ["breakfast", "lunch", "dinner", "side-dishes", "appetizers", "snack", "dessert", "drinks"];
const DIET_TYPE_SLUGS = ["vegetarian", "vegan", "gluten-free", "dairy-free", "grain-free", "low-carb", "nut-free", "paleo-friendly"];

export function RecipeBrowser({ recipes }: RecipeBrowserProps) {
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortKey>("most_viewed");
  const [selected, setSelected] = useState<RecipeWithTags | null>(null);

  // All unique meal+diet tags present in published recipes
  const filterTags = useMemo(() => {
    const seen = new Map<string, { slug: string; label: string; category: string }>();
    for (const recipe of recipes) {
      for (const tag of recipe.tags) {
        if (tag.category === "meal_type" || tag.category === "diet_type") {
          seen.set(tag.slug, tag);
        }
      }
    }
    const meal = [...seen.values()].filter((t) => t.category === "meal_type")
      .sort((a, b) => MEAL_TYPE_SLUGS.indexOf(a.slug) - MEAL_TYPE_SLUGS.indexOf(b.slug));
    const diet = [...seen.values()].filter((t) => t.category === "diet_type")
      .sort((a, b) => DIET_TYPE_SLUGS.indexOf(a.slug) - DIET_TYPE_SLUGS.indexOf(b.slug));
    return [...meal, ...diet];
  }, [recipes]);

  const isFiltering = search.trim().length > 0 || activeFilters.length > 0;

  // Hero: 2 most recently added (only shown when not filtering)
  const heroRecipes = useMemo(
    () =>
      [...recipes]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 2),
    [recipes]
  );

  const filteredSorted = useMemo(() => {
    let list = [...recipes];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.tags.some((t) => t.label.toLowerCase().includes(q)) ||
          (r.highlight ?? "").toLowerCase().includes(q)
      );
    }

    if (activeFilters.length > 0) {
      list = list.filter((r) => r.tags.some((t) => activeFilters.includes(t.slug)));
    }

    list.sort((a, b) => {
      if (sortBy === "most_viewed") return b.view_count - a.view_count;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return list;
  }, [recipes, search, activeFilters, sortBy]);

  function toggleFilter(slug: string) {
    setActiveFilters((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }

  const handleTagFilter = useCallback((tagSlug: string) => {
    setSelected(null);
    setActiveFilters([tagSlug]);
  }, []);

  const panelOpen = selected !== null;

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 0px)" }}>
      {/* ── Header ─────────────────────────────────── */}
      <header
        className="flex-shrink-0 flex items-center justify-between px-6 py-4"
      >
        <h1
          className="text-2xl font-light tracking-wide"
          style={{ fontFamily: "var(--font-display)" }}
        >
          The Salt
        </h1>
        <p
          className="text-sm font-light hidden sm:block"
          style={{ fontFamily: "var(--font-display)", color: "rgba(35,33,32,0.45)" }}
        >
          A curated recipe collection
        </p>
      </header>

      {/* ── Body ───────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left panel */}
        <div
          className="flex-shrink-0 overflow-y-auto transition-all duration-300"
          style={{ width: panelOpen ? "clamp(340px, 40%, 480px)" : "100%" }}
        >
          {/* Search + filters */}
          <div
            className="sticky top-0 z-10 px-6 py-4"
            style={{ backgroundColor: "#f2f0eb" }}
          >
            {/* Search bar */}
            <div className="relative mb-3">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                style={{ color: "rgba(35,33,32,0.35)" }}
              >
                <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2" />
                <line x1="9.5" y1="9.5" x2="12.5" y2="12.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search recipes…"
                className="w-full pl-9 pr-4 py-2.5 text-sm font-light outline-none transition-colors"
                style={{
                  fontFamily: "var(--font-display)",
                  backgroundColor: "transparent",
                  border: "1px solid rgba(35,33,32,0.12)",
                  color: "#232120",
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-60"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(35,33,32,0.4)" }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter chips + sort */}
            <div className="flex items-center gap-2 flex-wrap">
              {filterTags.map((tag) => {
                const active = activeFilters.includes(tag.slug);
                return (
                  <button
                    key={tag.slug}
                    onClick={() => toggleFilter(tag.slug)}
                    className={`filter-tag text-xs uppercase px-3 py-1 border${active ? " filter-tag-active" : ""}`}
                    style={{ fontFamily: "var(--font-display)", letterSpacing: "0.06em" }}
                  >
                    {tag.label}
                  </button>
                );
              })}

              {/* Sort */}
              <div className="ml-auto relative inline-flex items-center flex-shrink-0">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortKey)}
                  className="appearance-none text-xs tracking-wide uppercase pl-3 pr-6 py-1 transition-opacity hover:opacity-75 outline-none"
                  style={{
                    fontFamily: "var(--font-display)",
                    border: "1px solid rgba(35,33,32,0.2)",
                    color: "rgba(35,33,32,0.55)",
                    backgroundColor: "transparent",
                    cursor: "pointer",
                    letterSpacing: "0.06em",
                  }}
                >
                  <option value="most_viewed">Most viewed</option>
                  <option value="most_recent">Most recent</option>
                </select>
                <svg
                  className="pointer-events-none absolute right-2"
                  width="8" height="8" viewBox="0 0 9 9" fill="none"
                  style={{ color: "rgba(35,33,32,0.4)" }}
                >
                  <path d="M1.5 3L4.5 6L7.5 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* Recipe content */}
          <div className="px-6 py-8">
            {filteredSorted.length === 0 ? (
              <p
                className="text-lg font-light italic text-center py-16"
                style={{ fontFamily: "var(--font-display)", color: "rgba(35,33,32,0.35)" }}
              >
                No recipes found.
              </p>
            ) : isFiltering ? (
              /* Filtered grid */
              <div className={`grid gap-6 ${panelOpen ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
                {filteredSorted.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onClick={() => setSelected(recipe)}
                    isSelected={selected?.id === recipe.id}
                  />
                ))}
              </div>
            ) : (
              <>
                {/* Hero row — 2 most recent */}
                {heroRecipes.length > 0 && (
                  <div className={`grid gap-6 mb-10 ${panelOpen || heroRecipes.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
                    {heroRecipes.map((recipe) => (
                      <RecipeCard
                        key={recipe.id}
                        recipe={recipe}
                        onClick={() => setSelected(recipe)}
                        isSelected={selected?.id === recipe.id}
                        hero
                      />
                    ))}
                  </div>
                )}

                {/* Divider */}
                {heroRecipes.length > 0 && filteredSorted.length > 2 && (
                  <div className="flex items-center gap-4 mb-8">
                    <hr className="flex-1" style={{ border: "none", borderTop: "1px solid rgba(35,33,32,0.1)" }} />
                    <span
                      className="text-xs tracking-widest uppercase flex-shrink-0"
                      style={{ fontFamily: "var(--font-display)", color: "rgba(35,33,32,0.3)" }}
                    >
                      All recipes
                    </span>
                    <hr className="flex-1" style={{ border: "none", borderTop: "1px solid rgba(35,33,32,0.1)" }} />
                  </div>
                )}

                {/* Grid sorted by most viewed — exclude the hero recipes */}
                {(() => {
                  const heroIds = new Set(heroRecipes.map((r) => r.id));
                  const gridRecipes = filteredSorted.filter((r) => !heroIds.has(r.id));
                  if (gridRecipes.length === 0) return null;
                  return (
                    <div className={`grid gap-6 ${panelOpen ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
                      {gridRecipes.map((r) => (
                        <RecipeCard
                          key={r.id}
                          recipe={r}
                          onClick={() => setSelected(r)}
                          isSelected={selected?.id === r.id}
                        />
                      ))}
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        </div>

        {/* Right panel — desktop */}
        <div
          className="hidden lg:flex flex-col overflow-hidden transition-all duration-300 flex-1"
          style={{
            borderLeft: panelOpen ? "1px solid rgba(35,33,32,0.1)" : "none",
            minWidth: panelOpen ? 0 : undefined,
            display: panelOpen ? undefined : "none",
          }}
        >
          {selected && (
            <RecipeDetailPanel
              key={selected.id}
              recipe={selected}
              allRecipes={recipes}
              onClose={() => setSelected(null)}
              onSelectRecipe={setSelected}
              onTagFilter={handleTagFilter}
            />
          )}
        </div>
      </div>

      {/* Mobile overlay — slides in from right */}
      {selected && (
        <div
          className="lg:hidden fixed inset-0 z-50 overflow-y-auto"
          style={{ backgroundColor: "#f2f0eb" }}
        >
          <RecipeDetailPanel
            key={selected.id}
            recipe={selected}
            allRecipes={recipes}
            onClose={() => setSelected(null)}
            onSelectRecipe={setSelected}
            onTagFilter={handleTagFilter}
          />
        </div>
      )}
    </div>
  );
}
