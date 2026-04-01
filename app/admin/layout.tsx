import { redirect } from "next/navigation";
import Link from "next/link";
import { Toaster } from "sonner";
import { createClient } from "@/lib/supabase/server";

async function signOut() {
  "use server";
  const { createClient: createServerClient } = await import(
    "@/lib/supabase/server"
  );
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f2f0eb" }}>
      <header
        className="border-b px-6 py-4 flex items-center justify-between"
        style={{ borderColor: "#232120", color: "#232120" }}
      >
        <Link
          href="/admin"
          className="text-xl font-[family-name:var(--font-display)] tracking-wide"
          style={{ color: "#232120", textDecoration: "none" }}
        >
          The Salt — Admin
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/admin/recipes/new"
            className="text-sm tracking-widest uppercase font-[family-name:var(--font-display)] transition-opacity hover:opacity-70"
            style={{ color: "#c4622d", textDecoration: "none" }}
          >
            + New Recipe
          </Link>

          <form action={signOut}>
            <button
              type="submit"
              className="text-sm tracking-wide font-[family-name:var(--font-display)] transition-opacity hover:opacity-70 bg-transparent border-none cursor-pointer p-0"
              style={{ color: "#232120", opacity: 0.6 }}
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="px-6 py-8 max-w-5xl mx-auto">{children}</main>

      <Toaster position="bottom-right" />
    </div>
  );
}
