import { createClient } from "@/lib/supabase/server";
import { RecipeForm } from "@/components/admin/RecipeForm";
import type { Tag } from "@/types/recipe";

export default async function NewRecipePage() {
  const supabase = await createClient();
  const { data: tagsData } = await supabase
    .from("tags")
    .select("*")
    .order("category")
    .order("label");

  const tags: Tag[] = (tagsData ?? []) as Tag[];

  return (
    <div className="max-w-2xl">
      <h2
        className="text-3xl font-[family-name:var(--font-display)] mb-10"
        style={{ color: "#232120" }}
      >
        New Recipe
      </h2>
      <RecipeForm tags={tags} mode="create" />
    </div>
  );
}
