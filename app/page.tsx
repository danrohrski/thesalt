import { createClient } from "@/lib/supabase/server";
import { getPublishedRecipes } from "@/lib/recipes/queries";
import { RecipeBrowser } from "@/components/recipe/RecipeBrowser";

export const revalidate = 60;

export default async function Home() {
  const supabase = await createClient();
  const recipes = await getPublishedRecipes(supabase);

  return <RecipeBrowser recipes={recipes} />;
}
