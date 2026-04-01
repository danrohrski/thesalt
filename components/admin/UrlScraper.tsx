"use client";

import { useState } from "react";
import type { ScrapedRecipe } from "@/types/scraper";

interface UrlScraperProps {
  onScraped: (data: ScrapedRecipe) => void;
}

export function UrlScraper({ onScraped }: UrlScraperProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleFetch() {
    if (!url.trim()) return;
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data: ScrapedRecipe = await res.json();
      onScraped(data);

      if (!data.scraped) {
        setMessage("Couldn't fetch all details — fill in manually.");
      }
    } catch {
      setMessage("Couldn't fetch all details — fill in manually.");
      onScraped({
        title: "",
        source_url: url.trim(),
        photo_url: null,
        ingredients: [],
        meal_types: [],
        diet_types: [],
        scraped: false,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <label
        className="text-xs tracking-widest uppercase font-[family-name:var(--font-display)]"
        style={{ color: "#232120", opacity: 0.5 }}
      >
        Import from URL
      </label>
      <div className="flex gap-3">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleFetch())}
          className="flex-1 px-4 py-3 text-base font-[family-name:var(--font-display)] bg-transparent outline-none"
          style={{ border: "1px solid rgba(35,33,32,0.3)", color: "#232120" }}
        />
        <button
          type="button"
          onClick={handleFetch}
          disabled={loading || !url.trim()}
          className="px-5 py-3 text-sm tracking-widest uppercase font-[family-name:var(--font-display)] transition-opacity whitespace-nowrap"
          style={{
            backgroundColor: "#232120",
            color: "#f2f0eb",
            border: "none",
            cursor: loading || !url.trim() ? "not-allowed" : "pointer",
            opacity: loading || !url.trim() ? 0.5 : 1,
          }}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span
                className="inline-block w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: "#f2f0eb", borderTopColor: "transparent" }}
              />
              Fetching…
            </span>
          ) : (
            "Fetch Recipe"
          )}
        </button>
      </div>
      {message && (
        <p
          className="text-sm font-[family-name:var(--font-display)] italic"
          style={{ color: "#c4622d" }}
        >
          {message}
        </p>
      )}
    </div>
  );
}
