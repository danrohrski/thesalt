import { NextRequest, NextResponse } from "next/server";
import { load as cheerioLoad } from "cheerio";
import { createClient } from "@/lib/supabase/server";
import type { ScrapedRecipe } from "@/types/scraper";

type JsonLdRecipe = Record<string, unknown>;
type CheerioRoot = ReturnType<typeof cheerioLoad>;

function emptyResult(url: string): ScrapedRecipe {
  return {
    title: "",
    source_url: url,
    photo_url: null,
    ingredients: [],
    meal_types: [],
    diet_types: [],
    scraped: false,
  };
}

function findJsonLdRecipe($: CheerioRoot): JsonLdRecipe | null {
  let found: JsonLdRecipe | null = null;

  $('script[type="application/ld+json"]').each((_i, el) => {
    if (found) return;
    try {
      const raw = $(el).html() ?? "";
      const parsed: unknown = JSON.parse(raw);
      const candidates: unknown[] = Array.isArray(parsed) ? parsed : [parsed];
      for (const candidate of candidates) {
        if (
          candidate &&
          typeof candidate === "object" &&
          (candidate as JsonLdRecipe)["@type"] === "Recipe"
        ) {
          found = candidate as JsonLdRecipe;
          return;
        }
        // Handle @graph
        const graph = (candidate as JsonLdRecipe)["@graph"];
        if (Array.isArray(graph)) {
          for (const item of graph) {
            if (
              item &&
              typeof item === "object" &&
              (item as JsonLdRecipe)["@type"] === "Recipe"
            ) {
              found = item as JsonLdRecipe;
              return;
            }
          }
        }
      }
    } catch {
      // malformed JSON-LD, skip
    }
  });

  return found;
}

function extractPhotoUrl(recipe: JsonLdRecipe): string | null {
  const image = recipe.image;
  if (typeof image === "string") return image;
  if (Array.isArray(image) && image.length > 0) {
    const first = image[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object") {
      return ((first as JsonLdRecipe).url as string) ?? null;
    }
  }
  if (image && typeof image === "object" && !Array.isArray(image)) {
    return ((image as JsonLdRecipe).url as string) ?? null;
  }
  return null;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let url: string;
  try {
    const body = await request.json();
    url = body.url;
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "url is required" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    let html: string;
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; TheSaltBot/1.0; +https://thesalt.recipes)",
        },
      });
      html = await res.text();
    } finally {
      clearTimeout(timeout);
    }

    const $ = cheerioLoad(html);
    const jsonLdRecipe = findJsonLdRecipe($);

    if (jsonLdRecipe !== null) {
      const ld = jsonLdRecipe;
      const name = typeof ld.name === "string" ? ld.name : "";
      const photo_url = extractPhotoUrl(ld);

      const ingredients: string[] = Array.isArray(ld.recipeIngredient)
        ? (ld.recipeIngredient as unknown[]).filter(
            (i): i is string => typeof i === "string"
          )
        : [];

      const rawCategory = ld.recipeCategory;
      const meal_types: string[] = Array.isArray(rawCategory)
        ? (rawCategory as unknown[]).filter(
            (c): c is string => typeof c === "string"
          )
        : typeof rawCategory === "string" && rawCategory
        ? [rawCategory]
        : [];

      const rawDiet = ld.suitableForDiet;
      const diet_types: string[] = Array.isArray(rawDiet)
        ? (rawDiet as unknown[]).filter(
            (d): d is string => typeof d === "string"
          )
        : typeof rawDiet === "string" && rawDiet
        ? [rawDiet]
        : [];

      return NextResponse.json({
        title: name,
        source_url: url,
        photo_url,
        ingredients,
        meal_types,
        diet_types,
        scraped: true,
      } satisfies ScrapedRecipe);
    }

    // Fallback: og: meta tags
    const title =
      $('meta[property="og:title"]').attr("content") ??
      $("title").text() ??
      "";
    const photo_url =
      $('meta[property="og:image"]').attr("content") ?? null;

    return NextResponse.json({
      title,
      source_url: url,
      photo_url,
      ingredients: [],
      meal_types: [],
      diet_types: [],
      scraped: false,
    } satisfies ScrapedRecipe);
  } catch {
    return NextResponse.json(emptyResult(url));
  }
}
