import { createClient } from "@supabase/supabase-js";
import { STORAGE_BUCKET } from "@/lib/constants/config";

// Anon client is enough for public URL construction and admin-authed uploads
function getStorageClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export function getPhotoUrl(path: string): string {
  const supabase = getStorageClient();
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function deletePhoto(
  path: string,
  supabase: ReturnType<typeof getStorageClient>
): Promise<void> {
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);
  if (error) throw new Error(`Delete failed: ${error.message}`);
}
