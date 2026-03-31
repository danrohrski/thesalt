-- Seed pre-defined tags for The Salt
-- Run after initial migration

INSERT INTO tags (slug, label, category) VALUES
  -- Meal types
  ('meal-type-breakfast',   'Breakfast',   'meal_type'),
  ('meal-type-lunch',       'Lunch',       'meal_type'),
  ('meal-type-dinner',      'Dinner',      'meal_type'),
  ('meal-type-side-dishes', 'Side Dishes', 'meal_type'),
  ('meal-type-appetizers',  'Appetizers',  'meal_type'),
  ('meal-type-snack',       'Snack',       'meal_type'),
  ('meal-type-dessert',     'Dessert',     'meal_type'),
  ('meal-type-drinks',      'Drinks',      'meal_type'),
  -- Diet types
  ('diet-type-vegetarian',    'Vegetarian',    'diet_type'),
  ('diet-type-vegan',         'Vegan',         'diet_type'),
  ('diet-type-gluten-free',   'Gluten-Free',   'diet_type'),
  ('diet-type-dairy-free',    'Dairy-Free',    'diet_type'),
  ('diet-type-grain-free',    'Grain-Free',    'diet_type'),
  ('diet-type-low-carb',      'Low-Carb',      'diet_type'),
  ('diet-type-nut-free',      'Nut-Free',      'diet_type'),
  ('diet-type-paleo-friendly','Paleo-Friendly', 'diet_type'),
  -- Seasons
  ('season-spring', 'Spring', 'season'),
  ('season-summer', 'Summer', 'season'),
  ('season-fall',   'Fall',   'season'),
  ('season-winter', 'Winter', 'season')
ON CONFLICT (slug) DO NOTHING;
