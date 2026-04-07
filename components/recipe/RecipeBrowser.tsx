"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { getPhotoUrl } from "@/lib/storage/photos";
import { SITE_URL, UTM_SOURCE, UTM_MEDIUM, UTM_CAMPAIGN } from "@/lib/constants/config";
import type { RecipeWithTags } from "@/types/recipe";
import { SiteBanner } from "@/components/SiteBanner";

interface RecipeBrowserProps {
  recipes: RecipeWithTags[];
}

type SortKey = "most_viewed" | "most_recent";

const MEAL_TYPE_SLUGS = ["breakfast", "lunch", "dinner", "side-dishes", "appetizers", "snack", "dessert", "drinks"];
const DIET_TYPE_SLUGS = ["vegetarian", "vegan", "gluten-free", "dairy-free", "grain-free", "low-carb", "nut-free", "paleo-friendly"];

function RecipeCard({ recipe, hero = false }: { recipe: RecipeWithTags; hero?: boolean }) {
  const [shareCopied, setShareCopied] = useState(false);
  const primaryUrl = recipe.photo_primary ? getPhotoUrl(recipe.photo_primary) : null;
  const secondaryUrl = recipe.photo_secondary ? getPhotoUrl(recipe.photo_secondary) : null;
  const hasSwap = !!(primaryUrl && secondaryUrl);
  const mealTags = recipe.tags.filter((t) => t.category === "meal_type");

  async function handleShare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const url = `${SITE_URL}/recipes/${recipe.slug}?utm_source=${UTM_SOURCE}&utm_medium=${UTM_MEDIUM}&utm_campaign=${UTM_CAMPAIGN}`;
    try {
      if (navigator.share) await navigator.share({ title: recipe.title, url });
      else { await navigator.clipboard.writeText(url); setShareCopied(true); setTimeout(() => setShareCopied(false), 2000); }
    } catch {}
  }

  return (
    <Link href={`/recipes/${recipe.slug}`} className="group flex flex-col" style={{ textDecoration: "none", color: "inherit" }}>
      <div
        className="relative w-full overflow-hidden flex-shrink-0"
        style={{ aspectRatio: hero ? "3/2" : "4/3", backgroundColor: "rgba(35,33,32,0.06)" }}
      >
        {primaryUrl ? (
          <>
            <Image src={primaryUrl} alt={recipe.title} fill
              className={`object-cover transition-opacity duration-500 ${hasSwap ? "group-hover:opacity-0" : ""}`}
              sizes={hero ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"} />
            {secondaryUrl && (
              <Image src={secondaryUrl} alt={`${recipe.title} detail`} fill
                className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                sizes={hero ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"} />
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl font-light" style={{ fontFamily: "var(--font-display)", color: "rgba(35,33,32,0.15)" }}>✦</span>
          </div>
        )}
        <button onClick={handleShare}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1.5 px-3 py-1.5"
          style={{ backgroundColor: "rgba(242,240,235,0.92)", backdropFilter: "blur(4px)", fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "var(--font-display)", color: "#232120", border: "none", cursor: "pointer" }}
          aria-label="Share recipe">
          {shareCopied ? "Copied" : (<><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="8" cy="2" r="1.5" stroke="currentColor" strokeWidth="1" /><circle cx="8" cy="8" r="1.5" stroke="currentColor" strokeWidth="1" /><circle cx="2" cy="5" r="1.5" stroke="currentColor" strokeWidth="1" /><line x1="3.4" y1="4.3" x2="6.6" y2="2.7" stroke="currentColor" strokeWidth="1" /><line x1="3.4" y1="5.7" x2="6.6" y2="7.3" stroke="currentColor" strokeWidth="1" /></svg>Share</>)}
        </button>
      </div>
      <div className="mt-3 flex flex-col gap-1">
        {mealTags.length > 0 && (
          <p className="text-xs tracking-widest uppercase" style={{ fontFamily: "var(--font-display)", color: "#c4622d" }}>
            {mealTags.map((t) => t.label).join(" · ")}
          </p>
        )}
        <h2 className={`font-semibold leading-snug group-hover:opacity-70 transition-opacity ${hero ? "text-2xl" : "text-lg"}`} style={{ fontFamily: "var(--font-display)" }}>
          {recipe.title}
        </h2>
        {recipe.highlight && (
          <p className="text-sm font-light leading-relaxed line-clamp-2" style={{ color: "rgba(35,33,32,0.75)" }}>
            {recipe.highlight}
          </p>
        )}
      </div>
    </Link>
  );
}

export function RecipeBrowser({ recipes }: RecipeBrowserProps) {
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortKey>("most_viewed");

  const filterTags = useMemo(() => {
    const seen = new Map<string, { slug: string; label: string; category: string }>();
    for (const recipe of recipes) {
      for (const tag of recipe.tags) {
        if (tag.category === "meal_type" || tag.category === "diet_type") seen.set(tag.slug, tag);
      }
    }
    const meal = [...seen.values()].filter((t) => t.category === "meal_type")
      .sort((a, b) => MEAL_TYPE_SLUGS.indexOf(a.slug) - MEAL_TYPE_SLUGS.indexOf(b.slug));
    const diet = [...seen.values()].filter((t) => t.category === "diet_type")
      .sort((a, b) => DIET_TYPE_SLUGS.indexOf(a.slug) - DIET_TYPE_SLUGS.indexOf(b.slug));
    return [...meal, ...diet];
  }, [recipes]);

  const isFiltering = search.trim().length > 0 || activeFilters.length > 0;

  const heroRecipes = useMemo(
    () => [...recipes].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 2),
    [recipes]
  );

  const filteredSorted = useMemo(() => {
    let list = [...recipes];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) =>
        r.title.toLowerCase().includes(q) ||
        r.tags.some((t) => t.label.toLowerCase().includes(q)) ||
        (r.highlight ?? "").toLowerCase().includes(q)
      );
    }
    if (activeFilters.length > 0) list = list.filter((r) => r.tags.some((t) => activeFilters.includes(t.slug)));
    list.sort((a, b) => sortBy === "most_viewed" ? b.view_count - a.view_count : new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return list;
  }, [recipes, search, activeFilters, sortBy]);

  function toggleFilter(slug: string) {
    setActiveFilters((prev) => prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SiteBanner />
      <header className="flex items-baseline justify-between px-6 py-4">
        <h1 className="text-4xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>The Salt</h1>
        <p className="text-sm font-light hidden sm:block" style={{ fontFamily: "var(--font-display)", color: "rgba(35,33,32,0.45)" }}>
          A curated recipe collection
        </p>
      </header>

      <div style={{ animation: "pageFadeInBack 0.4s ease-out" }}>
      <div className="sticky top-0 z-10 px-6 pt-8 pb-3" style={{ backgroundColor: "#ffffff" }}>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter chips */}
          {filterTags.map((tag) => {
            const active = activeFilters.includes(tag.slug);
            return (
              <button key={tag.slug} onClick={() => toggleFilter(tag.slug)}
                className={`filter-tag text-xs uppercase px-3 py-1 border${active ? " filter-tag-active" : ""}`}
                style={{ fontFamily: "var(--font-display)", letterSpacing: "0.06em" }}>
                {tag.label}
              </button>
            );
          })}

          {/* Search + Sort pushed to the right */}
          <div className="ml-auto flex items-center gap-2 flex-shrink-0">
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" width="12" height="12" viewBox="0 0 14 14" fill="none" style={{ color: "rgba(35,33,32,0.35)" }}>
                <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2" />
                <line x1="9.5" y1="9.5" x2="12.5" y2="12.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="SEARCH"
                className="pl-8 pr-7 py-1 text-xs uppercase outline-none border filter-tag"
                style={{ fontFamily: "var(--font-display)", letterSpacing: "0.06em", width: "9rem" }} />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-60"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(35,33,32,0.4)", fontSize: "0.65rem" }}>✕</button>
              )}
            </div>

            <div className="relative inline-flex items-center">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)}
                className="appearance-none text-xs tracking-wide uppercase pl-3 pr-6 py-1 outline-none hover:opacity-75 transition-opacity"
                style={{ fontFamily: "var(--font-display)", border: "1px solid rgba(35,33,32,0.2)", color: "rgba(35,33,32,0.55)", backgroundColor: "transparent", cursor: "pointer", letterSpacing: "0.06em" }}>
                <option value="most_viewed">Most viewed</option>
                <option value="most_recent">Most recent</option>
              </select>
              <svg className="pointer-events-none absolute right-2" width="8" height="8" viewBox="0 0 9 9" fill="none" style={{ color: "rgba(35,33,32,0.4)" }}>
                <path d="M1.5 3L4.5 6L7.5 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pt-2 pb-8 flex-1">
        {filteredSorted.length === 0 ? (
          <p className="text-lg font-light italic text-center py-16" style={{ fontFamily: "var(--font-display)", color: "rgba(35,33,32,0.35)" }}>
            No recipes found.
          </p>
        ) : isFiltering ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSorted.map((r) => <RecipeCard key={r.id} recipe={r} />)}
          </div>
        ) : (
          <>
            {heroRecipes.length > 0 && (
              <div className={`grid gap-6 mb-10 ${heroRecipes.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
                {heroRecipes.map((r) => <RecipeCard key={r.id} recipe={r} hero />)}
              </div>
            )}
            {heroRecipes.length > 0 && filteredSorted.length > 2 && (
              <div className="flex items-center gap-4 mb-8">
                <hr className="flex-1" style={{ border: "none", borderTop: "1px solid rgba(35,33,32,0.1)" }} />
                <span className="text-xs tracking-widest uppercase flex-shrink-0" style={{ fontFamily: "var(--font-display)", color: "rgba(35,33,32,0.3)" }}>All recipes</span>
                <hr className="flex-1" style={{ border: "none", borderTop: "1px solid rgba(35,33,32,0.1)" }} />
              </div>
            )}
            {(() => {
              const heroIds = new Set(heroRecipes.map((r) => r.id));
              const gridRecipes = filteredSorted.filter((r) => !heroIds.has(r.id));
              if (gridRecipes.length === 0) return null;
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gridRecipes.map((r) => <RecipeCard key={r.id} recipe={r} />)}
                </div>
              );
            })()}
          </>
        )}
      </div>
      </div>
    </div>
  );
}
