"use client";

interface DeleteButtonProps {
  slug: string;
  action: (formData: FormData) => Promise<void>;
}

export function DeleteButton({ slug, action }: DeleteButtonProps) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("Delete this recipe? This cannot be undone.")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="slug" value={slug} />
      <button
        type="submit"
        className="text-sm font-[family-name:var(--font-display)] tracking-wide transition-opacity hover:opacity-70"
        style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(35,33,32,0.35)", padding: 0 }}
      >
        Delete
      </button>
    </form>
  );
}
