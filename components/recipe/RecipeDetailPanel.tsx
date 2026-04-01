"use client";

import { useEffect } from "react";
import Image from "next/image";
import { getPhotoUrl } from "@/lib/storage/photos";
import { SITE_URL, UTM_SOURCE, UTM_MEDIUM, UTM_CAMPAIGN } from "@/lib/constants/config";
import { ProseMarkdown } from "./ProseMarkdown";
import { RecipeCard } from "./RecipeCard";
import type { RecipeWithTags } from "@/types/recipe";

interface RecipeDetailPanelProps {
  recipe: RecipeWithTags;
  allRecipes: RecipeWithTags[];
  onClose: () => void;
  onSelectRecipe: (recipe: RecipeWithTags) => void;
  onTagFilter: (tagSlug: string) => void;
}

export function RecipeDetailPanel({
  recipe,
  allRecipes,
  onClose,
  onSelectRecipe,
  onTagFilter,
}: RecipeDetailPanelProps) {
  // Track view
  useEffect(() => {
    fetch(`/api/recipes/${recipe.slug}/view`, { method: "POST" }).catch(() => {});
  }, [recipe.slug]);

  const primaryUrl = recipe.photo_primary ? getPhotoUrl(recipe.photo_primary) : null;
  const secondaryUrl = recipe.photo_secondary ? getPhotoUrl(recipe.photo_secondary) : null;

  // Related recipes: share at least one tag, exclude self, limit 3
  const related = allRecipes
    .filter((r) => {
      if (r.id === recipe.id) return false;
      const recipeSlugs = new Set(recipe.tags.map((t) => t.slug));
      return r.tags.some((t) => recipeSlugs.has(t.slug));
    })
    .slice(0, 3);

  const displayTags = recipe.tags.filter(
    (t) => t.category === "meal_type" || t.category === "diet_type" || t.category === "season"
  );

  async function handleShare() {
    const url = `${SITE_URL}/recipes/${recipe.slug}?utm_source=${UTM_SOURCE}&utm_medium=${UTM_MEDIUM}&utm_campaign=${UTM_CAMPAIGN}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: recipe.title, url });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      // cancelled
    }
  }

  function hostnameOf(url: string) {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return url;
    }
  }

  return (
    <div className="flex flex-col min-h-full" style={{ backgroundColor: "#f2f0eb" }}>
      {/* Close bar */}
      <div
        className="flex items-center justify-between px-6 py-4 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(35,33,32,0.08)" }}
      >
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-sm font-light transition-opacity hover:opacity-60"
          style={{ fontFamily: "var(--font-display)", color: "#232120", background: "none", border: "none", cursor: "pointer" }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          All recipes
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 text-xs tracking-widest uppercase transition-opacity hover:opacity-60"
          style={{ fontFamily: "var(--font-display)", color: "#232120", background: "none", border: "none", cursor: "pointer" }}
        >
          <svg width="11" height="11" viewBox="0 0 10 10" fill="none">
            <circle cx="8" cy="2" r="1.5" stroke="currentColor" strokeWidth="1" />
            <circle cx="8" cy="8" r="1.5" stroke="currentColor" strokeWidth="1" />
            <circle cx="2" cy="5" r="1.5" stroke="currentColor" strokeWidth="1" />
            <line x1="3.4" y1="4.3" x2="6.6" y2="2.7" stroke="currentColor" strokeWidth="1" />
            <line x1="3.4" y1="5.7" x2="6.6" y2="7.3" stroke="currentColor" strokeWidth="1" />
          </svg>
          Share
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Hero photo — secondary if available, else primary */}
        {(secondaryUrl ?? primaryUrl) && (
          <div className="w-full" style={{ aspectRatio: "16/9" }}>
            <Image
              src={(secondaryUrl ?? primaryUrl)!}
              alt={recipe.title}
              width={1200}
              height={675}
              className="w-full h-full object-cover"
              priority
            />
          </div>
        )}

        <div className="px-8 py-8">
          {/* Tags */}
          {displayTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {displayTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => onTagFilter(tag.slug)}
                  className="text-xs tracking-widest uppercase px-3 py-1 transition-opacity hover:opacity-70"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: tag.category === "meal_type" ? "#c4622d" : "rgba(35,33,32,0.5)",
                    border: `1px solid ${tag.category === "meal_type" ? "rgba(196,98,45,0.3)" : "rgba(35,33,32,0.15)"}`,
                    background: "none",
                    cursor: "pointer",
                  }}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          )}

          {/* Title */}
          <h1
            className="text-4xl font-light leading-tight mb-5"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {recipe.title}
          </h1>

          {/* Highlight */}
          {recipe.highlight && (
            <p
              className="text-xl font-light italic leading-relaxed mb-8"
              style={{
                fontFamily: "var(--font-display)",
                color: "rgba(35,33,32,0.7)",
                borderLeft: "2px solid #c4622d",
                paddingLeft: "1rem",
              }}
            >
              {recipe.highlight}
            </p>
          )}

          {/* Write-up */}
          {recipe.writeup && (
            <div className="mb-8">
              <p
                className="text-xs tracking-widest uppercase mb-4"
                style={{ fontFamily: "var(--font-display)", color: "#c4622d" }}
              >
                Write-up
              </p>
              <ProseMarkdown>{recipe.writeup}</ProseMarkdown>
            </div>
          )}

          {/* Tips */}
          {recipe.tips && (
            <div className="mb-8">
              <p
                className="text-xs tracking-widest uppercase mb-4"
                style={{ fontFamily: "var(--font-display)", color: "#c4622d" }}
              >
                Tips & Tweaks
              </p>
              <ProseMarkdown>{recipe.tips}</ProseMarkdown>
            </div>
          )}

          {/* Source CTA */}
          {recipe.source_url && (
            <div className="mb-10">
              <a
                href={recipe.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 w-full py-4 text-sm tracking-widest uppercase transition-opacity hover:opacity-80"
                style={{
                  fontFamily: "var(--font-display)",
                  backgroundColor: "#232120",
                  color: "#f2f0eb",
                  textDecoration: "none",
                }}
              >
                View Original Recipe
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6H10M7 3L10 6L7 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <p
                className="text-center text-xs mt-2 font-light"
                style={{ fontFamily: "var(--font-display)", color: "rgba(35,33,32,0.35)" }}
              >
                via {hostnameOf(recipe.source_url)}
              </p>
            </div>
          )}

          {/* Related recipes */}
          {related.length > 0 && (
            <div>
              <hr style={{ border: "none", borderTop: "1px solid rgba(35,33,32,0.1)", marginBottom: "2rem" }} />
              <p
                className="text-xs tracking-widest uppercase mb-6"
                style={{ fontFamily: "var(--font-display)", color: "rgba(35,33,32,0.4)" }}
              >
                You might also like
              </p>
              <div className="grid grid-cols-3 gap-4">
                {related.map((r) => (
                  <RecipeCard
                    key={r.id}
                    recipe={r}
                    onClick={() => onSelectRecipe(r)}
                    isSelected={false}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
