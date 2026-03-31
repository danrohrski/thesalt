import type { TagCategory } from "@/lib/constants/tags";

export interface Tag {
  id: string;
  slug: string;
  label: string;
  category: TagCategory;
}

export interface Recipe {
  id: string;
  slug: string;
  title: string;
  source_url: string | null;
  highlight: string | null;
  writeup: string | null;
  tips: string | null;
  photo_primary: string | null;
  photo_secondary: string | null;
  view_count: number;
  published: boolean;
  scraped_at: string | null;
  created_at: string;
  updated_at: string;
  tags?: Tag[];
}

export interface RecipeWithTags extends Recipe {
  tags: Tag[];
}
