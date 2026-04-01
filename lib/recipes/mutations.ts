import type { SupabaseClient } from "@supabase/supabase-js";
import type { Recipe } from "@/types/recipe";
import { generateSlug, ensureUniqueSlug } from "./slug";

export interface RecipeFormData {
  title: string;
  source_url?: string;
  highlight?: string;
  writeup?: string;
  tips?: string;
  photo_primary?: string;
  photo_secondary?: string;
  tag_ids: string[];
}

export async function createRecipe(
  data: RecipeFormData,
  supabase: SupabaseClient
): Promise<Recipe> {
  const baseSlug = generateSlug(data.title);
  const slug = await ensureUniqueSlug(baseSlug, supabase);

  const { data: recipe, error } = await supabase
    .from("recipes")
    .insert({
      slug,
      title: data.title,
      source_url: data.source_url ?? null,
      highlight: data.highlight ?? null,
      writeup: data.writeup ?? null,
      tips: data.tips ?? null,
      photo_primary: data.photo_primary ?? null,
      photo_secondary: data.photo_secondary ?? null,
      published: true,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create recipe: ${error.message}`);

  if (data.tag_ids.length > 0) {
    const tagRows = data.tag_ids.map((tag_id) => ({
      recipe_id: recipe.id,
      tag_id,
    }));
    const { error: tagError } = await supabase
      .from("recipe_tags")
      .insert(tagRows);
    if (tagError)
      throw new Error(`Failed to attach tags: ${tagError.message}`);
  }

  return recipe as Recipe;
}

export async function updateRecipe(
  slug: string,
  data: Partial<RecipeFormData>,
  supabase: SupabaseClient
): Promise<Recipe> {
  const updatePayload: Record<string, unknown> = {};
  if (data.title !== undefined) updatePayload.title = data.title;
  if (data.source_url !== undefined) updatePayload.source_url = data.source_url;
  if (data.highlight !== undefined) updatePayload.highlight = data.highlight;
  if (data.writeup !== undefined) updatePayload.writeup = data.writeup;
  if (data.tips !== undefined) updatePayload.tips = data.tips;
  if (data.photo_primary !== undefined)
    updatePayload.photo_primary = data.photo_primary;
  if (data.photo_secondary !== undefined)
    updatePayload.photo_secondary = data.photo_secondary;

  const { data: recipe, error } = await supabase
    .from("recipes")
    .update(updatePayload)
    .eq("slug", slug)
    .select()
    .single();

  if (error) throw new Error(`Failed to update recipe: ${error.message}`);

  if (data.tag_ids !== undefined) {
    const { error: deleteError } = await supabase
      .from("recipe_tags")
      .delete()
      .eq("recipe_id", recipe.id);
    if (deleteError)
      throw new Error(`Failed to clear tags: ${deleteError.message}`);

    if (data.tag_ids.length > 0) {
      const tagRows = data.tag_ids.map((tag_id) => ({
        recipe_id: recipe.id,
        tag_id,
      }));
      const { error: tagError } = await supabase
        .from("recipe_tags")
        .insert(tagRows);
      if (tagError)
        throw new Error(`Failed to attach tags: ${tagError.message}`);
    }
  }

  return recipe as Recipe;
}

export async function setPublished(
  slug: string,
  published: boolean,
  supabase: SupabaseClient
): Promise<void> {
  const { error } = await supabase
    .from("recipes")
    .update({ published })
    .eq("slug", slug);
  if (error) throw new Error(`Failed to update recipe: ${error.message}`);
}

export async function deleteRecipe(
  slug: string,
  supabase: SupabaseClient
): Promise<void> {
  const { error } = await supabase
    .from("recipes")
    .delete()
    .eq("slug", slug);
  if (error) throw new Error(`Failed to delete recipe: ${error.message}`);
}
