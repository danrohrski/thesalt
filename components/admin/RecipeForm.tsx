"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { createRecipe, updateRecipe } from "@/lib/recipes/mutations";
import type { Tag, Recipe } from "@/types/recipe";
import type { ScrapedRecipe } from "@/types/scraper";
import { UrlScraper } from "./UrlScraper";
import { TagSelector } from "./TagSelector";
import { PhotoUploader } from "./PhotoUploader";
import { generateSlug } from "@/lib/recipes/slug";
import { SITE_URL } from "@/lib/constants/config";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  source_url: z.string().optional(),
  highlight: z.string().optional(),
  writeup: z.string().optional(),
  tips: z.string().optional(),
  ingredients: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface RecipeFormProps {
  tags: Tag[];
  recipe?: Recipe;
  mode: "create" | "edit";
}

export function RecipeForm({ tags, recipe, mode }: RecipeFormProps) {
  const router = useRouter();
  const [tagIds, setTagIds] = useState<string[]>(
    recipe?.tags?.map((t) => t.id) ?? []
  );
  const [photoPrimary, setPhotoPrimary] = useState<string | null>(
    recipe?.photo_primary ?? null
  );
  const [photoSecondary, setPhotoSecondary] = useState<string | null>(
    recipe?.photo_secondary ?? null
  );
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: recipe?.title ?? "",
      source_url: recipe?.source_url ?? "",
      highlight: recipe?.highlight ?? "",
      writeup: recipe?.writeup ?? "",
      tips: recipe?.tips ?? "",
      ingredients: "",
    },
  });

  const titleValue = watch("title");
  const slugPreview = titleValue ? generateSlug(titleValue) : (recipe?.slug ?? "new-recipe");

  const handleScraped = useCallback(
    (data: ScrapedRecipe) => {
      if (data.title) setValue("title", data.title);
      if (data.source_url) setValue("source_url", data.source_url);
    },
    [setValue]
  );

  async function onSubmit(values: FormValues) {
    setSaving(true);
    try {
      const supabase = createClient();

      const formData = {
        title: values.title,
        source_url: values.source_url || undefined,
        highlight: values.highlight || undefined,
        writeup: values.writeup || undefined,
        tips: values.tips || undefined,
        photo_primary: photoPrimary ?? undefined,
        photo_secondary: photoSecondary ?? undefined,
        tag_ids: tagIds,
      };

      let savedRecipe: Recipe;
      if (mode === "create") {
        savedRecipe = await createRecipe(formData, supabase);
      } else {
        savedRecipe = await updateRecipe(recipe!.slug, formData, supabase);
      }

      const shareUrl = `${SITE_URL}/recipes/${savedRecipe.slug}`;
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Recipe saved — share link copied to clipboard");
      } catch {
        toast.success("Recipe saved");
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save recipe"
      );
    } finally {
      setSaving(false);
    }
  }

  const inputStyle = {
    border: "1px solid rgba(35,33,32,0.3)",
    color: "#232120",
    backgroundColor: "transparent",
    width: "100%",
    outline: "none",
  };

  const labelStyle = {
    color: "#232120",
    opacity: 0.5,
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-10">
      {/* URL Scraper */}
      <UrlScraper onScraped={handleScraped} />

      <hr style={{ borderColor: "rgba(35,33,32,0.1)", border: "none", borderTop: "1px solid rgba(35,33,32,0.1)" }} />

      {/* Title */}
      <div className="flex flex-col gap-2">
        <label
          className="text-xs tracking-widest uppercase font-[family-name:var(--font-display)]"
          style={labelStyle}
        >
          Title *
        </label>
        <input
          {...register("title")}
          type="text"
          className="px-4 py-3 text-xl font-[family-name:var(--font-display)]"
          style={inputStyle}
          placeholder="Recipe title"
        />
        {errors.title && (
          <p
            className="text-sm font-[family-name:var(--font-display)]"
            style={{ color: "#c4622d" }}
          >
            {errors.title.message}
          </p>
        )}
        <p
          className="text-xs font-[family-name:var(--font-display)]"
          style={{ color: "#232120", opacity: 0.4 }}
        >
          Slug: /{slugPreview}
        </p>
      </div>

      {/* Source URL */}
      <div className="flex flex-col gap-2">
        <label
          className="text-xs tracking-widest uppercase font-[family-name:var(--font-display)]"
          style={labelStyle}
        >
          Source URL
        </label>
        <input
          {...register("source_url")}
          type="url"
          className="px-4 py-3 text-base font-[family-name:var(--font-display)]"
          style={inputStyle}
          placeholder="https://..."
        />
      </div>

      {/* Highlight */}
      <div className="flex flex-col gap-2">
        <label
          className="text-xs tracking-widest uppercase font-[family-name:var(--font-display)]"
          style={labelStyle}
        >
          Highlight
        </label>
        <textarea
          {...register("highlight")}
          rows={2}
          className="px-4 py-3 text-base font-[family-name:var(--font-display)] resize-y"
          style={inputStyle}
          placeholder="One-line pull quote or description"
        />
      </div>

      {/* Writeup */}
      <div className="flex flex-col gap-2">
        <label
          className="text-xs tracking-widest uppercase font-[family-name:var(--font-display)]"
          style={labelStyle}
        >
          Writeup
        </label>
        <textarea
          {...register("writeup")}
          rows={6}
          className="px-4 py-3 text-base font-[family-name:var(--font-display)] resize-y"
          style={inputStyle}
          placeholder="Notes, story, context…"
        />
      </div>

      {/* Tips */}
      <div className="flex flex-col gap-2">
        <label
          className="text-xs tracking-widest uppercase font-[family-name:var(--font-display)]"
          style={labelStyle}
        >
          Tips
        </label>
        <textarea
          {...register("tips")}
          rows={4}
          className="px-4 py-3 text-base font-[family-name:var(--font-display)] resize-y"
          style={inputStyle}
          placeholder="Tips & variations…"
        />
      </div>

      {/* Ingredients */}
      <div className="flex flex-col gap-2">
        <label
          className="text-xs tracking-widest uppercase font-[family-name:var(--font-display)]"
          style={labelStyle}
        >
          Ingredients
        </label>
        <textarea
          {...register("ingredients")}
          rows={8}
          className="px-4 py-3 text-base font-[family-name:var(--font-display)] resize-y"
          style={inputStyle}
          placeholder="One ingredient per line"
        />
        <p
          className="text-xs font-[family-name:var(--font-display)]"
          style={{ color: "#232120", opacity: 0.4 }}
        >
          One ingredient per line
        </p>
      </div>

      <hr style={{ border: "none", borderTop: "1px solid rgba(35,33,32,0.1)" }} />

      {/* Tags */}
      <div className="flex flex-col gap-3">
        <p
          className="text-xs tracking-widest uppercase font-[family-name:var(--font-display)]"
          style={labelStyle}
        >
          Tags
        </p>
        <TagSelector value={tagIds} onChange={setTagIds} tags={tags} />
      </div>

      <hr style={{ border: "none", borderTop: "1px solid rgba(35,33,32,0.1)" }} />

      {/* Photos */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <p
            className="text-xs tracking-widest uppercase font-[family-name:var(--font-display)]"
            style={labelStyle}
          >
            Primary Photo
          </p>
          <PhotoUploader
            recipeSlug={slugPreview}
            position="primary"
            value={photoPrimary}
            onChange={setPhotoPrimary}
          />
        </div>

        <div className="flex flex-col gap-3">
          <p
            className="text-xs tracking-widest uppercase font-[family-name:var(--font-display)]"
            style={labelStyle}
          >
            Secondary Photo{" "}
            <span style={{ opacity: 0.5, textTransform: "none", letterSpacing: 0 }}>
              — optional detail photo
            </span>
          </p>
          <PhotoUploader
            recipeSlug={slugPreview}
            position="secondary"
            value={photoSecondary}
            onChange={setPhotoSecondary}
          />
        </div>
      </div>

      <hr style={{ border: "none", borderTop: "1px solid rgba(35,33,32,0.1)" }} />

      {/* Submit */}
      <div className="flex gap-4 items-center">
        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3 text-sm tracking-widest uppercase font-[family-name:var(--font-display)] transition-opacity"
          style={{
            backgroundColor: "#232120",
            color: "#f2f0eb",
            border: "none",
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving
            ? "Saving…"
            : mode === "create"
            ? "Save Recipe"
            : "Update Recipe"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="text-sm font-[family-name:var(--font-display)] tracking-wide transition-opacity hover:opacity-70 bg-transparent border-none cursor-pointer p-0"
          style={{ color: "#232120", opacity: 0.5 }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
