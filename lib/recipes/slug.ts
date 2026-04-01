import slugify from "slugify";
import type { SupabaseClient } from "@supabase/supabase-js";

export function generateSlug(title: string): string {
  return slugify(title, { lower: true, strict: true }).slice(0, 60);
}

export async function ensureUniqueSlug(
  slug: string,
  supabase: SupabaseClient
): Promise<string> {
  const { data } = await supabase
    .from("recipes")
    .select("slug")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) return slug;

  let counter = 2;
  while (true) {
    const candidate = `${slug.slice(0, 57)}-${counter}`;
    const { data: existing } = await supabase
      .from("recipes")
      .select("slug")
      .eq("slug", candidate)
      .maybeSingle();
    if (!existing) return candidate;
    counter++;
  }
}
