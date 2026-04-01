import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRecipeBySlug } from "@/lib/recipes/queries";
import { RecipeForm } from "@/components/admin/RecipeForm";
import type { Tag } from "@/types/recipe";

interface EditRecipePageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditRecipePage({ params }: EditRecipePageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const [recipe, tagsResult] = await Promise.all([
    getRecipeBySlug(slug, supabase),
    supabase.from("tags").select("*").order("category").order("label"),
  ]);

  if (!recipe) notFound();

  const tags: Tag[] = (tagsResult.data ?? []) as Tag[];

  return (
    <div className="max-w-2xl">
      <h2
        className="text-3xl font-[family-name:var(--font-display)] mb-10"
        style={{ color: "#232120" }}
      >
        Edit Recipe
      </h2>
      <RecipeForm tags={tags} recipe={recipe} mode="edit" />
    </div>
  );
}
