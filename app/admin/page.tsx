import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAllRecipesAdmin } from "@/lib/recipes/queries";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const recipes = await getAllRecipesAdmin(supabase);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2
          className="text-3xl font-[family-name:var(--font-display)]"
          style={{ color: "#232120" }}
        >
          Recipes
        </h2>
        <Link
          href="/admin/recipes/new"
          className="px-6 py-3 text-sm tracking-widest uppercase font-[family-name:var(--font-display)] transition-opacity hover:opacity-80"
          style={{
            backgroundColor: "#232120",
            color: "#f2f0eb",
            textDecoration: "none",
          }}
        >
          + New Recipe
        </Link>
      </div>

      {recipes.length === 0 ? (
        <p
          className="text-lg font-[family-name:var(--font-display)] italic"
          style={{ color: "#232120", opacity: 0.5 }}
        >
          No recipes yet. Add your first one.
        </p>
      ) : (
        <table className="w-full" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                borderBottom: "1px solid #232120",
              }}
            >
              {["Title", "Created", "Views", "Status", ""].map((h) => (
                <th
                  key={h}
                  className="py-3 text-left text-xs tracking-widest uppercase font-[family-name:var(--font-display)]"
                  style={{ color: "#232120", opacity: 0.5, paddingRight: "1rem" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recipes.map((recipe) => (
              <tr
                key={recipe.id}
                style={{ borderBottom: "1px solid rgba(35,33,32,0.1)" }}
              >
                <td
                  className="py-4 pr-4 text-base font-[family-name:var(--font-display)]"
                  style={{ color: "#232120" }}
                >
                  {recipe.title}
                </td>
                <td
                  className="py-4 pr-4 text-sm font-[family-name:var(--font-display)]"
                  style={{ color: "#232120", opacity: 0.6, whiteSpace: "nowrap" }}
                >
                  {new Date(recipe.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
                <td
                  className="py-4 pr-4 text-sm font-[family-name:var(--font-display)]"
                  style={{ color: "#232120", opacity: 0.6 }}
                >
                  {recipe.view_count.toLocaleString()}
                </td>
                <td
                  className="py-4 pr-4 text-xs tracking-wide uppercase font-[family-name:var(--font-display)]"
                  style={{
                    color: recipe.published ? "#c4622d" : "#232120",
                    opacity: recipe.published ? 1 : 0.4,
                  }}
                >
                  {recipe.published ? "Live" : "Draft"}
                </td>
                <td className="py-4 text-right">
                  <Link
                    href={`/admin/recipes/${recipe.slug}/edit`}
                    className="text-sm font-[family-name:var(--font-display)] tracking-wide transition-opacity hover:opacity-70"
                    style={{ color: "#c4622d", textDecoration: "none" }}
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
