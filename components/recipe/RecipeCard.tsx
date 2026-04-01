"use client";

import Image from "next/image";
import { useState } from "react";
import { getPhotoUrl } from "@/lib/storage/photos";
import { SITE_URL, UTM_SOURCE, UTM_MEDIUM, UTM_CAMPAIGN } from "@/lib/constants/config";
import type { RecipeWithTags } from "@/types/recipe";

interface RecipeCardProps {
  recipe: RecipeWithTags;
  onClick: () => void;
  isSelected: boolean;
  hero?: boolean;
}

export function RecipeCard({ recipe, onClick, isSelected, hero = false }: RecipeCardProps) {
  const [shareCopied, setShareCopied] = useState(false);

  const primaryUrl = recipe.photo_primary ? getPhotoUrl(recipe.photo_primary) : null;
  const secondaryUrl = recipe.photo_secondary ? getPhotoUrl(recipe.photo_secondary) : null;
  const hasSwap = !!(primaryUrl && secondaryUrl);

  const mealTags = recipe.tags.filter((t) => t.category === "meal_type");

  async function handleShare(e: React.MouseEvent) {
    e.stopPropagation();
    const url = `${SITE_URL}/recipes/${recipe.slug}?utm_source=${UTM_SOURCE}&utm_medium=${UTM_MEDIUM}&utm_campaign=${UTM_CAMPAIGN}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: recipe.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      }
    } catch {
      // user cancelled share sheet — no-op
    }
  }

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer flex flex-col"
      style={{
        outline: isSelected ? "2px solid #c4622d" : "none",
        outlineOffset: "2px",
      }}
    >
      {/* Photo */}
      <div
        className="relative w-full overflow-hidden flex-shrink-0"
        style={{
          aspectRatio: hero ? "3/2" : "4/3",
          backgroundColor: "rgba(35,33,32,0.06)",
        }}
      >
        {primaryUrl ? (
          <>
            <Image
              src={primaryUrl}
              alt={recipe.title}
              fill
              className={`object-cover transition-opacity duration-500 ${hasSwap ? "group-hover:opacity-0" : ""}`}
              sizes={hero ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
            />
            {secondaryUrl && (
              <Image
                src={secondaryUrl}
                alt={`${recipe.title} detail`}
                fill
                className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                sizes={hero ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
              />
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span
              className="text-4xl font-light"
              style={{ fontFamily: "var(--font-display)", color: "rgba(35,33,32,0.15)" }}
            >
              ✦
            </span>
          </div>
        )}

        {/* Share button — appears on hover */}
        <button
          onClick={handleShare}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1.5 px-3 py-1.5"
          style={{
            backgroundColor: "rgba(242,240,235,0.92)",
            backdropFilter: "blur(4px)",
            fontSize: "0.65rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontFamily: "var(--font-display)",
            color: "#232120",
            border: "none",
            cursor: "pointer",
          }}
          aria-label="Share recipe"
        >
          {shareCopied ? (
            "Copied"
          ) : (
            <>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <circle cx="8" cy="2" r="1.5" stroke="currentColor" strokeWidth="1" />
                <circle cx="8" cy="8" r="1.5" stroke="currentColor" strokeWidth="1" />
                <circle cx="2" cy="5" r="1.5" stroke="currentColor" strokeWidth="1" />
                <line x1="3.4" y1="4.3" x2="6.6" y2="2.7" stroke="currentColor" strokeWidth="1" />
                <line x1="3.4" y1="5.7" x2="6.6" y2="7.3" stroke="currentColor" strokeWidth="1" />
              </svg>
              Share
            </>
          )}
        </button>
      </div>

      {/* Info */}
      <div className="mt-3 flex flex-col gap-1">
        {mealTags.length > 0 && (
          <p
            className="text-xs tracking-widest uppercase"
            style={{ fontFamily: "var(--font-display)", color: "#c4622d" }}
          >
            {mealTags.map((t) => t.label).join(" · ")}
          </p>
        )}
        <h2
          className={`font-light leading-snug group-hover:opacity-70 transition-opacity ${hero ? "text-2xl" : "text-lg"}`}
          style={{ fontFamily: "var(--font-display)" }}
        >
          {recipe.title}
        </h2>
        {recipe.highlight && (
          <p
            className="text-sm font-light leading-relaxed line-clamp-2"
            style={{ color: "rgba(35,33,32,0.75)" }}
          >
            {recipe.highlight}
          </p>
        )}
      </div>
    </div>
  );
}
