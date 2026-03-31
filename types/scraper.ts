export interface ScrapedRecipe {
  title: string;
  source_url: string;
  photo_url: string | null;
  ingredients: string[];
  meal_types: string[];
  diet_types: string[];
  /** true = JSON-LD succeeded; false = og: tags only fallback */
  scraped: boolean;
}
