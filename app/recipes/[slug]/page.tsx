import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPublishedRecipeBySlug } from "@/lib/recipes/queries";
import { getPhotoUrl } from "@/lib/storage/photos";
import { ProseMarkdown } from "@/components/recipe/ProseMarkdown";
import { ShareButton } from "@/components/recipe/ShareButton";
import { SITE_URL, UTM_SOURCE, UTM_MEDIUM, UTM_CAMPAIGN } from "@/lib/constants/config";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { SiteBanner } from "@/components/SiteBanner";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const recipe = await getPublishedRecipeBySlug(slug, supabase);
  if (!recipe) return {};

  const photoUrl = recipe.photo_primary ? getPhotoUrl(recipe.photo_primary) : undefined;

  return {
    title: recipe.title,
    description: recipe.highlight ?? undefined,
    openGraph: {
      title: recipe.title,
      description: recipe.highlight ?? undefined,
      images: photoUrl ? [{ url: photoUrl }] : [],
    },
  };
}

export default async function RecipePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const recipe = await getPublishedRecipeBySlug(slug, supabase);
  if (!recipe) notFound();

  const primaryPhotoUrl = recipe.photo_primary ? getPhotoUrl(recipe.photo_primary) : null;
  const secondaryPhotoUrl = recipe.photo_secondary ? getPhotoUrl(recipe.photo_secondary) : null;
  const heroPhotoUrl = secondaryPhotoUrl ?? primaryPhotoUrl;
  const shareUrl = `${SITE_URL}/recipes/${recipe.slug}?utm_source=${UTM_SOURCE}&utm_medium=${UTM_MEDIUM}&utm_campaign=${UTM_CAMPAIGN}`;

  const mealTags = recipe.tags.filter((t) => t.category === "meal_type");
  const dietTags = recipe.tags.filter((t) => t.category === "diet_type");
  const seasonTags = recipe.tags.filter((t) => t.category === "season");
  const displayTags = [...mealTags, ...seasonTags, ...dietTags];

  return (
    <main className="min-h-full">

      <SiteBanner />

      {/* Header — matches the main page */}
      <header className="flex items-baseline justify-between px-6 py-4">
        <Link
          href="/"
          className="text-4xl font-semibold transition-opacity hover:opacity-70"
          style={{ fontFamily: "var(--font-display)", color: "#232120", textDecoration: "none" }}
        >
          The Salt
        </Link>
        <p className="text-sm font-light hidden sm:block" style={{ fontFamily: "var(--font-display)", color: "rgba(35,33,32,0.45)" }}>
          A curated recipe collection
        </p>
      </header>

      {/* Side-by-side on desktop, stacked on mobile */}
      <div className="flex flex-col lg:flex-row lg:items-start" style={{ animation: "pageFadeIn 0.4s ease-out" }}>

        {/* Mobile hero photo */}
        {heroPhotoUrl && (
          <div className="lg:hidden w-full overflow-hidden" style={{ aspectRatio: "4/3" }}>
            <Image src={heroPhotoUrl} alt={recipe.title} width={900} height={675}
              className="w-full h-full object-cover" priority />
          </div>
        )}

        {/* Left: text content */}
        <article className="flex-1 px-6 sm:px-10 py-8 lg:pt-8" style={{ maxWidth: "48rem" }}>

          {/* Back */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-light mb-8 transition-opacity hover:opacity-60"
            style={{ fontFamily: "var(--font-display)", color: "rgba(35,33,32,0.5)", textDecoration: "none" }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </Link>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl font-semibold leading-tight mb-4" style={{ fontFamily: "var(--font-display)" }}>
            {recipe.title}
          </h1>

          {/* Highlight */}
          {recipe.highlight && (
            <p
              className="text-xl font-light italic leading-relaxed mb-8"
              style={{ fontFamily: "var(--font-display)", color: "rgba(35,33,32,0.7)", borderLeft: "2px solid #c4622d", paddingLeft: "1rem" }}
            >
              {recipe.highlight}
            </p>
          )}

          <hr className="mb-8" style={{ border: "none", borderTop: "1px solid rgba(35,33,32,0.1)" }} />

          {/* Write-up */}
          {recipe.writeup && (
            <div className="mb-10">
              <p className="text-xs tracking-widest uppercase mb-4" style={{ fontFamily: "var(--font-display)", color: "#c4622d" }}>
                Write-up
              </p>
              <ProseMarkdown>{recipe.writeup}</ProseMarkdown>
            </div>
          )}

          {/* Tips */}
          {recipe.tips && (
            <div className="mb-10">
              <p className="text-xs tracking-widest uppercase mb-4" style={{ fontFamily: "var(--font-display)", color: "#c4622d" }}>
                Tips & Tweaks
              </p>
              <ProseMarkdown>{recipe.tips}</ProseMarkdown>
            </div>
          )}

          {/* Source CTA */}
          {recipe.source_url && (
            <a
              href={recipe.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 w-full py-4 text-sm tracking-widest uppercase transition-opacity hover:opacity-80"
              style={{ fontFamily: "var(--font-display)", backgroundColor: "#232120", color: "#f2f0eb", textDecoration: "none" }}
            >
              Get the Recipe
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6H10M7 3L10 6L7 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          )}

          {/* Tags + Share */}
          {(displayTags.length > 0) && (
            <div className="flex flex-wrap items-center gap-2 mt-8">
              {displayTags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/?filter=${tag.slug}`}
                  className="text-xs tracking-widest uppercase px-3 py-1 transition-opacity hover:opacity-70"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: tag.category === "meal_type" ? "#c4622d" : "rgba(35,33,32,0.5)",
                    border: `1px solid ${tag.category === "meal_type" ? "rgba(196,98,45,0.3)" : "rgba(35,33,32,0.15)"}`,
                    textDecoration: "none",
                  }}
                >
                  {tag.label}
                </Link>
              ))}
              <div className="ml-auto">
                <ShareButton title={recipe.title} url={shareUrl} />
              </div>
            </div>
          )}
        </article>

        {/* Right: sticky photo (desktop only) */}
        {heroPhotoUrl && (
          <div
            className="hidden lg:block"
            style={{ flex: 1, minWidth: 0, position: "sticky", top: 0, height: "100vh" }}
          >
            <div style={{ position: "relative", height: "100%", marginTop: "80px" }}>
              <Image src={heroPhotoUrl} alt={recipe.title} fill className="object-cover" priority />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
