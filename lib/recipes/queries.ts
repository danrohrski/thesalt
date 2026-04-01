import type { SupabaseClient } from "@supabase/supabase-js";
import type { Recipe, RecipeWithTags, Tag } from "@/types/recipe";

export async function getRecipeBySlug(
  slug: string,
  supabase: SupabaseClient
): Promise<RecipeWithTags | null> {
  const { data, error } = await supabase
    .from("recipes")
    .select(
      `
      *,
      recipe_tags (
        tags (*)
      )
    `
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(`Failed to fetch recipe: ${error.message}`);
  if (!data) return null;

  const tags: Tag[] = (
    (data as Record<string, unknown>).recipe_tags as Array<{
      tags: Tag;
    }>
  ).map((rt) => rt.tags);

  return { ...(data as unknown as Recipe), tags } as RecipeWithTags;
}

export async function getAllRecipesAdmin(
  supabase: SupabaseClient
): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch recipes: ${error.message}`);
  return (data ?? []) as Recipe[];
}

export async function getPublishedRecipes(
  supabase: SupabaseClient
): Promise<RecipeWithTags[]> {
  const { data, error } = await supabase
    .from("recipes")
    .select(`*, recipe_tags(tags(*))`)
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch recipes: ${error.message}`);

  return (data ?? []).map((row) => {
    const tags: Tag[] = (
      row.recipe_tags as Array<{ tags: Tag }>
    ).map((rt) => rt.tags);
    return { ...(row as unknown as Recipe), tags } as RecipeWithTags;
  });
}

export async function getPublishedRecipeBySlug(
  slug: string,
  supabase: SupabaseClient
): Promise<RecipeWithTags | null> {
  const { data, error } = await supabase
    .from("recipes")
    .select(`*, recipe_tags(tags(*))`)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) throw new Error(`Failed to fetch recipe: ${error.message}`);
  if (!data) return null;

  const tags: Tag[] = (
    (data as Record<string, unknown>).recipe_tags as Array<{ tags: Tag }>
  ).map((rt) => rt.tags);

  return { ...(data as unknown as Recipe), tags } as RecipeWithTags;
}
