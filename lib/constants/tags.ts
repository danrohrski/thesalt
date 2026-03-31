export const MEAL_TYPES = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Side Dishes",
  "Appetizers",
  "Snack",
  "Dessert",
  "Drinks",
] as const;

export const DIET_TYPES = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Grain-Free",
  "Low-Carb",
  "Nut-Free",
  "Paleo-Friendly",
] as const;

export const SEASONS = ["Spring", "Summer", "Fall", "Winter"] as const;

export type MealType = (typeof MEAL_TYPES)[number];
export type DietType = (typeof DIET_TYPES)[number];
export type Season = (typeof SEASONS)[number];
export type TagCategory = "meal_type" | "diet_type" | "season" | "ingredient" | "other";

function toSlug(category: string, label: string): string {
  return `${category}-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

export const SEED_TAGS = [
  ...MEAL_TYPES.map((label) => ({
    slug: toSlug("meal-type", label),
    label,
    category: "meal_type" as TagCategory,
  })),
  ...DIET_TYPES.map((label) => ({
    slug: toSlug("diet-type", label),
    label,
    category: "diet_type" as TagCategory,
  })),
  ...SEASONS.map((label) => ({
    slug: toSlug("season", label),
    label,
    category: "season" as TagCategory,
  })),
];
