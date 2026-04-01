import { createClient } from "@supabase/supabase-js";
import { STORAGE_BUCKET } from "@/lib/constants/config";

// Construct the public URL directly — no client instantiation needed,
// which avoids spawning a GoTrueClient on every card render.
export function getPhotoUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${base}/storage/v1/object/public/${STORAGE_BUCKET}/${path}`;
}

// Only used server-side (admin delete), so a fresh client here is fine.
function getStorageClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function deletePhoto(
  path: string,
  supabase: ReturnType<typeof getStorageClient>
): Promise<void> {
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);
  if (error) throw new Error(`Delete failed: ${error.message}`);
}
