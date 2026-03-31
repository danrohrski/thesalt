-- ============================================================
-- The Salt — initial schema
-- ============================================================

-- recipes ------------------------------------------------
CREATE TABLE recipes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text UNIQUE NOT NULL,
  title           text NOT NULL,
  source_url      text,
  highlight       text,
  writeup         text,
  tips            text,
  photo_primary   text,
  photo_secondary text,
  view_count      integer NOT NULL DEFAULT 0,
  published       boolean NOT NULL DEFAULT true,
  scraped_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_recipes_slug        ON recipes(slug);
CREATE INDEX idx_recipes_view_count  ON recipes(view_count DESC);
CREATE INDEX idx_recipes_created_at  ON recipes(created_at DESC);
CREATE INDEX idx_recipes_published   ON recipes(published);

-- auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- tags ---------------------------------------------------
CREATE TABLE tags (
  id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug     text UNIQUE NOT NULL,
  label    text NOT NULL,
  category text NOT NULL  -- 'meal_type' | 'diet_type' | 'season' | 'ingredient' | 'other'
);

CREATE INDEX idx_tags_category ON tags(category);
CREATE INDEX idx_tags_slug     ON tags(slug);

-- recipe_tags (join) -------------------------------------
CREATE TABLE recipe_tags (
  recipe_id uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  tag_id    uuid NOT NULL REFERENCES tags(id)    ON DELETE CASCADE,
  PRIMARY KEY (recipe_id, tag_id)
);

CREATE INDEX idx_recipe_tags_recipe_id ON recipe_tags(recipe_id);
CREATE INDEX idx_recipe_tags_tag_id    ON recipe_tags(tag_id);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE recipes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags        ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_tags ENABLE ROW LEVEL SECURITY;

-- Public: read published recipes only
CREATE POLICY "public read recipes"
  ON recipes FOR SELECT
  USING (published = true);

-- Admin: full access (authenticated = Ashley)
CREATE POLICY "admin all recipes"
  ON recipes
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Tags: fully public read, admin write
CREATE POLICY "public read tags"
  ON tags FOR SELECT
  USING (true);

CREATE POLICY "admin all tags"
  ON tags
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Recipe tags: public read, admin write
CREATE POLICY "public read recipe_tags"
  ON recipe_tags FOR SELECT
  USING (true);

CREATE POLICY "admin all recipe_tags"
  ON recipe_tags
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
