"use client";

import { useRef, useState } from "react";
import { getPhotoUrl } from "@/lib/storage/photos";

interface PhotoUploaderProps {
  recipeSlug: string;
  position: "primary" | "secondary";
  value: string | null;
  onChange: (path: string | null) => void;
}

export function PhotoUploader({
  recipeSlug,
  position,
  value,
  onChange,
}: PhotoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);

    const form = new FormData();
    form.append("file", file);
    form.append("slug", recipeSlug);
    form.append("position", position);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Upload failed");
      }
      const data = await res.json();
      onChange(data.path);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  const previewUrl = value ? getPhotoUrl(value) : null;

  return (
    <div className="flex flex-col gap-3">
      {previewUrl && (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Recipe photo preview"
            className="w-full max-w-xs object-cover"
            style={{ maxHeight: 200 }}
          />
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => cameraRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 text-sm font-[family-name:var(--font-display)] tracking-wide transition-opacity"
          style={{
            border: "1px solid #232120",
            color: "#232120",
            backgroundColor: "transparent",
            cursor: uploading ? "not-allowed" : "pointer",
            opacity: uploading ? 0.5 : 1,
          }}
        >
          Take photo
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 text-sm font-[family-name:var(--font-display)] tracking-wide transition-opacity"
          style={{
            border: "1px solid #232120",
            color: "#232120",
            backgroundColor: "transparent",
            cursor: uploading ? "not-allowed" : "pointer",
            opacity: uploading ? 0.5 : 1,
          }}
        >
          Upload file
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            disabled={uploading}
            className="px-4 py-2 text-sm font-[family-name:var(--font-display)] tracking-wide transition-opacity"
            style={{
              border: "1px solid rgba(196,98,45,0.5)",
              color: "#c4622d",
              backgroundColor: "transparent",
              cursor: uploading ? "not-allowed" : "pointer",
              opacity: uploading ? 0.5 : 1,
            }}
          >
            Remove
          </button>
        )}
      </div>

      {uploading && (
        <p
          className="text-sm font-[family-name:var(--font-display)] italic"
          style={{ color: "#232120", opacity: 0.6 }}
        >
          Uploading…
        </p>
      )}

      {error && (
        <p
          className="text-sm font-[family-name:var(--font-display)]"
          style={{ color: "#c4622d" }}
        >
          {error}
        </p>
      )}

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={handleInputChange}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleInputChange}
      />
    </div>
  );
}
