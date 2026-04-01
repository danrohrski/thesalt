import slugify from "slugify";
import type { SupabaseClient } from "@supabase/supabase-js";

export function generateSlug(title: string): string {
  const slug = slugify(title, { lower: true, strict: true });
  if (slug.length <= 80) return slug;
  // Trim at the last word boundary before 80 chars so we never cut mid-word
  const trimmed = slug.slice(0, 80);
  const lastHyphen = trimmed.lastIndexOf("-");
  return lastHyphen > 20 ? trimmed.slice(0, lastHyphen) : trimmed;
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
