@AGENTS.md

# The Salt — Project Brief

**Read `salt-brief.pdf` at the start of every session before writing any code.** It is the authoritative reference for design, features, and UX intent.

# Project Overview

The Salt is a personal recipe curation site for Ashley (Stitch & Salt brand). It is a Next.js App Router app backed by Supabase (Postgres + Storage).

## Design Tokens
- Background: `#f2f0eb` (parchment)
- Ink: `#232120`
- Accent: `#c4622d` (terracotta)
- Font: Cormorant Garamond (`var(--font-display)`)
- Status green (admin): `#4a7c59`

## Architecture Decisions
- Public pages are Server Components; interactive UI is `"use client"`
- Supabase clients: `server.ts` for RSC/actions, `browser.ts` for client components, `admin.ts` (service role) for view tracking
- RLS: public reads only `published = true` recipes; admin (authenticated) has full access
- `getPhotoUrl()` constructs storage URLs as plain strings — no Supabase client instantiated
- View tracking: POST `/api/recipes/[slug]/view` using admin client to bypass RLS; fires via `useEffect` in `RecipeDetailPanel`
- Slugs: generated with `slugify` trimmed at word boundary (max 80 chars); immutable after creation

## Public UI
- `/` — `RecipeBrowser`: split-panel layout (left list, right detail), search, filter chips, sort, hero row of 2 most recent
- `/recipes/[slug]` — standalone shareable recipe page (for external links/social)
- Detail panel: `RecipeDetailPanel` — secondary photo preferred as hero, related recipes, clickable tag filters, share + view tracking
- Share URLs include UTM params: `utm_source=thesalt&utm_medium=share&utm_campaign=recipe`
- `key={selected.id}` on `RecipeDetailPanel` forces remount (scroll reset) on recipe change

## Admin UI (`/admin`)
- Protected by Supabase Auth session
- Dashboard: list all recipes with status toggle (`StatusSelect`) and delete (`DeleteButton`)
- Edit/New: `RecipeForm` with scraper, photo uploader, tag selector
- Publish toggle uses a server action + `revalidatePath`
