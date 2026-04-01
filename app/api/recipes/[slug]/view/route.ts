import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("recipes")
    .select("view_count")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (data) {
    const currentCount = (data as unknown as { view_count: number }).view_count;
    await supabase
      .from("recipes")
      .update({ view_count: currentCount + 1 } as never)
      .eq("slug", slug);
  }

  return Response.json({ ok: true });
}
