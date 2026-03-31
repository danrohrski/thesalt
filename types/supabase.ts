// Auto-generated types will go here once `supabase gen types` is run.
// Until then, this placeholder prevents import errors.
export type Database = {
  public: {
    Tables: {
      recipes: {
        Row: {
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
        };
        Insert: Omit<
          Database["public"]["Tables"]["recipes"]["Row"],
          "id" | "view_count" | "created_at" | "updated_at"
        > & {
          id?: string;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["recipes"]["Insert"]>;
      };
      tags: {
        Row: {
          id: string;
          slug: string;
          label: string;
          category: string;
        };
        Insert: Omit<Database["public"]["Tables"]["tags"]["Row"], "id"> & {
          id?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tags"]["Insert"]>;
      };
      recipe_tags: {
        Row: {
          recipe_id: string;
          tag_id: string;
        };
        Insert: Database["public"]["Tables"]["recipe_tags"]["Row"];
        Update: Partial<Database["public"]["Tables"]["recipe_tags"]["Row"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
